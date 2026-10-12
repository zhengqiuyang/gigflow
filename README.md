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
npm test        # 15 个测试
```

确定性核心（解析/lint/合同/催款节奏）零依赖可测；LLM 草稿在 Web 层替换 `draftProposal` 即可。

## 文档索引

| 文档 | 内容 | 状态 |
|---|---|---|
| [01-Positioning & Market](docs/01-positioning-and-market.md) | 用户、竞品、定价、分发 | 【提案】 |
| [02-Product Design](docs/02-product-design.md) | gig 生命周期四阶段产品闭环 | 【提案】 |
| [03-Tech Design](docs/03-tech-design.md) | agent 编排、抓取合规、评测 | 【提案】 |
| [04-Plan & Risks](docs/04-plan-and-risks.md) | 里程碑、kill 准则、风险 | 【提案】 |
