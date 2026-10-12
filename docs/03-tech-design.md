# 03 · Tech Design 【提案】

## Architecture

```
Chrome extension ──(job card JSON)──► Web app (Next.js/Astro + TS)
                                        │
                                        ├── Agent runtime (single-loop, tool-calling):
                                        │     tools: parse_job, recall_portfolio,
                                        │             draft_proposal, lint_proposal,
                                        │             gen_contract, gen_invoice,
                                        │             draft_chase_email
                                        │
                                        ├── Supabase/Postgres (users, gigs, outcomes)
                                        └── LemonSqueezy (subscriptions — doodle-story
                                            overseas-payment experience re-applied)
```

Single-loop agent (not multi-agent theater): the lifecycle is sequential per gig;
the interesting engineering is structured I/O reliability + per-user memory, not orchestration.

## Reuse from the portfolio

| Asset | Reuse |
|---|---|
| saas-starter (Wave 0) | auth, subscription, landing — entire monetization shell |
| roleplay-core structured-output layer | proposal/contract generation schemas + self-validation prompts |
| interview-mate prompt tool-protocol | vendor-neutral function calling (any OpenAI-compatible endpoint) |
| doodle-story ops experience | LemonSqueezy flows, overseas deployment |

## Key engineering decisions

1. **Capture compliance posture**: the extension reads the DOM the user is viewing and
   never ships a scraping backend. Rate-friendly, ToS-defensible, zero infra.
   (Documented in README — this is also a selling point to wary freelancers.)
2. **Anti-sound-alike lint**: deterministic phrase blacklist + embedding similarity check
   vs. a corpus of known boilerplate → hard gate before showing drafts.
   The one place we *don't* let the LLM judge itself.
3. **Per-user memory**: positioning profile = distilled from uploaded samples;
   stored as structured JSON (not raw chat history) — portable, inspectable, deletable.
4. **Chaser safety**: drafts only; a deterministic state machine (day offsets) drives cadence;
   user approval is a hard gate in the UI layer, not a prompt instruction.

## Evaluation (eval-spec compliance)

- **golden-30 job cards** (10 dev / 10 design / 10 writing gigs, hand-built):
  for each, rubric-score generated proposals on relevance, proof-point specificity,
  boilerplate-likeness (embedding sim to ban-list corpus);
- **Contract eval**: 20 edge scenarios (scope creep, IP clause, late fee) →
  clause-presence checklist, deterministic, 100% pass required;
- **Chaser eval**: tone escalation ladder correctness on 12 scripted aging scenarios;
- All three run in CI on every prompt/model change (regression gate, mcp-test style).

## Cost model

- LLM per power user (100 proposals + drafts/mo): ~$1.5-3 → COGS ≈ 15-20% at $12-19/mo.
- Infra: Supabase free→$25 tier carries first 500 users.

## Stack summary

TypeScript + ESM throughout; extension via Manifest V3 (Plasmo or plain);
web: Astro islands or Next.js (decide at W1 spike); deploy: Vercel/Cloudflare Pages;
LLM: OpenAI-compatible gateway, model-switchable (evaluation decides, marketing doesn't).
