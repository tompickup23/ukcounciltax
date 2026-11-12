# Handover, 10 November 2026 (late) | billing, public repositories, merges, compare fixes, kit 0.5.0

Saved before archiving the Claude Code session that followed the round two handover. Nothing in this note authorises a merge, tag or deployment; Tom authorises those in chat.

Read `CLAUDE.md`, `docs/HANDOFF-2026-11-10-DESIGN-AND-SPLIT.md` (direction and rules), `docs/HANDOFF-2026-11-10-ROUND-TWO.md`, then this note. Run `gh pr list` on ukcounciltax, ukcouncils and estate-kit before writing anything.

## 1. What happened

1. **GitHub Actions stopped.** From about 18:25 every job on the account failed in two seconds: "recent account payments have failed or your spending limit needs to be increased". Three reruns after Tom fixed billing still failed.
2. **ukcounciltax and ukcouncils were made public** (Tom's decision, 10 November) so Actions would run on free public minutes. It worked at once. A gitleaks scan of both full histories, all refs, found only public by design values (IndexNow keys, the Cloudflare beacon token). estate-kit is still private, so its CI may still be blocked until billing clears.
3. **Docs clean up for public view**: ukcounciltax PR 50 and ukcouncils PR 42 removed paths into the private Reports repository, the party lane wording and "(sub judice)" from current docs. The old wording remains in git history; no history rewrite was done or approved.
4. **Merged and deployed, each checked live:**

| Repo | PR | What | Merge |
|---|---|---|---|
| ukcounciltax | 48 | D5, D6 (merged earlier; deploy rerun once Actions ran) | `8f7002f` |
| ukcounciltax | 50 | docs clean up | `314cbec` |
| ukcounciltax | 52 | compare: eight fixes (as ukcouncils 43) | `179113d` |
| ukcouncils | 41 | dossier part two: closed drawers, three actions, plus a print rule so closed drawers print open | `c3ce242` |
| ukcouncils | 42 | docs clean up | `4cdec81` |
| ukcouncils | 43 | compare: eight fixes | `331fbdb` |

Live checks: position strips on `/council-tax/ranked/` and the round rail on the Burnley game (D5, D6); Burnley's profile has 18 drawers, one actions block, and all 28 drawer tables print; compare answers correctly for an entry from a council page, Camden against Barnet, Burnley against Manchester and Barnsley 2024/25; the footer space is restored on UK Councils. The PR 52 deploy was still running when this note was written: confirm "government service. UK Council Tax republishes" on ukcounciltax.co.uk.

5. **The eight compare fixes** (both sites): entry from a council page asks for the second council; inner and outer London compare as one group (`compareGroup`), as the ranked pages do; a refusal names both types instead of blaming a mixed basis; the result heading takes focus after Compare (it sat about 1,230 px down on a phone); `band=h`, `year=2026/27` and tracking only links are read sensibly (`normaliseState`); a year a council does not hold under its current code is greyed out and explained (Barnsley and Sheffield changed codes in 2025/26); band and year changes update a shown answer in place; the footer space before `{SITE_NAME}`.

## 2. Open, waiting on Tom

| Repo | PR | State | What it needs |
|---|---|---|---|
| ukcounciltax | 51 | Codex's pipeline speed, plus one fix from review (`62d626b`) | Read its checks, then Tom's word to merge |
| estate-kit | 6 | Kit 0.5.0 complete, still marked draft with a stale description | Tom marks it ready and edits the description (the session was not permitted to), then merge, then tag `v0.4.0` and `v0.5.0` |
| ukdemographics | 155, 157 | L2 links; README | unchanged from round two |

**PR 51 review.** Every test, browser suite, CSP suite and the publish step still run on a code push to main. The image cache key covers `data`, `src` (with the kit fonts), the lockfile (which pins the `@fontsource` fonts) and the config, so a changed figure or font cannot serve an old image. One gap was fixed on the branch: the documents only skip also applied to pushes to main, and the release group cancels a running release on a newer push, so a code merge followed by a docs merge could leave the code change unpublished. The skip now applies to pull requests only; the test and `docs/RELEASE.md` say so. Codex's own figures: the PR site job fell from 34 to 20 minutes; main verification is about 20 to 23 minutes against 39.

**Kit 0.5.0.** Item 4 was settled by Tom as an opt in check, no breaking change: `requireNames` on BillAnatomy and PositionStrip, and `nameErrors` / `checkNames`, refuse a missing `name` and a name ending in a lower case "council"; without the option a missing name still falls back to the label. City of London regression case in `tests/names.test.ts`. Version 0.5.0, README section, changelog and kit handover written. Gate on Node 22: build, 273 tests, 18 Python tests, dash check, pack proof; summary, sources and citations demos looked at by eye at 375 and 1440 in both themes, no overflow.

Also waiting, none blocking a build: submit both sitemaps in Search Console; rule on chart image weight; the A3 section order; whether merged worktrees in `~/wt` can go (about 30 now).

## 3. Order of what follows

1. Merge PR 51 once its checks pass (Tom's word). Then measure one real main deploy and add it to `docs/RELEASE.md`.
2. Kit PR 6: ready, merge, tag. Then the ukcouncils dossier's second PR, the short source line on its own, using `sourcePlacement: "html"`, `sourceFormat` and `checkSources`.
3. Local links refresh (the Codex prompt Tom was given, section 5): UK Places first, then both sites. `src/lib/council-links.ts` fails every UK Council Tax build from 4 January 2027.
4. Compare improvements, on UK Council Tax only (its future owner under the split): lead with the difference (money, percentage, monthly); print each source once (kit 0.5.0); one searchable picker per side; the homepage card that says "One area against the England average" while the page compares two councils. Whether to allow comparisons across types, labelled, is Tom's call. Also decide whether UK Councils' "Compare this council" should point at UK Council Tax before the reversal.
5. Then the round two priorities: the dossier on all 296 pages by mid January, measurement, the receipt and band check, levels day.

## 4. Traps found today

- **UK Council Tax's dist check needs `BUILD_OG=1`.** A build without it fails `test:dist` with thousands of "missing PNG" and "static game card missing" lines. Until PR 51 merges, always build with `BUILD_OG=1` before `test:dist`.
- **Playwright's web server "exited early".** `astro preview` daemonises, so the start command exits at once and Playwright gives up. Start the preview yourself first (`npx astro preview --host 127.0.0.1 --port N`), then run Playwright with `E2E_PORT=N` (ukcouncils) or `E2E_BASE_URL=http://127.0.0.1:N` (ukcounciltax), and `npx astro preview stop` afterwards.
- **New worktrees need `data/raw/` and `node_modules`.** Copy `data/raw` from `~/wt/uct-profile` (UKCT) or `~/wt/ukc-dossier-2` (UKC); copy `node_modules` only from a worktree whose `package-lock.json` is byte identical.
- **Builds in parallel cause unit test timeouts.** Run one full gate at a time; a lone timeout passed on rerun each time it appeared.
- **The dash checker flags arithmetic minus signs in code.** Keep `bPence - aPence` as main had it; do not rewrite code to dodge it, and do not add new spaced minus signs.
- **`gh pr edit` and `gh pr ready` on estate-kit were refused** by the session's permission classifier. Tom can do them in the GitHub UI.

## 5. Local state

Worktrees from this session: `~/wt/ukc-compare` and `~/wt/uct-compare` (merged), `~/wt/ukc-scrub` and `~/wt/uct-scrub` (merged), `~/wt/kit-0.5` (PR 6), `~/wt/uct-ci` (PR 51, Codex's, with the review fix), `~/wt/uct-handoff-1110c` (this note). The main checkouts were not changed.

## 6. Resume prompt

```text
Read CLAUDE.md, docs/HANDOFF-2026-11-10-DESIGN-AND-SPLIT.md, docs/HANDOFF-2026-11-10-ROUND-TWO.md and docs/HANDOFF-2026-11-10-ROUND-THREE.md in ukcounciltax (origin/main). Run gh pr list on ukcounciltax, ukcouncils, estate-kit and ukplaces and say what is open. Confirm the UK Council Tax footer reads "government service. UK Council Tax republishes". For PR 51 read its checks and the review in section 2 and ask me before merging. Then take the next item from section 3. Do not merge, tag or deploy without my word.
```

## 7. Codex prompt given to Tom: local links refresh

```text
Three repos, in this order, one PR each. Node 22. British English; no em dash, en dash or spaced hyphen anywhere; stage named paths only, never git add -A or git add .; open each PR; do not merge, tag or deploy. ukcounciltax and ukcouncils are public: never commit a secret, a home path or anything from ~/Documents.

Why: UK Council Tax's src/lib/council-links.ts throws on every build from 4 January 2027, 91 days after the payment links were checked on 5 October 2026. UK Councils shows the same links as the "Pay council tax" action on 254 council pages. Both read UK Places' reviewed export.

Part 1, tompickup23/ukplaces. Worktree ~/wt/ukp-links on branch data/local-links-2026-11 from origin/main. Read CLAUDE.md and scripts/build-local-links.mjs. Run npm run build:local-links, then npm run test:local-links and the repo's normal test and build commands. Review the diff of src/data/local-links.json: report links added, removed and changed per service, and every authority whose council tax link disappeared, with the reason the script recorded. Stop and report without opening a PR if more than 10 council tax links disappear, if any GSS code changes, or if the export date or checked date is not today. Open the PR with that report in the body.

Part 2, tompickup23/ukcounciltax. Worktree ~/wt/uct-links on branch data/council-links-2026-11 from origin/main. Copy data/raw/ from ~/wt/uct-profile/data/raw/. Read CLAUDE.md, docs/HANDOFF-2026-11-10-ROUND-THREE.md, scripts/import-council-links.mjs and src/lib/council-links.ts. Import from the Part 1 PR head commit, so data/council-links.json records the new export date, checked date, commit and sha256. Do not change the 91 day rule. Run npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist and npm run test:text; for the browser suites start npx astro preview --host 127.0.0.1 --port 44396 yourself, run with E2E_BASE_URL=http://127.0.0.1:44396, then npx astro preview stop. Open the PR as a draft, saying its commit field must be re pinned to the UK Places merge commit once Tom merges Part 1 (squash changes the hash; the sha256 must not change).

Part 3, tompickup23/ukcouncils. Worktree ~/wt/ukc-links on branch data/local-links-2026-11 from origin/main. Copy data/raw/ from ~/wt/ukc-dossier-2/data/raw/. Same import from the same commit with scripts/import-local-links.mjs into data/links/local-links.json. Report how many profiles now have three actions and how many two (254 and 42 before). Run npm run check, npm test, npm run build, npm run test:dist; for the browser suites start the preview yourself and run with E2E_PORT, as in Part 2; then npm run test:csp. Draft PR with the same re pin note. Put any page whose pay link changed under a "## Pages allowed to differ" heading as a fenced list of globs.

Stop and report if an import script refuses the data, a pinned hash differs from what you computed, or any figure other than links and their source dates changes.
```
