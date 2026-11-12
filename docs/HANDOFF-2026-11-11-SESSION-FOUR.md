# Handoff | prepared session 4 | 11 November 2026

## What this session did

The six prepared sessions are in `docs/CODEX-PROMPTS-2026-11-11.md` on the `docs/navigation-visuals-brief` branch (PR 54 until merged). Sessions 1 to 3 were already built. This session implements prompt 4, the UK Council Tax comparison improvements, on `feat/compare-improvements`.

The change is stacked on typed search PR 59 at `5ae0ae03f4cca969cd1d35d67669ccf6dd29293a`. That PR is itself stacked on the payment-link refresh PR 58. The prepared order called for each parent on main first; this session follows the existing stacked-PR approach to build without merging or publishing earlier work. Merge the parents in order, then retarget the child PRs and read fresh checks before any merge. No merge, tag or deployment was performed or authorised here.

The answer now leads with the absolute annual gap, its percentage of the lower annual charge and the annual gap divided by twelve. Calculations, rounding and source are visible. Both compact choosers support council, county, region and postcode matching. Existing comparison restrictions, missing-year behaviour, shared links, history, swapping and focus remain. The homepage card describes the actual two-council comparison. The no-script fallback opens two published council tables in separate tabs. UK Councils is unchanged.

The comparison data in the built page was checked against session 3: all 296 rows, all bands and years, source metadata and source-file hashes are unchanged after removing the added search metadata. No financial source file or security header changed.

## Next session and dependencies

The next unbuilt prepared session is prompt 5, the council picker and councils index on UK Councils. Its explicit gates remain: UK Councils PR 46 (session 2, local links) and UK Council Tax PR 56 (the picker's phone behaviour) must be merged. Prompt 5 explicitly says to stop if the PR 56 commit is absent from main. Confirm current state before starting; this session does not authorise those merges.

Prompt 6, chart image weight on UK Council Tax, waits for pipeline-speed PR 51 and this session's comparison improvements to merge. Keep the agreed 2x resolution, light theme only, no per-council locator-map PNG and the measurement thresholds in its prepared prompt. Do not begin it as a continuation of this feature.

The dossier's short source lines and kit adoption still have their own kit-tag and approval gates. The balance-the-budget exploration is separate. Do not infer permission to merge, deploy, tag or remove worktrees from this handoff.

## Local continuation

The source and validation evidence are in the managed worktree on `feat/compare-improvements`. Locate it with `git worktree list`. Ignored `.ops/` holds command logs, before/after output hashes and the prepared PR body; `output/playwright/` holds captures. These are local evidence, not public repository content. The original checkouts and earlier worktrees were left intact. Read the PR checks and any review before changing this branch.

The initial interactive content reveals after state restoration while retaining its layout. The design check measured zero cumulative layout shift for empty and shared comparisons at both widths in both themes after this change. Browser tests now guard that behaviour as well as the no-script fallback.

## Validation

Final validation on Node 22.23.4: the full unit run passed 318 tests, with 20 built-page checks deferred. The final post-build run passed all 83 tests in the 12 relevant files, including every deferred check; 49 source safeguards also passed after the final changes. Astro checked 255 files with no diagnostics. The full `BUILD_OG=1` build passed, followed by distribution checks for 909 pages, 908 sitemap URLs and 4,996 chart PNG links, the text sweep over 917 files, and an audit of 71,128 internal-link destinations. All 376 browser tests and all 96 actual-header CSP tests passed with two workers. The unchanged pinned design checker passed the homepage, empty comparison and shared comparison at 390 and 1440 in both themes with zero findings. The final comparison was visually inspected at 375 and 1440 in both themes. The preview and manual browser were stopped.

One post-build budget fixture check reached its existing five-second timeout while other checks ran concurrently. The complete unchanged post-build suite then passed on its own. No assertion or timeout was relaxed. Validation also caught and fixed a cancelled postcode progress message and initial layout movement; regression tests cover both.

Against the session 3 build, only `index.html` and `compare/index.html` differ. All 5,639 PNGs are byte-for-byte identical, no HTML or PNG was added or removed, and the numeric comparison reports zero pages with changed printed values. The 296 comparison rows, bands, years and source metadata match exactly after removing the added search metadata. The financial source files and public security headers are unchanged. No merge, tag or deployment was performed.
