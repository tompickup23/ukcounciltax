# State | UK Council Tax | 16 November 2026, after midnight

- **Live:** main `810be18`, published 15 November 23:39. Merged and live on 15 November: PR 88 (C6 levels day 2027/28 staged, `5bc7bed`), PR 91 (special expense schedules audit, `95e0d82`), PR 92 (towns stage 1 data, `f563a4c`), PR 93 (W1 budget doors with a review fix pass, `810be18`).
- **W1 on the site:** two doors (Guess, Set) and mode links on every `/tools/budget/<slug>/`; the hub keeps the council picker on the first phone screen, then the two door band and three featured councils; excluded councils show their reason under the doors and no Set link.
- **Towns data:** `data/towns/england-2026-27.json`, 10,440 rows, 7,680 with a figure (275 from councils' own schedules). Special expense councils: 1 held, 23 held with gaps, 11 inconsistent, 13 not found (`docs/TOWNS-SCHEDULES-2026-11.md`). Band checks allow the rounding bound of separately rounded charges, not an exact penny.
- **Running:** towns stage 2 (league table pages, SEO, design), Claude Code session on `feat/towns-pages` in `~/wt/uct-towns-pages`; no PR yet when this note was written. It opens a draft PR and asks Tom before merge.
- **Next:** W2 set page workbench. The Codex prompt adapted after W1 is in `docs/PROMPTS-2026-11-16-W2-AND-FAST-TRACK.md`; then W3 (prompt 7 in `docs/PROMPTS-2026-11-15-W1-W3-AND-TOWNS.md`). W4 to W10 in `docs/DESIGN-AUDIT-2026-11-15.md` have no prompts yet.
- **For Tom (review in a later session):** the Opus fast track option in the new prompts file: Opus sessions build W2 to W10, review their own diff and merge on green checks under a standing permission Tom has not yet given.
- **Open elsewhere:** UK Councils PR 62 has merge conflicts with its main.
- **Held data:** all 14 registry reorganisation objects unchanged and not rendered. Seats by party held on both sites.
- **Decisions waiting:** D10 as recorded (option (a)) unless Tom changes it before W2; plan section 10.3 (X3, X4, Shepway slug, seats source, audit identity, section 114 register) by 15 December; the fast track permission.
- **Untracked:** `output/` in the main checkout (45 MB town research downloads and C2 captures); safe to delete on Tom's yes. Worktrees under `~/wt/uct-*` for merged branches can be removed on Tom's yes.
- **Binding dates:** levels day staged by mid January 2027; links check before 10 February; freeze 20 March; reversal May to June 2027.
- **Local traps:** start `npx astro preview --host 127.0.0.1 --port 44321` yourself and run Playwright with `E2E_BASE_URL`, then `npx astro preview stop`; copy `data/raw/*.ods` into a fresh worktree before tests; unit tests can need `--testTimeout=120000` when another session is testing on the same Mac.
- **Plan:** `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` section 10 and `docs/DESIGN-AUDIT-2026-11-15.md`. Session detail belongs in PR bodies.
