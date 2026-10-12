// 反套话 lint：AI proposal 最大的失败模式是"千人一面的 AI 腔"。
// 这是确定性硬门（黑名单+结构检查），发生在 LLM 输出之后、给用户看之前——
// 一个不让 LLM 给自己判卷的地方。
const BANNED_PHRASES = [
  'i am the perfect fit', 'i am confident that', 'look no further',
  'i will be the best', 'seasoned professional', 'expert in all aspects',
  'i can start immediately and', '100% satisfaction', 'unlimited revisions',
  'why choose me', 'i have carefully read your job post',
  'i am writing to express my interest', 'hoping to hear from you soon',
  'i am the ideal candidate', 'with my wealth of experience',
  '我是最合适的人选', '我是完美的人选', '希望尽快收到您的回复', '为什么选择我',
];

const STRUCTURE_RULES = [
  { id: 'has-question', test: (t) => /\?/.test(t), hint: 'Proposal should end with (or contain) one sharp question to the client' },
  { id: 'not-too-generic', test: (t) => !(t.toLowerCase().includes('your project') && !/\$\d|\d+\s*(days?|weeks?)/i.test(t)), hint: 'Mentions "your project" without any concrete number — reads generic' },
  { id: 'reasonable-length', test: (t) => t.length >= 300 && t.length <= 2500, hint: 'Length should be 300-2500 chars (short = lazy, long = nobody reads)' },
];

export function lintProposal(text) {
  const lower = text.toLowerCase();
  const bannedHits = BANNED_PHRASES.filter((p) => lower.includes(p));
  const structureFails = STRUCTURE_RULES.filter((r) => !r.test(text)).map((r) => r.hint);
  const score = Math.max(0, 100 - bannedHits.length * 25 - structureFails.length * 15);
  return {
    pass: bannedHits.length === 0 && structureFails.length <= 1,
    score,
    bannedHits,
    structureFails,
  };
}

// 生成"个性化证据"检查：proposal 是否引用了 job card 里的具体事实
// （预算数字/技能词/交付物）——泛泛而谈在这里现形。
export function personalizationCheck(text, jobCard) {
  const lower = text.toLowerCase();
  const evidence = [];
  if (jobCard.budget?.type === 'range' && lower.includes(String(jobCard.budget.min))) {
    evidence.push('references budget number');
  }
  for (const s of jobCard.skills.slice(0, 5)) {
    if (lower.includes(s)) { evidence.push(`mentions skill: ${s}`); break; }
  }
  if (/\b(\d+)\s*(days?|weeks?)/i.test(text)) evidence.push('contains concrete timeline');
  return { personalized: evidence.length >= 2, evidence };
}
