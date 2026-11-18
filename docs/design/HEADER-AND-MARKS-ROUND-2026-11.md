# Header and marks round | UK Council Tax | 18 November 2026

Two decisions for Tom, drawn as pictures in the way the colour round was: **D8**, the header, drawer and footer (due 30 November 2026; W5 waits on it), and **D3**, distinct marks for UK Council Tax and UK Councils (due 4 December 2026). Documents only: nothing under `src/`, `public/`, `data/` or `scripts/` changed, and nothing here is on either site.

**Recommendations, in short:** D8, option **B** (lean: Your bill, Budget game, Compare, More). D3, pair **2** (the share of a pound for UK Council Tax, the locator for UK Councils), with pair 1 as the fallback. Both are views from the sheets; the choices are Tom's.

## How the pictures were made

Each header option is a static mock (HTML and CSS only) in `header-round/option-a.html`, `option-b.html` and `option-c.html`. Menus and the phone drawer are `<details>` elements, so they open and close without JavaScript, and the `name` attribute keeps one menu open at a time. The mocks are written from one link table by `header-round/build.mjs`, which also counts the links and checks that every route in `STATIC_PATHS` is reached from the header or the footer (`header-round/links.json`: none missed in any option). Every link was requested on the live site on 18 November 2026 and returned 200; the one anchor, `/tools/budget/#set-the-budget`, is an id on the live budget hub.

For the sheets, `header-round/round.mjs capture` loaded the live homepage (ukcounciltax.co.uk, origin/main `8c20976`, read only) in Chromium at 1440 by 900 and 390 by 844, dark then light, and swapped its header, drawer and footer for each mock's, so each is judged over a real page. No build. Colours are the live palette B tokens and the faces are Source Serif 4 and Source Sans 3, as the site loads them; no option needs a new token or a new colour. The header heights and overflow checks are measured, in `header-round/metrics.json`.

## D8, the header

### The sheets, in order

1. `header-round/sheet-d8-phone-dark.jpg`: **start here.** Each option at 390, actual size: closed, drawer open, foot of the page.
2. `header-round/sheet-d8-desktop-dark.jpg`: each option at 1440, closed and with one menu open, then the three footers.
3. `header-round/sheet-d8-phone-light.jpg` and `header-round/sheet-d8-desktop-light.jpg`: the same in light.

### The three options

- **A, four menus plus "Find my bill"** (the recommendation on file, from the design audit). Your bill, Budgets, Compare, Explore; Search; a postcode field with a solid "Find my bill" button at 1440, the button alone at 390. Panels in two columns, the first item in each drawn as a featured card (it is one of the links, not an extra one). The drawer leads with search and a two by two grid: Find my bill, Budget game, Set a budget, Compare; then the four groups as accordions.
- **B, lean, phone first.** Three plain links (Your bill, Budget game, Compare) and one "More" menu holding everything else in three columns; Search. At 390 the header itself carries "Your bill" and a solid "Game" button, so both arrival tasks are one tap from every page. The drawer leads with search, then Set a budget and Compare as cards, then flat lists with no accordions to open.
- **C, today's header tidied** (the control). Today's three groups in today's order, with "Budget game" turned into a menu that holds Set (the audit's D8 option b). Tagline kept at 1440, 3px active bar, today's footer.

A and B share a new footer: four columns (Tools, Your bill, About the data, Site), then the sister sites with UK Councils first as a card carrying its mark, then the imprint and the theme choice. C keeps today's footer.

### What each costs

| | A, four menus | B, lean | C, today tidied |
|---|---|---|---|
| Header height at 390 (limit under 72 px) | 61 px | 61 px | 61 px |
| Horizontal overflow at 390 and 375 | None | None | None |
| Top level items at 1440 | 6: four menus, Search, Find my bill | 5: three links, More, Search | 5: four menus, Search |
| Top level items at 390 | 2: Find my bill, Menu | 3: Your bill, Game, Menu | 2: Search, Menu |
| Header links (D2 limit under 20) | 18 | 18 | 18 |
| Taps to the bill (postcode page), 390 / 1440 | 1 / none, the field is in the header | 1 / 1 | 3 / 2 |
| Taps to the budget game, 390 / 1440 | 2 / 2 | 1 / 1 | 3 / 2 |
| Taps to Set (the hub's Set section), 390 / 1440 | 2 / 2 | 2 / 2 | 3 / 2 |
| Moves to the footer | All tools, Annual increases, Findings and every about page, now in four labelled columns | The same as A | Nothing moves; today's flat list stays |
| New token or kit part | None | None | None |

Taps count from any page to the destination page. In every option Set needs one more tap after the hub, to choose a council, because Set pages are per council (`/tools/budget/<council>/set/`).

### Recommendation

**B.** A reader on a phone who arrives wanting their bill or the game finds both in the header itself, one tap away, on every page; A puts the bill there but the game behind the menu, and C buries both three taps deep. B is also the cheapest to build and to keep working: three links and one panel in place of four panels with featured cards, and no postcode field on every page (in A, a working field in the header needs the postcode door's script and its index of every council on every page, or it is only a link to `/your-area/`). Its cost is that "More" is a catch all, and the phone label is "Game" (with "Budget game" as its accessible name) because "Budget game" does not fit beside "Your bill" at 375.

### What happens on each choice

- **A:** W5 starts as the audit and the plan describe it (two column panels with featured cards, the drawer's two by two grid, the four column footer). It needs a decision on the header postcode field: reuse the postcode door's script and index on every page, or make "Find my bill" a link only. Rules out the bill and the game both sitting in the phone header.
- **B:** W5 is smaller: three links, one "More" panel, the drawer, and the same four column footer as A. The W5 brief in the audit changes in its first two bullets. Rules out per section menus on desktop; if a section later outgrows "More", that is a return to A.
- **C:** W5 shrinks to a tidy: Set added under Budget game, the 3px active bar, nothing moved. The audit's finding "Header and footer bury the tools" stays open, and D7's footer links would go into today's flat list.
- **Any choice:** D7 (UK Food Hygiene and UK Places links) rides with W5 as planned. The front doors pull request may move the hub's `#set-the-budget` section; W5 must check that anchor again before it links to it. The header part offered to Estate Kit pull request 27 should be the chosen form; the Lancashire care atlas built a grouped form close to A.

## D3, the marks

### The sheets, in order

1. `header-round/sheet-d3-marks.jpg`: **start here.** Today's shared glyph and the three candidate pairs at 16, 32 and 120 px on the band green, the cream paper and dark; each mark at 16 px enlarged six times with no smoothing, to show how the pixels fall; and each pair as a favicon beside a tab title, in dark and light browser chrome.
2. `header-round/sheet-d3-in-use-dark.jpg`: each pair in the option B header at 1440 and 390, the UK Councils mark in the live UK Councils header, and the UK Councils card in the UK Council Tax footer on the band green.
3. `header-round/sheet-d3-in-use-light.jpg`: the same in light.

### The three pairs

The SVG files are in `marks/`. Every pair shares one tile (64 unit grid, corner radius 14) and one weight, so the two marks read as family, and each takes its device from the design audit's signature devices: the bill for UK Council Tax, the place or the tiers for UK Councils. UK Council Tax uses palette B values only (`#0e4a36`, `#f0dfae`, `#57c792`, `#f7f2e3`; on the band green the reversed tile, `-band.svg`, uses `#f0dfae`, `#0e4a36`, `#0d6648`, `#2ea471`). UK Councils uses its live tokens (`#245b87`, `#8cc4ed`, `#eef5fb`, read from ukcouncils.co.uk on 18 November 2026). No crown, crest, coat of arms, flag or letterform.

| | UK Council Tax | UK Councils | At 16 px | On the three grounds |
|---|---|---|---|---|
| Pair 1, the bill stripe and the tiers | The bill as a stripe of three shares | Three stepped tiers of local government | UKCT reads as a pale bar; its two small shares merge. UKC's tiers hold | All hold; UKCT needs its reversed tile on the band |
| Pair 2, the share of a pound and the locator | A pound with the council's share as a wedge | A locator ring with a centre dot | Both hold, and the wedge and the ring cannot be confused | All hold; UKCT needs its reversed tile on the band |
| Pair 3, the pennies and the boundary | Nine pennies in a grid, in three shares | An area outline with a centre | UKCT blurs to a check pattern. UKC reads as a nut or a cog | All hold, but the 16 px problem decides it |

### Recommendation

**Pair 2,** with pair 1 as the fallback. It is the only pair where both marks keep their shape at 16 px, the wedge and the ring are told apart at a glance in a row of tabs, and the shared circle in a shared tile makes the family plain. One check before it is final: a ring with a centre dot is a common shape, and Tom should judge whether the UK Councils mark reads too close to a roundel; it is two tones of one blue, not the three colour roundel, but that is a judgement, not a measurement.

### What happens on each choice

- **Pair 1, 2 or 3:** M1 can start: the marks go into the Estate Kit brand route (favicon, touch icon, default share card through `build.mjs` on vps-main) and then one small pull request per site, each with Tom's yes before deploy. UK Council Tax's favicon today is still the old green glyph (`#23664f`), so M1 also brings it onto palette B. Choosing a pair rules out the other two and the shared glyph.
- **Keep the shared glyph:** M1 is dropped from this season, as the plan's default says; the two sites stay told apart by colour alone.
- **The header choice is independent:** every pair fits every header option at 32 px. The D3 sheets use option B only because it is the recommendation.

## Not covered

- The mocks were placed over the homepage only; a council page, the game and the set page were not captured with each header.
- The live search dialog and the theme choice are drawn as links and a plain select; their behaviour is unchanged by any option and was not mocked.
- Forced colours and print were not captured.
- Marks were judged by eye at 16 px in Chromium; no other browser's favicon scaling was checked, and the touch icon and share card sizes were not drawn.
- UK Councils' own header structure is not part of D8.

## Reproduce

From a checkout with `node_modules` (Playwright 1.64):

```bash
node docs/design/header-round/build.mjs
OUT=/tmp/header-round node docs/design/header-round/round.mjs capture
OUT=/tmp/header-round node docs/design/header-round/round.mjs sheets
```
