# Budget game for every council | Codex plan

Written 8 November 2026 in Claude Code. It builds idea I001 from the ideas register (Reports PR 603, branch `docs/ideas-register-2026-11-08`, `Ideas_Register_work/IDEAS.md`): a neutral budget game for every English billing authority, on ukcounciltax at `/tools/budget/`. The assessment came from the "Polymathy project brainstorm" session of the same day, and the competitor evidence from `Ideas_Register_work/research/2026-11-08_B_public_money_tools.md` on that branch.

**Phase 0 is done.** It was done in Claude Code and recorded in `docs/BUDGET-GAME-SOURCE-NOTES.md`: the pinned edition and hashes, the workbook layout, the reconciliation results, anchor values and the design decisions that follow from the data. Where the notes and this plan differ, the notes win.

Nothing in this plan publishes or deploys. The build ends with an unmerged PR.

## Background

- **The site.** ukcounciltax builds 296 council pages (billing authorities only; the 21 county councils have no page). `/tools/` holds one tool, `future-cost` (`ScenarioCalculator.astro`, `src/lib/scenario.ts`, model version 1.0). Table 10 for 2026/27 is already in `data/national/england.json`: for each billing GSS, own share with and without parishes, area average, tax base, and the county, police, fire and combined parts with their codes. The CSP allows no inline script; `scripts/inject_csp_hashes.mjs` hashes what Astro inlines into `dist/_headers`. `connect-src` is `'self'` plus postcodes.io.
- **The site's data rule.** No build or refresh reads a sibling checkout. National data comes from pinned imports hashed in `data/national/sources.json` (`docs/NATIONAL-DATA-REUSE.md`). AI DOGE's `~/aidoge-site/data/budgets/` (318 files, latest year 2024/25, some years from council budget books) is a cross-check only.
- **The source.** MHCLG's RA 2026/27 individual authority data, published 11 June 2026, never revised. 406 of 415 authorities returned. Nine billing authorities did not: Castle Point, Coventry, Cumberland, Dudley, Epping Forest, Greenwich, Guildford, South Gloucestershire and Warwick. That leaves 287 billing authorities with data, plus all 21 counties.
- **Competitors.** Delib Budget Simulator is sold one council at a time (Angus Council paid £5,000 a year in 2021). Council reports show hundreds of completions, not thousands: Cheshire West 2017 had 300 from 2,335 users, 9.9 per cent, averaging 4 minutes 33 seconds to balance. No free simulator covers every UK council.

## Decisions taken as defaults (Tom can overrule before starting Codex)

| | Question | Default |
|---|---|---|
| D1 | One page per council, or one tool with a selector? | One page per billing authority at `/tools/budget/<slug>/`, indexable and self-canonical, with the observed tables in plain HTML, plus `/tools/budget/` as the index. |
| D2 | Two-tier areas | A district page carries both its own budget and its county's. Counties get no page of their own. |
| D3 | "Your version" scenario round | Phase 4, as an illustrative scenario with a model version. Left out if time is short, and the PR says so. |
| D4 | "Close the gap" round | Not built. No national return holds a council's medium-term gap (I018). |
| D5 | Completion metrics | Not built. Analytics is off and the beacon question is still open (3 November). Nothing is stored. |
| D6 | One PR or two | One PR, one commit per phase. Stop after phase 1 if the data fails its checks. |
| D7 | Receipt splitting a resident's bill by service | Dropped from this build: it needs an apportionment assumption, and education and public health are funded largely by ring-fenced grants. It moves to I006. |
| D8 | The nine councils with no 2026/27 return | They get a page that says so, with the Table 10 bill split and no game. No figures from any other year. |

## Codex brief

The short prompt pasted into Codex points here. This section is the full instruction.

```text
You are building the budget game for every English council on UK Council Tax (ukcounciltax.co.uk), idea I001 of Tom Pickup's ideas register. Nothing you do publishes or deploys: you finish with an unmerged pull request and a report.

WHERE YOU WORK
A worktree already exists at ~/wt/uct-budget-game on branch feat/budget-game-i001, cut from origin/main at 709866c. Its first commit adds this plan and docs/BUDGET-GAME-SOURCE-NOTES.md. Work only there. Do not touch the shared checkout ~/ukcounciltax, which holds another session's uncommitted files, or the other ukcounciltax worktrees under ~/.aidoge-worktrees/. Run gh pr list and name in the PR body any open PR that touches src/lib/site.ts, src/lib/paths.ts, src/pages/councils/[slug].astro or public/_headers. Stage named paths only (never git add -A or git add .), and never bypass the pre-commit hook. Do not push until phase 5. Then push the branch and open the PR.

READ FIRST, IN THIS ORDER
1. ~/.codex/AGENTS.md and ~/.claude/CLAUDE.md. Tom's conventions: British English; no em dash, en dash, their HTML entities or JSON escapes, and no spaced hyphen used as a dash, anywhere, including JSON, CSV, scripts and commit messages; every figure names its source; never estimate a figure that will be published as fact.
2. CLAUDE.md in the worktree (AGENTS.md is a symlink to it; never replace the symlink), then docs/BUILD-BRIEF.md sections 5 to 7, docs/NATIONAL-DATA-REUSE.md and docs/RELEASE.md.
3. docs/BUDGET-GAME-SOURCE-NOTES.md, all of it. It is binding: the pinned files and hashes, the row filter, the lines used, the reconciliation fixture, the anchor values and design decisions 1 to 9. Where this brief and the notes differ, the notes win.
4. Code to copy patterns from: src/pages/tools/future-cost.astro, src/components/ScenarioCalculator.astro, src/lib/scenario.ts, scripts/import-national.mjs, scripts/import-collection-rates.mjs, scripts/lib/ods.mjs, data/national/sources.json, data/national/england.json, src/lib/site.ts (SITE_URL, STATIC_PATHS), src/lib/paths.ts (programmaticPaths feeds the sitemap), scripts/inject_csp_hashes.mjs, scripts/check-dist.mjs, scripts/check-text.mjs, tests/, e2e/ and e2e-csp/.
5. Reference only, never a data source: ~/aidoge-site/data/budgets/*.json, ~/aidoge-site/scripts/extract_budgets.mjs, and ~/Documents/Reports/LCC_Budget_Game/README.md and template.html. The Lancashire game carries Reform material and an Elections Act imprint. None of its wording, framing, savings story or imprint comes across. This game is a neutral public tool.

PHASE 1: THE DATA (commit "Import RA 2026/27 budget data")
1. scripts/import-ra-budget.mjs, on the pattern of import-collection-rates.mjs. It fetches the three pinned files (RA Part 1, RA Part 2, SG) only when missing, refuses any file whose sha256 differs from data/national/sources.json, and writes data/national/budget.json. Add the three source entries to sources.json with the publisher, title, sheet names, page URL, file URLs, sha256, publication date 2026-06-11 and retrieved date. Append the importer to the data:national script in package.json.
2. Read the workbooks with scripts/lib/ods.mjs readOds(). It was checked on 8 November and reads all three, including RA Part 2's ODF error cells, which made pandas fail. Values come back as displayed text with thousands separators, so parse them with figure(). Add a test that Part 2's error cells come through as null or as their displayed marker, never as zero. Do not switch libraries.
3. Read sheet RA_LA_Data_2026-27 in both RA parts and SG_LA_Data_2026-27 in SG, locating the header row by the "E-code" cell and the columns by the asset ID row (the notes, section 3). Keep only rows whose ONS code is nine characters and starts with E06, E07, E08, E09 or E10. That gives 317 councils (296 billing plus 21 counties), 308 with data. Store integers in GBP thousands exactly as printed, with the unit. A [x] marker becomes null with status "no return", and the nine councils listed in the notes keep that status. Never fill a council from another year or another source.
4. For each council, store: the thirteen service totals and their sub-lines with RA line numbers and printed labels; line 799; line 900; the twelve financing lines and line 990; line 821; the Part 2 reserves for lines 1011 to 1016 at the start and end of the year; SG line 102 DSG; the MHCLG note markers (note 4, note 8, M). For each billing authority, record its county code from Table 10 parts[kind=county].code.
5. tests/budget.test.ts (vitest). Each test fails the build:
   a. service totals sum to line 799 for every council (tolerance GBP 2 thousand, the printed rounding);
   b. the financing identity: line 900 plus the twelve financing lines equals line 990 for every council;
   c. the Table 10 reconciliation against the reviewed fixture of 16 councils in the notes, section 4: line 990 times 1,000 against ownWithParishPence / 100 times taxBase. Any council not in the fixture outside 0.05 per cent fails, and so does any fixture council whose difference moves by more than 0.01 percentage points. Commit the fixture as tests/fixtures/budget-ct-reconciliation.json;
   d. counts: 317 councils kept, 308 with data, and the nine named councils with status "no return";
   e. the anchor values in the notes, section 4, asserted exactly for Burnley, Birmingham, Westminster and Lancashire;
   f. every district resolves to exactly one county and every county to at least one district.
   The two sub-line mismatches the notes mention are reported in the data file's notes, not asserted away.
6. A one-off cross-check, not shipped code: run the parser on the RA 2024/25 individual authority file (find it in the same GOV.UK collection and record its URL and hash in the PR) and compare five councils with ~/aidoge-site/data/budgets/<id>.json service_split for 2024/25. Choose councils whose AI DOGE 2024/25 source is the RA return, not a budget book. Report the differences and their causes in the PR body. Copy no values.
7. If a check fails for a reason the documents do not explain, stop after this phase, commit the importer and tests with the data write skipped, and report. A half-finished data refresh is never published.

PHASE 2: STATIC PAGES (commit "Budget pages for each council")
1. src/lib/budget.ts loads data/national/budget.json with process.cwd(), joins districts to their county, and marks every value as an observation or a calculation (BUILD-BRIEF section 7).
2. src/pages/tools/budget/index.astro and src/pages/tools/budget/[slug].astro, using the same councilPages() as the council pages: 296 pages, 287 with data and nine "no return" pages (D8). Titles in pipe style, for example "Burnley budget game | UK Council Tax", with a description of 160 characters or fewer. Neutral wording. No party, no political control, no councillor or officer named.
3. Without JavaScript each page with data shows:
   - spending by MHCLG service heading as printed, in pounds, with negative totals labelled "net income" in words (notes, decision 3), and the measure named (notes, decision 1);
   - education with the DSG sentence and amount beside it (decision 4), and line 140 under its printed name, with the SEND sentence (decision 5);
   - funding, as in decision 8;
   - non-ringfenced reserves at the start and end of the year, with the release's caveat (decision 7).
   In two-tier areas, the county's tables follow under their own heading. Every table has a caption and a SourceLine with the publisher, release title, sheet, publication date and link. The seven councils carrying note 4 quote MHCLG's note beside the council tax figure.
4. "Your bill" in plain HTML: the 2026/27 Band D from Table 10, split into the council, county, police, fire and combined authority parts already imported, with the band selector where the site already uses it. Use the existing labels for own share against area average. Never add a parish charge on top of an area average that already includes parish precepts. No receipt that splits the bill by service (D7).
5. Add "/tools/budget/" to STATIC_PATHS and the per-council routes to programmaticPaths. Add a card on /tools/, a short "Where the money goes" section on each /councils/<slug>/ page (its three largest positive service headings and a link), and entries on /methodology/, /sources/ and /coverage/ (coverage states 287 of 296 and names the nine). Add the routes to llms.txt only if its generator lists comparable routes.
6. No horizontal overflow at 375px. Follow the site's existing table pattern for narrow screens.

PHASE 3: THE GAME (commit "Budget game rounds")
1. Rounds, in order, each skippable, each ending with the observed answer and its source:
   a. Guess the split: the player shares 100p across the council's positive service headings, using steppers and number inputs (keyboard and screen reader friendly, not drag only). The reveal compares their pence with the actual shares of the sum of positive service totals, and says that is the base. Score: 100 minus half the sum of absolute differences, rounded. Net income headings are listed beneath, not guessed. Two-tier areas run a second screen for the county.
   b. Your bill: the player picks a band and guesses each body's share of it. The reveal comes from Table 10.
   c. Where the money comes from: the player orders the funding sources by size. The reveal shows the printed figures.
   d. Reserves: the player says whether the council plans to draw on its non-ringfenced reserves in 2026/27 or add to them, and picks a size band. The reveal shows the printed start and end figures and the caveat. No ratio, and no comment on whether the level is high or low.
   e. A summary card with the scores and the three answers the player was furthest from. A share link carrying only the slug and the scores, never a band or postcode, and a copy button. No social network scripts.
2. One client module bundled by Astro to /_astro/. Figures reach it through a <script type="application/json"> block, as ScenarioCalculator does. No inline executable script and no unsafe-inline: after the build, confirm inject_csp_hashes.mjs writes any hash Astro needs. No fetch beyond 'self'. No new runtime dependency unless it is small and justified in the PR.
3. The page reads in full without JavaScript. The game adds to the tables and never replaces them.
4. Neutral score text ("closest", "furthest"). No judgement of any council's choices.

PHASE 4: YOUR VERSION, ILLUSTRATIVE SCENARIO (commit "Budget scenario"; leave it out and say so if time is short)
A panel headed "Illustrative scenario", visibly separate from the observed figures. The player moves money between the council's positive service headings, with the total held fixed, and may set a council tax change in per cent. Show the change in the council tax requirement under a frozen tax base, change_in_requirement = change_in_own_Band_D x tax_base, from Table 10, the formula in BUILD-BRIEF section 6, and say it is not cash collected. Show the resulting own share and area average Band D, with the other precepts unchanged. Show the 2026/27 referendum principles only as a sourced fact from MHCLG's council tax levels release, never as a limit for any future year. Model version budget-scenario 1.0, with the assumptions beside the result. The scenario never writes into the observed tables or the share link. Add vitest tests on the pattern of tests/scenario.test.ts: zero, negative, upper bound and penny rounding.

PHASE 5: TESTS, DOCS, PR (commit "Budget game tests and release notes")
1. Playwright. In e2e: every round completes by keyboard; no overflow at 375px; the no-JS page shows every table; a no-return page shows its notice and no game; the share link restores the scores and carries no band or postcode. In e2e-csp, against the built site with the real headers: no CSP violation on /tools/budget/, on a two-tier page (burnley) and on a unitary page. Add the new pages to the existing axe accessibility checks.
2. Run these, all green, and paste the summaries into the PR: npm test, npm run check, npm run build, npm run test:dist, npm run test:text, npm run test:e2e, npm run test:csp, then BUILD_OG=1 npm run build as the final build. Recount the output: 296 /tools/budget/<slug>/ pages (287 with a game, 9 no-return), and the sitemap entries added.
3. Add a release entry to docs/RELEASE.md: the edition and hashes, the measure, the record types, the nine councils without a return, the note 4 councils, the DSG treatment, the reserves caveat, and the receipt left to I006. Add anything new you found to docs/BUDGET-GAME-SOURCE-NOTES.md.
4. Push feat/budget-game-i001 and open one PR to main titled "Budget game for every English billing authority (I001)". The body maps each phase to what was built and gives: the reconciliation results; the 2024/25 cross-check; the defaults D1 to D8 and any new decision; screenshots at 375px and desktop, light and dark; and what you did not do. End the body with: "Built with Codex from a plan drafted in Claude Code."
5. Do not merge, deploy, run wrangler, touch DNS, edit public/_headers beyond what the build needs, change any other repository, or edit Tom's ideas register.

STOP AND REPORT, rather than work around it, if: a pinned file's hash does not match; ods.mjs cannot read a workbook and the fix is not small; a reconciliation fails with no documented cause; the build needs inline script permission; or a page would need a figure that is not printed in a source you hold.

CLOSE WITH a short report: the PR number and URL, the pages built, the reconciliation results, whether phase 4 shipped, and anything left for Tom to decide.
```

## After Codex finishes

- In the PR, check the reconciliation section first. A wrong sheet or unit would show up in the Table 10 test.
- Run `/design-check` and `/fact-check` from Claude Code on `/tools/budget/burnley/` and one unitary page. Codex cannot run those.
- Merging deploys, so the merge stays with Tom. The register times the launch for budget season, January to March 2027. The 2027/28 edition follows MHCLG's June 2027 RA release.
- Later rows that build on this, each needing its own go-ahead: I005 (budget season live), I006 (a receipt for each council), I018 (close the gap where a budget report has been read), I024 (completion metrics), I026 (classroom mode).
