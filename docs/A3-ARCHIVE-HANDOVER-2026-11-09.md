# A3 archive handover | 9 November 2026

A6 is merged on origin/main at 3e03057. The requested branch was rebased successfully. Node v22.23.4 was used. The gitignored RA and SG workbooks were copied only where absent.

Phase 1a is committed as 0a1f3b0. Its test passes: 296 band series, 296 area values, class sizes 164, 63, 36 and 33, and Burnley 2549.42. Phase 1b is unfinished and saved in the local archive checkpoint containing this handover. This checkpoint is not a passing implementation. Complete and amend it only after the stop condition has been resolved.

## Stop condition

The binding brief section 12 says to stop if a kit gate refuses a chart for a reason the brief does not foresee.

The required Camden bill chart fails the unchanged kit in light hex mode:

```
QA failed for BillAnatomy council.camden.bill.total inline:
  text overlaps: "Camden council, including average local precepts" and "£1,697.04"
```

The own part label follows phase 5b exactly. No fallback for this overlap is specified. No vendor file, source hash or test tolerance was changed.

Reproduce from this worktree with Node 22:

```
npx vitest run tests/profile-charts.test.ts
```

Results: registration and Burnley chart tests pass; the full two-theme sweep stops on Camden. Full output: profile-chart-gates.log in this directory.

## Baseline

The pre-implementation build passed with 909 HTML pages, 2056 files and 198408704 bytes. Burnley's HTML is 98342 bytes. Its saved build is before-dist in this directory. The file and size counts include A6, whereas the brief's baseline predates A6.

Both pinned import hashes match. The UK Places source is at the brief's path. The UK Councils source is present in /Users/tompickup/wt/ukc-links-template/data/elections/next-elections.json and has the pinned hash. Neither source was changed or refetched.

## Decisions taken

Follow A6's site ChartActions and preserve the budget page's BandSelector default behaviour. The user prohibits editing budget routes, so phase 9's budget strip insertion must remain outside this task unless that constraint changes. The user's phases 1 to 11 and PR title take precedence over the brief's additional phase 12 and alternative title.

No preview was started. The full final gate, number comparison, captures and design check have not run because implementation stopped at phase 1b. Nothing was pushed, merged or deployed, and no PR was opened.

## Resume instructions

Work only in `/Users/tompickup/wt/uct-profile`, branch `feat/profile-home-overhaul`. Read `CLAUDE.md`, `docs/A3-PROFILE-BRIEF.md` and this handover before resuming. Preserve the existing worktree and ignored evidence. No preview or task process remains running.

The required next input is a resolution of the unforeseen bill label overlap. Do not shorten the binding label, change the vendored kit, weaken a gate or continue later phases without that resolution. The existing full sweep fails at Camden before inspecting the remaining charts.

The checkpoint includes phase 1b chart registration, shared profile options, the neighbour-area adapter and the profile PNG route, plus its failing gate test. It also includes the unchanged existing chart route's narrowed home-card type. Phase 1c and all subsequent implementation remain outstanding. Phase 1a was tested independently before committing; no complete Astro check has run on the unfinished phase 1b code.

Local evidence and baseline: `output/playwright/a3/`. Keep these ignored. The original stop report, baseline build log, dependency-install log, full chart gate failure log and `before-dist/` remain there. RA and SG workbooks remain ignored under `data/raw/`. No source JSON was refreshed.

At completion, use the user's requested PR title: "Council profiles: band table, history, bill breakdown, position, map, how to pay, network strip (A3)". Include the brief's per-phase evidence and the user's complete check suite and capture requirements. Do not merge or deploy.

The archive checkpoint is local only. No PR has been opened and no push has been made. The user requested saving and archiving this chat after the stop report.
