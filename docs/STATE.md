# State | UK Council Tax | 16 November 2026

- **Live:** main `78eda1c`, published 16 November 03:53. Merged and live on 16 November: PR 96 (W2 set page workbench with a review fix pass, `f812fa5`) and PR 95 (towns pages, 642 routes under `/council-tax/towns/`, with a review fix pass, `78eda1c`). Live on 15 November: PRs 88, 91, 92 and 93.
- **W1 on the site:** two doors (Guess, Set) and mode links on every `/tools/budget/<slug>/`; the hub keeps the council picker on the first phone screen, then the two door band and three featured councils; excluded councils show their reason under the doors and no Set link.
- **Towns data:** `data/towns/england-2026-27.json`, 10,440 rows, 7,680 with a figure (275 from councils' own schedules). Special expense councils: 1 held, 23 held with gaps, 11 inconsistent, 13 not found (`docs/TOWNS-SCHEDULES-2026-11.md`). Band checks allow the rounding bound of separately rounded charges, not an exact penny.
- **Towns pages:** hub, 9 regions, 91 counties, 541 constituencies. Follow up, not started: lead the headline pair with the larger places, and bring the largest region pages under 500 KB (South West is 1.08 MB).
- **Next:** plan section 11.7 from step 4: F1 (shared band, short record line, money format) before W3. Page by page design changes in 11.4; decisions taken in 11.8.
- **For Tom:** the fast track, recommended in the narrow scope of plan 11.6; not authorised until Tom says so in words.
- **Open elsewhere:** UK Councils PR 62 has merge conflicts with its main.
- **Held data:** all 14 registry reorganisation objects unchanged and not rendered. Seats by party held on both sites.
- **Decisions waiting:** D10 as recorded (option (a)) unless Tom changes it before W2; plan section 10.3 (X3, X4, Shepway slug, seats source, audit identity, section 114 register) by 15 December; the fast track permission.
- **Untracked:** `output/` in the main checkout (45 MB town research downloads and C2 captures); safe to delete on Tom's yes. Worktrees under `~/wt/uct-*` for merged branches can be removed on Tom's yes.
- **Binding dates:** levels day staged by mid January 2027; links check before 10 February; freeze 20 March; reversal May to June 2027.
- **Local traps:** start `npx astro preview --host 127.0.0.1 --port 44321` yourself and run Playwright with `E2E_BASE_URL`, then `npx astro preview stop`; copy `data/raw/*.ods` into a fresh worktree before tests; unit tests can need `--testTimeout=120000` when another session is testing on the same Mac.
- **Plan:** `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` section 11 (16 November) and `docs/DESIGN-AUDIT-2026-11-15.md`. Session detail belongs in PR bodies.
