# Prompts | W2 and the Opus fast track option | 16 November 2026

Written in Claude Code (Opus) at main `810be18`, after PRs 88, 91, 92 and 93 went live on 15 November 2026. A prompt never authorises a merge, tag or deployment unless it says Tom has given that yes.

## What changed since the 15 November prompts

- W1 (PR 93) merged after a review fix pass: the hub picker stays on the first phone screen, the exclusion reason sits under the doors with a label, no Set mode link where Set is not offered, the Guess door starts the game.
- Lessons from the Codex runs, now written into the W2 prompt: create the worktree explicitly; copy `data/raw/*.ods` into it; the design check needs exact headings and fenced blocks in the PR body; do not weaken an existing test to fit the change; do not edit `docs/STATE.md`; compress committed captures; read referendum limits only from held, sourced data.
- Prompt 7 (W3) and prompt R in `docs/PROMPTS-2026-11-15-W1-W3-AND-TOWNS.md` still stand.

## W2: set page workbench, part 1, layout and controls (Codex)

```text
Repository tompickup23/ukcounciltax. Work in a git worktree, not the main checkout at ~/ukcounciltax and not a Codex managed worktree:
  cd ~/ukcounciltax && git fetch origin && git worktree add -b feat/w2-set-workbench ~/wt/uct-w2 origin/main && cd ~/wt/uct-w2
Before starting, check that W1 has merged: git log origin/main --oneline -5 must show 810be18 "W1: open the budget Guess and Set doors (#93)" (or later). If not, stop and say so. A fresh worktree lacks the gitignored raw files: copy data/raw/*.ods from ~/ukcounciltax/data/raw/ into ~/wt/uct-w2/data/raw/ before running tests. Then npm ci.

Node 22.23.4 first on PATH: export PATH=~/.nvm/versions/node/v22.23.4/bin:$PATH. Python by uv run only. British English; no em dash, en dash or spaced hyphen anywhere, including JSON, tests and the PR body. Stage named paths only (never git add -A or git add .). Never bypass the pre-commit hook. One PR, draft until every gate is green. Do not merge or deploy. Do not edit docs/STATE.md; it is replaced in its own docs PR.

Another session may be building the towns league table at the same time on feat/towns-pages. Do not edit src/lib/site.ts, src/lib/paths.ts, the header, nav or footer components, llms.txt, or anything under src/pages/council-tax/ or src/pages/precepts/. If W2 truly needs one of those, stop and say why.

Read first: CLAUDE.md, docs/STATE.md, docs/DESIGN-AUDIT-2026-11-15.md (finding "Set page is a document of caveats, not a tool", workstream W2 and its gates, decision D10), src/pages/tools/budget/[slug]/set.astro, src/components/BudgetModes.astro (W1 put the Guess and Set mode links at the top of the set page; keep them), src/scripts/budget-freeze.ts, data/pilots/budget-freeze*.json, tests/budget-set.test.ts.

Tom's decision D10, 15 November 2026: option (a), one or two presets (for example "Raise to the referendum trigger"), each labelled as a user requested scenario with its assumptions and the budget-freeze model version.

Figures rule: every amount shown has its source or calculation nearby. The referendum trigger marks and any preset that uses them must read the limit for that council from data already held in the repository with its source (publisher, document, date). Search data/ for it first. If a council's limit is not held from an official source, show no trigger mark and no trigger preset for that council, with a short note; never hard code or estimate a percentage. Unknown is not zero.

Scope: controls in the first screen of /set/. A compact hero with a three-cell result board and the published starting figures as source lines; assumptions folded into "How this exercise works" with a visible summary, scenario label and model version; service cards with the pound value, a change chip, a 0.5% range with the published tick, steppers of at least 44px, percentage chips, exact-pounds entry and a source disclosure, aria-valuetext in pounds; the tax control with the published charge and referendum trigger marks; the theme toggle kept and restyled as a small icon; the ledger closed by default; the D10 presets, which give the 16 frozen-charge councils something to do on arrival.

Gates (audit W2), all run and reported with their actual output:
- Arithmetic in 1/10000 pound units unchanged, with unit tests; logic only in src/scripts/budget-freeze.ts, no inline script.
- chromeProblems and tests/budget-set.test.ts green (one memory-only theme button).
- Without JS the baseline, assumptions, ledger and noscript notice stay readable.
- Debounced live region; forced-colors rules; 375px no horizontal overflow; axe clean.
- Desktop page under 3,000px tall (now about 8,700px); CLS at or below 0.1.
- npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, npm run test:csp. On this Mac some existing unit tests time out at the default limit; if so, rerun with npm test -- --testTimeout=120000 and say so. Do not change any timeout setting in the repository.
- Browser suite. Local trap: astro preview detaches, so start npx astro preview --host 127.0.0.1 --port 44321 yourself, run with E2E_BASE_URL=http://127.0.0.1:44321, then npx astro preview stop. Playwright stays pinned at 1.65.1; do not upgrade it. Do not weaken an existing test to fit the change; if one must change, say exactly why in the PR body.
- Screenshots at 390 and 1440 wide, light and dark, of /tools/budget/leeds/set/, /tools/budget/hyndburn/set/ and one frozen-charge council's set page. Commit them under docs/w2-set-workbench/ compressed (halve 1440 captures, 128 colour PNG); keep the folder under 4 MB.
- Number diff against main with the allowed pages listed.

PR description: the CI design check reads it, and every edit reruns the whole check (about 22 minutes), so write it correctly before opening. It must contain "## Pages to capture" followed directly by a fenced text block of site paths, one per line (for example /tools/budget/leeds/set/), and "## Pages allowed to differ" followed directly by a fenced text block of built file globs (for example tools/budget/*/set/index.html), not site paths. Do not edit .github/design-check/ or .github/scripts/design-review.mjs; they are hash pinned. Include page heights before and after, the number diff line, the gate results, the screenshots, which councils have a referendum trigger mark and the source used, and the line "Built with Codex from a prompt prepared in Claude Code."

When the PR is green, stop and report: the PR number, the gate results, and anything you could not run.
```

## The Opus fast track option (for Tom's review; not authorised)

Asked by Tom on 16 November 2026: is it faster to use Opus sessions without the Codex review and Tom's merge steps? Tom will review this plan in a later session, after the current UK Councils and UK Council Tax sessions have finished. Nothing here is authorised yet.

### Where the time goes per step (observed on 15 November)

| Part | Time | Removable |
|---|---|---|
| Build | 1 to 2 hours | No |
| Review and fix pass on a Codex PR | 45 to 60 minutes | Yes: Opus reviews its own diff with /code-review at high as it works. PRs 91 and 93 both needed a fix pass. |
| Waiting for Tom's merge yes | minutes to overnight | Yes, with a standing permission |
| CI on the PR | about 20 minutes | No |
| Publish after merge | about 20 minutes | No; one publish at a time |

### Estimates

- Set page (W2 then W3) in one Opus session, merging each on green: about 4 to 5 hours, against 6 to 8 plus reply time.
- Whole restyle (W2 to W10) with two or three Opus sessions on disjoint files, each merging its own PR: about 1.5 to 2.5 days, against 3 to 5. Most of the gain comes from running sessions side by side.
- W5 (header, drawer, footer) and W8 (skin and tokens) touch every page and must run alone. W4, W6, W7 and W9 can run side by side once their files are disjoint. W4 (budget game page) can run beside W2 and W3 (set page).

### The standing permission it would need

Tom's instructions say to ask before publishing or deploying, and every merge publishes. The fast track needs Tom's words, for example: "Opus sessions may merge and publish their own restyle PRs (W2 to W10) when all checks pass." Each session would still:

- merge only with all three checks green and the number diff within its PR's allowed pages;
- never merge during another publish run;
- run /code-review at high on its own diff before merging;
- check three live pages after the publish and report;
- not merge, and ask Tom, if the PR changes any published figure or data source.

The trade off: no human look at the design before it is live. Self review catches most bugs but is weaker on taste calls (the W1 hub picker order was caught only from screenshots). Tom could check live pages after each merge and send fixes instead of approving first.

### To prepare if Tom agrees

Prompts for W2 to W10 written for Opus, in an order that keeps sessions out of each other's files, each carrying the merge rules above.
