# Decisions | 19 November 2026

Tom was given the open rows of `docs/PLAN-CURRENT.md` section 5 in chat on 19 November 2026, each with a recommended option, its reason, its date and its default. The list closed with the line that agreeing would record them and start W5. His reply was "Sounds great". Every row below is taken on that reply, as recommended. Each is reversible by Tom. Where this note differs from an earlier one, this note is the later record.

## 1. Taken, with work that follows

| Ref | Taken | Next step |
|---|---|---|
| D8, header structure | **Option B, lean:** Your bill, Budget game, Compare, More (`docs/design/header-round/option-b.html`). This replaces option (a), four menus plus "Find my bill", which the plan carried before the round was drawn | W5 starts: three links, one "More" panel, the drawer and the four column footer. Navigation is outside the fast track, so the W5 pull request merges on Tom's yes |
| D3, marks | **Pair 2:** the share of a pound for UK Council Tax, the locator for UK Councils (`docs/design/marks/pair-2-*.svg`). Pair 1 is the fallback | M1 may start after W5: the Estate Kit brand route, then one small pull request per site, each with Tom's yes before deploy. One judgement stays with Tom's eye before M1 is final: whether the UK Councils ring and dot reads too close to a roundel (the round's own caveat) |
| H2, North Yorkshire's audit row | **Show it** on the North Yorkshire profile, with the name as printed on the 13 December 2024 MHCLG list. Basis: SI 2022/328, articles 2 and 3, under which North Yorkshire Council is the same council continuing under a new name from 1 April 2023 | One data pull request on UK Councils, Tom's yes to merge. The audit part moves from 79 profiles to 80 and the absences from 217 to 216; the pull request states the counts it measures |
| D10, presets on the set page | **One or two,** labelled as user requested scenarios, with visible assumptions and model version | A brief is needed before any build; which presets is a further choice for Tom |
| D7, UK Food Hygiene and UK Places links | **Footers,** once each URL is verified live | Rides with W5 |
| D9, UK Councils compare page | **Keep canonical, add an example pair** | A small UK Councils pull request, not yet scheduled |

## 2. Taken, no work follows

| Ref | Taken |
|---|---|
| H1, the held control labels on UK Councils | Stay held. One is printed only where that council's own statement is pinned as a second source |
| E1 and M1, measurement | No numeric threshold and no weekly rows. Search Console is read once for the 28 days before the reversal and once for the 28 days after, with the canonical sample matching; Cloudflare page views are read in the same two windows. The reads are made by a Claude session with Chrome or by Tom |
| D12, canonical status of rebuilt pages | Canonical to UK Councils until the reversal |
| C7 and C9, dossier: other body types and contracts | Out of the January scope, absence stated |
| C2, which theme leads | Dark is captured and judged first on every sheet; both must pass |
| D1, display and record faces | Estate faces only |
| D6, links with the tompickup.co.uk games | None |
| E2, analytics beacon on the set pages | Off; Search Console is used for `/set/` URLs |

## 3. Not taken

**R1** (fast track when a reviewer's data rule finding has been fixed) is left open. It widens what may merge and publish without Tom, and on 16 November it was held back from a general instruction for that reason. A short reply to a long list is not treated as the yes for it. Until Tom says so in words, each such pull request waits for him.
