# Current plan | UK Council Tax and UK Councils | 18 November 2026, decisions of 19 November and W5 added

Revised in Claude Code on Monday 16 November 2026 at Tom's request ("focus on the restyle", "the colour theme is ugly"), from GitHub (`gh`, both repositories and estate-kit), the live site read in Chrome at 1440 px, the design check captures of PR 101, `src/styles/global.css`, Estate Kit 0.6.4 `generated/skins/ukcounciltax.css` and `docs/DESIGN-AUDIT-2026-11-15.md`. Nothing here authorises a merge, deployment or deletion.

Revised again on 17 November (after W8 went live, from the step timings of hosted runs 43769524014 and 44087295580) and on Wednesday 18 November 2026 at Tom's request ("update the plan"), from GitHub (`gh`, all three repositories), the review of UK Councils PR 64, the hosted runs of PR 105 (44119954638 and 44293231139), UK Councils `docs/DOSSIER-GATE.md` and the bodies of UK Councils PRs 67 and 68. The 18 November revision changed sections 1, 2, 3, 5, 6 and 7 and the lists under stage 2; the stage 1 colour brief, now finished work, was cut to a record line.

**This file is replaced, not appended to.** A session that changes the plan rewrites the part that changed, in its own pull request, as it does with `docs/STATE.md`. `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` is closed and kept as the record.

## 1. Where things stand

| Site | Main and live | Open |
|---|---|---|
| UK Council Tax | `ab2b0aa` (PR 112, league tables), 18 November. Merged that day: PR 105 (release gate), 107 (W4 part two), 111 (W9 council page), 110 (front doors), 109 (compare), 112 (league tables) | PR 108, documents only: the header and marks round, with the decisions of 19 November (D8 option B, D3 pair 2). The pull request that carries this revision |
| UK Councils | `60b0153` (PR 71, upkeep tooling), 18 November. Merged that day: PR 64 (seats and control), 65 and 66 (refresh), 67 (audit crosswalk), 68 (section 114 register), 69 (control line wording), 70 (audit status lines), 71 | None |
| Estate Kit | `v0.6.5` tagged (PR 30, palette B for UK Council Tax) | PR 27 (site header part), PR 28 (scrub report, draft) |

Restyle so far on UK Council Tax: W0 to W4, F1, W8, the front doors, W9 (English council pages), compare (W7) and the league tables are live. The site vendors kit 0.6.5.

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
| Done, 19 November | D3, the two marks: pair 2, the share of a pound for UK Council Tax and the locator for UK Councils | Both | Tom | Decided. M1 follows W5; Tom judges the roundel question before M1 is final |
| Early December, after the links rerun | Shepway slug to `folkestone-and-hythe`: five URLs, redirects on three sites | Three sites | Codex, one PR per site, Tom's yes each | Decided |
| 15 December | Remaining dossier scope decisions (section 5) | UKC | Tom | Defaults apply from 16 December |
| On hold | PSAA permission request: written permission to publish a per council table derived from its audit opinion data. Without it audit status reaches only the profiles on an MHCLG list (79 of 296 by the crosswalk) | UKC | Tom | Held by Tom on 18 November ("I don't want to send any permission requests yet"). Nothing is drafted or sent until he says so. The audit pages say PSAA data is not shown because its reuse terms have not been cleared |
| Mid January 2027 | Dossier builds from the three decided sources: all three live on 18 November. Seats and control (PR 64): 294 party tables, 129 control lines, 167 control lines held. Section 114 notices (PR 68): 11 inspected originals on 8 profiles. Audit status (PRs 67 and 70): MHCLG list lines on 79 profiles, a true absence reason on the other 217 | UKC | Done | Open: whether to show North Yorkshire's row (decision H2); the PSAA request is on hold; the rest of the dossier is the row below |
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
| 1 | W4 part two: reveal, end card with a canvas PNG, the drawer, neighbour cards | Claude (Opus), fast track | Live, PR 107, 18 November |
| 2 | Front doors: the `/tools/budget/` hub (band first, picker inside, Guess and Set pills) and the homepage row, with the three faults left from the W8 review | Claude (Opus), fast track | Live, PR 110, 18 November |
| 3 | W9 council page: ledger row under the H1, one button group, contents rail, record lines with one Sources block | Claude (Opus), fast track | Live, PR 111, 18 November |
| 4 | W5 header, drawer and footer, alone | Claude (Opus), Tom's yes | PR 113, opened 19 November at D8 option B with D7's footer links (UK Places and UK Food Hygiene, both checked live that day). Waits on Tom's yes to merge |
| 5 | W7 compare as bars (NV11): a worked example pair first, paired bars with table twins | Claude (Opus), Tom's yes | Live, PR 109, 18 November, on Tom's yes |
| 5a | League tables: the `/council-tax/ranked/` family and the towns league as designed tables, region tables in parts | Claude (Opus), fast track | Live, PR 112, 18 November. Not done: the change to which places lead the towns headline pair, which needs its own PR and Tom's yes |
| 6 | Tier 2 sweep, two PRs, mechanical: record lines and one Sources block, the chart pair, the title rule and page weight on the national page, band pages, increases, changes, precepts, Wales, 2027/28 and your area. No redesign | Codex, Claude reviews, Tom's yes | W9 merged, as the worked example. Removes four ratchet rows |
| UKC | U1 kit token route, then the UK Councils palette by the same round (one short session, the method exists by then), then U3 network band | Claude, Tom's yes | The UK Councils lane is free for these once the dossier pull requests merge |

Target: the must list live by the end of February, leaving three weeks before the freeze.

**Should land, if the must list is on time by the end of January:** M1 marks, pair 2, after W5 merges (PR 113 leaves the marks and favicon unchanged).

**Proposed on 18 November, each needs Tom's yes before it is planned:** a public coverage page on UK Councils (one table of what the site holds for each council and why anything is absent, from the gate report); a one line summary at the top of a UK Councils profile (control, and the next scheduled election) where both parts are built; a weekly check in the UK Councils refresh job that compares the live composition table's hash with the pin and opens an issue when it differs, changing no data.

**After the reversal:** W10 share cards on both sites; U4 the `/councils/` map lead; U5 the dossier page layout; D14 option b.

Sessions left on the restyle: W5 built (PR 113, waiting on Tom's yes) and the Tier 2 sweep (two PRs, brief to be written from W9's diff) in the must list; 3 on UK Councils; marks after W5 (D3 decided, pair 2); 4 parked. Tom is to judge the look of the hub, compare and the league tables on the live site; a second pass on any of them is a new row.

## 5. Decisions, one register

Taken on 16 November and recorded in `docs/DECISIONS-2026-11-16.md`: the narrow fast track; X3 stay private; X4; Shepway; seats source; audit identity; section 114 register; NV11; D2 paper tint; the reorganisation field stays held; D5, D13 and D14 at option (a); council control in the seats build. Also on 16 November, C1: palette **B, green and cream**, chosen by Tom from the colour round sheets (`docs/design/COLOUR-ROUND-2026-11.md`, pull request 103), taken as drawn, so B's cream paper `#f6f1e4` supersedes the D2 value.

Taken on 19 November and recorded in `docs/DECISIONS-2026-11-19.md`, each as recommended: D8 at option **B, lean** (Your bill, Budget game, Compare, More), which replaces the option (a) this register carried before the round in PR 108; D3 at **pair 2**, with one judgement left to Tom's eye before M1 is final; H2, show North Yorkshire's audit row with the name as printed; D10, one or two labelled presets; D7; D9; H1 stay held; E1 and M1, two reads and no threshold; D12; C7 and C9 out of the January scope; C2 dark first; D1; D6; E2 off.

Open, with my recommendation, a date and what happens on silence:

| Ref | Decision | Recommendation | Decide by | Default |
|---|---|---|---|---|
| R1 | Fast track when a reviewer's data rule finding has been fixed | Allow the merge once the same reviewer confirms the fix in the pull request and the PR is still layout only | Before the next such PR | Each such PR waits for Tom |

## 6. Prompts

1. Colour round (C0), kit 0.6.5 (K2), the swap (W8) and the front doors PR: written, `docs/PROMPTS-2026-11-16-COLOUR-AND-RESTYLE.md`, with the standing preamble every later prompt cites.
2. W4 part two and W9: written, `docs/PROMPTS-2026-11-16-W4-W9.md`.
3. Dossier builds A, B, C: written, `docs/PROMPTS-2026-11-16-DOSSIER-BUILDS.md`.
4. From 18 November build work goes to Opus 5.5 sessions on high effort started and managed from a Claude session, in place of Codex prompts (Tom, 18 November). Each brief names the files the other sessions own, and tells the session to leave the browser suites to the hosted checks and to take the build lock, because the Mac has 8 GB of memory. Dossier prompts B and C stage 1 ran in Codex earlier that day (UK Councils PRs 68 and 67).
5. Owed: the Tier 2 sweep brief, written when W9 merges, from W9's diff; the election schedule build, whose source is the UK Elections repository and so needs Tom's word first.

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
