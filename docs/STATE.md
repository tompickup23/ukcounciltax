# State | UK Council Tax | 15 November 2026

- **Live:** main `c20533b` (NV8 England map, PR 78), deploying 15 November by Verify and publish. NV10, NV9 and kit 0.5.1 are live before it.
- **Estate Kit 0.6.3 (this PR, `feat/kit-063-compact`):** vendored by the kit's command; district increase bars drawn compact (PNG 24,531 to 10,919 px); `KIT_DASH_GUARD` dropped from `check-dist`. Every other built file is byte identical. Not merged or deployed.
- **PR 80 (C2 cohort, draft):** sound on review; 170 of 296 eligible. Fix pass is prompt 1: own share bound from printed precision (up to 192), tax join units, fractional threshold tests, year text from data, tripwire documented. Close PR 68 when 80 merges.
- **PR 81 (Burnley bill explained):** reviewed 15 November: all checks green on `7ebe401`, four figures match the raw files; ready, two minor notes in the kit PR body. Merging it puts `/bill` live on the next deploy, so the merge is Tom's yes for `/bill`.
- **UK Councils PR 57:** parked. Registry officialName is a display name at source; fixed in UK Places (prompt 2, decision D1), then refreshed into both sites with 57 folded in (prompt 5).
- **Prompts:** `docs/CODEX-PROMPTS-2026-11-15.md`. Run now: 1 and 2; 3 is this PR. Queued: 4 (session B) after PR 80; 5 after UK Places deploys; gates pack after PR 80.
- **Session B defaults for Tom:** public range zero to twice each amount, labelled as exploration; the mode sits beside the Burnley scenario link.
- **Decisions waiting:** NV11 compare drawing, X3 Actions billing, X4 worktree removal (merged branch worktrees: uct-bill-bar, uct-increases-bars, uct-docs-1114, uct-england-map; uct-c2-pilot after PR 80).
- **Held data:** the registry reorganisation field stays held.
- **Weekly from 17 November:** the measurement note.
- **Binding dates:** levels day staged by mid January 2027; links check before 10 February; freeze 20 March; reversal May to June 2027.
- **Plan:** `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`, section 7 is the latest. Session detail belongs in PR bodies.
