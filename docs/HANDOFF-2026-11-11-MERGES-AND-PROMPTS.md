# Handover, 11 November 2026, 15:55 UTC | two merges not yet live, the picker phone fix, six Codex prompts

Saved before archiving the Claude Code session that merged the picker and typed search, took three rulings from Tom, built the picker's phone fix and wrote the Codex prompts. It follows `docs/HANDOFF-2026-11-11-NAVIGATION.md`, which still holds the order of work.

Read `CLAUDE.md`, then this note, then `docs/CODEX-PROMPTS-2026-11-11.md`.

## 1. The first thing to do: neither merge is live

Tom authorised both merges in chat. Each had every check passing on its head.

| Repo | PR | Merge commit | Publish |
|---|---|---|---|
| ukcounciltax | 55, the council picker | `ede167863f04f195384cf9e6dd537e99e9218651` | Run 43044691406. First attempt failed; second attempt was in progress when this was written |
| ukcouncils | 44, typed search | `993ed703f39fe5ea19e11987d55e04ee7134c028` | Run 43044735137. Failed twice; a third attempt was started at 15:54 UTC |

Every failure was the same and none touched the code: the GitHub runner could not resolve Ubuntu's package servers (`azure.archive.ubuntu.com`, `security.ubuntu.com`) while installing Chromium, before any site test ran. It is a fault on GitHub's side that was still happening at 15:42 UTC.

To check: `gh run list --branch main --limit 1` on each repository. If a run failed at "Install Chromium" or "npx playwright install" again, rerun the failed jobs with `gh run rerun <id> --failed`. When a run succeeds, confirm live: the budget hub on ukcounciltax.co.uk should hold `data-council-picker`, and `https://ukcouncils.co.uk/council-index.json` should return 200. Both returned nothing and 404 when this was written.

If the fault persists for hours, a later fix is to cache the Playwright system packages in the workflows. That is not started and needs Tom's word, since it changes the release pipeline.

## 2. Open pull requests on ukcounciltax

Tom said on 11 November 2026 to do the merges first "if sensible", to clear the way for the Codex prompts. None was merged, because the publish for PR 55 had not yet succeeded. Each merge is its own step after its checks are read.

| PR | What | State when written | Before merging |
|---|---|---|---|
| 56 | The picker's phone fix (decision W7) | Number diff passed. Design check failed on the same Chromium install fault. Site check still running | Rerun the failed job once the run finishes; read all three |
| 51 | Pipeline speed | All three checks passed on 10 November; clean | Merge only after one publish of main has succeeded on the present pipeline, so a pipeline change is not mixed with the runner fault |
| 53 | Round three handover | All three checks passed; clean | Nothing |
| 54 | The brief, the navigation handover, the prompts and this note | Main was merged into the branch (its number diff had failed only because it predated PR 55). Checks rerunning | Read the checks |

Suggested order once main publishes: 56, 51, 53, 54.

## 3. Rulings Tom took in this session

All three are recorded in the brief, section 6 ("Accept all three", in chat):

- **W2.** The England map colours area Band D only on UK Council Tax and council type on UK Councils. Fixed classes from a registry, unknown drawn as unknown, England only.
- **W4.** Chart PNGs stay at 2x. The weight comes down by a light theme PNG only, palette compression where nothing visible changes, and no PNG for the per council locator map. Taken without byte counts; prompt 6 measures first.
- **W7.** No scroll inside the picker's table below 600 px. Built as PR 56: twelve rows, then a "Show all" button; the whole table in the page with scripts off.

Not ruled: the estate kit's decisions A to K (estate-kit PR 8). This session's view on each was given in chat only: agree with B, C, D, G, I and K; accept A provided the tax site drawings do not wait behind the grammar; E lifted from the UK Demographics map library; F provided tables keep lining tabular figures; H with a fallback; J with the England map and ranked bars first for the tax sites.

## 4. PR 56 in brief

Branch `fix/picker-phone-scroll`, two files: `src/components/CouncilPicker.astro` and `e2e/council-picker.spec.ts`. At 375 by 812 on a local build the budget hub is 2,836 px tall and the councils index 2,972 px, with no inner scroll and no sideways overflow. Local checks: type check, plain build, text check, 52 picker browser tests (five desktop tests timed out under load and passed on rerun), and two neighbouring specs. Not run locally: the full browser suite, the CSP suite and the dist check with images.

## 5. The Codex prompts

`docs/CODEX-PROMPTS-2026-11-11.md` holds six, with the order and what each waits for. Prompt 2 (ukcouncils local links) waits for nothing in the code, but its PR cannot deploy until the runner fault clears. Four choices in them are this session's and Tom may change them: the monthly figure on compare is the annual difference divided by 12 and is not called an instalment; cross type comparisons are left as they are; prompt 5 runs ahead of the dossier's source line; and the two thresholds in prompt 6 (20 per cent for palette compression, a stop if the total saving is under half).

## 6. Where the budget game stands

Live: the game for English billing authorities (PR 26), the game as a game (PR 36), scenario mode (PR 39), the round rail and hub table (PR 48). Merged but not yet published: the picker on the hub and the way back from each game (PR 55). Not done: the "balance the budget" exploration (C2), still Tom's unmet first priority from the round five handover; the nine councils with no 2026/27 return until June 2027; levels day staged by mid January 2027.

## 7. Estate kit

CI fails on PRs 6, 7 and 8 because GitHub will not start jobs on the private repository: "recent account payments have failed or your spending limit needs to be increased". Billing is Tom's to fix. PR 6 is still a draft with a stale body. Kit 0.5.0 is not tagged, which holds the dossier's short source line and kit 0.6.0.

## 8. Traps from this session

- A new worktree lacks the ignored folder `data/raw/`; three budget unit test files fail until it is copied from another worktree.
- A Playwright start that fails leaves an astro preview daemon on port 44321 for that worktree. Use it with `E2E_BASE_URL`, then `npx astro preview stop`.
- In zsh a loop variable holding "repo number" is not split into two words; write each `gh` call out.
- Load on this Mac reached 41 with other sessions building; lone browser test timeouts passed on rerun with two workers.

## 9. Local state

Worktrees in use: `~/wt/uct-picker-scroll` (PR 56; its preview server was stopped), `~/wt/uct-nav-brief` (PR 54). `~/wt/uct-picker` and the baseline build `~/wt/uct-picker-dist-main` can go now PR 55 is merged, with Tom's approval. The main checkout was not changed and is behind origin.

## 10. Resume prompt

```text
Read CLAUDE.md and docs/HANDOFF-2026-11-11-MERGES-AND-PROMPTS.md in ukcounciltax (origin/main if PR 54 has merged, otherwise the branch docs/navigation-visuals-brief). First check whether the publish runs for ukcounciltax ede1678 and ukcouncils 993ed70 succeeded and whether both changes are live; rerun failed jobs if the failure is the runner's Chromium install again. Then read the checks on ukcounciltax PRs 56, 51, 53 and 54 and tell me which are ready; I said on 11 November to merge them if sensible, but ask me again before each merge. Then tell me which Codex prompt in docs/CODEX-PROMPTS-2026-11-11.md can start. Do not tag or deploy without my word.
```
