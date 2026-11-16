# W2 Set workbench evidence

Prepared on 16 November 2026 from `origin/main` at `810be18`, the merged W1 prerequisite. Implementation and verification used Node 22.23.4. No merge or deployment is part of this change.

The Set pages retain the Guess and Set links, put scenario controls above the service ledger, and group the result into remaining difference, spending change and financing change. Sources and the published baseline remain available without JavaScript. Assumptions and the signed ledger use native disclosures. The theme control changes only the current document.

The model in `src/lib/budget-freeze.ts` and all held data are unchanged. New interaction logic lives in `src/scripts/budget-freeze.ts`. Percentage choices round once to pennies before entering the existing model, whose accounting remains in 1/10000 pound units. Steppers preserve exact entries and clamp at the existing exploration endpoints.

## D10 and sources

Both presets are labelled user requested scenarios under budget-freeze 0.2. The trigger preset restores published services and selects the first whole penny requiring a referendum. The service preset uses 95% of each editable published amount with the previous own charge. Both hold the tax base, grants, reserves and all non-editable entries fixed. The preset assumptions are linked beside the buttons and included in their accessible descriptions.

All 197 eligible councils have an official held rule. [The full council and source list](REFERENDUM-SOURCES.md) records each mapping. A missing rule produces no trigger amount. The district calculation preserves both tests, including the strictly greater pound condition.

## Measurements

Measured against an independent full build of main at 810be18. Both themes have the same heights. The viewport height was 900px. All 197 candidate pages were also measured at 1440px: the maximum is 2,894px, Bournemouth, Christchurch and Poole.

| Council | Width | Before | After |
| --- | --- | --- | --- |
| leeds | 390px | 15599px | 5301px |
| leeds | 1440px | 8759px | 2843px |
| hyndburn | 390px | 14216px | 4723px |
| hyndburn | 1440px | 7759px | 2467px |
| east-cambridgeshire | 390px | 14655px | 5054px |
| east-cambridgeshire | 1440px | 8154px | 2783px |

Maximum CLS across the twelve final captures is 0.0345, below 0.1. The pinned design checker separately recorded zero failed checks across the three paths in four modes, with a strict 3,000px desktop cap. The preset button pair for each of the three councils fits within the first 375px browser viewport in the interaction tests; the phone result strip stays hidden until the result board scrolls out of view.

[Capture measurements](measurements.json) and [all council heights](cohort-heights.json) preserve the raw observations.

| Council | 390px captures | 1440px captures |
| --- | --- | --- |
| leeds | [Light](leeds-390-light.png) / [Dark](leeds-390-dark.png) | [Light](leeds-1440-light.png) / [Dark](leeds-1440-dark.png) |
| hyndburn | [Light](hyndburn-390-light.png) / [Dark](hyndburn-390-dark.png) | [Light](hyndburn-1440-light.png) / [Dark](hyndburn-1440-dark.png) |
| east-cambridgeshire | [Light](east-cambridgeshire-390-light.png) / [Dark](east-cambridgeshire-390-dark.png) | [Light](east-cambridgeshire-1440-light.png) / [Dark](east-cambridgeshire-1440-dark.png) |

The twelve PNGs use at most 128 colours. Desktop captures are halved to 720px wide. The complete evidence folder is below 4 MB.

## Verification

All local automated gates passed. Actual output excerpts are in [gate-output.txt](gate-output.txt); the complete pinned checker output is in [design-check.txt](design-check.txt).

| Gate | Actual result |
| --- | --- |
| Unit suite | 71 files, 912 tests passed, 260.99s |
| Astro check | 350 files, 0 errors, 0 warnings, 1 existing hint |
| Production build | 1107 pages built in 18m 0s; 1106 indexed |
| Dist | 1107 pages, 1106 sitemap URLs, 2207 chart links passed |
| Text | 1115 files passed |
| Browser suite | 562 passed in 11.7m |
| Production CSP | 141 passed in 3.7m |
| Pinned design checker | 0 failed checks across 3 pages and 12 captures |
| Number diff | 197 pages differing; 0 added; 0 removed; 0 outside allowed globs |

The final build used `BUILD_OG=1 OG_IMAGE_CACHE=1 npm run build`. The initial unit run encountered the known default timeouts on this Mac. The final passing command was `npm test -- --testTimeout=120000 --maxWorkers=1`, run alone after a contended retry. No repository timeout settings changed. Astro's existing hint is the unused `gss` in `tests/towns.test.ts`.

The npm lockfile holds Playwright 1.64.1; the Python design checker stays pinned to 1.65.1. Neither manifest nor lockfile changed. Installing the checker's browser initially removed the npm browser through Playwright cache cleanup; both browser versions were restored, and both complete browser suites above passed afterwards. The checker used a strict 3000px desktop cap.

The source model, held data, protected shared files and pinned CI checker have no diff. New unit tests cover every council's first triggering penny, rounding, exact-entry steppers and all sixteen frozen councils. The browser suites cover the requested 375px first-screen controls, no-script content, theme, arithmetic, invalid inputs, debounced live region, forced colours and axe checks. CI results are attached to the draft pull request.

The existing browser helper changes only where the specified interface changes require it: the service slider now moves by 0.5% instead of a penny; exact fields and the ledger are opened before they are inspected. Extra static checks open the assumptions and verify the baseline and notice. Arithmetic boundaries, invalid inputs, the unchanged ledger, memory-only theme, absence of storage and requests, and production CSP checks remain in place.

## Archive handoff

The source changes, screenshots and this evidence are saved on `feat/w2-set-workbench`. A fresh checkout needs the held `data/raw/*.ods` workbooks copied from the main checkout before `npm ci` and verification. Keep Node 22.23.4 first on PATH. The task does not edit `docs/STATE.md`, the concurrent towns routes, shared navigation, site configuration, route registration, or the pinned CI design checker.

A manual VoiceOver listening pass has not been performed. Automated accessibility checks do not substitute for that manual check. Merge and deployment remain for Tom to authorise separately.

Built with Codex from a prompt prepared in Claude Code.
