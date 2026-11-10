# Execution: what is done, what is Tom's, and the prompts | 10 November 2026

Written in Claude Code. It turns `PLAN-2026-11-10-SPLIT-AND-NETWORK.md` and `DESIGN-ROUND-TWO-BRIEF.md` into the next sessions. Codex is not running; the two Codex prompts below are ready to paste into the ChatGPT app. Nothing here authorises a merge or deployment.

## 1. Done in this session

| Item | State |
|---|---|
| Cloudflare Web Analytics site for `ukcounciltax.co.uk` | Created by Claude in Tom's Chrome at his instruction, manual snippet. The token is public and is in the navigation PR |
| Search Console domain property | Added. The TXT record was added in Cloudflare DNS by Claude at Tom's instruction on 10 November 2026; see section 2 for verification |
| Navigation, links and beacon, ukcounciltax PR 43 (`feat/nav-and-links`, worktree `~/wt/uct-nav`) | Three commits: Asylum Stats link removed (N2); header cut from 30 links to 19 with a direct budget game link, a footer list and a homepage callout (D2); the beacon with the privacy page updated. See the PR for the gate result |
| ukcouncils PR 37 review (reorganisation panel) | Done, read only. Not ready to merge: four fixes and one decision, section 3 |
| A3 stop | Resolved by a probe over all 296 councils. Amendments committed in `~/wt/uct-profile` as `docs/A3-AMENDMENTS-2026-11-10.md` |

Later on 10 November:

- PR 42 (the plan and design brief) merged. PR 43 (navigation, links, beacon) merged as `0bec32e`, but with its `site` check failing: the budget game browser test forbids external requests and the beacon is one. That was Claude's error (a wait then merge command that ignored the failed check). Publishing is gated on the same suite, so the live site did not change. PR 45 fixes the test; the full browser suite passes locally against it (244 tests). Main stays red and undeployed until PR 45 merges.
- Search Console: the TXT record was added and the domain property is verified, under the Google account that holds the network's other properties.
- Codex B finished PR 37: rebased, retargeted to main, ready for review. The five fixes were checked in the built pages (184 panels; no rail on the 14 documents only pages; no sub judice wording; no zero width characters). Its "unitary" check uses a list of exact allowed page patterns, which is brittle; simplify it in a follow up.
- Codex A built A3 phases 1b to 11 and stopped on the old mini map size assertion. The ruling is section 5 of `docs/A3-AMENDMENTS-2026-11-10.md` in `~/wt/uct-profile`; Codex was resumed with it.

## 2. Tom's steps

1. **Merge PR 42** (documents; checks passed).
2. **DNS record for Search Console.** In Cloudflare, DNS for `ukcounciltax.co.uk`, add a TXT record on the root (`@`) with the value Search Console shows under "Any DNS provider", then press Verify in Search Console.
3. **Merge the navigation PR** once its checks pass. The beacon goes live with it. Then inspect ten shared URLs in Search Console for Google's chosen canonical, as the assessment asks.
4. **Three rulings on PR 37**, each with a recommendation in section 3. Pasting the Codex prompt as written accepts the recommendations.
5. **Approve a force push with lease** on `feat/reorganisation-panel` (the rebase in the Codex prompt needs it).
6. **Delete the two untracked copies** in `~/ukcounciltax/docs/` (`DESIGN-ROUND-TWO-BRIEF.md`, `PLAN-2026-11-10-SPLIT-AND-NETWORK.md`) after PR 42 merges and before pulling main.

## 3. PR 37 findings (ukcouncils, reorganisation panel)

Gate on the branch head: check, build (329 pages), 244 unit tests and the dist check all pass; all 132 source hashes verify. `git rebase --onto origin/main 2ea2439` applies the PR's 11 commits cleanly; a plain rebase conflicts in 8 files because PR 36 was squashed.

Fix before merge:

1. `src/pages/methodology.astro` line 85 prints "carry dated documents only under the sub judice rule", which tells readers there are live proceedings. Recommended: the sentence ends at "carry dated documents only".
2. `src/pages/methodology.astro` lines 82 to 83 drop a space: "published by MHCLG on9 November 2026".
3. `src/components/ReorganisationPanel.astro` lines 28 to 31 with `templates.neededOrder` print a fragment with no subject on the 29 minded to pages. It needs a fixed lead in and its template test updating.
4. Surrey's area name carries zero width spaces copied from MHCLG's title; they reach the heading, the map label and the caption on 11 pages. Strip U+200B in the importer and regenerate.
5. **Decision.** On the 14 Lancashire pages the rail prints "New councils start, 1 April 2029" and "Not yet dated by MHCLG" for the minded to decision and the order, which implies those steps will happen. Recommended: no rail on documents only pages; they keep the dated documents list, the councils list and the map.

Follow ups, not blocking, are in the review record: the held wording pattern omits "unitary"; "None made by 9 November 2026" is hard coded where the checked date should be used; the same source line repeats under every council in the list.

## 4. Codex prompts

The two prompts are in different repositories and can run at the same time.

### Codex A: resume A3 (ukcounciltax)

```text
Work only in /Users/tompickup/wt/uct-profile, branch feat/profile-home-overhaul. Use Node 22 (export PATH="$HOME/.nvm/versions/node/v22.23.4/bin:$PATH"). Read CLAUDE.md, then docs/A3-ARCHIVE-HANDOVER-2026-11-09.md, then docs/A3-AMENDMENTS-2026-11-10.md, then docs/A3-PROFILE-BRIEF.md. The amendments win wherever they differ from the brief; everything else in the brief is binding, including its stop conditions.

1. git fetch origin and rebase onto origin/main. Main has moved (game polish, scenario mode, CI number diff and design check, and possibly a navigation PR touching src/lib/site.ts, the header, the footer, src/pages/index.astro, src/lib/registry.ts and the privacy page). Keep main's side of conflicts in those files and reapply only what an A3 phase needs.
2. Apply amendments section 1 (the two line label and title change) in a new commit so phase 1b passes: npx vitest run tests/profile-charts.test.ts must pass for all 296 councils in both themes. You may raise that test's timeout to 900000 ms. Do not change the vendored kit, a gate or a tolerance.
3. Continue from phase 1c through phase 11 in the brief's order, one commit per phase, with amendments sections 2, 3 and 4 applied: no Asylum Stats line and an assertion that no built page contains asylumstats.co.uk; no strip on budget routes; the amended section order and three action links; phase 12 out of scope. Budget routes stay untouched.
4. Run the full gate: npm run check, BUILD_OG=1 npm run build, npm test, npm run test:dist, npm run test:text, npm run test:csp -- --workers=1. Take the captures the brief names, plus the Burnley and the Bournemouth, Christchurch and Poole bill charts at 390 and 1440 in both themes.
5. Push and open the PR titled "Council profiles: band table, history, bill breakdown, position, map, how to pay, network strip (A3)" with the brief's per phase evidence. End the body with "Built with Codex from a brief prepared in Claude Code."

Rules: British English; no em dash, en dash or spaced hyphen anywhere, including commit messages; never estimate, derive or apportion a figure; name no individual; stage named paths only; do not merge or deploy. Stop and report only on the brief's stop conditions; otherwise take the most conservative choice and record it under "Decisions taken" in the PR.
```

### Codex B: rebase and fix PR 37 (ukcouncils)

```text
Work only in /Users/tompickup/wt/ukc-reorg, branch feat/reorganisation-panel (draft PR 37 on tompickup23/ukcouncils). Use Node 22 (export PATH="$HOME/.nvm/versions/node/v22.23.4/bin:$PATH"). Read CLAUDE.md, docs/REORGANISATION-SOURCE-NOTES.md (binding) and docs/REORGANISATION-PANEL-BRIEF.md (binding).

1. git fetch origin, then git rebase --onto origin/main 2ea2439. This replays only this PR's 11 commits; PR 36 is already on main as a squash. It applied cleanly in a trial. If it conflicts, stop and report.
2. Five fixes, one commit each:
   a. src/pages/methodology.astro: the sentence about Lancashire, Blackburn with Darwen and Blackpool ends at "carry dated documents only". Remove the words "under the sub judice rule". No reader facing text may mention proceedings, a claim or sub judice.
   b. src/pages/methodology.astro: restore the missing space so the page reads "published by MHCLG on 9 November 2026".
   c. src/components/ReorganisationPanel.astro with templates.neededOrder in src/lib/reorganisation.ts: on the minded to pages a paragraph prints only "would need to be provided for in a structural changes order". Give it a fixed lead in from the brief's permitted templates so the sentence has a subject, add it to the template list and update the template test. Add no claim the sources do not make.
   d. scripts/lib/import-reorganisation.py: strip U+200B from the area name and the S2 title, regenerate data/reorganisation/areas.json, and add a test that no string in the data contains a zero width character.
   e. Documents only pages (the 14 Lancashire pages): render no rail. They keep the dated documents list, the councils list and the map. Update panelView, the template test and the dist check counts to match, and assert that no documents only page contains "New councils start" or "Not yet dated".
3. Also, in one further commit: use the data's checked date in templates.noOrder instead of the hard coded "9 November 2026"; add "unitary" to the held wording pattern as brief item 6.8 lists, and confirm Burnley still passes.
4. Run the full gate on the rebased tree: npm run check, BUILD_OG=1 npm run build, npm test, npm run test:dist, and the e2e and CSP suites the repo has. Read the panel from dist on /councils/burnley/, /councils/woking/ and /councils/birmingham/ (no panel) and quote each in the PR body.
5. Push with git push --force-with-lease (Tom has approved this for this branch), retarget PR 37 to main, update docs/REORGANISATION-VALIDATION.md for the new base, and mark the PR ready for review. End the body with "Built with Codex from a brief prepared in Claude Code."

Rules: British English; no em dash, en dash or spaced hyphen anywhere, including commit messages; never estimate, derive or infer; name no individual; nothing about Lancashire beyond dated documents; stage named paths only; do not merge or deploy.
```

## 5. Claude Code prompts (design work, not for Codex)

### Review, when each Codex PR opens

```text
Review <repo> PR <n> against its brief and amendments (A3: docs/A3-PROFILE-BRIEF.md and docs/A3-AMENDMENTS-2026-11-10.md in ~/wt/uct-profile; PR 37: section 3 of docs/PLAN-2026-11-10-EXECUTION.md on ukcounciltax main). Follow the review checklist in docs/HANDOFF-2026-11-09-ROUND-FIVE.md section 5: rebuild with Node 22, read every anchor from dist, diff every number against a main build, run /design-check at 390 and 1440 in both themes, and look at the captures yourself. Small fixes on the branch; a fix list for anything larger. Do not merge.
```

### D1 and D3: the UK Councils dossier (after PR 37 merges)

```text
Repo ukcouncils. Read CLAUDE.md, then in ~/ukcounciltax (main): docs/PLAN-2026-11-10-SPLIT-AND-NETWORK.md and docs/DESIGN-ROUND-TWO-BRIEF.md items D1 and D3. Create worktree ~/wt/ukc-dossier on branch feat/council-dossier from origin/main. Before any code: run /design-check on the live /councils/burnley/ and /councils/birmingham/ and keep the sheets as the before set; dry run, from the data, how many of the 296 councils hold each summary fact (Band D, type, population, verified next election year, budget headline, Exceptional Financial Support status) and record the counts. Then build D1: the summary row under the header with Band D first, the repeat of Band D removed from "at a glance", each later section as a headline, one drawing and its tables in drawers, the sources list in a details element, three actions. Then D3: the short source line (publisher, table, year) linked to a full entry on the same page, first use in full, and a build check that fails on a short line with no entry. In the same PR add the UK Places link and the UK Food Hygiene link (356 verified URLs in the registry) inside a "what this council does" section, each only where the URL exists. Titles, H1s and URLs do not change (decision S2). Gate: check, BUILD_OG=1 build, tests, dist check, CSP suite, /design-check at 390 and 1440 in both themes, the number diff against a main build with the removed repeats listed by name, and Burnley's prose word count outside drawers before and after. Open the PR; do not merge.
```

### After A3 merges: D5, D6 and the game opening (ukcounciltax)

```text
Repo ukcounciltax. Read CLAUDE.md, docs/DESIGN-ROUND-TWO-BRIEF.md items D5 and D6, and decision S3. Worktree ~/wt/uct-round-two on feat/design-round-two from origin/main. D5: replace the empty grid at the top of /tools/budget/<slug>/ with a drawn five stop rail naming the rounds; the published split is not shown before round one. D6: five position strips on /council-tax/ranked/; the England averages row as five across or one table; the clipped history table in a drawer; Band D beside each name on /councils/ with one source line per region. Before and after captures, the full gate and the number diff. Open the PR; do not merge.
```

## 6. D1 dry run: what the summary row can show

Counted on 10 November 2026 from ukcouncils `origin/main` data files, for the 296 English billing authorities (the keys of `data/council-tax/england-2026-27.json`). A count of councils holding each fact, nothing more.

| Summary fact | Councils of 296 | File |
|---|---|---|
| Band D for 2026/27 | 296 | `data/council-tax/england-2026-27.json` |
| Type | 296 | `data/registry/councils.json` |
| Population, mid-2025 | 294 | `data/population/mye25-population.json` |
| Verified next election year | 174 | `data/elections/next-elections.json` |
| Budget return available | 287 (nine with no return) | `data/budget/ra-2026-27.json` |
| Collection rate, 2025/26 | 296 | `data/collection/collection-rates-2025-26.json` |
| Listed for Exceptional Financial Support | 51 | `data/efs/statements.json` |
| The council's own pay page | 254 | `data/links/local-links.json` |
| The council's bin day page | 207 | `data/links/local-links.json` |
| AI DOGE summary held, of which with a headline | 234, 228 | `data/spending/aidoge-summaries.json` |
| UK Food Hygiene URL in the registry | 293 | `data/registry/councils.json` |
| UK Demographics URL | 294 | as above |
| UK Elections URL | 144 | as above |

So the row always has Band D, type and collection rate; population on all but two; and the election year, budget, support status and service links only where held. The row must lay out cleanly with three facts and with six. The D1 session should recount these before building, since PR 37 and later imports may move them.

## 7. Order

| Step | Who | Starts when |
|---|---|---|
| Merge PR 42; DNS record and Verify | Tom | Now |
| Merge the navigation PR | Tom | Its checks pass |
| Codex A (A3) and Codex B (PR 37) | Codex, two windows | Now; A3 rebases onto the navigation PR if it has merged |
| Review A3 and PR 37 | Claude Code | Each PR opens |
| D1 and D3 on ukcouncils | Claude Code | PR 37 merged |
| D5 and D6 on ukcounciltax | Claude Code | A3 merged |
| D4 (UK Councils homepage) and D2 on ukcouncils | Claude Code | D1 merged |
| Balance the budget exploration (T3; round five handover) | Claude Code | Any time; documents only |

## 8. Revised plan after day one: quality, efficiency and order

Written late on 10 November 2026, after PRs 42, 43 and 45 merged and deployed, PR 37 passed its checks, and A3 opened as PR 46 with a review posted. It replaces section 7's order where they differ.

### 8.1 What day one showed

| What happened | Cost | Rule from now on |
|---|---|---|
| A brief fixed a chart label that the kit refuses for 194 of 296 councils | A3 stopped for a day | Any wording a brief fixes for a drawing is run through the kit gate for all 296 in both themes before the brief is handed over |
| Three tests asserted the old state (no beacon, twice; the mini map's size) | One Codex stop; one red main | Every brief carries an obsolete assertion clause: an assertion on a component the brief removes or a state it changes is replaced by its equivalent, in its own commit, and listed in the PR |
| PR 43 was opened without the browser suite and merged on a failed check through a chained command | Main red for an hour; no bad deploy, because publishing is gated | A PR that changes every page runs the full local gate, browser suite included, before it opens. Merging is always its own step after the check results are read; never chained to a watch |
| A clipped figure on the band bars passed every gate | Found only by looking | The reviewer looks at every chart label at 375 and 1440 in both themes. The kit gains a text against mark overlap check (8.3) |
| Each Codex stop needed Tom to carry a ruling back | Round trips | Briefs pre authorise the predictable choices and say which class of problem is a stop |

### 8.2 Efficiency: the pipeline is the bottleneck

Measured from the run list on 10 November: the `site` job on ukcounciltax takes 17 to 25 minutes on every pull request, including the two documents only ones, and the same job runs again on main before publishing, so a change takes about 45 minutes from green PR to live. It builds with `BUILD_OG=1` every time. A3 raises the local build from 548 to 980 seconds, so the job will approach its 40 minute limit. ukcouncils already builds without share images in CI and finishes in about 13 minutes.

One session, mechanical, suited to Codex, ahead of any further feature work on ukcounciltax:

1. Documents only changes (`docs/**`, `*.md`) skip the build, browser and deploy steps while still reporting the checks a merge needs.
2. Pull requests build without `BUILD_OG`; main keeps the full build before publishing. A small test still renders a fixed sample of share images and chart PNGs on pull requests so the renderer is exercised.
3. Cache the generated images across runs, keyed on a hash of the data files, the kit and the drawing code, so an unchanged chart is not redrawn.
4. Memoise `profileChartOptions` and the parish page read of `england.json` (review of PR 46).
5. Raise the job limit to 60 minutes until items 2 to 4 have landed, so A3 cannot time out.
6. Decide the chart PNG weight (Tom): 1x instead of 2x, or no map PNGs. A3's PNGs are 320 MB; only the two download links under each chart use them.

Target: under 10 minutes for a pull request and under 20 from merge to live.

Other savings: both tax sites take the same shared pieces (short source line, summary row, overlap gate) from the kit once, not built twice; the sister link table is produced once; Tom's merges are batched into one list per sitting; the finished worktrees on each repo (twelve and eleven listed today, most merged) are removed once Tom agrees.

### 8.3 Kit 0.4.0 first, as its own lane

The kit is where a fix reaches both sites and the LGR page. In `tompickup23/estate-kit`, Claude Code, no conflict with either site lane:

- an overlap check between text and marks, so a label under a bar fails the gate;
- a label on whichever bar is marked, not only A, D and H;
- the source printed once (inside the drawing or as the HTML line, by option);
- a short source line with its full entry, for D3;
- a summary row of stat tiles that lays out cleanly with three to six facts, for D1;
- body names taken from the data, not composed ("City of London council" is wrong).

### 8.4 Order, by lane

One writer per repository. Lanes run at the same time.

| Lane | Now | Next | Then |
|---|---|---|---|
| ukcounciltax, Codex | PR 46 fix pass (running) | Pipeline speed (8.2) | T2 the receipt; T4 the band check |
| ukcounciltax, Claude Code | Review PR 46 again when the fix pass lands | D5 and D6 after PR 46 merges | C6 levels day staged, by mid January |
| ukcouncils, Claude Code | D1 and D3, the dossier, once PR 37 is merged | D4 homepage, D2 navigation | C2 who runs it; C5 what the council does; the national reorganisation page |
| estate-kit, Claude Code | Kit 0.4.0 (8.3) | Adopt in both sites with the next PR in each | |
| Tom | Merge PR 37 and PR 44; submit the sitemap in Search Console | Merge PR 46 after the fix pass | Rule on chart PNG weight; approve worktree cleanup |

D1 can start before kit 0.4.0 lands by using the site's existing `Fact` and drawer components, then swap to the kit's summary row in its follow up. It should not wait.

### 8.5 Dates that bind

| Date | What |
|---|---|
| Weekly from 17 November 2026 | A short measurement note: Cloudflare page loads and Search Console clicks, impressions and Google's chosen canonical for ten shared URLs. Nothing is judged on less than two weeks of data |
| December 2026 | Rerun the UK Places link check: `src/lib/council-links.ts` fails every build from 4 January 2027 |
| December 2026 to February 2027 | Referendum principles: the facts only explainer and the 2027/28 page indexed on UK Council Tax |
| Mid January 2027 | Levels day staged (C6); the UK Councils dossier live on all 296 pages |
| 20 March 2027 | Data and structure freeze on both sites |
| May to June 2027 | The reversal, gated on the dossier and on Search Console evidence |

### 8.6 Prompt: pipeline speed (Codex, ukcounciltax, after PR 46 merges)

```text
Repo ukcounciltax. Create worktree ~/wt/uct-ci on branch chore/ci-speed from origin/main. Node 22. Read CLAUDE.md, .github/workflows/release.yml and docs/PLAN-2026-11-10-EXECUTION.md section 8.2. One commit per item, in this order.

1. Raise the site job's timeout to 60 minutes.
2. Documents only changes: when a pull request or a push to main changes only docs/** or *.md files, skip install, build, tests, browser suites and publish, and still report the site, number diff and design check checks as passed so the PR can merge. Do it inside the existing jobs with a first step that detects the changed paths; do not use workflow level paths-ignore, which would leave required checks unreported.
3. Pull requests build without BUILD_OG; pushes to main keep BUILD_OG=1 before publishing. Add a unit or dist test that renders a fixed sample (the homepage card, Burnley's share card and Burnley's four profile chart PNGs in both themes) so the renderer is exercised on every pull request. Confirm npm run test:dist and the chart link checks behave correctly when images are not built, without weakening them on main.
4. Cache generated images across runs with actions/cache, keyed on a hash of data/**, src/vendor/estate-kit/**, src/lib/kit-charts.ts, src/lib/figures.ts, src/lib/og.ts and the og routes. A cache hit must never serve an image for changed data: prove it with a test that changes one figure and shows the key changes.
5. Memoise profileChartOptions and the per page read of data/national/england.json in scripts/check-dist.mjs. No output may change: compare a full build before and after byte for byte for HTML and by hash for images.
6. Record before and after timings for a pull request run and a main run in docs/RELEASE.md.

Stop and report if any change would weaken a gate on main, alter a built page, or leave a required check unreported. British English; no em dash, en dash or spaced hyphen anywhere; stage named paths only; open the PR; do not merge.
```
