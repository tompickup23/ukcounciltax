# Archive handoff | the bill as a bar (NV10) | 14 November 2026

Written in Claude Code before this chat was archived at Tom's request. The current plan is still `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` (section 6 is on PR 73, not yet merged).

## What this session did

Session 5 of the plan: the bill as a bar on `/precepts/` and in the local bill tool, using the kit's existing `BillAnatomy`. It is saved as **PR 75**, branch `feat/bill-bar-nv10`, commit `bbd9c9a`, pushed. Worktree kept at `~/wt/uct-bill-bar` (clean; `data/raw` there was copied from `~/wt/uct-ci`).

- `/precepts/`: the dot list under "Where your council tax goes" is now the homepage's Burnley drawing (`home-bill`), so no new image. The calculation lines stay under it.
- Local bill tool: draws the chosen locality and band with the kit in the browser (`src/lib/local-bill-chart.ts`), above the existing table.

Local results at that commit: build with `BUILD_OG=1`, 380 unit tests, type check, dist check and text check all passed; 48 focused browser tests passed at 375 and desktop. Not run: the full browser suite, `npm run test:csp`, dark theme and 1440 by eye. GitHub checks had only just started when this note was written, so read them before anything else.

## Two points the PR asks a reviewer to weigh

1. The tool's bar has no PNG and no chart actions, because it is drawn after a choice (72 locality and band pairs).
2. `scripts/check-dist.mjs` sets aside one exact string in built scripts: Estate Kit's own dash guard pattern, which ships in the tool's script once the kit draws in the browser.

If Tom does not want either, the fallback is to build the tool's bars at build time, at the cost of page weight or 72 images.

## Recommendations put to Tom on 14 November, none confirmed as taken

Tom said "Proceed" after these were listed, which started session 5. No merge was made on that word, because merge permission is given one PR at a time.

- X3: settle the Actions billing and keep estate-kit private (it carries Council Intel skins). Only Tom can do it. It unblocks kit sessions 3 and 4, the critical path to levels day by mid January 2027.
- X1: two new forms only, ranked bars then the linked area map.
- X2: the generic C2 freeze tier after levels day, not December.
- Merge, each on Tom's yes: PR 74 (green), PR 73 and ukcouncils PR 53 (documents).

## Open pull requests on ukcounciltax

75 (this), 74, 73, 68 (draft, C2 pilot), 61. PR 71 (the Burnley budget game) merged at 02:38 UTC on 14 November, though section 6.2 of the plan still lists it as open.

## What is next

1. Read PR 75's checks; fix or hand to Tom for a merge decision.
2. ukcouncils session 6: state what remains of the dossier on all 296 profiles, then build it. It waits for nothing and needs a chat opened in the ukcouncils folder.
3. Housekeeping left from session 2: `docs/STATE.md` in each repository, and the local main checkouts fast forwarded (this checkout is far behind and holds untracked notes that must be kept).
4. Once X3 is settled: estate-kit session 3 (CI, then kit PR 9), then kit 0.6.0.

## Traps met

- A new worktree needs `npm ci` and `data/raw` copied from `~/wt/uct-ci/data/raw`. If `data/raw` already exists, `cp -R` nests it; copy the files, not the folder.
- A stray `astro preview` from a Playwright run can hold port 44321; `npx astro preview stop` clears it.
- Any text holding a hyphen between spaces, even inside a pattern in a script, fails `tests/site.test.ts`.
