# State | UK Council Tax | 16 November 2026, evening

- **Live:** main `5a76109` (PR 101, W4 part one: game hero step cards, pill stepper, ledger row, record lines), merged 16 November; its publish run passed. Also from 16 November: PRs 94 to 100.
- **Open:** none after this docs pull request.
- **Plan:** `docs/PLAN-CURRENT.md`, one page, replaced not appended. Revised this evening at Tom's request to put the restyle and its colours first.
- **Finding that changed the plan:** the restyle so far is layout only. The site still vendors Estate Kit 0.6.3, and the planned token swap (K1 paper through W8) would change the light page from white to `#f8f7f2` and nothing visible in dark, which is the theme Tom's browser shows. Detail in plan section 2.
- **Colour lane:** C0 done (pull request 103). C1 decided 16 November: palette B, green and cream. Next is kit 0.6.5 (K2), then the swap (W8), live by 30 November; each is Tom's yes. Prompts in `docs/PROMPTS-2026-11-16-COLOUR-AND-RESTYLE.md`.
- **Next, page lane:** W4 part two (prompt in `docs/PROMPTS-2026-11-16-W4-W9.md`; no branch yet), then the front doors PR (budget hub and homepage row), then W9 council page. One page session at a time; the colour lane runs beside it until the swap PR.
- **Not started and owed now:** the CSP run port fix here, with a look at why the `site` check grew from about 20 to about 32 minutes; the "Refresh data" fix on UK Councils (failed again 16 November); measurement week 1 in `docs/MEASUREMENT.md`, which needs a session with Chrome.
- **Critical path elsewhere:** UK Councils PR 64 (draft, seats and control, checks passed) needs its review and Tom's yes; then dossier prompts B and C. Due mid January 2027.
- **Fast track:** granted 16 November in the narrow scope of `docs/DECISIONS-2026-11-16.md`. Tokens are outside it, so K2 and W8 are Tom's yes.
- **Estate Kit:** `v0.6.4` tagged (PR 29). PRs 27 and 28 open.
- **Held data:** all 14 registry reorganisation objects unchanged and not rendered. Seats by party held on both sites until the dossier data PR.
- **Decisions waiting:** plan section 5. Soonest: R1; D8 by 30 November; D3 by 4 December; the rest by 15 December.
- **Binding dates:** links rerun 1 to 5 December; dossier mid January 2027; restyle must list by end of February; freeze 20 March; levels day late March; reversal May to June 2027.
- **New working rules (plan section 7):** the eight page reference sheet in every page PR, dark first; gates once on the final head; family sized PRs; no colour value in a page PR.
- **Local traps:** copy all of `data/raw/` from the main checkout into a fresh worktree before building or testing; start `npx astro preview` yourself on a free port and run Playwright with `E2E_BASE_URL`, then stop it; a full build takes 15 to 20 minutes, so use `astro dev` for layout work.
- **Design reference:** `docs/DESIGN-AUDIT-2026-11-15.md`. Session detail belongs in PR bodies.
