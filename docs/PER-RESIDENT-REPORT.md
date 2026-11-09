# Social care spend per resident by age (I124)

## Scope and stack

Adds four sourced social care ratios to the existing budget pages, with explicit population years, county attribution and exclusion reasons. Work is confined to `feat/per-resident-i124`. The branch is rebased onto `origin/main` at `c3fc9d8`, which includes PR 26 merge `85f7e33`. The required budget dataset, library and route exist. All four implementation phases are retained, together with the two preparation commits. The release record and browser test conflicts were resolved by preserving both sets of checks and entries.

## Phases

1. `5634284`, Import ONS mid-2025 population by age. Added a pinned XLSX importer, source entry and `population.json`, and appended it to `data:national`. Added `read-excel-file` 9.3.14 as a development dependency because the repository had no XLSX reader. The workbook was downloaded on 8 November 2026, and matches the source notes' 1,026,940 bytes and SHA256 `8ae244e3341257ecccaee55f4973fe12f46afe6656ead6c1a9ed3f4f8585e40f`. The committed extract reproduces exactly. The three disjoint age bands sum to all ages; the overlapping adult band separately equals ages 18 to 64 plus ages 65 and over. It is not added a second time.
2. `c64f7f9`, Social care spend per resident. Added class-based eligibility, strict code joins and calculation records with unrounded values, numerator lines, denominator bands and both source editions. All source-note anchors pass to the penny; every residual reconciles exactly to line 360 less the ten age lines.
3. `3d56beb`, Show per resident figures on budget pages. Added the self-contained component, one route include with its import, methodology, Sources entry and release record. District pages show a county heading and use the county population. Every ratio has both editions and the exact year mismatch sentence. The two age ratios appear with the unattributed amount and share; the two small-population authorities have the required note. No client script was added.
4. Verify per resident figures and record handover, the commit containing this report. Added browser checks for the three requested examples without JavaScript and all seven exclusions, plus City of London production-header coverage. Corrected literal year labels to use the existing year helper and added source-hash guards against an unreviewed edition change. Updated the Sources browser assertion to include C1's three RA publications and the ONS workbook. The population tests fetch their pinned raw workbook only when missing, so they do not depend on this worktree’s download cache. The six requested screenshots are included under `output/playwright/`; other browser artifacts remain local.

## Coverage and sources

Counts follow the binding source notes and are checked against the imported data. ONS MYE25UK, MYE2 Persons, published 1 October 2026, supplies 333 English rows: 164 non-metropolitan districts, 63 unitary authorities, 36 metropolitan districts, 33 London boroughs, 21 counties, nine regions, six metropolitan counties and England. The importer retains all of them; the calculations produce no England figure.

MHCLG's 2026/27 RA Part 1, published 11 June 2026, has 153 social care authorities in classes SC, UA, MD and LB. Five have no return: Coventry (E08000026), Cumberland (E06000063), Dudley (E08000027), Greenwich (E09000011) and South Gloucestershire (E06000025). Barnsley (RA E08000038, ONS E08000016) and Sheffield (RA E08000039, ONS E08000019) are excluded for different boundary codes. There are 146 councils with ratios. None of the 164 shire districts receives its own ratio, including those with non-zero social care figures.

The rendered output has 296 billing-authority budget pages. Of these, 289 show eligible own-council or county ratios and seven show exclusion notices. The four missing district returns still have their county's per resident block, explicitly labelled as county figures. There are no county-only routes.

Primary source locators, edition metadata and hashes are retained in `data/national/sources.json`, `data/national/population.json` and `data/national/budget.json`. The binding source notes remain unchanged.

## Verification

| Check | Result |
|---|---|
| Pinned population import and reproduction | Pass; exact source hash, all geography counts, age sums and population anchors |
| npm test, one worker | 225 tests across 29 files passed, no skips |
| npm run check | 152 files, no errors, warnings or hints |
| npm run build | Passed, including Pagefind and CSP hashes |
| npm run test:dist | 688 HTML pages and 687 sitemap URLs passed |
| npm run test:text | 695 files passed |
| npm run test:e2e, two workers | 210 tests passed |
| npm run test:csp, two workers | 75 tests passed through Wrangler with actual production headers |
| Internal link audit | 48,532 destinations, no missing local files |
| BUILD_OG=1 npm run build | Passed with all 300 share cards, Pagefind and CSP hashes |

The final build passed the distribution, text and link gates again. All 688 HTML pages, the sitemap and CSP headers match the browser-tested build byte for byte: 690 files checked, no differences. Each of the 688 HTML pages points at a built share card.

Logs for the rebase gate are retained in `.ops/per-resident-followup/`. The source hashes and anchors all passed. The population extract, budget extract and binding source notes match their pre-rebase bytes. Browser suites used this worktree's ports 45321 and 49788. The final build used Node 22.23.4 with a 768 MiB heap and one Rayon thread; these are local invocation settings.

## Screenshots

Local screenshots capture the complete per resident section at 375px and at a 1280px desktop viewport. All six were visually inspected. The sticky global header is hidden only during section capture to prevent it covering a figure in the image; the site itself is unchanged. They were refreshed after the rebase and are included in this PR.

| Page | 375px | Desktop |
|---|---|---|
| Birmingham | ![birmingham 375](https://github.com/tompickup23/ukcounciltax/blob/feat/per-resident-i124/output/playwright/birmingham-375.png?raw=true) | ![birmingham desktop](https://github.com/tompickup23/ukcounciltax/blob/feat/per-resident-i124/output/playwright/birmingham-desktop.png?raw=true) |
| Burnley, showing Lancashire County Council | ![burnley 375](https://github.com/tompickup23/ukcounciltax/blob/feat/per-resident-i124/output/playwright/burnley-375.png?raw=true) | ![burnley desktop](https://github.com/tompickup23/ukcounciltax/blob/feat/per-resident-i124/output/playwright/burnley-desktop.png?raw=true) |
| City of London | ![city-of-london 375](https://github.com/tompickup23/ukcounciltax/blob/feat/per-resident-i124/output/playwright/city-of-london-375.png?raw=true) | ![city-of-london desktop](https://github.com/tompickup23/ukcounciltax/blob/feat/per-resident-i124/output/playwright/city-of-london-desktop.png?raw=true) |

## Boundaries

No estimates, interpolations, name-based joins, rankings, averages, England ratio, earlier-year substitutions or claims about need, efficiency or value were introduced. No individual is named. No source-note stop condition was triggered. The budget route changes only by the component import and include. No merge or deployment is included.

Built with Codex from a brief prepared in Claude Code.
