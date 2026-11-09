# Budget game programme | handover, 9 November 2026

Written by Claude Code at about 00:15 on 9 November 2026, before Tom archived the planning session ("Budget game for every council", 8 to 9 November). The next session, possibly in Fable, picks up from here. Read this first, then `docs/CODEX-SESSIONS-BUDGET-GAME.md` (the queue, lanes and efficiency rules) and `docs/D5-BUDGET-SEASON-2027.md`.

## The goal

A neutral budget game for every English council on ukcounciltax.co.uk (register row I001), built from MHCLG's RA 2026/27 returns. The method: Claude prepares sources, notes and briefs; Codex builds; Claude reviews; Tom merges, and merging deploys.

## State at handover

### Running in Codex when the planning session ended (Tom will review both)

| Session | Worktree and branch | Last seen |
|---|---|---|
| C1, the budget game | `~/wt/uct-budget-game`, `feat/budget-game-i001` | Phases 1 to 3 committed (game rounds `0ee7a24`, 23:58). Phase 5 work uncommitted (10 files): release notes, methodology, browser and CSP specs. Built-site, dash and link checks had passed; browser tests were running. No PR yet. |
| C4, spend per resident | `~/wt/uct-per-resident`, `feat/per-resident-i124`, stacked on C1's local branch | Phases 1 to 3 committed (`04fed15`). It must **not** push until C1 merges, then rebase onto main (`--onto` if C1 is squash merged) and open its PR. |

Brief for C1: `docs/PLAN-2026-11-08-BUDGET-GAME.md` on its branch, especially "Review decisions, 8 November 2026", items 1 to 9. Binding data notes: `docs/BUDGET-GAME-SOURCE-NOTES.md`. C1's own handover: `docs/HANDOFF-2026-11-08-BUDGET-GAME.md`, untracked on its branch.

### Merged and deployed on 9 November 2026 (Tom's authority: "If you can do the merges now then do so if that is sensible")

| PR | What | Merge commit |
|---|---|---|
| burnleycouncil 1182 | AI DOGE budget extractor keeps every RA service line | `5a975f3` (deploy was still running at handover; check it) |
| aidoge-site 103 | Regenerated AI DOGE budget files: mismatched service splits 66 to 0 | `98e5526`, CI passed |
| ukcouncils 30 | Council profile sections (re-land of PR 26) | `287a398` |
| ukcouncils 31 | Exceptional Financial Support by year page (I007) | `e29c567` |
| ukcouncils 32 | No CSV downloads, no Asylum Stats links | `f0e2020`; this deploy carried all three and succeeded |
| ukcounciltax 25 | Session plan, D5 note, "Sources catalogue" label | `baf0f05` |

Checked live after the deploy: `https://ukcouncils.co.uk/exceptional-financial-support/` returns 200 with EFS figures; `https://ukcouncils.co.uk/councils/burnley/` has the profile sections and neither a CSV button nor an Asylum Stats link.

ukcouncils PR 13 was closed as superseded on 8 November (Tom: "Yes, close it").

## Decisions Tom made in the planning session (8 November 2026)

- ukcounciltax is the home of the game; UK Councils gets the observed figures only.
- "Band D only" for the bill round.
- "MHCLG only" for budget season 2027: no live February tracker.
- UK Councils: "AI DOGE links are fine"; "The footer link block is fine, no data downloads is optimal to start with"; "No asylum stats link for now". All applied in ukcouncils PR 32.
- Stop C1 after phase 2 for review (a choice Tom made in Codex); after review, continue.

Decisions taken by Claude and recorded in the briefs: the scenario round split into its own PR (C1b); the stop policy (stop only on source or security failures); no new sources from Codex; self-review before each PR.

## What is left before every council's game is live

1. **Review C1's PR (R1)** as soon as it opens: figures against the source notes, every round by keyboard at 375px, the real-header CSP test, the nine no-return pages, the seven note 4 pages and the DSG sentence on a county. Fix small issues on the branch; write a fix list for anything larger.
2. **Tom merges C1**, which deploys ukcounciltax.co.uk.
3. **Spot-check live:** `/tools/budget/burnley/` (two tier), a unitary, and `/tools/budget/coventry/` (no return).

Live then means 287 of the 296 billing councils with a game, the 21 counties reached through their districts, and nine councils with a notice until MHCLG's RA 2027/28 in June 2027 (C9): Castle Point, Coventry, Cumberland, Dudley, Epping Forest, Greenwich, Guildford, South Gloucestershire and Warwick.

## Next after live, in order

- **C4 follow-up:** rebase `feat/per-resident-i124` onto main, rerun the checks, push, PR. This is mechanical and Claude can do it.
- **C1b:** the scenario round. The starter prompt is in `docs/CODEX-SESSIONS-BUDGET-GAME.md`.
- **C3:** the UK Councils budget section. The brief is ready in `~/wt/ukc-budget` (`deb05ac`, local, not pushed). It starts once C1 is deployed; its other conditions (ukcouncils PRs 30 and 32 merged) are met.
- **January 2027: C6.** The levels day page, ranking card, precept day, and the year switch staged in advance (see D5, section 4). Prep is triggered by MHCLG's 2027-28 referendum principles report.
- **About 25 March 2027: R8**, the release day runbook in D5, section 5.

## Worktrees this programme created

| Path | Branch | State |
|---|---|---|
| `~/wt/uct-budget-game` | `feat/budget-game-i001` | C1, in use by Codex |
| `~/wt/uct-per-resident` | `feat/per-resident-i124` | C4, local only |
| `~/wt/ukc-efs` | `feat/efs-by-year` | merged (PR 31); safe to remove |
| `~/wt/ukc-tidy` | `chore/no-downloads-no-asylumstats` | merged (PR 32); safe to remove |
| `~/wt/ukc-budget` | `feat/council-budget-section` | C3 brief, local only |
| `~/wt/uct-docs-tidy` | `docs/budget-game-handoff` | this handover |

Ask Tom before removing any worktree.

## Loose ends noticed, not acted on

- UK Councils' `sisterLinks` skips UK Food Hygiene as "the private project", while UK Council Tax's guide says UK Food Hygiene has been public tier B since 6 October 2026. One of the two is out of date.
- UK Council Tax still holds CSV helpers (`src/lib/tax-export.ts`, `src/lib/national-export.ts`) used only by tests. They are harmless, and could be removed in a tidy.
- The ideas register (Reports PR 603, unmerged) should record I001, I007 and I124 progress once Tom merges it. Do not edit that register from these repos.
