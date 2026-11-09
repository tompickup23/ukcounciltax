# Budget game I001 | phase 1 source review stop

Resolved 8 November 2026: commit `c771cbc` corrects the phase 0 audit and adds test g. Every service group sums exactly for all 308 councils with data. The importer and tests now require zero sub-line mismatches; the validated snapshot may be written. The following records the original stop.

8 November 2026. Work remains on `feat/budget-game-i001` in the authorised worktree. Nothing has been pushed or published. The binding phase 0 notes have not been changed.

## Reason for stopping

`docs/BUDGET-GAME-SOURCE-NOTES.md`, section 4, reports two service sub-line discrepancies beyond GBP 2 thousand: one environmental total and one adult social care total. The phase 1 importer cannot reproduce either discrepancy. It finds exact agreement for every service group with sub-lines.

Source: Ministry of Housing, Communities and Local Government, [Local authority revenue expenditure and financing England: 2026 to 2027 budget individual local authority data](https://www.gov.uk/government/statistics/local-authority-revenue-expenditure-and-financing-england-2026-to-2027-budget-individual-local-authority-data), published 11 June 2026, `RA_2026-27_data_Part_1.ods`, sheet `RA_LA_Data_2026-27`. The downloaded file matches the pinned SHA-256 in the source notes and `data/national/sources.json`.

The importer locates columns by asset ID and retains each service's preceding sub-lines in workbook order. Using `scripts/lib/ods.mjs`, every sub-line sum equals its printed service total. A separate one-off parse of the workbook's `content.xml`, expanding repeated cells independently of `readOds()`, also found exact agreement across 3,080 service-group sums for the 308 councils with returns. These counts are calculated from that MHCLG sheet using the phase 0 row filter. Comparing the underlying `office:value` cells with the displayed cells found no numerical differences in the imported Part 1 fields, so hidden precision does not explain the conflict.

The importer refuses to write `data/national/budget.json` while this source review remains unresolved. A failing test preserves the expected phase 0 discrepancy audit. No source figure has been adjusted, and no alternative year has been substituted.

## Checks completed

All source counts and monetary comparisons below refer to the MHCLG edition and sheet above unless another source is named.

- All three downloaded workbooks match their pinned hashes in `data/national/sources.json`.
- The phase 0 row filter retains 317 councils, including 308 with returns. The nine missing councils match the source notes by code and name, and their imported figures remain null.
- Every council with a return passes the service total check against line 799 and the exact financing identity against line 990.
- All anchor values for Burnley, Birmingham, Westminster and Lancashire in source notes section 4 match the displayed cells in RA Part 1, RA Part 2 and SG.
- Table 10 reconciliation matches the reviewed fixture: 271 of 287 billing authorities with returns agree within 0.05 per cent, and 275 within 0.5 per cent. Every outlier outside the tighter tolerance is in the fixture, and each fixture difference remains within 0.01 percentage points of its reviewed value. Source: MHCLG RA line 990 and Council tax levels set by local authorities in England 2026 to 2027, Table 10, the pinned `data/national/england.json` import.
- Each district resolves to exactly one county, and all 21 counties resolve to at least one district. Source: MHCLG Table 10 county parts joined to the RA class and ONS-code columns.
- RA Part 2 contains 89 ODF error cells displaying `#REF!`. The existing reader preserves all of those markers, and the numeric adapter converts the marker to null, never zero. Source: MHCLG `RA_2026-27_data_Part_2.ods`, `content.xml`; the markers occur in the helper row before the asset-ID row.

## Verification and scope

`npm test -- --run tests/budget.test.ts`: nine passed, one failed. The sole failure is the unreproduced phase 0 sub-line discrepancy audit.

`npm test`: 194 passed, nine skipped, one failed across 25 files. The sole failure is the same source review gate. Existing built-page checks are skipped because no distribution build has been made in this worktree.

`npm run check`: no errors, warnings or hints across the checked Astro and TypeScript files.

The importer, source entries, reconciliation fixture and tests are retained for review. The budget snapshot write is skipped. Static pages, game rounds, the illustrative scenario, browser checks, final build, push and PR creation have not been attempted. The one-off prior-year cross-check has not been attempted because the source review stop was reached first. No other repository or worktree was read or changed for that cross-check.

## Required review before resuming

Identify the council codes and component cells behind the environmental and adult social care discrepancies reported in phase 0, or authorise a correction to that audit after reviewing the pinned workbook. Keep the existing source figures and Table 10 fixture unchanged. Once that discrepancy is resolved, update the source review test and importer gate together, rerun phase 1 and continue the remaining phases.
