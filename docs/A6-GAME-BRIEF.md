# A6, the game as a game

Written 9 November 2026 in Claude Code, from `docs/PLAN-2026-11-09-NEXT-SESSIONS.md` section 11.2 and a read of the game as built (`src/components/BudgetGame.astro`, `src/scripts/budget-game.ts`, `src/lib/budget-game.ts`, `src/lib/budget-game-data.ts`, `src/pages/tools/budget/[slug].astro`, `e2e/budget-game.spec.ts`). Worktree `~/wt/uct-face`, branch `feat/face-and-game`, cut from `origin/main` at `b202b0d`. Design prep: no site code is changed by this brief's commit.

A6 is the second PR in this worktree. It starts after A5 merges (it uses A5's tokens, kit vendoring and `ChartActions`) and after kit 0.3.0 is tagged (section 4).

## 1. What stays and what changes

**Stays:** the data adapter `gameData()`, the rules in `src/lib/budget-game.ts` (`splitScore`, `orderScore`, `reserveBand`, the size bands, `readScores`, `scoreLink`), every source line and note, the nine no return notices, the static tables, the scores in the URL fragment, nothing stored. No published figure changes.

**Changes:** what the player sees. The page leads with the game; split rounds are played on a 10 by 10 waffle; each reveal is drawn; a step rail shows progress; the summary is a score card.

Mockup: `docs/design/game-round.html` (page load, round one at 62p placed, round one revealed), built by `docs/design/build-mockups.mjs` from `docs/design/figures.burnley.json`. Screenshots in `docs/design/screens/game-round-{390,1440}-{light,dark}.png` and `docs/design/screens/game-round-390-light-round-viewport.png` (the phone viewport during the round, with the sticky bar).

## 2. Files to change

| File | Change |
|---|---|
| `src/pages/tools/budget/[slug].astro` | Available councils: the page head becomes the game lead (section 3.1). The `<title>` and description are unchanged (check-dist title rules). The no return branch is unchanged. `BudgetTables` for the council and the county move inside one `DataDrawer` with the `PageContents` row above it. |
| `src/components/BudgetGame.astro` | The lead, the teaser waffle, the step rail, the stage; server renders the published waffle for each split round (hidden until its reveal) and the grid template the script colours. |
| `src/components/DataDrawer.astro` (new) | Copied from `ukdemographics/src/components/DataDrawer.astro` and adapted (section 5). |
| `src/scripts/budget-game.ts` | Split round controls and the grid; reveal drawings; funding and reserves reveals; the rail; the score card. The rules stay in `src/lib/budget-game.ts`. |
| `src/lib/budget-game.ts` | One addition: `squaresFor()` is imported from the kit for the player's grid so the player's squares and the published squares use one allocation rule. |
| `src/pages/og/budget/` | The game's share card per council (section 6). |
| `e2e/budget-game.spec.ts`, `e2e-csp/budget-game.spec.ts`, `tests/budget-game.test.ts`, `tests/budget-pages.test.ts`, `scripts/check-dist.mjs` | Section 8. |

## 3. The design

### 3.1 The lead

H1 "Could you set Burnley's budget?" (the council's display name, as `gameData()` takes it), one line naming the rounds, the start button, the "on this page" row, and beside it (under it on a phone) a greyed 10 by 10 grid with the caption "100 squares, one for each penny. Round one fills them with your guess, then with Burnley's published split." The grid is the kit's waffle drawn grid only and painted with `--border`: it shows no figure, so it carries no source. Unitary councils have four rounds; the line names those four.

### 3.2 Split rounds

- The grid: the kit's small waffle grid, 343 px wide at 375, about 32 px squares. Squares fill in service order, one per penny, in the kit's part paints (`WAFFLE_PAINTS`: four series solid, then with a diagonal stroke, then with a cross). Unplaced squares are hollow (`--bg-subtle` with a `--border-strong` stroke). Every service in the data has a paint: the most positive service headings any council has is 12 (five councils), and the kit has 12 paints; check-dist asserts no round exceeds 12.
- Above the grid: "Placed" and "62p of 100p" in display type, and a thin meter.
- The service rows (the grid's key): swatch with the same pattern, the service name, the pence in display type, then a row of minus, a range input 0 to 100 and plus. The range input is the pointer path; minus and plus are the keyboard path and keep the existing accessible names pattern (`Increase …`, `Decrease …` as today, so `e2e/budget-game.spec.ts` line 81 still finds them). The existing number input (`spinbutton`, used by the e2e at line 31) stays in each row, visually compact, bound to the range input both ways.
- A row cannot take more than what is left: raising one service past the remaining pence stops at the remainder and says so in the status line. Lowering returns squares.
- The check button is `aria-disabled="true"` until the hundred is placed, never the `disabled` attribute: it stays focusable, and activating it announces the reason in the existing status region ("Share exactly 100p using whole pence." from `splitScore`, as the e2e at line 79 expects). The reason is also printed beside the button: "62p of 100p placed. Place 38p more to check your split."
- Phone: the button and the placed total stick to the bottom of the viewport during a split round, so the total stays in view while the lower rows are adjusted and the grid has scrolled away. Skip sits below the rows, not in the sticky bar (the mockup's first version put it there and the bar wrapped to three rows, covering the rows).
- Desktop: grid left at 343 px, sticky to the top of the round; rows right.

### 3.3 The split reveal

- The score first, in display type: "79 out of 100", then the method in one line: "Your score: add up the gaps below, halve the total and take it from 100." (`splitScore`.)
- Two waffles side by side (stacked on a phone): "Your split" and "Burnley's published split". The published one is the kit's `waffle({ parts, size: "small" })`, rendered on the server with the RA source inside it, and only unhidden at the reveal. The player's one is drawn by the script into the same grid markup (section 4).
- Under them, one diverging bar per service from zero, in pence, one colour (the accent), direction carried by side and words ("17.6p over", "14.3p under"); a service within 0.05p reads "0.0p" with no direction. Not the service colours: those identify services in the waffles and would read as a second key. The method under the chart: "Gap: your pence less the published share. The published share is each service's amount over the five services' total, times 100."
- The round's notes as today (negative headings left out, "under half a square" for a service the allocation gives no square, the DSG sentence for county rounds), then the source line.

### 3.4 The bill round

The same as a split round, with the Band D components as parts and the published area average from Table 10 as the base. The waffle's allocation rule makes the squares add to 100 even where the printed components and the printed total differ (`bill.differencePence`); the existing note about that difference stays, and the published waffle's caption uses the component figures. Burnley: £360.54, £1,801.75, £292.40 and £94.73 against £2,549.42 (Table 10, MHCLG, 25 March 2026), so the squares are 14, 71, 11 and 4 with the kit's largest remainder rule; the build asserts this anchor.

### 3.5 The funding round

The ordering interaction stays (move up, move down, the live status line). The reveal is the kit's horizontal `zeroBar` of the published amounts, largest first, with the player's position for each item printed beside its bar ("You placed it 3rd"). Signs: the bars draw magnitudes and the label keeps "add" or "deduct", as the round's details already do.

### 3.6 The reserves round

One card, two choices: the direction as a three way toggle (draw on, add to, neither) and the size band as a select of `SIZE_BANDS`. The reveal is one bar for the start balance and one for the end balance from zero (the kit's `zeroBar` with two points), with the published change and its band named under them. Burnley: £21,357,000 at the start and £19,208,000 at the end of 2026/27 (RA Part 2 lines 1015 and 1016). The MHCLG reserves caution stays beside it.

### 3.7 The step rail

An ordered list across the top of the stage, one stop per round (five for two tier councils, four for unitary), `aria-current="step"` on the current round, filled in the accent when done, a skipped round marked "skipped" in text. Names are hidden under 600 px and the numbers stay. Borrowed from the Lancashire budget game (audit section 4).

### 3.8 The summary: a score card

The kit's `scoreCard`: "Your score, Burnley budget game", the total of the rounds played out of their maximum, one bar per round, a skipped round drawn empty. The score link and the copy button stay. For the share image, see section 6.

## 4. Kit components and how the player's drawings are made

| Use | Kit component | Rendered |
|---|---|---|
| Teaser | `waffle` grid only (kit 0.3.0 option; the mockup crops the viewBox) | server |
| Published split, published bill split | `waffle({ parts, size: "small" })` | server, hidden until the reveal; also inside the `DataDrawer` beside the tables, so the no script view has them |
| Player's grid during a round, player's waffle at the reveal | the same grid markup, coloured by the script | client |
| Gap bars | diverging `zeroBar` (kit 0.3.0; `zeroBar` refuses negatives at 0.2.0, so the mockup draws these in `build-mockups.mjs`) | client |
| Funding reveal, reserves reveal | `zeroBar` horizontal | server for the published bars; the player's positions are text |
| Score card | `scoreCard` | client for the page; server for the share card (section 6) |
| Actions under each published drawing | `ChartActions` (A5 section 6.2: PNG and table, no embed) | server |

**Client drawings.** The player's figures are not published figures and never enter the site's figure file. Two ways to draw them, in order of preference:

1. **Recolour server markup.** The server renders the 100 squares of each split round's grid with `data-ek-square` indexes and the hatch paths present but hidden; the script sets one class per square (`sq-p0` to `sq-p11`, `sq-empty`) and the stylesheet maps classes to the paints. No SVG is built in the browser, the drawing is the kit's, and the CSP is untouched. For the gap bars, the server renders one bar per service at zero length with its label slot, and the script sets `width` and `x` and the text. This keeps the kit's geometry and type with no kit code in the browser.
2. **Bundle kit functions.** Kit 0.3.0 adds subpath exports (`charts/waffle`, `charts/zeroBar`, `charts/statTile`) free of jsdom and Plot, and the game script imports them with a figure set built at run time whose source reads "Your answers in this game". Heavier (the gates run in the browser) and a new dependency in client code; only if option 1 cannot draw the score card.

Option 1 for the grid and the gaps; the score card on the page can be HTML (the kit's `statTile` HTML form already exists) with the bars as option 1. Budget for the game script: the current bundle plus no more than 6 KB gzip; check-dist asserts the ceiling.

## 5. DataDrawer for the published tables

`ukdemographics/src/components/DataDrawer.astro` (53 lines) is a `details` with the heading in the `summary` and a small script that opens it when the URL hash targets something inside. Adapt:

- The `h2` goes before the `details`, not inside the `summary`: a heading inside a `summary` is announced as part of a button by some screen readers and drops out of the heading list. The summary text is "Show the published tables" with the count of tables.
- The hash script is a component script, so the postbuild hashes it as today; `npm run test:csp` covers it. Without script, a `PageContents` link into a closed drawer lands on the closed drawer, which is acceptable; with script it opens.
- Default closed on the game page (the game leads), open when the council has no return (there is no game then).
- **Risk for the build:** the tables carry `data-figure` facts with their source lines. Inside a closed drawer the facts and their captions are hidden. `scripts/check-dist.mjs` reads the HTML and passes; the design check's browser rule "rejects hidden or empty captions" and may count every hidden fact as a failure. Run the design check with the drawer closed. If the rule fails on hidden facts, stop and ask: the fix is either the checker counting only visible facts or the drawer opening in the capture, and that is a change to `~/claude-config`, not to the site.

The profile's Band D history goes behind a DataDrawer in A3 on the same pattern.

## 6. The score share image

Section 11.2 asks for the score card "rendered server side as the score link's share image, so a copied link unfurls as a card with the council name, the score and the site". **A static site cannot do that as specified**: the scores live in the fragment (`#scores=72,55,90,s,40`), browsers never send the fragment to the server, and link unfurlers read the page's `og:image`, which is fixed at build. 287 pages times every score combination cannot be prerendered.

Options, decision G1 for Tom:

- **(a) Static, now.** Each council's game page gets its own `og:image` from the kit's card package in the `BUILD_OG=1` pass: "Could you set Burnley's budget?", the greyed grid, the site. The score card is offered on the page as a PNG the player can save or share through the Web Share API (the script rasterises the kit's hex mode score card SVG on a canvas; hex mode resolves in an image, unlike the css mode inline SVG). Nothing leaves the browser.
- **(b) Dynamic.** A Cloudflare Pages Function serving `/tools/budget/<slug>/score/<scores>/` with the score card as `og:image` and a redirect for people to the game with the fragment. It is a server change with its own CSP and caching questions and puts scores in a path, so they appear in logs.

Recommendation: (a). The plan's "nothing is stored" holds, and (b) can follow if the measured shares justify it.

## 7. No JavaScript, phone, CSP

**No JavaScript.** As today the controls stay hidden (`data-game-controls hidden`) and the `noscript` line says the game needs JavaScript. The lead (H1, line, teaser grid), the `PageContents` row and the `DataDrawer` with the tables and the published waffles render. The H1 asks a question the no script reader cannot play; the `noscript` line moves directly under the lede so the answer is in the first screen: "The game needs JavaScript. Burnley's published budget, with the same figures, is in the tables below."

**Phone at 375 px.** Lead stacked, teaser under the start button. Round: rail (numbers only), title, explanation, placed total and meter, grid 343 px, then the rows, each minus and plus at 44 by 44 px and the range input 44 px tall; the sticky bar holds the check button and the placed total only. Reveal: score, the two waffles stacked, the gap chart, notes, source, next. No horizontal scroll at 375 in any state, asserted in the e2e by reading `scrollWidth` after each round. The gap chart's labels sit at about 11 px in the mockup's 600 unit drawing at 343 px; the kit's diverging `zeroBar` should take the small size's larger key text as the waffle now does.

**CSP.** One external module script as today; no inline script, no `eval`. The kit SVG paints with inline `style` attributes, allowed by `style-src 'self' 'unsafe-inline'`. Option 1 in section 4 adds no new permission. `npm run test:csp` runs the full game in the production header set.

## 8. Assertions

**check-dist (`scripts/check-dist.mjs`):**

- Each of the 287 available game pages: one `[data-budget-game]`; the H1 matches `^Could you set .+'s budget\?$`; the `<title>` is unchanged (`<name> budget game 2026/27 | UK Council Tax`).
- The nine no return pages: no `[data-budget-game]`, the notice unchanged, H1 unchanged.
- Each split round: one teaser grid with exactly 100 `data-ek-square`; one published waffle whose `data-ek-squares` sum to 100, with a `<text>` containing "RA_LA_Data_2026-27"; no round with more than 12 parts.
- Burnley anchors: the published district waffle squares are 0, 12, 29, 32 and 27 (Adult Social Care, Housing Services, Cultural and Related, Environmental and Regulatory, Central Services; shares 0.01, 12.41, 29.35, 31.53 and 26.69 of £18,015,000); the bill waffle squares are 14, 71, 11 and 4.
- The `DataDrawer` holds `#council-budget` (and `#county-budget` where a county exists), so the `PageContents` anchors resolve.
- Every published drawing has its `ChartActions` with a PNG that exists in `dist`.
- The game script's gzip size under the ceiling in section 4.
- `_headers` CSP unchanged.

**Unit (`tests/budget-game.test.ts`, `tests/budget-pages.test.ts`):** the player's squares from `squaresFor(guesses)` equal the guesses when they are whole pence adding to 100; the published squares equal `squaresFor(shares(items, base))`; every figure printed on the page before A6 is printed after it (a text diff of the tables, the notes and the source lines on Burnley, Birmingham and one no return council).

**e2e (`e2e/budget-game.spec.ts`, `e2e-csp/budget-game.spec.ts`):** the existing keyboard run still completes Burnley and Birmingham in both themes, now also checking the rail's `aria-current` moves and the grid's placed count equals the sum of the rows; activating the check button at 62p announces the reason and does not advance; a pointer run drags one range input and sees squares change; at 375 px, `scrollWidth` is 375 in every state and the sticky bar is within the viewport during a split round; the score link restores the score card; the run passes under the production CSP.

## 9. Captures

**Before** (live, 9 November 2026, design check run `20261109T090136Z_tx8mdkb9`, Page 3 is `/tools/budget/burnley/`): `docs/design/before/contact_sheet.jpg`; full set at `~/Documents/design_checks/20261109T090136Z_tx8mdkb9/page3_*`. Page 3 fails the phone header (84.7 px), the touch icon and figure sources (7 facts without a visible caption); it passes overflow, LCP (under 0.7 s) and CLS. The game itself starts behind a button, so the before set shows only its intro; the earlier review captures `docs/budget-game-review/budget-game-burnley-{desktop,mobile}-{light,dark}.png` show the rounds.

**After**, from the local preview, at 390 and 1440 in both themes: `/tools/budget/burnley/` (two tier), `/tools/budget/birmingham/` (unitary), one no return council page. The design check captures the page as loaded; the round, the reveal and the summary need Playwright captures of their own, named `a6-<slug>-<state>-<width>-<theme>.png`, states `lead`, `round1-partial`, `round1-reveal`, `funding-reveal`, `reserves-reveal`, `summary`, and one with JavaScript off.

## 10. Decisions for Tom

| Code | Decision | Recommendation |
|---|---|---|
| G1 | The score share image: static per council card and a save or share PNG, or a Pages Function (section 6) | Static |
| G2 | The H1 as a question on 287 pages, with the title unchanged | Yes; the title keeps the search phrase |

## 11. Stop conditions

- Any Burnley anchor in section 8 fails: the data or the allocation rule has changed.
- A council's split round has more than 12 parts.
- The design check fails on facts inside the closed drawer (section 5).
- A figure in the before and after text diff changes.
- Kit 0.3.0 is not tagged with the diverging `zeroBar` and the grid only waffle: build the rest and leave the gap bars and the teaser crop as the mockup draws them, saying so in the PR.
