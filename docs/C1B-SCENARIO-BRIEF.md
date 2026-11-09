# C1b: your version | budget game scenario brief

First prepared 9 November 2026 from `85f7e33`. Revised 9 November 2026 in Claude Code (Opus) so scenario mode is built on A6's game design (`docs/A6-GAME-BRIEF.md` on main: waffle rounds, drawn reveals, the step rail, the score card), not on the old stepper form. Worktree `/Users/tompickup/wt/uct-scenario`, branch `feat/budget-game-scenario`, rebased onto `origin/main` at `79fa7bd`. `C1B-DATA-DRY-RUN.json` is the data and arithmetic receipt, regenerated on `79fa7bd` by `docs/dry-run/c1b-dry-run.test.ts` (instructions in its header).

Read `CLAUDE.md`, `docs/A6-GAME-BRIEF.md`, `docs/BUDGET-GAME-SOURCE-NOTES.md`, `docs/BUDGET-GAME-REVIEW.md`, then the A6 code as merged: `src/components/BudgetGame.astro`, `src/scripts/budget-game.ts`, `src/lib/budget-game.ts`, `src/lib/budget-game-data.ts`, `src/components/DataDrawer.astro`. The request is a user requested scenario, with visible assumptions and a model version, separate from observed figures: the exception `CLAUDE.md` permits. It never permits estimating a missing observation. The merged game's source facts, labels, notes and rules stay binding.

## 0. Start and sequence

1. **C1b is built after A6 merges.** Fetch, rebase onto `origin/main`, then check that main's `BudgetGame.astro` renders the A6 split round grid (`data-ek-square`) and step rail, and that `src/vendor/estate-kit/VERSION` reads `tag v0.3.0`. If not, stop (section 9).
2. A3 (`feat/profile-home-overhaul`) adds the network strip at the foot of `/tools/budget/<slug>/`. If it merged first, keep it; C1b touches nothing below the game.
3. If the base edition or any hash in section 6 differs after rebase, rerun the dry run before writing code and stop on a difference.
4. Five commits, in this order: pure model and source adapter; scenario stage and controls; scenario results and summary; workbook cache; tests and release evidence. Push and open the PR this brief describes; do not merge or deploy.

## 1. Decisions settled (unchanged from the first brief)

1. **Two independent fixed bases.** The service exercise reallocates the sum of the strictly positive RA service totals for the chosen body. The Band D exercise reallocates the published Table 10 Band D area average between the existing positive charging components. Both totals stay fixed. A service input changes no council tax, grant, funding, reserve or bill figure; a bill input changes no service figure.
2. **Scope.** A fixed total split only. No tax increase, revenue requirement, collection yield, referendum threshold, future year or receipt calculation. The future cost tool and I006 stay separate.
3. **Service measure.** The positive service base, not line 799, revenue expenditure, tax requirement or a household bill. Negative headings stay visible as observed net income under the inputs, outside the base and the result. Zero headings are not inputs. Nothing is reclassified to make a total balance.
4. **County screen.** A district with a return gets a second, independent service exercise for its whole county, using the county's own positive base, labelled "Whole county council area". No district allocation, population scaling or coupling to the bill. One Band D exercise per billing area. No county route.
5. **No return pages.** All nine stay notices with the published Table 10 breakdown, no game and no scenario. A county return never stands in for a missing billing return; no earlier budget is imported. 287 scenario entry points; 160 county service screens covering all 21 counties.
6. **Initial state.** Every scenario input starts at 0p, labelled "Your allocation, pence in each £1". Incomplete until it totals 100p; no result before that. Never seeded from the game's guesses or from rounded published shares. Reset returns to zero.
7. **Unscored.** The observed game keeps its rounds, scores, skips, score card and score link. Scenario results never enter the score list.

## 2. What A6 changed and what that means here

A6 replaced the stepper form with: a 10 by 10 grid per split round, one square per penny, filled in service order in the kit's part paints; service rows with a swatch, the pence in display type, minus, a range input 0 to 100, plus and a compact number input bound both ways; the placed total and a thin meter above the grid ("Placed", "62p of 100p"); a check button that is `aria-disabled` until 100p is placed, with the reason printed beside it; a sticky bar on phones holding the button and the placed total; a step rail; drawn reveals; and a score card summary.

So:

- **The first brief's item 1 (move the running total above the rows) is done by A6** and is cut. The scenario screens reuse A6's round markup and keep its order: heading, assumptions and fixed total, placed total and meter, grid, rows, the action and its reason, then the result.
- **The scenario reuses A6's controls, not a second form.** The same server rendered grid template (100 squares with `data-ek-square`, classes `sq-p0` to `sq-p11` and `sq-empty`), the same row component, the same "a row cannot take more than what is left" rule, the same sticky bar on phones. The scenario adds no new drawing primitive and no kit code in the browser (A6 section 4, option 1).
- **The player's squares are their whole pence**, exactly as in A6's split round. The published reference waffle is A6's server rendered `waffle({ parts, size: "small" })` for that round, already in the page; the scenario shows it in its own labelled slot, never recoloured.

If A6 as merged differs from its brief in any of these (a class name, the row component, the rail), follow the merged code, keep the outcome this brief describes, and record it under "Decisions taken".

## 3. Item 1: pure model and source adapter

Add `src/lib/budget-scenario.ts`, model version `budget-scenario 1.0`, pure arithmetic with no DOM, storage, URL, network or source read:

```ts
export const BUDGET_SCENARIO_MODEL = 'budget-scenario 1.0';
export function allocatePence(totalPence: number, shares: number[]): number[];
```

The total is a positive safe integer. Shares are a non empty array of whole integers 0 to 100 summing to exactly 100; each `totalPence * share` must be a safe integer. The caller checks the share count against the source item count. Any failure throws a clear input error. No floating point currency accumulator.

For each share, compute `totalPence * share`, keep the integer floor of the division by 100 and the remainder. Give the remaining pennies to the largest remainders, ties in source item order. The result is non negative integer pence summing exactly to `totalPence`. Print beside every result: "Amounts are calculated from your shares of the fixed total. Any remaining pennies go to the largest fractional remainders, in source order for ties." This rounding is model behaviour, not a change to a published figure. The dry run's reference implementation is in `docs/dry-run/c1b-dry-run.test.ts`; the module must agree with it on every case in section 6.

The server adapter supplies the source inputs, separate from user state, from the same `GameRound` arrays A6 renders (the `split` rounds for the council and county, the `bill` round): extract a shared pure adapter rather than duplicate the field selection; do not append scenario entries to `GameData.rounds`. Service base in pence is the round's `base` (printed GBP thousands) times 100,000. Bill base is `national.components[gss].areaPence`. Keep line numbers, source URLs, publication dates and hashes, and keep the three RA editions and Table 10 distinct. The billing council's bill item includes average parish precepts, as the game does; parishes are never added again. Only positive components are inputs; a printed zero stays in the observed notes.

## 4. Item 2: the scenario stage and controls

**Entry.** On A6's score card summary, beside the score link and the copy button, a button "Try your version". It also shows on a restored, explicitly unverified score summary. The scenario always starts from zero and the pinned data.

**The stage.** Heading "Your version: illustrative scenario", and directly under it the persistent label "User requested scenario | budget-scenario 1.0". A distinct section with `data-record-type="scenario"` on every calculated result. The observed game's rounds, reveals and score card stay as they are and are never reused for scenario values.

**The scenario rail.** A6's step rail component with its own stops: "Council services", "County services" (two tier councils only), "Band D split": three stops for 160 councils, two for 127. `aria-current="step"` on the current screen, a shown screen filled in the accent, names hidden under 600 px with the numbers kept. Moving between screens moves focus to the new screen's heading. A return to a screen keeps its current inputs.

**Each screen**, in order:

1. The screen title: "{display name} services", "{Table 10 county name} County Council services, whole county council area", or "Band D split". The RA return's own name appears only in source detail where it differs (22 councils).
2. The fixed total and its source in one block: for services "Fixed total: £18,015,000, the sum of {name}'s positive service totals in the 2026/27 RA return; net income headings are left out", with the RA source line; for Band D "Fixed total: £2,549.42, the published 2026/27 Band D area average (MHCLG Table 10)", with the Table 10 source line. The amounts come from the adapter, printed with the game's money formats.
3. The five assumptions, in plain language, as a short list:
   1. This is your allocation, not the council's budget or an exact household bill.
   2. Services use only the positive service totals; net income headings stay outside the exercise.
   3. The service total is fixed. Moving shares does not model costs, outcomes, ring fenced grants or legal limits.
   4. The Band D area average is fixed and includes average parish precepts; only its division between the listed bodies changes.
   5. Service and Band D allocations are independent; no change in money raised is calculated.
4. A6's placed total and meter, then the grid (every square hollow at the start), then the rows (A6's row component, every value 0p). Every row keeps a labelled native number input (min 0, max 100, step 1) and the named minus and plus buttons; the range input is the pointer path.
5. The action "Show your version", `aria-disabled="true"` until 100p is placed, never the `disabled` attribute; activating it early announces in the status region and prints beside it "{placed}p of 100p placed. Place {left}p more to show your version." Then "Reset this screen", which clears the inputs and the result.
6. The negative headings as observed net income, as in the game's notes, with their RA lines; the DSG sentence where `grantindsg > 0`; Note 4 beside the tax requirement and Note 8 beside signed funding where they apply, worded exactly as the game words them.

**Validation.** Reject blank, non finite, fractional and out of range values in the number input and in any direct call, and never treat `Number('')` as zero. Never normalise, clamp a typed value or move another row when one changes; the minus, plus and range controls may stop at the remaining pence, as A6's do, and say so in the status line. Any input change after a result marks that result out of date ("Changed since you showed it. Show your version again.") and hides its amounts until recomputed.

## 5. Item 3: the scenario result and summary

**Result, per screen**, in place of A6's reveal, with no score:

- Two waffles side by side (stacked on a phone): "Your version" (the player's grid, recoloured, the same markup) and "Published split, for reference" (A6's server rendered published waffle for that round, in its own slot, with its source line inside it). For the Band D screen the reference is A6's published bill waffle.
- A table with `data-record-type="scenario"`: columns "Service" (or "Charging body"), "Your share", "Your version", and, separately labelled, "Published, for reference". "Your version" holds the `allocatePence` amounts in the game's money formats. The reference column prints the published amount from the same source item and is never overwritten. The last row is the fixed total in both columns. Under the table, the rounding method line and the source lines.
- No gap chart and no difference column: the scenario prints both, and compares neither.

**Summary.** After the last screen, a card in A6's score card frame, titled "Your version, {display name}", one row per screen ("Council services: shown", or "not shown yet") linking back to that screen's result, then "Back to your score" and "Play again". No score, no bar, no share image, no copy control. "Play again" clears all scenario state as well as the game's.

**Without JavaScript** the entry button is hidden, as A6's controls are; no inert scenario form renders. The observed tables in A6's `DataDrawer` and the no return notices stay complete.

## 6. Dry run anchors and arithmetic (receipt `C1B-DATA-DRY-RUN.json`, base `79fa7bd`)

Hashes: `data/national/budget.json` `704c213738abbff846e9210a6fbb9eda058efb3d72beb5467fd7755cfeefdd0a`; `data/national/england.json` `81e6926afd4f4e1c226a1333ee7e5c7be2aa4c2d6f6bbc4c87b52e80ebb36c0f`; `tests/fixtures/budget-ct-reconciliation.json` `730a5ae7066eb22a2509974265779fa1d99ec7f83e5e46a7d07aab03ffac0e90`; the three raw workbooks as in section 7, all unchanged since the first dry run.

Counts: 317 retained RA bodies, 308 returns, 287 billing returns, nine missing (Castle Point, Coventry, Cumberland, Dudley, Epping Forest, Greenwich, Guildford, South Gloucestershire, Warwick), 160 district games with a county screen covering 21 counties, 127 games with four rounds and 160 with five, 150 bodies with a negative service heading, 22 display name differences, seven Note 4 bodies and two Note 8 bodies (codes in the receipt). Every available billing council's split rounds have between 2 and 12 positive headings (12 is the most, the kit's paint count) and a positive base; every bill round's positive components add exactly to its Table 10 base. Bill round inputs: 2 for 35 councils, 3 for 146, 4 for 101, 5 for 5. The largest service base is 313,291,900,000 pence, and times 100 it is still a safe integer.

| Body | Positive headings | Positive base, GBP thousands | Printed line 799, GBP thousands |
|---|---|---|---|
| Burnley | 5 | 18,015 | 17,246 |
| Birmingham | 9 | 2,703,694 | 2,700,482 |
| Lancashire | 9 | 2,759,432 | 2,759,432 |
| Westminster | 9 | 618,398 | 552,973 |

Burnley negatives: transport minus 343, planning minus 426 (GBP thousands). Birmingham: planning minus 3,212. Burnley's Table 10 base is 254,942 pence; positive components in source order: own share including average local precepts 36,054, county 180,175, police 29,240, fire 9,473; the combined authority is a printed zero, not an input. These are observations, not defaults.

Test scenarios (explicit cases, not source figures), each reproduced by the dry run's `allocatePence`:

| Case | Allocation | Expected output |
|---|---|---|
| Burnley services | 60, 40, 0, 0, 0 | £10,809,000 and £7,206,000, then zeroes; total £18,015,000 |
| Burnley Band D | 60, 40, 0, 0 | £1,529.65 and £1,019.77, then zeroes; total £2,549.42 |
| Lancashire, whole county | 50, 50, then seven zeroes | £1,379,716,000 twice; total £2,759,432,000 |
| One penny tie | 50, 50 | 1p, 0p in source order |
| Upper bound | 100 in one input | the whole base in that input |
| Invalid | all zero; 99; 101; negative; decimal; blank; NaN | no result; a clear error |

## 7. Item 4: raw workbook cache

`.github/workflows/release.yml` on `79fa7bd` caches npm only and downloads missing originals before the tests. Add an `actions/cache` restore, at a version compatible with the workflow's other actions, before that step, for these three paths only:

| Raw file | SHA-256 |
|---|---|
| `data/raw/RA_2026-27_data_Part_1.ods` | `3ea4d4c2218bc9f49bbf59a6fc82481acb6a3494d5b0f4e114cdb945730653db` |
| `data/raw/RA_2026-27_data_Part_2.ods` | `55c34505c69513fcba446f3484061d2bd115c4ce06bb5bafba7b36e330be4d65` |
| `data/raw/SG_2026-27.ods` | `6150792dcea97ca58b912a5fbf9fdc99562ba782fb7d6f5c8885e6ca1a17e3b5` |

Key on the runner OS and the three full hashes from `data/national/sources.json`, in this order; no broad restore prefix, no credentials, no generated data. Run the importer on hits and misses alike (it rehashes every file before parsing) and keep `git diff --exit-code -- data/national/budget.json`. Verify a cold cache, a warm cache with the source network blocked, and a corrupted cached file, which must fail at the pinned hash; restore the verified files afterwards. Do not trigger a production workflow to test it. UK Councils' C3 uses the same hash contract in its own repository; neither CI reads the other checkout.

## 8. Item 5: state, privacy, tests and the PR

**State.** Scenario inputs and results live in memory only: no storage of any kind, cookie, analytics event, beacon, remote request or download. The existing theme storage is outside this feature and is not scenario storage. `scoreLink()` keeps carrying only the slug and the observed scores; no scenario value reaches a query, fragment, path or share image. A fresh score link restores labelled unverified scores with the scenario empty; reload clears allocations; malformed fragments with scenario parameters are ignored by the existing strict parser. No scenario sharing route.

**Unit** (`tests/budget-scenario.test.ts`): the section 6 cases; zero shares; one input at 100; penny ties; negative, fractional, non finite, over and under totals; mismatched lengths; safe integer bounds; the source arrays and JSON unmodified after a calculation; no test labels a scenario result as observed. `tests/budget-game.test.ts` unchanged and passing.

**e2e** (`e2e/budget-scenario.spec.ts`, and the CSP project), Burnley and Birmingham, 375 and desktop, both themes:

1. Play the observed game to the score card (keyboard; skip rounds where needed); "Try your version" appears; activate it by keyboard; focus lands on the scenario heading; the label and the five assumptions precede the controls.
2. Council services: the placed total reads 0p and every square is hollow; enter 60 and 40 in two rows by keyboard (Tab, select, type), checking the placed total and the grid's filled count after each; "Show your version" at 60p announces the reason and shows no result; at 100p Burnley's result shows £10,809,000 and £7,206,000, the reference column unchanged and the method line present. Change one row: the result is marked changed and its amounts hidden.
3. A pointer run drags one range input and sees squares change.
4. Burnley's county screen uses Lancashire's whole county base; the district inputs are unchanged on return; the rail's `aria-current` moves. Birmingham's rail has two stops and no county screen.
5. Band D: 60 and 40 give £1,529.65 and £1,019.77 for Burnley; the published components and A6's tables unchanged.
6. Reset, Play again, reload and a fresh score link: no scenario value in the address, a copied link, storage or a network request; the score count unchanged.
7. At 375, `scrollWidth` is 375 in every scenario state and the sticky bar stays in the viewport on a scenario screen. axe passes on inputs, errors and results. Without JavaScript, no scenario control. The nine no return pages: no scenario control. Isles of Scilly, Dorset, the Note 4 and Note 8 pages: no regression.

**check-dist:** 287 game pages each carry one hidden scenario entry; the nine no return pages none; the game script stays under A6's gzip ceiling plus 4 KB; the `_headers` CSP unchanged; 296 budget routes and 297 budget sitemap entries including the index.

**Text diff:** every number in the visible text of Burnley, Birmingham and one no return page is identical before and after C1b (scenario values appear only after interaction).

Run `npm test`, `npm run check`, `npm run build`, `npm run test:dist`, `npm run test:text`, `npm run test:e2e`, `npm run test:csp` and the link audit; the final build with `BUILD_OG=1`. Captures at 375 and 1440 in both themes, named `c1b-<slug>-<state>-<width>-<theme>.png`, states `entry`, `services-partial`, `services-result`, `county-result`, `bandd-result`, `summary`. Record the model, assumptions, cache checks, hashes, routes and test summaries in `docs/RELEASE.md`.

PR titled "Your version: budget game scenario mode (C1b)", the body with the results above, "Decisions taken", the captures and "Built with Codex from a brief prepared in Claude Code." Do not merge.

## 9. Stop conditions

- A6 is not merged (section 0).
- A changed source hash; a missing or new return outside the pinned set; a failed anchor or reconciliation; a missing county join; a split round over 12 parts; an unknown component.
- Unsafe arithmetic; a new script permission; wording that needs a source not held.
- A figure in the before and after text diff changes.

Do not invent a number or widen the model. Routine presentation choices take the conservative form and are recorded under "Decisions taken".
