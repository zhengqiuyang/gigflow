import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractJobPage } from '../extension/parse-upwork.js';
import { parseJobCard } from '../extension/jobcard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(path.join(__dirname, '../extension/fixtures/upwork-job.html'), 'utf-8');

test('DOM 解析：从 Upwork 页面结构提取标题/描述/预算/客户信息', () => {
  const page = extractJobPage(fixture);
  assert.equal(page.title, 'React dashboard rebuild');
  assert.ok(page.text.includes('React + TypeScript dashboard'));
  assert.ok(page.text.includes('$3,000-$5,000'));
  assert.ok(page.text.includes('12k+ total spent'));
});

test('端到端：页面 → 职位卡（预算/技能/红旗齐活）', () => {
  const page = extractJobPage(fixture);
  const card = parseJobCard(page.text, { title: page.title });
  assert.deepEqual(card.budget, { type: 'range', min: 3000, max: 5000 });
  assert.equal(card.budgetPlausibility, 'plausible');
  assert.ok(card.skills.includes('react'));
  assert.ok(card.redFlags.some((r) => r.includes('Unlimited revisions')));
});

test('非 Upwork 页面：优雅降级不抛错', () => {
  const page = extractJobPage('<html><body><h1>随便一个页面</h1><p>没有职位信息</p></body></html>');
  assert.ok(page.text.length > 0);
  const card = parseJobCard(page.text, { title: page.title });
  assert.equal(card.budgetPlausibility, 'unstated');
});

// 防漂移：extension/jobcard.js 是 src/jobcard.js 的受控副本，两者必须完全一致
test('同步检查：extension/jobcard.js 与 src/jobcard.js 一致', () => {
  const ext = readFileSync(path.join(__dirname, '../extension/jobcard.js'), 'utf-8');
  const src = readFileSync(path.join(__dirname, '../src/jobcard.js'), 'utf-8');
  assert.equal(ext, src, 'extension/jobcard.js 与 src/jobcard.js 漂移了——请重新复制并检查');
});
