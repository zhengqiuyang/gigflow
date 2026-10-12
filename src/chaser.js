// 催款状态机：deterministic cadence——day3 提醒 → day7 友好 → day14 坚决（引滞纳金条款）→ day30 最后通牒。
// 只生成草稿，永不自动发送；发送必须人工批准（03 技术方案的安全设计）。
export const CADENCE = [
  { stage: 'nudge', afterDays: 3, tone: 'polite', reference: null },
  { stage: 'friendly', afterDays: 7, tone: 'warm', reference: null },
  { stage: 'firm', afterDays: 14, tone: 'firm', reference: 'late-fee clause' },
  { stage: 'final', afterDays: 30, tone: 'final', reference: 'late-fee clause + termination review' },
];

export function createChase(invoice, now = Date.now()) {
  if (!invoice?.id || !(invoice.amount > 0)) throw new Error('催款对象必须是有效发票');
  return { invoiceId: invoice.id, amount: invoice.amount, issuedAt: now, sentStages: [], paidAt: null };
}

// 到期未付的下一封催款（当天该发哪封、 tone 是什么）；已付返回 null。
// 档位单调递进：一旦发过更激进的档，跳过的温和档视为已覆盖，不再补发。
export function nextChase(chase, now = Date.now()) {
  if (chase.paidAt) return null;
  const daysLate = Math.floor((now - chase.issuedAt) / 86400000) - 14; // 14 天付款期后算逾期
  const sentIdx = CADENCE.map((c, i) => (chase.sentStages.includes(c.stage) ? i : -1));
  const maxSentIdx = Math.max(-1, ...sentIdx);
  const due = CADENCE.filter(
    (c, i) => c.afterDays <= daysLate && i > maxSentIdx
  );
  if (due.length === 0) return null;
  const next = due[due.length - 1]; // 到期档中最激进的一档
  return {
    stage: next.stage,
    tone: next.tone,
    reference: next.reference,
    daysLate,
    // 草稿内容由 LLM 生成；这里只给确定性骨架
    draftBrief: buildBrief(chase, next, daysLate),
  };
}

export function markSent(chase, stage) {
  if (!CADENCE.some((c) => c.stage === stage)) throw new Error(`未知催款阶段: ${stage}`);
  if (!chase.sentStages.includes(stage)) chase.sentStages.push(stage);
  return chase;
}

export function markPaid(chase, now = Date.now()) {
  chase.paidAt = now;
  return chase;
}

function buildBrief(chase, stage, daysLate) {
  const base = `Invoice ${chase.invoiceId} ($${chase.amount.toFixed(2)}) is ${Math.max(0, daysLate)} days past due.`;
  const byTone = {
    polite: `${base} Gentle reminder — in case it slipped through the cracks.`,
    warm: `${base} Second reminder. Could you confirm expected payment date?`,
    firm: `${base} Per our agreement's late-payment clause, late fees now apply. Please arrange payment this week.`,
    final: `${base} Final notice. If payment is not received within 7 days, we must pause work and review the engagement per the termination clause.`,
  };
  return byTone[stage.tone];
}
