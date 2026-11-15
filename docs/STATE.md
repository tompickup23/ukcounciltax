# State | UK Council Tax | 15 November 2026, night

- **Live:** main `f421f1e` (PR 87). Set the budget at `/tools/budget/<slug>/set/` for 197 councils since PR 84.
- **Open:** PR 88 (C6 levels day staging, draft, 60 files, waits on plan section 8 decisions); UK Councils PR 62 (dossier gate); Estate Kit PRs 27 (header part) and 28 (X3 scrub, draft).
- **Design audit, 15 November:** `docs/DESIGN-AUDIT-2026-11-15.md`. Both sites read as forms; set mode had one way in; the Burnley scenario headline was invisible. Direction "Ledger and Desk", about twenty PRs in order, decisions D1 to D14.
- **This PR (W0):** the budget band (Play and Set doors) on the homepage and `/tools/`, the England map as the wide task card, a Set mode link per row on `/tools/budget/`, the Burnley headline fix by `--reskin` (no new model run), table stripe and scroll box fixes, a 404 with the tools. Touches no PR 88 file except this note.
- **Next after W0:** P0 measurement baseline and P1 mockups (both docs); W6 homepage and tools showcase and W7 compare (outside PR 88); W1 to W5 wait for PR 88. Tom's calls first: D11 (C6 first), D1 to D3 from mockups.
- **Held data:** all 14 registry reorganisation objects unchanged and not rendered. Seats by party held on both sites.
- **Decisions waiting**, plan section 10.3: X3; X4; Shepway slug, seats source, audit identity and section 114 register by 15 December; NV11 (now D4 in the audit).
- **Weekly from Monday 17 November:** the measurement note in `docs/MEASUREMENT.md` (not yet written; P0).
- **Binding dates:** levels day staged by mid January 2027; links check before 10 February; freeze 20 March; reversal May to June 2027.
- **Local trap:** Astro 7 `astro preview` detaches, so Playwright's own webServer fails locally. Start `npx astro preview --host 127.0.0.1 --port 44321`, run with `E2E_BASE_URL=http://127.0.0.1:44321`, then `npx astro preview stop`.
- **Plan:** `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` section 10, and the audit note for the design programme. Session detail belongs in PR bodies.
