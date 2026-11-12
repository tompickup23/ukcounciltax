# Codex prompts, round two | 12 November 2026

Five prompts, written after the six prompts of 11 November 2026 (`docs/CODEX-PROMPTS-2026-11-11.md`) all merged and deployed, and after UK Councils PR 48 (kit 0.5.0, short citations, homepage, header) merged and deployed on 12 November 2026. Each is self contained and is pasted alone. None authorises a merge, tag or deployment; Tom authorises those in chat.

Read with `docs/HANDOFF-2026-11-12-REVIEW-AND-NEXT.md` (the state and the plan) and `docs/NAVIGATION-AND-VISUALS-BRIEF-2026-11-11.md` (items NV1 to NV14, decisions W1 to W7).

## Order and what each waits for

One writer works in each repository at a time. The prompts for one repository run one after another, each from a main that holds the one before.

| Prompt | Repository | Waits for | Size |
|---|---|---|---|
| 1. The way in to the increases page (NV6) | ukcounciltax | The onward links PR of 12 November merged (it touches other files, so this can also start beside it) | Medium |
| 2. Kit 0.5.0 | ukcounciltax | Prompt 1 merged | Medium. Touches every chart |
| 3. Small faults (NV7) and the parish index | ukcounciltax | Prompt 2 merged | Medium |
| 4. The way in to Exceptional Financial Support (NV6) | ukcouncils | Nothing | Medium |
| 5. Nearby and alike (NV5) | ukcouncils | Prompt 4 merged | Medium |

Prompts 1 and 4 can run at the same time, because they are in different repositories.

Not written here, with the reason:

- **Kit 0.6.0 and the drawings (NV8 to NV13).** The kit's upgrade plan of 11 November 2026 recommends a stop rule (P1): no new chart form until the charts already built are taken by the sites. The navigation brief orders five new forms. Tom rules on which holds (decision X1 in the handover) before a prompt is written.
- **The kit's gates pack (stage 2 of its upgrade plan).** Hosted CI on estate-kit still fails at start (the Actions billing block), and the vendor command (estate-kit PR 9) is open. Both come first.
- **Balance the budget (C2).** Waits for Tom's decision on PR 61.
- **Nearby and alike on UK Council Tax profiles.** Best written from what prompt 5 leaves, so the two sites take one form.

## 1. ukcounciltax: the way in to the increases page (NV6)

```text
Repository tompickup23/ukcounciltax. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: /increases/ measured 17,635 px tall at 375 wide on 11 November 2026, with 12 tables and 1,291 table rows, and it opens with the 2027/28 "not yet set" notice before any figure. A reader who wants one council's rise has no way to reach it. Item NV6 in docs/NAVIGATION-AND-VISUALS-BRIEF-2026-11-11.md (on main once PR 54 merges; otherwise read it from the branch docs/navigation-visuals-brief).

Setup: worktree ~/wt/uct-increases on branch feat/increases-way-in from origin/main. Copy the ignored folder data/raw/ from ~/wt/uct-ci/data/raw/. Read CLAUDE.md, src/pages/increases.astro, src/components/CouncilPicker.astro, src/lib/council-picker.ts, the shared matching helper the picker and compare use, and e2e/council-picker.spec.ts.

Step 1, measure and commit nothing yet: the height of /increases/ at 375 and 1440 wide, the count of tables and rows, and the count of councils with a published own share change in the current year. Read every count from the built page or the data, not from this prompt.

Step 2, build:
1. The current year's answer comes first: the published figures the page already prints for the current year, under the H1 and lede. The H1, title, URL and canonical do not change.
2. The 2027/28 notice becomes one line with a link to its page (NEXT_YEAR_PATH). Nothing about 2027/28 is stated beyond what the page says today.
3. A "Find my council" box above the current year's tables. Typing a name, county or region uses the same matching as the picker (reuse the helper; do not write a second matcher). Choosing a council scrolls to its row in the current year's table, opens any closed parent, marks the row and moves focus to it. A council with no published change says so in words. Nothing is stored and nothing enters the URL except the existing row anchor if rows already have one.
4. Earlier years go inside closed details elements, one per year, each keeping its tables, source lines and anchors. A link to an anchor inside a closed year opens that year (script on load, on hash change and on click, as the UK Councils source drawer does in src/components/ProfileSources.astro at ukcouncils 9c2b356).
5. With scripts off the page is complete: the current year open, earlier years reachable as native details, the find box hidden until its script runs so nothing shifts.

Do not add a drawing: the increases drawing (NV9) waits for a ruling on the kit. Do not change any figure, sort order within a class, or source line. Like is compared only with like, as now.

Obsolete assertions: where a test asserts the old order or the old notice, replace it with its equivalent in a commit of its own and list each in the PR body.

Checks, each read with its exit code before the next: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text. For the browser suite start the preview yourself (npx astro preview --host 127.0.0.1 --port 44421), run npx playwright test with E2E_BASE_URL=http://127.0.0.1:44421, then npx astro preview stop; then npm run test:csp, which starts its own server. Add browser tests for: finding a council and landing on its marked row, a link into a closed year, scripts off, no horizontal overflow at 375, axe clean, both themes. Look at the page yourself at 375 and 1440 wide in both themes.

PR body: the measurements before and after as a table; under "## Pages allowed to differ" a fenced list of globs (expected: increases/index.html only) with one sentence on what differs; under "## Pages to capture" the page. No printed figure should change; if the number diff finds one, stop and report.

Stop and report, without opening a PR, if the matching helper cannot be reused without changing the picker's behaviour, or if any figure, anchor that another page links to, or redirect in public/_redirects would have to change. Decide small design questions yourself and list each in the PR body.
```

## 2. ukcounciltax: Estate Kit 0.5.0

```text
Repository tompickup23/ukcounciltax. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: this site carries Estate Kit v0.3.0 (src/vendor/estate-kit/VERSION, commit 1fdcc39). UK Councils took v0.5.0 on 12 November 2026 (ukcouncils 9c2b356), so the two tax sites are two versions apart. The kit's upgrade plan asks for one version across the sites that carry it. Version 0.4.0 added the gate for text against marks and bar labels placed clear of every bar; 0.5.0 added linked citations, summary rows and an optional body name check, each off by default.

Setup: worktree ~/wt/uct-kit-050 on branch chore/kit-0.5.0 from origin/main. Copy the ignored folder data/raw/ from ~/wt/uct-ci/data/raw/. Read CLAUDE.md, src/vendor/estate-kit/VERSION and README.md, tests for the vendored copy, and in tompickup23/ukcouncils at 9c2b356: src/vendor/estate-kit/VERSION, tests/vendor.test.ts and docs/DESIGN-ROUND-TWO-2026-11-12.md (the section "Kit and citations"). The kit is tompickup23/estate-kit, tag v0.5.0, commit 5680ba5e00bd764313f63ac820ab6fa2a7e3a610. Read its CHANGELOG.md for 0.4.0 to 0.5.0.

Task, in two commits:
1. Vendor the tag exactly as UK Councils did: built from a clean archive of the tag, VERSION naming the tag and commit and listing a sha256 for every vendored file, and the test that checks the file list, every hash and that no ignore rule hides a file. Vendored code is not edited. This site's skin and token file stay its own.
2. Whatever this site's code must change to build against 0.5.0, and nothing else. Do not turn on linked citations, summary rows or the body name check in this PR; each is a later decision.

Step 1 before any commit, measure on main with BUILD_OG=1: the count and total bytes of chart PNGs, and the sha256 of Burnley's three profile chart PNGs and its five budget round PNGs.

Expected and allowed: chart PNG bytes may change where 0.4.0 moved a bar label. Report, for every chart whose pixels change, the page and what moved, and look at each changed chart kind at 375 and 1440 wide in both themes. If the new gate for text against marks refuses a chart this site draws, stop and report the chart, the council and the gate's message; do not weaken the gate or reword a label to pass it.

Checks, each read with its exit code before the next: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, then the whole browser suite (start the preview yourself on port 44422 with E2E_BASE_URL, then stop it) and npm run test:csp. This PR touches every page with a chart, so the whole browser suite runs before it opens.

PR body: versions before and after; the count of charts whose pixels changed, by kind, with one before and after pair described; count and total bytes of chart PNGs before and after; build time before and after. No printed figure should change: the number diff must be empty without an allow list. If it is not, stop and report.

Stop and report, without opening a PR, if a hash of the built kit differs from what UK Councils recorded for the same file at the same tag, if any figure changes, or if the build needs a kit file edited.
```

## 3. ukcounciltax: small faults (NV7) and the parish index (NV6)

```text
Repository tompickup23/ukcounciltax. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: the navigation brief of 11 November 2026 lists small faults (NV7) and the parish index (part of NV6). Some were fixed in PRs 55 to 60. This PR fixes what is left. Read docs/NAVIGATION-AND-VISUALS-BRIEF-2026-11-11.md, items NV6 and NV7.

Setup: worktree ~/wt/uct-small-faults on branch fix/nv7-small-faults from origin/main. Copy the ignored folder data/raw/ from ~/wt/uct-ci/data/raw/. Read CLAUDE.md first.

Step 1, audit and commit nothing yet. For each item below, say from the code and the built page whether it is already done, with the file and line. Do only those that are not done.
1. Band pages carry one set of table controls per region (the brief counted nine). One set at the top that drives every regional table on the page. With scripts off every table is complete as now.
2. TaxTable cannot sort by charge until a council type is chosen. Say so in words beside the control. When the reader arrives from a profile link that names the type, default to it.
3. Profile contents pills (the brief counted up to 14). Group them under four or five headings. Every existing anchor still works.
4. The homepage name finder covers the 54 Scottish and Welsh councils, each labelled by nation (decision W6), if typed search did not already bring this.
5. The parish index (/precepts/parishes/, 214 rows when the brief was written): sortable headers that update aria-sort, and the region chips from the picker. No search across individual parish rows; that waits for T1.
6. Region pages and band pages end with links to the neighbouring regions or bands and to the class rankings.

Rules: no figure changes; no comparison across council classes, nations, years or charge bases that the site does not already make; titles, H1s, URLs and canonicals stay. Static HTML stays complete without scripts. No horizontal overflow at 375. New scripts are hashed by the postbuild step; do not relax a header.

Obsolete assertions are replaced in a commit of their own and listed.

Checks, each read with its exit code before the next: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, the whole browser suite (preview on port 44423 with E2E_BASE_URL, stopped afterwards) and npm run test:csp. Add a browser test for each item built. Look at each changed page at 375 and 1440 wide in both themes.

PR body: the audit as a table (item, already done or built here, evidence); under "## Pages allowed to differ" a fenced list of globs with one sentence each; under "## Pages to capture" one page per item built. The number diff should show no changed figure; if it does, stop and report.

Stop and report if any item needs a figure the site does not already print, or a change to a vendored kit file. Decide small design questions yourself and list each in the PR body.
```

## 4. ukcouncils: the way in to Exceptional Financial Support (NV6)

```text
Repository tompickup23/ukcouncils. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: /exceptional-financial-support/ measured 74,866 px tall at 375 wide on 11 November 2026, about 92 phone screens, with 13 tables and no way to reach one council. Item NV6 in the navigation brief (tompickup23/ukcounciltax, docs/NAVIGATION-AND-VISUALS-BRIEF-2026-11-11.md, on main or on the branch docs/navigation-visuals-brief).

Setup: worktree ~/wt/ukc-efs-way-in on branch feat/efs-way-in from origin/main (it must hold 9c2b356, the kit 0.5.0 merge; if it does not, stop). Copy data/raw/ from ~/wt/ukc-search/data/raw/ if tests need it. Read CLAUDE.md, src/pages/exceptional-financial-support.astro, src/lib/efs.ts, src/lib/efs-presentation.ts, src/components/EfsFigure.astro, src/components/CouncilPicker.astro and src/lib/council-picker.ts, docs/EFS-BRIEF.md and docs/EFS-SOURCE-NOTES.md.

Step 1, measure and commit nothing yet: the height at 375 and 1440 wide; the count of councils and of statements on the page, read from the data (the brief read 57 and 126 from the page; trust the data, and report both).

Step 2, build:
1. A small find box near the top over the councils the page lists: type a name, county or region (reuse the picker's matching helper; do not write a second matcher), choose a council, and the page scrolls to that council's block, opens it and moves focus to its heading. A council that is not on the page is told so in words, with a link to its profile.
2. In the "By council" section each council's block sits inside a closed details element whose summary gives the council's name and the years it appears in. Every figure, marking, revision note and source line inside is unchanged. A link to a council's anchor opens its block (script on load, on hash change and on click, as src/components/ProfileSources.astro does for the source drawer).
3. The yearly tables in "By year" stay as they are, open.
4. With scripts off the page is complete and every block is reachable as a native details element. The find box is hidden until its script runs.

Do not add a drawing (NV12 waits for a ruling on the kit). Do not total, rank or compare councils beyond what the page already does. Held quotations stay suppressed. Markings and revision notes keep their wording.

Obsolete assertions are replaced in a commit of their own and listed.

Checks, each read with its exit code before the next: npm run check, npm test, npm run build, npm run test:dist. For the browser suite start the preview yourself (npx astro preview --host 127.0.0.1 --port 44424) and run with E2E_PORT=44424, then npx astro preview stop; then npm run test:csp. Add browser tests for: finding a council and landing on its opened block, a link from a council profile into a closed block, scripts off, no horizontal overflow at 375, axe clean, both themes. Look at the page at 375 and 1440 wide in both themes.

PR body: heights and counts before and after; under "## Pages allowed to differ" a fenced list of globs (expected: exceptional-financial-support/index.html only) with one sentence; under "## Pages to capture" the page. No printed figure should change; if the number diff finds one, stop and report.

Stop and report, without opening a PR, if any profile's link into this page would break, or if a figure, marking or source line would have to move out of its block. Decide small design questions yourself and list each in the PR body.
```

## 5. ukcouncils: nearby and alike on council profiles (NV5)

```text
Repository tompickup23/ukcouncils. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: a council profile links to no neighbouring council and to no other district of its county; the similar councils list is bare names in a closed drawer. Item NV5 in the navigation brief (tompickup23/ukcounciltax, docs/NAVIGATION-AND-VISUALS-BRIEF-2026-11-11.md).

Setup: worktree ~/wt/ukc-nearby on branch feat/nearby-and-alike from origin/main, after the Exceptional Financial Support way in PR has merged. Read CLAUDE.md, the council page under src/pages/councils/, src/lib/council-links.ts (similarCouncils), the registry's county for each shire district, and in tompickup23/ukcounciltax src/lib/game-neighbours.ts, which computes neighbours by shared boundary points from the pinned ONS boundary file. Copy that approach into this repository; do not import across repositories.

Step 1, dry run and commit nothing yet: for all 296 councils, the count of neighbours by boundary, the count of other districts in the same county (shire districts only), and any council with none of either. Islands and the City of London need a look. Write the dry run to docs/ as JSON and report its sha256.

Step 2, build one block on every profile, "Nearby and alike":
1. Neighbours by boundary, computed from the pinned boundary file, never typed.
2. For a shire district, the other districts of the same county, from the registry.
3. The similar councils the page already computes, moved here from the closed drawer, as links.
4. Each link shows the council's name and type. A Band D figure beside a name is allowed only where both councils are of the same class, since only like is compared with like; where the class differs, print the name alone. Every figure carries the page's existing Band D source through the citation pass (the first use full, later uses short).
5. The block is marked data-pagefind-ignore so council names here do not flood site search.
6. The county council named on a district page stays text until county councils have pages (C7).

Rules: no new figure, only ones the site already prints; unknown is not zero; titles, H1s, URLs and canonicals stay. Static HTML is complete without scripts. No horizontal overflow at 375.

Obsolete assertions are replaced in a commit of their own and listed.

Checks, each read with its exit code before the next: npm run check, npm test, npm run build, npm run test:dist, the whole browser suite (preview on port 44425 with E2E_PORT, stopped afterwards) and npm run test:csp. This PR changes all 296 profiles, so the whole browser suite runs before it opens. Add tests that every neighbour link resolves, that no council links to itself, and that no figure is printed across classes. Look at Burnley, Cornwall, the Isle of Wight and the City of London at 375 and 1440 wide in both themes.

PR body: the dry run counts; the height of the Burnley profile at 375 before and after; under "## Pages allowed to differ" a fenced list of globs (expected: councils/*/index.html) with one sentence on what differs, naming every figure the block newly prints; under "## Pages to capture" the four profiles above.

Stop and report, without opening a PR, if the boundary file cannot give neighbours for a council that plainly has them, or if the citation pass refuses the block's source lines. Decide small design questions yourself and list each in the PR body.
```
