# Handoff | small faults session ready for review | 13 November 2026

## Outcome

Tom asked to inspect UK Councils and UK Council Tax and complete the next
prepared session. He explicitly approved merging UK Council Tax PR 65 and
UK Councils PR 49, then continuing. Both prerequisite releases were merged
at their checked heads, deployed successfully and verified live.

- UK Council Tax PR 65: merge `d7c151c1fd5bdff9b3c0f8bc0924a96d4ffa7144`.
  Successful production run:
  https://github.com/tompickup23/ukcounciltax/actions/runs/43426163952
- UK Councils PR 49: merge `556f69284a244fd230ed9ff300d3a6c794bb25fc`.
  Successful production run:
  https://github.com/tompickup23/ukcouncils/actions/runs/43426183494

Live verification and the implementation audit are recorded in
`docs/SMALL-FAULTS-2026-11-13.md`. Do not repeat these merges.

## Completed candidate

Round two prompt 3 in `docs/CODEX-PROMPTS-2026-11-12.md` is implemented as
https://github.com/tompickup23/ukcounciltax/pull/66

- Branch: `fix/nv7-small-faults`.
- Pushed implementation head: `eb2e8e584f0852c42f2a436d37c0b442c6820521`.
- Shared controls drive the nine English band tables; incoming profile links
  restore a validated council type without broadening monetary comparisons.
- Profile contents retain all links in four groups, in document order.
- Parish index retains all 214 rows, with council and region sorting and region
  filters. Financial columns are not ranked.
- Band and region pages have onward links. The existing 54 devolved finder
  entries were already complete and were left unchanged.

PR 66 is OPEN and mergeable with a CLEAN merge state at archive preparation.
All three checks, site, number diff and design check, passed for the head above.
The site job completed at 13:50:31 UTC on 13 November 2026.
Successful run:
https://github.com/tompickup23/ukcounciltax/actions/runs/43433783156

Local validation passed: 356 unit tests, 38 build-dependent rechecks, Astro
check, full image build, distribution and text checks, 67,291 internal link
destinations, 420 browser tests and 104 production-header tests. The whole-build
number diff is zero. All 2,845 PNG hashes match the baseline. All 909 pages
retain their marked figures, sources, table body rows, titles, H1s and canonicals.
Both themes were inspected at 375 and 1440 pixels; the pinned design checker
also passed all four page types.

## Resume

Review PR 66 first, refreshing its current head and checks. This chat did not
authorise its merge or deployment. The two prerequisite approvals do not cover
PR 66. The next UK Councils build is round two prompt 5, nearby and alike on
council profiles. That build was not started here. Preserve the split between
the bill site and the council site; do not repeat the completed small-faults work.

Other research and Estate Kit PRs were not changed. Refresh GitHub rather than
assuming an older handoff or local main reflects their state.

## Saved local state

Implementation, tests and release evidence are committed and pushed in PR 66.
This archive note and its CLAUDE.md pointer are saved locally, uncommitted and
unpushed, following the existing archive-handoff convention. Preserve them when
updating this checkout. AGENTS.md remains a symlink to CLAUDE.md.

Keep this worktree for PR review. The preview and browser verification session
were stopped. No worktree or branch was removed. Ignored `.ops/` contains the
saved baseline build and validation logs; `output/playwright/` contains captures.
Neither is needed to recover the committed implementation. Existing local edits
in the main checkout and UK Councils' untracked browser folder were left alone.

Tom requested saving, archive preparation and archiving this chat. Archiving
the chat does not merge the PR, deploy its candidate or remove the worktree.
