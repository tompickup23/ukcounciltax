# Budget game | phase 3 and phase 5 review

Work began on 8 November 2026 and validation continued into 9 November 2026. Continued in `/Users/tompickup/wt/uct-budget-game` on `feat/budget-game-i001` from `915fbd9`, after Tom approved phase 2. Phase 3 is commit `0ee7a24`, `Budget game rounds`. Phase 5 contains the test and release evidence. The PR is the review candidate, not a deployment.

## Scope

The index and 296 billing-authority pages are retained. Games are present on 287 pages; nine remain bill-only notices. Districts with a return have a second spending round for their county, giving 160 county sections. These counts come from the pinned MHCLG RA records, Table 10 county joins, unit tests and built-output audit. No standalone county route is added. The sitemap contains 297 budget entries including the index.

Phase 4 is not built. The illustrative scenario follows separately in C1b. The service receipt remains with I006. There is no gap exercise, analytics, completion measurement, new source edition or runtime dependency.

## Decisions taken

- Spending guesses use whole pence totalling 100p. Calculated shares use the unrounded positive-service base; displayed shares use two decimal places. Negative headings remain outside the guess, with the printed net income amount and source.
- The bill round has no band selector. It uses each non-zero printed Band D component divided by the printed Band D area average. Zero separate components remain in the reveal and the static table. Printed component rounding is preserved rather than normalised away. The separate whole-bill band selector is unchanged.
- Funding groups are ordered by magnitude, retaining add/deduct direction and the original signed input figures. Ties can be in either order. The score is the percentage of correctly ordered unequal pairs.
- The county has the requested additional spending screen. Funding and reserve guesses concern the billing council; county funding and reserves remain available in the static tables.
- Reserves include an explicit neither answer. Fixed size bands are game choices, not estimates: no change; above zero to below GBP 1 million; GBP 1 million to below GBP 10 million; GBP 10 million to below GBP 100 million; GBP 100 million or more. Direction and size are each worth half the score. The reveal shows the printed component balances and the calculated change, without a ratio or judgement.
- Summary distances use absolute pence differences for split answers, incorrectly ordered pair percentages for funding, and zero or 100 for reserve answers. The scale is explained. Skipped rounds have no score and do not enter the furthest answers.
- The score link carries the council slug in the path and scores in a fragment. It carries no band, postcode or guesses. Restored scores are explicitly unverified; guesses and furthest answers cannot be restored. There is no storage or game fetch.
- The Sources-page browser assertion is updated from the previous catalogue to include the three pinned RA files already added in phase 1. The test checks each original file link as well as the catalogue count.
- The installed Astro preview detaches from the Playwright launcher on this machine. Browser tests use an explicit local URL after checking the listening process's worktree and the page's canonical URL. The production-header suite uses only the authorised local `wrangler pages dev` command through `npm run test:csp`.
- This repository has no installed pre-commit hook at its resolved Git hook path. No bypass option was used. The phase 3 commit was scanned with redacted Gitleaks; the shared staged guard is run explicitly before the phase 5 commit. No shared checkout or hook configuration is changed.

## Item 9 self-review

The unit test reads the pinned workbooks and compares every stored field label and section heading after only the permitted punctuation normalisation. It follows the workbook's merged section headings. The existing regression checks that only a dash between numbers becomes “to”. Service headings offered by the game equal those source headings for every council.

Every reveal carries its original file source, publisher, title, sheet and publication date. Derived shares, grouped funding, reserve totals and changes are labelled calculations. The DSG figure is accompanied by its SG source and is not subtracted. The reserves caveat links to the named national revenue release. No new source is cited.

The browser suite visits every no-return and note 4 page. Missing-return pages contain their dated notice, the current bill and no game or budget tables. Each note 4 warning remains beside council tax requirement in the static table and game funding reveal. The full no-JavaScript budget and service sub-line tables remain available.

Keyboard journeys complete every round for Burnley and Birmingham at 375px and desktop, in light and dark themes. They exercise number inputs, funding movement, reserve choices, reveal and summary. Axe checks run on each question and answer as well as the summary. Skipping, invalid allocations, copy links, restored scores and malformed score fragments have separate checks. Native select choices use keyboard type-ahead in the headless macOS run.

The built text sweep and the additional budget-page motive-word sweep cover all budget pages. The latter checks party names, councillor/officer terms and judgement words. No individual or party is introduced. Public wording and figures were also reviewed directly in the game adapter, client renderer and selected screenshots.

## Reconciliation and donor cross-check

The source contract is unchanged: 317 retained RA councils, 308 with data. Service totals, service sub-lines and the financing identity reconcile exactly. Of the 287 billing returns, 271 match Table 10 within 0.05 per cent and 275 within 0.5 per cent. All exceptions remain in the reviewed fixture. No source amount was adjusted.

The official 2024/25 five-council cross-check, workbook URL and SHA-256 are retained in `BUDGET-GAME-PHASE-2-REVIEW.md` and repeated in the PR. Eastleigh, Torbay, Croydon and Calderdale match all non-zero lines and totals. Nottinghamshire's donor extractor omitted housing line 490 and planning line 599; its shortfall is explained by those omissions. Nothing from AI DOGE is used as site data and no AI DOGE file is changed.

## Validation

The complete local gate passed on Node 22.23.4. The final share-card build used a 768 MiB JavaScript heap limit and one Rayon thread. Logs and intermediate evidence remain under ignored `.ops/`. Selected screenshots are in `budget-game-review/` and linked in the PR. The local archive completion record is `.ops/BUDGET-GAME-COMPLETION.md`, written after PR creation.


| Check | Result |
| --- | --- |
| `npm test -- --maxWorkers=1` | 214 passed across 27 files, no skips |
| `npm run check` | 148 files, no errors, warnings or hints |
| `npm run build` | Completed with Pagefind and CSP hashes |
| `npm run test:dist` | 688 HTML pages, 687 sitemap URLs, all passed |
| `npm run test:text` | 695 files, no prohibited dash punctuation |
| `node scripts/audit-links.mjs` | 48,236 destinations checked, no missing local files |
| `npm run test:e2e -- --workers=2` | 202 passed, including mobile/desktop, light/dark, keyboard, no-JavaScript, axe and sharing checks |
| `npm run test:csp -- --workers=2` | 74 passed with real local Pages headers |
| Final `BUILD_OG=1 npm run build` | Completed with 300 share cards, Pagefind and CSP hashes |
| Output audit | 296 council budget pages, 287 games, nine no-return notices, 160 county sections, seven note 4 pages, 297 budget sitemap entries |
| Item 9 self-review | Workbook labels, source coverage, every no-return and note 4 page, keyboard-only journeys, dash and motive-word sweeps passed |

All 715 compared HTML, JavaScript, CSS, XML, header and redirect files match the browser-tested build byte for byte. The final build contains 688 HTML pages and 300 generated share cards. Distribution, text and link checks passed again after the final build.


Hosted clean-checkout validation: the first PR run failed before the build because `data/raw/` is gitignored and the RA tests require the three pinned originals. The workflow now runs the existing RA importer before the tests, verifying all source hashes and reconciliations, then requires `git diff --exit-code -- data/national/budget.json`. This is source preparation, not a new edition or a skipped check. A clean archive with no raw files fetched the original workbooks successfully and reproduced the committed budget snapshot byte for byte. The unit suite then passed with only the existing distribution-dependent pre-build skips. The local final-build results above remain valid because this correction changes only CI preparation.
