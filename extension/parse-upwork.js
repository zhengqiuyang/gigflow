// Upwork 职位页 DOM → 职位卡。纯字符串/正则处理，Node 与浏览器同构可测。
// 合规姿态：只解析用户正在浏览的页面内容（content script 注入本文件调用），
// 无后台抓取、无跨页请求、不上传——README 明示。
export function extractJobPage(html) {
  const title = matchFirst(html, [
    /<h1[^>]*>([\s\S]*?)<\/h1>/,
    /<title[^>]*>([\s\S]*?)<\/title>/,
  ]) ?? 'Untitled gig';

  const description = matchAttr(html, 'job-description') || matchFirst(html, [
    /<div[^>]*data-test[^>]*job-description[^>]*>([\s\S]*?)<\/div>/,
    /<section[^>]*>([\s\S]{200,4000}?)<\/section>/,
  ]) || '';

  const budgetLine = matchFirst(html, [
    /(?:Budget|预算)\s*[:：]?\s*([^<>\n]{2,40})/i,
    /\$[\d,]+(?:\.\d+)?\s*(?:[-–—to]+\s*\$?[\d,]+)?(?:\s*\/\s*hr)?/i,
  ]) || '';

  const clientInfo = matchFirst(html, [
    /(\$[\d,]+\+\s*total spent)/i,
    /(\d+(?:\.\d+)?\s*(?:k\+?)?\s*(?:total )?spent)/i,
    /Payment verified/i,
  ]) || '';

  const text = `${stripTags(title)}\n\n${stripTags(description)}\nBudget: ${stripTags(budgetLine)}${clientInfo ? `\nClient: ${stripTags(clientInfo)}` : ''}`;
  return { title: stripTags(title).trim(), text: text.replace(/\n{3,}/g, '\n\n').trim(), url: '' };
}

function matchFirst(html, patterns) {
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1] ?? m[0];
  }
  return null;
}

// Upwork 常见的 data-test 属性容器（class 名会变，data-test 相对稳定）。
// 捕获跨越内部标签直到容器闭合 </div>（描述里会有多个 <p>）。
function matchAttr(html, name) {
  const m = html.match(new RegExp(`data-test[^>]*${name}[^>]*>([\\s\\S]*?)<\\/div>`, 'i'));
  return m ? m[1] : null;
}

function stripTags(s) {
  return String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
