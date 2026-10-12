// popup：向 content script 要职位卡 → 用 jobcard 解析逻辑渲染 + 一键复制。
// jobcard.js 是 src/jobcard.js 的受控副本（同步检查见 test/extension.test.js）。
import { parseJobCard } from './jobcard.js';

const $ = (id) => document.getElementById(id);

async function main() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return showError('找不到当前标签页');

  chrome.tabs.sendMessage(tab.id, { type: 'capture' }, (res) => {
    if (chrome.runtime.lastError || !res?.ok) {
      return showError('这个页面不是 Upwork 职位页，或页面还没加载完。');
    }
    render(res.card);
  });
}

function render(card) {
  const parsed = parseJobCard(card.text, { id: `ext-${Date.now()}`, title: card.title });
  $('title').textContent = parsed.title;
  $('snippet').textContent = firstLines(card.text, 4);
  $('budget').textContent = budgetText(parsed);
  $('flags').innerHTML = parsed.redFlags.map((f) => `<span class="flag">${esc(f)}</span>`).join('');
  $('card').style.display = 'block';
  $('copyBtn').style.display = 'block';
  $('copyBtn').onclick = async () => {
    await navigator.clipboard.writeText(JSON.stringify({ ...parsed, sourceUrl: card.url }, null, 2));
    $('copyBtn').textContent = '已复制 ✓';
    $('copyBtn').classList.add('copied');
  };
}

function budgetText(parsed) {
  const b = parsed.budget;
  if (!b) return '未写预算';
  if (b.type === 'range') return `预算 $${b.min.toLocaleString()} - $${b.max.toLocaleString()}（${parsed.budgetPlausibility}）`;
  if (b.type === 'fixed') return `Fixed $${b.amount.toLocaleString()}（${parsed.budgetPlausibility}）`;
  return `$${b.rate}/hr（${parsed.budgetPlausibility}）`;
}

function firstLines(text, n) {
  return text.split('\n').filter(Boolean).slice(0, n).join(' · ');
}

function showError(msg) {
  $('status').textContent = msg;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

main();
