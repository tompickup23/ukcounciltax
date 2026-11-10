# Handover, 9 November 2026 | round five: A4, A5 and A6 live, two Codex builds running, the balance the budget question

Saved before archiving the Claude Code session that ran R1, the merges of PRs 33 to 36, the design checker change and the A6 review. The next review session (Tom plans a Fable session) starts here. Nothing in this note authorises a merge or deployment; Tom authorises those in chat.

Read `CLAUDE.md`, then this note, then `docs/HANDOFF-2026-11-09-ROUND-FOUR.md` for anything older.

## First: explore the "balance the budget" mode in depth (Tom, 9 November 2026)

Tom's instruction: look into this first and explore it more deeply, before anything else in this note. The outline is section 6. That outline was written from a short look, so treat it as a starting point, not a conclusion. Go further:

- **The Lancashire game.** Read the separate Lancashire budget game's source (held privately; `template.html`, `content.json`, `game_data.json`, the README). List each mechanic (blocks, lines, dials, cards, reserves, delivery rates, unit costs, the council tax round), and for each one say what national data could feed it for every council, and what could not.
- **National sources, checked against the primary documents.** RA 2026/27 (which lines exist: services, financing, reserves, any income or fees); Table 10 and the tax base; the referendum principles report by class; Core Spending Power from the multi year settlement for 2027/28 and 2028/29; revenue outturn (RO) subjective analysis, for whether employee costs exist by council; adult social care finance returns, for unit costs. For each: publisher, table, edition, coverage of the 296, and what it is a count of.
- **Competitors.** Delib Budget Simulator and any council's own simulator: what players do, completion rates, what people share.
- **Design.** What the player decides, in which order; how the gap is framed honestly (the freeze start is one option); two tier areas; neutrality (no savings story, no party framing); what stays a labelled scenario under the site's scenario rule; how it sits beside the guessing game (a second mode, or the game's final round).
- **Effect on queued work.** Whether C1b is still worth merging if C2 goes ahead, and whether Codex session 2 should stop after the polish PR.
- **Output.** A source notes file and a dry run against the real data (the A4 and A6 pattern), then a C2 brief and a recommendation for Tom. Do not build before Tom decides.

## 1. What is live

| PR | Item | Merge commit | Checked live |
|---|---|---|---|
| 33 | A4: Band D ranked within each type of council, 214 parish precept pages | `608587b` | ranking and parish pages 200 with self canonicals; Burnley profile line; Castle Point singular wording; sitemap 908 URLs |
| 34 | A5: hero, bill card, task cards, kit 0.2.0 tokens | `7fd7133` | new homepage, `/og/charts/home-bill-card.png` 200 |
| 35 | Round four handover (docs) | `79fa7bd` | |
| 36 | A6: the budget game as a game, kit 0.3.0 | `3e03057` | `/tools/budget/<slug>/` opens with "Could you set <name>'s budget?"; `/og/budget/burnley.png` and the chart PNGs 200 |

The game is at `https://ukcounciltax.co.uk/tools/budget/<slug>/` (287 councils with a game, 9 with a no return notice).

After the A6 deploy reported success, `ukcounciltax.co.uk` served the old pages for about ten minutes while the deployment's own `*.pages.dev` address already had the new ones. Wait for the switch before calling a deploy broken.

## 2. Reviews done in this round, and what they found

- **R1, PR 33 (A4):** passed. Fix pushed as `5a12668` (13 single authority parish pages said "lists 1 local precepting authorities"). Follow ups went into the A3 brief, phase 11.
- **R1, PR 34 (A5):** passed. Fix pushed as `a39f72b`: `tests/vendor.test.ts` now runs `git check-ignore --no-index` over every vendored path, so a `.gitignore` gap fails locally, not only in CI. I diffed every number on all pages against a main build: only the homepage changed, and no value changed.
- **PR 36 (A6):** passed, nothing pushed. I reproduced the gate, the CSP suite, the Burnley anchors (district 0, 12, 29, 32 and 27; bill 14, 71, 11 and 4) and the design check. A number diff of all 909 pages against `79fa7bd` showed only the 287 game pages differ, with no money or decimal figure lost. Six visual follow ups are in the review comment on PR 36 and in the game polish prompt (section 4).

## 3. Design checker change (Tom approved, 9 November 2026)

`~/claude-config` commit `ab80018` on branch `feat/design-check-2026-11` (pushed, not merged into that repo's main; the checker runs from the working copy). The captures keep closed `details` drawers closed. After the captures, the runner opens every closed drawer, measures the figure rule again and restores the drawers, so a source that stays hidden with its drawer open still fails. The evidence line adds "(N inside M closed drawers, checked open)". 19 offline tests pass. Codex's earlier uncommitted draft (visible facts only) is part of the same commit.

## 4. Running now: two Codex sessions (ChatGPT app), started by Tom

| Session | Worktree and branch | Brief | Last commit seen |
|---|---|---|---|
| 1. A3, council profile overhaul | `~/wt/uct-profile`, `feat/profile-home-overhaul` | `docs/A3-PROFILE-BRIEF.md` (`b050be5`, binding) | `0a1f3b0` phase 1a |
| 2. Game polish, then C1b | `~/wt/uct-face`, `feat/game-polish`, then `feat/budget-game-scenario` rebased onto it | PR 36 review comment (polish items 1 to 6), then `docs/C1B-SCENARIO-BRIEF.md` (`b9bbfc6`, binding) | `3105773` touch icon |

Session 2's polish items: funding and reserves bars to at least half the drawing width using a recorded short display form (`formatValue(value, "gbp", 0, "short")`) with the add or deduct direction moved to the "You placed it" line; no outline box on programmatic focus; headings without the double colon and display full stop; no repeated table in the drawn source line; verbatim names kept and marked `data-dash-ok` in chart labels; a 180 by 180 Apple touch icon. Session 1 owns profiles, ranking pages, chart plumbing and `global.css`; session 2 owns the game files and the touch icon only.

Expect three PRs: A3; "Budget game polish"; "Budget game scenario mode (C1b)" (contains the polish commits, merges after the polish PR).

## 5. Review checklist for those PRs

The method used for PRs 33, 34 and 36, which caught real faults each time:

1. Rebuild in the PR's worktree with Node 22 (`export PATH="$HOME/.nvm/versions/node/v22.23.4/bin:$PATH"`), `BUILD_OG=1`: `npm run check`, `npm run build`, `npm test` (after the build, or built page tests skip), `npm run test:dist`, `npm run test:text`, `npm run test:csp -- --workers=1`. The gitignored RA and SG workbooks are in `~/wt/uct-rankings/data/raw`.
2. Read every anchor in the brief from `dist`, not from the PR body.
3. Build `origin/main` in a scratch worktree and diff every number in the visible text of every page (SVG text separately). Only the pages the brief changes may differ, and no published figure may disappear.
4. Design check: `uv run ~/claude-config/bin/design_check.py <worktree> --chrome "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --preview <url> --path ...` at 390 and 1440 in both themes. Astro allows one preview per worktree (`npx astro preview status` shows the running one). A first cold load can show LCP near 2 s; rerun before calling it a fault.
5. Look at the screenshots yourself (phone and desktop, both themes) for things no check catches: the A6 review found the bars too short and the focus box only this way.
6. Post one comment per PR: passes, blocks, follow ups. Fix small mechanical blockers on the branch as separate commits.

A3 specifics: the brief's section 0 asks Codex to follow A6's choices; check the profile number diff closely, since A3 moves figures between sections. C1b specifics: observed and scenario figures must stay visibly separate, with "User requested scenario | budget-scenario 1.0" on every result; check the section 6 dry run anchors.

## 6. Open question for Tom: a real "balance the budget" mode (C2)

Today's game and C1b both split a fixed total; neither sets a budget. The separate Lancashire game (held privately, not part of this site) does, from Lancashire's own budget papers: a gap, pressures, council tax with the referendum limit and 1% yield, reserves, dials and shock cards. The original plan ruled out a "close the gap" round (decision D4 in `docs/PLAN-2026-11-08-BUDGET-GAME.md`) because no national return holds a medium term gap.

What a C2 could do for all 287 councils from data the site already holds (RA 2026/27 service and financing lines, reserve balances, Table 10 tax base, the published Band D change):

- **Easy:** a council tax round from 0% to the referendum limit, with the yield calculated as tax base times the Band D change (Burnley: tax base 24,497 Band D equivalents) and new bills by band; start from a freeze, so the gap is what this year's actual rise raised (a labelled calculation, not a forecast); levers on each published service line and on reserves, with a running gap that must reach zero; reuse A6's rail, reveals, summary and cards. One new pinned source: the referendum principles by type of council.
- **Medium:** two tier choice (district, county or both); a 2027/28 round on Core Spending Power from the multi year settlement (an MHCLG measure that assumes the maximum tax rise; label it); class specific rules (adult social care precept, the district £5 option).
- **Hard:** the forward gap and its pressures (only in each council's own medium term plan), what a cut buys in units (council level unit costs), statutory minimums, shock cards and in year quarters.

The recommendation given: a C2 brief from the easy items. C2 would largely replace C1b, so consider stopping Codex session 2 after the polish PR if C1b has not started, or not merging C1b. Neither has been decided. The Lancashire game carries Reform material: no wording, framing or imprint comes across (as in the original plan).

## 7. Other open items

- **Unreviewed elsewhere:** ukcouncils PR 36 (C3 budget section) and ukdemographics PR 155 (L2), both green; prompts in the round four handover. Lower priority by Tom's steer.
- **Tom:** the beacon token and Search Console; the mark (R560) with K5; B4 D2 to D5; budget season 2027 questions in `docs/D5-BUDGET-SEASON-2027.md` section 3.
- **Unmerged docs branch:** `docs/handoff-2026-11-09-lane-c` (`3e17bfd`, the A3 and C1b brief session's handover) has no PR.
- **Worktrees:** merged and removable once Tom agrees: `~/wt/uct-rankings` (holds the gitignored workbooks; copy them first), `~/wt/kit-uct`, `~/wt/uct-docs-pr31`, `~/wt/ukc-front-door`, `~/wt/uct-quick-wins`, `~/wt/uct-docs-round5` after this PR.

## 8. Lessons

- **The Codex CLI is blocked on this Mac.** The npm binary is killed with exit 137 and deleted when it runs; it looks like a security control. Tom runs Codex in the ChatGPT app instead. Do not work around it. In the Claude sandbox, writes to the global npm folder land in an overlay that the real system never sees.
- **Check for duplicate sessions before starting one.** Tom pasted prompts into his own sessions while this session started the same jobs; the duplicates stood down without touching anything. List running sessions and the worktree's reflog first.
- **A brief whose every assertion is dry run lets Codex build design work.** A6 was planned as an Opus build and Codex built it well; the review still found what only screenshots show.
- **Diff every number on every page against main.** It is cheap, and it settles "no published figure changed" for the whole site rather than three fixture councils.
