# C6 staging brief | levels day 2027/28

Written 15 November 2026 in Claude Code (prompt 8), on branch `feat/c6-levels-day-staging`. The specification is `docs/D5-BUDGET-SEASON-2027.md` sections 4 and 5, the C6 row of `docs/ASSESSMENT-2026-11-09-TAX-SITES.md` and plan section 10.2, items 1 and 7. MHCLG's announcement "Council Tax levels set by local authorities in England 2027 to 2028" still says "March 2027", state "provisional" (GOV.UK content API, read 15 November 2026). The freeze starts on 20 March 2027.

## 1. Summary

- **The switch is data presence, not a flag.** The site leads with the latest year that has both a levels file (`data/council-tax/england-<year>.json`) and a Table 10 import carrying a reviewed SHA-256 (`data/national/england-<year>.json`). `CURRENT_YEAR`, `PREVIOUS_YEAR`, `YEARS` and `NEXT_YEAR` move together in one build. No flag, environment variable or date is read (`src/lib/edition.mjs`).
- **The release pull request adds data files and nothing else**: three files, four if the set of billing authorities changes (section 2).
- **Today's build matches main.** The number diff shows 0 pages differing, 0 added and 0 removed. Byte for byte, one page differs: `/council-tax-2027-28/`, by its scoped style attribute (`data-astro-cid-*`), because the page moved to a dynamic route and Astro hashes the file path. Its text is unchanged.
- **Importers.** The levels importer refuses a missing band, a short row, an authority without own figures, and any authority or county that appears or disappears without a reviewed succession record. It reproduces all three held year files exactly, except their `generated` date. Table 10 is found on the statistics page by title, its hash is staged for review, and the import writes a year named file.
- **Rehearsal.** The real run treats 2026/27 as incoming against a 2025/26 baseline, and the shape run checks release day itself. Results and every difference are in section 5.
- **Pages that wait**: the levels day page, precept day, the ranking card with its embed snippet, the 2028/29 not yet set page and the set the budget pages' line. With today's data none of them renders, and each is tested in both states.
- **The tests follow the data too.** The dist check, the year tests and the browser specs read years, counts and current-year figures from the data, so the release pull request needs no test edits. On a copy built as release day, the dist check and the browser specs pass.

## 2. What changes on release day

The release pull request adds these files, in this order, as the runbook (D5 section 5) now says:

| File | Written by | Effect |
|---|---|---|
| `data/council-tax/england-2027-28.json` | `node scripts/fetch-council-tax.mjs --year 2027-28` | Held, not shown: a levels file alone does not switch the site |
| `data/national/table-10-2027-28.source.json` | `node scripts/import-national.mjs --stage 2027-28` | Table 10's source record with its SHA-256, for review in the pull request |
| `data/national/england-2027-28.json` | `node scripts/import-national.mjs --year 2027-28` | The switch: the next build leads with 2027/28 |
| `data/council-tax/succession-2027-28.json` | by hand, only if the levels import refuses on changed authorities | Lists each removed or added ONS code with two sources; Tom's decision |

What the next build then does, with no code change:

- `CURRENT_YEAR` 2027-28, `PREVIOUS_YEAR` 2026-27, `YEARS` 2024-25 to 2027-28, `NEXT_YEAR` 2028-29.
- `/council-tax-2027-28/` becomes the levels day page at the address that said "not yet set", so its links keep working without a redirect. `/council-tax-2028-29/` is the new not yet set page, reading the 2028/29 release records staged now.
- `/council-tax-2027-28/adult-social-care/` (precept day), one ranking card per council at `/og/ranking/<slug>.png` (BUILD_OG builds) and an embed snippet on each council page appear.
- Council pages, `/increases/`, the class rankings, `/compare/`, the England map, the bill breakdown and `/precepts/` move to 2027/28, from the levels file and the 2027/28 Table 10.
- The set the budget pages keep 2026/27 and add one line (section 7). The budget game pages keep 2026/27 too, through `budgetNational`.
- Parish pages, Scotland, Wales, Burnley's schedule and the GLA section keep their own years (section 3.3).

What is not release day work, and when it happens:

- **The 2028/29 release records** are staged now with `page: null` and a note. Refetch them the week before release (C6b). It is an edit to `src/lib/next-year.ts`, done before the freeze, not on the day.
- **The 2027/28 referendum principles** for the set pages (C6b) land when MHCLG publishes the report.
- **The GLA decision for 2027/28** (`data/precepts/gla-2027-28.json`) can be added after the GLA approves in late February. Until it exists, London council pages omit the mayoral precept section rather than show the 2026/27 figure beside a 2027/28 charge.
- **Burnley's 2027/28 schedule** (`data/local-bills/burnley-2027-28.json`) can be added when Burnley publishes it. Until then `/precepts/` and the homepage show the 2026/27 schedule, labelled 2026/27.

Release risks found while staging:

- **A change in the set of billing authorities.** ONS codes are reissued on boundary changes: Barnsley and Sheffield moved from E08000016 and E08000019 to E08000038 and E08000039 between 2024/25 and 2025/26, and the new check found it. If any council is created, abolished or recoded for 1 April 2027, the levels import refuses until a succession record lists each change with two sources. Several places also assume 296 billing authorities and 21 counties: `isComplete` in `src/lib/rankings.ts` (which would leave every class unranked), `scripts/check-dist.mjs` (296 profiles), the importers for band stock and collection rates, ten test files, and the copy on `/`, `/coverage/`, `/precepts/` and in the navigation. Whether anything changes on 1 April 2027 is Tom's question to settle with two sources before the freeze, under the held data rule; this brief makes no statement about it.
- **The set the budget pages pin SHA-256 hashes** of `data/national/england.json` and the 2026/27 and 2025/26 levels files (`data/pilots/budget-freeze.json`, `sourceHashes`). The release must add new year named files and never rewrite those three. The importers are built that way; the rehearsal found the dependency when it removed `england.json`.

## 3. The switch

### 3.1 Why data presence, not a flag

A flag has to be flipped in the same pull request as the data, so the release pull request carries code; a flag can also be flipped without the data, or left off with it. Data presence makes the release pull request data only, and it cannot publish half a release. A levels file without its Table 10 import is held (`edition().held`), and so is a Table 10 import without a reviewed hash or one whose title names another year. Tests cover each case on temporary data trees (`tests/c6-switch.test.ts`).

### 3.2 How it works

- `src/lib/edition.mjs` is plain JavaScript, so the Astro pages (through `src/lib/council-tax.ts`), `scripts/check-dist.mjs` and the rehearsal read one rule. It lists the years that have levels files, takes the latest one with a pinned Table 10 import as current, and refuses gaps or a year with no year before it.
- `data/national/england.json` stays the launch edition (2026/27). Later years are `data/national/england-<year>.json`. `nationalFor(year)` in `src/lib/national-data.ts` reads either, and `national` is the current year's.
- `FIRST_LEVELS_PAGE_YEAR` is 2027-28. Earlier years never had a levels day page, so moving the switch back to 2026/27 adds no page.
- `src/pages/council-tax-[year].astro` replaces `council-tax-2027-28.astro`. It lists `NEXT_YEAR` as the not yet set page, plus `CURRENT_YEAR` as the levels day page from 2027-28 on.
- `RELEASES` reads `RELEASE_SETS[<NEXT_YEAR in words>]`, so the not yet set page reads the right year's records after the switch. The sitemap date for that page is the date its set was read.

### 3.3 Datasets with their own release dates

| Dataset | Before (today) | After the switch, until its own update lands |
|---|---|---|
| RA budget and its Table 10 (`budget.json`, `budgetNational`) | 2026/27 | 2026/27; the set the budget pages add one line. `budget.ts` throws if the budget edition is ever newer than `CURRENT_YEAR` |
| Set the budget pages (`budget-freeze.json`) | 2026/27, hashes pinned | Unchanged, as long as the three pinned files are not rewritten |
| Parish return (`PARISH_YEAR`, from its source title) | 2026/27 | 2026/27; parish pages and their own Band D line use the parish year throughout |
| Band D history | to 2026/27 | Unchanged; its own vintage is checked from its file name |
| Scotland and Wales (`latestEditions()`) | 2026/27 | Each nation's own latest edition. Before C6, their pages and picker rows were filtered by England's year and would have disappeared (the shape rehearsal found three such filters) |
| Burnley schedule (`burnleyBill()`) | 2026/27 | Its latest year up to `CURRENT_YEAR`, labelled with its own year. Council figure labels in `src/lib/figures.ts` had borrowed the schedule's year, and now use the levels year |
| GLA decision | 2026/27 | Shown only when its year equals `CURRENT_YEAR` |

## 4. Importers

### 4.1 Levels (`scripts/fetch-council-tax.mjs`, `scripts/lib/levels.mjs`)

- `--year 2027-28` fetches the staged year. The statistics page slug and the "Tables 1 to N" attachment title come from the year's label, in the form MHCLG used for 2025/26 and 2026/27. `--raw` and `--out` let the rehearsal work outside the repository.
- Tables are found by title and columns by header, as before. The parser now lives in `scripts/lib/levels.mjs`, so tests can feed it sheets.
- It refuses, and writes nothing for any year asked for, when:
   1. a band is missing, or a band cell is blank;
   2. a row is short: an authority row stops before Band H, or an own table row has no Band D or change cell. A marked `[x]` stays a null, never a zero;
   3. an authority has no own figures row;
   4. for an incoming year, an authority or county is missing or new against the year before, unless a succession record lists it with two sources;
   5. for a refetched year, its set of authorities or counties differs from the held file;
   6. a note is referenced that the workbook does not define.
- Tests: `tests/levels-import.test.ts` runs on a fixture cut from the 2026/27 workbook itself (`tests/fixtures/levels-2026-27-sheets.json`: four authorities, cells as displayed, with the workbook's SHA-256). It reproduces the held figures cell for cell, still finds tables when the sheets are renamed and reordered, and covers every refusal. Run in full offline against the downloaded 2024/25, 2025/26 and 2026/27 workbooks, the importer reproduces the three held files exactly, except their `generated` date.

### 4.2 Table 10 (`scripts/import-national.mjs`, `scripts/lib/national-years.mjs`)

- `--stage 2027-28` reads the year's statistics page through the content API and takes the one `.ods` attachment titled "Council Tax levels set by local authorities in England 2027 to 2028: Table 10...". It downloads the file and writes `data/national/table-10-2027-28.source.json` with the SHA-256, for review. Nothing else is written.
- `--year 2027-28` imports that file, checked against the staged hash, the year's levels file (every authority must have components) and the year named in the record's title. The output is `data/national/england-2027-28.json`. The parish return and Band D history keep their own editions from `sources.json`, and their years are read from their titles and file names, never assumed.
- With no arguments it imports the launch edition exactly as before. A rerun into a scratch folder gave a byte identical `england.json`.

## 5. Rehearsal (`scripts/rehearse-levels-day.mjs`)

Run, outside the repository, with a main build kept as the baseline:

```
node scripts/rehearse-levels-day.mjs --scenario real --baseline <main dist> --live
node scripts/rehearse-levels-day.mjs --scenario shape
```

The script refuses a folder inside the repository. Nothing it builds is published, and the shape run's data carries a "SHAPE ONLY" marker.

### 5.1 Real run: 2026/27 incoming against a 2025/26 baseline

All 13 checks passed (15 November 2026).

| Step | Result |
|---|---|
| Baseline: no 2026/27 levels file, the launch Table 10 import set aside, Table 10 for 2025/26 staged and imported | The switch resolves to 2025/26, years 2024/25 and 2025/26. The stage step found "Table 10 Local Authority Level Data" on the 2025/26 page by title |
| Levels import, `--year 2026-27` | Accepted against 2025/26 (no authority or county appeared or disappeared). The switch stays on 2025/26 with 2026/27 held. The file equals the held one except its `generated` date |
| Table 10 stage, `--stage 2026-27` | The hash found on the statistics page equals the pinned `b5b83457...38feb0`, and so does the file URL |
| Table 10 import, `--year 2026-27 --as-incoming` | The switch moves to 2026/27, previous 2025/26, next 2027/28. Components, parishes, history and their notes equal the held import |
| Build and number diff against main | 298 pages differ, 0 added, 0 removed; every difference is listed below |
| Main against live, five pages (`/`, `/councils/burnley/`, `/increases/`, `/council-tax-2027-28/`, `/precepts/`) | 0 pages differing, so main stands in for live |

Every difference, and its cause:

| Where | What | Cause |
|---|---|---|
| 296 council pages (bill breakdown source line, in the table and in the chart's SVG), `/data/` and `/changes/` | "retrieved 5 October 2026" becomes "retrieved 15 November 2026"; `/changes/` lists the precept components item under its new access date | The staged Table 10 record carries the day it was retrieved. On release day that is right: the new edition's date |
| `/council-tax-2027-28/` | Bytes only: the scoped style attribute | The page moved to a dynamic route; the same difference is in today's build (section 1) |
| `data/council-tax/england-2026-27.json` | Equal to the held file except its `generated` date; the build used the held bytes | The set the budget pages pin that file's SHA-256, `generated` included. A real release adds a new year's file, which nothing pins |
| Table 10 source record | The staged record adds `attachmentTitle`, and its `retrieved` date is the day of the run | By design: the attachment title is recorded as GOV.UK prints it |
| The baseline build | Not built | The repository holds no 2025/26 edition of the budget, Burnley's schedule, the GLA decision or Scotland and Wales. The switch refuses a dataset newer than the current year (budget, Scotland, Wales) or finds none (Burnley), so only the after state is built. On a real release every such dataset is older than the incoming year, and the shape run covers that |
| First attempt | The build failed: the set the budget pages could not read `data/national/england.json` | The first version of the script deleted the launch file. The pages pin its hash, so the release must never remove or rewrite it (section 2) |

### 5.2 Shape run: release day, with every other dataset still on 2026/27

All 15 checks passed on the final run (15 November 2026). In a copy, the 2026/27 levels file and Table 10 import were relabelled 2027-28; the figures are unchanged, so they are wrong for that year and the run is for shape only. Everything else stayed on 2026/27.

| Check | Result |
|---|---|
| The switch | resolves to 2027-28, previous 2026-27, next 2028-29 |
| `/council-tax-2027-28/` | the levels day page, linking precept day and every class ranking; no horizontal overflow at 375 px |
| `/council-tax-2027-28/adult-social-care/` | 153 authorities; "142 of the 153 authorities show an adult social care change of 2.0%, the maximum the principles state; 11 show less" (on the relabelled 2026/27 tables) |
| `/council-tax-2028-29/` | not yet set, reading the staged 2028/29 records, with no trace of the 2027/28 announcement |
| Council pages | lead with 2027/28 and carry the embed snippet, which wraps at 375 px |
| Set the budget pages | carry the line in section 7 |
| Parish pages, Scotland, Wales, `/precepts/` | stay on their own 2026/27 editions and say so |
| Westminster | no mayoral precept section and no contents link to it, since no 2027/28 GLA decision is held |
| Sitemap | lists the levels day, precept day and 2028/29 pages |
| `scripts/check-dist.mjs` on the shape build | passes |

**Browser suite on the shape build** (desktop, against the shape build's preview). The first full run gave 263 passed and 5 failed: the tables on `/increases/`, which grow with the extra year (two tests), the sitemap count, the `/data/` source count, and the City of London GLA text, which is withheld by design. The second gave 265 passed and 3 failed: the rows on `/increases/` (two tests) and a timeout under load. The shape run cannot see one class of problem, because its figures are 2026/27's: 14 assertions typed 2026/27 figures (Burnley's bands, three precept parts, a ranking cell and two future cost results) that would fail on release day. All now read the data through `e2e/helpers/current.ts`, which reproduces every old literal on today's data. After the fixes, the affected spec files pass on the shape build (46 of 46), and the full suite passes on today's build (528 of 528). Figures from editions that do not move with the switch (the budget, the Burnley scenario game, parish returns, history) stay typed.

The shape run's first passes found these, all fixed on this branch:

| Found | Would have happened after the switch | Fix |
|---|---|---|
| `[nation]/[slug].astro`, the Scotland and Wales OG route, `PostcodeDoor` and the picker filtered devolved editions by England's year | Every Scottish and Welsh council page, its card and its picker and postcode links disappear (the dist check listed each missing search destination) | `latestEditions()`: each nation's own latest edition |
| `council-metadata.ts` used England's year for Scottish and Welsh titles, descriptions and the next edition line | Welsh 2026/27 figures titled "Band D 2027/28" | The page passes its edition's year |
| `src/lib/figures.ts` labelled every council's figures with the Burnley schedule's year | Every council's bands, area Band D and bill parts labelled 2026/27 beside 2027/28 figures | The levels year |
| The budget page's band selector read England's year | 2027/28 bands on a page pinned to 2026/27 | `BandSelector` takes the budget year |
| London pages listed "The mayoral precept" in their contents when the section was withheld | 33 pages with a contents link to nothing | One GLA lookup (`src/lib/gla.ts`) for both |
| The C1b number snapshot included the site navigation | The release pull request fails the dist check on "Rises 2027/28" | The snapshot drops the header; the fixture loses exactly those ten nav tokens per page |
| The dist check expected 1,107 pages, one year page and no pound sign on any `/council-tax-<year>/` | The release pull request fails the dist check | Counts and the year page rule follow the switch |
| The not yet set page read the 2027/28 release records whatever `NEXT_YEAR` was | The 2028/29 page quotes the 2027/28 announcement | `RELEASE_SETS` by year |
| The new pages' descriptions ran to 176 and 170 characters, and figures sat outside a sourced fact | Dist check failures | Shortened and restructured |

## 6. Pages that wait for 2027/28

| Page | Route | Today | After the switch | Tests |
|---|---|---|---|---|
| Levels day page | `/council-tax-2027-28/` (`LevelsDay.astro`) | the not yet set page | England average area Band D and change by area type (Table 7), own share by class (Table 2), links to every council, ranking, increases and precept day, and the files with their hashes | `c6-switch`, check-dist, shape |
| Precept day | `/council-tax-2027-28/adult-social-care/` | none | The 153 adult social care authorities: own change, the adult social care part, the rest (calculated), and the element in pounds. The maximum is read from the year's referendum principles; if the text gives none, no count is made | `c6-switch` on the 2026/27 tables, check-dist, shape |
| Ranking card | `/og/ranking/<slug>.png` | none | The kit's 1200 by 630 card of the council's position strip within its class, with the council as its focus | `og-sample` renders it on today's data; the route lists nothing today |
| Embed snippet | council pages, after the position strip | none | An `<img>` inside a link, with no script or frame, so the site's CSP is untouched | `c6-switch`, check-dist, shape |
| Rankings per class | `/council-tax/ranked/` | 2026/27 | 2027/28 | existing tests |
| Your bill | council pages, `/precepts/` | 2026/27 Table 10 | 2027/28 Table 10 | shape |
| Not yet set | `/council-tax-<NEXT_YEAR>/` | 2027/28 | 2028/29, from the staged records | `years`, shape |

`scripts/check-dist.mjs` now fails if a waiting page is built before its data or is missing after it. It also fails if the embed or the pinned line is out of step with the data.

## 7. The set the budget pages' line

Shown only when the budget edition is older than `CURRENT_YEAR`, under the source line on each `/tools/budget/<slug>/set/` page:

> These budget figures are for 2026/27. Council budgets for 2027/28 follow MHCLG's revenue account (RA) budget release, expected in June 2027.

"Expected" is there because MHCLG has not announced the RA 2027/28 date. RA 2026/27 is recorded in `sources.json` (`raPart1`) as published on 11 June 2026.

## 8. Decisions taken by Tom, 15 November 2026

Tom took all six on 15 November 2026, with decision D11 option (a): merge this PR before the budget redesign (W1 to W3). Every choice is the default as built, so no code or copy changed for them.

1. **The line's wording** (section 7): as written, on the set pages (`/tools/budget/<slug>/set/`) only. The budget game pages do not carry it.
2. **`YEARS` after the switch** keeps every year held: four years, 2024/25 to 2027/28. `/compare/` and `/increases/` gain a year.
3. **The authorities for 1 April 2027** are settled before the freeze in a separate pull request, with two sources. This PR makes no statement about them. If any council is created, abolished or recoded, that PR also covers the places that assume 296.
4. **The levels day page** stays at `/council-tax-2027-28/`, not a 301 to `/increases/#2027-28`.
5. **The embed snippet** (an image inside a link, no frame, no header change) is kept.
6. **Burnley's schedule** before its 2027/28 file lands is shown under its own year.

## 9. Verification

All run on 15 November 2026 on the final branch, Node 22.23.4.

| Check | Result |
|---|---|
| `npm test` | 68 files, 876 tests passed |
| `npm run check` | 0 errors, 0 warnings, 0 hints |
| `BUILD_OG=1 npm run build` | 1,107 pages built; no ranking card routes (correct before 2027/28) |
| `npm run test:dist` | 1,107 pages, 1,106 sitemap URLs, all passed |
| `npm run test:text` | 1,115 files, no dashes or pseudo dashes |
| `npm run test:csp` | 138 passed |
| `npm run test:e2e` (phone and desktop, against the built site's preview) | 528 passed |
| Number diff against main (`scripts/diff-numbers.mjs`) | 0 pages differing, 0 added, 0 removed |
| Byte compare of HTML against main | 1 page differs: `/council-tax-2027-28/`, scoped style attribute only |
| Rehearsal, real | 13 of 13 checks |
| Rehearsal, shape | 15 of 15 checks, including the dist check on the release day build |

The main build used as the baseline is a plain build (no OG images), so images were not compared byte for byte. The only image route changed is the Scotland and Wales card route, which now lists each nation's latest edition: today that is the same set.
