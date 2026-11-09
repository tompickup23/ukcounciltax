# A4: same class rankings and parish precept pages | Codex brief

Written 9 November 2026 in Claude Code (Opus) for a Codex lane A session. Worktree `~/wt/uct-rankings`, branch `feat/rankings-parishes`, cut from `origin/main` at `baf0f05`. Read `CLAUDE.md`, `docs/RELEASE.md`, then `docs/A4-RANKINGS-PARISHES-SOURCE-NOTES.md` (binding; it wins over this brief), then this brief. Every count, anchor and convention below was dry run on 9 November 2026 against `data/council-tax/england-2026-27.json` and `data/national/england.json`.

## 0. Before you start

1. `git fetch origin` and rebase onto the current `origin/main`. PR 26 (the budget game), A2 (`feat/brand-canonicals-nav`) and A3 (`feat/profile-home-overhaul`) are expected to have merged, in that order. A4 runs after A3 because both edit `src/pages/councils/[slug].astro`; A4's profile edits sit inside sections A3 created or kept (`#compared`, `#parish-precepts`).
2. If A3 has not merged, build on `origin/main` anyway, keep the profile edits to the two sections named in phase 3 and phase 5, and say in the PR that a rebase onto A3 will be needed.
3. If A2 has merged, its sitemap `lastmod` helper (A2 item 9) exists; phase 7 uses it. If it has not, leave `lastmod` out for the new routes and say so.
4. One PR, one commit per phase, in the order below.

## Rules that bind every phase

- British English. No em dash, en dash or spaced hyphen as a dash anywhere, including JSON, comments, test names and commit messages; `npm run test:text` sweeps the build.
- Never estimate or derive. Every figure keeps a source line within its `data-fact` block. A position in a ranking is a calculation from published figures and is labelled as one. Name no individual (council and parish names are bodies, not individuals).
- No motive words. Use "lowest", "highest", "position", "of". Never "cheapest", "most expensive", "best", "worst", "top", "bottom", or any word in `tests/site.test.ts` line 203.
- Every year label comes from `CURRENT_YEAR`, `PREVIOUS_YEAR` or a data file through `yearLabel`; never type "2026/27".
- No inline script permission. Static HTML complete without JavaScript. No horizontal page overflow at 375px. Colours from tokens only.
- Stage named paths only. Do not merge or deploy.
- Stop only on the conditions in section 10. Any other question takes the most conservative choice and a line under "Decisions taken" in the PR.

## Phase 1: the ranking library

New `src/lib/rankings.ts`, pure functions over the year file, with unit tests in `tests/rankings.test.ts`.

```ts
export const RANK_CLASSES = [
  {slug: "shire-districts", label: "shire districts", codes: ["SD"], ownTable: "Table_8c", areaType: "shire", table2: "Shire Districts"},
  {slug: "unitary-authorities", label: "unitary authorities", codes: ["UA"], ownTable: "Table_8a", areaType: "unitary", table2: "Shire Unitary Authorities"},
  {slug: "metropolitan-districts", label: "metropolitan districts", codes: ["MD"], ownTable: "Table_8a", areaType: "metropolitan", table2: "Metropolitan Districts"},
  {slug: "london-boroughs", label: "London boroughs and the City of London", codes: ["ILB", "OLB"], ownTable: "Table_8a", areaType: "london", table2: "London Boroughs"},
] as const;
export const COUNTY_CLASS = {slug: "county-councils", label: "county councils", ownTable: "Table_8b", table2: "Shire Counties"} as const;
```

Functions:

- `classFor(classCode)`: the `RANK_CLASSES` entry for a billing authority's class code.
- `isComplete(year, cls)`: true only when the year file holds 296 billing authorities and every authority whose `classCode` is in `cls.codes` has a numeric `bands.D` and a numeric `own.bandD`. For counties: every `counties[gss].bandD` is numeric and there are 21.
- `competitionRank(values)`: standard competition ranking, lowest first, on the stored numbers (no rounding before comparison). Returns, per value, the position and whether it is tied.
- `rankClass(year, cls)`: null when not complete; otherwise rows sorted by area Band D ascending, then `localeCompare(name, "en-GB")`, each with `gss`, `name`, `slug`, `area`, `areaPosition`, `areaTied`, `own`, `ownPosition`, `ownTied`, `areaNotes` (from `notes`), `ownNotes` (from `own.notes`).
- `rankCounties(year)`: same shape with `own` only, sorted by own ascending.
- `ordinal(n)`: 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st, 22nd, 23rd, 101st, 111th, 112th, 113th, 164th. `positionWords(p, tied)`: "joint 21st" or "130th". `positionCell(p, tied)`: "21=" or "130".

Tests (all from the notes, section 3):

- Counts: 164, 63, 36, 33, 21; every class complete for 2026-27.
- Unitary: first row Windsor and Maidenhead 1952.62, second Isles of Scilly 2047.96, 62nd Nottingham 2755.39, last Dorset 2765.02; own lowest Windsor and Maidenhead 1526.63, own highest Nottingham 2342.08.
- Metropolitan: Dudley first (2144.84), Gateshead last (2715.81). London: Wandsworth first (1028.21), Kingston upon Thames last (2609.2). Shire districts: Basingstoke and Deane first (2255.21), Lewes last (2756.17) with area note id `ad`. Counties: Essex first (1641.96), Oxfordshire last (2006.78), Lancashire 12th (1801.75).
- Ties: Havant and Rushmoor both `areaPosition` 21 tied and `ownPosition` 116 tied; the next area position after them is 23. No other tie in any class or column.
- Positions: Burnley area 130 own 160; Lancaster 116 and 138; Lewes 164 and 107; Manchester 10 and 6; Camden 20 and 20; City of London 3 and 4; Dorset 63 and 58.
- `isComplete` returns false on a fixture copy with one `bands.D` set to null, and `rankClass` then returns null.
- `ordinal` for the values listed above.

## Phase 2: one ranking page per class, and the index

Routes (programmatic, from `RANK_CLASSES` and `COUNTY_CLASS`):

- `/council-tax/ranked/` (index, a static page: add to `STATIC_PATHS`)
- `/council-tax/ranked/shire-districts/`
- `/council-tax/ranked/unitary-authorities/`
- `/council-tax/ranked/metropolitan-districts/`
- `/council-tax/ranked/london-boroughs/`
- `/council-tax/ranked/county-councils/`

Files: `src/pages/council-tax/ranked/index.astro` and `src/pages/council-tax/ranked/[class].astro`. `src/pages/council-tax/[slug].astro` serves the region and band slugs; Astro gives the static `ranked/` directory priority, and no region or band slug is "ranked" (check `getStaticPaths` there and assert it in a test). Add `rankingPath(slug)` and `rankingPaths()` to `src/lib/paths.ts` and append `rankingPaths()` to `programmaticPaths()`.

### Titles, H1s and descriptions (the layout appends " | UK Council Tax")

| Route | Title and H1 | Description (lead with the figure) |
|---|---|---|
| shire-districts | Council tax Band D ranked: shire districts {year} | Band D for all 164 shire districts in England in {year}, lowest to highest, from {first} in {name} to {last} in {name}, with each council's own share. MHCLG Tables 9 and 8c. |
| unitary-authorities | Council tax Band D ranked: unitary authorities {year} | same pattern, 63, Tables 9 and 8a |
| metropolitan-districts | Council tax Band D ranked: metropolitan districts {year} | same pattern, 36, Tables 9 and 8a |
| london-boroughs | Council tax Band D ranked: London boroughs {year} (H1 adds "and the City of London") | same pattern, 33, Tables 9 and 8a |
| county-councils | County council precepts ranked: Band D {year} | The Band D precept of all 21 county councils in England in {year}, lowest to highest, from {first} in {name} to {last} in {name}. MHCLG Table 8b. |
| index | Council tax Band D ranked by type of council {year} | One line per class with its count and its lowest and highest area Band D. |

The counts and names in descriptions come from the data, never typed.

### A class page, top to bottom

1. Breadcrumbs: Council tax, Ranked, {class label}.
2. H1. A lede: "Every {class label} in England, by published Band D for {year}, lowest first. Position 1 is the lowest. The site ranks councils only against councils of the same type, and only for a year in which every council of that type has a published figure."
3. A "What is ranked" block, two short paragraphs: area Band D is the whole Band D bill averaged across the council's area, including county, police, fire, combined authority or GLA precepts, average parish precepts and adult social care; own Band D is the council's own share, including adult social care where it has it, excluding parish precepts. For shire districts add: "In a shire district most of the area Band D is the county council's precept, so the area positions mostly follow the county." (Burnley: Lancashire's £1,801.75 of £2,549.42.) That sentence states a published fact about composition; do not add any reason for a council's position.
4. Two reference lines, each a `data-fact` with its source line: "Average area Band D for {Table 7 area type label}, {year}: £{n}" (Table 7) and "Average Band D for {Table 2 class row}, {year}: £{n}" (Table 2). Whole pounds, as published. Values in notes section 2.
5. The table, in a `table-wrap` region, wrapped in `div class="fact" data-fact`:
   - caption: "{Class label}, Band D {year}, lowest to highest area Band D"
   - columns: "Position" (area), "Council" (row header, linking `/councils/<slug>/`), "Area Band D", "Position by own share", "Own Band D". London adds "Type" (Inner London or Outer London, from `authorities[gss].area`) after Council.
   - figure cells `data-figure`, printed with `pounds()`; positions with `positionCell`.
   - a council with an MHCLG note carries a note marker after its name ("note ad") linking to the note list below.
6. Source line (one `SourceLine` with a method): MHCLG, Council Tax levels set by local authorities in England 2026 to 2027, Table 9 and Table {8a or 8c}, published 25 March 2026; method "Positions calculated from the published figures: equal figures share a position."
7. Note list: every MHCLG note on a row in this table, verbatim, as "{council}: note {id}. {text}". Shire districts list Lewes (`ad`, `x`), Mid Devon, Rushmoor, Tonbridge and Malling, Elmbridge, Woking (`w`); unitary lists Bournemouth, Christchurch and Poole (`t`), Leicester (`s`), North Somerset and Shropshire (`u`), Warrington and Windsor and Maidenhead (`r`); metropolitan lists Trafford (`r`) and Leeds (`s`); London lists none. Generate from data; these are the 9 November contents for the test (6, 6, 2 and 0 councils).
8. Links: the other class pages, `/council-tax/`, `/increases/`.

County page: the same, with "Position" and "Own Band D" only, the Table 8b source, Norfolk (`s`) and Worcestershire (`v`) in the note list, and one line: "A county council's precept is charged in every shire district in its county and is part of each district's area Band D." linking the shire districts page.

Incomplete class (none on 9 November, but the page must handle it): no table, no positions, a sentence "Band D for {year} is not yet published for every {class label}, so this page does not rank them." and links to the councils that have figures; the index marks the class "not ranked for {year}". Test with the fixture from phase 1 through the page's data function.

Index page: a table of the five classes: class (linking its page), count, lowest area Band D with council, highest area Band D with council (counties: own Band D), source line Tables 9, 8a, 8b, 8c. Plus the lede rule sentence.

**Assertions (built page test or dist check)**

- The six routes exist; each has exactly one `h1` equal to its title without the suffix.
- Row counts: 164, 63, 36, 33, 21; the index has five class rows.
- `/council-tax/ranked/unitary-authorities/`: first body row is Windsor and Maidenhead with "1" and £1,952.62; last is Dorset with "63" and £2,765.02.
- `/council-tax/ranked/shire-districts/`: Havant and Rushmoor rows both show "21=" and "116="; the row after them shows "23"; Lewes is last and carries the `ad` marker; the note list contains "pending approval subject to a full council decision on 26 March 2026".
- No built ranking page contains "cheapest", "most expensive", "best", "worst" (add these four to a ranking specific check; do not widen the site wide motive list).
- Every council link resolves to a built profile.

## Phase 3: the "position within class" line on every profile

In `src/pages/councils/[slug].astro`, inside `#compared` (A3 labels it "England and class averages"), after the two average cards: a `div class="fact" data-fact data-class-position` containing

"Within {class label} in {year}: {name} is {positionWords(area)} of {N} for area Band D and {positionWords(own)} of {N} for the council's own Band D, counted from the lowest." then a link "Every {class label} ranked by Band D" to the class page, then a source line "Positions calculated from MHCLG Table 9 and Table {8a or 8c}, 2026 to 2027, published 25 March 2026."

Where the council has an MHCLG note on its area figure (Lewes only), add: "MHCLG marks this figure as pending approval; the note is under the band table." Generate the clause from the presence of `tax.notes`, worded generically: "MHCLG publishes a note on this figure; it is under the band table." Use the generic wording.

If the class is not complete for the year, render nothing (no line, no link).

Do not add a county line to district profiles; the district's "Who sets the charge" already shows the county's Band D.

**Assertions**

- All 296 profiles contain exactly one `[data-class-position]` linking the right class page (SD to shire districts, UA to unitary authorities, MD to metropolitan districts, ILB and OLB to London boroughs).
- `/councils/burnley/` says "130th of 164 for area Band D and 160th of 164"; `/councils/havant/` says "joint 21st of 164" and "joint 116th of 164"; `/councils/windsor-and-maidenhead/` says "1st of 63" twice; `/councils/lewes/` contains "MHCLG publishes a note on this figure".
- If A3's `PageContents` derives its items from the rendered sections, nothing changes there; the line sits inside an existing section.

## Phase 4: one parish precept page per billing area, and the index

Routes:

- `/precepts/parishes/` (index, static: add to `STATIC_PATHS`)
- `/precepts/parishes/<council slug>/` for each of the 214 billing areas with parish rows (`parishPages()` and `parishPath(council)` in `src/lib/paths.ts`, appended to `programmaticPaths()`).

Files: `src/pages/precepts/parishes/index.astro` and `src/pages/precepts/parishes/[slug].astro`. `src/pages/precepts.astro` keeps serving `/precepts/`.

### Titles

- Area page: "Parish precepts in {name} {year}" (for example "Parish precepts in Lancaster 2026/27"). H1 the same. Description: "{|P|} local precepts in {name} in {year}, Band D from {min} to {max}, with each one's change on {previous} and {name} council's own share. MHCLG local precepting authorities data."
- Index: "Parish precepts by council in England {year}". Description leads with "10,245 local precepting authority records across 214 English councils in {year}" from the data.

### An area page, top to bottom

1. Breadcrumbs: Your bill and precepts (`/precepts/`), Parish precepts (`/precepts/parishes/`), {name}.
2. H1, then the range sentence (notes section 4, "Range in words", rules 1 to 5), in a `data-fact` with the parish source line.
3. The billing authority's own share, a `Fact`: label "{name} council's own Band D, excluding parish precepts, {year}", figure `pounds(tax.own.bandD)`, source `councilTaxSource(CURRENT_YEAR, tax.own.table)`. One line under it: "In a parish, the parish's own Band D precept is charged on top of this and of the county, police and fire charges. The area average Band D on the {name} council page already includes parish precepts as an average, so do not add a parish figure to it." Link the council page.
4. The table (moved from `NationalPrecepts.astro`, see phase 5), in a `table-wrap` region inside a `data-fact`: caption "{name}: local Band D precepts, {previous} and {year}"; columns "Parish or local body" (row header, with the type and any note ids beneath, as today), "{previous}", "{year}", "Change"; rows sorted by `localeCompare(name, "en-GB")`; `Did not exist` for a "not-existing" year; "Not comparable" where `parishChange` is null; a negative value printed as published. Figure cells `data-figure`.
5. The filter control and its script, moved from the profile unchanged (label "Filter parish or local body", hidden without JavaScript, live count "All {n} records shown.").
6. Calculation line: "Change is the {year} Band D minus the {previous} Band D on the same source row, our calculation. A row that did not exist in either year is not comparable. Missing and ceased entries stay distinct from published £0.00 precepts."
7. Notes: every parish note id used on the page with its text (`parishNotes`), as today. Durham only: the existing Charter Trustees caveat sentence.
8. Source line: "Source: MHCLG, Council Tax statistics for town and parish councils in England: 2026 to 2027, Parish_Level_Data and Notes, retrieved 5 October 2026." linking `national.sources.parishes.fileUrl`.
9. Links: the council page, the parish index, `/precepts/`.

### The index

One table of the 214 billing areas, sorted by name: council (linking its parish page), region, records, records with a non zero {year} Band D, lowest and highest non zero Band D (as in the range sentence, names omitted for space). One source line. Above it, one sentence with the national counts from the data: records, billing areas, and that 82 councils have no local precepting authority in the return. The national extremes are not printed as a headline.

**Dry run anchors** (notes section 4): Burnley 8 rows, from £7.36 (Ightenhill) to £44.06 (Padiham), own £351.44; Lancaster 37 rows, 34 non zero, from £12.18 (Over Wyresdale) to £395.11 (Wennington), 3 at £0.00, own £272.20; East Lindsey 163 rows from minus £2.64 (Beesby with Saleby) to £353.68 (Alford); City of London two Temples at £2,038.90; Bournemouth, Christchurch and Poole 10 rows, 2 no longer existing, 5 comparable; North Yorkshire 665 rows.

**Assertions**

- 214 parish pages built, one per GSS in `parishes`; `/precepts/parishes/index.html` has 214 body rows.
- `/precepts/parishes/burnley/` has 8 body rows and the exact sentence "The 2026/27 return lists 8 local precepting authorities in Burnley. 8 set a Band D precept, from £7.36 (Ightenhill) to £44.06 (Padiham)." (year from data); Padiham row shows £38.64, £44.06, +£5.42; the own share fact shows £351.44 with Table 8c.
- `/precepts/parishes/lancaster/` contains "from £12.18 (Over Wyresdale) to £395.11 (Wennington)" and "3 set a Band D precept of £0.00"; 37 rows.
- `/precepts/parishes/east-lindsey/` contains "minus £2.64 (Beesby with Saleby, a negative precept as published)" and its table shows "-£2.64".
- `/precepts/parishes/city-of-london/` contains "2 set a Band D precept of £2,038.90 (Inner Temple and Middle Temple)".
- `/precepts/parishes/bournemouth-christchurch-and-poole/` contains "2 listed for 2025/26 no longer exist in 2026/27".
- The sum of body rows across the 214 pages is 10,245.
- No parish page links a URL outside this site other than the MHCLG file and GOV.UK.

## Phase 5: the profile's parish section points at the parish page

Today `NationalPrecepts.astro` prints every parish row on the profile too (665 rows on North Yorkshire). With the parish pages built, the profile's `#parish-precepts` section (keep the id and the heading) becomes:

- for the 214 councils with rows: the range sentence (the same function as the parish page), then a link "Every parish precept in {name}, with its change on {previous}" to the parish page, then the parish source line;
- for the 82 without rows: today's sentence, unchanged ("No parish or local-body rows for {name} appear in this national parish return..."; keep its wording, which predates the dash rule and has a hyphen inside a compound, not a spaced one).

Move the table, filter control, filter script, notes list and Durham caveat into the parish page (phase 4). Delete them from `NationalPrecepts.astro`. The component's `#precept-breakdown` section is unchanged by A4 (A3 changed its rows).

Tests to move, from `e2e/national.spec.ts`:

- the Padiham filter assertions (line 7 to 10) go to `/precepts/parishes/burnley/`;
- the no JavaScript test's `[data-parish-name]` count of 8 and hidden filter go to `/precepts/parishes/burnley/`; keep its `#precept-breakdown` "Lancashire Fire" assertion on the profile;
- the negative precept test goes to `/precepts/parishes/east-lindsey/`;
- the axe and overflow test runs on `/precepts/parishes/burnley/` as well as the profile;
- the first test's route from `/precepts/` through the finder to `/councils/burnley/#precept-breakdown` stays.

**Assertions**: no profile contains `[data-parish-name]`; 214 profiles link their parish page from `#parish-precepts`; 82 contain "No parish or local-body rows"; `/councils/north-yorkshire/` HTML shrinks (record before and after in the PR).

## Phase 6: links into the new pages

- `NAV_GROUPS`, "Council tax" group: add `{href: "/council-tax/ranked/", label: "Band D ranked", desc: "Every council against councils of the same type"}`. "Tools and help" group: add `{href: "/precepts/parishes/", label: "Parish precepts", desc: "Every parish precept by council"}`. A2's test (no two items share a label; every href in `STATIC_PATHS` or a known hub) must pass.
- `/precepts/`: one sentence and link to `/precepts/parishes/` in the national precepts section.
- `/council-tax/`: link to `/council-tax/ranked/` beside the England table (A2 added an "Also on this site" list there; add it to that list if present).
- `/increases/`: one link to `/council-tax/ranked/` near the top, "Band D levels ranked within each type of council".

## Phase 7: canonical, sitemap and lastmod

- `tests/canonical.test.ts`, "covers every current route": the built URL list now includes the new routes, so extend `addedUrls` with `["/council-tax/ranked/", ...rankingPaths(), "/precepts/parishes/", ...parishPages().map(parishPath)]` and assert that this addition is exactly 221 URLs (1 + 5 + 1 + 214). Each must be self canonical (`canonicalUrl(path) === absoluteUrl(path)`); none appears in `data/canonical-map.json` `mappings`. Do not edit the map or the two sitemap snapshots. The mapped count assertion (324 on `baf0f05`, 318 after A2) is unchanged by A4.
- `src/pages/sitemap.xml.ts` takes the routes from `STATIC_PATHS` and `programmaticPaths()`; confirm the built sitemap gains exactly 221 `<loc>` entries.
- `lastmod` (if A2's helper is on main): ranking pages and the ranking index from the England file's `source.updated` (2026-03-25); parish pages and the parish index from `national.sources.parishes.retrieved` (2026-10-05). Never the build date. A2's dist check (every `<url>` has a `YYYY-MM-DD` lastmod, none later than today) covers them.
- `scripts/check-dist.mjs`: the route count it expects grows by 221; update the number with a comment naming A4.
- `docs/RELEASE.md`: a dated entry for A4 with the counts, the class rule, the Lewes decision and the moved parish table.

## Phase 8: the OG cards

No new card template. Ranking and parish pages use the default card. Do not add 220 card renders to the `BUILD_OG=1` build.

## 10. Stop and report, rather than work around it, if

- any count differs from the notes: 296 authorities; classes 164, 63, 36, 33, 21; 10,245 parish rows; 214 billing areas; 221 new URLs;
- an anchor differs: the unitary first and last, the Havant and Rushmoor tie, the Burnley or Lancaster parish sentences;
- a class is not complete for the current year (none was on 9 November; if one is, the page must render the "not ranked" state, and you stop to report because the data changed);
- a page would need a figure or source the notes do not name;
- a test tolerance or a source hash would have to change.

## Self review before the PR

`npm run check`, `npm test`, `npm run build`, `npm run test:dist`, `npm run test:text`, `node scripts/audit-links.mjs`, `npm run test:e2e`, `npm run test:csp` (the moved filter script is a new hashed bundle on the parish pages), then `BUILD_OG=1 npm run build` and the distribution and text checks again. If Playwright's web server "exits early", a preview for the same worktree is already listening (`astro preview status`); point the suite at it with `E2E_PORT` or stop it with `astro preview stop`. Grep the built HTML for dashes and for the four ranking words. Confirm no individual is named. HTML size of `/council-tax/ranked/shire-districts/`, `/precepts/parishes/north-yorkshire/` and `/councils/north-yorkshire/` (before and after) in the PR. Screenshots at 375px and desktop, light and dark: `/council-tax/ranked/unitary-authorities/`, `/council-tax/ranked/shire-districts/` (scrolled to Havant), `/precepts/parishes/lancaster/`, `/precepts/parishes/`, `/councils/burnley/` at `#compared`.

PR title: "Band D ranked within each type of council, and parish precept pages". Body: per phase results, the anchors reproduced from the built pages, the URL and sitemap counts before and after, "Decisions taken", the screenshots, and "Built with Codex from a brief prepared in Claude Code." Do not merge.

## Conventions the tests depend on

- Class codes SD, UA, MD, ILB, OLB from `authorities[gss].classCode`; London is ILB plus OLB; the City of London is ILB.
- `bands.D` and `own.bandD` are pounds to the penny as numbers; `counties[gss].bandD` likewise. Compare the numbers, print with `pounds()`.
- Parish Band D values are integer pence (`bandDPence`), printed with `moneyPence()`; a negative value is printed with a leading hyphen by the existing helper, and written "minus" in sentences.
- `status` is "published" or "not-existing" (the type also allows "unavailable"; treat it as "not-existing" for counts and as "Not comparable" for change).
- Competition ranking; ties listed by `localeCompare(name, "en-GB")`.
- Parish rows sorted by `localeCompare(name, "en-GB")`; Lancaster's first three are Aldcliffe with Stodday, Arkholme with Cawood, Bolton le Sands.
- Slugs from `data/registry/councils.json`; every one of the 214 parish GSS codes has one.
- New URLs are self canonical because they are absent from the reviewed map; the test proves it rather than the map listing them.
