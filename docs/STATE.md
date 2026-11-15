# State | UK Council Tax | 15 November 2026

- **Live:** main `c20533b` (NV8 England map, PR 78), deploying 15 November by Verify and publish. NV10, NV9 and kit 0.5.1 are live before it.
- **Estate Kit 0.6.3:** PR 82 merged 15 November as `801bd68`: district increase bars compact (PNG 24,531 to 10,919 px), `KIT_DASH_GUARD` dropped.
- **PR 80 (C2 cohort, this PR):** 197 of 296 eligible; strict closed GBP 500 screen on RA total and parish kept by Tom on 15 November (15 truncation-pattern councils stay out). Output only in `.ops/c2-dist`. Close PR 68 on merge; session B (prompt 4) follows once Tom confirms its two defaults.
- **PR 81 (Burnley bill explained):** reviewed 15 November: all checks green on `7ebe401`, four figures match the raw files; ready, two minor notes in the kit PR body. Merging it puts `/bill` live on the next deploy, so the merge is Tom's yes for `/bill`.
- **UK Councils PR 57:** parked. Registry officialName is a display name at source; fixed in UK Places (prompt 2, decision D1), then refreshed into both sites with 57 folded in (prompt 5).
- **Prompts:** `docs/CODEX-PROMPTS-2026-11-15.md`. Prompts 1, 2, 3 and 5 have run (registry refresh is UKCT PR 83 and UKC PR 58). Queued: 4 (session B) and the gates pack, both after PR 80.
- **Session B defaults for Tom:** public range zero to twice each amount, labelled as exploration; the mode sits beside the Burnley scenario link.
- **Decisions waiting:** NV11 compare drawing, X3 Actions billing, X4 worktree removal (merged branch worktrees: uct-bill-bar, uct-increases-bars, uct-docs-1114, uct-england-map; uct-c2-pilot after PR 80).
- **Held data:** the registry reorganisation field stays held.
- **Weekly from 17 November:** the measurement note.
- **Binding dates:** levels day staged by mid January 2027; links check before 10 February; freeze 20 March; reversal May to June 2027.
- **Plan:** `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`, section 7 is the latest. Session detail belongs in PR bodies.
