# Codex prompts for the next steps | 11 November 2026

Six prompts, written after ukcounciltax PR 55 (the council picker) and ukcouncils PR 44 (typed search) merged on 11 November 2026. Each is self contained and is pasted alone. None authorises a merge, tag or deployment; Tom authorises those in chat.

Read with `docs/HANDOFF-2026-11-11-NAVIGATION.md` (the order, section 4) and `docs/NAVIGATION-AND-VISUALS-BRIEF-2026-11-11.md` (items NV1 to NV14, decisions W1 to W7).

## Order and what each waits for

One writer works in each repository at a time, so the prompts for one repository run one after another, each from a main that holds the one before.

| Prompt | Repository | Waits for | Size |
|---|---|---|---|
| 1. Local links import | ukcounciltax | Nothing. It can start while PR 56 is open: PR 56 changes only `src/components/CouncilPicker.astro` and `e2e/council-picker.spec.ts`, which this import does not touch | Small. Binding date: builds fail from 4 January 2027 |
| 2. Local links import | ukcouncils | Nothing | Small |
| 3. Typed search (NV4) | ukcounciltax | Prompt 1 merged | Medium. Changes every page |
| 4. Compare improvements | ukcounciltax | Prompt 3 merged | Medium |
| 5. Picker and councils index (NV1, NV3) | ukcouncils | Prompt 2 merged, and ukcounciltax PR 56 merged | Medium |
| 6. Chart image weight (W4) | ukcounciltax | PR 51 merged, and prompt 4 merged | Medium |

Prompts 1 and 2 can run at the same time, as can 3 and 5, because they are in different repositories. Only prompt 5 needs the code in PR 56, because it copies the picker.

Not written here, with the reason:

- **The dossier's short source line (ukcouncils).** It needs kit 0.5.0 tagged, and estate-kit CI is blocked by the Actions billing fault. The navigation handover placed prompt 5 after it; running prompt 5 first is Tom's choice.
- **Kit 0.6.0 and the drawings (NV8 to NV13).** They wait for the kit 0.5.0 tag.
- **The way in to the increases page (NV6).** It follows prompt 4 and is best written from what prompt 4 leaves.
- **Balance the budget (C2).** An exploration in documents, for a Claude Code session, not a build.

## 1. ukcounciltax: import the refreshed local links

```text
Repository tompickup23/ukcounciltax. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: src/lib/council-links.ts throws on every build from 4 January 2027, 91 days after the payment links were checked on 5 October 2026. UK Places refreshed its reviewed export on 11 November 2026 and this imports it.

Setup: worktree ~/wt/uct-links on branch data/council-links-2026-11 from origin/main. Start now: this does not wait for PR 56 or any other open pull request, since it touches none of their files. Copy the ignored folder data/raw/ from ~/wt/uct-picker-scroll/data/raw/ (three unit test files fail without it). Read CLAUDE.md, scripts/import-council-links.mjs, src/lib/council-links.ts and data/council-links.json.

Task: import from tompickup23/ukplaces at commit 2bea52dbe74c7a689a500b3b73ff63dcefb900b6 (the merge of its PR 49; pin to this commit, not a branch). The sha256 of src/data/local-links.json at that commit is 085eb3b0511aca0f3fad79a9aa3f0decd5a7b5529240229ceed7731b3fb0b617. data/council-links.json must record the new export date, checked date, commit and sha256. Do not change the 91 day rule.

Expected: two council tax links are gone in the refresh, Halton and Aberdeen City, because UK Places' own check could not reach them. Report every authority whose link was added, removed or changed.

Checks, each read with its exit code before the next: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text. For the browser suites start the preview yourself (npx astro preview --host 127.0.0.1 --port 44396), run npx playwright test with E2E_BASE_URL=http://127.0.0.1:44396, then npx astro preview stop. Under load a lone timeout is rerun with the last failed option before it is called a failure.

PR body: what changed per authority; the commit and sha256 imported; under a heading "## Pages allowed to differ" a fenced list of globs for the pages whose pay link changed, with one sentence on what differs.

Stop and report, without opening a PR, if the computed sha256 differs from the one above, if the import script refuses the data, if more than the two links named disappear, or if any figure other than links and their source dates changes.
```

## 2. ukcouncils: import the refreshed local links

```text
Repository tompickup23/ukcouncils. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: UK Councils shows UK Places' reviewed links as the "Pay council tax" action on council pages (254 of 296 before this import). UK Places refreshed the export on 11 November 2026.

Setup: worktree ~/wt/ukc-links on branch data/local-links-2026-11 from origin/main. Copy the ignored folder data/raw/ from ~/wt/ukc-search/data/raw/. Read CLAUDE.md, scripts/import-local-links.mjs and data/links/local-links.json.

Task: import from tompickup23/ukplaces at commit 2bea52dbe74c7a689a500b3b73ff63dcefb900b6 (the merge of its PR 49; pin to this commit, not a branch) into data/links/local-links.json. The sha256 of src/data/local-links.json at that commit is 085eb3b0511aca0f3fad79a9aa3f0decd5a7b5529240229ceed7731b3fb0b617.

Report: how many profiles now have three actions and how many two (254 and 42 before), and every authority whose link was added, removed or changed. Halton's council tax link is expected to go, because UK Places' check could not reach it.

Checks, each read with its exit code before the next: npm run check, npm test, npm run build, npm run test:dist. For the browser suite start the preview yourself (npx astro preview --host 127.0.0.1 --port 44397) and run with E2E_PORT=44397, then npx astro preview stop; then npm run test:csp. Under load a lone timeout is rerun with the last failed option before it is called a failure.

PR body: the counts above; the commit and sha256 imported; under a heading "## Pages allowed to differ" a fenced list of globs for the pages whose action changed, with one sentence on what differs.

Stop and report, without opening a PR, if the computed sha256 differs from the one above, if the import script refuses the data, if the count of profiles with three actions falls by more than five, or if any figure other than links and their source dates changes.
```

## 3. ukcounciltax: typed search (NV4)

```text
Repository tompickup23/ukcounciltax. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. No inline script: the postbuild hashes and the CSP suite must pass. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: the site search treats a council name as any other word, so a name matches dozens of pages that only list it. UK Councils fixed this on 11 November 2026 (its PR 44, merged as 993ed703f39fe5ea19e11987d55e04ee7134c028). This ports that work and goes two steps further.

Setup: worktree ~/wt/uct-typed-search on branch feat/typed-search from origin/main. Copy the ignored folder data/raw/ from ~/wt/uct-picker-scroll/data/raw/. Read CLAUDE.md, docs/NAVIGATION-AND-VISUALS-BRIEF-2026-11-11.md (item NV4 and decision W6), src/components/Search.astro, src/components/CouncilPicker.astro, src/lib/council-picker.ts and src/lib/council-search.ts. Then read the same work in ukcouncils at the commit above: src/components/Search.astro, src/lib/council-index.ts, src/lib/council-search.ts, src/lib/page-type.ts, src/pages/council-index.json.ts, e2e/typed-search.spec.ts, tests/typed-search.test.ts and the lines it added to scripts/check-dist.mjs and e2e-csp/csp.spec.ts. Components are copied between the repositories, never imported.

Build:
1. A list of councils above the full text results in the search dialog, fed from a small JSON index built with the site. A status line that counts both lists.
2. Matching uses this site's own src/lib/council-search.ts, the same code the picker uses, so "lancashire" lists its 12 districts and a region name lists that region's councils. UK Councils' version matches a name only; do not copy that limit.
3. Each council row links to the council's page and, as smaller links beside it, to its budget game where one exists (nine councils have none; read that from the data) and to its parish precepts page where one exists. Read which pages exist from the route data, never from a typed list.
4. The 54 Scottish and Welsh councils join the list, each labelled by nation, and link to their own pages (decision W6). Their rows offer no budget game.
5. A page type label on each full text result, from Pagefind metadata, as UK Councils does. Lists that only name councils (the picker table, the finder list, ranking tables) carry data-pagefind-ignore so a name stops matching them. Pagefind matches a lone letter as a word: check that nothing you add makes a nonsense query return results (e2e/phase-two.spec.ts tests this).
6. Without JavaScript the search stays a link to /councils/.
7. Test the first keystrokes: type "burn" straight after the dialog opens and assert the council list is filled. A first query once showed nothing on the live site and was not reproduced.

Not in this PR: Pagefind type filters; any change to the compare page; any change to which figures a page prints.

Assert in tests: each of ten council names (Burnley, Leeds, Cornwall, Westminster, Kingston upon Hull, Bristol, Durham, York, Rutland and one Welsh council) lists that council first; "lancashire" lists 12 councils; the dist check finds the Pagefind assets and the index file; the CSP suite passes with the new script.

Report in the PR body: the count of full text results for "burnley" on a build of main and on this branch; the size of the index file; the weight of one council page before and after.

Checks, each read with its exit code before the next: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text. This PR changes every page, so run the whole browser suite and the CSP suite before opening it: start the preview yourself (npx astro preview --host 127.0.0.1 --port 44398), run npx playwright test with E2E_BASE_URL=http://127.0.0.1:44398, then npx astro preview stop. The CSP suite reads CSP_BASE_URL and starts its own server: npm run test:csp. Look at the dialog yourself at 375 and 1440 wide in both themes.

The number diff in CI compares printed numbers with main. The dialog is filled by script, so no page should differ; if any does, list it under "## Pages allowed to differ" as a fenced list of globs and say why.

Stop and report if the route data cannot say which councils have a game or a parish page, or if the CSP suite cannot pass without loosening a header. Decide small design questions yourself and list each in the PR body.
```

## 4. ukcounciltax: compare improvements

```text
Repository tompickup23/ukcounciltax. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. Every amount has a nearby source or a stated calculation. No inline script. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: /compare/ answers "how does my bill compare with theirs", and it should give that answer first and make both councils easy to choose. The council picker (PR 55, with the phone fix in PR 56) now exists to choose with.

Setup: worktree ~/wt/uct-compare-2 on branch feat/compare-improvements from origin/main. Copy the ignored folder data/raw/ from ~/wt/uct-picker-scroll/data/raw/. Read CLAUDE.md, src/pages/compare.astro and every test that names compare, src/components/CouncilPicker.astro, src/lib/council-picker.ts, src/lib/council-search.ts and the homepage card that links to /compare/. PR 52 made eight fixes to this page on 10 November 2026; read its diff so nothing it fixed is undone. Before building, write down in the PR body what the page already does for each item below.

Build:
1. Lead with the difference. Once two councils are chosen, the first thing under the heading is the difference in the annual charge for the chosen band in pounds, then as a percentage of the lower charge, then the annual difference divided by 12, labelled "a month, spread over 12 months". Say which council is higher. Print the calculation beside the percentage and the monthly figure. Do not call the monthly figure an instalment: councils set their own instalment plans.
2. One searchable chooser on each side, using the picker's matching (name, county, region, postcode) in a compact form: a box and a short list of matches, not the full table. A postcode goes to postcodes.io from the browser with the existing privacy line and is not stored. Nothing is stored in the browser (decision W5). Without JavaScript the page keeps a working way to choose both councils.
3. The homepage card says "One area against the England average" while the page compares two councils. Make the card say what the page does.
4. The page keeps updating in place, keeps its phone focus behaviour and keeps its refusal wording from PR 52.

Not in this PR, each for a reason: printing each source once (it needs kit 0.5.0, which is not tagged); any drawing, including paired bars (they wait for the kit); any change to which comparisons are allowed or refused across council types, nations, years or charge bases (that is Tom's decision and it has not been taken); UK Councils' compare page.

Assert in tests: the three figures for two fixed pairs, computed in the test from the data and not typed; a pair the page refuses is still refused with the same words; "lancashire" in either chooser lists 12 councils; a postcode chooses the right council with postcodes.io answered by the test; no horizontal overflow at 375; axe passes in both themes; the page works with scripts off.

Checks, each read with its exit code before the next: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, then the browser suite and the CSP suite. Start the preview yourself (npx astro preview --host 127.0.0.1 --port 44399), run npx playwright test with E2E_BASE_URL=http://127.0.0.1:44399, then npx astro preview stop; npm run test:csp starts its own server. Look at the page yourself at 375 and 1440 wide in both themes with two councils chosen.

PR body: before and after for each item; under "## Pages allowed to differ" a fenced list of globs (expected: the compare page and the homepage) with one sentence on what differs.

Stop and report if the percentage or monthly figure cannot be computed from figures the page already holds for both councils on the same basis. Decide small design questions yourself and list each in the PR body.
```

## 5. ukcouncils: the council picker and the councils index (NV1, NV3)

```text
Repository tompickup23/ukcouncils. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. No inline script. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: /councils/ here is 296 names by region with nothing beside them, and the typed search merged on 11 November 2026 (PR 44) matches a council's name only, so "lancashire" lists West Lancashire alone and "north west" lists North West Leicestershire and West Northamptonshire. UK Council Tax has a picker that solves both.

Setup: worktree ~/wt/ukc-picker on branch feat/council-picker from origin/main. Copy the ignored folder data/raw/ from ~/wt/ukc-search/data/raw/. Read CLAUDE.md, src/pages/councils/index.astro, src/components/Search.astro, src/lib/council-search.ts, src/lib/council-index.ts and e2e/typed-search.spec.ts. Then read, in tompickup23/ukcounciltax on origin/main: src/components/CouncilPicker.astro, src/lib/council-picker.ts, src/lib/council-search.ts, e2e/council-picker.spec.ts and tests/council-picker.test.ts. First confirm that ukcounciltax main holds the commit titled "Council picker: the list runs in the page on a phone" (its PR 56); if it does not, stop and say so. Components are copied between the repositories, never imported (decision W3).

Build:
1. Copy the picker and its row builder across and put it on /councils/ with each row linking to the council's page here. The figure column is area Band D, with its source line, as this site prints it today (decision S2 keeps Band D here until the reversal). Each row also shows council type and tier from the registry. The region jump pills stay.
2. Below 600 px the list runs in the page with no scroll of its own: twelve rows, then a button for the rest. Without JavaScript the whole table is in the page, A to Z, every row a working link. Nothing is stored in the browser.
3. Give the typed search the picker's matching, from one shared module, so a county lists its districts and a region lists its councils. A query that is a region's name lists that region, not councils whose names contain the same words.
4. Keep the 404 page's finder working with the shared matching.

Not in this PR: destination links on search rows; Pagefind type filters; the Exceptional Financial Support page; the dossier; any change to which figures a council page prints.

Assert in tests: the count of picker rows equals the count of council profile routes, read from the route data; "lancashire" lists 12 councils in the picker and in the search; "north west" lists the region's councils in both, with the count read from the registry; the picker's phone behaviour as in the copied spec; no horizontal overflow at 375; axe passes in both themes; the CSP suite passes.

Checks, each read with its exit code before the next: npm run check, npm test, npm run build, npm run test:dist. For the browser suite start the preview yourself (npx astro preview --host 127.0.0.1 --port 44400) and run with E2E_PORT=44400, then npx astro preview stop; then npm run test:csp. This PR changes the search dialog on every page, so run the whole browser suite before opening it. Look at /councils/ and the search dialog yourself at 375 and 1440 wide in both themes.

PR body: the height of /councils/ at 375 before and after; under "## Pages allowed to differ" a fenced list of globs (expected: the councils index only) with one sentence on what differs.

Stop and report if the registry cannot give a county for every shire district or a region for every council. Decide small design questions yourself and list each in the PR body.
```

## 6. ukcounciltax: chart image weight (W4)

```text
Repository tompickup23/ukcounciltax. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: every kit chart on a page has a PNG in each theme, used only by the download links under the chart. The execution plan of 10 November 2026 records 320 MB of PNGs after the council profiles were built. Tom ruled on 11 November 2026 (decision W4 in docs/NAVIGATION-AND-VISUALS-BRIEF-2026-11-11.md, section 6): PNGs stay at 2x; the weight comes down by offering a PNG in the light theme only, by palette compression where it changes nothing visible, and by building no PNG for the per council locator map. The ruling was taken without byte counts, so this PR measures first.

Setup: first confirm origin/main holds the commit titled "Speed up release checks without changing published output" (PR 51); if it does not, stop and say so, because it changes the same image routes. Worktree ~/wt/uct-png-weight on branch chore/chart-png-weight from origin/main. Copy the ignored folder data/raw/ from ~/wt/uct-picker-scroll/data/raw/. Read CLAUDE.md, the W4 entry named above, scripts/check-dist.mjs (the chart PNG rules), src/lib/kit-charts.ts, scripts/lib/og-policy.mjs, scripts/lib/image-cache.mjs and the routes under src/pages/og/charts/ and src/pages/og/budget/.

Step 1, measure and commit nothing yet. From a BUILD_OG=1 build of main record: the count and total bytes of chart PNGs in dist; the bytes of Burnley's four profile chart PNGs in each theme; the same four re-rendered at 2x in the light theme with palette compression. Confirm the present scale is 2x. Compare each compressed image with its original pixel by pixel and report the largest difference per channel.

Step 2, build:
1. Chart downloads offer one PNG, in the light theme. The dark PNG routes and files go. Share cards and other images that are not chart downloads are untouched.
2. No PNG is built or linked for the per council locator map. Its chart keeps its table and its other actions.
3. Palette compression is applied to chart PNGs only if step 1 shows no difference a reader could see and a saving of at least 20 per cent on the sample; otherwise leave it out and say so. Prefer a way that adds no dependency. If one is needed, add a single well known package with its lockfile change and name it in the PR body.
4. scripts/check-dist.mjs changes to match: one PNG per chart in the light theme, every link resolving to a file, none expected for the locator map. Replace the old assertions in a commit of their own and list them.

Do not edit vendored kit files. If a download link cannot be reduced to one theme from this site's side, stop and report exactly what the kit would need to offer.

Checks, each read with its exit code before the next: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, then the browser suite and the CSP suite. Start the preview yourself (npx astro preview --host 127.0.0.1 --port 44401), run npx playwright test with E2E_BASE_URL=http://127.0.0.1:44401, then npx astro preview stop; npm run test:csp starts its own server. Look at the actions under a chart yourself at 375 and 1440 wide in both themes, and open a downloaded PNG.

PR body: the measurements from step 1 as a table; count and total bytes of chart PNGs before and after; build time before and after; whether palette compression went in and why. No printed figure should change; if the number diff finds one, stop and report.

Stop and report if the total saving is under half, so Tom can rule again before anything merges. Decide small design questions yourself and list each in the PR body.
```
