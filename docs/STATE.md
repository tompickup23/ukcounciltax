# State | UK Council Tax | 16 November 2026

- **Live:** main `ffc76e7`, published 16 November 03:55. Live on 16 November: PRs 94, 95 (towns pages), 96 (W2 set page). Live on 15 November: PRs 88, 91, 92 and 93.
- **Open:** F1 foundation PR on `feat/f1-foundation` (plan 11.10): desk band, short record line and Sources block, money formatter, chart title rule, chart grid, five new dist gates. Gates green; needs a separate reviewer, then Tom's yes to merge.
- **After F1:** W3 set page (amounts as `£366.0m` through `formatMoney` compact, result board on `DeskBand`), then W4 game page and W9 council page through Codex with review. Each page PR moves its own citations to record lines and lowers its row in the `foundation.mjs` ratchet.
- **D2:** decided (a), tinted paper `#f8f7f2` with white cards (plan 11.10). It lands through the kit token route in K1 and W8, not by hand.
- **Towns follow up, not started:** lead the headline pair with the larger places; bring region pages under 500 KB (South West 1.09 MB, capped in the ratchet).
- **For Tom:** the fast track, recommended in the narrow scope of plan 11.6; not authorised until Tom says so in words.
- **Open elsewhere:** UK Councils PR 62 (January dossier gate) has merge conflicts with its main; rebase is the first UKC job.
- **Held data:** all 14 registry reorganisation objects unchanged and not rendered. Seats by party held on both sites.
- **Decisions waiting:** plan section 10.3 (X3, X4, Shepway slug, seats source, audit identity, section 114 register) by 15 December; the fast track permission.
- **Untracked:** `output/` in the main checkout (45 MB); worktrees under `~/wt/uct-*` for merged branches. Both removable on Tom's yes.
- **Binding dates:** links check 1 to 5 December; levels day staged by mid January 2027; freeze 20 March; reversal May to June 2027.
- **Local traps:** copy all of `data/raw/` from the main checkout into a fresh worktree before building or testing; start `npx astro preview --host 127.0.0.1 --port 44321` yourself and run Playwright with `E2E_BASE_URL`, then `npx astro preview stop`; unit tests can need `--testTimeout=120000` beside a build.
- **Plan:** `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` section 11 (11.10 is F1) and `docs/DESIGN-AUDIT-2026-11-15.md`. Session detail belongs in PR bodies.
