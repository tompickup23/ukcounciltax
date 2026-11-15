# C6 staging brief | levels day 2027/28

Written 15 November 2026 in Claude Code (prompt 8), on branch `feat/c6-levels-day-staging`. The specification is `docs/D5-BUDGET-SEASON-2027.md` sections 4 and 5, the C6 row of `docs/ASSESSMENT-2026-11-09-TAX-SITES.md` and plan section 10.2, items 1 and 7. MHCLG's announcement "Council Tax levels set by local authorities in England 2027 to 2028" still says "March 2027", state "provisional" (GOV.UK content API, read 15 November 2026). The freeze starts on 20 March 2027.

## 1. Summary

- **The switch is data presence, not a flag.** The site leads with the latest year that has both a levels file (`data/council-tax/england-<year>.json`) and a Table 10 import carrying a reviewed SHA-256 (`data/national/england-<year>.json`). `CURRENT_YEAR`, `PREVIOUS_YEAR`, `YEARS` and `NEXT_YEAR` move together in one build. No flag, environment variable or date is read (`src/lib/edition.mjs`).
- **The release pull request adds data files and nothing else**: three files, four if the set of billing authorities changes (section 2).
- **Today's build matches main.** The number diff shows 0 pages differing, 0 added and 0 removed. Byte for byte, one page differs: `/council-tax-2027-28/`, by its scoped style attribute (`data-astro-cid-*`), because the page moved to a dynamic route and Astro hashes the file path. Its text is unchanged.
- **Importers.** The levels importer refuses a missing band, a short row, an authority without own figures, and any authority or county that appears or disappears without a reviewed succession record. It reproduces all three held year files exactly, except their `generated` date. Table 10 is found on the statistics page by title, its hash is staged for review, and the import writes a year named file.
- **Rehearsal.** The real run treats 2026/27 as incoming against a 2025/26 baseline, and the shape run checks release day itself. Results and every difference are in section 5.
- **Pages that wait**: the levels day page, precept day, the ranking card with its embed snippet, the 2028/29 not yet set page and the set the budget pages' line. With today's data none of them renders, and each is tested in both states.

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

REHEARSAL-RESULTS

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

## 8. Decisions for Tom

1. **The line's wording** (section 7), and whether the budget game pages (`/tools/budget/<slug>/`) should carry it too. Default: set pages only, as plan 10.2 item 7 says.
2. **`YEARS` after the switch** holds four years, 2024/25 to 2027/28, because it lists every year held. `/compare/` and `/increases/` gain a year. Default: keep every year held; the alternative is a three year window.
3. **The authorities for 2027/28** (section 2, release risks). Establish before the freeze whether any council is created, abolished or recoded on 1 April 2027, with two sources. If any is, a short code pull request is needed for the places that assume 296, before release day.
4. **The levels day page at the old not yet set address**, rather than a 301 to `/increases/#2027-28`. Default: the page, as built.
5. **The embed.** K3 said "not now" to framed embeds with `/embed/` routes. This snippet is an image inside a link and needs no frame and no header change; the assessment's C6 row asks for it. Default: keep it.
6. **Burnley's schedule before its 2027/28 file lands**: shown under its own year (as built), or hidden. Default: shown.

## 9. Verification

VERIFICATION-RESULTS
