# Next sessions: Codex and Opus, from 9 November 2026

Companion to `docs/ASSESSMENT-2026-11-09-TAX-SITES.md`. Revised 10 November 2026 on Tom's steer: the near term is the site itself (the game live, the canonical and navigation fixes, the front door content, the data layer); social channels, press pages and promotion wait until the site is fully up with the game and are listed at the end. It turns the 15 ranked actions and 7 decisions into a sequence of sessions on the method that produced PR 26: Claude (Opus) prepares and reviews, Codex builds, Tom merges, merging deploys. Lanes as in `docs/CODEX-SESSIONS-BUDGET-GAME.md`: A is ukcounciltax, B is ukcouncils, one writer per repo at a time; C is Claude prep and review, which never blocks a lane.

## 1. Division of labour

| Give to Codex | Keep with Opus |
|---|---|
| Builds from a brief whose every assertion has been dry run against the real data | Anything that chooses a source, a figure or risky wording |
| Batches of small mechanical changes with a checklist, one commit per item | Design: marks, signature visuals, the estate kit |
| Rebases, reruns of the full gate, screenshots, PR bodies | Reviews: `/code-review medium`, `/design-check`, `/fact-check` on two pages |
| Importer moves and sync scripts once the schema and manifest are designed | Schema and manifest design, release calendar, docs in Reports |
| Test suites that assert what the brief states | Briefs, decisions, the handover trail |

Why: Codex's three stops on C1 were all research or design questions. A brief that answers them in advance makes a Codex session a pure build, and a batch PR costs one review cycle instead of five.

## 2. Sequence

Codex A and B run at the same time. Opus prepares the next brief while Codex builds and reviews as each PR opens. Dates avoid UK Elections' results week (12 to 16 November) for Tom's attention and the asylum release day (26 November). Merges in Tom's Friday batches under the five PR cap.

| When | Lane | Session | Depends on | Size |
|---|---|---|---|---|
| Tonight or 10 Nov | C (Opus, this session) | **O1.** Fix PR 26's three findings on its branch (titles and descriptions, the DSG guard, display names), rerun test, check, build, test:dist, test:text, push. Write and dry run three briefs: A1, B1, A2 below. Commit the two handover docs and the CLAUDE.md pointer fix in a docs PR | nothing | one session |
| 10 Nov | Tom | Merge PR 26 (deploys the game), PR 27 and the docs PR. Create the Search Console property for ukcounciltax.co.uk and give Claude the Cloudflare Web Analytics token (two constants, a one line Opus PR) | O1 | half an hour |
| 10 to 11 Nov | A (Codex) | **A1. C4 follow-up.** Rebase `feat/per-resident-i124` onto main (`--onto` if PR 26 was squash merged), rerun every check, push, open the PR with the screenshots the worktree already holds. Brief: the follow-up paragraph of `docs/PER-RESIDENT-BRIEF.md` | PR 26 merged | short |
| 10 to 12 Nov | B (Codex) | **B1. UK Councils quick wins batch.** One PR, one commit per item: UK Council Tax in the footer block and a contextual link under every Band D card (URLs checked against the live sitemap); the held reorganisation field printed on 14 pages; an EFS status line on the 51 councils the EFS page links, with anchors on the EFS page; "What is X council?" above the band selector; findings retitled; compare's headings filled server side; the sources page extended to AI DOGE, the calendar, ONS boundaries and EFS; the sisterLinks comment on UK Food Hygiene corrected. The reorganisation field stays held: its registry text predates MHCLG's 29 October 2026 withdrawal letter. Brief: `docs/B1-QUICK-WINS-BRIEF.md` in `~/wt/ukc-quick-wins` (branch `feat/links-held-fields`), committed 10 November | nothing (independent of PR 26) | medium |
| 12 to 14 Nov | A (Codex) | **A2. UK Council Tax quick wins batch.** One PR, one commit per item: six brand pages self canonical with the map, tests and snapshots updated; Scotland, Wales, Tools and What changed in the navigation and the two Sources entries made distinct; body links from `/council-tax/` and every profile to `/help/`, the nation hubs and the council's budget page; the format sweep (thousands separators in the increases table, long dates, one decimal percentages, no raw "Mar-27", hashes or file sizes in reader copy); own share card, year in the H1 and a source line under the lede on Scottish and Welsh pages; titles with queries on findings, changes and the future cost tool; a 404 with the finder; sitemap lastmod from data dates; budget game links from every profile; `national-export.ts` removed with its tests. Brief: `docs/A2-QUICK-WINS-BRIEF.md` in `~/wt/uct-quick-wins` (branch `feat/brand-canonicals-nav`), committed 10 November. The beacon is not in A2: it is two constants Opus sets the day Tom supplies the token | PR 26 merged (item 8 links its routes); A1 open or merged so one writer is in lane A | medium |
| 12 to 17 Nov | C (Opus) | **O2. Reviews** of A1, B1, A2 as they open: `/code-review medium`, `/design-check` and `/fact-check` on Burnley and a unitary page; small fixes in place; a fix list to Codex only if large. Record the three PRs in `docs/RELEASE.md` and the register rows in Reports (R340, R341, R343, R349, R323, R325) | the PRs | one session, spread |
| 17 to 21 Nov | C (Opus) | **O3. Marks and kit.** The bill and portico marks on the 64 unit tile in the clawd mark sheet, full favicon sets, both sites' tokens and marks into `estate-kit`, the council share card rendered through the kit's card set with domain and source edition. Design work, so Opus not Codex; adoption PRs on each site follow as Codex items in A3 and B2 | mark sheet v1, kit 0.1.0 (both exist) | one to two sessions |
| 17 to 21 Nov | A (Codex) | **A3. C1b, the scenario round.** Opus writes the brief first (half a session): scenario inputs out of the share fragment, the model version and assumptions block above the inputs, the running total moved above the inputs, a keyboard e2e for a multi input split, the CI cache for the three RA workbooks keyed on hash | A2 merged | medium |
| 24 Nov to 5 Dec | B (Codex) | **B2. C3, the UK Councils budget section.** Brief exists in `~/wt/ukc-budget` (`deb05ac`); Opus adds the PR 26 review carry overs (copy `budget.ts` and the importer, Note 4 and Note 8 placement, display names, the DSG guard on `grantindsg > 0`, county pages if wanted) and dry runs the counts | PR 26 merged, B1 merged | medium to large |
| 1 to 12 Dec | C (Opus) then A and B (Codex) | **O4 and D1, D2. Data repository.** Opus designs the producer repo in one session: dataset ids, `manifest.json` fields, one JSON schema per dataset, the release calendar, the bill season checklist. Codex then does the two mechanical sessions: move the importers and raws into the repo with first tagged editions and ajv validation; the consumer `data:sync` script, pinned manifests and the hash test in both sites. The one session of quick fixes (school holidays test wired in, cross repo equality test, cached sitemap reads, GSS join in the devolved importer) goes into D1 | nothing; start after the quick wins | three sessions, the minimum before 20 March |
| 8 to 18 Dec | A and B (Codex) | **A4, B3. Dataset markup batch.** Dataset markup with distribution on the tables of record, a cite line, last updated and next release lines on both homepages | the quick wins merged | small each |
| 11 Dec to 15 Jan | C (Opus) then Codex | **O5. Signature visuals** built in the kit (stacked 100 pound bar, band bar, position strip, choropleth, ranked strip, EFS timeline), then adoption PRs per site as Codex items with the kit pinned | O3 | two sessions plus adoption |
| When the draft principles report lands (Dec to Feb) | C (Opus) | **O6. Facts only explainer** on UK Council Tax, one feed item, a headline card without a figure | the report | short |
| Early Jan | C then A | **P6 and C6.** Levels day page, rankings per class, the year switch behind a flag, the embed as a static card plus snippet; everything renders nothing until 2027/28 data exists | D5, as written | one prep, one build |
| From 15 Dec | C | **R334, R339** whole site audits, again before the season | measurement live | one session |
| About 25 March | C | **R8 release morning** per D5 section 5; freeze from 22 March | C6, data repo | one morning |

## 3. What Tom holds

Accounts and tokens: the UK Council Tax beacon token and Search Console property (R340); Bing Webmaster Tools import (T41); a mailbox for UK Council Tax if decision 4 goes that way. Merges: PR 26, 27, the docs PR, then A1, B1, A2 as a Friday batch. Decisions 1 to 7 of the assessment; 1, 3, 5 and 7 are needed before A2, O3 and O1 respectively, and all four are recommended as "yes".

## 4. Efficiency rules carried forward

1. Every Codex brief is dry run: Opus runs each assertion the brief asks Codex to test and states each convention a test depends on.
2. Codex stops only on primary source or security failures; a design question gets the most conservative choice and a "Decisions taken" note.
3. Batch small items in one PR with one commit per item so review is per commit and merge is one deploy.
4. Stack dependent work on the open PR's branch and rebase after the merge; never push the stacked branch early.
5. Self review list in each brief; the Opus review confirms rather than reworks.
6. Lanes: one writer per repo; A and B in parallel; Opus prepares the next brief while Codex builds.
7. Design, sources and wording stay with Opus; builds, tests, rebases and batches go to Codex.
8. Nothing merges from 22 March until the release PR lands.

## 5. Paste prompts for the first Codex sessions

A1 (lane A, after PR 26 merges; fill in the merge sha): "Work only in `~/wt/uct-per-resident`, branch `feat/per-resident-i124`. PR 26 has merged into main as <sha>. Fetch, then rebase onto `origin/main`; if PR 26 was squash merged, rebase with `--onto origin/main 915fbd9` so the four phase commits are kept. Confirm `data/national/budget.json`, `src/lib/budget.ts` and `src/pages/tools/budget/[slug].astro` exist. Rerun every check in `docs/PER-RESIDENT-BRIEF.md` phase 4, then push and open the PR titled Social care spend per resident by age (I124), with the body from `docs/PER-RESIDENT-REPORT.md` and the six screenshots under `output/playwright/`. Stop on any anchor failure or hash mismatch. Do not merge."

B1 (lane B, now): "Work only in `~/wt/ukc-quick-wins`, branch `feat/links-held-fields`. Read `CLAUDE.md`, then `docs/B1-QUICK-WINS-BRIEF.md`, which is binding: eight items, one commit each, in order, with the assertions and stop conditions it lists. Run the full gate including the layout and csp suites, take the screenshots it names, push and open the PR it describes. Do not merge."

A2 (lane A, after A1's PR is open and PR 26 has merged): "Work only in `~/wt/uct-quick-wins`, branch `feat/brand-canonicals-nav`. Fetch and rebase onto `origin/main` first. Read `CLAUDE.md`, `docs/RELEASE.md`, then `docs/A2-QUICK-WINS-BRIEF.md`, which is binding: ten items, one commit each, in order, with the assertions and stop conditions it lists. Run the full gate ending with the `BUILD_OG=1` build, take the screenshots it names, push and open the PR it describes. Do not merge."

## 6. Deferred until the site is fully up with the game

Not before the quick wins, the budget game follow ups and the data layer are in: Bluesky and YouTube handles for either site; a press page per site and press lines; the hub's projects list entry; posting cards by region; the referendum principles explainer's social card. The marks and kit cards (O3) stay in the plan because the share cards are part of the site's pages, but their promotion does not.
