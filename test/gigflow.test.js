import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJobCard } from '../src/jobcard.js';
import { lintProposal, personalizationCheck } from '../src/lint.js';
import { generateContract, generateInvoice } from '../src/contract.js';
import { createChase, nextChase, markSent, markPaid } from '../src/chaser.js';

const DAY = 86400000;

// ---- jobcard ----
test('jobcard：范围预算 + 技能 + 红旗', () => {
  const card = parseJobCard(
    `React dashboard rebuild\nNeed a React + TypeScript dashboard migrated from legacy jQuery.\nBudget: $3,000-$5,000. Timeline: 6 weeks.\nDeliverables incl. source + docs.\nUnlimited revisions until happy. Urgent!`,
  );
  assert.deepEqual(card.budget, { type: 'range', min: 3000, max: 5000 });
  assert.equal(card.budgetPlausibility, 'plausible');
  assert.ok(card.skills.includes('react'));
  assert.ok(card.skills.includes('typescript'));
  assert.ok(card.redFlags.some((r) => r.includes('Unlimited revisions')));
  assert.ok(card.detailScore >= 60);
});

test('jobcard：低价 fixed 标记 lowball', () => {
  const card = parseJobCard('Quick logo fix, $50 fixed');
  assert.equal(card.budget.type, 'fixed');
  assert.equal(card.budgetPlausibility, 'lowball');
});

test('jobcard：没提预算 → unstated', () => {
  const card = parseJobCard('Need help with a Shopify store revamp, details on call.');
  assert.equal(card.budgetPlausibility, 'unstated');
});

// ---- lint ----
test('lint：AI 腔命中黑名单不通过', () => {
  const r = lintProposal('Hi! I am the perfect fit for your project. Why choose me? I am confident that I deliver 100% satisfaction.');
  assert.equal(r.pass, false);
  assert.ok(r.bannedHits.length >= 3);
  assert.ok(r.score < 40);
});

test('lint：具体的提案通过', () => {
  const ok = lintProposal(
    'Your jQuery-to-React migration caught my eye — I shipped the same move for a logistics client last quarter and cut their bundle by 40%. ' +
    'For your $3,000-$5,000 range: M1 audit + component map (1 week), M2 core screens rebuild (3 weeks), M3 docs + handover (1 week) fits in 6 weeks. ' +
    'One question: does the legacy app have integration tests I can port, or are we building the harness from scratch? Happy to walk through my similar projects on a call.'
  );
  assert.equal(ok.pass, true);
});

test('个性化检查：引用具体数字/技能才算 personal', () => {
  const card = parseJobCard('React dashboard, $3,000-$5,000, 6 weeks');
  const generic = personalizationCheck('I can build great dashboards for your project.', card);
  const specific = personalizationCheck('Your react migration at $3,000-$5,000 fits 6 weeks.', card);
  assert.equal(generic.personalized, false);
  assert.equal(specific.personalized, true);
});

// ---- contract ----
const gig = () => ({
  clientName: 'Acme Corp', freelancerName: 'Jane Doe', projectName: 'React Dashboard Rebuild',
  scope: 'Migrate legacy jQuery dashboard to React 18 + TypeScript.',
  deliverables: ['Component library', 'Migrated screens', 'Handover docs'],
  milestones: [
    { name: 'Audit + component map', amount: 1200 },
    { name: 'Core screens rebuild', amount: 2400 },
    { name: 'Docs + handover', amount: 600 },
  ],
});

test('合同：里程碑合计与条款完整', () => {
  const c = generateContract(gig());
  assert.equal(c.total, 4200);
  assert.equal(c.milestoneCount, 3);
  assert.match(c.text, /REVISIONS.*capped at 2/);
  assert.match(c.text, /LATE PAYMENT/);
  assert.match(c.text, /transfer to Client upon full payment/);
});

test('合同：缺输入报错', () => {
  assert.throws(() => generateContract({ ...gig(), milestones: [] }));
  assert.throws(() => generateContract({ ...gig(), clientName: '' }));
});

test('发票：幂等编号稳定', () => {
  const c = gig();
  const inv1 = generateInvoice(c, 0);
  const inv2 = generateInvoice(c, 0);
  assert.equal(inv1.id, inv2.id);
  assert.equal(inv1.amount, 1200);
  assert.throws(() => generateInvoice(c, 9));
});

// ---- chaser ----
test('催款节奏：day3 提醒 → day14 坚决 → 已付停止', () => {
  const t0 = 0;
  const chase = createChase({ id: 'INV-X-M1', amount: 1200 }, t0);
  // issuedAt + 3 + 14 天 = day17 → nudge(3) 到期
  let next = nextChase(chase, t0 + 17 * DAY);
  assert.equal(next.stage, 'nudge');
  markSent(chase, 'nudge');
  // day30（逾期 16 天）→ friendly(7) 与 firm(14) 都到期，取更激进的 firm
  next = nextChase(chase, t0 + 30 * DAY);
  assert.equal(next.stage, 'firm');
  assert.match(next.draftBrief, /late fees now apply/);
  markSent(chase, 'firm');
  // day45（逾期 31 天）→ firm 与 final 都到期，取 final
  next = nextChase(chase, t0 + 45 * DAY);
  assert.equal(next.stage, 'final');
  assert.match(next.draftBrief, /Final notice/);
  markSent(chase, 'final');
  assert.equal(nextChase(chase, t0 + 60 * DAY), null); // 全部发完
  markPaid(chase, t0 + 61 * DAY);
  assert.equal(nextChase(chase, t0 + 90 * DAY), null); // 已付永不再催
});

test('催款：未知阶段与无效发票报错', () => {
  assert.throws(() => createChase({ id: 'x' }));
  const chase = createChase({ id: 'i', amount: 5 });
  assert.throws(() => markSent(chase, 'yell'));
});
