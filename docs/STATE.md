# State | UK Council Tax | 15 November 2026

- **This PR (feat/burnley-bill-explained):** on /precepts/, what each part of the bill pays for (GOV.UK types of council), what changed at Band D since 2025/26 by body and parish (MHCLG Table 10 2025/26 and the parish return, the schedule for 2026/27; `npm run data:local-bill-changes`), the same in the bill tool result, and the `#find-your-bill` anchor for the Burnley films, linked from /councils/burnley/ and /tools/budget/burnley/. Not deployed.
- **Live:** last recorded deployment is main `daf599d` on 14 November. This session does not deploy.
- **Base:** main `647b3eb`, after NV9 in PR 77 and NV10 in PR 75. This session does not merge or deploy.
- **Session 8, this PR:** the NV8 England area Band D map on `/council-tax/`, branch `feat/england-map-nv8`.
- **Measure:** current year area Band D, including adult social care and average parish precepts, from the existing MHCLG Table 9 records.
- **Breaks for Tom's review:** GBP 2000, 2200, 2400, 2600 and 2800; fixed across editions. Class counts: 9, 18, 89, 145, 35 and 0.
- **Join:** all 296 areas match their authorities by exact GSS code. No missing authority or boundary.
- **Geometry:** Douglas Peucker at 0.004 degrees, copied from UK Councils; every area and ring retained. Unknown stays striped.
- **Layout:** map starts closed immediately above the existing visible table; the first answer stays above it. Native area links and a skip link work without scripts.
- **Download:** one light palette PNG at 2x, with the existing chart actions. Estate Kit stays at 0.6.0.
- **Verification, measurements and number diff:** recorded in full in this PR body.
- **Held data:** the registry reorganisation field remains held; no source or financial figure changes.
- **Open work:** PR 68 is the draft C2 freeze pilot. Its release is separate.
- **Next:** C6 levels day staging in January, after the December settlement. Year and release constants remain unchanged here.
- **Standing decisions:** X3 Actions billing, X1 new chart forms, X2 generic C2 timing, X4 worktree removal.
- **Weekly from 17 November:** the measurement note.
- **Binding dates:** levels day staged by mid January 2027; links check before 10 February; freeze 20 March; reversal May to June 2027.
- **Plan:** `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`. Session detail belongs in PR bodies.
