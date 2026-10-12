// Job card 解析：从职位帖文本抽取结构化卡片（预算真实度启发式/技能/红旗）。
// 确定性解析——LLM 只负责它擅长的语义增强，规则先行。
const BUDGET_PATTERNS = [
  // "$3,000-$5,000" / "$500" / "3k-5k USD"
  { re: /\$\s*([\d,]+)\s*[-–—to]+\s*\$?\s*([\d,]+)/i, kind: 'range' },
  { re: /\$\s*([\d,]+)(?:\s*(?:fixed|usd|budget))?/i, kind: 'fixed' },
  { re: /(\d+)\s*[-–—]\s*(\d+)\s*k\b/i, kind: 'k-range' },
  { re: /(\d+(?:\.\d+)?)\s*\/\s*hr/i, kind: 'hourly' },
];

const RED_FLAGS = [
  { re: /unlimited revisions/i, why: 'Unlimited revisions = scope trap' },
  { re: /low budget|tight budget|student|cheap/i, why: 'Budget pressure signals' },
  { re: /work now|urgent|asap/i, why: 'Urgency may indicate churned-through freelancers' },
  { re: /no upfront|payment (?:on|after) deliver|milestone after/i, why: 'Payment-back-loaded risk' },
  { re: /\btest task\b|free sample/i, why: 'Free-work request' },
];

const SKILLS = [
  'react', 'next.js', 'node', 'typescript', 'python', 'django', 'rails', 'vue',
  'figma', 'ui design', 'branding', 'logo', 'webflow', 'shopify', 'wordpress',
  'react native', 'flutter', 'swift', 'data scraping', 'automation', 'ai', 'llm',
];

export function parseJobCard(text, meta = {}) {
  const lower = String(text).toLowerCase();
  const budget = parseBudget(text);
  return {
    id: meta.id ?? `job-${Date.now()}`,
    title: meta.title ?? firstLine(text),
    rawLength: text.length,
    budget,
    // 预算真实度启发式：给得起范围>只说fixed小数目；没写预算=待验证
    budgetPlausibility: plausibility(budget, text),
    skills: SKILLS.filter((s) => lower.includes(s)),
    redFlags: RED_FLAGS.filter((f) => f.re.test(text)).map((f) => f.why),
    detailScore: detailScore(text),
  };
}

function parseBudget(text) {
  for (const p of BUDGET_PATTERNS) {
    const m = text.match(p.re);
    if (!m) continue;
    if (p.kind === 'range') return { type: 'range', min: num(m[1]), max: num(m[2]) };
    if (p.kind === 'k-range') return { type: 'range', min: num(m[1]) * 1000, max: num(m[2]) * 1000 };
    if (p.kind === 'fixed') return { type: 'fixed', amount: num(m[1]) };
    if (p.kind === 'hourly') return { type: 'hourly', rate: num(m[1]) };
  }
  return null;
}

function plausibility(budget, text) {
  if (!budget) return 'unstated';
  if (budget.type === 'range') {
    return budget.min > 0 && budget.max >= budget.min ? 'plausible' : 'suspicious';
  }
  if (budget.type === 'fixed') return budget.amount >= 500 ? 'plausible' : 'lowball';
  if (budget.type === 'hourly') return budget.rate >= 25 ? 'plausible' : 'lowball';
  return 'unknown';
}

function detailScore(text) {
  // 帖子详实度 0-100：长度 + 是否有交付物/时间线关键词
  let s = Math.min(60, Math.floor(text.length / 8));
  if (/deliverable|scope|requirement/i.test(text)) s += 20;
  if (/timeline|deadline|weeks?|months?/i.test(text)) s += 20;
  return Math.min(100, s);
}

function num(s) {
  return Number(String(s).replace(/,/g, ''));
}

function firstLine(text) {
  return String(text).split('\n').map((l) => l.trim()).find(Boolean)?.slice(0, 80) ?? 'Untitled gig';
}
