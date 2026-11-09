# C1b: your version | budget game scenario brief

Prepared 9 November 2026 in `/Users/tompickup/wt/uct-scenario`, branch `feat/budget-game-scenario`, created from `origin/main` at `85f7e33ef2cdc5c4f0a69b6c35209c86cc0cad5f`. PR 26 is merged at that commit. This is a locally committed brief, not a scenario implementation or release. `C1B-DATA-DRY-RUN.json` records the data and arithmetic checks.

Read `CLAUDE.md`, `PLAN-2026-11-08-BUDGET-GAME.md`, `BUDGET-GAME-SOURCE-NOTES.md`, `BUDGET-GAME-REVIEW.md`, `src/scripts/budget-game.ts`, `src/lib/budget-game.ts` and `src/lib/budget-game-data.ts`. The current request is for a user requested scenario, with explicit assumptions, separated from observed figures. That is the exception permitted by `CLAUDE.md`; it does not permit estimating missing observations. Source facts, labels, notes and signatures from the merged game remain binding.

## Start and sequence

Fetch and rebase before implementation. The planned lane order is A1, A2, A3, A4, then C1b. Reuse their merged navigation, profile and PageContents changes; do not recreate those features or silently undo them. Preparation is safe now because PR 26 has merged. If the base edition or game contract differs after rebase, rerun the source assertions before writing code. Preserve other working changes and stage named files only.

Implement in five commits: running total; pure scenario model and source adapter; optional scenario interface; workbook cache; tests and release evidence. No push, PR creation, merge or deployment without a further instruction.

## Decisions settled

1. **Two independent fixed bases.** The service exercise reallocates the sum of the strictly positive MHCLG service totals for the chosen council. The Band D exercise reallocates the published Table 10 Band D area average between the existing positive charging components. Both totals stay fixed. Moving a service input does not change council tax, grants, funding, reserves or the bill exercise. Moving a bill input does not change service spending.
2. **Scope of the older phase 4 proposal.** This brief specifies the requested Band D split. It replaces the older optional own-share percentage increase control with a fixed total split. Do not add a tax increase, revenue requirement, collection yield, referendum threshold, future year or receipt calculation. The future cost tool and I006 remain separate. There is no unresolved design choice for the builder here.
3. **Service measure.** Positive service base, not line 799, revenue expenditure, tax requirement or a resident's bill. Print the calculated base and its formula above the inputs. Negative headings stay visible as observed signed net income below the service inputs, excluded from both the allocation base and its result. Zero headings are not inputs. Neither negatives nor zeroes are reclassified to make a total balance.
4. **County screen.** A district with a return gets a second independent service exercise for its whole county, using that county's own positive service base. Explicit label: `Whole county council area`. No district allocation, population scaling or coupling to the district's bill. There is one billing area Band D exercise, not a separate county bill exercise. No standalone county route.
5. **No return pages.** All nine remain exactly bill-only notices with the existing published Table 10 breakdown, no game and no scenario control. A district's county return does not override the missing billing return. Never import an earlier budget. This is 287 scenario entry points and 160 county service exercises, covering all 21 counties.
6. **Initial state.** Every scenario input starts at zero, labelled `Your allocation, pence in each £1`. The initial state is incomplete, not a published allocation. No result appears until the allocation totals 100p. Do not seed from earlier guesses or round the published shares to fabricate a 100p default. Reset means zero and an incomplete state.
7. **Status.** This is unscored. The observed game keeps its original rounds, score count, skips, summary and score link grammar. Scenario results do not enter the score list or furthest answers.

## Item 1: running total above every split

In `src/scripts/budget-game.ts`, the existing guess form appends `rows` before `total`. Put the total before the rows for both `split` and `bill`. Keep its polite live announcement, with one status region for the total. Repeat that order in each scenario fieldset: heading; assumptions and source base; running total; inputs; validation and action controls; results.

Keep the total visible when the first input has focus at 375px. Do not make a large sticky panel obscure inputs or focus rings. Every input remains a labelled native number input with minimum 0, maximum 100 and step 1, plus named increase and decrease buttons. Validation must reject blank, non-finite, fractional and out-of-range values, including direct programmatic submissions. Do not use `Number('')` as a valid zero. Do not silently normalise, clamp typed values or adjust another field when one changes. Stepper buttons may clamp their own increment to the bounds.

Acceptance: inspect DOM order and focus at both viewport sizes. Enter allocations in at least two fields by keyboard; verify the live total as it changes. Over and under allocation leave the form editable and display the reason, without an apparent valid result.

## Item 2: pure model and source adapter

Add `src/lib/budget-scenario.ts`, with model version `budget-scenario 1.0`. It is a pure arithmetic module with no DOM, storage, URL, network or source reads. Proposed interface:

```ts
export const BUDGET_SCENARIO_MODEL = 'budget-scenario 1.0';
export function allocatePence(totalPence: number, shares: number[]): number[];
```

The total must be a positive safe integer. Shares must be non-empty, finite whole integers in 0 to 100 inclusive, summing exactly to 100. Validate each multiplication as a safe integer too. The calling adapter validates the number of shares against the source item count. Any failure throws a clear input error. Use no floating point currency accumulator.

For each input, compute `totalPence * share`, divide by 100 and retain the integer floor and integer remainder. Allocate the remaining pennies to the largest remainders, breaking ties by original source item order. The result must contain non-negative integer pence and sum exactly to `totalPence`. Display the method beside the results: `Amounts are calculated from your shares of the fixed total. Any remaining pennies go to the largest fractional remainders, in source order for ties.` This rounding is model behaviour, not a change to a published figure.

The server adapter supplies immutable source inputs separately from user state. Reuse the existing `GameRound` source arrays for positive service and bill items, or extract a shared pure adapter rather than duplicate field selection. Do not append scenario entries to `GameData.rounds`. Service base in pence is the existing positive total in printed GBP thousands multiplied by 100,000. Bill base is `national.components[gss].areaPence`. Preserve line numbers, source URLs, publication dates and source hashes. Keep the three RA source editions and Table 10 distinct.

The bill item for the billing council includes average parish precepts exactly as the observed game does. Do not add parishes again. Only positive existing components can receive an allocation. A printed zero remains in observed context but is not offered as a new charging body. The model is a hypothetical redistribution, not a legally possible precept setting tool. Table 10's printed component rounding difference remains visible in observed context; never normalise that source table to match the scenario.

## Dry run anchors and arithmetic

Inputs below came from merged main and its raw originals, checked on 9 November 2026. No source amount has been estimated.

| Body | Positive headings | Calculated positive base, GBP thousands | Printed line 799, GBP thousands |
|---|---|---|---|
| Burnley | 5 | 18,015 | 17,246 |
| Birmingham | 9 | 2,703,694 | 2,700,482 |
| Lancashire | 9 | 2,759,432 | 2,759,432 |
| Westminster | 9 | 618,398 | 552,973 |

Burnley negatives are transport minus 343 and planning minus 426 in printed GBP thousands. Birmingham has planning minus 3,212. These remain outside the scenario and retain their sources. Every available billing return has more than one positive heading and a positive base; all offered Band D components are known and non-negative.

Burnley's Table 10 base is 254,942 pence. Its positive components in source order are own share including average local precepts 36,054; county 180,175; police 29,240; fire 9,473. Combined authority is a printed zero, not an input. These are observations, not scenario defaults.

Explicit test scenarios, not source figures:

| Case | User allocation | Expected model output |
|---|---|---|
| Burnley services | 60p, 40p, 0p, 0p, 0p | £10,809,000 and £7,206,000, then zeroes; total £18,015,000 |
| Burnley Band D | 60p, 40p, 0p, 0p | £1,529.65 and £1,019.77, then zeroes; total £2,549.42 |
| Rounding tie, synthetic one penny total | 50p, 50p | 1p, 0p in source order |
| Valid upper bound | 100p in one field, all others zero | The entire fixed base in that field |
| Invalid | all zero; total 99; total 101; negative; decimal; blank; NaN | No result; clear validation error |

The preparation ran valid two-input allocations for every available billing council's services and bill, checked every resulting total, and rejected the listed numeric invalid cases. Blank input and DOM handling are implementation acceptance checks, not completed browser tests. Test safe integer limits and mismatched array lengths when building the pure model.

Source checks also passed: 317 retained RA bodies, 308 returns, 287 billing returns, nine missing returns, 160 available districts, all 21 county joins, 150 bodies with negative service headings, seven Note 4 bodies, two Note 8 bodies, all donor anchors and all 16 Table 10 reconciliation exceptions. The precise ids and hashes are in the dry run receipt.

## Item 3: separate scenario interface

Offer `Try your version` after the observed game summary, including an explicitly unverified restored score summary. The scenario starts fresh from the pinned source data in either case. Heading: `Your version: illustrative scenario`. Persistent visible label: `User requested scenario | budget-scenario 1.0`. Use a distinct section and `data-record-type="scenario"` on calculated results. Observed static tables remain in their existing separate sections.

Above each set of inputs, show the model version, the fixed total and its calculation or source, and these assumptions in plain language:

1. This is the user's allocation, not the council's budget or an exact household bill.
2. Services use only the positive service totals; net income headings remain outside the exercise.
3. The service total is fixed. Moving shares does not model costs, service outcomes, ring-fenced grant restrictions or legal feasibility.
4. The Band D area average is fixed and includes average parish precepts. Only its division between the listed bodies changes in this scenario.
5. Service and bill allocations are independent. No change in revenue or money collected is calculated.

Use headings or buttons to move between council services, county services when present, and the Band D split. Keep separate in-memory arrays and live totals for each. Move focus to the new heading when changing screens. `Show your scenario` validates that screen and displays a table with source item label, user share and scenario amount, then the fixed total, rounding method and relevant source line. An observed reference amount, if shown, occupies a separately labelled column; never overwrite it. When any input changes, clear or mark the old result invalid until recomputed. A return to a screen may retain its current in-memory inputs; `Reset this allocation` clears them and its result. `Play again` clears all scenario state as well as game scores.

Use council tax display names in headings and Table 10 county names for county screens; retain the original RA name only in source detail when different. Preserve the merged DSG guard on `grantindsg > 0`, Note 4 next to tax requirement, Note 8 next to signed funding, and the reserves caveat. The scenario neither recalculates those observed panels nor changes their wording.

Without JavaScript, all current observations, sources and no return notices remain useful. The scenario entry control is hidden until its script is available, as the game controls already are. No inert scenario form should imply it works without JavaScript. Use existing tokens and components, no new runtime dependency or inline permission.

## State, sharing and privacy assertions

Scenario inputs and results live in memory only. No localStorage, sessionStorage, IndexedDB, cookie, analytics event, completion measurement, beacon, remote request or download is added. Existing site theme storage is outside this feature and must not be mistaken for scenario storage in tests.

`scoreLink()` continues to carry only the council slug and original game scores. Never append a scenario input, result, model state, postcode, band or setting to a query or fragment. Opening a score link in a fresh context restores only labelled unverified scores; scenario inputs start empty. Reload clears allocations. Malformed fragments containing scenario parameters are ignored under the existing strict score parser. Do not introduce a separate scenario sharing route.

## Item 4: raw workbook cache

The current `.github/workflows/release.yml` downloads missing originals before tests. Add a cache restore before that preparation, for these three paths only, using the repository's compatible `actions/cache` version:

| Raw file | SHA-256 |
|---|---|
| `data/raw/RA_2026-27_data_Part_1.ods` | `3ea4d4c2218bc9f49bbf59a6fc82481acb6a3494d5b0f4e114cdb945730653db` |
| `data/raw/RA_2026-27_data_Part_2.ods` | `55c34505c69513fcba446f3484061d2bd115c4ce06bb5bafba7b36e330be4d65` |
| `data/raw/SG_2026-27.ods` | `6150792dcea97ca58b912a5fbf9fdc99562ba782fb7d6f5c8885e6ca1a17e3b5` |

Key on runner OS and all three full hashes from `data/national/sources.json`, in the order above. No broad restore prefix, credentials or generated site data in the cache. Always run the importer on cache hits as well as misses. It rehashes every file before parsing and checks all source assertions. Retain `git diff --exit-code -- data/national/budget.json`.

Verify a cold cache, a warm cache with source network disabled, and a deliberately corrupted temporary cached file. The first two must reproduce the committed snapshot; the third must fail at the pinned hash. Never bypass the hash or swallow an error. Restore verified files after the corruption test. Do not trigger a production workflow merely to test the cache. C3 uses the same manifest hash contract in its own repository; neither CI reads the other checkout.

## Item 5: tests, self review and stopping

Keep the existing score tests unchanged and extend pure model tests with the anchors above, zero shares, all allocated to one input, penny ties, negative or fractional values, non-finite values, over and under totals, mismatched lengths and safe integer bounds. No test labels a hypothetical result as observed. Assert the original input arrays and source JSON are unmodified after calculation.

Browser acceptance on Burnley and Birmingham, 375px and desktop, light and dark:

1. Complete an observed split using at least two inputs by keyboard alone, entering 60 and 40 with Tab, selection and typing. Do not substitute DOM assignment or a single 100p input. Confirm the total precedes inputs and updates after each edit. Complete or skip remaining rounds to reach the summary.
2. Enter the scenario by keyboard. Check assumptions and model version before controls. Enter a multi-input service allocation, submit, verify the exact scenario total and distinct observed references. Change one value to break the sum; the old result must cease to appear valid.
3. On Burnley, visit the county screen. Its base is the whole Lancashire positive service base and district inputs are unchanged. On Birmingham there is no county control.
4. Complete the Band D split using two inputs and check the penny result above for Burnley. Assert the original published components and static tables have not changed.
5. Test reset, restart, reload and a fresh score link. Assert unchanged score count and no scenario values in the address, copied link, storage or network requests. Test malformed scenario fragments.
6. Run axe on scenario inputs, errors and results, verify focus order and no horizontal page overflow. Check no-JavaScript pages. All nine no return pages lack scenario controls. Inspect Isles of Scilly, Dorset, all Note 4 pages and both Note 8 pages for regressions.

Run `npm test`, `npm run check`, `npm run build`, `npm run test:dist`, `npm run test:text`, `npm run test:e2e`, `npm run test:csp` and the link audit. Finish with `BUILD_OG=1` in the environment, then verify the final output. Real local Pages headers must allow the game and scenario with no CSP violation and no new script permission. There remain 296 council budget routes and 297 budget sitemap entries including the index. Capture inputs and results at 375px and desktop in both themes, including the county and Band D screens. Record the model, assumptions, cache checks, source hashes, routes and test summaries in `docs/RELEASE.md`.

The data and prototype arithmetic assertions were dry run during preparation. UI, storage, network, keyboard, CSP and CI assertions are tests the implementation must satisfy; they have not been represented as passing for unbuilt code.

Stop on a changed source hash, missing or new return outside the pinned set, failed anchor or reconciliation, missing county join, an unknown component, unsafe arithmetic, unsupported script permission, or wording requiring a source not held. Do not invent a number or silently expand the model. Routine presentation choices take the conservative form and are recorded. Nothing is pushed, merged or deployed from this brief without explicit authorisation.

Preparation verification: the fresh main checkout reproduced the committed budget JSON from the three hash-verified originals without a diff. Its unit suite passed 205 tests, with nine existing distribution-dependent tests skipped because it has no built output; Astro check reported no errors, warnings or hints. No scenario UI was built in this preparation.
