# Handover, 11 November 2026 | navigation audit, the picker, typed search, local links

Saved before archiving the Claude Code session that audited navigation and data visuals on both tax sites, wrote the brief, planned and reviewed the first builds, and merged the UK Places links refresh. Nothing in this note authorises a merge or deployment; Tom authorises those in chat.

Read `CLAUDE.md`, then `docs/NAVIGATION-AND-VISUALS-BRIEF-2026-11-11.md` (items NV1 to NV14, decisions W1 to W6, and section 5 for where each stage sits in the existing order), then this note. Run `gh pr list` on ukcounciltax, ukcouncils, estate-kit and ukplaces before writing anything.

## 1. State when written

| Repo | PR | State | What it needs |
|---|---|---|---|
| ukcounciltax | 54 | The brief and this note. Documents only | Tom's word to merge |
| ukcounciltax | 55 | The council picker (NV1, NV2, NV3, part of NV7). Reviewed; a fix pass of six points is running in another Claude Code session | That session to push; then read its checks and the updated PR body; then Tom's word |
| ukcounciltax | 51, 53 | Pipeline speed; the round three handover | Unchanged from the round three handover |
| ukcouncils | 44 | Typed search and the 404 finder (NV4). Reviewed, all four checks passing, fit to merge | Tom's word to merge |
| ukplaces | 49 | Local links refresh. Merged on 11 November 2026 as `2bea52dbe74c7a689a500b3b73ff63dcefb900b6` | Nothing. Its deploy was running when last seen and was not confirmed finished |
| estate-kit | 6, 7 | Kit 0.5.0, still a draft; a base layer PR opened by another session | Not looked at in this session |

Decisions taken by Tom on 11 November 2026: W1 (the picker goes ahead of the compare improvements), W3 (the picker is copied into each site, not added to the kit), W5 (nothing is stored in the browser), W6 (the 54 Scottish and Welsh councils join the name finder, labelled by nation). Open: W2 (what the England map may colour) and W4 (chart image weight, which gates every drawing stage).

## 2. What the reviews found

**ukcouncils PR 44.** Codex built it and stopped without committing; a Claude Code session committed that build as found, then six fixes, one commit each. Checked by hand at 375 wide from a local build: "burn" lists three councils above the pages, the status line counts both lists, and results carry a type label. Left for stage 3, none blocking:

- A county does not match. "lancashire" lists West Lancashire alone, where the picker on UK Council Tax finds all 12 districts.
- "north west" lists North West Leicestershire and West Northamptonshire, because each word matches part of a name.
- Destination links on council rows and Pagefind type filters are not built, as the PR body says.

**ukcounciltax PR 55.** The picker works: "lancashire" filters to 12 rows, the nine councils without a budget return stay in their own group, and the game page offers neighbours. The budget hub fell from 12,267 px to 2,890 px at 375 wide (the session's measure). The fix pass covers:

1. The input sat at 831 px on an 812 px screen on the budget hub; it moves under the H1.
2. About 500 px of note and chips sat between the input and the first row; the chips go into a closed drawer on phones.
3. A postcode worked only on Enter; a visible button is added.
4. No browser test covered the picker's behaviour; a spec is added.
5. The picker embedded in each game page (about 77 KB on each of 296 pages) is replaced by a link to the hub. This reverses "opens the picker in place" in NV2, on review.
6. The "Received" status column is dropped; the "no return" group already says it.

The budget hub prints no headline figure, because no single published headline exists. That was the right call and stays.

## 3. Local links: what is left

Part 1 is merged. Parts 2 and 3 of the Codex prompt in the round three handover (section 7) import into ukcounciltax and ukcouncils, and have not been run. They wait until PR 55 and PR 44 are settled, since one writer works in each repository. When they run:

- Import from the merge commit `2bea52dbe74c7a689a500b3b73ff63dcefb900b6`, not a PR head, and drop the re pin note.
- The sha256 of `src/data/local-links.json` at that commit is `085eb3b0511aca0f3fad79a9aa3f0decd5a7b5529240229ceed7731b3fb0b617`. A different computed hash is a stop.
- The binding date is unchanged: `src/lib/council-links.ts` fails every UK Council Tax build from 4 January 2027.

Two council tax links were removed in the refresh. Halton's returns HTTP 404. Aberdeen City's page opens in a browser, but the generator's check fails every time: the council's server sends its own certificate without the intermediate one, and Node refuses that. The certificate was issued on 6 October 2026, the day after the previous check. The removal follows the rule that a link is kept only when UK Places' own check reaches it; it will return when the council fixes its server. A small follow up for ukplaces: have `scripts/build-local-links.mjs` record the underlying cause beside "fetch failed".

## 4. Order of what follows

As section 5 of the brief, with today's position:

| Next | Who | Repo | When | What |
|---|---|---|---|---|
| D | Claude Code | ukcounciltax | After PR 55 merges | The compare improvements already ordered, using the picker; typed search ported from ukcouncils; the way in to the increases page (NV6) |
| E | Claude Code | ukcouncils | After PR 44 merges and kit 0.5.0 is tagged | The dossier's short source line as already ordered; then the picker copied across with D2 and D4, and county and region matching shared with the search |
| Links | Codex | ukcounciltax, ukcouncils | When each repository is free | Parts 2 and 3 above |
| F | Claude Code | estate-kit | After kit 0.5.0 is tagged and W4 is ruled | Kit 0.6.0: linked map, ranked bars, share bar, sparkline tile, history strip |
| G | Claude Code | ukcounciltax | By mid January 2027 | The England map and the increases drawing, with levels day staged |

Prompts for D to G are not written. Each depends on what PR 55 and PR 44 look like once merged.

## 5. Notes from the day

- A Codex session can finish and archive with nothing committed. Look for the pull request before archiving it, and say "commit, push and open the PR" in the prompt.
- Three builds at once on this Mac cause lone test timeouts. A rerun of the failed tests passed each time.
- The default shell node is 25. The gates run on Node 22 (`~/.nvm/versions/node/v22.23.4/bin`).
- UK Elections was read on its branch `proto/voter-journey-2026-11`, not main. Confirm each of its paths on main before copying from it.
- A first query for "burn" in the live UK Council Tax search showed no results once on 11 November and was not reproduced, live or in the review of PR 44.

## 6. Local state

Worktrees: `~/wt/uct-nav-brief` (PR 54; keep until it merges), `~/wt/uct-picker` (PR 55, in use by the fix pass), `~/wt/ukc-search` (PR 44), `~/wt/ukp-links` (merged; can go). The main checkout `~/ukcounciltax` was not changed and is behind origin.

## 7. Resume prompt

```text
Read CLAUDE.md, docs/NAVIGATION-AND-VISUALS-BRIEF-2026-11-11.md and docs/HANDOFF-2026-11-11-NAVIGATION.md in ukcounciltax (origin/main if PR 54 has merged, otherwise the branch docs/navigation-visuals-brief). Run gh pr list on ukcounciltax, ukcouncils, estate-kit and ukplaces and say what is open. For ukcounciltax PR 55 and ukcouncils PR 44, read the checks and the PR body and tell me whether each is ready; ask me before merging either. Then take the next row I name from section 4 of the handover and write its prompt from what was actually merged. Do not merge, tag or deploy without my word.
```
