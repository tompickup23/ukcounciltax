# Current plan | UK Council Tax and UK Councils | 16 November 2026, evening

Revised in Claude Code on Monday 16 November 2026 at Tom's request ("focus on the restyle", "the colour theme is ugly"), from GitHub (`gh`, both repositories and estate-kit), the live site read in Chrome at 1440 px, the design check captures of PR 101, `src/styles/global.css`, Estate Kit 0.6.4 `generated/skins/ukcounciltax.css` and `docs/DESIGN-AUDIT-2026-11-15.md`. Nothing here authorises a merge, deployment or deletion.

**This file is replaced, not appended to.** A session that changes the plan rewrites the part that changed, in its own pull request, as it does with `docs/STATE.md`. `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` is closed and kept as the record.

## 1. Where things stand

| Site | Main and live | Open |
|---|---|---|
| UK Council Tax | `5a76109` (PR 101, W4 part one, game page), published 16 November | 102 (this plan), 103 (colour round), 104 (W8 palette swap, draft) |
| UK Councils | `456a200` (PR 63, U2 homepage) | PR 64, draft: seats by party and control (dossier prompt A), checks passed, not yet reviewed |
| Estate Kit | `v0.6.5` tagged (PR 30, palette B for UK Council Tax) | PR 27 (site header part), PR 28 (scrub report, draft) |

Restyle so far on UK Council Tax: W0 to W3, F1 and W4 part one are live. UK Council Tax still vendors kit 0.6.3, so none of K1 is on the site.

## 2. What is wrong with the restyle, and what changes

1. **The colours have not changed at all, and the planned swap would not change what Tom sees.** Every restyle pull request so far is layout. The colour work was two late rows ("K1, then W8 as token swaps"). Checked against the files:
   - The site follows the system theme, and Chrome on this Mac shows it dark. The K1 skin's dark paper is `#0f1317`, the same value as the live `--bg`. Its dark desk (`#2a3e36`) was derived to match the live band on purpose (kit changelog 0.6.4: "the band keeps its colours when it moves onto the kit"). So W8 as written changes the light page from white to `#f8f7f2` and changes nothing visible in dark.
   - In dark, `--accent` and `--accent-bright` are both `#94d7b5`. One pastel mint is the link, the button, the eyebrow, the second headline tone, the rule, the focus ring and the chart highlight.
   - The dark desk is that mint at 26 per cent over near black, which gives a grey sage. The homepage stacks three different dark greens: the postcode panel, the budget band and the map card.
   - The neutrals are cool blue greys (`#0f1317`, `#171c21`, `#545c63`) beside a green accent and, in light, a warm paper.
   - The bill bar, which the audit names as the site's signature, is drawn in blue, orange, purple and magenta (`--series-1` to `--series-4`), unrelated to anything else on the page. The audit's rule (the council's own share in the accent, other bodies muted) was never built.
   - The mockup round (audit P1) was dropped on 16 November as a gate for the bands. That was right for layout, and it is why nobody has looked at the palette as a whole.
2. **Colour is the cheapest change on the site and was scheduled as if it were the dearest.** No component or page holds a colour: every value is a token in `global.css` (a search for hex values outside the token block finds none). A new palette is one kit release and one values only pull request, it reaches all 1,749 pages at once, and no page pull request has to be redone after it. So it moves to the front and runs beside the page lane (section 4, stage 1).
3. **Each page is judged alone.** Plan 11.3 found four versions of the dark band for this reason. Every page pull request now carries the same eight page reference sheet, dark first (section 7).
4. **The gates cost about an hour a pull request and the cost is rising.** The `site` check took 19 to 22 minutes for W0, W1 and F1 and 32 to 33 minutes for W4 part one. W3 took seven commits, one cancelled run and one run of 86 minutes with its rerun. Fewer pushes and fewer, family sized pull requests matter more than faster sessions.
5. **Work with no owner.** The homepage row from the old section 11.4 was in no step. Six Tier 2 pages were queued as six design sessions, though what they need is mostly mechanical (record lines, one Sources block, the chart pair, weight). Both are absorbed in section 4.
6. **Prompts repeat themselves.** About half of the W4 and W9 prompts is the same traps, gates and merge text. A standing preamble now carries it once (`docs/PROMPTS-2026-11-16-COLOUR-AND-RESTYLE.md`).

## 3. Track A: dated work, in date order

| By | Work | Site | Who | State and what it waits on |
|---|---|---|---|---|
| Now, then each Monday | `docs/MEASUREMENT.md`: Search Console and Cloudflare Web Analytics, with the read back of the 28 days to 14 November | Both | A Claude session with Chrome, or Tom | Week 1 figures blank |
| Now | CSP run port fix, with a look at why the `site` check grew from about 20 to about 32 minutes; "Refresh data" restores the pinned RA workbooks (it failed again on 16 November) | UKCT; UKC | Codex or Claude, one small PR each | Not started. The port clash can trip the fast track on any PR |
| Done, 16 November | C1, the palette: B, green and cream, chosen from the colour round sheets | UKCT | Tom | Decided. K2 and W8 follow (section 4) |
| 1 to 5 December | Council links rerun (prompt 6 of 15 November). Every build fails from 4 January 2027 without it | Both | Codex | Prompt written |
| 4 December | D3, the two marks, drawn in the chosen palette | Both | Claude draws candidates, Tom chooses | Moved from 1 December so the marks follow the palette |
| Early December, after the links rerun | Shepway slug to `folkestone-and-hythe`: five URLs, redirects on three sites | Three sites | Codex, one PR per site, Tom's yes each | Decided |
| 15 December | Remaining dossier scope decisions (section 5) | UKC | Tom | Defaults apply from 16 December |
| Mid January 2027 | Dossier builds from the three decided sources: seats and control (prompt A, PR 64 draft: 294 party tables, 129 control lines, 167 control labels held), then audit status (prompt B), then section 114 notices (prompt C) | UKC | Codex builds, Claude reviews, Tom's yes for each data PR | **The critical path.** PR 64 needs its review next |
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
| W8, started | The swap on UK Council Tax: vendor 0.6.5, extend `apply-brand.py` to splice the skin block, bring `palette.ts` and the share card into line. Values only: no template changes | Claude, Tom's yes | One PR, every page, full browser suite and the reference sheet | Draft pull request 104, gates owed. Live by 30 November |

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
| 1 | W4 part two: reveal, result card, PNG, the drawer | Claude (Opus), fast track | Nothing. Prompt in `docs/PROMPTS-2026-11-16-W4-W9.md` |
| 2 | Front doors, one PR: the `/tools/budget/` hub (band first, picker inside, Guess and Set pills per row) and the homepage row (bill card trimmed to bar, legend and one record line; England average, change and line chart in one row; map thumb from the real outline) | Claude, fast track if it stays layout only | W4 part two merged |
| 3 | W8, the colour swap (stage 1) | Claude, Tom's yes | C1 and K2. Slots between page PRs, never beside one |
| 4 | W9 council page: ledger row under the H1, one bands chart, short record lines | Claude (Opus), fast track | Prompt written. After W8 if W8 is ready, so its sheet is judged in the final colours |
| 5 | W5 header, drawer and footer, alone | Claude, Tom's yes | D8 |
| 6 | Tier 2 sweep, two PRs, mechanical: record lines and one Sources block, the chart pair, the title rule and page weight on the national page, band pages, increases, changes, precepts, Wales, 2027/28 and your area. No redesign | Codex, Claude reviews, Tom's yes | W9 merged, as the worked example. Removes four ratchet rows |
| UKC | U1 kit token route, then the UK Councils palette by the same round (one short session, the method exists by then), then U3 network band | Claude, Tom's yes | K2 for U1; nothing for U3 |

Target: the must list live by the end of February, leaving three weeks before the freeze.

**Should land, in this order, if the must list is on time by the end of January:** towns follow up (larger places lead the headline pair; region pages under 500 KB; Tom's yes); `/council-tax/ranked/`; W7 compare as bars for fixed pairs (NV11); M1 marks after D3.

**After the reversal:** W10 share cards on both sites; U4 the `/councils/` map lead; U5 the dossier page layout; D14 option b.

Sessions left on the restyle: 3 for colour, 6 pages in the must list, 3 on UK Councils, 4 in the should list, 4 parked. The old plan had 7 must and 6 should and did not include a palette at all.

## 5. Decisions, one register

Taken on 16 November and recorded in `docs/DECISIONS-2026-11-16.md`: the narrow fast track; X3 stay private; X4; Shepway; seats source; audit identity; section 114 register; NV11; D2 paper tint; the reorganisation field stays held; D5, D13 and D14 at option (a); council control in the seats build. Also on 16 November, C1: palette **B, green and cream**, chosen by Tom from the colour round sheets (`docs/design/COLOUR-ROUND-2026-11.md`, pull request 103), taken as drawn, so B's cream paper `#f6f1e4` supersedes the D2 value.

Open, with my recommendation, a date and what happens on silence:

| Ref | Decision | Recommendation | Decide by | Default |
|---|---|---|---|---|
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
4. Owed: the two check fixes (small enough to brief in the PR title); the Tier 2 sweep, written when W9 merges, from W9's diff.

## 7. Working rules

Kept: a separate reviewer for any PR that adds pages, data or shared logic. Merge as its own step after reading `gh pr checks`. No merge during a deploy. Tom's yes in words for data, new page families, navigation, tokens, the dossier, the registry, held fields and Codex PRs.

New from this revision:

1. **The reference sheet.** Every page PR captures the same eight pages, dark first then light, at 390 and 1440: `/`, `/tools/budget/`, `/tools/budget/trafford/`, `/tools/budget/trafford/set/`, `/councils/pendle/`, `/council-tax/`, `/council-tax/towns/`, `/compare/`. The list lives in `docs/design/reference-pages.txt`, created by the colour round. The PR's own pages are captured as well. Tom reads one sheet and sees the site, not a page.
2. **Gate once.** Full local gates run on the final head only. Review findings are fixed together and pushed once, so a PR costs two hosted runs, not five.
3. **Family sized PRs.** Where two changes share one "Pages allowed to differ" glob and one reviewer can hold both, they are one PR (the front doors, the Tier 2 sweep). A PR that needs Tom's yes is never bundled with one that does not.
4. **No colour in a page PR.** A page PR that needs a new colour stops and asks the kit; values arrive only through `apply-brand.py`.

Dates and figures in this file are restated from the documents named at the top; check GitHub before relying on a state line.
