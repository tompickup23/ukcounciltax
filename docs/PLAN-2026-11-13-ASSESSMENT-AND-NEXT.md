# Assessment and plan from here | UK Councils and UK Council Tax | 13 November 2026

Written in Claude Code at Tom's request, late on 13 November 2026, while the last Codex chat was archiving. Read from GitHub (`gh`, both repositories and estate-kit), the live sites and the local handoffs, not from the local main checkouts. Nothing here authorises a merge, tag, deployment or deletion. Committed with the archive notes of 12 and 13 November 2026 in one documents pull request.

## 1. Where things stand

| Item | State | Evidence |
|---|---|---|
| Round two prompts 1 to 5 | All merged and deployed | UKCT PRs 64, 65, 66 (main `bcde00c`); UKC PRs 49, 50 (main `f1e33e6`) |
| UKCT PR 67, nearby and alike | Open at `ecaff30`, three checks green, reviewed with no blocking finding | `docs/PR67-REVIEW-2026-11-13.md` |
| UKCT PR 61, C2 research | Open since 12 November, documents only | Decision X2 |
| C2 local pilot (Codex, 13 November, 15:38 to 16:14) | Built and tested for Burnley and Blackburn with Darwen. Never committed. Its worktree was emptied when the chat was archived. Recovered from Codex's archive snapshot `8ad8b53` and pinned to the local branch `rescue/c2-pilot-snapshot-2026-11-13` (22 files, base `d7c151c`). Pushed the same evening as draft PR 68 on `feat/budget-freeze-pilot` | `docs/C2-PILOT-2026-11-13.md` and `docs/HANDOFF-2026-11-13-C2-ARCHIVE.md` on that branch |
| UKC open PRs | None | `gh pr list` |
| estate-kit | v0.5.0 on both sites. PRs 9 and 21 open. Every hosted CI run fails | `gh run list`, 12 November runs |
| Navigation items NV1 to NV7 | Done on both sites once PR 67 merges | Navigation brief, section 2 |
| Visual items NV8 to NV14 | None started | Waiting on X1 and X3 |
| Decisions X1 to X4 | All four still open, two days on | `docs/HANDOFF-2026-11-12-REVIEW-AND-NEXT.md`, section 4 |

## 2. What the sessions prioritised, and what that missed

**A live error sat behind a day of polish.** UK Council Tax still prints the registry's July note on reorganisation, with the words "government-decided four-unitary model", on the 14 Lancashire council pages. Checked live on the Burnley profile on 13 November 2026. UK Councils has held that field since 5 November 2026 (its `CLAUDE.md`, "Held data") and its Burnley page does not carry the words. So one site has shown for at least eight days a statement the other withdrew. It was found only as a side note in the PR 67 review. It should have been ahead of every navigation item, and it is first below.

**The unblocked queue is now empty.** Every session since 11 November took the next prepared prompt, and all of them were navigation work that needed no decision. That work is finished. Everything left with a date on it (the England map, the increases drawing, levels day staged by mid January 2027) runs through estate-kit 0.6.0, which waits on X1 (which chart forms) and X3 (the kit's CI). The constraint has moved from building to deciding. If sessions keep picking "the next thing that can start", they will pick checks and reviews, as the WebKit pass and the PR 67 review were, while the dated path does not move.

**No traffic evidence is steering the order.** The weekly measurement note was due from 17 November 2026 (execution plan, 8.5). The one Search Console record made so far is inside PR 61, unmerged. The order is set by audit findings alone.

**A whole session was invisible.** The first version of this note said C2 had not started. That was wrong: Codex built a working local pilot the same afternoon. Its handoff and its pointer in `CLAUDE.md` existed only inside a managed worktree, the work was left uncommitted, and archiving the chat removed the files. No later session, and none of the three later archive notes, mentions it. Tom's memory caught it; the notes did not. The pilot's findings change the C2 picture: 178 of 296 authorities pass its stricter arithmetic, component and notes screen (not a release count), Burnley is held back by an unexplained difference of 800 pounds between the RA return (222,000) and Council Tax Table 10 (222,800) for 2026/27 parish precepts, and Blackburn with Darwen passes.

**Not confirmed in this pass:** what, if anything, still remains of the dossier on all 296 UK Councils profiles. The first session on that repository should state it from the code before any new work is chosen.

## 3. Efficiency

1. **Triple verification.** PR 67 copies geometry already reviewed on UK Councils, with inputs matching byte for byte. The builder ran the full local suite (440 browser, 104 header tests), hosted CI ran the same, then a separate chat rebuilt everything and ran it again. Hosted CI on UKCT takes 20 to 26 minutes a run (`gh run list`, 13 November). Rule from here: the builder runs unit tests, the build, the dist and text checks and the focused browser tests, and reads the hosted run for the full suites. A separate review chat is for a PR that changes a figure, a source, a header or shared logic; it reads the diff and the hosted reports and rebuilds only if something looks wrong.
2. **Archive overhead.** Three archive notes were written on UK Council Tax today, plus long entries in the canonical plan in `~/clawd` and hashed evidence copies under `.ops/`. All of it is local and uncommitted. The canonical plan is an added, never committed file of 846 lines. `CLAUDE.md` now opens with five "read this first" pointers, some already wrong (one says prompt 2 waits for PR 64, which merged). Rule from here: one `docs/STATE.md` per repository, replaced each session, 20 lines at most (open PRs, what is live, what is next, decisions waiting), committed inside the session's own PR. `CLAUDE.md` points at that one file. Detail stays in PR bodies, which already hold it.
   The C2 pilot shows the cost of the present habit: uncommitted work with a local only handoff survived by luck, as a tool's snapshot. Rule from here: every session that writes code ends with a commit on a pushed branch, as a draft PR if it is not for review, before any archive step.
3. **Stale local mains.** Local `main` is at `8f7002f` on UKCT, more than 30 commits behind, and UKC is 5 behind. Each Codex chat spends time working round this and preserving local notes. Fast forward both once the notes are committed.
4. **Disk.** The data volume had 11 GB free at 95 per cent on 13 November (`df`). `~/wt` holds 11 GB across 21 UKCT and 16 UKC worktrees, nearly all for merged branches. A full build writes 2,845 PNGs. A build failing for space is now likely. X4 needs Tom's word.
5. **Merge wait.** Recent PRs sat two to eight hours between opening green and merging. Tom reading several green PRs in one sitting, twice a day, costs him less and keeps one writer per repository moving.
6. **Paired work.** A feature wanted on both sites should be one brief with the donor named, so the second site's session is a copy with a dry run, not a fresh design and a fresh review.

## 4. Decisions for Tom, in order of what they unblock

| Decision | Recommendation | Unblocks |
|---|---|---|
| Hold the reorganisation field on UKCT (new) | Taken and done: PR 70 merged as `c947f8a` and deployed late on 13 November 2026; three live Lancashire profiles checked | The live error |
| Merge PR 67 | Yes, after a fresh read of its checks | Closes NV5 |
| X3, the kit's CI | Settle billing or make estate-kit public, as the two sites were | Everything in the kit |
| X1, new chart forms | Two forms only: ranked bars and the linked area map | Kit 0.6.0, then levels day |
| X2, PR 61 and the C2 pilot | Merge the documents. Let the pilot be pushed as a draft PR so it is safe. Then choose: a first public cohort starting with Blackburn in December, or after levels day | The measurement baseline, and the game's next step |
| X4, worktrees | Remove those whose branch is merged and whose tree is clean | Disk |

## 5. Order of sessions

Three lanes, one writer in each repository. The kit lane is the critical path and starts as soon as X3 and X1 are taken.

| Order | Lane | Session | Size | Waits for |
|---|---|---|---|---|
| 1 | ukcounciltax | Hold the registry `reorganisation` field: the profile section, its contents entry, structured data, share text and the search index, with a dist test that fails if the field renders. Copy the UK Councils rule. No replacement wording, no hand edit of the registry. Done as PR 70 | Small | Done |
| 2 | both, one chat | Housekeeping: `docs/STATE.md` in each repository, the archive notes committed or folded in, `CLAUDE.md` pointers cut to one, local mains fast forwarded, the canonical plan committed in `~/clawd`, worktrees removed if X4 is given | Small | PR 67 merged |
| 3 | estate-kit | CI restored, then PR 9 (one vendor command) | Small | X3 |
| 4 | estate-kit | 0.6.0: ranked bars with a change marker, and the linked area map, each with golden files and the layout gate (NV14) | Large | X1, session 3 |
| 2a | ukcounciltax | Done 13 November: the rescued C2 pilot is draft PR 68 on current main. No route is public; the pilot builds only to `.ops/c2-dist` | Small | Done |
| 2b | ukcounciltax, if X2 says December | C2 stage 1 and 2 of the pilot's production brief: the source gates (the Burnley parish difference first) and the referendum rule mapping for a first cohort. Then stages 3 to 6 as a second session | Large, two sessions | 2a, X2 |
| 5 | ukcounciltax, beside 3 and 4 | The bill as a bar on `/precepts/` and the local bill tool (NV10), using the kit's existing `BillAnatomy`, so it needs no new form | Medium | Session 1 |
| 6 | ukcouncils, beside 3 and 4 | State what remains of the dossier on all 296 profiles, then build it | Unknown until stated | Nothing |
| 7 | ukcounciltax | The increases drawing (NV9) and levels day staged (C6) | Large | Session 4 |
| 8 | ukcounciltax | The England map on `/council-tax/` (NV8, W2) | Medium | Session 4 |
| 9 | ukcouncils | The map on `/councils/` by type (NV8), finances as drawings (NV12) | Large | Session 4 |
| 10 | estate-kit, then both | The gates pack | Medium | Session 3 |
| Weekly from 17 November | both | The measurement note, ten minutes, appended to one file | Small | Nothing |

Dates that bind are unchanged: levels day staged and the dossier complete by mid January 2027; the links check before 10 February 2027; the freeze on 20 March 2027; the reversal in May to June 2027. Sessions 3, 4 and 7 are the path to the first of those, with about nine weeks left.

Left out on purpose: a WebKit lane in CI (the manual pass found nothing; a phone check by hand takes Tom five minutes), the share bar, sparkline tile and history strip (after the stop rule lifts). The C2 build is no longer left out: it has a working pilot and its timing is X2.

## 6. Update and handover, 14 November 2026

Written in Claude Code before this chat was archived at Tom's request. Sections 1 to 5 stand as written on 13 November; where they differ from this section, this section is the later record.

### 6.1 Merged and live since section 1

| PR | What | Merge |
|---|---|---|
| ukcounciltax 70 | Reorganisation field held on the 14 Lancashire profiles | `c947f8a`, live; Burnley, Blackpool and Wyre checked |
| ukcounciltax 67 | Nearby and alike on 296 English profiles | `1a21412`, live; four profiles checked |
| ukcounciltax 69, ukcouncils 51 | This plan, the archive notes, the PR 67 review, the WebKit review | `f8f74b1`, `89ca008` |
| ukcounciltax 72, ukcouncils 52 | The design checker's Playwright pinned to 1.65.1 | `1e4494e`, `75cdac1` |

PR 67 was merged with its design check not complete. The cause was the checker's browser, not the change: Playwright 1.65.2 (PyPI, published 14 November 2026, 00:29 UTC) ships Chromium build 1255 and stopped the pinned checker on the runner; 1.65.1 ships build 1254. PRs 72 and 52 name the checker's packages in `.github/scripts/design-review.mjs` and leave the checker file and its checksum unchanged. What breaks under 1.65.2 is not established, because the checker hides its traceback. Look at that before moving past 1.65.1.

### 6.2 Open pull requests

| PR | What | State |
|---|---|---|
| ukcounciltax 71 | Burnley budget scenario game at `/councils/burnley/budget-game/`, built by another Claude Code session from the Burnley budget model in Reports | Not ready. Its pushed branch predates PR 67, so its number diff fails; it has no "Pages allowed to differ" block; its description names an older model run. Its own session holds unpushed commits in `~/.aidoge-worktrees/ukcounciltax-burnley-game2`. Reviewed read only: no names, parties or private paths in the diff, no network request or storage in the game script, no inline script |
| ukcounciltax 68 | The recovered C2 freeze pilot, draft | Safe copy. Needs main merged in before it can land |
| ukcounciltax 61 | C2 research documents | Its files are also carried in PR 68 |
| burnleycouncil 1189 | The canonical UK Councils plan, committed for the first time | Documents only |
| tompickup.co.uk 111 | The same Burnley game on the personal site | Not looked at here |

### 6.3 What the Burnley game changes

Burnley now has a "balance the budget" page built from the council's own printed gap (Burnley Borough Council, Revenue Budget 2027-30, report to the Executive, 16 September 2026, Tables 4 and 5), which is better evidence than the C2 pilot can use and avoids the unexplained parish difference that held Burnley back there. C2 therefore splits in two: a generic freeze counterfactual for councils that pass the pilot's screen, starting with Blackburn with Darwen, and bespoke scenario games where a full council model exists. The page will go stale: it needs a refresh after the December settlement and after the February 2027 budget papers.

### 6.4 Options put to Tom, none yet taken

1. X3: make estate-kit public after a scrub for private paths, secrets and anything from Reports (it carries Council Intel skins). Settling the Actions billing is the alternative.
2. X1: two new chart forms only, ranked bars first, then the linked area map.
3. C2: land the Burnley game once its session tidies it; build the generic tier after levels day; consider `/tools/budget/burnley/scenario/` as its address before it goes live.
4. Session 2 of section 5 (housekeeping) is partly done: see 6.5. Still to do there: one short state file per repository, and the local main checkouts fast forwarded once their untracked copies of notes that are now on main are removed.

### 6.5 Local cleanup done on 14 November

Thirty four worktrees for merged branches were removed across the two sites, which freed about 6 GB. Kept: `uct-c2-pilot` (PR 68), `uct-handoff-1110c` (PR 61), and `uct-ci` and `ukc-search`, because session prompts copy `data/raw/` from them. Before removal, three sets of stray files were saved to the ignored folder `.ops/archive-2026-11-14-worktree-cleanup/` in the main ukcounciltax checkout: the staged EFS index work of 9 November (superseded by ukcouncils PR 49; it would rename the anchors other pages link to), local edits to the A3 archive handover, and the B1 build logs. Other folders and logs under `~/wt` that are not worktrees were left alone.

### 6.6 Rule added to both sites' guides

A session that writes code commits and pushes it to a branch, as a draft pull request if it is not for review, before any archive step. The C2 pilot survived an archive only as a tool's snapshot (`refs/codex/snapshots` in the local repository). When work seems to be missing, look there and in Codex's archived session logs before concluding it was never done.

