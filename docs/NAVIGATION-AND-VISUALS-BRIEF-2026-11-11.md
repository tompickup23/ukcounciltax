# Navigation and data visuals on both sites | audit and brief, 11 November 2026

Written in Claude Code at Tom's request after an audit of both live sites, the code of both repositories and the drawing code of UK Elections and UK Demographics. It follows `DESIGN-ROUND-TWO-BRIEF.md` (D1 to D6) and `PLAN-2026-11-10-SPLIT-AND-NETWORK.md`, and covers only what those do not. Nothing here authorises a push, merge or deployment.

Like the round two brief, this is a design brief for Claude Code with `/design-check` in the loop, not a binding build brief. Each item starts with a before capture and a dry run of its counts, and the session that owns the item writes the assertions into the PR.

Items are numbered NV1 to NV14. Decisions for Tom are W1 to W6.

## 0. What this brief does not touch

- **Figures.** No value changes. Every item ends with the number diff against a main build; only presentation may differ.
- **Titles, H1s, URLs and canonicals.** None changes on either site before the reversal.
- **The UK Councils pages that leave at the reversal.** Band pages, region pages, `/council-tax/`, compare and increases on UK Councils redirect to UK Council Tax in May to June 2027 (decision N1). No item improves them on UK Councils.
- **Datasets the other site owns.** Budget tables, per resident ratios, collection rates and Exceptional Financial Support belong to UK Councils (split plan, section 3). Their drawings go there, not on UK Council Tax.
- **Work already ordered.** D1 and D3 (the dossier), D2 and D4 on UK Councils, the compare improvements in the round three handover, T1 to T8 and C1 to C9. Where an item here overlaps one of those, section 5 says how they join.

## 1. Evidence

### 1.1 How it was gathered

- Live pages on 11 November 2026 at 375 wide and at desktop width, dark theme. Heights are `document.documentElement.scrollHeight` at 375 wide. Counts of links, inputs, tables, rows and drawings are element counts inside `main`.
- Code read on local `main` of ukcounciltax at `8f7002f` (two commits behind origin; the only source difference is `compare.astro`), and local `main` of ukcouncils at `a4d21e5` (three merged pull requests behind GitHub; the council page was read from GitHub main).
- UK Demographics read on `main` at `7aa3710`. UK Elections read on the branch `proto/voter-journey-2026-11`, not main; confirm each UK Elections path on main before copying from it.
- Limits: the sister sites' drawings were read as code, not viewed. The order in which site search returns results is inferred from the code apart from one live query. Light theme was not captured.

### 1.2 Measured live, 375 wide

| Page | Height, px | What `main` holds |
|---|---|---|
| ukcounciltax.co.uk/tools/budget/ | 12,266 | 299 links, no input or select |
| ukcounciltax.co.uk/councils/ | 12,706 | 315 links, no input or select |
| ukcounciltax.co.uk/increases/ | 17,635 | 12 tables, 1,291 table rows, no drawing |
| ukcounciltax.co.uk/scotland/glasgow-city/ | 2,719 | no drawing; internal links to `/`, `/scotland/` and `/help/` only |
| ukcouncils.co.uk/exceptional-financial-support/ | 74,866 | 13 tables, no drawing, no input or select |
| ukcouncils.co.uk/councils/burnley/ | 8,846 | 28 tables, 18 drawers, 5 drawings |
| ukcounciltax.co.uk/councils/burnley/ | 13,887 | 9 tables, 5 drawers, 5 drawings |

A phone screen is 812px, so the budget game hub is about 15 screens of names and the Exceptional Financial Support page about 92 screens.

### 1.3 The budget game hub

Tom's example. The picker is one line, `src/pages/tools/budget/index.astro:18`: a list of 296 alphabetical links in columns, nine of them marked "(no budget return)". The page has no script. Nothing is broken or blocked by the content security policy; there is no search on the page to break. The only search in view is the header's, and a live query for "burnley" returned 33 pages of mixed kinds (the profile, the parish page, the game and guides together). The game page's exit, "Choose another council", returns to the same list.

### 1.4 Root causes

1. **The name finder cannot be reused.** `src/components/CouncilFinder.astro:14` hard wires each link to `/councils/<slug>/#anchor`, so it cannot send a reader to the game, a parish page or compare. It is on the homepage, `/your-area/`, `/precepts/` and the 404 page of UK Council Tax, and on two pages of UK Councils. It covers England only, matches on the name alone, shows eight results and ships disabled until its script runs.
2. **Hubs are lists, not tools.** `/councils/` on both sites, `/scotland/`, `/wales/`, `/precepts/parishes/`, `/increases/`, the class ranking pages and the Exceptional Financial Support page are static lists or tables with no filter, sort or jump to a council.
3. **Site search has no notion of a council.** `Search.astro` loads Pagefind over the whole of `main` on every page, with no page type, weighting or filter. Without its script the Search control is a link to `/councils/`, which has no search.
4. **Pages do not lead sideways.** Profiles on both sites link to no neighbouring council, no other district of the same county and no county council. The locator map is a picture, not a set of links. Devolved council pages and region pages end without an onward section.
5. **Drawings stop at the profile.** Both sites draw at build time, which is right, but outside the profile and the game almost every dataset is a table. Neither site has a map of England, a region or a nation.

### 1.5 What the plans already cover

None of D1 to D6, T1 to T8, C1 to C9 or the handovers plans a picker for the budget hub, a searchable councils index, typed search, sideways links or a map index. Two planned items touch this ground: the compare improvements ("one searchable picker per side", round three handover, section 3 item 4) and D2 on UK Council Tax, whose homepage card for the game was not built (`src/pages/index.astro:69` is a text line).

## 2. Navigation items

### NV1. One council picker (both sites; UK Council Tax first)

**Problem.** Root causes 1 and 2. Every page that needs a council builds its own way to choose one, and most build a bare list.

**Build.** A component, copied between the repositories like the others, that takes a destination and a figure to show.
1. One box that takes a postcode or a name, as `/your-area/` on UK Elections does (`src/pages/your-area.astro:236-410` there). A postcode goes to postcodes.io from the browser, with the existing privacy line. A name filters the table below.
2. Under the box, a real `table` of every council: name, region, type and one figure with its source line. Region and type chips with `aria-pressed`, a live "n of N shown" count with `aria-live`, and sortable headers that update `aria-sort`. The models are the councils index on UK Elections (`src/pages/councils/index.astro:249-324, 343-424` there) and the places index on UK Demographics (`src/pages/places/index.astro:83-110, 152-197` there). Use a real table; the UK Demographics index uses `role="row"` on `div`s.
3. Without JavaScript the table is complete, in A to Z order, with every link working. Controls stay hidden until the script runs, using the `.js` root class as `AgePyramid.astro:135-139` on UK Demographics does, so nothing shifts.
4. `href` comes from a `destination` prop: profile, budget game, parish page or compare side. `CouncilFinder` becomes a thin use of the same matching code, with the hard wired link removed.
5. Matching gains the official name (already held), the county for a district and the region, so "Lancashire" finds its twelve districts. Devolved councils join where the destination has pages for them.

**Assert.** 296 rows for English destinations (counts for other destinations dry run from the route list, not from this brief); every row a working link with scripts off; no horizontal overflow at 375; axe clean; the CSP suite passes with the new script hashed; no figure in the number diff beyond those the picker newly prints, listed by name.

### NV2. The budget game hub and the way back to it (ukcounciltax)

**Problem.** Section 1.3.

**Build.** The hub uses NV1 with destination "budget game". The figure is the council's budget headline from the pinned RA file, with the nine councils that sent no return marked in the row and sortable to the end, not mixed into the alphabet. The opening sentence keeps its count (287 of 296) and its source. On the game page, "Choose another council" opens the picker in place, and a short "Play a neighbour" row offers the other districts of the same county, or the neighbours by boundary for a single tier council, each a direct link to its game.

**Assert.** The 287 and nine counts read from the data; the hub height at 375 reported before and after (before: 12,266); `tests/fixtures/c1b-static-numbers.json` differs only by the neighbour row if that row prints a number, and by nothing if it prints names alone.

### NV3. The councils index (both sites)

**Problem.** 296 names by region. UK Council Tax prints area Band D beside each (D6); UK Councils prints nothing.

**Build.** NV1 with destination "profile". On UK Council Tax the figure is area Band D. On UK Councils the figure is Band D until the reversal (decision S2) and the row adds type and tier, which the registry already holds. Region jump pills stay.

**Assert.** As NV1. On UK Councils the count of rows equals the count of profile routes.

### NV4. Site search that knows what a council is (both sites)

**Problem.** Root cause 3.

**Build.**
1. A typeahead of councils above the full text results, fed from a small JSON index built with the site, as UK Elections does with `/election-entities.json` and `src/lib/electionLookup.ts`. Each council row offers its main destinations as links (on UK Council Tax: bill, budget game, parish precepts where held).
2. Pagefind metadata for the page type, shown as a label on each result, and filters for it. Pages that only list council names (the hidden finder list, the picker table, ranking tables) carry `data-pagefind-ignore` on those lists, so a council name stops matching dozens of pages.
3. The no JavaScript fallback stays a link to `/councils/`, which NV3 makes a usable page.
4. Check the first keystrokes after the dialog opens. On 11 November a first query for "burn" showed no results and a second for "burnley" worked. This was seen once and not reproduced; treat it as a thing to test, not a known fault.

**Assert.** A query for each of ten council names returns that council's profile first; the count of results for "burnley" reported before and after (before: 33); the dist check still finds the Pagefind assets.

### NV5. Sideways links on profiles and devolved pages (both sites)

**Problem.** Root cause 4.

**Build.**
- Profiles: a short "Nearby and alike" block with the neighbours by boundary, the other districts of the same county and a link to the class ranking, each with its Band D. On UK Councils the similar councils list, now bare names in a closed drawer, takes the same form.
- The locator map's neighbouring areas become links, following `CouncilControlMap.astro` on UK Elections, where every area is an SVG link with an `aria-label`.
- The county council named on a district page becomes a link on UK Councils once C7 gives county councils pages. Until then it stays text.
- Scottish and Welsh council pages on UK Council Tax: breadcrumb, a position strip among the councils of the same nation and year (one system, so the comparison is like for like), previous and next by name, and a link to the nation's table.
- Region and band pages on UK Council Tax end with links to the neighbouring regions or bands and to the class rankings.

**Assert.** Neighbour lists computed from the pinned boundary file, not typed; every devolved page has at least three internal onward links beyond its breadcrumb and the help link (Glasgow City has none today); no comparison crosses a nation or a charge basis.

### NV6. Long pages that need a way in (both sites)

**Problem.** The increases page on UK Council Tax is 17,635px and opens with the 2027/28 "not yet set" notice before any figure. The Exceptional Financial Support page on UK Councils is 74,866px with no filter and no drawing. The parish index is a 214 row table with no sort, and there is no search across the 10,245 parish rows.

**Build.**
- Increases (ukcounciltax only): the current year's answer first, the 2027/28 notice reduced to one line linking to its page, a "find my council" box that jumps to and marks the council's row, and earlier years inside the drawer pattern. Its drawing is NV9.
- Exceptional Financial Support (ukcouncils): the picker in its small form over the councils listed, per council blocks inside drawers, and the yearly tables kept. Its drawing is NV12.
- Parish index (ukcounciltax): sortable headers and the region chips from NV1. Search across parish names waits for T1, which needs the same index.

**Assert.** Heights at 375 reported before and after; every figure still present in the number diff; the count of Exceptional Financial Support councils and statements read from the data (the audit read 57 and 126 from the page).

### NV7. Small faults

- **UK Councils 404** has only a home link. Give it the name finder, as the UK Council Tax 404 has.
- **Breadcrumbs** are missing on eight UK Council Tax page types besides the homepage: the tools hub, increases, precepts, coverage, data, help, the 2027/28 page and the nation indexes.
- **Band pages** (ukcounciltax only) carry nine sets of table controls, one per region. One set at the top that drives all nine tables.
- **`TaxTable`** cannot sort by charge until a type is chosen. Say so beside the control, or default to the reader's type when they arrive from a profile.
- **The tools hub** is six text cards. Give them the kit thumbs the homepage cards have, and add a breadcrumb.
- **The homepage card for the game** (the unbuilt part of D2). On a phone the game is not on the first screen and sits inside the menu.
- **Profile contents pills** number up to 14 on both sites and are not sticky. Group them under four or five headings.
- **The homepage name finder** says it covers England only while the postcode box beside it handles Scotland and Wales. Add the 54 devolved councils to its index on UK Council Tax.

## 3. Visual items

Both sister sites draw at build time as inline SVG or CSS, with no charting script in the browser. That suits the rule here against inline script and the rule that static HTML stays useful.

### 3.1 What the sister sites do that these two do not

| Pattern | Where to read it | What it gives |
|---|---|---|
| Linked area map, no script | UK Elections `src/components/CouncilControlMap.astro`, with `src/lib/geoRewind.ts` | Every area a link with a name; title and description; a caption that says what is not drawn |
| Indicator registry | UK Demographics `src/lib/map/indicators.ts` (ramps at lines 113 and 117, `colourFor` at 255, sources at 36 to 58) | Fixed class breaks, so colours mean the same each year; one source string per measure and year |
| Colour checks | UK Demographics `src/lib/map/colour.ts` and the `qa()` gate in `src/lib/map/render.ts:512` | Contrast and colour vision checks on rendered maps |
| Colour plus hatch | UK Elections `src/components/WardResultsMap.astro` | A second channel, so a class does not rest on colour alone |
| Ranked bars with a change pill | UK Elections `src/components/PartyBars.astro` | Label, bar, value as real text, and a rise or fall marker |
| Inline bar in a table row | UK Demographics `src/pages/places/index.astro` | A figure readable at a glance down a long table |
| Stacked share bar | `src/components/RaceBar.astro` on both | One 100% bar with a text legend that repeats every value |
| Stat tile with sparkline | `src/components/StatCard.astro` on both; UK Demographics adds a comparison in words from `src/lib/place-comparisons.ts` | A figure with its direction |
| Line chart with table and caption | UK Demographics `src/components/ProjectionChart.astro` | Observed and projected drawn differently; the table in a drawer; the source in the caption |
| History strip | UK Elections `src/components/HistoryStrip.astro` | One cell per year with a visible gap where boundaries changed, and a dated list below |
| Static drawing with added controls | UK Demographics `src/components/AgePyramid.astro` | A complete drawing first; controls appear only when the script runs |
| Layout tests for drawings | UK Demographics `tests/national-map-layout.spec.ts` | axe, no sideways scroll at 375, both colour schemes, scripts off |

The kit already covers some of this ground: `PositionStrip` does the job of a benchmark strip, `BandDLine` the line chart, `LocatorMap` the mini map. The gaps are the map of many areas, ranked bars, the share bar, the tile with a sparkline and the history strip.

### 3.2 Items

**NV8. A map of England as a way in (kit, then both sites).** The linked map from UK Elections, drawn from `data/geography/lad26-england.geojson`, which `src/lib/boundaries.ts` already reads. Two uses: beside the picker as a second way to choose a council, and as a choropleth of area Band D on `/council-tax/` on UK Council Tax, with fixed classes from a small registry on the UK Demographics model. On UK Councils the map sits on `/councils/` and colours by type, not by a tax figure. The table under the map is the text equivalent. See W2 on what may be coloured.

**NV9. Increases as a drawing (ukcounciltax).** Ranked bars with the change marker, one set per council class so only like is compared with like, the current year open and earlier years in drawers. This is the drawing levels day needs, so it belongs with C6.

**NV10. The bill as a bar wherever it is split (ukcounciltax).** `BillSplit` is a dot list and a table. Use the kit's `BillAnatomy` or the stacked share bar on `/precepts/` and the local bill tool. Band mix against England becomes two share bars, one above the other. Band stock stays on this site under the split plan.

**NV11. Compare, future cost and the game's exits (ukcounciltax).** Compare shows the two councils as paired bars under the difference, which joins the planned compare improvements. Future cost draws its yearly and cumulative figures as a line, labelled as a scenario with its assumptions and model version, apart from any observed figure.

**NV12. UK Councils: finances as drawings (ukcouncils).** Budget service lines, funding and reserves are tables (`BudgetTables.astro:23-76`); draw service lines as ranked bars and funding as one share bar. Exceptional Financial Support by year as bars on its hub. Collection keeps its position strip. Summary tiles gain a sparkline where the series exists, and nothing where it does not. Profile history draws the full series the data holds, not three bars.

**NV13. Reorganised councils (both sites, where each owns the page).** The history strip from UK Elections, with a visible break at a boundary change. Barnsley and Sheffield changed codes in 2025/26, which the compare fixes already handle in words.

**NV14. A layout gate for every new drawing (both sites).** Tests on the UK Demographics model: axe, no sideways scroll at 375, both themes, scripts off. This adds to the rule from day one that a reviewer looks at every chart label at 375 and 1440 in both themes.

**Rules for every drawing.** One source in the caption with publisher, document title, table and date. A table of the same figures in a drawer. Unknown is drawn as unknown, never as zero. No drawing compares across council classes, nations, years or charge bases that the site does not already compare in tables.

## 4. A constraint on drawings: image weight

The round two handover records that a kit chart on any page needs chart actions and a PNG in each theme, or the dist check fails, and the execution plan records 320 MB of PNGs after A3 with the weight ruling still waiting on Tom. Every item in section 3.2 that draws per council adds to that. So:

- NV8 is one national map per use, not one per council.
- NV9, NV10 and NV12 waited on the weight ruling (W4). It was made on 11 November 2026 (section 6), so they follow it: 2x, light theme only, palette compressed, no locator map PNG.
- NV1 to NV7 add no chart and are not affected.

## 5. Where this fits in the existing order

The order in force is the round three handover (section 3), the execution plan (sections 8.4 and 8.5) and the split plan's phases. One writer per repository. Dates that bind: the local links check in December (builds fail from 4 January 2027), the dossier on all 296 pages and levels day staged by mid January 2027, the freeze on 20 March 2027, the reversal in May to June 2027.

| Stage | When | Repository | What | Joins |
|---|---|---|---|---|
| 1 | After PR 51 merges, November 2026 | ukcounciltax | NV1, NV2, NV3 and the UK Council Tax parts of NV7 | Takes the place of "one searchable picker per side" in the compare improvements: build the picker once, then compare uses it |
| 2 | Straight after stage 1 | ukcounciltax | The compare improvements as already ordered, using NV1, with NV11's paired bars; NV4 | Round three handover, section 3 item 4 |
| 3 | After the dossier's short source line PR, December 2026 | ukcouncils | NV1 and NV3 copied across, NV4, the UK Councils 404, NV6 for Exceptional Financial Support | D2 and D4, which the round two handover lists as "not yet": the picker and typed search are the working part of the front door, so they go in the same PRs |
| 4 | After kit 0.5.0 is tagged (W4 was ruled on 11 November 2026), December 2026 to January 2027 | estate-kit | Kit 0.6.0: linked area map, ranked bars with change marker, share bar, tile with sparkline, history strip | The kit lane, so each drawing is built once |
| 5 | By mid January 2027 | ukcounciltax | NV8 on `/council-tax/`, NV9, NV10, NV6 for increases | C6 levels day staged: the map and the increases drawing are what a reader wants on levels day |
| 6 | January to February 2027 | ukcouncils | NV8 on `/councils/`, NV12, NV5 | Follows the dossier on all 296 pages; C3 and C7 where they overlap |
| 7 | Before 20 March 2027 | both | NV5 on UK Council Tax, NV13, NV14 on anything not yet gated | Nothing structural lands after the freeze |
| Later | After the reversal | both | Parish search (with T1), drawings on devolved pages beyond the position strip | Phase 5 of the split plan |

Three points on the fit:

1. **Stage 1 is small and blocks nothing.** It touches the budget hub, the councils index, a new component and the finder. It does not touch profiles, `global.css` beyond its own block, the kit or any figure. It is the cheapest fix to the fault Tom named and it removes a piece of work from the compare item.
2. **The dossier stays first on UK Councils.** It gates the reversal. Nothing here is placed ahead of it.
3. **Drawings wait for the kit and the weight ruling; navigation does not.** That is why the two halves of this brief sit in different stages.

## 6. Decisions for Tom

Tom accepted W1, W3, W5 and W6 on 11 November 2026 ("Accept all four", in chat), then W2, W4 and W7 later the same day ("Accept all three", in chat). None is open. None of them authorises a push, merge or deployment.

- **W1. The order. Taken 11 November 2026: accepted.** Stage 1 goes ahead of the compare improvements on UK Council Tax, and compare then uses the picker.
- **W2. What the England map may colour.** Area Band D is one measure on one basis for all 296 billing authorities, and the councils index already prints it for all of them side by side. The council's own share is not comparable across types. **Taken 11 November 2026: as recommended,** area Band D only on UK Council Tax, with the caption saying what it includes; council type on UK Councils. Three conditions go with it: the classes are fixed in a registry and not recomputed each year, so a council does not change colour because others moved; unknown is drawn as unknown, never as the lowest class; the map is England only, with Scotland and Wales kept off it.
- **W3. Where the picker lives.** Copied into each site, like other components, or added to the kit. **Taken 11 November 2026: copied.** The kit holds drawings; the picker is page furniture with site specific destinations.
- **W4. Chart image weight.** Already waiting from the execution plan (1x instead of 2x, or no map PNGs). **Taken 11 November 2026: neither as offered.** PNGs stay at 2x, because the file exists only as a download and a 1x image looks soft once pasted elsewhere. The weight comes down three other ways: a PNG in the light theme only (the dist check that asks for one in each theme changes to match); palette compression, where a look at the result shows no visible change; and no PNG for the per council locator map. Not measured when taken: the first build under this ruling renders Burnley's four profile charts each way and records the byte counts in its pull request, and a saving too small to matter comes back to Tom. Stages 4 to 6 are no longer gated.
- **W5. Remembering the last council.** The picker could keep the last chosen council in the browser to offer it first. The project rule is that no personal household data is stored. A council choice is not household data, but it is a choice about the reader. **Taken 11 November 2026: do not store it.** Offer "your council" only within one visit, from the page the reader came from.
- **W6. Devolved names in the finder.** Add the 54 Scottish and Welsh councils to the name finder on UK Council Tax (NV7). **Taken 11 November 2026: yes,** with each labelled by nation so the different systems are not mixed.
- **W7. The picker's list on a phone.** Found in the review of PR 55: the table's 608 px inner scroll box leaves about 100 px in which to scroll the page past it, and a swipe inside it scrolls the list (about 41 swipes to its end). **Taken 11 November 2026: no inner scroll below 600 px.** With scripts on, the unfiltered list shows a short first set of rows and a "Show all 296" button, and typing filters as now. With scripts off, the full table sits in the page flow. The fix is not built; it goes with the compare improvements (row D of the handover) or ahead of them.

## 7. Gate for every item

As the round two brief, section 6: `npm run check`, `npm run build` with `BUILD_OG=1`, `npm test`, `npm run test:dist`, `npm run test:text`, the CSP suite, the browser suite before any PR that changes every page, `/design-check` at 390 and 1440 in both themes with before and after sheets, and the number diff against a main build with its allowance stated in the PR body. Obsolete assertions are replaced in their own commit and listed. British English; no em dash, en dash or spaced hyphen; no individual named; nothing estimated; named paths only when staging; merging is its own step after the checks are read; no merge or deployment without Tom's word.
