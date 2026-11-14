# Archive handoff | browser reliability and PR 67 review

13 November 2026. Saved at Tom's request before archiving this chat.

## Completed

1. Live UK Councils and UK Council Tax reliability review: 47 final WebKit
   scenarios passed. The report is in UK Councils at
   `docs/WEBKIT-RELIABILITY-2026-11-13.md`, with evidence under
   `output/playwright/safari-reliability-2026-11-13/` in that original checkout.
   This was WebKit automation, not a physical iPhone Safari check.
2. UK Council Tax PR 67 reviewed at
   `ecaff3043f40b6cad10cc3d5eadf449cec3749d5`, against main `bcde00c`.
   No blocking findings or application edits. The complete report is
   `docs/PR67-REVIEW-2026-11-13.md` in this original checkout and in the managed
   `uct-review-67` worktree. Fresh checks passed: complete image build, 362
   unit tests without skips, zero Astro diagnostics, distribution and text
   checks, 72,249 links, 20 focused Chromium tests and 17 WebKit cases under
   actual headers. Hosted full suites passed 440 browser and 104 CSP tests.

At archive preparation PR 67 remains open at the exact reviewed head, with
all three hosted checks successful. Nothing was committed, pushed, merged,
tagged or deployed. These reports and continuation notes are saved locally.

## Evidence preservation

The review worktree has no application changes; its only untracked tracked-area
file is the review report. Ignored evidence has also been copied to the
original UK Council Tax checkout at
`.ops/archive-2026-11-13-pr67-review/`. The `checks/` and `browser/` directories
include the hosted reports, local logs, initial failed-test traces, successful
reruns, captures and replay script. `SHA256.json` records the copied files;
each copy was verified against its original. This backup survives removal of
the managed checkout. Both review reports are identical.

Owned browsers and servers were stopped; ports 44428 and 44429 were confirmed
closed. Existing original-checkout edits, canonical-plan staging and AGENTS.md
symlinks were preserved. The canonical UK Councils plan records both sessions.
No worktree was deliberately removed by this archive preparation.

## Resume

- Read the two completed reports rather than repeat either review.
- Refresh PR 67's head and checks before any merge. Merge and deployment still
  need Tom's instruction; archiving this chat authorises neither.
- The next correction is separate existing UKCT content: the live Burnley
  profile and current main still render the July registry note describing a
  `government-decided four-unitary model`. The same note is present in all
  14 Lancashire registry records. UK Councils explicitly holds that field.
  Follow its existing hold and source rules; do not invent replacement policy
  wording or hand-edit the shared registry. No correction was implemented in
  this chat and no new legal or policy position was asserted.
- PR 61's budget-freeze research and the map/chart and kit-gate decisions remain
  separate. This session did not authorise or implement them.
