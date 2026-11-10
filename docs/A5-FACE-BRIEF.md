# A5, the face: homepage and skeleton

Written 9 November 2026 in Claude Code, from `docs/PLAN-2026-11-09-NEXT-SESSIONS.md` section 11.2, the estate design audit of 4 November 2026 (sections 1, 3, 5 and 8; decisions DD1, DD2 and DD4) and the UK Demographics components named in section 6. Worktree `~/wt/uct-face`, branch `feat/face-and-game`, cut from `origin/main` at `b202b0d`. Design prep: no site code is changed by this brief's commit.

The A5 build is Opus work with the design check in the loop (section 11.3). It starts after the A2 PR opens and rebases onto it, because A2 item 2 edits `NAV_GROUPS` in `src/lib/site.ts` and this brief edits the header and footer that render it.

## 1. What changes for a visitor

The first screen of the homepage answers "what is my council tax" at 390 and 1440 wide: the H1, one line, the postcode door and the council name search sit at the top of the hero copy, and the bill anatomy card beside it is a real drawing (the kit's `billAnatomy`) with its source inside it. Today the copy is centred against a card three times its height, so at 1440 by 900 the left half of the first screen is empty and the postcode door is two screens down (before capture `page1_1440_light.png`).

Under the hero, the four task cards each carry a small drawing instead of a numbered label. The phone header becomes one row (mark, search, menu); the theme select moves to the footer. The site's colours become the Estate Kit's tokens through `scripts/apply-brand.py`, so the palette parity test can bind them.

Mockup: `docs/design/home-hero.html`, built by `docs/design/build-mockups.mjs` from `docs/design/figures.burnley.json`. Screenshots in `docs/design/screens/home-hero-{390,1440}-{light,dark}.png`.

## 2. Files to change

| File | Change |
|---|---|
| `package.json`, `src/vendor/estate-kit/` (new) | The kit at a pinned tag (decision K1 in section 9). Default: vendor the kit's `dist/`, `src/components/` and `generated/sites/ukcounciltax.css` at tag `v0.2.0` (or later) into `src/vendor/estate-kit/`, with `src/vendor/estate-kit/VERSION` holding the tag and the commit, and a test that the vendored files hash to the values recorded there. |
| `scripts/apply-brand.py`, `scripts/brand-colours.json` | Splice the kit's `generated/sites/ukcounciltax.css` between `/* estate-tokens:start` and `/* estate-tokens:end */` in `src/styles/global.css`, keeping the six `@fontsource` imports above the block and the compatibility aliases below it (kit `HANDOVER_2026-11.md` section 2 gives the method). Check with `comm -23` of custom property names before and after: no name may go missing. `brand-colours.json` stays the source of the accent triple and must equal `tokens.json` `sites.ukcounciltax` in the kit. |
| `src/styles/global.css` | The estate block replaced as above. The manual `:root[data-theme="dark"]` block after it takes the kit's dark values. The series move: light `#1a6ba8 #b45309 #6d28d9 #a51d5c` become `#166ea5 #b6550f #6e24da #9d1c5c`; dark `#6aa9de #e0a35c #b49cf0 #e888b0` become `#5599cc #cf7a48 #966bfe #f83b9b` (kit `tokens.json` `series_revalidation`). Hero and task card rules at lines 451 to 462 and 493 rewritten. |
| `src/styles/palette.ts` | The same values, so the palette test passes. |
| `src/pages/index.astro` | The hero (section 3), the task cards (section 4). The `.bill-stack` spans with inline widths and the compact `BillSplit` go; `BillSplit` stays on `/precepts/`. |
| `src/components/PostcodeDoor.astro`, `src/components/CouncilFinder.astro` | Placed together inside the hero copy on one `--accent-wash` block. Ids stay unique (`postcode-home`). No behaviour change; the door's own placeholder, privacy note and fallbacks stay. |
| `src/components/SiteHeader.astro` | `ThemeSelect` removed; one row at every width: mark, nav (desktop), search, menu (phone). |
| `src/components/SiteFooter.astro` | `ThemeSelect` added, labelled "Theme". |
| `src/components/kit/ChartActions.astro` (new, or from the kit at 0.3.0) | Section 6.2. |
| `src/pages/og/` (homepage card only) | The homepage's share card from the kit's card package. The other pages' cards are the Codex follow up in section 11.3 of the plan, not A5. |
| `scripts/check-dist.mjs`, `tests/` | Section 8. |

## 3. The hero

Two columns from 900 px: copy `minmax(0, 1fr)`, card `minmax(0, 30rem)`, `align-items: start`. One column below that, copy first.

- Copy: eyebrow "Independent data · Official sources · 2026/27"; H1 "Council tax 2026/27"; one line; then the door: "Your postcode" with the submit button "Show my council tax", "or", "Council name" with "Search". The door sits on `--accent-wash`. The coverage line stays under it. The three secondary links in today's `.action-links` move to the task cards, which already carry them.
- Card: eyebrow "Anatomy of a bill", "Published example", H2 "Burnley, unparished area, Band D", then `<BillAnatomy parts={[billing, county, police, fire]} total="burnley.bandd.total" title="Four bodies charge a Burnley Band D bill" />` and the link "See the local breakdown and model each part" (no arrow glyph).
- Figures by key from a site figures file generated from `data/local-bills/burnley-2026-27.json` (`components[].bandsPence.D` and `localities[unparished].totalsPence.D`), never typed. The kit refuses the drawing unless the four parts add to the published total to the penny: 351.44 + 1,801.75 + 292.40 + 94.73 = 2,540.32, checked against the PDF on 9 November 2026 (page 1, row "Total, other parts of the borough"; file sha256 `b9e24c31…26cd9` matches the repo record).
- The source line is inside the drawing: "Source: Burnley Borough Council, Council Tax Charges 2026/27, page 1, 2026/27." The kit repeats the edition after the title; the build may set `edition` to "published March 2026" if the PDF's own date is confirmed, otherwise leave it.
- Chart title wording: no ranking words (the UK Demographics map gate in section 6.3 forbids "most", "largest" and the like in drawn text). "Four bodies charge a Burnley Band D bill" passes.

## 4. The task cards

Four cards, one drawing each, drawn to scale from figures by key, `aria-hidden="true"` because the card is a link and the drawing prints no number. Each card keeps a one line "Drawn from" source.

| Card | Destination | Drawing | Figures |
|---|---|---|---|
| What makes up my bill | `/precepts/` | stacked bar | Burnley Band D parts, PDF page 1 |
| Increases since 2012/13 | `/increases/` | line | England average area Band D, MHCLG Table 3, 2012/13 to 2026/27 |
| What could it cost | `/tools/future-cost/` | band bars A to H, D in the accent | Burnley unparished totals by band, PDF page 1 |
| How do areas compare | `/compare/` | two ticks on a strip | Burnley area Band D 2,549.42 (Table 9) and England 2,392 (Table 7), both area Band D including parish precepts and adult social care |

The thumbnails in the mockup are drawn by `build-mockups.mjs`. In the build they come from a kit `thumb` template (section 6.4), so the colours, the zero baseline and the figure keys are the kit's. The pairing of drawing to card is a judgement; the band bars could equally go on a "Find your band" card if Tom prefers.

## 5. No JavaScript, phone, CSP

**No JavaScript.** Everything in the hero is server HTML and SVG, but the two finders are script features today and stay so: `PostcodeDoor.astro` has no form `action` (the lookup goes to postcodes.io from the browser, its submit button starts `disabled`) and `CouncilFinder.astro`'s input starts `disabled`; each already carries a `noscript` line linking `/councils/`. In the hero that fallback must be visible in the first screen, so the build keeps both `noscript` lines and the door's existing "Or choose from the list" link, and keeps the door's privacy note ("Your postcode is sent to postcodes.io to find the council for it, and is not stored."), which the mockup leaves out for space and the build must not. The kit drawings are inline SVG with real text. The theme select in the footer needs script to apply (as today, `public/theme-init.js`); without it the system theme applies, and the select is hidden by a `.js` class guard so it never shows a control that does nothing.

**Phone at 375 px** (captures are at 390; the build checks 375 as well): one header row under 72 px (today 84.7 px, the design check's only header failure); H1, line, door, coverage, then the bill card, then the task cards in one column (two from 600 px). No horizontal scroll: `document.documentElement.scrollWidth` equals 375. The kit's inline text floor is 19 units, about 11 px in a 343 px column; the bill card's key rows read at that size (see the 390 captures). If that is judged too small, the kit fix is a `size: "small"` for `billAnatomy` like the waffle's, not a site override.

**CSP.** No new script. The kit SVG uses `style="fill:var(--x)"` attributes, which `style-src 'self' 'unsafe-inline'` in `public/_headers` allows today; the build must not tighten `style-src` without moving the kit to class based paint first. `npm run test:csp` after the header and footer change, since `ThemeSelect`'s script moves template.

## 6. Components from UK Demographics and the kit

Read on 9 November 2026 at `ukdemographics` `733eb02`.

### 6.1 The position strip is BenchmarkStrip, moved into the kit

`src/components/BenchmarkStrip.astro` (93 lines) draws a value on a min to max track with the median and 90th percentile marked. It is the position strip A5's compare card and A3's profile call for; no new drawing is designed. Moving it into the kit as `positionStrip` (kit 0.3.0) needs:

- Tokens, not its three hard coded hex tones (`#7DD3FC`, `#4EE4C3`, `#FF8B61` and their 24 per cent rgba), which fail the kit's contrast gate on white.
- Figures by key: the value is one figure; the distribution is a series figure of the class's published values (for example every shire district's area Band D from Table 9), and the kit computes min, median, 90th percentile and max from it, printing the method in the caption ("Median and 90th percentile calculated from the published values of the N shire districts", with N counted from the table). Nothing is typed.
- No silent clamp: BenchmarkStrip clamps an out of range value to the ends; the kit should throw.
- The source line inside the drawing and a table twin (the five values and the place's).
- Labels in the house voice: "low", "median", "top 10%", "high" become "lowest", "median", "90th percentile", "highest", which keep clear of the ranking gate because they label the scale, not an area. If the gate is adopted as is (section 6.3), it needs a scale label exemption.
- Its 460 by 92 viewBox rescaled to the kit's 600 unit inline template.

### 6.2 Every kit chart gets ChartActions

`src/components/ChartActions.astro` (130 lines) puts the source, a PNG button and an embed button under a chart. The site adopts it for every kit chart, with three changes, each for a reason found in the code:

- **PNG.** UKD serialises the inline SVG into an `<img>` and paints it on a canvas. The kit's inline SVG paints with `var(--series-1)` and the like, which an image cannot resolve, so the PNG would come out black. The kit already renders hex mode PNGs through resvg (`toPng`). The build renders one PNG per chart per theme in the `BUILD_OG=1` pass and the button becomes a plain link to it: no canvas, works without script, and the source line is inside the drawing so it travels with the file. UKD's watermark is not needed; the kit's card grammar carries the domain.
- **Data.** UKD has no data button. The site forbids download controls and bulk files today: `scripts/check-dist.mjs` fails on `data-(export-view|table-export|download-scenario)` and on any `.csv` or `.json` in `dist` (lines 57 and 179). So the "data" action is the table twin: a link that opens the chart's `<details>` table, with "Copy table" as the one script enhancement. A per chart CSV is decision K2 for Tom.
- **Embed.** UKD's button only renders when a `chartId` is passed and UKD builds no `/embed/` routes, so it is unbuilt there. Here it would need static `/embed/<chart>/` pages, noindex and canonical to the parent page, and a second `_headers` rule relaxing `frame-ancestors 'none'` for `/embed/*` only, which `check-dist.mjs` line 312 (exactly one CSP line) would have to allow. Decision K3; A5 ships PNG and table, not embed.
- UKD's "Copied!" label and its fixed `#1e293b` iframe border go; the source text is never cropped or restyled away from the drawing.

### 6.3 The map QA gates the kit should take

`src/lib/map/render.ts` `qa()` (lines 503 to 573) holds gates the kit's `assertGates` lacks. For 0.3.0, in priority order:

1. **Value in the manifest**: every drawn value equals its figure's display form character for character (`value "…" not in the manifest`). The kit takes figures by key, but a label built by string concatenation could still drift; this closes it.
2. **No overlapping text**, from measured boxes (`text overlaps: …`). The mockup's gap chart shows why: a service name crosses the zero line.
3. **Measured text width** from the TTF's own `cmap` and `hmtx` (`src/lib/map/text.ts`) instead of the kit's per family averages, so wraps and plates are sized from the real faces.
4. **Ranking and loaded words** (`RANKING_WORDS`, `LOADED_WORDS`), scoped to titles and alt text, with the scale label exemption above.
5. For cards: the card licence metadata (`card-licence.ts`, `cardXmp()`), palette quantised PNGs (`CARD_PALETTE_COLOURS = 128`), and a build failure when the focus element is not drawn (UKD issue I6).

### 6.4 Kit items this brief depends on (0.3.0)

`positionStrip` (6.1), `ChartActions` with server PNGs (6.2), the gates (6.3), a `thumb` template for the task cards (160 by 64, no text, `aria-hidden`), a diverging `zeroBar` and a grid only waffle for A6. Until 0.3.0 is tagged, A5 builds with 0.2.0 and the thumbnails as in the mockup.

## 7. Should A3 be the DS3 place template pilot, ahead of UK Demographics?

The audit's DS3 pilots "place page template v2" on UK Demographics after the asylum release (26 November), 11 December to 15 January. A3, the UK Council Tax profile overhaul, is the same job on a smaller page.

**Recommendation: yes for the build, no for the measurement.** Build template v2 first as A3, then adopt it on UKD.

For: A3's brief already exists (`~/wt/uct-profile`, eight phases) and section 11.2 adds the kit drawings to it. The profile is one data family (MHCLG tables and the council's charge schedule), 296 near identical pages, already strict CSP and no client script, so the template's structure (answer in the first screen, a contents row, sections, `DataDrawer` for the history, `ChartActions` on every chart) can be proved without UKD's 17,326 px of mixed sources. A mistake costs less: the council profiles are among the 325 URLs canonical to ukcouncils.co.uk since PR 15, so they carry little search weight of their own. And A3 lands in the order A5, A6, A3, which is early December, before UKD's slot.

Against: for the same reason, a profile pilot measures nothing. The pages are canonicalised away and the beacon is off (decision 6), so neither search behaviour nor field vitals can judge the template here. UKD has the traffic and the long pages the template exists to fix.

So: A3 is the build pilot; UKD is the first adopter and the measured pilot. This is Tom's call (it changes R567's site); recorded as decision K4.

## 8. CSP and check-dist assertions

Add to `scripts/check-dist.mjs` (and unit tests where noted):

- Homepage: `[data-postcode-door]` and the council finder input both inside `.hero`, before the `aside` in document order, each with its `noscript` fallback linking `/councils/`.
- Homepage: exactly one `svg.ek-chart` inside the bill card, with `aria-label` present and a `<text>` holding "Source: Burnley Borough Council, Council Tax Charges 2026/27".
- Homepage: four task links, each with one `svg[aria-hidden="true"]` and no `<text>` inside it.
- Every page: no `select` inside the site header; exactly one theme select inside the footer.
- Every page: `ek-chart` count equals the count of `[data-chart-actions]` (6.2), and every PNG link in a chart's actions points at a file that exists in `dist`.
- `_headers`: unchanged CSP (one line; `style-src` still allows inline style attributes while the kit paints with them).
- Unit: `tests/palette.test.ts` binds `global.css` custom properties to the vendored kit's `generated/sites/ukcounciltax.css` for both themes; `tests/vendor.test.ts` checks the vendored hashes.
- The existing data figure rule keeps passing: the kit's `ChartFigure` sets `data-figure` with the keys, and the source is inside the SVG. The design check counts a fact's caption only from `.source-line`; the kit wrapper needs a `.source-line` class on its caption or the checker needs to read the SVG caption. Settle in the build and say which.

## 9. Decisions for Tom

| Code | Decision | Recommendation |
|---|---|---|
| K1 | How the site takes the kit. DD4 says a pinned git dependency; this repo's `CLAUDE.md` says "Components are copied, not imported across repos", and the kit repository is private, so a git dependency also needs a token in the Cloudflare build | Vendor the kit at a tag with a hash test until the CLAUDE.md rule is changed |
| K2 | A per chart CSV under "Data", which `check-dist.mjs` forbids today | Not now; the table twin is the data |
| K3 | Embeds, needing `/embed/` routes and a relaxed `frame-ancestors` for them | Not in A5 |
| K4 | A3 as the DS3 build pilot ahead of UKD (section 7) | Yes for the build; UKD stays the measured pilot |
| K5 | The accent. The audit's finding 1 puts this site's `#23664f` within three degrees of hue of UK Food Hygiene's `#1f5c4a`; the kit took the current values unchanged | A brand question for DS1 with the mark (R560), not for A5 |

**Decided 9 November 2026 (Tom, "Accept all"):** K1 vendor at tag `v0.2.0` with a hash test; K2 no; K3 not in A5; K4 yes for the build, UK Demographics stays the measured pilot; K5 decided with the mark (R560), A5 carries the current accent.

## 10. Captures

**Before** (taken 9 November 2026 against the live site, design check run `20261109T090136Z_tx8mdkb9`): `docs/design/before/contact_sheet.jpg` and `docs/design/before/report.md`; full set at `~/Documents/design_checks/20261109T090136Z_tx8mdkb9/` (Page 1 is `/`, Page 2 `/councils/burnley/`, Page 3 `/tools/budget/burnley/`). Result: FAIL, 9 checks across the three pages: phone header 84.7 px on all three; no 180 by 180 touch icon on all three; 14 facts without a visible caption on the Burnley profile and 7 on the game page; CLS 0.1325 on the profile at 1440 dark.

**After**, from the local preview, same command with `--preview`: `/`, `/councils/burnley/` (shared header and footer), `/precepts/` (BillSplit stays there), `/tools/budget/burnley/` (header only until A6), a Scottish and a Welsh council page. Pass required on phone header, phone overflow, LCP, CLS, visible text and page heading at 390 and 1440 in both themes. The touch icon and the uncaptioned facts are not A5's to fix; they stay visible as FAIL with a line in the PR body unless fixed in passing.

## 11. Stop conditions

- The kit's `billAnatomy` refuses the Burnley parts (they no longer add to the total): stop, the data has changed.
- `comm -23` shows a custom property lost in the token splice. The 28 names the kit file does not carry (`--accent-2`, `--accent-3`, `--accent-glow`, `--accent-teal`, `--accent-teal-deep`, `--bg-deep`, `--bg-soft`, `--body-bg-image`, `--coral`, `--focus-ring`, `--grid-line`, `--grid-vignette`, `--header-backdrop`, `--ink`, `--ink-soft`, `--muted`, `--panel`, `--panel-soft`, `--panel-strong`, `--status-bad-text`, `--status-good-text`, `--status-warn-bg`, `--status-warn-border`, `--status-warn-dark`, `--status-warn-text`, `--status-warn-tint`, `--surface`, `--surface-muted`, from the estate-kit PR 3 review) are expected: they go in the site's own alias rule below `/* estate-tokens:end */`, and the check then passes. Any other missing name is a stop.
- A2 has not opened, or its rebase changes `SiteHeader.astro` or `SiteFooter.astro` beyond the nav data.
- Any published figure on any page changes in the build diff of `dist/` text other than the series colours.
