# 04 · Plan & Risks 【提案】

## Milestones (Wave 1, 6 weeks, after Wave 0)

| Week | Deliverable | Acceptance |
|---|---|---|
| W1 | Extension capture (job card) + web shell (saas-starter) | Job card from any Upwork page, one click |
| W2 | Portfolio memory + tailored proposal + anti-boilerplate lint | golden-30 rubric ≥4/5 mean; lint 0 escapes |
| W3 | Contract + invoice + milestone generation | Contract eval 20/20 checklist pass |
| W4 | Chaser agent + cash-flow dashboard | 12/12 escalation scenarios correct |
| W5 | Payments live (LemonSqueezy) + PH launch prep; private beta with 10 freelancers | 10 users, ≥2 real applications each |
| W6 | Public v0.1 + Product Hunt + r/Upwork help-first posts | Live URL, kill-clock starts |

## Risk register

| Risk | P | Impact | Mitigation |
|---|---|---|---|
| Upwork ToS friction re: extension | M | H | Read-only client-side capture; no automation of submission; public compliance doc |
| "AI proposal" market fatigue ("another one?") | H | M | Lead messaging with the LOOP (contracts/chasing), not generation; anti-boilerplate as visible feature |
| Freelancer churn (win job → leave) | H | M | Monthly-usable pricing, capture digest as habit loop; annual discount |
| Chrome Web Store review delay | M | M | Submit W1 (long pole); paste-URL fallback ships regardless |
| Payment region issues | L | M | LemonSqueezy merchant-of-record (doodle-story lesson) |
| Cold-start portfolio memory onboarding | M | M | 3-sample import wizard + one winning proposal → profile in <10 min |

## Kill criteria (execution detail)

- Freeze triggers as in 01; on freeze: postmortem (EN+CN), the extension + capture layer
  may be salvaged into any future B2B tooling; eval corpora (golden-30) remain a
  reusable asset in the eval-spec family.

## Resume narrative (pre-written, backfill numbers later)

- "Shipped a closed-loop freelance copilot (Chrome MV3 + agent runtime + subscription billing)
  to N users / $M MRR in 6 weeks solo";
- Keywords: browser extension engineering, single-loop agent with typed tools,
  deterministic output gating (anti-boilerplate lint), per-user structured memory,
  eval-driven prompt iteration, merchant-of-record global billing.
