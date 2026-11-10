# Handover, 10 November 2026 (evening) | D5 and D6 built, the order of what follows

Saved before archiving the Claude Code session that checked the state of both tax sites and the Estate Kit, then built D5 and D6. Nothing in this note authorises a merge or deployment; Tom authorises those in chat.

Read `CLAUDE.md`, then `docs/HANDOFF-2026-11-10-DESIGN-AND-SPLIT.md` (the direction and the rules), then this note. Run `gh pr list` on ukcounciltax, ukcouncils and estate-kit before writing anything.

## 1. State when written

| Repo | Main | Open pull requests |
|---|---|---|
| ukcounciltax | `9a6de15`, green, live | 48 (D5 and D6), and the pull request that carries this note |
| ukcouncils | `a4d21e5`, green, live | none |
| estate-kit | `332d689`, green | none. 0.4.0 is merged and not tagged; the latest tag is `v0.3.0` |

Everything listed as open in the earlier handover of the same day has merged: ukcounciltax 46 (A3) and 47, ukcouncils 37 and 40. UK Council Tax vendors kit 0.3.0. UK Councils does not vendor the kit. ukdemographics PR 155 (L2, the tax site links on place pages) is still open.

## 2. Pull request 48: D5 and D6

Branch `feat/design-round-two`, worktree `~/wt/uct-round-two`, head `abfa0ab`.

- D5: the empty grid beside the budget game opening is replaced by a rail naming each round (five stops with a county, four without). No published split before round one (decision S3).
- D6, `/council-tax/ranked/`: five position strips, one per class. The kit's strip needs a value to mark, so each marks the average MHCLG publishes for the type (Table 7; Table 2 for county councils). All five averages lie inside their class's range. Tom has not ruled on that choice.
- D6, `/council-tax/`: the England average as the lead figure, the four area types as one table, the history table in a closed drawer.
- D6, `/councils/`: area Band D beside each of the 296 names, one source line per region.

Local gate on Node 22, all passed: check, the build with share images, 309 unit tests, the dist check, the text check, 250 browser tests, 89 CSP tests, the design check before and after at 390 and 1440 in both themes, captures looked at by eye. Obsolete assertions were replaced in their own commit (`d59f63b`).

CI when written: design check passed, number diff passed (290 pages differing, none outside the allowed list), site still running. On 10 November Tom wrote "Do the merge now if that's sensible"; it was not merged because the site check had not reported. The next session reads `gh pr checks 48` and confirms with Tom before merging, as its own step.

## 3. Order of what follows

One writer per repository, so the three repos run at the same time.

| Lane | Who | When | What |
|---|---|---|---|
| ukcounciltax | Codex | After PR 48 merges | Pipeline speed, prompt in `docs/PLAN-2026-11-10-EXECUTION.md` section 8.6 |
| ukcouncils | Claude Code | Now | Dossier part two, as two pull requests: structure first (headlines, drawers, three actions), then the short source line on its own, after kit 0.5.0 |
| estate-kit | Claude Code | Now, in parallel | 0.5.0: source printed once, short source line, summary row of stat tiles, body names from the data |
| ukcounciltax | Claude Code | After pipeline speed merges | One small pull request: the A3 section order follow up (needs Tom's yes) and the kit re vendor |

Priorities in order: the dossier (it gates the reversal and is due on all 296 pages by mid January 2027); measurement; pipeline speed; the kit and its adoption; new tax site features (the receipt, the band check); levels day staged by mid January. Not yet: the "balance the budget" exploration, D4 and D2 on ukcouncils.

Waiting on Tom, none blocking a build: merge PR 48; tag estate-kit `v0.4.0` (the sites vendor by tag); submit the sitemap in Search Console (the reversal needs its evidence, and nothing is judged on under two weeks of data); rule on chart image weight; say whether merged worktrees in `~/wt` can go; rule on the A3 section order.

The date nearest: the UK Places link check in December, because `src/lib/council-links.ts` fails every build from 4 January 2027.

## 4. Notes from the build

- Two unit tests read `data/raw/RA_2026-27_data_Part_1.ods`, which is ignored by git. A new worktree needs `data/raw/` copied from another (`~/wt/uct-profile/data/raw/` has it), or those tests fail with a missing file.
- A kit chart on any page needs its chart actions and a PNG in each theme, or the dist check fails. A new chart therefore needs a name in `src/lib/kit-charts.ts` and a route under `src/pages/og/charts/`.
- `tests/fixtures/c1b-static-numbers.json` pins every number on three game pages. Any visible number added to the game page changes it; confirm the difference is only the intended one before updating it.
- The Astro preview is a daemon and outlives the command that started it. A second `astro preview` on another port exits at once, saying one is already running. Use the running one with `E2E_BASE_URL`, and stop it afterwards with `npx astro preview stop`.
- The number diff needs a main build as its baseline. CI makes a fresh one; locally, a worktree whose source matches main will do as a first look.

## 5. Local state

Worktrees from this session: `~/wt/uct-round-two` (PR 48; keep until it merges) and `~/wt/uct-handoff-1110b` (this note). Design check captures are in `~/Documents/design_checks/` (folders stamped 20261110T1629 and 20261110T1630). The main checkout `~/ukcounciltax` is still far behind origin with two untracked copies of documents now on main; delete those two before pulling.

## 6. Resume prompt

```text
Read CLAUDE.md, docs/HANDOFF-2026-11-10-DESIGN-AND-SPLIT.md and docs/HANDOFF-2026-11-10-ROUND-TWO.md in ukcounciltax (origin/main). Run gh pr list on ukcounciltax, ukcouncils and estate-kit and say what is open. If PR 48 is open, read its checks and ask me before merging. Then take the lane I name from section 3 of the round two handover. Do not merge or deploy without my word.
```
