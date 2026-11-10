# Handover, 10 November 2026 | the split, design round two, and the first builds

Saved before archiving the Claude Code session that reviewed both tax sites, set the direction, and started building against it. Nothing in this note authorises a merge or deployment; Tom authorises those in chat, as he did for each merge recorded here.

Read `CLAUDE.md`, then this note, then `docs/PLAN-2026-11-10-EXECUTION.md` section 8 (the revised plan, rules and order). Before writing anything, run `gh pr list` on ukcounciltax, ukcouncils and estate-kit: two pull requests were still waiting on checks when this was written (section 2).

## 1. What is decided

The direction is in `docs/PLAN-2026-11-10-SPLIT-AND-NETWORK.md`; the design items D1 to D6 are in `docs/DESIGN-ROUND-TWO-BRIEF.md`. In short:

- UK Council Tax answers the bill. UK Councils answers the council and is the front door to the sister sites. One owner per page type; nothing new is built on both.
- The reversal is May to June 2027: the council page becomes two different self canonical pages, and the other tax page types leave UK Councils by 301. Its gate is the UK Councils dossier live on all 296 pages. Until then UK Councils keeps Band D first and its titles and H1s.
- Decisions taken by Tom on 9 and 10 November 2026: S1 (short source lines, with conditions), S2, S3, N1 to N5. On 10 November he also ruled that the dossier's summary row stays above the band answer on phones, and delegated the choice on short source lines in that row (kept short, with a build gate; see section 3).
- Held by an earlier decision and not to be built without a new one: UK Food Hygiene and UK Places links on UK Councils council pages. `src/lib/registry.ts` on ukcouncils records that Tom confirmed the sister block on 8 November 2026 without them, and `scripts/check-dist.mjs` refuses a UK Food Hygiene link. The plan's section 4 called their absence a fault; that was wrong.

## 2. State of every pull request

| Repo | PR | What | State when written |
|---|---|---|---|
| ukcounciltax | 42 | The split plan and design brief | Merged |
| ukcounciltax | 43 | Navigation cut (30 header links to 19), budget game link, Asylum Stats link removed, analytics beacon | Merged as `0bec32e`; live |
| ukcounciltax | 45 | Fix: the budget game browser test allows for the beacon | Merged as `1500163`; live |
| ukcounciltax | 44 | Execution plan and session prompts | Merged as `d3532f1` |
| ukcounciltax | 46 | A3, the council profile overhaul | Open. Two reviews posted; the fix pass is right. Merge once the three checks on `c87c2e2` pass |
| ukcouncils | 37 | Reorganisation panel | Merged as `fd68cbc`; deploy was in progress |
| ukcouncils | 40 | The dossier, part one: summary row, Band D once below it, two drawers, a build gate | Open, based on main, checks running. Merge once they pass |
| estate-kit | 5 | Kit 0.4.0: text against marks gate, bar labels placed clear | Merged as `332d689`. Not tagged: tags are Tom's |

Live and checked on ukcounciltax.co.uk on 10 November: the beacon with the site's own token on the homepage, 19 header links with "Budget game", no Asylum Stats link on the Burnley profile, the privacy page describing Cloudflare Web Analytics.

Measurement: a Cloudflare Web Analytics site exists for `ukcounciltax.co.uk` (manual snippet). A Search Console domain property is verified under the Google account that holds the network's other properties, by a TXT record in Cloudflare DNS. The sitemap has not been submitted and the ten shared URLs have not been inspected.

## 3. What was built, and what each still needs

**ukcouncils PR 40, the dossier part one.** A summary row under the page head on every council page: Band D first, then residents, council tax collected, the next election and Exceptional Financial Support, each only where the data holds it (counts across the 296: 296, 294, 296, 174, 51). Short source lines on the figure tiles, linked to the publication, with a link to the section that holds the full line. The repeated Band D cards are gone from the old "at a glance" section. The collection table and the sources list are in closed drawers. The built-page gate fails if a short line cites an address that is not in the page's sources list, if a tile points at a missing section, or if the row does not lead with Band D. Local results: 273 unit tests, the dist check, 250 browser tests and 42 production header tests pass. Not done: the build with share images, the design check skill, dark theme captures.

Part two, not started: every later section as a headline with its tables in drawers; three actions; the short source line across the rest of the page (D3 proper), where the first use of each source stays in full and repeats are short. That last one will touch many source line tests; do it as its own pull request.

**estate-kit 0.4.0.** The layout gate refuses any text box over a registered mark; ZeroBar registers its bars, places each value label clear of every other bar, and names every bar when the labels fit. 227 tests pass. Still to come, listed in its changelog: the source printed once by option, a short source line, a summary row of stat tiles, body names taken from the data. Neither site has re vendored it; UK Council Tax fixed its band chart by drawing it horizontally on kit 0.3.0, which is fine and prints every band.

**ukcounciltax PR 46, A3.** Codex built phases 1b to 11 from `docs/A3-PROFILE-BRIEF.md` and `docs/A3-AMENDMENTS-2026-11-10.md` (in `~/wt/uct-profile`), stopping twice on correct stop conditions. An independent sweep of all 296 built profiles against the data found every figure right and no gate weakened. Follow ups, not blocking, are in the first review comment on the PR.

## 4. A fault of mine, and the rules that came from it

PR 43 merged with its main check failing. The command waited for the checks and then merged, but took its exit status from the wrong part of a pipeline, so the failure did not stop it. Publishing is gated on the same suite, so nothing bad deployed; main was red for about an hour until PR 45. Rules from the day, all in the execution plan section 8.1:

1. Merging is its own step, after the check results are read. Never chained to a watch.
2. A pull request that changes every page runs the browser suite locally before it opens.
3. Any wording a brief fixes for a drawing is run through the kit gate for all 296 councils before the brief is handed over.
4. Every brief says that an assertion on a removed component or a changed state is replaced by its equivalent, in its own commit.
5. The reviewer looks at every chart label at 375 and 1440 in both themes. A clipped Band D figure passed every gate until someone looked.
6. A built-page rule belongs in the dist check, not only in unit tests: on ukcouncils CI runs `npm test` before the build, so tests that read `dist` are skipped there.

Two environment notes. The Astro preview is a daemon: when Playwright says its web server exited early, start `npx astro preview --host 127.0.0.1 --port <port>` by hand and run the suite with `E2E_PORT` (ukcouncils) or `E2E_BASE_URL` (ukcounciltax). The permission system refuses force pushes, DNS changes and merges unless Tom has said so in chat for that action; bring main into a branch with an ordinary merge instead of rebasing a pushed branch.

## 5. Next, in order

| Lane | Next step |
|---|---|
| Tom | Merge PR 46 and PR 40 if still open; tag estate-kit `v0.4.0`; submit the sitemap in Search Console; rule on chart image weight (A3 adds about 320 MB of PNGs that only the download links use) |
| ukcounciltax, Codex | The pipeline speed session, prompt in the execution plan section 8.6, after PR 46 merges. The site check takes 17 to 31 minutes on every pull request against a 40 minute limit |
| ukcounciltax, Claude Code | D5 and D6 after PR 46 merges (prompt in the execution plan section 5) |
| ukcouncils, Claude Code | The dossier part two (section 3), then D4 the homepage and D2 the navigation |
| estate-kit, Claude Code | The rest of 0.4.0's list, as 0.5.0 |
| Any | The "balance the budget" exploration from the round five handover is still not done |

Dates that bind are in the execution plan section 8.5. The nearest: rerun the UK Places link check in December, because `src/lib/council-links.ts` (arriving with PR 46) fails every build from 4 January 2027.

## 6. Worktrees and local state

Created this session, all safe to remove once their pull requests are merged and Tom agrees:

| Worktree | Branch | For |
|---|---|---|
| `~/wt/uct-docs-split` | `docs/execution-2026-11-10` | PRs 42 and 44 |
| `~/wt/uct-nav` | `fix/e2e-beacon-requests` | PRs 43 and 45 |
| `~/wt/uct-handoff-1110` | `docs/handoff-2026-11-10-design-split` | This note |
| `~/wt/ukc-dossier` | `feat/council-dossier` | ukcouncils PR 40 |
| `~/wt/kit-0.4` | `feat/kit-0.4.0` | estate-kit PR 5 |

`~/wt/uct-profile` is Codex's A3 worktree; leave it until PR 46 merges. The main checkout `~/ukcounciltax` is far behind origin and holds two untracked copies of documents now on main (`docs/DESIGN-ROUND-TWO-BRIEF.md` and `docs/PLAN-2026-11-10-SPLIT-AND-NETWORK.md`); delete those two before pulling, or the pull refuses. One tab (Search Console) was left open in Tom's Chrome.

## 7. Resume prompt

```text
Read CLAUDE.md, docs/HANDOFF-2026-11-10-DESIGN-AND-SPLIT.md and docs/PLAN-2026-11-10-EXECUTION.md section 8 in ukcounciltax (origin/main). Run gh pr list on ukcounciltax, ukcouncils and estate-kit and say what is still open. Then take the next step for the lane I name, following the rules in section 4 of the handover: read check results before any merge, run the browser suite locally before opening a pull request that changes every page, and look at every chart label at 375 and 1440 in both themes. Do not merge or deploy without my word.
```
