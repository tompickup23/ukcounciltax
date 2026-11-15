# W1 budget doors | validation and archive handoff

Branch: `feat/w1-budget-doors`. Worktree: `/Users/tompickup/wt/uct-w1`. Base: `5bc7bed`, PR 88 merged. Number-diff baseline: `95e0d82`, current main after PR 91.

The source, tests, this record and all sixteen screenshots are saved in the branch. Local full logs and build output remain in the ignored `.ops/w1/` and `dist/` directories in the worktree. Astro development and preview servers have been stopped. The worktree is retained for review.

The pull request is draft and for review only. Do not merge or deploy. CI supplies a fresh complete browser run and the pinned design captures. The chat is to be archived only after those checks are green.

The budget game now offers Guess and Set as equal full-card links inside a desk hero, with the existing H1 text preserved through a span. Plain mode links connect the guessing and setting routes; Burnley also links to its council-gap scenario. The hub reuses PlayBand, displays the existing Leeds, Burnley and Camden OG cards, and gives eligible councils a clear Set column at phone widths. Eligible final score cards offer "Now set it yourself".

Burnley's helper entry goes to its separate scenario and retains its exact exclusion reason. None of the 99 excluded councils gains a /set/ route or link. Non-England codes return no entry. The other exclusion reasons remain exact. There are no added modelled figures or numeric door copy.

## Pages to capture
```text
/tools/budget/
/tools/budget/leeds/
/tools/budget/burnley/
/tools/budget/camden/
```

## Pages allowed to differ
```text
tools/budget/index.html
```

## Number diff

Compared the candidate with a fresh build of main at `95e0d82`, including PR 91:

```text
Summary: 1 pages differing; 0 pages added; 0 pages removed; 0 pages outside allowed globs.
```

The hub adds one occurrence each of `287`, `197` and `2026/27` through PlayBand. No published value changes. The C1b static-number fixture is byte-identical, with no fixture allowance. The game and face gate modules, design checker, design-review script, header template and dependency lock remain unchanged.

## Local gate output

Node 22.23.4. Raw ODS files copied into the Git worktree before npm ci. BUILD_OG=1 used for the final build, with the existing image cache enabled. The JavaScript Playwright lock remains 1.64.1; the design checker's Python pin remains 1.65.1.

```text
npm test before build: 66 files passed, 2 skipped; 758 tests passed, 124 skipped.
npm test -- --testTimeout=120000 after build: 68 files passed; 882 tests passed (241.05s).
npm run check: Result (343 files): 0 errors, 0 warnings, 0 hints.
BUILD_OG=1 npm run build: Indexed 1106 pages; csp: allowed 9 inline scripts in dist/_headers.
npm run test:dist:
  dist check: 318 mapped canonicals and 69 unique self canonicals checked
  dist check: 1107 pages point at a built share card
  dist check: 2207 chart PNG links resolve
  dist check: 1107 pages, 1106 sitemap URLs, all passed
npm run test:text: Text sweep: 1115 files, no dashes or pseudo-dashes outside verbatim body names.
npm run test:csp: 138 passed (10.6m)
Browser suite: 554 passed (17.9m); 2 old picker-placement expectations failed.
Picker-entry rerun after adapting the test to the W1 Guess door: 4 passed (7.2s).
Internal links: 84916 destinations checked, no missing local files.
16 full-page captures; no horizontal overflow.
BudgetGame script: 9706 gzip bytes; ceiling 14034.
```

All 556 browser cases have a passing local result. The two old hub checks expected the picker on initial load's first screen. They now follow the Guess door and retain the 375px viewport and 44px target assertions; the council hub keeps its original direct-entry assertion. CI runs the complete suite again. The new checks cover both themes, axe, overflow, card targets and eligible-only final-score links. Astro preview was started manually on 44321 with E2E_BASE_URL set, then stopped explicitly.

The default five-second unit limit caused timeouts in existing route, sitemap and chart-download checks on this Mac. The final full built-output run used a command-line 120-second limit and passed all 882 tests with no skips. No assertion or repository timeout configuration was relaxed.

The C2 distribution assertion now checks the exact entry text inside its containing Set card link, instead of requiring an inner anchor. It also checks a single entry and the absence of excluded Set links. This is the only gate adaptation beyond the picker placement test. The pinned budgetGameProblems and face assertions are unchanged and green, including H1, title, rail count, absence of a waffle before the first round, in-SVG sources, PNG actions, gzip ceiling and static OG cards.

## Screenshots

Full-page captures from the BUILD_OG=1 output, with reduced motion and fonts and images loaded. All sixteen files are attached in this branch.

| Page | 390 light | 390 dark | 1440 light | 1440 dark |
| --- | --- | --- | --- | --- |
| hub | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/hub-390-light.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/hub-390-dark.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/hub-1440-light.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/hub-1440-dark.png) |
| leeds | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/leeds-390-light.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/leeds-390-dark.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/leeds-1440-light.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/leeds-1440-dark.png) |
| burnley | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/burnley-390-light.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/burnley-390-dark.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/burnley-1440-light.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/burnley-1440-dark.png) |
| camden | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/camden-390-light.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/camden-390-dark.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/camden-1440-light.png) | [Capture](https://github.com/tompickup23/ukcounciltax/blob/feat/w1-budget-doors/docs/w1-budget-doors/camden-1440-dark.png) |

Built with Codex from a prompt prepared in Claude Code.

Review only. Do not merge or deploy.
