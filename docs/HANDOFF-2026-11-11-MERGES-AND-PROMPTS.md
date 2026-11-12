# Handover, 11 November 2026, 17:05 UTC | merges, the runner fault and its fix, the picker phone fix, six Codex prompts

Saved before archiving the Claude Code session that merged the picker and typed search, took three rulings from Tom, built the picker's phone fix and wrote the Codex prompts. It follows `docs/HANDOFF-2026-11-11-NAVIGATION.md`, which still holds the order of work.

Read `CLAUDE.md`, then this note, then `docs/CODEX-PROMPTS-2026-11-11.md`.

## 1. State at 17:05 UTC: what is live and what is in flight

Tom authorised each merge below in chat, and each had every check passing on its head.

| Repo | PR | Merge commit | Live |
|---|---|---|---|
| ukcouncils | 44, typed search | `993ed703f39fe5ea19e11987d55e04ee7134c028` | Yes. Published with the deploy of `7b61994`; `https://ukcouncils.co.uk/council-index.json` returns 200. The live search dialog was not typed into |
| ukcouncils | 45, the workflow fix | `7b619948afa7b50f44781f00ce095ef5c1d530ae` | Yes; deploy run 43058998922 succeeded |
| ukcounciltax | 55, the council picker | `ede167863f04f195384cf9e6dd537e99e9218651` | Not confirmed. Its own publish failed four times. It goes live with the publish of `3c8f547` |
| ukcounciltax | 57, the workflow fix | `3c8f547da1c97f3442be57ec146cbeb50fd6584a` | Publish run 43061689316 was in progress when this was written |

**The first thing to do:** `gh run view 43061689316 --repo tompickup23/ukcounciltax`. If it succeeded, confirm the live budget hub holds `data-council-picker`. If it failed, read which step; it should no longer be the Chromium install.

**The fault and the fix.** From about 15:15 UTC every run on both repositories failed while installing Chromium, before any site test: the runner could not resolve Ubuntu's package servers, and `playwright install --with-deps` gave up. GitHub's status page showed no incident. PRs 45 and 57 change each install step to fetch the browser on its own from Playwright's host, then try the system packages for three minutes and carry on with a warning if they cannot be fetched. This was tested under the fault: on PR 45 and PR 57 the warning fired and the browser suites and design check passed on the packages the runner image holds.

## 2. Open pull requests on ukcounciltax

Each merge is its own step after its checks are read.

| PR | What | State when written | Before merging |
|---|---|---|---|
| 56 | The picker's phone fix (decision W7) | Tom said "Stay and merge 56" in chat. Main was merged into the branch at 16:47 UTC so its checks run with the workflow fix. Number diff and design check passed; the site check was still running. Not merged | Read all three checks; ask Tom again, since the word was given to a session now archived |
| 51 | Pipeline speed | Checks passed on 10 November, before PRs 55 and 57 | It edits `release.yml`, as PR 57 did. Bring main into the branch, carry the new install steps across both places it has them, and read fresh checks |
| 53 | Round three handover | All three checks passed; clean | Nothing |
| 54 | The brief, the navigation handover, the prompts and this note | Main was merged into the branch earlier; later commits are documents only | Read the checks |

Suggested order: 56, 53, 54, then 51 after its merge with main.

**The first Codex session produced nothing.** Tom started prompt 1 (the ukcounciltax local links import). It stopped because the order table then said to wait for PR 56, and it was archived. No worktree, branch, commit or pull request exists from it in ukcounciltax, ukcouncils or Codex's own worktree folder. The table is corrected: prompt 1 waits for nothing. Prompts 1 and 2 are both ready to run.

## 3. Rulings Tom took in this session

All three are recorded in the brief, section 6 ("Accept all three", in chat):

- **W2.** The England map colours area Band D only on UK Council Tax and council type on UK Councils. Fixed classes from a registry, unknown drawn as unknown, England only.
- **W4.** Chart PNGs stay at 2x. The weight comes down by a light theme PNG only, palette compression where nothing visible changes, and no PNG for the per council locator map. Taken without byte counts; prompt 6 measures first.
- **W7.** No scroll inside the picker's table below 600 px. Built as PR 56: twelve rows, then a "Show all" button; the whole table in the page with scripts off.

Not ruled: the estate kit's decisions A to K (estate-kit PR 8). This session's view on each was given in chat only: agree with B, C, D, G, I and K; accept A provided the tax site drawings do not wait behind the grammar; E lifted from the UK Demographics map library; F provided tables keep lining tabular figures; H with a fallback; J with the England map and ranked bars first for the tax sites.

## 4. PR 56 in brief

Branch `fix/picker-phone-scroll`, two files: `src/components/CouncilPicker.astro` and `e2e/council-picker.spec.ts`. At 375 by 812 on a local build the budget hub is 2,836 px tall and the councils index 2,972 px, with no inner scroll and no sideways overflow. Local checks: type check, plain build, text check, 52 picker browser tests (five desktop tests timed out under load and passed on rerun), and two neighbouring specs. Not run locally: the full browser suite, the CSP suite and the dist check with images.

## 5. The Codex prompts

`docs/CODEX-PROMPTS-2026-11-11.md` holds six, with the order and what each waits for. Prompts 1 and 2 (the local links imports) wait for nothing and can run side by side. Four choices in them are this session's and Tom may change them: the monthly figure on compare is the annual difference divided by 12 and is not called an instalment; cross type comparisons are left as they are; prompt 5 runs ahead of the dossier's source line; and the two thresholds in prompt 6 (20 per cent for palette compression, a stop if the total saving is under half).

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

Worktrees in use: `~/wt/uct-picker-scroll` (PR 56; its preview server was stopped), `~/wt/uct-nav-brief` (PR 54). `~/wt/uct-ci-chromium` and `~/wt/ukc-ci-chromium` held the merged workflow fix and can go. `~/wt/uct-picker` and the baseline build `~/wt/uct-picker-dist-main` can go now PR 55 is merged, with Tom's approval. The main checkout was not changed and is behind origin.

## 10. Resume prompt

```text
Read CLAUDE.md and docs/HANDOFF-2026-11-11-MERGES-AND-PROMPTS.md in ukcounciltax (origin/main if PR 54 has merged, otherwise the branch docs/navigation-visuals-brief). First check whether publish run 43061689316 on ukcounciltax succeeded and whether the picker is on the live budget hub. Then read the checks on ukcounciltax PRs 56, 53, 54 and 51 and tell me which are ready; I said on 11 November to merge 56, but ask me again before each merge. Look for pull requests from Codex on both repositories and review any you find. Then tell me which Codex prompt in docs/CODEX-PROMPTS-2026-11-11.md can start. Do not tag or deploy without my word.
```
