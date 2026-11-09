# UK Council Tax PR 15 rebase handover

8 November 2026. Saved at Tom's request before archiving this chat. The requested rebase and guarded push are complete. Stop here: do not merge, deploy, schedule monitoring or start further work from this handover. Merging deploys; Tom explicitly prohibited merging in this session.

## Current state

PR: https://github.com/tompickup23/ukcounciltax/pull/15

Remote branch: codex/council-cross-domain-canonicals. Head: 150d5891406d2f235158032e03732a09c6c23f8e. Base: main 9a73fa7254fbb604e6f2ff1c1086ba63f504e8d0. At archive preparation the PR was OPEN and MERGEABLE, with automatic merge disabled.

Rebased the original single commit 331dd4ba518146c38f2075e633cb57c67352dd55, rather than merging main. Pushed only the PR branch using an explicit force with lease against that original head. The replacement commit message is: Apply reviewed cross domain canonicals on current main. Tom requires British English and no dashes of any kind in commit messages.

The fresh worktree is /Users/tompickup/.aidoge-worktrees/ukcounciltax-pr15-rebase, on local branch codex/pr15-rebase-resolution. It was clean at archive preparation and is retained with its build output and logs. Git created it after the desktop worktree tool rejected the repository as outside the chat workspace. Do not confuse this worktree with the older /Users/tompickup/.aidoge-worktrees/ukcounciltax-canonicals, which retains the original branch history.

## Conflict resolution and canonical count

The sole textual conflict was docs/RELEASE.md. Both main's release records and the original canonical record were retained. Automatic merges in scripts/check-dist.mjs and src/lib/site.ts preserve all main checks, routes, contact details and navigation. The PR still changes ten files. Page sources, components, dependencies, public redirects and other main content are unchanged relative to the base.

The committed map and both 4 November sitemap snapshots remain byte for byte unchanged and record 325 reviewed pairs. Main removed /council-tax/rises-2026-27/ and replaced it with a 301 to /increases/#2026-27. The correct fragment has no trailing slash. The previous chat's final reply accidentally printed /increases/#2026-27/; repository data, tests and release notes use the correct destination.

There are therefore 324 built cross domain canonicals: 296 council profiles and 28 other routes. The retired page is not resurrected and its canonical is not transferred to /increases/. The 63 original specialist pages, three added routes (/council-tax-2027-28/, /findings/, /changes/) and the noindex 404 stay self canonical. Tests explicitly account for the single removed route and three additions while retaining strict checks for other missing pages.

Main changed mapped source pages for /, /about/, /contact/, /corrections/, /sources/, /council-tax/, all eight band pages, all nine regional pages and all 296 council profiles. Shared footer and navigation changes affect surviving pages too. Retained routes keep only their original reviewed exact mapping; no fresh equivalence claim was made. The rebase section of docs/RELEASE.md in the PR lists the route groups and regional paths.

## Completed verification

Local results on the pushed implementation:

- npm test: all 194 tests across 24 files passed after the build, with no skips.
- npm run check: 132 files, no errors, warnings or hints.
- BUILD_OG=1 npm run build: passed, including 300 share cards, Pagefind and CSP hash injection. Node 22.23.4, NODE_OPTIONS=--max-old-space-size=768, RAYON_NUM_THREADS=1. Rendering was slow on this machine but completed.
- npm run test:dist: 391 HTML pages, 390 sitemap URLs, 324 mapped canonicals and all 63 original specialist self canonicals passed.
- npm run test:text: 398 files passed.
- Internal link audit: 30,525 destinations, no missing local files.
- All 391 HTML files match a separate build of main byte for byte after removing only canonical tags. Headers, redirects and sitemap also match byte for byte. Generated files were produced by the repository build scripts.
- Targeted comparison browser checks: desktop and mobile passed.
- All four e2e-csp/redirects.spec.ts checks passed through Wrangler, including both retired URL forms, the year section and the next year page.
- git diff --check passed. The replacement commit message has no dashes.

The installed Astro version backgrounds preview when it detects an agent session, which caused initial Playwright server startup failures before tests. The passing targeted comparison run used E2E_BASE_URL=http://127.0.0.1:45317 against a separately started preview with its worktree and canonical verified. No dependency or test configuration change was needed. The owned preview processes were stopped after testing.

Hosted verification subsequently PASSED on the pushed head, completing at 15:18:05 UTC on 8 November 2026:
https://github.com/tompickup23/ukcounciltax/actions/runs/42493744618/job/128771437810

The job's step results were checked during archive preparation: unit tests, Astro check, full build, distribution, text and link checks, the full browser suite and the full CSP suite all succeeded. Production publication and IndexNow steps were skipped. No merge or deployment occurred.

## Evidence and preservation

The fresh worktree's ignored .ops/ directory contains pr15-build.log, pr15-main-build.log, pr15-browser.log, pr15-csp.log and the main-reference source and output used for comparison. The committed docs/RELEASE.md holds the conflict and local validation record; the hosted success was learned after the push and is recorded here.

This handover is local only in the primary checkout. The primary CLAUDE.md continuation pointer is updated locally, and AGENTS.md remains its symlink. The pre-existing untracked docs/HANDOFF-2026-11-04-CANONICALS.md is preserved. No new archive preparation commit or push is made. Retain the worktree for review; archiving the chat does not remove it.

For any later authorised work, read CLAUDE.md and AGENTS.md, fetch, and recheck the PR's exact head, base and hosted checks. The older 4 November handover describes the original 325 built pages and is superseded by this rebase record. No further action is authorised by this saved note.
