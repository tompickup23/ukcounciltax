# State | UK Council Tax | 16 November 2026, afternoon

- **Live:** main `bd75d27` (PR 99, W3 set page), merged and published 16 November on Tom's yes. Also from 16 November: PRs 94, 95 (towns pages), 96 (W2 set page), 97 (F1 foundation), 98 (decisions). From 15 November: PRs 88, 91, 92, 93.
- **Open:** none after this docs pull request. PR 99's `site` check first failed on a port clash in the actual CSP run (port 48788 in use), not on a test, and passed on the rerun; the fix for that clash is still owed.
- **Plan:** `docs/PLAN-CURRENT.md`, one page, replaced not appended. `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` is closed and kept as the record.
- **Critical path:** the UK Councils dossier builds from the three sources decided on 16 November (seats, audit status, section 114), due by mid January 2027. Prompts A, B and C are in `docs/PROMPTS-2026-11-16-DOSSIER-BUILDS.md` for Codex, one at a time; each is a data PR needing Tom's yes.
- **Measurement:** `docs/MEASUREMENT.md` started 16 November, one record for both sites. Week 1 figures are blank and owed by the next session with Chrome, with the read back of the 28 days to 14 November. The set pages carry no beacon.
- **Not started and owed now:** the CSP port fix here; the "Refresh data" fix on UK Councils (failed 16 November).
- **Running, started 16 November:** W4 game page (Opus session, two PRs, fast track, prompt in `docs/PROMPTS-2026-11-16-W4-W9.md`); K1 Estate Kit 0.6.4 (Opus session, stops at an open PR); UK Councils seats and control build (Codex, prompt A). Then W9 council page, then the `/tools/budget/` hub. One page session at a time.
- **Fast track:** granted on 16 November in the narrow scope of `docs/DECISIONS-2026-11-16.md`. Layout only, separate reviewer, all checks passed, no deploy running, contact sheet in the PR.
- **Open elsewhere:** UK Councils has no open pull request (62 and 63 merged and live, main `456a200`). Estate Kit PRs 27 and 28.
- **Held data:** all 14 registry reorganisation objects unchanged and not rendered. Seats by party held on both sites until the dossier data PR.
- **Decisions waiting:** plan section 5. Soonest: R1, D8 by 30 November, D3 by 1 December, the rest by 15 December.
- **Binding dates:** links rerun 1 to 5 December; dossier mid January 2027; freeze 20 March; levels day late March; reversal May to June 2027.
- **Local traps:** copy all of `data/raw/` from the main checkout into a fresh worktree before building or testing; start `npx astro preview --host 127.0.0.1 --port 44321` yourself and run Playwright with `E2E_BASE_URL`, then `npx astro preview stop`; a full build takes 15 to 20 minutes, so use `astro dev` for layout work.
- **Design reference:** `docs/DESIGN-AUDIT-2026-11-15.md`. Session detail belongs in PR bodies.
