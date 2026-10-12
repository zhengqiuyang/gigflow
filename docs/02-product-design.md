# 02 · Product Design 【提案】

## The gig lifecycle loop (product spine)

```
① CAPTURE          ② TAILOR            ③ CLOSE              ④ COLLECT
job post in ──→  tailored proposal ──→  contract +     ──→  invoices, milestone
(browser ext /     from portfolio        kickoff brief       reminders, polite
paste URL)         + win-strategy        generated on win    payment chasing
```

Each stage feeds the next: the job post parsed in ① becomes the contract terms in ③
and the milestone schedule in ④. Single source of truth per gig — this continuity
is the product; individual stages are table stakes.

## Stage designs

### ① Capture
- Browser extension (Chrome first): on any Upwork job page, one click → structured job card
  (budget real/fake heuristics, client history flags, required skills, red flags);
- Fallback: paste URL/text. No scraping infrastructure at v0.1 — extension runs
  client-side on the page the user is already viewing (compliance posture, see 03).

### ② Tailor (the differentiator)
- Portfolio memory: user uploads past work samples + 3 winning proposals;
  system distills a "positioning profile" (strengths, proof points, voice);
- Proposal draft = job card × positioning profile × win-strategy template
  (lead with the client's stated problem, one concrete proof point, one sharp question);
- "Sound-alike" countermeasure: style-transfer from the user's own winning samples,
  explicit anti-boilerplate lint (bans "I am the perfect fit" class phrases — deterministic check);
- A/B memory: outcome tracking (won/lost/ignored) improves per-user templates over time.

### ③ Close
- On win: generate plain-English contract (scope, deliverables, revisions cap,
  IP transfer on payment, late-fee clause) + milestone schedule from the proposal;
  PDF/e-sign handoff via integrations later; v0.1 = clean DOCX/PDF out.

### ④ Collect
- Milestone invoices with payment-due tracking;
- Chaser agent (paid tier): escalating-but-polite email drafts
  (day 3 nudge → day 7 friendly → day 14 firm-with-late-fee-reference),
  always human-approved before sending. Never auto-sends. Ever.

## Non-goals (M0)

- No auto-submitting proposals to Upwork (ToS + trust);
- No time-tracking, no tax features (Bonsai/Wave own those);
- No marketplace of gigs (job boards are commoditized).

## Retention mechanics

- Weekly digest: "3 jobs match your profile, drafts ready to review" (capture loop);
- Win-rate analytics per proposal version (the data moat — per-user, private);
- Cash-flow forecast from milestone schedule (the dashboard that makes it feel like
  a business tool, not a writer).
