# Handover | review of the six sessions, PR 48, quick wins and the plan | 12 November 2026

Written in Claude Code at Tom's request. It follows `docs/HANDOFF-2026-11-12-SESSIONS-COMPLETE.md` (Codex's archive note of the same day) and `docs/HANDOFF-2026-11-11-MERGES-AND-PROMPTS.md`. Nothing here authorises a merge, tag or deployment.

## 1. What is live

All six prompts in `docs/CODEX-PROMPTS-2026-11-11.md` are merged and deployed. Each was checked against the live site by request on 12 November 2026.

| Prompt | Pull request | Merge |
|---|---|---|
| 1. Local links | ukcounciltax 58 | 34564c5 |
| 2. Local links | ukcouncils 46 | c477d8f |
| 3. Typed search (NV4) | ukcounciltax 59 | 6e6be4b |
| 4. Compare improvements | ukcounciltax 60 | bcb5a92 |
| 5. Picker on the councils index (NV1, NV3) | ukcouncils 47 | 844bb93 |
| 6. Chart image weight (W4) | ukcounciltax 62 | e4ef251 |

Also merged: ukcounciltax 51 (CI speed) and 56 (picker on a phone, W7).

**UK Councils PR 48** (Estate Kit 0.5.0, short citations, homepage chart and thumbnails, header from 25 links to 18) merged on Tom's word as 9c2b356 on 12 November 2026 and deployed. A review pass went in first (1af118f):

1. The page opens the closed source drawer itself when a short citation is used, because only some browsers open a closed details element for a link into it.
2. The second homepage row was removed. Three of its four cards went to `/councils/`.
3. The thinning of year labels on the homepage chart stops the build if the labels found differ from the years plotted.

Not yet checked by anyone: a short citation tapped in Safari on a phone.

The payment and service links now stop builds on 10 February 2027 (91 days after the check of 11 November 2026), not 4 January.

## 2. Open pull requests

| Repository | PR | What | Needs |
|---|---|---|---|
| ukcounciltax | 61 | C2 research: a freeze counterfactual for 280 candidate authorities; documents only | Tom's decision (X2 below) |
| ukcounciltax | 54 | The navigation brief, both prompt sets, this note and the earlier handovers | Tom's word to merge. It now holds main and the content of PR 53 |
| ukcounciltax | 53 | Round three handover | Nothing: it shows as merged when 54 merges with a merge commit |
| ukcounciltax | the onward links PR of 12 November | Scottish and Welsh council pages gain links to two other councils and the nation's table | Tom's word to merge |
| estate-kit | 21 | Print sheets and the off web track, 0.5.1 | Its CI fails at start (billing); the owner's review |
| estate-kit | 9 | One vendor command and a guard for the copy | The owner's review |

## 3. Where the kit stands

- Tags: v0.5.0 is the latest (commit 5680ba5). Main is at 0.5.0.
- UK Councils carries v0.5.0, vendored with a hash for every file. UK Council Tax carries v0.3.0. The kit's upgrade plan (`UPGRADE_PLAN_2026-11-11.md` in estate-kit) asks for one version across the sites that carry it, so UK Council Tax is two versions behind.
- Hosted CI on estate-kit fails on every run, on main and on pull requests, with no log. This matches the Actions billing block recorded on 10 November. The kit repository is private; the two site repositories were made public to get round the same block.
- The kit's plan counts 31 built parts and 11 planned, and recommends five rules (P1 to P5) that are the owner's to take. P1 is a stop on new chart forms until the built charts are taken by the sites.

**A conflict to rule on.** The navigation brief orders kit 0.6.0 with five new forms (linked area map, ranked bars with a change marker, share bar, tile with a sparkline, history strip) so that the England map and the increases drawing are ready for levels day, staged by mid January 2027. The kit's plan, written the same day, recommends starting no new form. Both cannot hold. See X1.

## 4. Decisions for Tom

- **X1. New chart forms before levels day.** Recommendation: a narrow exception to P1 for two forms only, the ranked bars and the linked area map. Both are lifts of drawings that already exist in UK Elections and UK Demographics, which the kit's plan already schedules as lifts; both have two first sites named (UK Council Tax and UK Councils), which meets P2; and levels day is the one dated use. The share bar, sparkline tile and history strip wait for the stop rule to lift.
- **X2. C2 (PR 61).** The research recommends keeping the present game and C1b and building a separate, labelled freeze counterfactual only after source and accounting gates pass. Recommendation: merge the documents now, since they change nothing published, and take the build decision after levels day; the 280 is a candidate count, not a promise, and the referendum rule mapping is real work.
- **X3. Hosted CI on estate-kit.** Either settle the billing block or make the repository public as the two sites were. Until then every kit merge is unverified by CI, and the gates pack cannot be built with confidence.
- **X4. Worktrees.** Nineteen are listed on ukcounciltax and thirteen on ukcouncils, most for merged branches. Removing them frees disk (the volume is 93 per cent full). Nothing is removed without Tom's word.

## 5. The plan

One writer per repository. Dates that bind are unchanged: levels day staged and the dossier on all 296 pages by mid January 2027; the links check before 10 February 2027; the freeze on 20 March 2027; the reversal in May to June 2027.

| Order | Repository | What | Who | Prompt |
|---|---|---|---|---|
| Now | ukcounciltax | Onward links on Scottish and Welsh council pages (part of NV5) | Built, 12 November | PR open |
| 1 | ukcounciltax | The way in to the increases page (NV6) | Codex | Round two, prompt 1 |
| 2 | ukcounciltax | Kit 0.5.0 | Codex | Round two, prompt 2 |
| 3 | ukcounciltax | Small faults (NV7) and the parish index | Codex | Round two, prompt 3 |
| 1 | ukcouncils | The way in to Exceptional Financial Support (NV6) | Codex | Round two, prompt 4 |
| 2 | ukcouncils | Nearby and alike on profiles (NV5) | Codex | Round two, prompt 5 |
| After X1 | estate-kit | The two forms X1 allows, as 0.6.0, each with golden files and the layout gate (NV14) | Claude Code | Not written |
| After that, by mid January 2027 | ukcounciltax | The England map on `/council-tax/` (NV8, W2) and the increases drawing (NV9), with levels day staged (C6) | Claude Code | Not written |
| January to February 2027 | ukcouncils | The map on `/councils/` coloured by type (NV8), finances as drawings (NV12) | Claude Code | Not written |
| After X3 | estate-kit, then both sites | The gates pack: script hashes and headers, the built page check, the text gate (stage 2 of the kit's plan; both sites are its first sites) | Codex | Not written |
| After prompt 5 | ukcounciltax | Nearby and alike on profiles, in the form UK Councils took | Codex | Not written |
| Weekly from 17 November 2026 | both | The measurement note: page loads, Search Console clicks, impressions and Google's chosen canonical for ten shared URLs | Tom or Claude Code | Execution plan, 8.5 |

The prompts are in `docs/CODEX-PROMPTS-2026-11-12.md`.

## 6. Working notes from the day

- A check that passes in Chromium says nothing about Safari. Where a page relies on the browser to do something (open a closed details element for a link), the page should do it itself and a test should cancel the browser's part to prove it.
- A card should go where its label says. Three cards with one destination is a sign the destination does not exist yet.
- Post processing a kit drawing is acceptable only if it stops the build when the kit's markup changes.
- The local main checkout of ukcounciltax was 30 commits behind with an uncommitted note in it. Read GitHub, not a local main, for the state.
