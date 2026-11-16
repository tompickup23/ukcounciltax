# Current plan | UK Council Tax and UK Councils | 16 November 2026

Written in Claude Code on Monday 16 November 2026 at Tom's request, from GitHub (`gh`, both repositories and estate-kit), the two `docs/STATE.md` files, plan sections 10 and 11, `docs/DECISIONS-2026-11-16.md`, `docs/DESIGN-AUDIT-2026-11-15.md` and UK Councils `docs/DOSSIER-GATE.md`. Nothing here authorises a merge, deployment or deletion.

**This file is replaced, not appended to.** A session that changes the plan rewrites the part that changed, in its own pull request, as it does with `docs/STATE.md`. `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` is closed and kept as the record of how each choice was reached.

## 1. Where things stand

| Site | Main | Live | Open |
|---|---|---|---|
| UK Council Tax | `d5670a2` (PR 97, F1 foundation) | Published 16 November: PRs 94 to 98, with towns pages, the W2 set page and F1 | PR 99, W3 set page |
| UK Councils | `456a200` (PR 63, U2 homepage) | Published 16 November: PR 62 (dossier gate) and PR 63 | None |
| Estate Kit | | | PR 27 (site header part), PR 28 (scrub report, draft) |

Decided on 16 November and not yet acted on: the seats source, the audit identity method and the section 114 register (all three unblock dossier builds on UK Councils); Estate Kit stays private, which unblocks K1 and the gates pack.

## 2. What was wrong with the plan, and what changes

1. **The dated work had no slot.** The order in the old section 11.7 was the restyle, step by step. The UK Councils dossier, which gates the reversal and is due by mid January 2027, appeared only as "UKC lane". Three of its sources were decided on 16 November and no session was assigned to build them. This plan orders by binding date first (section 3) and treats the restyle as the second track (section 4).
2. **Measurement never started.** The reversal is gated on Search Console evidence before and after. The audit's P0 called for `docs/MEASUREMENT.md` on both sites and a 14 day baseline before W1 landed. Neither file exists, although UK Councils `docs/STATE.md` cites one. W0, W1, W2, the towns pages and U2 are already live, so a clean baseline for those is gone; `docs/SEARCH-CONSOLE-2026-11-12.md` is the only earlier record. The old plan also dated the start "Monday 17 November"; 17 November 2026 is a Tuesday. Start it now and say plainly what the baseline can no longer show.
3. **Two faults in the checks cost time on every pull request.** PR 99's `site` check failed on 16 November because the port for the actual CSP run (48788) was already in use on the runner, not because a test failed; the rerun takes about 19 minutes and a failed check stops the fast track. The UK Councils weekly "Refresh data" run failed on 16 November because `tests/budget.test.ts` reads `data/raw/RA_2026-27_data_Part_1.ods`, which that workflow does not restore. Both get a small fix before more page work.
4. **Decisions lived in five places.** Plan 10.3, plan 11.8, the decisions note, the audit's D1 to D14 and the UK Councils gate file. Section 5 is now the one register. Each row has a decide by date and a default, so silence still moves the plan.
5. **The plan was eleven appended updates, 364 lines, read "later wins".** Every session paid to read all of it. This file is one page and is replaced.
6. **Codex waits on prompts.** W4 to W10 have none, and the dossier builds have none. A lane is only running if its next prompt is written before the current pull request merges. Section 6 lists the prompts owed.
7. **A fixed finding still blocks the fast track.** PR 99 is layout only and was held because a reviewer marked a data rule breach that was then fixed. Recommendation R1 in section 5 closes that without weakening the control.
8. **No cut line before the freeze.** About sixteen page and token pull requests were queued for the eighteen weeks to 20 March with the holidays inside them, with equal weight. Section 4 sorts them into must, should and after the reversal.

## 3. Track A: dated work, in date order

| By | Work | Site | Who | State and what it waits on |
|---|---|---|---|---|
| Now | `docs/MEASUREMENT.md` on both sites: the measures in the audit's P0, the first weekly note, and a statement of what was already live when measuring began | Both | Claude, docs PR per site | Not started. Waits on nothing |
| Now | CSP run port fix; "Refresh data" restores the pinned RA workbooks | UKCT; UKC | Codex or Claude, one small PR each | Not started. Waits on nothing |
| 1 December | D3, the two marks, chosen from candidates | Both | Claude draws candidates, Tom chooses | Candidates not drawn |
| 1 to 5 December | Council links rerun (prompt 6 of 15 November). Every build fails from 4 January 2027 without it | Both | Codex | Prompt written |
| Early December, after the links rerun | Shepway slug to `folkestone-and-hythe`: five URLs, redirects on three sites | Three sites | Codex, one PR per site, Tom's yes each | Decided |
| 15 December | Remaining dossier scope decisions (section 5) | UKC | Tom | Defaults apply from 16 December |
| Mid January 2027 | Dossier builds from the three decided sources: seats by party and control (Open Council Data snapshot, CC BY-SA); audit status (exact name join plus a reviewed list); section 114 original notices (non exhaustive register). Measured on 15 November in `DOSSIER-GATE.md`: each is built on 0 of 296 profiles | UKC | Codex builds, Claude reviews, Tom's yes for each data PR | Decided 16 November. No prompt yet. **This is the critical path** |
| Mid January 2027 | Smaller dossier gaps, same file: election schedule built on 174 of 296, school holidays on 287, service links on 272, published payments on 234 | UKC | Codex | The links rerun lifts the service links row |
| When the report lands | C6b: referendum principles 2027/28 for the set pages and release records | UKCT | Claude | C6 staging is live since PR 88 |
| First week of March 2027 | Burnley scenario game refresh, after the February budget papers | UKCT | Codex | Prompt owed once the budget council date is published |
| 20 March 2027 | Freeze until the levels day release | Both | | |
| Late March 2027 | Levels day release, runbook in `docs/D5-BUDGET-SEASON-2027.md` | UKCT | Claude with Tom | Staged |
| May to June 2027 | The reversal, gated on the dossier and on the measurement record | Both | Tom's decision | |

The dossier gate is enforced in the UK Councils build today, and a held absence with a stated reason passes it. So the question for January is not whether the gate passes but how much of each profile is built. The three decided sources are the difference between a dossier and a page of stated absences.

## 4. Track B: the restyle, with a cut line

One UK Council Tax page session at a time, at most one data session beside it, one UK Councils session beside those, and the kit lane separate. Every page PR reuses the F1 parts (`DeskBand`, `RecordLine`, `PageSources`, `formatMoney`) and lowers its row in the `foundation.mjs` ratchet.

**Must land before 20 March**

| Order | Work | Who | Waits on |
|---|---|---|---|
| 1 | PR 99, W3 set page | Built; Tom's yes | The rerun of its `site` check |
| 2 | `/tools/budget/` hub: band first with the picker inside, Guess and Set pills per row | Claude, fast track | PR 99 merged |
| 3 | W4 game page, two PRs | Codex, Claude reviews | Prompt owed; D5 and D13 |
| 4 | W9 council page: ledger row under the H1, one bands chart, short record lines | Codex, Claude reviews | Prompt owed |
| 5 | W5 header, drawer and footer, alone | Claude, Tom's yes | D8 |
| Kit | K1 (paper, desk, hero step, icons), then W8 and U1 as token swaps | Claude, Tom's yes | Nothing since X3 was settled |
| UKC | U3 council page network band | Claude, Tom's yes | Nothing; it runs beside the dossier builds |

**Should land, in this order, if the must list is on time by the end of January**

Towns follow up (larger places lead the headline pair; region pages under 500 KB; Tom's yes); `/council-tax/ranked/`; W7 compare as bars for fixed pairs (settled as NV11 on 16 November, so audit D4 is closed at option b); the homepage row from the old section 11.4, which no step in the old order carried; M1 marks after D3; Tier 2 pages (increases, precepts, Wales, 2027/28, your area).

**After the reversal**

W10 share cards on both sites; U4 the `/councils/` map lead; U5 the dossier page layout; D14 option b.

## 5. Decisions, one register

Taken on 16 November and recorded in `docs/DECISIONS-2026-11-16.md`: the narrow fast track; X3 stay private; X4; Shepway; seats source; audit identity; section 114 register; NV11; D2 paper tint; the reorganisation field stays held.

Open, with my recommendation, a date and what happens on silence:

| Ref | Decision | Recommendation | Decide by | Default |
|---|---|---|---|---|
| R1 | Fast track when a reviewer's data rule finding has been fixed | Allow the merge once the same reviewer confirms the fix in the pull request and the PR is still layout only | With PR 99 | Each such PR waits for Tom |
| D8 | Header structure | (a) four menus plus "Find my bill" | 30 November | W5 waits |
| D3 | Marks and accent | (a) distinct marks, accents kept | 1 December | Shared glyph stays; M1 dropped from this season |
| D5 | Slim the game page inside W4 | (a) yes | With the W4 prompt | Not slimmed |
| D13 | Game round one start state | (a) keep rows at zero | With the W4 prompt | (a) |
| D10 | Presets on the set page | (a) one or two, labelled as user requested scenarios | 15 December | None |
| D12 | Canonical status of rebuilt pages | (a) keep canonical to UK Councils until the reversal | 15 December | (a) |
| C7 | Dossier: additional body types | Out of the January scope | 15 December | Out of scope, absence stated |
| C9 | Dossier: contracts | Out of the January scope | 15 December | Out of scope, absence stated |
| D1 | Display and record faces | (a) estate faces only | With K1 | (a) |
| D6 | Links with the tompickup.co.uk games | (a) none | Any time | None |
| D7 | UK Food Hygiene and UK Places links | (a) footers once each URL is verified live | With W5 | Held |
| D9 | UK Councils compare page | (a) keep canonical, add an example pair | Any time | As is |
| D14 | Shareable game results | (a) PNG download only | With W4 | Not built |

## 6. Prompts owed

Written before the lane's current PR merges, so no lane idles:

1. UK Councils dossier builds: one prompt per source (seats, audit status, section 114), each a data PR with a dry run file first. Owed now.
2. W4 game page, part one. Owed now.
3. W9 council page. Owed when W4 part one opens.
4. K1 kit release. Owed now.
5. The two check fixes in section 3. Owed now; small enough to brief in the PR title.

## 7. Working rules that stay

A separate reviewer for any PR that adds pages, data or shared logic. Merge as its own step after reading `gh pr checks`. No merge during a deploy. Tom's yes in words for data, new page families, navigation, tokens, the dossier, the registry, held fields and Codex PRs. A contact sheet in every page PR. Dates and figures in this file are restated from the documents named at the top; check GitHub before relying on a state line.
