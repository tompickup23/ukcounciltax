# A3: UK Council Tax profile overhaul | Codex brief

First written 9 November 2026; revised 9 November 2026 in Claude Code (Opus) after A4 (PR 33) and A5 (PR 34) merged at `7fd7133`, for the kit `v0.3.0` charts, the A4 ranking data, the A5 face and the R1 review follow ups. Worktree `~/wt/uct-profile`, branch `feat/profile-home-overhaul`, rebased onto `origin/main` at `79fa7bd`. Read `CLAUDE.md`, `docs/RELEASE.md`, `docs/A6-GAME-BRIEF.md` sections 4 and 5, then this brief.

Every count and anchor below was dry run on 9 November 2026 against `79fa7bd`: the data files through the site's own libraries (`loadYear`, `national`, `rankClass`, `boundaryAreas`, `bandStockFor`, `collectionFor`, `population`) and a full `npm run build` of `79fa7bd` (909 HTML pages, 2,051 files, 102 MB without `BUILD_OG`). Section 14 lists the dry run in one table.

## 0. Before you start

1. **A3 is built after A6 merges.** A6 (`feat/game-as-game`, building now) vendors kit `v0.3.0` into `src/vendor/estate-kit` and adds `src/components/DataDrawer.astro`. A3 uses both and adds neither. `git fetch origin`, rebase onto `origin/main`, then check: `src/vendor/estate-kit/VERSION` reads `tag v0.3.0`, and `src/components/DataDrawer.astro` exists. If either fails, stop (section 12).
2. Read what A6 left on main before you start phase 1: how `src/lib/kit-charts.ts` names charts and builds PNGs, what `scripts/lib/face.mjs` `chartProblems` enforces, whether the site `ChartActions` or the kit's `ChartFigure` `actions` draws the actions row, and whether `/tools/budget/<slug>/` still renders `BandSelector`. Follow A6's choices; this brief names the outcome it needs where A6 could have gone either way.
3. One PR, one commit per phase, in the order below. British English; no em dash, en dash or spaced hyphen anywhere, including JSON, comments, test names and commit messages.

## Rules that bind every phase

- Never estimate, derive, apportion or carry a figure forward. Every figure keeps a visible `.source-line` within its `data-fact` block: `scripts/lib/figures.mjs` fails the build otherwise, and the design check's figure source rule needs the line to be visible. Name no individual.
- Kit charts take every number by figure key from the site figure set (`src/lib/figures.ts`); no number is typed into a chart option.
- No inline script permission. Component scripts are hashed after the build; run `npm run test:csp` after any script change. Static HTML stays complete without JavaScript.
- No horizontal page overflow at 375 px. Colours from tokens only.
- Do not touch the reorganisation section's text or data: B4 item 1c owns it (registry names, the hold test). Do not change which sister sites are linked: `sisterLinks()` skips UK Food Hygiene on purpose today, and B4 item 1c changes that, not A3.
- Stage named paths only. Do not merge or deploy.
- Stop only on section 12. Any other question takes the most conservative choice (show less, never derive) and a line under "Decisions taken" in the PR.

## 1. What changes, in one paragraph

The English council profile becomes the estate's place template v2 (decision K4, 9 November 2026: A3 is the DS3 build pilot; UK Demographics stays the measured pilot, because these profiles are canonical to ukcouncils.co.uk and the beacon is off, so nothing can be measured here). An "On this page" row sits directly under the hero. The council tax answer is a plain A to H table with ten and twelve instalment columns and, beside it, the kit's band bars with the chosen band marked. The parish caveat appears once. Band D history is one chart with its 34 published values in a DataDrawer, not four tables. The bill breakdown drops rows a class cannot have and gains the kit's stacked bill bar. The class comparison gains the kit's position strip from A4's ranking data. The kit's locator map replaces the mini map. A "Discounts, exemptions and how to pay" section links the council's own council tax page where a checked link is held. The bare "More on" list becomes an "across the network" strip with sourced lines. Every kit chart has its actions row, printing one source and one table control. Small follow ups from the R1 reviews land on the homepage, the ranking pages and the parish pages. Scottish and Welsh pages get the council tax link card only.

**What A5 already shipped, so A3 does not:** the homepage hero, the postcode door and name finder in the hero, the bill card drawn by the kit's `billAnatomy`, and the task cards. The first A3 brief's phase 7 (homepage, `BillBar.astro`) is cut; only two homepage follow ups remain, in phase 1.

## 2. Files

| File | Phases |
|---|---|
| `src/lib/figures.ts` | 1: per council and per class figure records |
| `src/lib/kit-charts.ts`, `src/pages/og/charts/councils/[slug]/[chart].png.ts` (new) | 1: the profile charts and their PNGs |
| `src/components/kit/ChartActions.astro`, `src/pages/index.astro` | 1: one source and one table control; the rounding line |
| `src/pages/councils/[slug].astro` | 2 to 10 |
| `src/components/BandSelector.astro` | 2: `compact` and the band mark |
| `src/lib/council-tax.ts` | 2: `twelveInstalments` |
| `src/components/LongTaxHistory.astro`, `src/components/BandDLine.astro` | 3 |
| `src/components/NationalPrecepts.astro` | 4, 5 |
| `src/lib/boundaries.ts`, `src/components/MiniMap.astro` (deleted) | 7 |
| `scripts/import-council-links.mjs`, `data/council-links.json`, `src/lib/council-links.ts` (new), `src/pages/help.astro` | 8 |
| `scripts/import-next-elections.mjs`, `data/links/next-elections.json`, `src/lib/network.ts`, `src/components/NetworkStrip.astro` (new) | 9 |
| `src/components/PageContents.astro` (unchanged), `src/components/PreceptContext.astro` | 10 |
| `src/pages/council-tax/ranked/[class].astro`, `src/pages/precepts/parishes/[slug].astro` | 11 |
| `src/pages/[nation]/[slug].astro` | 12 |
| `scripts/check-dist.mjs`, `scripts/lib/profile.mjs` (new), `tests/*`, `e2e/national.spec.ts` | every phase |

## Phase 1: chart plumbing and the two homepage follow ups

### 1a. Figure records

Add to the site figure set in `src/lib/figures.ts`, built from the year file and `data/national/england.json` exactly as the existing records are (no new arithmetic beyond pence to pounds):

| Key | Kind | From | Source block |
|---|---|---|---|
| `council.<slug>.bands` | series, category axis, points A to H, `gbp`, dp 2 | `authorities[gss].bands` | MHCLG, the year file's title, `tableName(bandTable)` (Table 9), edition `longDate(published)` |
| `council.<slug>.area_bandd` | value, `gbp`, dp 2, `name` the council's display name | `authorities[gss].bands.D` | as above |
| `class.<rank slug>.area_bandd` | series, one point per class member, label the council's display name, `gbp`, dp 2 | `rankClass(year, cls)` rows, `area` | as above |
| `council.<slug>.bill.<part>` | value, `gbp`, dp 2, `name` the part's label (phase 5) | `components[gss]`, pence over 100 | MHCLG, `national.sources.components.title`, "Data_Billing", edition `retrieved` |
| `council.<slug>.bill.total` | value, `gbp`, dp 2, `name` "Published area average" | `components[gss].areaPence` over 100 | as above |

`<slug>` is the registry slug; `<rank slug>` is `RANK_CLASSES[n].slug`. The class series uses the same source block as the place's value, so the kit's edition check in `positionStrip` passes. Unit test: 296 band series, 296 area values, four class series of 164, 63, 36 and 33 points, and `council.burnley.area_bandd` equals 2,549.42.

### 1b. The profile charts and their PNGs

Extend `src/lib/kit-charts.ts` with the four profile charts per council (`bands`, `bill`, `position`, `map`; phases 2, 5, 6 and 7 define each), keyed `councils/<slug>/<chart>`, through the same machinery A6 left for per page charts. PNGs: `/og/charts/councils/<slug>/<chart>-light.png` and `-dark.png`, built only in the `BUILD_OG=1` pass by a new route `src/pages/og/charts/councils/[slug]/[chart].png.ts` on the pattern of `src/pages/og/charts/[chart].png.ts`. No share card per profile chart (the profile keeps its existing `councilCardPath` share image).

Volume: 296 profiles, four charts, two themes: 2,368 PNGs. Record in the PR the `BUILD_OG=1` build time and the `dist` file count and size before and after. Cloudflare Pages takes at most 20,000 files; stop if `dist` passes 15,000 (section 12).

### 1c. One source and one table control per chart

At 1440 the A5 bill card prints its source twice (inside the drawing, then as the `ChartActions` caption) and "The figures as a table" twice (the kit's `details` summary, then the `ChartActions` link). The drawing's own source must stay: it travels inside the PNG, and the kit has no option to leave it out of the inline view. The site side keeps one of each:

- **Source:** keep the `ChartActions` `.source-line`. The figure rule and the design check both need a visible HTML source line in the fact, and the drawing's text is inside an image role. The in drawing duplicate is a kit 0.4.0 follow up (an inline option that omits the drawing's source when the page prints it); note it in the PR.
- **Table:** delete the `ChartActions` link "The figures as a table". The kit's `details` summary, which reads the same, is the one control. Keep "Copy table" and the status line. If A6 moved the actions row to the kit's `ChartFigure` `actions` (which prints no source and labels its link "Table"), apply the same outcome there: one visible `.source-line` in the fact, one control that opens the table.

Assertion (in `chartProblems` or beside it): on every page, each kit chart's fact holds exactly one `.source-line` and the text "The figures as a table" exactly once. Run it over `dist/index.html` (one chart) and every profile (four charts).

### 1d. The share rounding line

The kit prints `billAnatomy` shares at one decimal place and the total row as "100%". Burnley's homepage card shares are 13.8, 70.9, 11.5 and 3.7, which add to 99.9. Under every `billAnatomy` fact (the homepage card and the profile bill bar in phase 5), when the shares as the kit prints them do not add to 100.0, print one line: "Each share is rounded to one decimal place, so together they add to {sum}%." `{sum}` is the sum of the kit's own share strings, computed with the vendored kit's `formatValue((part / total) * 100, "percent", 1)` on the same pence the drawing uses, never retyped. No line where the sum is 100.0. Kit follow up (0.4.0): largest remainder for printed shares, or the line inside the drawing.

Dry run: the homepage card sums to 99.9 (line shown). On the profiles, 81 of 296 bill bars sum to 99.9 or 100.1 (Tameside 100.1, Trafford 99.9, for example) and 215 to 100.0; Burnley's profile bar (14.1, 70.7, 11.5, 3.7) sums to 100.0, so it has no line.

## Phase 2: the A to H table and the band bars

File: `src/pages/councils/[slug].astro`, inside `<section id="council-tax">` (keep the id: the postcode door, the name finder and `e2e-csp/csp.spec.ts` land on `#council-tax`).

Order inside the section:

1. The H2, unchanged: "How much is council tax in {name} in {year}?"
2. One line: "Published yearly charge for each band, before discounts."
3. A two column block from 960 px (one column below): left the table, right the band bars.
4. **The table**, in the existing `table-wrap` pattern (`tabindex="0" role="region"` with an `aria-label`), inside `div class="fact" data-fact`:
   - caption: "Council tax bands A to H in {name}, {year}: the published yearly charge, and that charge divided by 10 and by 12"
   - columns: "Band" (row header), "Yearly charge", "Divided by 10", "Divided by 12"; money columns `class="num"`; the yearly charge cells carry `data-figure`.
   - rows A to H from `tax.bands`, printed with `pounds()`. "Divided by 10" uses `tenInstalments()`. Add `twelveInstalments(annual)` beside it, `round(annual / 12, 2)` with the same `round`, with a unit test. A null band prints "Unavailable", never £0.00 (none is null today; test the branch).
   - directly under the table, `p class="calc-label"`: "The two right hand columns are our calculation: the published yearly charge divided by 10 and by 12, rounded to the penny. They are not your instalments. GOV.UK says “The cost is usually split into 10 monthly payments”, and your council can agree 12. Your bill sets the actual amounts and dates."
   - one `SourceLine` with a `method`: source `councilTaxSource(CURRENT_YEAR, current.source.bandTable)`, method "Divided by 10 and by 12 calculated from it", then "Instalment wording: GOV.UK, How Council Tax works, Paying your bill, updated 5 February 2025, read 9 November 2026" linking `https://www.gov.uk/council-tax/paying-your-bill`. Quote only the first sentence of the GOV.UK text, as above.
5. **The band bars**, in their own `div class="fact" data-fact`: the kit's `ZeroBar`, vertical, figure `council.<slug>.bands`, `highlight: "D"`, title "Bands A to H in {name}, {year}, Band D marked", then the actions row (phase 1c). Every council has the same band ratios in law, so the bars show where a band sits against D; the table carries the figures.
6. The parish caveat (phase 4), once.
7. The MHCLG notes for the council's area figure (`tax.notes`), moved here unchanged, each prefixed "MHCLG note:". One council has one: Lewes, note `ad`, "pending approval subject to a full council decision on 26 March 2026".
8. An H3 "Change on {previous} by band", the line "Choose a band to see its change on {previous}. The band you choose is also set in the compare link below.", then `BandSelector compact`.

**The band mark.** Without JavaScript the bars mark Band D. When `BandSelector` changes band (its existing script, which already sets `#band-X`), it also sets `data-band-marked="X"` on the band bars' figure. A stylesheet rule recolours by position, since the kit draws the eight `g.ek-bar` in band order and paints with an inline `fill` style: `[data-band-marked="B"] g.ek-bar:nth-of-type(2) path { fill: var(--accent) !important }` and the Band D bar back to `var(--series-neutral)` (check the kit's neutral token name in `kit.css`). The bar labels do not move. Colour is not the only carrier: the selector's panel names the band. Assert in the e2e: choosing Band B gives the second bar the accent fill and the fourth the neutral fill; without script the fourth has `data-ek-focus="D"`.

**`BandSelector` changes**, behind a new prop `compact?: boolean` (default false). With `compact`, each panel keeps its Band figure Fact and its change Fact and drops the "a month over ten instalments" line and the panel caveat "Area average including parish precepts. Your exact bill and any discounts can differ.". **Without `compact` nothing changes.** On `79fa7bd`, `/tools/budget/burnley/` renders `BandSelector` with eight monthly lines and eight panel caveats; if it still does after A6, it must keep them. Do not touch `compare.astro`.

Remove the paragraph "Monthly equivalents divide the annual charge by ten and round to pennies. Actual bill instalments can differ."

**Dry run, Burnley (E07000117), 2026/27, Table 9**

| Band | Yearly charge | Divided by 10 | Divided by 12 |
|---|---|---|---|
| A | £1,699.61 | £169.96 | £141.63 |
| B | £1,982.88 | £198.29 | £165.24 |
| C | £2,266.15 | £226.62 | £188.85 |
| D | £2,549.42 | £254.94 | £212.45 |
| E | £3,115.96 | £311.60 | £259.66 |
| F | £3,682.50 | £368.25 | £306.88 |
| G | £4,249.03 | £424.90 | £354.09 |
| H | £5,098.84 | £509.88 | £424.90 |

`tenInstalments(2549.42)` is tested as 254.94 (`tests/council-tax.test.ts` line 155). Add `twelveInstalments(2549.42) === 212.45` and `twelveInstalments(1699.61) === 141.63`. All 296 authorities have eight non null bands.

**Assertions** (`scripts/lib/profile.mjs`, run by `check-dist.mjs` over every profile, with fail cases in `tests/profile.test.ts`)

- 296 profiles each have exactly one `table` in `#council-tax` whose head reads Band, Yearly charge, Divided by 10, Divided by 12, with eight body rows A to H, before the first `.band-selector`.
- `/councils/burnley/` row D reads £2,549.42, £254.94, £212.45; row H £5,098.84, £509.88, £424.90.
- Each profile has one band bar chart in `#council-tax` with eight bars and `data-ek-focus="D"`.
- `/councils/lewes/` contains "pending approval subject to a full council decision on 26 March 2026" exactly once inside `#council-tax` (it may also appear in the A4 ranking table, which is another page).
- No profile contains "a month over ten instalments".

## Phase 3: one Band D history, its figures in a DataDrawer

On `79fa7bd` the Burnley profile prints Band D history four times: `#history` (the long line chart plus a three year table with two `SourceLine`s), `#all-band-history` ("Every band over time"), `#long-history` (`LongTaxHistory` `view="section"`) and the line's own data. Keep one:

- `<section id="history">`, H2 "How has Band D in {name} changed?", holding `LongTaxHistory view="chart"` (it draws `BandDLine` from `national.history[gss].area`, MHCLG, Band D Council Tax figures 1993 onwards, sheet Area_CT) with its source line and caveat, and with the line's own details table turned off (`table={false}`).
- Under the chart, `DataDrawer` (A6's component, section 5 of its brief: heading before the `details`, summary text with the count) holding the table of every published value: caption "Area Band D in {name}, as published each year in whole pounds", columns "Year" and "Band D", one row per non null value, its own `SourceLine` (the long series source), inside a `data-fact`. Summary: "Show the {n} published values". Default closed.
- Delete from the profile: the three year table and both its `SourceLine`s; the whole `#all-band-history` section; the `<LongTaxHistory gss={council.gss} name={name} />` call. Delete the `history` and `historySource` constants if unused.
- `git grep "<LongTaxHistory"` on `79fa7bd` finds only the profile (two calls). If nothing renders `view="section"` afterwards, remove that branch and the helpers only it uses, and say so in the PR.

`BandDLine` stays the site's own line component (not the kit's `line`), so it has no kit actions row; moving it to the kit is a follow up, noted in the PR.

**Design questions settled.** The own share series (`ownExcludingParish`, `ownIncludingParish`) leave the profile with the long section; the council's own Band D for the current year stays in "Who sets the charge" (record under "Decisions taken"). The per band change stays in the selector panels. The long series is whole pounds and the A to H table pennies; the drawer caption says "in whole pounds".

**Dry run.** All 296 have at least two published values. First years: 1993/94 for 266 councils, 2009/10 for 8, 1996/97 for 6, 2019/20 for 4, 2023/24 for 4, 1998/99 for 3, 2021/22 for 2, and 1994/95, 1997/98 and 2020/21 for one each. Burnley: 34 values, 1993/94 £628 to 2026/27 £2,549. The 2026/27 value equals Table 9 Band D to the pound for all 296.

**Assertions.** Every profile has one `[data-band-d-line]`, one DataDrawer inside `#history` whose table has as many rows as the series has non null values (Burnley 34, containing "1993/94" and "£628"), no `.band-d-line-table`, no `#all-band-history`, no `#long-history`. `e2e/national.spec.ts` line 7 clicks "View the full Band D history and separate council shares" and expects `#long-history`: replace it with opening the drawer in `#history` and expecting "1993/94" and "£628".

## Phase 4: the parish caveat once

One caveat inside `#council-tax`, after the band bars, with `data-parish-caveat`:

"Every band includes the share of every body that sets council tax in {name}, with parish and town council precepts as an average across the area. A home in a parish pays that parish's own precept instead of the average, so its bill differs. Discounts, such as the single person discount, are not taken off."

Remove the long caveat under the selector today and the panel caveat (phase 2). Keep the line chart's own caveat in `LongTaxHistory`, the breakdown's "Parish charges are averaged into the council line" sentence and the parish section's text: each describes its own figures.

**Assertion:** every profile has exactly one `[data-parish-caveat]`, inside `#council-tax`, and "A home in a parish with its own precept pays a different amount" appears on no profile.

## Phase 5: the bill breakdown, by class, with the stacked bill bar

File: `src/components/NationalPrecepts.astro`, new prop `classCode`.

### 5a. No row for a body the class cannot have

| Class | Rows kept | Rows dropped | Rows dropped in all |
|---|---|---|---|
| SD, shire district (164) | county, police, fire, combined | none | 0 |
| UA, unitary (63) | police, fire, combined | county | 63 |
| MD, metropolitan district (36) | police, fire, combined | county | 36 |
| ILB (13) and OLB (20), London | county, labelled "Greater London Authority" | police, fire, combined | 39 and 60 |

198 rows dropped in all, every one with `bandDPence === 0` and `name === null` (dry run: 0 exceptions). All 33 London rows name "Greater London Authority". Labels: "County council" for SD, "Greater London Authority" for London, unchanged "Police", "Fire", "Combined authority" elsewhere; a kept zero row keeps "No separate precept reported". **Guard:** a row is dropped only when the data agrees; a dropped kind with a non zero figure or a body name throws with a clear message (and a unit test over all 296 proves none does today). Because every dropped row is zero, the table total is unchanged.

`BudgetBill.astro` and `src/lib/budget-game-data.ts` also print "County or GLA" on the budget pages; leave them (A6 owns that page). Assert "County or GLA" on no `/councils/` page only.

### 5b. The stacked bill bar

Above the existing table, in its own `data-fact`: the kit's `BillAnatomy`, parts in table order with zero parts left out (the table still lists them): `council.<slug>.bill.own` ("{name} council, including average local precepts", `ownWithParishPence`), then each kept non zero part, total `council.<slug>.bill.total` (`areaPence`). Title "Where a Band D bill in {name} goes, {year}". The kit refuses unless the parts add to the total to the penny: on `79fa7bd` they do for all 296 (`differencePence` is 0 everywhere and the parts sum to `areaPence`), so all 296 draw. Then the actions row, and the rounding line (phase 1d) where it applies. The chart does not replace the table.

Part counts after zero parts are dropped: 2 parts for 36 councils, 3 for 152, 4 for 103, 5 for 5. Burnley: £360.54, £1,801.75, £292.40, £94.73, total £2,549.42 (Table 10 equals Table 9 for all 296), shares 14.1, 70.7, 11.5, 3.7.

**Assertions.** `/councils/manchester/#precept-breakdown` has no row header "County council", "County or GLA" or "Greater London Authority"; `/councils/camden/` has no "Police", "Fire" or "Combined authority" row header there; `/councils/burnley/` keeps four rows (Lancashire, Lancashire PCC, Lancashire Fire, "Combined authority" with "No separate precept reported"). 296 bill bars; Burnley's has four parts. `e2e/national.spec.ts` line 16 expects the City of London's Police row to read £0.00: the row is now dropped by rule; replace that with "no row header Police in `#precept-breakdown` on `/councils/city-of-london/`" and keep the £176.38 assertion and the line that the mayoral section says "The City of London is outside the Metropolitan Police District."

## Phase 6: the position strip within class

In `#compared`, under A4's position line (`[data-class-position]`, unchanged) and before the paragraph on averages, in its own `data-fact`: the kit's `PositionStrip`, figure `council.<slug>.area_bandd`, distribution `class.<rank slug>.area_bandd`, `place` the council's display name, `classLabel` the class label as A4 has it ("shire districts", "unitary authorities", "metropolitan districts", "London boroughs and the City of London"), `basis` "Area Band D, including adult social care and average parish precepts, MHCLG Table 9". Title "Area Band D in {name} within the {n} {class label}, {year}". Then the actions row. The strip throws on a value outside its class or a class under ten members; no class is near either.

Where `tax.notes` is not empty (Lewes), A4's sentence already points to the note; the strip adds nothing about it.

**Dry run** (Table 9, 2026/27; median and 90th percentile by linear interpolation, as the kit computes):

| Class | n | Lowest | Median | 90th percentile | Highest |
|---|---|---|---|---|---|
| Shire districts | 164 | £2,255.21 | £2,446.43 | £2,609.31 | £2,756.17 (Lewes) |
| Unitary authorities | 63 | £1,952.62 (Windsor and Maidenhead) | £2,486.66 | £2,609.60 | £2,765.02 (Dorset) |
| Metropolitan districts | 36 | £2,144.84 | £2,437.75 | £2,610.57 | £2,715.81 |
| London boroughs and the City of London | 33 | £1,028.21 | £2,146.76 | £2,473.81 | £2,609.20 |

Burnley £2,549.42 sits in the shire districts strip. Assert the five printed values in Burnley's strip twin against this table, and one strip on each of the 296 profiles.

## Phase 7: the locator map in place of the mini map

Delete `MiniMap.astro` and its call. Add `#map`, H2 "Where {name} is", as its own section after `#compared` (full content width up to 40rem: the kit's plates and key are too small in the old 15rem side column). The answer block at the top becomes the two column table and bars of phase 2.

- `src/lib/boundaries.ts`: export `neighbourAreas(gss)`, the focus and the areas `boundaryMap` already selects (bounds within 20% of the focus's bounds), as kit `AreaFeature`s with `properties: { code: LAD26CD, name: LAD26NM }`.
- The kit's `LocatorMap`: `areas` from `neighbourAreas`, `focus` the GSS code, `values` each drawn area's `council.<slug>.area_bandd` key (every English area has one), `breaks` `[2250, 2350, 2450, 2550]` (five classes), `boundaryCredit` `boundarySource.attribution` plus "Licensed under OGL v3.0", title "Area Band D in {name} and neighbouring council areas, {year}". The actions row under it.
- The method line under the map, in the fact: "Shaded by area Band D, the average bill for each whole council area including adult social care and average parish precepts, which MHCLG publishes on the same basis for every class of council in Table 9. Illustrative boundaries, not property or billing boundaries." Keep the existing "Map detail" text (`boundarySource.method`).

**Why these breaks:** fixed for every map so a shade means the same on every page; £100 steps around the England median of £2,441.46. Classes across the 296: under £2,250, 31; £2,250 to under £2,350, 56; £2,350 to under £2,450, 71; £2,450 to under £2,550, 77; £2,550 and over, 61.

**Neighbours:** median 9 per council, most 56, Burnley 7, and one council with none (Isles of Scilly), whose map draws the focus alone. If the kit throws for an area with no neighbours, draw the focus alone by passing it only; if it still throws, leave that one map out and say so (that is not a stop).

**Assertions.** 296 profiles have one locator map in `#map` with `data-ek-focus` equal to the council's GSS code; no `[data-boundary-map]` remains.

## Phase 8: discounts, exemptions and how to pay

### 8a. The council's own council tax page

Source: GOV.UK Local Links Manager daily export (`https://local-links-manager.publishing.service.gov.uk/data/links_to_services_provided_by_local_authorities.csv`, Open Government Licence v3.0), as held and checked by UK Places in `/Users/tompickup/ukplaces/src/data/local-links.json`, commit `b1a3262` (6 October 2026), sha256 `5c9e6a32e96fa0307ed077711ffb357922fa0c56052d368365ae68e488e181f9` (the same on UK Places `origin/main` and on disk, rechecked 9 November 2026). `source.exportDate` and `checkedOn` are both 2026-10-05. UK Places keeps a link only when the export has exactly one URL for the service and its own request reached it. Service "Pay your Council Tax", LGSL 57, LGIL 8.

Freshness: publish only while the copy's `checkedOn` is no more than 90 days before the build, that is up to and including **3 January 2027**. A build after that date: stop (section 12); the refresh is a UK Places rerun, then a data commit here.

Counts (dry run): 299 council tax links (254 England, 26 Scotland, 19 Wales). Of the 296 English billing authorities, 254 have one and 42 do not (four of the 42 have "No link in the export": Cumberland, North Yorkshire, Somerset, Westmorland and Furness). Five URLs are `http`, as published and as UK Places reached them: Tamworth, Oldham, Kirklees, Moray and Conwy. Copy them unchanged; do not rewrite a scheme.

`scripts/import-council-links.mjs`, run by hand: reads the UK Places file from a path argument, refuses unless its sha256 equals the value above, writes `data/council-links.json` with a `source` block (name, url, exportDate, checkedOn, checkedBy "UK Places", licence, service, and `via` with file, commit and sha256) and `links` holding only `councilTax` for GSS codes starting E, S or W: 299 entries. Nothing else is copied. `src/lib/council-links.ts` exports `councilTaxLink(gss): string | null` and `councilLinksSource`. Not listed on `/data/` (`e2e/national.spec.ts` line 32 pins 17 statistical publications there).

Unit tests: 299 links; 254 of the 296 English codes; Burnley `https://burnley.gov.uk/counciltax/paying-your-council-tax/`; Lancaster `https://www.lancaster.gov.uk/council-tax/pay-your-council-tax`; Camden (`E09000007`) null; every URL starts `https://` or `http://`, and exactly the five above start `http://`. `check-dist.mjs` prints a warning naming the refresh step when the build date is within 14 days of 3 January 2027.

### 8b. The section

On every English profile, after "Who sets the charge" and the London mayoral section, before reorganisation: `<section class="section" id="discounts-and-paying" aria-labelledby="discounts-heading">`, H2 "Discounts, exemptions and how to pay in {name}", then:

1. "Discounts and exemptions depend on who lives in the home and the home itself. A household with one counted adult may get a 25% discount, and some people and some homes are not counted or are exempt. This site does not decide eligibility." Link "Discounts, reductions and who is counted" to `/help/#check-discounts-and-reductions`.
2. "If paying is difficult, contact the council early." Link "If paying is difficult" to `/help/#if-paying-is-difficult`.
3. Where `councilTaxLink(gss)` is not null: link "Pay or manage your council tax on {officialName}'s website", then `p class="source-line"`: "Link from GOV.UK Local Links Manager, service “Pay your Council Tax” (LGSL 57), export of 5 October 2026, checked by UK Places on 5 October 2026."
4. Where null: "We do not hold a checked link to {name}'s own council tax page." and a link "Find your council on GOV.UK" to `OFFICIAL_COUNCIL_LOOKUP`. No reason from the UK Places notes is printed.
5. "Check the payment dates on your bill." Link "How council tax is paid" to `/help/#check-the-payment-schedule`.

`src/pages/help.astro`: add `id="check-discounts-and-reductions"`, `id="check-the-payment-schedule"` and `id="if-paying-is-difficult"` to the three existing H2s with those titles; text unchanged.

**Assertions.** 296 profiles have `#discounts-and-paying` with the three help links, each id once in `dist/help/index.html`; exactly 254 link an external council URL inside the section and 42 say "We do not hold a checked link"; Burnley links its URL; Camden says "We do not hold a checked link to Camden's own council tax page."; `node scripts/audit-links.mjs` passes.

## Phase 9: across the network (L1)

`src/components/NetworkStrip.astro` replaces the "More on {name}" list in `#more` (keep the id; H2 "{name} across the network"). One line per destination the page already links today, in this order, each a link with a plain description and, where this repository holds a sourced figure, the figure and its source line in a `data-fact`:

| Line | Where | Text | Figure and source |
|---|---|---|---|
| UK Councils | 296 (`contextLinks`) | "{name}'s council profile on UK Councils" | none |
| UK Places | 296 | "{name} on UK Places: the place, its boundaries and services" | none |
| UK Demographics | 294 with a sister URL; all 294 have a mid-2025 figure | "{name} had {allAges} residents at mid-2025: the area's population on UK Demographics" | `data/national/population.json` (ONS, Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2025, MYE2 Persons, published 1 October 2026) |
| UK Elections, with a year | 71: sister URL and a verified year | "{name}'s next scheduled council election is in {year}: seats and results on UK Elections" | `data/links/next-elections.json`, its record's `sourceLabel` linked to `sourceUrl`, then "recorded in UK Elections' council election register, checked 24 October 2026" |
| UK Elections, without | 73: sister URL, no verified year | "{name}'s seats and results on UK Elections" | none |
| AI DOGE | 234 | "{name} on AI DOGE" | none (decision 7, 9 November 2026: AI DOGE stays standalone, so no figure line deepens the link; removing it is a separate follow up) |
| Asylum Stats | 296 | "Asylum support figures for {name} on Asylum Stats" | none |

Barnsley and Sheffield have no UK Demographics URL and no population row under their current codes; they get no UK Demographics line.

`scripts/import-next-elections.mjs`, run by hand: reads UK Councils' `data/elections/next-elections.json` from a path argument, refuses unless its sha256 is `a589f5b17250eb16c43dc8d76bc734bb1e4e10cf0a1903fd7726057b059d61ba` (UK Councils `origin/main` at `151dc0f`, read 9 November 2026), and writes `data/links/next-elections.json` with its own source block (UK Councils file, commit, sha256, and the file's own `source` block copied whole) and, per English GSS code with a `nextYear`, only `nextYear`, `sourceLabel` and `sourceUrl`. 174 records, all English billing authorities: 152 for 2027, 12 for 2029, 8 for 2028, 2 for 2030. Burnley: 2027, "Burnley Borough Council, Postal Voting page", `https://burnley.gov.uk/council-democracy/elections-voting/postal-voting/`. The quote is not copied or printed.

The game page gets the same strip: render `NetworkStrip` at the foot of `/tools/budget/<slug>/` for all 296 budget routes, available or no return, after A6's content and before the page's last links line.

**Assertions.** Burnley's strip has six lines (UK Councils, UK Places, UK Demographics with 100,946, UK Elections with 2027, AI DOGE, Asylum Stats); every external URL in a strip is in the registry or the saved sitemaps, as today; 294 profiles print a population and 71 an election year; no strip line exists for a destination the old list did not link; 296 budget routes carry the strip.

## Phase 10: "On this page" under the hero

Move `PageContents` directly after `</header>` of `.council-head`. Build its items from the sections the page renders, in document order, from the same conditions, so it cannot drift:

| id | Label | Present on (dry run) |
|---|---|---|
| council-tax | Bands A to H | 296 |
| band-mix | Properties in each band | 296 (`bandStockFor`) |
| collection | Collection rates | 296 (`collectionFor`) |
| where-money-goes | Where the money goes | 296 (`BudgetSummary`, A1 and the game) |
| precept-breakdown | Where a Band D bill goes | 296 |
| parish-precepts | Parish charges | 296 (214 with rows, 82 with the "no rows" sentence) |
| compared | {class label} and England | 296 while `englandArea` exists |
| map | Map | 296 |
| history | Band D since {first year} | 296 |
| who-sets-it | Who sets the charge | 296 |
| mayoral-precept | The mayoral precept | 33 London (add the id and an `aria-labelledby` to the section in `PreceptContext.astro`) |
| discounts-and-paying | Discounts, exemptions and how to pay | 296 |
| reorganisation | Reorganisation | 14 |
| more | {name} across the network | 296 |

Final order: header; PageContents; `#council-tax`; the action links; `CouncilActions`; `#band-mix`; `#collection`; `#where-money-goes`; `#precept-breakdown`; `#parish-precepts`; `#compared`; `#map`; `#history`; `#who-sets-it`; `#mayoral-precept`; `#discounts-and-paying`; `#reorganisation`; `#more`. On `79fa7bd` the Burnley section order is `council-tax band-mix collection where-money-goes precept-breakdown parish-precepts compared history all-band-history long-history who-sets-it reorganisation more`.

**Assertion** (built page test): for every profile, the `href="#..."` list in `nav.page-contents` equals, in order, the ids of every `section[id]` after the nav inside `main`. `tests/collection-rates.test.ts` still finds `#collection` after `#band-mix`. Record the y position of the A to H table at 375 on `/councils/burnley/` (a measurement, not a gate).

**Why no drawer for the parish summary:** A4 moved the 10,245 parish rows to the 214 parish pages, so the profile's parish section is now one range sentence and one link. A drawer would hide two lines and save nothing; the DataDrawer goes on the history, the only long table left on the profile.

## Phase 11: R1 review follow ups

1. **Capitals.** On `/council-tax/ranked/<class>/` the table caption and the last breadcrumb start with the class label in lower case ("unitary authorities, Band D 2026/27, lowest to highest area Band D"). Capitalise the first letter in both (a helper `sentenceCase(label)`; "London boroughs and the City of London" is unchanged). Leave the lower case label inside sentences.
2. **Third parish source line.** `/precepts/parishes/<slug>/` prints `SourceLine source={parishSource}` three times: in the header fact, under the table (inside its fact), and after the change method note (line 46 on `79fa7bd`). Delete the third. Assert each of the 214 parish pages carries the parish source line exactly twice.
3. **Own share columns on phones.** On the four class ranking pages the "Position by own share" and "Own Band D" columns sit off screen to the right at 375. Under 600 px: hide those two columns (`th` and `td`, `display: none`) and show, inside the council's row header, one line `span.own-inline` "Own share: {position cell}, {own Band D}" with the same values and `data-figure`; from 600 px the reverse. The table's caption, order and source are unchanged, and the county page (one own column) is untouched. Assert at 375 in the e2e: `scrollWidth` of the table region equals its `clientWidth` on `/council-tax/ranked/shire-districts/`, `/council-tax/ranked/unitary-authorities/` and the London page, and on the shire districts page Havant's row reads "Own share: 116=, £246.87".
4. **The 1 dp shares** are phase 1d. **A5 brief "Table 10"** for Burnley's 2,549.42 is corrected to Table 9 in a separate commit on this branch (`docs/A5-FACE-BRIEF.md`, section 4 table); nothing to build.

## Phase 12: Scottish and Welsh pages

In the "Your next steps" cards of `src/pages/[nation]/[slug].astro`, where `councilTaxLink(row.gss)` is not null, add a card "Pay or manage your council tax", line "On {row.name} council's own website", linking that URL, and under the card grid the same Local Links source line as phase 8. 26 of 32 Scottish and 19 of 22 Welsh pages get it; the rest get nothing new. No A to H instalment table (no Scottish or Welsh instalment wording has been read), no component rows, no PageContents on these pages.

**Assertion:** exactly 26 Scottish and 19 Welsh built pages link a URL from `data/council-links.json`.

## 12. Stop and report, rather than work around it, if

- main has not got kit `v0.3.0` vendored or `DataDrawer.astro` (A6 not merged);
- either pinned sha256 differs (UK Places local links, UK Councils next elections); do not refetch;
- the build date is after 3 January 2027 (local links freshness);
- a dropped component row carries a non zero figure or a body name;
- any count in this brief differs (296 profiles, 254 and 42 links, 26 and 19, 198 dropped rows, 296 bill bars, 81 rounding lines, the strip and map counts, 294 and 71 and 174, the Burnley rows and the class strip table);
- `dist` passes 15,000 files;
- a kit gate refuses a chart for a reason this brief does not foresee (not the Isles of Scilly map, which section 7 settles);
- a test tolerance, a source hash or a vendored kit file would have to change.

## 13. Self review and the PR

`npm run check`, `npm test`, `npm run build`, `npm run test:dist`, `npm run test:text`, `node scripts/audit-links.mjs`, `npm run test:e2e`, `npm run test:csp`, then `BUILD_OG=1 npm run build` and the dist and text checks again. If Playwright's web server "exits early", a preview for the worktree is listening (`astro preview status`): use `E2E_PORT` or `astro preview stop`. Text diff: extract every number from the visible text of every page (including SVG `<text>`) in a `79fa7bd` build and in yours; list every page whose numbers changed and why (the profiles, the homepage rounding line, the ranking own share line, the budget pages' strip); no published value may change. Measure the HTML size of `/councils/burnley/` before (98,342 bytes on `79fa7bd`) and after.

Design check skill at 390 and 1440 in both themes on `/councils/burnley/`, `/councils/manchester/`, `/councils/camden/`, `/councils/lewes/`, `/council-tax/ranked/unitary-authorities/`, `/precepts/parishes/burnley/`, `/scotland/city-of-edinburgh/`, with the history drawer closed (if the figure source rule fails on facts inside the closed drawer, stop as A6 section 5 says). Playwright captures at 375 in both themes: `/councils/burnley/` first screen, the band bars after choosing Band B, the bill bar, the strip, the map, the open drawer, the network strip; `/council-tax/ranked/london-boroughs/` table.

PR title: "Profile template v2: A to H table, kit charts, one history, how to pay, across the network (A3)". Body: per phase results with the dry run tables reproduced from the built pages, the build time and file counts, the size before and after, the text diff summary, "Decisions taken", the captures, the kit 0.4.0 follow ups (the inline source option, largest remainder shares), and the line "Built with Codex from a brief prepared in Claude Code." Do not merge.

## 14. Dry run record, 9 November 2026, against `79fa7bd`

| Item | Value |
|---|---|
| Build of `79fa7bd` | 909 HTML pages, 2,051 files, 102 MB, no `BUILD_OG` |
| English billing authorities | 296: SD 164, UA 63, MD 36, ILB 13, OLB 20 |
| Null bands | 0 |
| History | 296 with two or more values; 0 differ from Table 9 by over £1; Burnley 34 values |
| Dropped component rows | 198 (UA 63, MD 36, ILB 39, OLB 60), 0 non zero or named |
| Bill bars | 296 reconcile to the penny; 81 print the rounding line |
| Table 9 Band D against Table 10 area total | 0 differences |
| Class strips | 164, 63, 36, 33 members; values in section 6 |
| Map | 296 areas; neighbours median 9, most 56, Burnley 7, one with none |
| Band stock, collection rates | 296 and 296 |
| Parish rows | 214 councils with rows, 82 without |
| Reorganisation entries | 14 |
| Sister URLs today | UK Councils 296, UK Places 296, UK Elections 144, UK Demographics 294, AI DOGE 234, Asylum Stats 296, UK Food Hygiene 0 (skipped by `sisterLinks`) |
| Population | 294 (no row for Barnsley or Sheffield) |
| Next elections | 174 verified, 71 with a UK Elections URL |
| Council tax links | 299 (254 E, 26 S, 19 W); 296 English: 254 with, 42 without; 5 `http` |
| Burnley profile HTML | 98,342 bytes; 8 monthly lines and 8 panel caveats today, as on `/tools/budget/burnley/` |

## Conventions the tests depend on

- Class codes SD, UA, MD, ILB, OLB, as in `authorities[gss].classCode`.
- Table 9 bands are pounds to the penny as numbers (`2549.42`), printed with `pounds()`. Table 10 components and local bill schedules are integer pence, printed with `moneyPence()`.
- `round(x, 2)` is the existing half up helper; `twelveInstalments` uses it.
- The long history series is keyed by year label (`"1993-94"`), whole pounds or null.
- `data/council-links.json` and `data/links/next-elections.json` are keyed by GSS code; a missing key means no record, never an empty string.
- Section ids are the contract between `PageContents`, the postcode door (`#council-tax`), the band selector hash (`#band-X`) and the tests. Do not rename an existing id.
