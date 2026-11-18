# Current plan | UK Council Tax and UK Councils | 18 November 2026

Revised in Claude Code on Monday 16 November 2026 at Tom's request ("focus on the restyle", "the colour theme is ugly"), from GitHub (`gh`, both repositories and estate-kit), the live site read in Chrome at 1440 px, the design check captures of PR 101, `src/styles/global.css`, Estate Kit 0.6.4 `generated/skins/ukcounciltax.css` and `docs/DESIGN-AUDIT-2026-11-15.md`. Nothing here authorises a merge, deployment or deletion.

Revised again on 17 November (after W8 went live, from the step timings of hosted runs 43769524014 and 44087295580) and on Wednesday 18 November 2026 at Tom's request ("update the plan"), from GitHub (`gh`, all three repositories), the review of UK Councils PR 64, the hosted runs of PR 105 (44119954638 and 44293231139), UK Councils `docs/DOSSIER-GATE.md` and the bodies of UK Councils PRs 67 and 68. The 18 November revision changed sections 1, 2, 3, 5, 6 and 7 and the lists under stage 2; the stage 1 colour brief, now finished work, was cut to a record line.

**This file is replaced, not appended to.** A session that changes the plan rewrites the part that changed, in its own pull request, as it does with `docs/STATE.md`. `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` is closed and kept as the record.

## 1. Where things stand

| Site | Main and live | Open |
|---|---|---|
| UK Council Tax | `238e78f` (PR 105, release gate in parallel jobs), published 18 November; palette B live since `30706ef` (PR 104) | None. W4 part two is being built in its own session |
| UK Councils | `c5de1bf` (PR 66, refreshed payments summaries), published 18 November; seats and control live since `f9139d4` (PR 64) | PR 68, draft: section 114 notice register (dossier prompt B). PR 67, draft: audit identity crosswalk (dossier prompt C, stage 1, data only) |
| Estate Kit | `v0.6.5` tagged (PR 30, palette B for UK Council Tax) | PR 27 (site header part), PR 28 (scrub report, draft) |

Restyle so far on UK Council Tax: W0 to W3, F1, W4 part one and W8 are live. The site vendors kit 0.6.5.

## 2. What was wrong with the restyle, and what is still open

1. **Colour, fixed.** Until 17 November every restyle pull request was layout, and the planned token swap would have changed nothing in dark, the theme Tom's browser shows. The colour round (PR 103), kit 0.6.5 and W8 (PR 104) replaced the palette on every page at once. The detail of what was wrong is in the body of PR 102 and in `docs/design/COLOUR-ROUND-2026-11.md`. Three small faults from the W8 review are left and now belong to the front doors PR (section 4, stage 2).
2. **Each page is judged alone.** Every page pull request carries the same eight page reference sheet, dark first (section 7).
3. **The gates cost about an hour a pull request; now measured and cut.** Between the hosted runs of 15 and 17 November the serial `site` job's browser steps grew from 12.0 to 20.0 minutes while the build did not slow: the suite grew with the pages. PR 105 split the gate into parallel jobs. A pull request run now takes 12.3 minutes (run 44119954638) and a release 17.5 minutes including `publish` (run 44293231139), against 30 for the last serial release (run 44087295580). W8 took five hosted runs, two lost to the description format; rules 5 and 6 in section 7 answer that.
4. **Documents only merges are not free.** A push to main always runs the whole gate and publishes, by design (a newer push cancels a running release). The merges of PRs 103 and 102 on 17 November each ran a full release, 23 and 30 minutes, and no other merge may happen during one. Rule 6.
5. **The critical path was not getting sessions.** Every session of 16 and 17 November went to colour and pages, and UK Councils PR 64 waited two days for its review. It was reviewed and merged on 18 November; the dossier row in section 3 now leads.
6. **Measurement was a weekly chore nobody did.** Week 1 is blank. Search Console keeps 16 months of history, so the search figures do not need a weekly reader: they can be read once before the reversal and once 28 days after. Only Cloudflare page views sit in a rolling window. On 18 November Tom ranked measurement below the page work. The recommendation in section 5 (M1, E1) is changed to match.
7. **Prompts repeat themselves.** A standing preamble carries the traps, gates and merge text once (`docs/PROMPTS-2026-11-16-COLOUR-AND-RESTYLE.md`).
8. **The dossier can pass its gate and still be thin.** "Absent with a stated reason" counts as complete in `DOSSIER-GATE.md`. After the three builds the pages hold party tables on 294 of 296 profiles and control on 129 (PR 64), audit lines on up to 79 (the crosswalk in PR 67) and notice records on 8 (PR 68). The gate will not flag that. Section 3 now ranks the remaining dossier work by the number of profiles it reaches.
9. **The May 2027 local elections fall on the reversal.** The composition snapshot is dated 16 November 2026 and the reversal is planned for May to June 2027. Seats and control will be out of date for every council that votes, in the weeks the dossier is meant to justify the switch. Section 3 gives the snapshot two refresh dates.
10. **Codex chats could not take follow up answers.** The logs of 39 Codex chats from 11 to 18 November all start in a folder with no repository; 14 were aborted. A chat that ended on a question was a dead end. Rule 7 in section 7 and section 6 answer that.

## 3. Track A: dated work, in date order

| By | Work | Site | Who | State and what it waits on |
|---|---|---|---|---|
| Done, 18 November | Review of UK Councils PR 64 (seats by party and control): the pinned table matched the publisher's page on all 318 rows; one fix, the reason printed for a held control line; merged as `f9139d4` on Tom's yes | UKC | Claude | Live. Review in the pull request. Dossier prompts B and C can start |
| Before and after the reversal | `docs/MEASUREMENT.md`: two reads of Search Console and Cloudflare Web Analytics, 28 days before the reversal and 28 days after (recommendation E1) | Both | A Claude session with Chrome, or Tom | The weekly rows are dropped if Tom takes E1 as recommended; week 1 was never read |
| Done, 18 November | Release gate in parallel jobs (PR 105, `238e78f`): `site` builds once, `unit`, three browser shards and the CSP run go beside it, `publish` deploys the same tree only when all pass. Test server ports 24321 and 28788. `npm run check:pr-body` | UKCT | Claude | Live. Timings in section 2 |
| Done, 18 November | "Refresh data" restores the pinned RA workbooks (PR 65, `6bc9b06`), and a test holds every workflow that runs the unit tests to it. The backlog was merged as PR 66 (`c5de1bf`). GitHub Actions may now open pull requests on UK Councils, so the weekly job opens its own | UKC | Claude | Live. Each Monday: read the refresh pull request. Owed, small: a description checker for UK Councils like `npm run check:pr-body` here |
| Done, 16 November | C1, the palette: B, green and cream, chosen from the colour round sheets | UKCT | Tom | Decided. K2 and W8 follow (section 4) |
| 1 to 5 December | Council links rerun (prompt 6 of 15 November). Every build fails from 4 January 2027 without it | Both | Codex | Prompt written |
| 4 December | D3, the two marks, drawn in the chosen palette | Both | Claude draws candidates, Tom chooses | Moved from 1 December so the marks follow the palette |
| Early December, after the links rerun | Shepway slug to `folkestone-and-hythe`: five URLs, redirects on three sites | Three sites | Codex, one PR per site, Tom's yes each | Decided |
| 15 December | Remaining dossier scope decisions (section 5) | UKC | Tom | Defaults apply from 16 December |
| Now | PSAA permission request: written permission to publish a per council table derived from its audit opinion data, with acknowledgement. Without it audit status reaches only the profiles on an MHCLG list | UKC | Claude drafts, Tom sends | Not drafted. It has a lead time, so it goes before audit stage 2, not after |
| Mid January 2027 | Dossier builds from the three decided sources. Seats and control: live since PR 64 (294 party tables, 129 control lines, 167 control lines held). Section 114 notices (prompt B): PR 68, draft, 11 inspected originals on 8 profiles. Audit status (prompt C): stage 1, the identity crosswalk, is PR 67, draft, 79 of 296 profiles reached; stage 2, the page work, follows PR 68 | UKC | Codex builds, Claude reviews, Tom's yes for each data PR | **The critical path.** Next: review PR 67 and PR 68 when their hosted checks pass, then prompt C stage 2 |
| Mid January 2027 | The rest of the dossier, ranked by profiles reached (`DOSSIER-GATE.md`, measured 15 and 16 November): election schedule, built on 174 of 296, so 122 to gain; published payments on 234; service links on 272; school holidays on 287 | UKC | Codex | Election schedule first. The links rerun lifts the service links row |
| When the report lands | C6b: referendum principles 2027/28 for the set pages and release records | UKCT | Claude | C6 staging is live since PR 88 |
| First week of March 2027 | Burnley scenario game refresh, after the February budget papers | UKCT | Codex | Prompt owed once the budget council date is published |
| First half of March 2027 | Levels day rehearsal: the runbook in `docs/D5-BUDGET-SEASON-2027.md` run end to end on staged data, on a preview, with the release checks | UKCT | Claude with Tom | Proposed 18 November; Tom's yes |
| Before 20 March 2027 | Composition snapshot refresh, the first of two (see May) | UKC | Codex, Claude reviews, Tom's yes | The refresh note is in UK Councils `docs/DOSSIER-GATE.md` |
| 20 March 2027 | Freeze until the levels day release | Both | | |
| Late March 2027 | Levels day release, runbook in `docs/D5-BUDGET-SEASON-2027.md` | UKCT | Claude with Tom | Staged |
| After 6 May 2027, before the reversal | Composition snapshot refresh after the May 2027 local elections (the first Thursday in May, 6 May 2027) and a rerun of both control checks | UKC | Codex, Claude reviews, Tom's yes | Not planned before 18 November. Without it the dossier is out of date for every council that voted |
| May to June 2027 | The reversal, gated on the dossier and on the two measurement reads (E1) | Both | Tom's decision | |

## 4. Track B: the restyle

Lanes: one UK Council Tax page session at a time; the colour lane beside it (it touches the kit and the token block, not page templates, until its one swap PR); at most one data session; one UK Councils session. Every page PR reuses the F1 parts (`DeskBand`, `RecordLine`, `PageSources`, `formatMoney`) and lowers its row in the `foundation.mjs` ratchet.

### Stage 1: colour, done 17 November

The colour round (C0, PR 103), Estate Kit 0.6.5 (K2, tagged `v0.6.5`) and the swap (W8, PR 104, merged as `30706ef`) put palette B, green and cream, on every page. Tom chose B from the sheets on 16 November (decision C1). The brief, the three candidates and the values are in `docs/design/COLOUR-ROUND-2026-11.md` and the body of PR 102.

### Stage 2: pages that must land before 20 March

| Order | Work | Who | Waits on |
|---|---|---|---|
| 1 | W4 part two: reveal, result card, PNG, the drawer | Claude (Opus), fast track | Nothing. Prompt in `docs/PROMPTS-2026-11-16-W4-W9.md` |
| 2 | Front doors, one PR: the `/tools/budget/` hub (band first, picker inside, Guess and Set pills per row) and the homepage row (bill card trimmed to bar, legend and one record line; England average, change and line chart in one row; map thumb from the real outline). It also takes the three faults left from the W8 review: `data-ground="desk"` on the band; in light, the map thumb's third shade and the Band D line's hovered point are cream on cream; the share card logo square merges into the ground. A fault that needs a new colour value goes to the kit (rule 4) | Claude, fast track if it stays layout only | W4 part two merged |
| 3 | W9 council page: ledger row under the H1, one bands chart, short record lines | Claude (Opus), fast track | Prompt written |
| 4 | W5 header, drawer and footer, alone | Claude, Tom's yes | D8 |
| 5 | W7 compare as bars for fixed pairs (NV11, decided 16 November). Moved up from the should list on 18 November: the design audit ranks the compare tool at severity 5 and the Tier 2 pages at severity 3 | Codex, Claude reviews, Tom's yes | Nothing |
| 6 | Tier 2 sweep, two PRs, mechanical: record lines and one Sources block, the chart pair, the title rule and page weight on the national page, band pages, increases, changes, precepts, Wales, 2027/28 and your area. No redesign | Codex, Claude reviews, Tom's yes | W9 merged, as the worked example. Removes four ratchet rows |
| UKC | U1 kit token route, then the UK Councils palette by the same round (one short session, the method exists by then), then U3 network band | Claude, Tom's yes | The UK Councils lane is free for these once the dossier pull requests merge |

Target: the must list live by the end of February, leaving three weeks before the freeze.

**Should land, in this order, if the must list is on time by the end of January:** towns follow up (larger places lead the headline pair; region pages under 500 KB; Tom's yes; asked for by Tom on 15 November); `/council-tax/ranked/`; M1 marks after D3.

**Proposed on 18 November, each needs Tom's yes before it is planned:** a public coverage page on UK Councils (one table of what the site holds for each council and why anything is absent, from the gate report); a one line summary at the top of a UK Councils profile (control, and the next scheduled election) where both parts are built; a weekly check in the UK Councils refresh job that compares the live composition table's hash with the pin and opens an issue when it differs, changing no data.

**After the reversal:** W10 share cards on both sites; U4 the `/councils/` map lead; U5 the dossier page layout; D14 option b.

Sessions left on the restyle: 6 in the must list (W4 part two, front doors, W9, W5, compare, the Tier 2 sweep), 3 on UK Councils, 3 in the should list, 4 parked. The three colour sessions are done.

## 5. Decisions, one register

Taken on 16 November and recorded in `docs/DECISIONS-2026-11-16.md`: the narrow fast track; X3 stay private; X4; Shepway; seats source; audit identity; section 114 register; NV11; D2 paper tint; the reorganisation field stays held; D5, D13 and D14 at option (a); council control in the seats build. Also on 16 November, C1: palette **B, green and cream**, chosen by Tom from the colour round sheets (`docs/design/COLOUR-ROUND-2026-11.md`, pull request 103), taken as drawn, so B's cream paper `#f6f1e4` supersedes the D2 value.

Open, with my recommendation, a date and what happens on silence:

| Ref | Decision | Recommendation | Decide by | Default |
|---|---|---|---|---|
| M1 | Who reads the measurement figures | Nobody weekly. One read before the reversal and one after (E1), by a Claude session with Chrome or by Tom | With E1 | As E1 |
| C2 | Which theme leads | Dark is captured and judged first on every sheet; both must pass | With C1 | Dark first |
| R1 | Fast track when a reviewer's data rule finding has been fixed | Allow the merge once the same reviewer confirms the fix in the pull request and the PR is still layout only | Before the next such PR | Each such PR waits for Tom |
| D8 | Header structure | (a) four menus plus "Find my bill" | 30 November | W5 waits |
| D3 | Marks | (a) distinct marks, drawn in the chosen palette. The accent half of D3 is now C1 | 4 December | Shared glyph stays; M1 dropped from this season |
| D10 | Presets on the set page | (a) one or two, labelled as user requested scenarios | 15 December | None |
| D12 | Canonical status of rebuilt pages | (a) keep canonical to UK Councils until the reversal | 15 December | (a) |
| E1 | What the reversal needs from the measurement record | No numeric threshold and no weekly rows. Read Search Console once for the 28 days before the reversal and once for the 28 days after, with the canonical sample matching; read Cloudflare page views in the same two windows | 15 December | Two reads, no conclusion drawn beyond them |
| H1 | The 165 held control labels on UK Councils. The publisher's "About this site" page says the field names the party of the mayor or the administration leader, then the other administration parties, so each is an administration statement from one third party | Keep them held. Print one only where that council's own statement is pinned as a second source | 15 December | Held |
| E2 | Analytics beacon on the set pages | Leave it off; use Search Console for `/set/` URLs | Any time | Off |
| C7 | Dossier: additional body types | Out of the January scope | 15 December | Out of scope, absence stated |
| C9 | Dossier: contracts | Out of the January scope | 15 December | Out of scope, absence stated |
| D1 | Display and record faces | (a) estate faces only | With C1 | (a) |
| D6 | Links with the tompickup.co.uk games | (a) none | Any time | None |
| D7 | UK Food Hygiene and UK Places links | (a) footers once each URL is verified live | With W5 | Held |
| D9 | UK Councils compare page | (a) keep canonical, add an example pair | Any time | As is |

## 6. Prompts

1. Colour round (C0), kit 0.6.5 (K2), the swap (W8) and the front doors PR: written, `docs/PROMPTS-2026-11-16-COLOUR-AND-RESTYLE.md`, with the standing preamble every later prompt cites.
2. W4 part two and W9: written, `docs/PROMPTS-2026-11-16-W4-W9.md`.
3. Dossier builds A, B, C: written, `docs/PROMPTS-2026-11-16-DOSSIER-BUILDS.md`.
4. Dossier prompt B (section 114, full build) and prompt C stage 1 (audit identity crosswalk, data only) were rewritten on 18 November to run side by side and given to Tom in chat; they are UK Councils PRs 68 and 67. Each carries the session rules block of rule 7.
5. Owed: dossier prompt C stage 2 (audit page work), written when PR 68 merges, from its diff; the Tier 2 sweep, written when W9 merges, from W9's diff; the election schedule build; the PSAA permission request for Tom to send.

## 7. Working rules

Kept: a separate reviewer for any PR that adds pages, data or shared logic. Merge as its own step after reading `gh pr checks`. No merge during a deploy. Tom's yes in words for data, new page families, navigation, tokens, the dossier, the registry, held fields and Codex PRs.

New from this revision:

1. **The reference sheet.** Every page PR captures the same eight pages, dark first then light, at 390 and 1440: `/`, `/tools/budget/`, `/tools/budget/trafford/`, `/tools/budget/trafford/set/`, `/councils/pendle/`, `/council-tax/`, `/council-tax/towns/`, `/compare/`. The list lives in `docs/design/reference-pages.txt`, created by the colour round. The PR's own pages are captured as well. Tom reads one sheet and sees the site, not a page.
2. **Gate once.** Full local gates run on the final head only. Review findings are fixed together and pushed once, so a PR costs two hosted runs, not five.
3. **Family sized PRs.** Where two changes share one "Pages allowed to differ" glob and one reviewer can hold both, they are one PR (the front doors, the Tier 2 sweep). A PR that needs Tom's yes is never bundled with one that does not.
4. **No colour in a page PR.** A page PR that needs a new colour stops and asks the kit; values arrive only through `apply-brand.py`.
5. **Check the description before it is opened or edited.** Write the body to a file and run `npm run check:pr-body -- body.md` (or `-- --pr <number>` on an open one). It uses the hosted parser, so a missing fenced block or an allowed glob written as a URL fails here in a second, not in the number diff after a hosted run. Every edit to a description starts a new hosted run, so edit once.
6. **Documents ride with the work.** `docs/STATE.md`, this file and prompts change inside the page or data pull request they describe. A pull request of documents alone is for a decision record or a plan revision Tom asked for, and it merges when no release is running and none is about to start.
7. **Codex work never depends on the chat.** The six session rules in section 8 of `~/.codex/AGENTS.md` apply to every Codex task: work by absolute path; resume from an existing worktree, branch and pull request; never stop to ask, take the stated default and record it; commit, push and open the draft pull request early with a Progress comment after each step; finish with a Handoff comment. A Codex task is done when its hosted checks pass, not when it stops. Open questions are answered inside the next prompt.
8. **Review of a data pull request.** The reviewer recomputes the joins and counts with a script that does not use the pull request's own loader, compares every pinned row with the publisher's live page, checks identity on a sample of the publisher's own pages, and reads the built pages for the absence reasons. Each absence reason must be true for the profile it prints on: one reason per cause, each with a test.
9. **Decisions are batched.** Anything waiting on Tom's yes goes to him as one list a day with a recommendation on each line, not as one question per session.

Dates and figures in this file are restated from the documents named at the top; check GitHub before relying on a state line.
