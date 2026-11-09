# UK Council Tax canonical handover, 4 November 2026

Saved at Tom's request before archiving the chat. The requested implementation is complete and the PR is open. Do not merge, deploy or start background work from this handover. Tom owns the merge because release.yml publishes on push to main.

## Resume points

- Repository: /Users/tompickup/ukcounciltax, private GitHub repository tompickup23/ukcounciltax.
- PR: https://github.com/tompickup23/ukcounciltax/pull/15
- Branch: codex/council-cross-domain-canonicals.
- Pushed commit: 331dd4ba518146c38f2075e633cb57c67352dd55.
- Base: origin/main 0c74bfb, fetched before branching.
- Clean implementation worktree: /Users/tompickup/.aidoge-worktrees/ukcounciltax-canonicals.
- Worktree created with Git after the desktop worktree tool rejected this repository because it was outside the chat's workspace folders.
- Read CLAUDE.md and AGENTS.md before further repository work. AGENTS.md remains a symlink.

## Decision and implementation

Tom's Sunday sheet decision 4, dated 4 November 2026, keeps both sites and defers the split by intent until after the 2027/28 bill season. Tom explicitly clarified that the interim canonical decision covers all 325 shared URLs, including the homepage, bands and regional hubs, not only the 296 English council profiles. The 63 unique pages remain self canonical.

Both live sitemaps were fetched on 4 November 2026. data/canonical-map.json contains the 325 exact same-path source and destination pairs, fetch date, source sitemap URLs and SHA256 hashes, and all 63 unmatched URLs. Raw sitemap snapshots are committed under data/canonical-sitemaps/. All English council profiles have a live counterpart. All 32 Scottish and 22 Welsh profiles, plus nine specialist hubs and tools, have none and stay self canonical. The PR body lists every unmatched URL.

Only the canonical link uses the committed map. Unmapped routes, including the noindex 404, keep their own canonical. Open Graph URLs, structured data URLs, page text, titles, descriptions, sitemap routes, redirects, figures and interactions are unchanged. No UK Councils repository changes or indexing submissions were made. Reverting the PR restores self canonicals. The map is dated sitemap evidence, not continuous destination monitoring or evidence of Google's selected canonical.

## Validation

- npm test: 103 tests across 14 files passed.
- npm run check: 108 files, no errors, warnings or hints.
- BUILD_OG=1 npm run build: passed with all share cards. Final environment used Node 22.23.4, NODE_OPTIONS=--max-old-space-size=768 and RAYON_NUM_THREADS=1. The first Node 25 build was stopped during slow share-card rendering under memory pressure.
- npm run test:dist: 389 HTML pages, 388 sitemap URLs, 325 mapped canonicals and 63 unique self canonicals passed. Exactly one canonical per HTML page.
- npm run test:text: 394 files passed.
- All 389 built HTML pages matched a fresh origin/main build byte for byte after removing only canonical tags.
- Internal link audit: 26,012 destinations, no missing files.
- Targeted comparison browser test passed on desktop and mobile after installing Chromium for the pinned Playwright version.
- Negative probes for duplicate tags, a wrong mapped pair and a cross-domain canonical on a unique page were rejected. Output was restored and the distribution check passed again.
- Added text and PR body passed the requested dash restrictions; git diff --check passed.

The five requested built pages were read: Burnley, Hackney, Glasgow City, precepts and the homepage. Their exact canonical tags are in the PR body. The homepage points to https://ukcouncils.co.uk/ as explicitly confirmed by Tom's scope clarification.

## Outstanding checks and release authority

At the archive check, PR 15 was OPEN at commit 331dd4b with auto-merge disabled. The GitHub Actions site check was QUEUED, not passed:

https://github.com/tompickup23/ukcounciltax/actions/runs/41877145059

The full browser and actual-CSP suites were not run locally because there was no interactive or client script change. The existing PR workflow includes both. Recheck the current PR head, workflow result and diff before any later merge. No merge or deployment was performed. No monitoring automation was created.

## Local preservation

The original checkout remains on main. Its pre-existing CLAUDE.md modification and untracked docs/HANDOFF-2026-10-05.md and docs/HANDOFF-2026-10-06.md were preserved. The implementation is committed and pushed; its worktree is retained for review. This new handover is local only and is not part of PR 15. No original guide or older handover was replaced.
