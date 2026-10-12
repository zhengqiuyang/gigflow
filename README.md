# gigflow · Freelance Proposal→Invoice Copilot 💼
[![CI](https://github.com/zhengqiuyang/gigflow/actions/workflows/ci.yml/badge.svg)](https://github.com/zhengqiuyang/gigflow/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

> For independent contractors on Upwork/Toptal: capture the job post, draft a tailored proposal
> from your portfolio, generate the contract & milestone invoices after you win, and chase
> late payments politely. One agent across the whole gig lifecycle.
>
> 面向 Upwork 接单者的全流程副驾：抓职位 → 定制 proposal → 中标后合同/里程碑发票 → 催款。
> Wave 1 商业探针：4-6 周验证出海订阅付费意愿。

**状态：M0 文档就绪，待定稿 · [组合路线图](../portfolio-roadmap.md)**

## 现在就能跑

```bash
npm run demo    # 端到端：职位卡 → proposal 草稿 → 反套话 lint 闸门 → 合同 → 发票 → 催款模拟
npm test        # 19 个测试
```

## Chrome 扩展（capture 层）

`extension/` 目录，Chrome →「加载已解压的扩展程序」即可。打开任意 Upwork 职位页，点扩展图标：
标题/描述/预算/客户花费自动解析，红旗（unlimited revisions 之类）标红，一键复制职位卡 JSON。

**合规姿态**：只读你正在浏览的页面 DOM，无后台抓取、无跨页请求、无数据上传。
`extension/jobcard.js` 是 `src/jobcard.js` 的受控副本，CI 防漂移检查强制两者一致。

确定性核心（解析/lint/合同/催款节奏）零依赖可测；LLM 草稿在 Web 层替换 `draftProposal` 即可。

## 文档索引

| 文档 | 内容 | 状态 |
|---|---|---|
| [01-Positioning & Market](docs/01-positioning-and-market.md) | 用户、竞品、定价、分发 | 【提案】 |
| [02-Product Design](docs/02-product-design.md) | gig 生命周期四阶段产品闭环 | 【提案】 |
| [03-Tech Design](docs/03-tech-design.md) | agent 编排、抓取合规、评测 | 【提案】 |
| [04-Plan & Risks](docs/04-plan-and-risks.md) | 里程碑、kill 准则、风险 | 【提案】 |
