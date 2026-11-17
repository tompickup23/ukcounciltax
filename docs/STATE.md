# State | UK Council Tax | 17 November 2026

- **Live:** main `30706ef` (PR 104, W8: palette B, green and cream, on every page from Estate Kit 0.6.5), merged and published 17 November; its publish run passed. Before it: `5a76109` (PR 101, W4 part one) and PRs 94 to 100 on 16 November.
- **Open:** pull request 102 (this plan), 103 (colour round and decision C1).
- **Plan:** `docs/PLAN-CURRENT.md`, one page, replaced not appended. Revised this evening at Tom's request to put the restyle and its colours first.
- **Finding that changed the plan:** the restyle so far is layout only. The site still vendors Estate Kit 0.6.3, and the planned token swap (K1 paper through W8) would change the light page from white to `#f8f7f2` and nothing visible in dark, which is the theme Tom's browser shows. Detail in plan section 2.
- **Colour lane:** C0 done (pull request 103). C1 decided 16 November: palette B, green and cream. K2 done: Estate Kit 0.6.5 merged as `26847ee` and tagged `v0.6.5` on 17 November on Tom's yes. W8 done: pull request 104 merged as `30706ef` on 17 November on Tom's yes, after every gate, a separate review and a number diff of 0 pages differing with no allowance. It carries four band colour fixes in page files that Tom agreed (set page shortfall colour and error mark, footer focus rings, game share card squares). Left from its review for a page pull request: adopt `data-ground="desk"` on the band; in light the map thumb's third shade and the Band D line's hovered point are cream on cream; the share card logo square merges into the ground. For Tom's eye: the two creams in the bill bar.
- **Next, page lane:** W4 part two (prompt in `docs/PROMPTS-2026-11-16-W4-W9.md`; no branch yet), then the front doors PR, then W9. One page session at a time.
- **Not started and owed now:** the CSP run port fix here, with a look at why the `site` check grew from about 20 to about 32 minutes; the "Refresh data" fix on UK Councils (failed again 16 November); measurement week 1 in `docs/MEASUREMENT.md`, which needs a session with Chrome.
- **Critical path elsewhere:** UK Councils PR 64 (draft, seats and control, checks passed) needs its review and Tom's yes; then dossier prompts B and C. Due mid January 2027.
- **Fast track:** granted 16 November in the narrow scope of `docs/DECISIONS-2026-11-16.md`. Tokens are outside it, so K2 and W8 are Tom's yes.
- **Estate Kit:** `v0.6.5` tagged (PR 30). PRs 27 and 28 open. The site vendors 0.6.5 on main.
- **Held data:** all 14 registry reorganisation objects unchanged and not rendered. Seats by party held on both sites until the dossier data PR.
- **Decisions waiting:** plan section 5. Soonest: R1; D8 by 30 November; D3 by 4 December; the rest by 15 December.
- **Binding dates:** links rerun 1 to 5 December; dossier mid January 2027; restyle must list by end of February; freeze 20 March; levels day late March; reversal May to June 2027.
- **New working rules (plan section 7):** the eight page reference sheet in every page PR, dark first; gates once on the final head; family sized PRs; no colour value in a page PR.
- **Local traps:** copy all of `data/raw/` from the main checkout into a fresh worktree before building or testing; start `npx astro preview` yourself on a free port and run Playwright with `E2E_BASE_URL`, then stop it; a full build takes 15 to 20 minutes, so use `astro dev` for layout work.
- **Design reference:** `docs/DESIGN-AUDIT-2026-11-15.md`. Session detail belongs in PR bodies.
