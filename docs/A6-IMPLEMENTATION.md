# A6 implementation record

9 November 2026. Branch `feat/game-as-game`. Review work only; no merge or deployment.

## Archive handover

Implementation is committed and pushed. [PR 36: The budget game as a game (A6)](https://github.com/tompickup23/ukcounciltax/pull/36) is open. The verified implementation commit is `375faec2cbf6ff68f58bb1fbe616c45915777702`; this handover is a documentation-only follow-up.

All required local gates pass, as recorded below. The remote `site` check was still in progress when this handover was prepared. Review the PR and its remote check before any later merge decision. No merge or deployment is authorised by this handover.

The worktree is `/Users/tompickup/wt/uct-face`. Local captures, before and after text files, the capture script and bundle-size evidence remain in its gitignored `output/playwright/a6/` directory. Final gate logs are `/tmp/uct-a6-final-*.log`. The final design report and the approved shared-checker resolution are recorded below. There is no unresolved section 11 stop condition. No implementation work remains in this chat.

## Results by item

| Item | Result |
|---|---|
| Kit | v0.3.0, commit `1fdcc39df4f3e346fa6dc998dbcc49d9ec505bae`, built from a clean tag archive using npm ci and build:lib. All 72 VERSION records are tracked and hash correctly. The ignore test passes. |
| 3.1 Lead | Question H1, four or five named rounds, start button, 100 grey kit squares and an immediate no script explanation. Titles and descriptions preserved. |
| 3.2 Split controls | Number inputs, range inputs and keyboard steppers stay in sync. Increases stop at the remaining pence. A focusable aria-disabled check button explains incomplete totals. The phone total and check button stick to the viewport bottom. |
| 3.3 Split reveal | Player and published waffles, score, one-colour diverging gaps drawn from server kit geometry, original answer detail, notes, source lines and county DSG context. |
| 3.4 Bill | Same controls and reveal; printed components and area average remain unchanged, including the original rounding notes. Burnley's published squares are 14, 71, 11 and 4. |
| 3.5 Funding | Original ordering interaction; kit zero bars draw magnitudes with add or deduct labels. Player positions sit beside the bars. |
| 3.6 Reserves | Three direction radio choices, original size bands and scores, and kit bars for the start and end balances. Original calculations and MHCLG caution retained. |
| 3.7 Rail | Four or five stops, aria-current on the current round, completed stops filled and skipped stops named. Names collapse below 600px. |
| 3.8 Summary | HTML score card totals only played rounds, with one bar per round and empty skipped tracks. Score links restore it. Save PNG recolours a server-rendered kit scoreCard in hex mode and embeds the existing local fonts before rasterising in the browser. |
| 4 Drawings and actions | No chart renderer is bundled in the browser. Client code recolours kit squares and transforms server-rendered gap geometry. Every published chart has two prebuilt PNG links and a table twin with copy enhancement. |
| 5 Drawer | Adapted DataDrawer has its heading outside summary, an accurate table count and hash opening. The original tables, notes and sources remain in the DOM. No return pages keep their original branch. |
| 6 Static share image | A kit card per available council asks the question with a grey grid and the site. Scores remain in the fragment; no server function or storage was added. |
| 7 No script, phone and CSP | Lead and published tables remain usable without script. Source CSP template unchanged. Browser and actual-header checks cover the interactive states and local PNG save. |
| 8 Assertions | Coverage, grid counts, published allocations, source strings, Burnley anchors, drawer anchors, PNG existence, bundle ceiling and unchanged header template are asserted. Original published text is snapshotted for Burnley, Birmingham and Coventry. |
| 9 Captures | Local Playwright capture list below. Images are gitignored and are not part of the PR. |

## Anchors as built

- `#budget-game` is the lead and game.
- `#published-budget` is the closed drawer.
- `#council-budget` and `#county-budget`, where applicable, retain the original tables inside it.
- `#published-round-0` onwards identify the published drawings in the drawer, with `#published-round-0-table` onwards for their table twins.
- `#reveal-round-0` onwards and their `-table` twins exist in the current revealed round.
- `#your-bill` remains the original published bill breakdown below the drawer.

## Data and text preservation

`gameData()` and its adapter are unchanged. The only change in `src/lib/budget-game.ts` is the one-line import and re-export of the kit's squaresFor; no rule changes. All scores, thresholds, URL handling, signed funding and reserve calculations remain as before.

The committed fixture `tests/fixtures/a6-published-text.json` comes from the pre-A6 built pages. The test compares complete normalised text for the original budget tables, notices, source lines, bill, band selector, per-resident section and game data on Burnley, Birmingham and Coventry. It includes text inside closed details. New visual captions sit outside those preserved blocks. Local before and after text files are retained in `output/playwright/a6/`.

The service waffles preserve every positive service heading, including Burnley's zero-square Adult Social Care heading. Burnley's district allocation is 0, 12, 29, 32 and 27. Every split has at most 12 parts. Each published service SVG carries the RA_LA_Data_2026-27 source text. Bill SVGs carry their actual Table 10 source.

## Closed drawer decision

The initial preflight reached A6 section 11: the shared checker treated captions inside the closed drawer as missing. Opening only the drawer removed exactly two failures on Burnley and one on Birmingham, at both widths and in both themes.

The user explicitly chose to update the checker to validate visible facts only while keeping drawers closed for captures. The shared checker now contains that visibility rule and a further pass that opens drawers after capture, checks their sources and restores their state, at `claude-config` commit `ab80018`. It still rejects a visible fact with an absent or hidden caption. Fixtures cover closed and open drawers, hidden facts, hidden captions on visible facts and the post-capture pass. These separate repository changes are not included in the site PR.

Initial built report: `~/Documents/design_checks/20261109T140149Z_s_afi17u/report.md`. The final report is recorded with the final checks below.

## Stop conditions

| Condition | Result |
|---|---|
| Burnley anchor fails | Not met |
| A split has more than 12 parts | Not met; maximum is 12 |
| Closed drawer fails the design checker | Reached during preflight, then resolved by the user's explicit checker decision |
| A preserved figure changes | Not met |
| Tagged kit lacks the required drawings | Not met; v0.3.0 includes grid waffles and diverging zero bars |

## Decisions taken

- Use fetched origin/main at `79fa7bd`. Its additions after the requested `7fd7133` are handover documentation only.
- Keep G1 static sharing and G2 question heading as decided in the binding brief.
- Regenerate the CSS version comment only after proving token declarations unchanged. No token value changed.
- Use Coventry for the no return text comparison and captures.
- Test the drawer risk immediately after the lead using actual source-bearing waffles, then resume after the explicit checker decision. Keep the subsequent implementation commits in brief order.
- Use server markup for player drawings, HTML for the score card and a server kit scoreCard template for PNG export. No client chart package or new CSP permission.
- Use the smaller interpretation of the 6 KB allowance: 4034 baseline gzip bytes plus 6000 bytes, a ceiling of 10034 bytes.
- Parse built game pages as DOM fragments and release each between checks. Full JSDOM windows retained too much memory during the complete dist sweep.
- Follow existing tests by skipping the built-page unit assertion before a clean checkout's first build. The same complete text comparison is mandatory in test:dist after the build.
- Restore score fragments on hash changes as well as on initial load, so following a score link from the same council page works.
- Kit 0.3.0 refuses any unequal money total. Where the adapter verifies every component but MHCLG prints a rounding difference, retain all components and the original total and note, and allocate the complete components without the kit's exact-total option. Pass the printed total wherever it reconciles. No published value is adjusted.
- Normalise punctuation in new chart labels for verbatim body names containing spaced hyphens. Original data and original table wording are unchanged.
- Keep each bill chart's actual Table 10 source. The RA source requirement applies to service splits, not to bill figures from another return.
- Offer a local PNG save rather than introducing a Web Share dependency.
- Use the kit's light hex palette for the saved score PNG, with the existing local fonts embedded so the image is self-contained.
- Retain the pre-existing missing Apple touch icon as a reported design check failure. It is outside A6 and is not a section 11 stop condition.
- Keep the new social-image URLs on the site's canonical origin. The shared checker requests those absolute URLs from the live site, where they return 404 until deployment. Verify the generated files locally; do not deploy or change canonical metadata to make a preview check pass.

## Final checks

| Check | Result |
|---|---|
| `npm test` | 265 passed in 37 files |
| `npm run check` | 218 files, zero errors, warnings or hints |
| `BUILD_OG=1 npm run build` | Passed; 909 pages and the generated images |
| `npm run test:dist` | Passed; 909 pages, 908 sitemap URLs, 2618 chart PNG links |
| `npm run test:text` | Passed; 916 files |
| `npm run test:e2e -- --workers=1` | 230 passed |
| `npm run test:csp -- --workers=1` | 78 passed, including complete scored games, PNG saves and hash opening |
| Vendor hashes, tracked files and ignore test | All 72 VERSION records tracked; five vendor tests pass |
| `python3 scripts/apply-brand.py --check` | Passed; no token value changes |
| Published text diff | Burnley, Birmingham and Coventry identical before and after |
| Game script gzip | 6582 bytes; ceiling 10034 bytes |
| Shared checker tests | 19 passed |
| Final design check | Figure sources, closed-drawer captures, header, overflow, height, text, LCP and CLS pass. The existing missing touch icon fails on all three pages. The two undeployed social-image URLs fail against the live origin; their local PNGs return HTTP 200 at 1200 by 630. |

The first unit run overlapped browser work and hit a timing failure; its serial retry passed all 265 tests. Two earlier browser timing failures also passed their serial retries. The final gate runs after the build, with the browser suites serial.

Final design report: `~/Documents/design_checks/20261109T150859Z_x82_cjw8/report.md`. Burnley, Birmingham and Coventry pass the source rule at both widths and in both themes, including five, four and zero marked figures inside drawers respectively. Captures keep the drawers closed. No unresolved section 11 stop condition remains.

## Capture list

67 local captures: the 55 required views plus 12 viewport views for closer review. Full-page captures start at the top to avoid placing the sticky header midway through the image. The additional viewport views preserve the actual game scroll position. All files are under `output/playwright/a6/` and are gitignored.

```text
a6-burnley-lead-390-light.png
a6-burnley-round1-partial-390-light.png
a6-burnley-round1-reveal-390-light.png
a6-burnley-funding-reveal-390-light.png
a6-burnley-reserves-reveal-390-light.png
a6-burnley-summary-390-light.png
a6-burnley-lead-viewport-390-dark.png
a6-burnley-lead-390-dark.png
a6-burnley-round1-partial-viewport-390-dark.png
a6-burnley-round1-partial-390-dark.png
a6-burnley-round1-reveal-viewport-390-dark.png
a6-burnley-round1-reveal-390-dark.png
a6-burnley-funding-reveal-viewport-390-dark.png
a6-burnley-funding-reveal-390-dark.png
a6-burnley-reserves-reveal-viewport-390-dark.png
a6-burnley-reserves-reveal-390-dark.png
a6-burnley-summary-viewport-390-dark.png
a6-burnley-summary-390-dark.png
a6-burnley-lead-1440-light.png
a6-burnley-round1-partial-1440-light.png
a6-burnley-round1-reveal-1440-light.png
a6-burnley-funding-reveal-1440-light.png
a6-burnley-reserves-reveal-1440-light.png
a6-burnley-summary-1440-light.png
a6-burnley-lead-1440-dark.png
a6-burnley-round1-partial-1440-dark.png
a6-burnley-round1-reveal-1440-dark.png
a6-burnley-funding-reveal-1440-dark.png
a6-burnley-reserves-reveal-1440-dark.png
a6-burnley-summary-1440-dark.png
a6-birmingham-lead-390-light.png
a6-birmingham-round1-partial-390-light.png
a6-birmingham-round1-reveal-390-light.png
a6-birmingham-funding-reveal-390-light.png
a6-birmingham-reserves-reveal-390-light.png
a6-birmingham-summary-390-light.png
a6-birmingham-lead-390-dark.png
a6-birmingham-round1-partial-390-dark.png
a6-birmingham-round1-reveal-390-dark.png
a6-birmingham-funding-reveal-390-dark.png
a6-birmingham-reserves-reveal-390-dark.png
a6-birmingham-summary-390-dark.png
a6-birmingham-lead-viewport-1440-light.png
a6-birmingham-lead-1440-light.png
a6-birmingham-round1-partial-viewport-1440-light.png
a6-birmingham-round1-partial-1440-light.png
a6-birmingham-round1-reveal-viewport-1440-light.png
a6-birmingham-round1-reveal-1440-light.png
a6-birmingham-funding-reveal-viewport-1440-light.png
a6-birmingham-funding-reveal-1440-light.png
a6-birmingham-reserves-reveal-viewport-1440-light.png
a6-birmingham-reserves-reveal-1440-light.png
a6-birmingham-summary-viewport-1440-light.png
a6-birmingham-summary-1440-light.png
a6-birmingham-lead-1440-dark.png
a6-birmingham-round1-partial-1440-dark.png
a6-birmingham-round1-reveal-1440-dark.png
a6-birmingham-funding-reveal-1440-dark.png
a6-birmingham-reserves-reveal-1440-dark.png
a6-birmingham-summary-1440-dark.png
a6-coventry-lead-390-light.png
a6-coventry-lead-390-dark.png
a6-coventry-lead-1440-light.png
a6-coventry-lead-1440-dark.png
a6-burnley-javascript-off-390-light.png
a6-birmingham-javascript-off-390-light.png
a6-coventry-javascript-off-390-light.png
```
