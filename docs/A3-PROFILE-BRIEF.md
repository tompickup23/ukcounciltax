# A3: UK Council Tax profile and home overhaul | Codex brief

Written 9 November 2026 in Claude Code (Opus) for a Codex lane A session. Worktree `~/wt/uct-profile`, branch `feat/profile-home-overhaul`, cut from `origin/main` at `baf0f05`. Read `CLAUDE.md`, `docs/RELEASE.md` and this brief, in that order. Every figure and count below was dry run on 9 November 2026 against `data/council-tax/england-2026-27.json` (generated 27 September 2026), `data/national/england.json` (schema 1, year 2026-27), `data/local-bills/burnley-2026-27.json` and `data/devolved/council-tax.json`.

## 0. Before you start

1. `git fetch origin` and rebase onto the current `origin/main`. PR 26 (the budget game) and A2 (`feat/brand-canonicals-nav`, the quick wins batch) are expected to have merged. A2 touches the same files as this brief: its item 3 and item 8 add links to the related links block of `src/pages/councils/[slug].astro`, item 5 edits `src/pages/[nation]/[slug].astro`, item 2 edits `NAV_GROUPS`. Keep every A2 link when you rebase; this brief adds to them and removes none of them.
2. If A2 has not merged, build on `origin/main` anyway and say so in the PR. Do not stack on the A2 branch unless Tom's paste prompt says so.
3. One PR, one commit per phase, in the order below.

## Rules that bind every phase

- British English. No em dash, en dash or spaced hyphen as a dash anywhere, including JSON, comments, test names and commit messages; `npm run test:text` sweeps the build.
- Never estimate, derive or carry a figure forward. Every figure keeps a source line within the same `data-fact` block (`scripts/check-dist.mjs` fails otherwise). Name no individual.
- No inline script permission. Component scripts are hashed after the build; run `npm run test:csp` after any script change. Static HTML must stay complete without JavaScript.
- No horizontal page overflow at 375px.
- Colours come from tokens only (`tests/site.test.ts` rejects colour literals outside the token file).
- Stage named paths only. Do not merge or deploy.
- Stop only on the conditions in section 9. Any other question takes the most conservative choice (show less, never derive) and a line under "Decisions taken" in the PR.

## 1. What changes, in one paragraph

The homepage leads with the visitor's own council: the postcode door and the name finder move into the hero, and the Burnley "Anatomy of a bill" aside becomes one stacked 100 pound bar with one source line, lower down. The English council profile gets an "On this page" list directly under the hero that names every section, a plain A to H table with ten and twelve instalment columns above the band selector, the parish caveat once, one Band D history instead of four, a "Discounts, exemptions and how to pay" section with the council's own council tax page where a checked link is held, and no component row for a body that cannot exist for that class of council. Scottish and Welsh pages get the council's own council tax link and nothing else from this brief.

## Phase 1: the plain A to H table on the profile

File: `src/pages/councils/[slug].astro`, inside the existing `<section id="council-tax">` (keep the id: the postcode door, the name finder and `e2e-csp/csp.spec.ts` all land on `#council-tax`).

Order inside the section:

1. The H2 question, unchanged: "How much is council tax in {name} in {year}?"
2. One line: "Published yearly charge for each band, before discounts."
3. The table, inside the existing `table-wrap` pattern (`tabindex="0" role="region"` with an `aria-label`), wrapped in a `div class="fact" data-fact` so the source line counts for every figure:
   - caption: "Council tax bands A to H in {name}, {year}: the published yearly charge, and that charge divided by 10 and by 12"
   - columns: "Band" (row header, `scope="row"`), "Yearly charge", "Divided by 10", "Divided by 12"; the three money columns carry `class="num"`; the yearly charge cells carry `data-figure`.
   - rows: A to H from `tax.bands`, printed with `pounds()` from `src/lib/council-tax.ts`.
   - "Divided by 10" uses the existing `tenInstalments()`. Add `twelveInstalments(annual)` beside it, `round(annual / 12, 2)` with the same `round` helper, and a unit test.
4. Directly under the table, a `p class="calc-label"`: "The two right hand columns are our calculation: the published yearly charge divided by 10 and by 12, rounded to the penny. They are not your instalments. GOV.UK says “The cost is usually split into 10 monthly payments”, and your council can agree 12. Your bill sets the actual amounts and dates."
5. One `p class="source-line"` (use `SourceLine` with a `method`): source `councilTaxSource(CURRENT_YEAR, current.source.bandTable)` (MHCLG, Council Tax levels set by local authorities in England 2026 to 2027, Table 9, published 25 March 2026), method "Divided by 10 and by 12 calculated from it", followed by "Instalment wording: GOV.UK, How Council Tax works, Paying your bill, updated 5 February 2025, read 9 November 2026" linking `https://www.gov.uk/council-tax/paying-your-bill`. Wording quoted from the raw page text on 9 November 2026 (GOV.UK content API, part `paying-your-bill`): "The cost is usually split into 10 monthly payments. Contact your local council immediately if you’re having trouble paying: they can help you, for example by spreading your payments over 12 months instead of 10." (The page's own text has a spaced hyphen where this brief has a colon; quote only the first sentence on the site, as above.)
6. The parish caveat, once (phase 3 sets its wording), carrying `data-parish-caveat`.
7. MHCLG notes for the council's area figure (`tax.notes`), moved here from below the selector, unchanged in wording: one council has one, Lewes (note `ad`, "pending approval subject to a full council decision on 26 March 2026").
8. Then an H3 "Change on {previous} by band" and one line "Choose a band to see its change on {previous}. The band you choose is also set in the compare link below." followed by the existing `BandSelector`. The selector stays for the compare and scenario links and the per band change.

`BandSelector.astro` changes: each panel keeps its Band figure Fact and its change Fact; remove the "a month over ten instalments" line and the panel caveat "Area average including parish precepts. Your exact bill and any discounts can differ." (the table and the single caveat now carry both). Do not touch `compare.astro`, which has its own copy of that caveat.

Remove the paragraph "Monthly equivalents divide the annual charge by ten and round to pennies. Actual bill instalments can differ." (superseded by the calc label).

**Design questions settled**

- A council with an MHCLG note (Lewes): the table prints the published figures as they stand, and the note follows the table verbatim, prefixed "MHCLG note:". No marker in the cells, no figure withheld. The ranking question for Lewes belongs to A4, not here.
- Twelve column label: the header says "Divided by 12", never "Monthly" or "Instalment"; the calc label says in words that it is a calculation, and the source line says "calculated from it". Same for ten.
- Rounding: half up to the penny, the same `round` the ten column already uses. The column is never summed back.
- Mobile: four columns fit at 375px in the existing table style; if they do not, the `table-wrap` scrolls inside its region and the page itself must not overflow. Do not abbreviate the headers.
- No band is ever derived: the table prints only the eight published band figures from Table 9.

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

`tenInstalments(2549.42)` is already tested as 254.94 (`tests/council-tax.test.ts` line 155). Add `twelveInstalments(2549.42) === 212.45` and `twelveInstalments(1699.61) === 141.63`. All 296 authorities have eight non null band figures (checked: no null in `bands`), so no row needs an "Unavailable" branch, but keep one for safety and test that it renders "Unavailable", not £0.00.

**Assertions (dist check, new block in `scripts/check-dist.mjs` or a built page test)**

- Every `/councils/<slug>/index.html` (296) has exactly one `table` inside `#council-tax` whose `thead` reads Band, Yearly charge, Divided by 10, Divided by 12, with eight body rows A to H.
- `/councils/burnley/` row D reads £2,549.42, £254.94, £212.45; row H reads £5,098.84, £509.88, £424.90.
- In every profile the A to H table appears before the first `.band-selector` in document order.
- `/councils/lewes/` contains the note text "pending approval subject to a full council decision on 26 March 2026" exactly once, inside `#council-tax`.
- No profile contains "a month over ten instalments".

## Phase 2: one Band D history instead of four

Today the profile prints Band D history four times: the `#history` section (the long series line chart plus a three year table), the `#all-band-history` "Every band over time" table, the `LongTaxHistory` section `#long-history` (summary sentence, caveat, a details table with three series), and the line's own data. Keep one:

- `<section id="history">`, H2 "How has Band D in {name} changed?", containing `LongTaxHistory` with `view="chart"`, which draws `BandDLine` from `national.history[gss].area` (MHCLG, Band D Council Tax figures 1993 onwards, revised April 2026, sheet Area_CT) with its source line and caveat in the slot.
- Turn on the line's own details table for the profile: pass `table` through `LongTaxHistory` to `BandDLine` (it defaults to true in `BandDLine`; check `LongTaxHistory` passes nothing that turns it off). The details summary reads "View the figures in this chart as a table".
- Delete from the profile: the three year table and its two `SourceLine`s inside `#history`; the whole `#all-band-history` section; the `<LongTaxHistory ... />` section call (the `view="section"` default). Delete the `history` and `historySource` constants if nothing else uses them.
- Keep `LongTaxHistory.astro`'s `view="section"` branch only if another page renders it; `git grep "<LongTaxHistory"` on 9 November found only the profile. If nothing else uses it, remove the branch and the `notes`, `change` and `money` helpers it alone needs, and say so in the PR.

**Design questions settled**

- The own share series (`exc_PP`, `inc_PP`) leave the profile with the long section. The council's own Band D for the current year stays in "Who sets the charge". Record this under "Decisions taken".
- The per band year on year change stays in the selector panels (phase 1), so "Every band over time" is not needed for the change.
- The long series is whole pounds and the A to H table is pennies. The line's caption already says "as published each year in whole pounds"; keep it.

**Dry run**

- Every one of the 296 authorities has at least two published area values: the earliest first year is 2023-24 (four councils), most start 1993-94 (266). So `#history` renders on all 296.
- Burnley: 34 published values, 1993/94 £628 to 2026/27 £2,549.
- The 2026-27 value of the long series equals the Table 9 Band D rounded to the pound for all 296 (0 mismatches over £1).

**Assertions**

- Every profile has exactly one element matching `[data-band-d-line]`, exactly one `.band-d-line-table`, and no `#all-band-history`, no `#long-history`.
- `e2e/national.spec.ts` line 11 clicks "View the full Band D history and separate council shares" and expects `#long-history`. Replace it with: click "View the figures in this chart as a table" inside `#history` and expect the table to contain "1993/94" and "£628".

## Phase 3: the parish caveat once

One caveat, inside `#council-tax`, directly under the A to H table's source line, with `data-parish-caveat`:

"Every band includes the share of every body that sets council tax in {name}, with parish and town council precepts as an average across the area. A home in a parish pays that parish's own precept instead of the average, so its bill differs. Discounts, such as the single person discount, are not taken off."

Remove: the long caveat paragraph that sits under the selector today; the panel caveat (phase 1); the "Includes average parish precepts" line in the old `#history` (gone with phase 2). Keep: the line chart's own caveat inside `LongTaxHistory` (it says the series includes average parish precepts, which describes the chart, not the bill), the national breakdown's "Parish charges are averaged into the council line" sentence (it explains a table row), and the parish section's own text (it describes parish rows). These describe their own figures and are not the bill caveat.

**Assertion**: every profile has exactly one `[data-parish-caveat]`, inside `#council-tax`, and the string "A home in a parish with its own precept pays a different amount" no longer appears.

## Phase 4: no component row for a class that cannot have it

File: `src/components/NationalPrecepts.astro`. Today every billing area prints four rows (county or GLA, police, fire, combined) even where the class cannot have that body, so a metropolitan district shows "County or GLA: No separate precept reported, £0.00".

Rule, keyed on the class code in `data/council-tax/england-2026-27.json` (`authorities[gss].classCode`), passed in as a new prop `classCode`:

| Class | Rows kept | Rows dropped | Why |
|---|---|---|---|
| SD, shire district | county, police, fire, combined | none | A shire district always sits in a county; police, fire and a combined authority can each precept |
| UA, unitary | police, fire, combined | county | No county tier |
| MD, metropolitan district | police, fire, combined | county | No county tier |
| ILB and OLB, London | county (labelled "Greater London Authority") | police, fire, combined | Police (outside the City) and fire are within the GLA precept; no combined authority precepts in London |

Labels: "County council" for SD, "Greater London Authority" for London (all 33 London rows name "Greater London Authority"), unchanged "Police", "Fire", "Combined authority" elsewhere. A kept row with a zero and no body keeps today's text "No separate precept reported" (for example the 63 shire districts whose county runs fire, and the 10 metropolitan districts whose fire sits in a combined authority).

Guard: a row is dropped only when the data agrees: `bandDPence === 0` and `name === null`. If a dropped kind ever carries a non zero figure or a body name, the build must fail with a clear message (throw in the component or assert in a unit test over all 296), never hide a figure.

**Dry run** (all 296 billing areas, Table 10 `Data_Billing` as imported):

| Class | Count | Dropped kinds | Rows dropped | Any dropped row non zero or named |
|---|---|---|---|---|
| SD | 164 | none | 0 | n/a |
| UA | 63 | county | 63 | none |
| MD | 36 | county | 36 | none |
| ILB | 13 | police, fire, combined | 39 | none |
| OLB | 20 | police, fire, combined | 60 | none |

198 rows dropped in all. Because every dropped row is zero, the table's sum and the existing `differencePence` rounding note are unchanged.

**Assertions**

- Unit test over all 296: the kept kinds per class match the table above; every dropped part has `bandDPence === 0 && name === null`.
- Built pages: `/councils/manchester/#precept-breakdown` has no row whose header is "County council", "County or GLA" or "Greater London Authority"; `/councils/camden/` has no "Police", "Fire" or "Combined authority" row header in that table; `/councils/burnley/` still has four rows (Lancashire, Lancashire PCC, Lancashire Fire, and "Combined authority" with "No separate precept reported").
- No built page contains the string "County or GLA".
- `e2e/national.spec.ts` line 15 expects the City of London's Police row to read £0.00. The row is now dropped by rule. Replace that assertion with: `#precept-breakdown` on `/councils/city-of-london/` has no row header "Police", and the mayoral section still says "The City of London is outside the Metropolitan Police District." Keep the £176.38 assertion.

## Phase 5: "Discounts, exemptions and how to pay"

### 5a. The council's own council tax page: source and date check

Source: GOV.UK Local Links Manager daily export, `https://local-links-manager.publishing.service.gov.uk/data/links_to_services_provided_by_local_authorities.csv`, Open Government Licence v3.0, as held and checked by UK Places in `/Users/tompickup/ukplaces/src/data/local-links.json` (commit `b1a3262`, 6 October 2026; file sha256 `5c9e6a32e96fa0307ed077711ffb357922fa0c56052d368365ae68e488e181f9`, the same on `origin/main` and on disk on 9 November 2026). Its `source.exportDate` and `checkedOn` are both 2026-10-05. UK Places keeps a link only when the export has exactly one URL for the service and its own request on 5 October 2026 reached it (HTTP 200 after redirects, not landing on a home page). Service: "Pay your Council Tax", LGSL 57, LGIL 8.

Date check (the brief's rule): a copy is fresh enough to publish when its check date is no more than 90 days before the build. On 9 November 2026 it is 35 days old, so the link is **in**. The same file is the source B2 uses on UK Councils (`docs/B2-FRONT-DOOR-SOURCE-NOTES.md` in `~/wt/ukc-front-door`).

Counts: 299 council tax links across 361 places (254 England, 26 Scotland, 19 Wales, 0 Northern Ireland), matching roadmap row R443. Of the 296 English billing authorities, **254 have a link and 42 do not** (UK Places notes give the reason, mostly "Not published: HTTP 403", four "No link in the export": Cumberland, North Yorkshire, Somerset, Westmorland and Furness). Of the 32 Scottish councils 26 have one; of the 22 Welsh, 19.

Import (no build time read across repositories): add `scripts/import-council-links.mjs`, run by hand. It reads the UK Places file at a path given on the command line, refuses to run unless the file's sha256 equals the pinned value above, and writes `data/council-links.json`:

```json
{
  "source": {"name": "GOV.UK Local Links Manager", "url": "<export url>", "exportDate": "2026-10-05", "checkedOn": "2026-10-05", "checkedBy": "UK Places", "licence": "Open Government Licence v3.0", "service": {"title": "Pay your Council Tax", "lgsl": 57, "lgil": 8}, "via": {"file": "ukplaces src/data/local-links.json", "commit": "b1a3262", "sha256": "5c9e6a32e96fa0307ed077711ffb357922fa0c56052d368365ae68e488e181f9"}},
  "links": {"E07000117": "https://burnley.gov.uk/counciltax/paying-your-council-tax/"}
}
```

`links` holds only `councilTax` entries for GSS codes that start E, S or W and that UK Places kept: 299 entries. Nothing else from the file is copied (no bin links, no notes). Add `src/lib/council-links.ts` exporting `councilTaxLink(gss): string | null` and `councilLinksSource`. Do not add it to `/data/`: that page lists statistical publications built from `loadYear`, `national.sources`, `devolved` and `localBills`, and `e2e/national.spec.ts` expects exactly 13 rows. The link's source line on each page is its provenance; record the source in `docs/RELEASE.md` and on `/sources/` only if `/sources/` already lists non statistical link sources (check it; if it does not, leave it).

Unit tests: 299 links; 254 of the 296 English GSS codes; Burnley `https://burnley.gov.uk/counciltax/paying-your-council-tax/`; Lancaster `https://www.lancaster.gov.uk/council-tax/pay-your-council-tax`; `councilTaxLink("E09000007")` (Camden) is null; every URL is https.

Freshness after merge: `scripts/check-dist.mjs` prints a warning (not a failure) when the build date is more than 90 days after `checkedOn`, naming the refresh step. Record in `docs/RELEASE.md`: refresh the copy from UK Places (after UK Places reruns its check) before 1 March 2027; a refresh is a data change with its own commit and the counts above restated.

### 5b. The section

On every English profile, after "Who sets the charge" and the London mayoral section, before reorganisation:

```
<section class="section" id="discounts-and-paying" aria-labelledby="discounts-heading">
  <h2 id="discounts-heading">Discounts, exemptions and how to pay in {name}</h2>
```

Content, in this order:

1. "Discounts and exemptions depend on who lives in the home and the home itself. A household with one counted adult may get a 25% discount, and some people and some homes are not counted or are exempt. This site does not decide eligibility." Then a link "Discounts, reductions and who is counted" to `/help/#check-discounts-and-reductions`. (The 25% wording is already on `/help/`, sourced to GOV.UK there; do not add a new claim.)
2. "If paying is difficult, contact the council early." Link "If paying is difficult" to `/help/#if-paying-is-difficult`.
3. Where `councilTaxLink(gss)` is not null: a link "Pay or manage your council tax on {officialName}'s website" to that URL, followed by a `p class="source-line"`: "Link from GOV.UK Local Links Manager, service “Pay your Council Tax” (LGSL 57), export of 5 October 2026, checked by UK Places on 5 October 2026." Use `council.officialName` from the registry.
4. Where it is null: "We do not hold a checked link to {name}'s own council tax page." followed by a link "Find your council on GOV.UK" to `OFFICIAL_COUNCIL_LOOKUP`. No reason from the UK Places notes is printed: "HTTP 403" is a fact about a request, not about the council.
5. "Check the payment dates on your bill." Link "How council tax is paid" to `/help/#check-the-payment-schedule`.

`src/pages/help.astro`: add ids to three existing H2s, text unchanged: "Check discounts and reductions" gets `id="check-discounts-and-reductions"`, "Check the payment schedule" gets `id="check-the-payment-schedule"`, "If paying is difficult" gets `id="if-paying-is-difficult"`. Do not edit the help copy.

**Assertions**

- 296 profiles contain `id="discounts-and-paying"` and link `/help/#check-discounts-and-reductions`, `/help/#if-paying-is-difficult` and `/help/#check-the-payment-schedule`; each of those ids exists exactly once in `dist/help/index.html`.
- Exactly 254 profiles link an external URL inside `#discounts-and-paying` other than GOV.UK; 42 contain "We do not hold a checked link".
- `/councils/burnley/` links `https://burnley.gov.uk/counciltax/paying-your-council-tax/`; `/councils/camden/` contains "We do not hold a checked link to Camden's own council tax page."
- `node scripts/audit-links.mjs` passes (it checks internal links; do not make it fetch councils).

## Phase 6: "On this page" under the hero, listing every section

Move `PageContents` from mid page to directly after `</header>` of `.council-head`, before `.council-answer`. Build its items from the sections the page actually renders, in document order, from the same conditions that render them, so the list cannot drift:

| id | Label | Present on |
|---|---|---|
| council-tax | Bands A to H | 296 |
| band-mix | Properties in each band | 296 (`data/national/band-stock.json` has 296 councils) |
| collection | Collection rates | 296 (`data/national/collection-rates.json` has 296) |
| precept-breakdown | Police, fire and other precepts | 296 |
| parish-precepts | Parish charges | 296 (the section renders with a "no rows" sentence for the 82 without parish rows) |
| compared | England and class averages | 296 while `englandArea` exists |
| history | Band D since {first year} | 296 |
| who-sets-it | Who sets the charge | 296 (`own` is present for all) |
| mayoral-precept | The mayoral precept | 33 London (add `id="mayoral-precept"` and an `aria-labelledby` to the section in `PreceptContext.astro`) |
| discounts-and-paying | Discounts, exemptions and how to pay | 296 |
| reorganisation | Reorganisation | 14 (councils with `reorganisation` in the registry) |
| more | More on {name} | where `links.length > 0` |

`band-mix` and `collection` come from components that may render nothing; pass the same predicates (`bandStockFor(gss)`, `collectionFor(gss)`) to decide the item. "Band D since {first year}" uses the first published year of the long series (1993/94 for 266 councils).

Final document order of the profile: header; PageContents; `.council-answer` (the `#council-tax` section with the table, caveat, notes and selector, beside the MiniMap on desktop); the action links; `CouncilActions`; `#band-mix`; `#collection`; `#precept-breakdown`; `#parish-precepts`; `#compared`; `#history`; `#who-sets-it`; `#mayoral-precept` (London); `#discounts-and-paying`; `#reorganisation` (where held); `#more`. Any A2 related links stay in the block A2 put them in.

**Mobile order** is the document order: at under 960px the MiniMap follows the `#council-tax` section, as today. The pill list wraps; keep `PageContents` unchanged in style. Record in the PR the y position of the A to H table at 375px on `/councils/burnley/` (a measurement, not a gate).

**Assertion** (built page test): for every profile, the list of `href="#..."` in `nav.page-contents` equals, in order, the ids of every `section[id]` that follows the nav inside `main`. `tests/collection-rates.test.ts` line 55 expects `#collection` after `#band-mix` with one section between their opening tags; that still holds.

## Phase 7: the homepage, postcode door first

File: `src/pages/index.astro`.

1. The hero keeps the eyebrow, the H1 "Council tax {year}" and a one sentence lede. The hero's right column (desktop) and second block (mobile) becomes the find panel: the `#find-council` heading "Find your council tax", the `PostcodeDoor id="postcode-home"`, the `CouncilFinder`, and the nation links line. Delete the separate `.find-section` below the hero (it moves up, it is not duplicated). Keep the `id="find-council"` on the panel so the old `href="#find-council"` anchors still work; remove the "Find your council tax" button in the hero, which would point at itself.
2. Keep the action links to `/precepts/`, the increases page and the future cost tool under the lede, and the coverage line.
3. The Burnley aside is removed from the hero. In its place, after the task cards (`nav.task-nav`), a section:

```
<section class="section" id="bill-example" aria-labelledby="bill-example-heading">
  <h2 id="bill-example-heading">Where a Band D bill goes: one published example</h2>
```

containing a new server rendered component `src/components/BillBar.astro`, then a link "See the full {name} schedule and every parish on What makes up my bill" to `/precepts/`. `BillSplit` stays on `/precepts/`; it no longer renders on the homepage.

### BillBar

- Props: `bill: LocalBill`, `localityId: string`, `band = "D"`, `id`.
- Data: `shareSplit(bill, localityId, band)` from `src/lib/bill-split.ts` (no new arithmetic).
- One `figure data-bill-bar` holding one inline SVG, `viewBox="0 0 1000 56"`, `role="img"`, `aria-labelledby` a `<title>` ("Out of every 100 pounds of the Band D bill, {locality}, {year}") and a `<desc>` that lists every part with its share. One `rect` per component, width `share * 10` (share is per 100, the view box is 1,000 wide), x cumulative, height 40, in schedule order (billing, county, police, fire for Burnley), each with a `<title>` "{name}: {share} of every 100 pounds". 2 unit gaps between rects are taken from the following rect's x, never added to the width total.
- Fill: `var(--accent)` for every rect, with `fill-opacity` 1, 0.72, 0.48, 0.28 by position (repeat from 1 for a fifth part). No colour literal. Colour is never the only carrier: the legend below names every part.
- Legend under the SVG: an ordered list, one item per part in bar order, each with a swatch span using the same fill and opacity, the part's label from `KIND_LABEL` and body name, its share with `formatShare`, and its published Band D charge with `moneyPence`.
- Above the bar, the total: "{moneyPence(total)} a year, Band D, {locality}, {year}, before discounts" in a `div class="fact" data-fact` with the figure marked `data-figure`.
- One `p class="source-line"` inside the figure, and only one: "Source: Burnley Borough Council, Council Tax Charges 2026/27, published charge schedule, retrieved 5 October 2026. Shares calculated from it: each body's published Band D charge divided by the published total, times 100, rounded to 2 decimal places." Link the title to `bill.source.url`.
- One caveat: "This is the unparished area of Burnley. A parish precept adds to the Band D total in a parished area. Burnley's area average including parish precepts, as MHCLG publishes it, is on the Burnley council page." with a link to `/councils/burnley/`. This answers the "two figures for one place" finding with one sentence.
- No script. Server rendered. Same colours in both themes.

**Dry run** (Burnley, unparished locality, Band D, `data/local-bills/burnley-2026-27.json`): total 254,032 pence, £2,540.32, equal to the sum of the four published components.

| Part | Body | Band D | Share |
|---|---|---|---|
| Borough council | Burnley Borough Council | £351.44 | 13.83 |
| County council | Lancashire County Council | £1,801.75 | 70.93 |
| Police | Lancashire Police Authority | £292.40 | 11.51 |
| Fire and rescue | Lancashire Combined Fire Authority | £94.73 | 3.73 |

The rounded shares sum to 100.00. Rect widths 138.3, 709.3, 115.1, 37.3 view box units.

**Assertions**

- `dist/index.html`: exactly one `[data-bill-bar]`; four `rect` inside it; the sum of rect widths (before gaps) is 1,000 within 0.5; exactly one `.source-line` inside the figure; no `.bill-stack`, no `.bill-preview`, no `#home-split-shares`.
- In `dist/index.html`, `id="postcode-home"` occurs before `data-bill-bar`, and the first `input` inside `main` is the postcode input.
- `e2e/postcode-door.spec.ts` and `e2e/stage-one.spec.ts` (name finder from `/`) pass unchanged.
- e2e, mobile project: on `/`, the postcode input's bounding box top is less than 812 (it is in the first screen at 375 by 812).
- Unit test for `BillBar`'s geometry helper if you factor one out (widths from shares, cumulative x).

Remove the now unused home CSS (`.bill-preview`, `.bill-stack`, `.slice-*`, `.bill-parts`, `.dot`, `.bill-link`, `.find-section`).

## Phase 8: Scottish and Welsh pages

They have no English components, no Table 9 and no instalment source of their own, so this brief changes one thing. In the "Your next steps" task cards of `src/pages/[nation]/[slug].astro`, where `councilTaxLink(row.gss)` is not null, add a card "Pay or manage your council tax" with the line "On {row.name} council's own website" linking that URL, and under the card grid the same Local Links source line as phase 5. 26 Scottish and 19 Welsh pages get the card; the other 9 get nothing new (no "we do not hold" line: the existing help card covers them).

Not added on devolved pages, and why:

- No A to H instalment table: Scotland already prints every band across three years; Wales holds Band D only (`data/devolved/council-tax.json`, Welsh precision "whole pounds", one band). No Scottish or Welsh instalment wording has been read, so none is printed.
- No component rows: the English Table 10 components do not exist for Scotland or Wales. Wales keeps its own published Band D components block.
- No PageContents: these pages run to about 300 words; A2 item 5 is already changing their head.

**Assertion**: exactly 26 of 32 Scottish and 19 of 22 Welsh built pages contain a link from `data/council-links.json`.

## 9. Stop and report, rather than work around it, if

- the UK Places file's sha256 is not `5c9e6a32e96fa0307ed077711ffb357922fa0c56052d368365ae68e488e181f9` (do not refetch the export yourself);
- any dropped component row carries a non zero figure or a body name (phase 4 guard);
- any count in this brief differs (296 profiles, 254 and 42 links, 26 and 19, 198 dropped rows, the Burnley rows);
- a test tolerance or a source hash would have to change.

## Self review before the PR

`npm run check`, `npm test`, `npm run build`, `npm run test:dist`, `npm run test:text`, `node scripts/audit-links.mjs`, `npm run test:e2e`, `npm run test:csp`, then `BUILD_OG=1 npm run build` and the distribution and text checks again. If Playwright's web server "exits early", a preview for the same worktree is already listening (`astro preview status`); point the suite at it with `E2E_PORT` or stop it with `astro preview stop`. Grep the built HTML for dashes. Confirm no individual is named. Measure the HTML size of `/councils/burnley/` before and after and put both in the PR (the history removal should shrink it). Screenshots at 375px and desktop, light and dark: `/`, `/councils/burnley/`, `/councils/manchester/`, `/councils/camden/`, `/councils/lewes/`, `/scotland/city-of-edinburgh/`.

PR title: "Profile and home: A to H table, one history, postcode door first, how to pay". Body: per phase results, the dry run tables above reproduced from the built pages, the size before and after, "Decisions taken", the screenshots, and the line "Built with Codex from a brief prepared in Claude Code." Do not merge.

## Conventions the tests depend on

- Class codes: SD, UA, MD, ILB, OLB, exactly as in `authorities[gss].classCode`; counts 164, 63, 36, 13, 20.
- Table 9 band figures are pounds to the penny as numbers (`2549.42`); `pounds()` formats them with a thousands separator.
- Table 10 components and local bill schedules are integer pence (`35144`); `moneyPence()` formats them.
- `round(x, 2)` is half up on the float, the existing helper; `twelveInstalments` must use it.
- Shares are rounded to `SHARE_PLACES` (2) and may sum to within `shareTolerance(parts)` of 100.
- The long history series is keyed by year label (`"1993-94"`), values whole pounds or null; null breaks the line.
- `data/council-links.json` keys are GSS codes; a missing key means no checked link, never an empty string.
- Section ids are the contract between `PageContents`, the postcode door (`#council-tax`), the band selector hash (`#band-X`) and the tests. Do not rename an existing id.
