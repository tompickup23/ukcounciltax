# Handover, 10 November 2026 | Claude Code session (assessment, plan, merges, design programme)

Saved before archiving the chat. Nothing in this note authorises a push, merge or deployment; merging deploys and is Tom's.

## What this session did

- Assessed both tax sites (`ASSESSMENT-2026-11-09-TAX-SITES.md`) and wrote the session plan (`PLAN-2026-11-09-NEXT-SESSIONS.md`, sections 1 to 11) and the remaining plan (`PLAN-2026-11-10-REMAINING.md`).
- Reviewed, fixed and saw merged the budget game (PR 26, 85f7e33). The game is live at `/tools/budget/` for 287 English billing authorities with nine no return notices.
- Saw merged ukcounciltax PRs 27, 28, 29 and 30 (A1, social care spend per resident, reviewed on the PR) and ukcouncils PRs 33 (B1, with items 4 to 8 finished in Claude Code after Codex stopped) and 34 (the B1 review follow-up). All deployed and spot checked live.
- Corrected the B2 brief twice in `~/wt/ukc-front-door`: the profile intro stays after the council tax answer (first screen rule at 375px), and the quote suppression expression matches the hyphenated spelling (seven quotes withheld).
- Wrote the design programme (plan section 11) after a live look at the site and the game, and gave Tom the Opus design prep prompt.

## Running when this note was saved

- Codex lane A, `~/wt/uct-quick-wins`, branch `feat/brand-canonicals-nav`: all ten A2 items committed, gate running, PR not yet open.
- Codex lane B, `~/wt/ukc-front-door`, branch `feat/front-door-content`: items 1 to 5 of 10 committed, building on; PR not yet open.
- Opus design prep: estate kit 0.2.0 (accent, score card tile, small waffle) and the A5 and A6 briefs with mockups in a new worktree `~/wt/uct-face` (not yet created at save time). An addendum on UK Demographics components (BenchmarkStrip, ChartActions, DataDrawer, the map renderer) was pasted to it.

## Open PRs

None on either tax repo at save time. Since then A2 (ukcounciltax PR 32), B2 (ukcouncils PR 35) and kit 0.2.0 (estate-kit PR 3) opened, were reviewed and had their review fixes applied; all three wait only on CI and Tom's merge. See the remaining plan, section 0.

## Worktrees and briefs (all local, none to be removed)

| Worktree | Branch | Holds | State |
|---|---|---|---|
| `~/wt/uct-quick-wins` | `feat/brand-canonicals-nav` | A2 build | Codex running |
| `~/wt/ukc-front-door` | `feat/front-door-content` | B2 build | Codex running |
| `~/wt/uct-profile` | `feat/profile-home-overhaul` | A3 brief | to revise after A5 |
| `~/wt/uct-rankings` | `feat/rankings-parishes` | A4 brief and source notes | waits on decision 5 |
| `~/wt/uct-scenario` | `feat/budget-game-scenario` | C1b brief | after A6 |
| `~/wt/ukc-budget` | `feat/council-budget-section` | C3 brief, refreshed | after B2 merges |
| `~/wt/uct-per-resident` | `feat/per-resident-i124` | A1, merged as PR 30 | can be removed once Tom agrees |
| `~/wt/ukc-quick-wins` | `fix/b1-review-followup` | B1 follow-up, merged as PR 34 | can be removed once Tom agrees |

## Decisions waiting on Tom

`DECISIONS-WAITING-2026-11-10.md`, items 1 to 8 (item 7, cross estate inbound links; item 8, the reorganisation panel timing). Recommendations were given in chat on 10 November: accept the Open Council Data table with attribution; hold the 46 cycle years; hold Surrey; authorise the registry name refresh; rank Lewes with the note; supply the beacon token and Search Console; allow contextual inbound links from network sites.

## Lessons recorded this session

- Codex stops early on a stop condition and that is correct; read its implementation record, fix the brief, resume. It has stopped three times (B1 twice, B2 once); each time the brief was at fault, not the build.
- zsh: unquoted variables do not word split, `${x:+...}` expansions misfire, and a lowercase `path` variable clobbers PATH. Use explicit paths and other names.
- Astro 7 leaves a preview daemon running; Playwright's "web server exited early" means a daemon already listens; use E2E_PORT. The cached `npx --yes wrangler` can be stale.
- A brief's dry run must read every quoted source string for every spelling of a held word.

## Resume here

Read `CLAUDE.md`, then `PLAN-2026-11-10-REMAINING.md`, then check `gh pr list` on both repos and `git log origin/main..HEAD` in the two Codex worktrees before writing anything.
