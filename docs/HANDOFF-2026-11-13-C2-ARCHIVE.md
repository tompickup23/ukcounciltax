# C2 pilot archive handoff | 13 November 2026

Note added the same evening: the worktree named below was emptied when the chat
was archived, with this work still uncommitted. It was recovered from Codex's
archive snapshot `8ad8b53`, applied to main `bcde00c` without conflict and pushed
as a draft pull request on `feat/budget-freeze-pilot`. Resume from that branch.
The rest of this note is as written at archive.

Tom requested saving the work, preparing a handoff and archiving this chat.
All implementation and reports are saved locally. No commit, push, PR, merge or
deployment was made. Preserve this worktree and its uncommitted files.

## Resume location

- Worktree at archive: Codex's managed `uct-budget-pilot` worktree, since removed.
- Branch: `feat/budget-freeze-pilot`
- Starting commit: `d7c151c`
- Main record: `docs/C2-PILOT-2026-11-13.md`, including the production brief and
  full verification results.
- Coverage manifest: `docs/C2-COVERAGE-2026-11-13.json`.

Read CLAUDE.md first. AGENTS.md remains a symlink to it. Reuse this worktree;
the implementation is not committed and is not in the main checkout.

## Completed

Built separate local budget-freeze pilots for Burnley and Blackburn with Darwen.
Players can change own council tax and eligible net service spending, see an
exact remaining difference, check referendum boundaries, reset and copy a
sourced scenario. Fixed funding and modelling limitations remain explicit.
The public site's routes and existing games are unchanged.

The source audit verifies seven raw file hashes. The original research replay
matches. The stricter arithmetic/component/notes screen passes 178 of 296
authorities; this is not a release-ready coverage figure.

Final checks passed: 379 unit tests across 56 files, 36 production CSP browser
tests, Astro check with no diagnostics, BUILD_OG=1 production build, distribution
checks for 909 pages, text sweep, separate pilot build and source audit. Pilot
browser checks covered both councils, phone/desktop, both themes, axe, scenario
journeys, keyboard adjustment and no-JavaScript content. Detailed logs remain
in ignored `.ops/`; screenshots remain in ignored `output/playwright/`.

## The unresolved GBP 800 issue

Burnley's 2026/27 RA return prints parish precepts of GBP 222,000; Council Tax
Table 10 prints GBP 222,800. The RA return is in whole thousands, but GBP 222,800
would ordinarily round to GBP 223,000, not GBP 222,000. The overall council-tax
requirements differ by only GBP 26. This is an unexplained source-component
mismatch, not evidence of missing money. Do not invent a rounding explanation
or adjust either official source.

The pilot holds parish funding fixed. Its own-council tax-freeze calculation of
GBP 168,049.42 does not use that disputed parish amount. Burnley remains excluded
from public C2 release pending review. Blackburn's component check passes, but
its pilot still requires product review and release preparation.

## Next session

Investigate source definitions, revisions, Burnley's published budget and the
individual parish precepts to reconcile the component difference or document
an evidence-based exclusion. Then prepare a small verified release cohort,
starting with Blackburn, with authority/year-specific referendum rules.
Follow the six-stage production brief in the main record. Reserves, demand
shocks, service consequences and multi-year simulation require further research.
Publication requires Tom's explicit instruction.

## Preview

With the repository's Node 22 environment and dependencies installed:

```sh
npm run build:pilot
npm run preview:pilot
```

Routes: `http://127.0.0.1:44427/burnley/` and
`http://127.0.0.1:44427/blackburn-with-darwen/`. A preview was running at handoff;
it is temporary and may need restarting after the chat is archived. The build
requires the seven verified originals retained in ignored `data/raw/`.
