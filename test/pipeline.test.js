import test from 'node:test';
import assert from 'node:assert/strict';
import { runGigPipeline, draftProposal, milestonesFromBudget } from '../src/pipeline.js';
import { parseJobCard } from '../src/jobcard.js';

const JOB = `React dashboard rebuild
Need a React + TypeScript dashboard migrated from legacy jQuery.
Budget: $3,000-$5,000. Timeline: 6 weeks. Deliverables incl. source + docs.`;

const PORTFOLIO = {
  freelancerName: 'Jane Doe', clientName: 'Acme Analytics',
  proofs: [{ skill: 'react', when: 'last quarter', text: 'migrated a logistics client off jQuery to React 18, bundle -40%' }],
};

test('端到端：草稿过 lint、个性化达标、合同与发票闭环、催款递进', () => {
  const out = runGigPipeline({ jobText: JOB, portfolio: PORTFOLIO, meta: { title: 'React dashboard rebuild' } });

  assert.equal(out.gate.lintPass, true, `lint 未过: ${JSON.stringify(out.lint)}`);
  assert.equal(out.gate.personalized, true, `个性化不达标: ${JSON.stringify(out.personalization)}`);

  assert.equal(out.contract.total, 5000); // range 取 max，25/50/25
  assert.match(out.contract.text, /IP|INTELLECTUAL/i);
  assert.equal(out.invoice.amount, 1250);
  assert.match(out.invoice.id, /^INV-[\w-]+-M1$/); // slug 有 20 字符截断，形态对即可

  // 催款时间线：跳档单调递进（nudge→firm→final），间隔合理
  const stages = out.chaseTimeline.map((c) => c.stage);
  assert.ok(stages.length >= 2, `催款档位不足: ${stages}`);
  const order = ['nudge', 'friendly', 'firm', 'final'];
  let last = -1;
  for (const s of stages) {
    const idx = order.indexOf(s);
    assert.ok(idx > last, `催款档位非递进: ${stages}`);
    last = idx;
  }
  assert.ok(out.chaseTimeline.every((c) => c.brief.length > 10));
});

test('无预算职位：默认保守金额，流程不崩', () => {
  const out = runGigPipeline({ jobText: 'Need help with a Shopify store revamp, details on call.', portfolio: {} });
  assert.equal(out.contract.total, 3000);
  assert.equal(out.gate.lintPass, true);
});

test('草稿模板：含问题、含具体数字、不含 AI 腔', () => {
  const card = parseJobCard(JOB, { title: 'React dashboard rebuild' });
  const draft = draftProposal(card, PORTFOLIO);
  assert.match(draft, /\?/);
  assert.match(draft, /\$5,000|\$3,000/);
  assert.match(draft, /react/i);
  assert.ok(!/perfect fit|look no further/i.test(draft));
});

test('里程碑推导：fixed 预算取金额', () => {
  const card = parseJobCard('Quick logo fix, $50 fixed', { title: 'Logo fix' });
  const gig = milestonesFromBudget(card, 'A', 'B');
  assert.equal(gig.milestones.reduce((a, m) => a + m.amount, 0), 50);
});
