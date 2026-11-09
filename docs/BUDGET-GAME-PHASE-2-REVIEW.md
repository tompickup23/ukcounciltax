# Budget game | phase 2 review

8 November 2026. Worktree `/Users/tompickup/wt/uct-budget-game`, branch `feat/budget-game-i001`, resumed from `1b2c56b`.

## Scope and stopping point

Tom explicitly chose **“Stop after phase 2 for review”** during this session. Complete and commit the static pages, then stop. Do not begin phases 3 to 5, push or open a PR on the strength of the earlier instruction. A new instruction is required to resume.

The question concerns phase 3's bill round. Table 10 holds Band D components only. The retained national band table holds whole-bill area charges for all bands, but does not supply each body's all-band components. The project prohibits inferring missing band charges. The proposed alternative, a Band D-only bill round alongside the existing whole-bill band selector, has not been approved.

Phase 2 therefore shows the observed Band D component table and the existing selector for observed whole-bill charges. Previous-year comparisons are suppressed on budget pages so the nine no-return pages contain no figures from another year. No game or illustrative scenario has been built.

## Static implementation

The `/tools/budget/` index and routes generated from `councilPages()` cover all 296 English billing authorities. The pinned MHCLG RA snapshot supplies 287 billing returns and nine no-return notices; district pages include their county's tables except on the no-return pages, which show bill information only. No standalone county page is generated. Counts come from the phase 1 importer and the page coverage tests.

Service tables retain printed MHCLG headings and line numbers, identify net current expenditure and net income, and show the DSG and SEND qualifications. Optional disclosures contain the printed service sub-lines and signed financing lines. Funding magnitudes have an explicit add/deduct direction, preserving the financing identity when reserves are added to or another financing item is a deduction. The reserve view uses only other earmarked and unallocated balances and carries MHCLG's usability caveat.

The loader distinguishes observations from grouped calculations, preserves unknowns, checks the edition join, and reads only committed local data. Table captions and source lines identify the publisher, release, sheet, publication date and original file. MHCLG notes 4 and 8 remain visible where applicable. Budget pages are self canonical and included in the sitemap. Council summaries, tools, coverage, methodology and source pages link them. The existing `llms.txt` generator picks up the new hub from navigation and the source manifest.

## Earlier cross-check resolution

The review decisions in `PLAN-2026-11-08-BUDGET-GAME.md` resolve the earlier donor cross-check stop. The official 2024/25 RA workbook and five-council comparison remain in ignored `.ops/` evidence. Nothing was copied from AI DOGE into site data and AI DOGE was not changed.

When a later authorised phase 5 creates the PR, include the full comparison from `.ops/BUDGET-GAME-RESUME-REPORT.md` and `.ops/budget-cross-check.json`, plus the review explanation: Nottinghamshire's donor extractor omitted housing line 490, minus GBP 37,000, and planning line 599, GBP 16,031,000. Their net GBP 15,994,000 accounts for the donor split's shortfall. The official RA lines reconcile. Eastleigh, Torbay, Croydon and Calderdale match in every non-zero line and total. The review also records the broader AI DOGE extractor omission pattern. Do not omit the official workbook URL and SHA-256 from that future PR.

Retained cross-check source: MHCLG, [2024/25 individual authority budget data](https://www.gov.uk/government/statistics/local-authority-revenue-expenditure-and-financing-england-2024-to-2025-budget-individual-local-authority-data), [RA Part 1 workbook](https://assets.publishing.service.gov.uk/media/6762a0a83229e84d9bbde757/RA_2024-25_data_Part_1.ods), sheet `RA_LA_Data_2024-25`, SHA-256 `19231e891ec06f6aa5c8fed7794b247d5e5a3f59aca6ba59d7ec4efc7f41e8f1`. The earlier comparison used the importer parser and converted printed GBP thousands to GBP. All five donor records explicitly identified the RA approved budget as their source.

| Council | Matching non-zero lines | Missing non-zero lines | Official RA total, GBP | Donor line sum, GBP | Donor stated total, GBP |
|---|---|---|---|---|---|
| Eastleigh | 6 | 0 | 14,581,000 | 14,581,000 | 14,581,000 |
| Torbay | 10 | 0 | 262,017,000 | 262,017,000 | 262,017,000 |
| Croydon | 11 | 0 | 673,992,000 | 673,992,000 | 673,992,000 |
| Calderdale | 10 | 0 | 360,770,000 | 360,770,000 | 360,770,000 |
| Nottinghamshire | 9 | 2 | 1,245,472,000 | 1,229,478,000 | 1,245,472,000 |

## Boundaries

The existing untracked archive handoff is preserved. Ignored `.ops/` evidence is not staged. No push, PR, merge, deployment, DNS, Cloudflare configuration, other repository or ideas-register change is included. Local `wrangler pages dev` is permitted solely for the actual-header tests, as resolved in the plan. The source data and the `AGENTS.md` symlink remain unchanged.

`gh pr list` returned no open PRs at the start of this session. Recheck before any later PR and identify overlaps with the four paths named in the brief.

## Verification

The targeted static-page browser suite passed all 20 tests, covering mobile and desktop, light and dark, axe accessibility, the complete directory, no-JavaScript reading, band selection, missing returns and note 4. The three actual-header checks for the index, Burnley and Birmingham passed through local Wrangler with no CSP violations. No inline-script permission was added. Screenshots for Burnley at 375px and desktop, light and dark, remain in ignored `.ops/budget-phase2-*.png`.

Astro check covered 141 files with no errors, warnings or hints. The initial unit rerun with one worker passed 198 tests, with nine distribution-dependent tests skipped before the build. The first parallel attempt had two workbook-test timeouts under machine load; the serial rerun passed without weakening the source assertions. Hardcoded year labels and a comparator rejected by the text guard were corrected. The completed final results are recorded below.


Final validation on Node 22.23.4:

| Check | Result |
|---|---|
| `npm test -- --maxWorkers=1` after the build | 207 passed across 26 files; no skipped tests |
| `npm run check` | 141 files; no errors, warnings or hints |
| `BUILD_OG=1 npm run build` | Completed with share cards, Pagefind and CSP hashes |
| `npm run test:dist` | 688 HTML pages, 687 sitemap URLs; every page points to a built share card |
| `npm run test:text` | 695 files passed |
| `node scripts/audit-links.mjs` | 48,236 destinations checked; no missing local files |
| Targeted `npm run test:e2e` | All 20 static-budget checks passed |
| Targeted `npm run test:csp` | All three budget-route real-header checks passed |

The output audit counted 296 council budget pages: 287 with budget tables and nine no-return pages, plus the index. There are 160 county sections on district pages with a return, and 297 new budget sitemap entries. Every new table has a caption and an adjacent source line. No budget page contains earlier-year figures. The final build's 688 HTML files, `_headers` and sitemap match the browser-tested build byte for byte, so the completed share-card render did not alter tested page behaviour. The full phase 5 browser suites and game checks remain for a separately authorised continuation.

The unchanged source checks retain 317 RA councils, 308 with data. Service totals and sub-lines reconcile exactly; financing reconciles exactly. Of the 287 billing returns, 271 are within 0.05 per cent of Table 10 and 275 within 0.5 per cent. All exceptions remain covered by the reviewed fixture. Source: the pinned MHCLG files and `tests/budget.test.ts`.

Local test logs, the output audit and screenshots are in `.ops/budget-phase2-*`. The first share-card build was stopped to tighten the zero-education wording and check the pages before the final render; the subsequent final build completed successfully. No failure was bypassed.
