// content script：只读当前页 DOM，提取职位卡。不发请求、不存储、不上传。
import { extractJobPage } from './parse-upwork.js';

let lastCard = null;

function capture() {
  const html = document.documentElement.outerHTML;
  const card = extractJobPage(html);
  card.url = location.href;
  lastCard = card;
  return card;
}

// 打开 popup 时响应一次抓取
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'capture') {
    sendResponse({ ok: true, card: capture() });
  }
  return true;
});

// 页面加载后先抓一次（SPA 路由变化时 MutationObserver 兜底重抓）
capture();
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(capture, 500); // SPA 渲染需要一点时间
  }
}).observe(document.body, { childList: true, subtree: true });
