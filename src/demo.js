// gigflow 端到端演示：一条命令跑完 接单→中标→收钱(模拟) 全生命周期。
import { runGigPipeline } from './pipeline.js';

const JOB_TEXT = `React dashboard rebuild
Need a React + TypeScript dashboard migrated from a legacy jQuery codebase.
Scope: 6 screens, chart library of your choice, source + docs deliverable.
Budget: $3,000-$5,000. Timeline: 6 weeks.
Serious inquiries only — we've been burned by flaky freelancers before.`;

const PORTFOLIO = {
  freelancerName: 'Jane Doe',
  clientName: 'Acme Analytics',
  proofs: [
    { skill: 'react', when: 'last quarter', text: 'migrated a logistics client off jQuery to React 18 and cut their bundle 40%' },
  ],
};

const out = runGigPipeline({ jobText: JOB_TEXT, portfolio: PORTFOLIO, meta: { title: 'React dashboard rebuild' } });

console.log('═══ ① 职位卡 ═══');
console.log('预算:', out.jobCard.budget, '| 真实度:', out.jobCard.budgetPlausibility);
console.log('技能:', out.jobCard.skills.join(', '));
console.log('红旗:', out.jobCard.redFlags.length ? out.jobCard.redFlags.join('；') : '无');

console.log('\n═══ ② Proposal 草稿 ═══');
console.log(out.proposal);

console.log('\n═══ ③ 质量闸门 ═══');
console.log('反套话 lint:', out.lint.pass ? '通过' : '未通过', `(score ${out.lint.score})`);
if (out.lint.bannedHits.length) console.log('  命中黑名单:', out.lint.bannedHits);
console.log('个性化证据:', out.personalization.evidence.join(' | '), '→', out.personalization.personalized ? '达标' : '不达标');

console.log('\n═══ ④ 合同（节选） ═══');
console.log(out.contract.text.split('\n').slice(0, 6).join('\n'), '\n...  共', out.contract.milestoneCount, '个里程碑，总额 $' + out.contract.total);

console.log('\n═══ ⑤ 首张发票 ═══');
console.log(out.invoice.id, '- $' + out.invoice.amount);

console.log('\n═══ ⑥ 如果客户一直不付款（催款模拟） ═══');
for (const c of out.chaseTimeline) {
  console.log(`第 ${c.day} 天 [${c.stage}] ${c.brief}`);
}
if (out.chaseTimeline.length === 0) console.log('（本单按时付款，无需催款）');
