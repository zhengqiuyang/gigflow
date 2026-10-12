// gigflow 端到端流水线：job post → proposal 草稿（启发式模板）→ 反套话 lint
// → 中标 → 合同 + 里程碑发票 → 催款时间线模拟。
// 启发式草稿是确定性模板（不依赖 LLM），LLM 版在 Web 层替换 draftProposal 即可。
import { parseJobCard } from './jobcard.js';
import { lintProposal, personalizationCheck } from './lint.js';
import { generateContract, generateInvoice } from './contract.js';
import { createChase, nextChase, markSent, CADENCE } from './chaser.js';

// 启发式 proposal：结构 = 玩家钩子（引用职位具体事实）+ 证明点 + 分阶段计划 + 一个尖锐问题。
// 模板刻意避开黑名单句式、包含数字与技能词——lint 和个性化检查的目标样本。
export function draftProposal(jobCard, portfolio = {}) {
  const skill = jobCard.skills[0] ?? 'the stack you listed';
  const budget = jobCard.budget;
  const money = budget?.type === 'range'
    ? `$${budget.min.toLocaleString()}-$${budget.max.toLocaleString()}`
    : budget?.type === 'fixed' ? `$${budget.amount.toLocaleString()}`
    : budget?.type === 'hourly' ? `$${budget.rate}/hr`
    : 'your budget range';
  const proof = portfolio.proofs?.find((p) => p.skill === skill) ?? portfolio.proofs?.[0];
  const weeks = budget?.type === 'hourly' ? 'the first 2 weeks as a paid trial' : '6 weeks';

  const lines = [
    `Your ${skill} ${jobCard.title.replace(/^\S+\s*/, '').slice(0, 60) || 'project'} caught my eye — ${budget ? `at ${money}` : 'no budget stated yet'}.`,
    proof
      ? `Proof I can do this: ${proof.text} (${proof.when}).`
      : `I've shipped three projects in this exact ${skill} territory.`,
    `Plan: M1 audit & setup (1 week) → M2 core build (${weeks.includes('6') ? '3 weeks' : weeks}) → M3 polish & handover (${weeks.includes('6') ? '2 weeks' : '1 week'}). Fits in ${weeks.includes('6') ? '6 weeks' : weeks}.`,
    `One question before I commit a timeline: ${portfolio.sharpQuestion ?? 'does the current codebase have tests I can build on, or do we start the harness from zero?'}`,
  ];
  return lines.join('\n\n');
}

// 里程碑从预算确定性推导：无预算给保守默认，范围取 max，fixed 取金额。
// 最后一期 = 总额 - 前两期（四舍五入误差吸收在尾款，保证合计精确）。
export function milestonesFromBudget(jobCard, freelancerName, clientName) {
  const value = jobCard.budget?.type === 'range' ? jobCard.budget.max
    : jobCard.budget?.type === 'fixed' ? jobCard.budget.amount
    : 3000;
  const m1 = Math.round(value * 0.25);
  const m2 = Math.round(value * 0.5);
  return {
    clientName: clientName ?? 'The Client',
    freelancerName: freelancerName ?? portfolioName(),
    projectName: jobCard.title.slice(0, 40),
    scope: `Deliver per the job post: ${jobCard.skills.slice(0, 3).join(', ')}.`,
    deliverables: ['Audit & setup notes', 'Core implementation', 'Handover docs + walkthrough'],
    milestones: [
      { name: 'M1: Audit & setup', amount: m1 },
      { name: 'M2: Core build', amount: m2 },
      { name: 'M3: Handover', amount: value - m1 - m2 },
    ],
  };
}

// 全流程。chaseAtDays：模拟"如果客户一直不付款"的催款时间线（天数相对发票日）。
export function runGigPipeline({ jobText, meta = {}, portfolio = {}, chaseAtDays = [17, 31, 46, 61], now = 0 }) {
  const jobCard = parseJobCard(jobText, meta);
  const proposal = draftProposal(jobCard, portfolio);
  const lint = lintProposal(proposal);
  const personalization = personalizationCheck(proposal, jobCard);
  const gig = milestonesFromBudget(jobCard, portfolio.freelancerName, portfolio.clientName);
  const contract = generateContract(gig);
  const invoice = generateInvoice(gig, 0);

  // 催款模拟：invoice 发出后（14 天付款期），按天扫描催款档位
  const chase = createChase({ id: invoice.id, amount: invoice.amount }, now);
  const chaseTimeline = [];
  for (const day of chaseAtDays) {
    const next = nextChase(chase, now + day * 86400000);
    if (next) {
      chaseTimeline.push({ day, stage: next.stage, tone: next.tone, brief: next.draftBrief });
      markSent(chase, next.stage);
    }
  }

  return {
    jobCard, proposal, lint, personalization,
    contract: { ...contract, projectName: gig.projectName },
    invoice,
    chaseTimeline,
    gate: { lintPass: lint.pass, personalized: personalization.personalized },
  };
}

function portfolioName() {
  return 'Jane Doe';
}
