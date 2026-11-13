# Archive handoff | UK Council Tax nearby and alike | 13 November 2026

## Saved result

Tom asked to complete the next session after inspecting UK Councils and UK
Council Tax, then to save, prepare and archive this chat.

PR 67 is open: https://github.com/tompickup23/ukcounciltax/pull/67
Branch: feat/nearby-and-alike
Checked and pushed head: ecaff3043f40b6cad10cc3d5eadf449cec3749d5
Baseline: bcde00c9fe60e5b369e739913e6e6f6cf9d9a98f
Review worktree: ~/.codex/worktrees/uct-nearby/ukcounciltax
Committed report: docs/NEARBY-AND-ALIKE-2026-11-13.md
Release notes and the independent dry run are committed in the same PR.

At archive preparation the worktree is clean and fully pushed, with zero
commits ahead of or behind upstream. PR 67 remains open at the checked head.
Site, number diff and design checks are all successful. The production publish
step was skipped. Nothing was merged, tagged or deployed by this session.

Successful run:
https://github.com/tompickup23/ukcounciltax/actions/runs/43507852595

## What changed

All 296 English council tax profiles have an open Nearby and alike section,
a contents link and a link to their existing class ranking. Boundary neighbours
use the reviewed UK Councils outline-intersection method from f1e33e6,
including correction 339921e. County joins use exact registry parent GSS codes.
District county and similar lists appear once. Other types retain regional
same-type links. Names and types are shown without new financial comparisons.

The independent GEOS dry run matches all 753 boundary pairs and 1,244 directed
same-county links. Island gaps and simplified coastline limitations are visible.
The section works without scripts and is excluded from Pagefind. Scottish and
Welsh onward links, budget game neighbours and locator-map interaction are
unchanged. No new boundary source was fetched.

## Verification

Local: 362 unit tests with no skips, zero Astro diagnostics, full BUILD_OG=1
build, distribution and text checks, 72,249 internal link destinations,
440 browser tests and 104 actual-header tests. The pinned design checker
passed four profiles in both themes and widths with zero findings.

All 909 pages retain their existing anchors, links, titles, canonicals and
inline SVGs. All 2,845 PNGs are byte-identical. The only number differences
are one added 2026 token from the map citation on each English profile.
Budget, Scottish and Welsh pages retain their exact HTML.

Hosted CI independently passed all 440 browser tests and all 104 actual-header
tests. Its design report has zero failed checks across four pages. Its number
report exactly matches the local result. Copies of those hosted reports and
the final PR state are in the review worktree's ignored .ops/nearby/ directory.

Burnley height changes from 14,026 to 15,459 pixels at 375 wide, and from
10,174 to 10,868 at 1440 wide, because the lists are open. All sixteen measured
page/theme/width combinations have zero horizontal overflow. Manual captures
remain in output/playwright/nearby/. Baseline builds and logs remain ignored
under .ops/nearby/. The pinned design checker keeps its images outside the
checkout; .ops/nearby/design-directory.txt records that location.

The owned preview ports 44426 and 44427 were stopped, and the manual browser
session was closed. The review worktree and branch are retained for review.

## Resume

1. Refresh PR 67 and its current checks before review. Do not repeat this build.
2. Read its committed review report and the UK Councils donor's review fix.
3. Merge and production deployment require Tom's explicit instruction. This
   archive request authorises neither.
4. All five prepared round-two prompts had already merged before this session:
   UK Council Tax PRs 64, 65 and 66, and UK Councils PRs 49 and 50. Their older
   local archive handoffs are superseded on those statuses.
5. Later visual work, the kit gates programme and budget-freeze research are
   separate. Refresh their current decisions and PR state before selecting work;
   this session did not resolve or implement them.

This archive handoff is saved locally in the original UK Council Tax checkout,
with a continuation pointer added to CLAUDE.md. A second copy is in the review
worktree's ignored .ops/nearby/ directory. Neither copy is committed or pushed,
so the checked PR head remains unchanged. The original main checkout is behind
origin/main and has pre-existing local notes; preserve those notes and their
staging when updating it. AGENTS.md remains a symlink to CLAUDE.md in both
checkouts. No worktree or branch was removed.
