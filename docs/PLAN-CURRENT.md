# Current plan | UK Council Tax and UK Councils | 18 November 2026

Revised in Claude Code on Monday 16 November 2026 at Tom's request ("focus on the restyle", "the colour theme is ugly"), from GitHub (`gh`, both repositories and estate-kit), the live site read in Chrome at 1440 px, the design check captures of PR 101, `src/styles/global.css`, Estate Kit 0.6.4 `generated/skins/ukcounciltax.css` and `docs/DESIGN-AUDIT-2026-11-15.md`. Nothing here authorises a merge, deployment or deletion.

Revised again on Tuesday 17 November 2026, after W8 went live, from GitHub (`gh`, all three repositories) and the step timings of hosted runs 43769524014 (15 November) and 44087295580 (17 November): sections 1, 2, 3, stage 2 of section 4, section 6 and rules 5 and 6 of section 7.

**This file is replaced, not appended to.** A session that changes the plan rewrites the part that changed, in its own pull request, as it does with `docs/STATE.md`. `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` is closed and kept as the record.

## 1. Where things stand

| Site | Main and live | Open |
|---|---|---|
| UK Council Tax | `4f7dc97` (PR 102); palette B live since `30706ef` (PR 104) on 17 November | The pull request that carries this revision (release gate in parallel jobs) |
| UK Councils | `f9139d4` (PR 64, seats by party and control), published 18 November | None |
| Estate Kit | `v0.6.5` tagged (PR 30, palette B for UK Council Tax) | PR 27 (site header part), PR 28 (scrub report, draft) |

Restyle so far on UK Council Tax: W0 to W3, F1, W4 part one and W8 are live. The site vendors kit 0.6.5.

## 2. What was wrong with the restyle, and what is still open

1. **Colour, fixed.** Until 17 November every restyle pull request was layout, and the planned token swap would have changed nothing in dark, the theme Tom's browser shows. The colour round (PR 103), kit 0.6.5 and W8 (PR 104) replaced the palette on every page at once. The detail of what was wrong is in the body of PR 102 and in `docs/design/COLOUR-ROUND-2026-11.md`. Three small faults from the W8 review are left and now belong to the front doors PR (section 4, stage 2).
2. **Each page is judged alone.** Every page pull request carries the same eight page reference sheet, dark first (section 7).
3. **The gates cost about an hour a pull request, and the cause is now measured.** Between the hosted runs of 15 and 17 November named at the top, the serial `site` job's browser steps grew from 12.0 to 20.0 minutes (`test:e2e` 8.5 to 14.7, `test:csp` 3.5 to 5.3), while the build fell from 3.7 to 2.4 minutes. The suite grew with the pages; the build did not slow. The pull request that carries this revision splits the gate into four jobs (section 3). W8 then took five hosted runs: two failed in the number diff and two in the browser suite. Rules 5 and 6 in section 7 answer that.
4. **Documents only merges are not free.** A push to main always runs the whole gate and publishes, by design (a newer push cancels a running release). The merges of PRs 103 and 102 on 17 November each ran a full release, 23 and 30 minutes, and no other merge may happen during one. Rule 6.
5. **The critical path was not getting sessions.** Every session of 16 and 17 November went to colour and pages, and UK Councils PR 64 waited two days for its review. It was reviewed and merged on 18 November; the dossier row in section 3 now leads.
6. **Measurement has no owner.** Week 1 is blank and each session without Chrome has passed it on. E1 asks for eight consecutive weekly rows before the reversal. It needs a named reader each Monday (decision M1 in section 5).
7. **Prompts repeat themselves.** A standing preamble carries the traps, gates and merge text once (`docs/PROMPTS-2026-11-16-COLOUR-AND-RESTYLE.md`).

## 3. Track A: dated work, in date order

| By | Work | Site | Who | State and what it waits on |
|---|---|---|---|---|
| Done, 18 November | Review of UK Councils PR 64 (seats by party and control): the pinned table matched the publisher's page on all 318 rows; one fix, the reason printed for a held control line; merged as `f9139d4` on Tom's yes | UKC | Claude | Live. Review in the pull request. Dossier prompts B and C can start |
| Now, then each Monday | `docs/MEASUREMENT.md`: Search Console and Cloudflare Web Analytics, with the read back of the 28 days to 14 November | Both | A Claude session with Chrome, or Tom (decision M1) | Week 1 figures blank; week 2 is due on 23 November |
| Now | Release gate in parallel jobs: `site` builds once, `unit` and three browser shards plus the CSP run go beside it, `publish` deploys the same tree only when all pass. Both test servers move below port 32768, out of the range the runner hands to outgoing connections. `npm run check:pr-body` reads a description the way the hosted checks do | UKCT | Claude, Tom's yes | In the pull request that carries this revision. The time saved is not known until its own hosted run is read |
| Now | "Refresh data" restores the pinned RA workbooks (the scheduled run failed again on 16 November) | UKC | Codex or Claude, one small PR | Not started |
| Done, 16 November | C1, the palette: B, green and cream, chosen from the colour round sheets | UKCT | Tom | Decided. K2 and W8 follow (section 4) |
| 1 to 5 December | Council links rerun (prompt 6 of 15 November). Every build fails from 4 January 2027 without it | Both | Codex | Prompt written |
| 4 December | D3, the two marks, drawn in the chosen palette | Both | Claude draws candidates, Tom chooses | Moved from 1 December so the marks follow the palette |
| Early December, after the links rerun | Shepway slug to `folkestone-and-hythe`: five URLs, redirects on three sites | Three sites | Codex, one PR per site, Tom's yes each | Decided |
| 15 December | Remaining dossier scope decisions (section 5) | UKC | Tom | Defaults apply from 16 December |
| Mid January 2027 | Dossier builds from the three decided sources: seats and control (prompt A, live since PR 64: 294 party tables, 129 control lines, 167 control lines held), then audit status (prompt B), then section 114 notices (prompt C) | UKC | Codex builds, Claude reviews, Tom's yes for each data PR | **The critical path.** Prompts B and C are next. The composition snapshot is dated 16 November and has no refresh date yet |
| Mid January 2027 | Smaller dossier gaps: election schedule built on 174 of 296, school holidays on 287, service links on 272, published payments on 234 (`DOSSIER-GATE.md`, measured 15 November) | UKC | Codex | The links rerun lifts the service links row |
| When the report lands | C6b: referendum principles 2027/28 for the set pages and release records | UKCT | Claude | C6 staging is live since PR 88 |
| First week of March 2027 | Burnley scenario game refresh, after the February budget papers | UKCT | Codex | Prompt owed once the budget council date is published |
| 20 March 2027 | Freeze until the levels day release | Both | | |
| Late March 2027 | Levels day release, runbook in `docs/D5-BUDGET-SEASON-2027.md` | UKCT | Claude with Tom | Staged |
| May to June 2027 | The reversal, gated on the dossier and on the measurement record | Both | Tom's decision | |

## 4. Track B: the restyle

Lanes: one UK Council Tax page session at a time; the colour lane beside it (it touches the kit and the token block, not page templates, until its one swap PR); at most one data session; one UK Councils session. Every page PR reuses the F1 parts (`DeskBand`, `RecordLine`, `PageSources`, `formatMoney`) and lowers its row in the `foundation.mjs` ratchet.

### Stage 1: colour, starting now

| Step | Work | Who | Output | By |
|---|---|---|---|---|
| C0, done 16 November | Colour round. Three candidate palettes as token overrides, rendered on the eight reference pages in dark and light at 390 and 1440, with a contrast table. No site code changes | Claude, one session | A docs PR with the sheets and the values; Tom picks one (decision C1) | 20 November |
| K2, done 17 November | Estate Kit 0.6.5: the chosen values in `skins.sites.ukcounciltax` for both themes (paper, ink and neutrals, accent roles, desk, the bill bar series), through `derive-desk.mjs` and the kit colour gates | Claude, Tom's yes and tag | Kit PR | Merged as `26847ee`, tagged `v0.6.5` |
| W8, done 17 November | The swap on UK Council Tax: vendor 0.6.5, extend `apply-brand.py` to splice the skin block, bring `palette.ts` and the share card into line. Values only: no template changes | Claude, Tom's yes | One PR, every page, full browser suite and the reference sheet | Pull request 104 merged as `30706ef` and published 17 November, with four agreed band colour fixes in page files |

What the round must fix, as a brief for all three candidates:

1. **Dark is the first theme judged**, not a derivative of light. Each candidate sets dark paper, ink and desk on purpose.
2. **Give the accent roles.** A deep value for surfaces, a text value for links, one highlight for the second headline tone and focus. `--accent` and `--accent-bright` stop being the same colour in dark.
3. **One dark green, not three.** The desk is a saturated deep green that reads as a surface (the kit ramp already has the range, `--ramp-3` to `--ramp-5`), and the postcode panel and map card use it or the card colour.
4. **Neutrals in the same temperature as the paper.**
5. **The bill bar in the site's own colours**: the billing council's share in the accent, the other bodies in a related neutral ramp, neighbours held apart by the kit's 3:1 gate or by separators.
6. **State colours unchanged in meaning** and never confusable with a brand colour; every state keeps its text label.

The three candidates, as directions (values come from the round, contrast gated, never from this file):

| Candidate | Idea | Risk |
|---|---|---|
| A, deep green ledger | One hue, done properly: green black ground in dark, a rich green desk, mint kept only for the highlight, warmer neutrals | May still read as one note |
| B, green and one warm colour | A, plus a single warm second colour for the primary action, the current step and the highlighted bar, so the eye has one place to go | The warm colour must stay clear of the warning and critical states |
| C, ink and paper | Charcoal bands and warm paper; green retreats to money (figures, the council's own share, the mark) | Nearest to a broadsheet data page; least distinct from UK Councils if the charcoal drifts blue |

My recommendation before seeing them drawn is B. It is a view, not a finding: the sheet decides.

### Stage 2: pages that must land before 20 March

| Order | Work | Who | Waits on |
|---|---|---|---|
| 1 | W4 part two: reveal (twin waffles, dot plot, gap bars, one table twin), the end card with a canvas PNG, the unreadable score link message, "Behind the numbers" with every reference table in one drawer, neighbour cards with Guess and Set | Claude (Opus), fast track | In its pull request, opened 18 November with every gate reported in its body. Merges under the fast track only if all five conditions hold |
| 2 | Front doors, one PR: the `/tools/budget/` hub (band first, picker inside, Guess and Set pills per row) and the homepage row (bill card trimmed to bar, legend and one record line; England average, change and line chart in one row; map thumb from the real outline). It also takes the three faults left from the W8 review: `data-ground="desk"` on the band; in light, the map thumb's third shade and the Band D line's hovered point are cream on cream; the share card logo square merges into the ground. A fault that needs a new colour value goes to the kit (rule 4) | Claude, fast track if it stays layout only | W4 part two merged |
| 3 | W9 council page: ledger row under the H1, one bands chart, short record lines | Claude (Opus), fast track | Prompt written |
| 4 | W5 header, drawer and footer, alone | Claude, Tom's yes | D8 |
| 5 | Tier 2 sweep, two PRs, mechanical: record lines and one Sources block, the chart pair, the title rule and page weight on the national page, band pages, increases, changes, precepts, Wales, 2027/28 and your area. No redesign | Codex, Claude reviews, Tom's yes | W9 merged, as the worked example. Removes four ratchet rows |
| UKC | U1 kit token route, then the UK Councils palette by the same round (one short session, the method exists by then), then U3 network band | Claude, Tom's yes | K2 for U1; nothing for U3 |

Target: the must list live by the end of February, leaving three weeks before the freeze.

**Should land, in this order, if the must list is on time by the end of January:** towns follow up (larger places lead the headline pair; region pages under 500 KB; Tom's yes); `/council-tax/ranked/`; W7 compare as bars for fixed pairs (NV11); M1 marks after D3.

**After the reversal:** W10 share cards on both sites; U4 the `/councils/` map lead; U5 the dossier page layout; D14 option b.

Sessions left on the restyle: 5 pages in the must list, 3 on UK Councils, 4 in the should list, 4 parked. The three colour sessions are done.

## 5. Decisions, one register

Taken on 16 November and recorded in `docs/DECISIONS-2026-11-16.md`: the narrow fast track; X3 stay private; X4; Shepway; seats source; audit identity; section 114 register; NV11; D2 paper tint; the reorganisation field stays held; D5, D13 and D14 at option (a); council control in the seats build. Also on 16 November, C1: palette **B, green and cream**, chosen by Tom from the colour round sheets (`docs/design/COLOUR-ROUND-2026-11.md`, pull request 103), taken as drawn, so B's cream paper `#f6f1e4` supersedes the D2 value.

Open, with my recommendation, a date and what happens on silence:

| Ref | Decision | Recommendation | Decide by | Default |
|---|---|---|---|---|
| M1 | Who reads the measurement figures each Monday | A scheduled Monday session with Chrome connected, and Tom reads it in any week that session cannot | 23 November | The row stays blank and E1's eight weeks start later |
| C2 | Which theme leads | Dark is captured and judged first on every sheet; both must pass | With C1 | Dark first |
| R1 | Fast track when a reviewer's data rule finding has been fixed | Allow the merge once the same reviewer confirms the fix in the pull request and the PR is still layout only | Before the next such PR | Each such PR waits for Tom |
| D8 | Header structure | (a) four menus plus "Find my bill" | 30 November | W5 waits |
| D3 | Marks | (a) distinct marks, drawn in the chosen palette. The accent half of D3 is now C1 | 4 December | Shared glyph stays; M1 dropped from this season |
| D10 | Presets on the set page | (a) one or two, labelled as user requested scenarios | 15 December | None |
| D12 | Canonical status of rebuilt pages | (a) keep canonical to UK Councils until the reversal | 15 December | (a) |
| E1 | What the reversal needs from the measurement record | No numeric threshold; eight weekly rows, the canonical sample matching, and the 28 days before set beside the 28 days after | 15 December | Rows kept, no conclusion drawn |
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
4. Owed: the UK Councils "Refresh data" fix (small enough to brief in the PR title); the Tier 2 sweep, written when W9 merges, from W9's diff.

## 7. Working rules

Kept: a separate reviewer for any PR that adds pages, data or shared logic. Merge as its own step after reading `gh pr checks`. No merge during a deploy. Tom's yes in words for data, new page families, navigation, tokens, the dossier, the registry, held fields and Codex PRs.

New from this revision:

1. **The reference sheet.** Every page PR captures the same eight pages, dark first then light, at 390 and 1440: `/`, `/tools/budget/`, `/tools/budget/trafford/`, `/tools/budget/trafford/set/`, `/councils/pendle/`, `/council-tax/`, `/council-tax/towns/`, `/compare/`. The list lives in `docs/design/reference-pages.txt`, created by the colour round. The PR's own pages are captured as well. Tom reads one sheet and sees the site, not a page.
2. **Gate once.** Full local gates run on the final head only. Review findings are fixed together and pushed once, so a PR costs two hosted runs, not five.
3. **Family sized PRs.** Where two changes share one "Pages allowed to differ" glob and one reviewer can hold both, they are one PR (the front doors, the Tier 2 sweep). A PR that needs Tom's yes is never bundled with one that does not.
4. **No colour in a page PR.** A page PR that needs a new colour stops and asks the kit; values arrive only through `apply-brand.py`.
5. **Check the description before it is opened or edited.** Write the body to a file and run `npm run check:pr-body -- body.md` (or `-- --pr <number>` on an open one). It uses the hosted parser, so a missing fenced block or an allowed glob written as a URL fails here in a second, not in the number diff after a hosted run. Every edit to a description starts a new hosted run, so edit once.
6. **Documents ride with the work.** `docs/STATE.md`, this file and prompts change inside the page or data pull request they describe. A pull request of documents alone is for a decision record or a plan revision Tom asked for, and it merges when no release is running and none is about to start.

Dates and figures in this file are restated from the documents named at the top; check GitHub before relying on a state line.
