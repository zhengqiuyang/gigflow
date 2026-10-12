// 中标后的合同 + 里程碑生成：确定性模板渲染，不出幻觉——
// 法律文本的关键条款必须来自结构化输入，而不是模型自由发挥。
export function generateContract(gig) {
  assertGig(gig);
  const { clientName, freelancerName, projectName, scope, deliverables, revisions = 2, milestones, ipOnPayment = true, lateFeePct = 1.5 } = gig;
  const total = milestones.reduce((acc, m) => acc + m.amount, 0);

  const lines = [];
  lines.push(`CONSULTING AGREEMENT — ${projectName}`);
  lines.push(`Between ${clientName} ("Client") and ${freelancerName} ("Contractor")`);
  lines.push(`Date: ${gig.date ?? new Date().toISOString().slice(0, 10)}`);
  lines.push('');
  lines.push('1. SCOPE OF WORK');
  lines.push(`   ${scope}`);
  lines.push('   Deliverables:');
  deliverables.forEach((d, i) => lines.push(`   ${i + 1}. ${d}`));
  lines.push('');
  lines.push(`2. REVISIONS: Included revisions capped at ${revisions} per deliverable. Additional revisions billed at the hourly rate.`);
  lines.push('');
  lines.push('3. MILESTONES & PAYMENT');
  milestones.forEach((m, i) => lines.push(
    `   M${i + 1}: ${m.name} — $${m.amount.toFixed(2)} due on delivery${m.dueDate ? ` (expected ${m.dueDate})` : ''}.`
  ));
  lines.push(`   Total engagement value: $${total.toFixed(2)}.`);
  lines.push('');
  lines.push(`4. LATE PAYMENT: Invoices unpaid after 14 days accrue ${lateFeePct}% per month on the outstanding balance.`);
  lines.push('');
  lines.push(`5. INTELLECTUAL PROPERTY: ${ipOnPayment ? 'All deliverables transfer to Client upon full payment. Until then, Contractor retains ownership.' : 'IP terms to be negotiated separately.'}`);
  lines.push('');
  lines.push('6. TERMINATION: Either party may terminate with 7 days written notice; Client pays for work completed to date.');
  lines.push('');
  lines.push('7. This agreement is governed by the parties\' mutual good faith; disputes first go to good-faith negotiation.');

  return { text: lines.join('\n'), total, milestoneCount: milestones.length };
}

// 里程碑发票：从合同数据确定性生成，带幂等编号
export function generateInvoice(contract, milestoneIndex) {
  const m = contract.milestones[milestoneIndex];
  if (!m) throw new Error(`milestone ${milestoneIndex} 不存在`);
  const id = `INV-${slug(contract.projectName)}-M${milestoneIndex + 1}`;
  const lines = [
    `INVOICE ${id}`,
    `To: ${contract.clientName}`,
    `Project: ${contract.projectName}`,
    `Milestone: ${m.name}`,
    `Amount due: $${m.amount.toFixed(2)}`,
    `Due date: ${addDays(m.issuedAt ?? Date.now(), 14)}`,
    '',
    'Payment methods per agreement. Thank you!',
  ];
  return { id, text: lines.join('\n'), amount: m.amount };
}

function assertGig(gig) {
  for (const k of ['clientName', 'freelancerName', 'projectName', 'scope', 'deliverables', 'milestones']) {
    if (!gig[k] || (Array.isArray(gig[k]) && gig[k].length === 0)) {
      throw new Error(`合同输入缺少: ${k}`);
    }
  }
  for (const m of gig.milestones) {
    if (!(m.amount > 0)) throw new Error('里程碑金额必须为正');
    if (!m.name) throw new Error('里程碑缺名称');
  }
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'proj';
}
function addDays(ts, days) {
  return new Date(ts + days * 86400000).toISOString().slice(0, 10);
}
