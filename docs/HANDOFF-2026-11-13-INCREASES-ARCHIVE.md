# Archive handoff | round two session 1 | 13 November 2026

## Saved work

Tom asked to complete the first session, then to save and archive this chat.
Round two prompt 1 from docs/CODEX-PROMPTS-2026-11-12.md is implemented.

- PR: https://github.com/tompickup23/ukcounciltax/pull/64
- Branch: feat/increases-way-in
- Pushed head: b6c0fe59348a0754fa520b5f728691c7203d643a
- Worktree: ~/.codex/worktrees/uct-increases/ukcounciltax
- Review report on that branch: docs/INCREASES-WAY-IN-2026-11-13.md
- Release notes updated in the same commit.

At archive preparation the PR is open and all GitHub checks are successful:
site, number diff and design check. The site check finished on 13 November
2026 at 03:05:36 UTC. Run:
https://github.com/tompickup23/ukcounciltax/actions/runs/43354219635

The checked PR head matches the local and upstream branch heads. The review
worktree is clean, with zero commits ahead or behind its upstream. Nothing
was merged, tagged or deployed by this session.

## Result and verification

The increases page leads with the existing current-year figures. A finder
reuses the existing matching helper, includes billing councils and separately
labelled counties, and scrolls to, marks and focuses the own-share row. Older
years use native details; links open the right year on load, hash change and
click. The next-year notice is shortened to a link to its existing page.

At 375 pixels wide the page falls from 17,671 to 8,487 pixels high; at 1440,
from 12,242 to 6,087. Both themes were inspected. All 12 tables, 1,291 rows,
17 figure source lines and 39 existing anchors are preserved. No financial
figure, source dataset, canonical or redirect changed. All 2,845 PNGs match
their baseline hashes. The whole-build number comparison differs only on
increases/index.html, removing the expected dates and repeated year labels
from the shortened next-year notice.

Local checks: initial unit run 347 passed with nine built-page checks deferred;
post-build rerun of all eight conditional built-page test files, 38 passed and
none skipped. Astro check had zero errors, warnings or hints. Full image build,
distribution checks for 909 pages and 908 sitemap URLs, and the text sweep passed.
All 404 browser tests passed. Production CSP: 94 passed initially; two existing
budget scenario tests timed out during a 1.9 hour execution gap and both passed
an isolated one-worker rerun without changing limits or assertions. Remote CI
subsequently passed independently. The missing pinned Chromium was installed.

Local evidence remains under .ops/ and output/playwright/ in the review
worktree, including baseline HTML, preservation results, PNG hashes, the number
comparison, screenshots and the initial CSP failure traces. Owned preview and
browser sessions were stopped. The worktree is retained for review.

## Resume

1. Read the PR and its current checks; the status above is an archive snapshot.
2. Review/merge only when Tom instructs it. This archive request did not
   authorise a merge or deployment.
3. Round two prompt 2 is the UK Council Tax Estate Kit 0.5.0 upgrade. Its brief
   requires prompt 1 to be merged first. Do not repeat session 1 or start the
   upgrade from the stale main checkout.

The main checkout at ~/ukcounciltax remains behind origin/main.
Its pre-existing CLAUDE.md edits and HANDOFF-2026-11-12-SESSIONS-COMPLETE.md
were preserved. This archive note and its added CLAUDE.md pointer are saved
locally there, not committed or pushed. A second copy is in the review
worktree's ignored .ops/ directory. AGENTS.md remains a symlink to CLAUDE.md.
No worktree or branch was removed.
