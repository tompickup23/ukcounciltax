# Handover, 9 November 2026 | round four: reviews, merges, decisions, the LGR panel

Saved before archiving the Claude Code session that ran rounds three and four. Nothing here authorises a merge or deployment; Tom authorises those in chat. Read `CLAUDE.md`, then this note, then `PLAN-2026-11-10-REMAINING.md` (sections 0 and 6) and `DECISIONS-WAITING-2026-11-10.md`.

## What happened

- Reviewed and merged, with review fixes: ukcounciltax PR 32 (A2, `02f7061`), ukcouncils PR 35 (B2, `151dc0f`), estate-kit PR 3 (0.2.0, tagged `v0.2.0`), estate-kit PR 4 (0.3.0, tagged `v0.3.0`), ukcounciltax PR 31 (plan and decisions, `aad466c`). A2 and B2 deployed and were checked live.
- Tom took every outstanding decision on 9 November 2026: 1 to 8, K1 to K5, G1, G2 (recorded in `DECISIONS-WAITING-2026-11-10.md`), D1 for the registry names (GOV.UK Local Links Manager), and the C3 line 906 ruling (print the MHCLG label verbatim, inside the financing table only).
- The LGR interactive plan (Reports PR 626) was read. The model stays on tompickup.co.uk; UK Councils gets a neutral MHCLG panel, B4, after C3 (decision 8). B4a source notes and brief are pushed on ukcouncils `feat/reorganisation-panel` (`3f5041f`).
- L2 and L3 briefs and the link template are pushed (ukdemographics and ukelections `feat/tax-site-links`, ukcouncils `docs/sister-link-template`). The L2 brief's Wales note was corrected (`e1409fc`); a UK Council Tax only line for Welsh pages is follow up L2b.

## Open PRs, all green, none reviewed yet

| PR | Item | Head | Note |
|---|---|---|---|
| ukcounciltax 33 | A4 rankings and parish pages | `538e19f` | 909 pages, 221 new routes; merge first |
| ukcounciltax 34 | A5 the face | `29d136f` | CI was red: `.gitignore` `dist` swallowed the vendored kit dist; fixed in `29d136f`. Rebase onto A4 and carry its counts |
| ukcouncils 36 | C3 budget section | `2ea2439` | Line 906 ruling applied |
| ukdemographics 155 | L2 tax site links | `1915999` | 296 of 318 place pages |

## Next: two Opus reviews (prompts below), then merges

### R1. ukcounciltax: A4 then A5

```text
Review two ukcounciltax PRs in order, each against its brief, and post one comment per PR: passes, blocks, follow ups. Fix small mechanical blockers on the branch as separate commits and say so. Do not merge or deploy.

First PR 33 (A4, ~/wt/uct-rankings, branch feat/rankings-parishes) against docs/A4-RANKINGS-PARISHES-SOURCE-NOTES.md (binding) and docs/A4-RANKINGS-PARISHES-BRIEF.md. Rebuild and reproduce: 909 HTML pages, 908 sitemap URLs, 221 new self canonical routes, 318 mapped and 69 listed canonicals unchanged, class counts 164, 63, 36, 33 and 21, 214 parish pages with all 10,245 rows, the built anchors in the PR body (Windsor and Maidenhead, Havant and Rushmoor tied at 21=, Lewes 164 with note ad and the pending approval wording, Burnley, Lancaster, East Lindsey minus £2.64, City of London Temples, North Yorkshire 665 rows). Check ties use standard competition ranking, positions are only within a complete class, parish changes compare only the same source row, own share excludes parish precepts, sitemap dates come from recorded editions, and no ranking word appears outside the ranking pages' own neutral wording. Judge the shortened meta descriptions and the local only screenshots (open output/playwright/a4/ in the worktree).

Then PR 34 (A5, ~/wt/uct-face, branch feat/face-and-game) against docs/A5-FACE-BRIEF.md. Confirm CI is green after 29d136f, which committed the vendored kit dist that .gitignore had excluded; confirm tests/vendor.test.ts would catch a future gap. Check the vendored v0.2.0 hashes, the token splice (28 aliases, 16 added, only the four series colours change value), billAnatomy 351.44 + 1,801.75 + 292.40 + 94.73 = 2,540.32, the first screen at 375 and 390 in both themes, CLS and LCP in a lab run, the CSP suite with production headers, and that no published figure changed on any page. Judge the three points the PR raises: band totals leaving the homepage (still on /precepts/), shares at 1 dp instead of 2, and Burnley's area Band D cited as Table 9 against the site's year file. Run the design-check skill at 390 and 1440 in both themes. If PR 33 has merged by then, rebase PR 34 onto main, carry A4's page and URL counts into A5's dist checks, rerun the full gate with BUILD_OG=1 and push.

British English; no em dash, en dash or spaced hyphen in anything you write; name no individual.
```

### R2. ukcouncils C3, then ukdemographics L2

```text
Review two PRs, each against its brief, and post one comment per PR: passes, blocks, follow ups. Fix small mechanical blockers on the branch as separate commits and say so. Do not merge or deploy.

First ukcouncils PR 36 (C3, ~/wt/ukc-budget, branch feat/council-budget-section) against docs/BUDGET-SECTION-BRIEF.md and the B2 source notes. Rebuild and reproduce: 287 budget sections, 160 county subsections, nine absent returns with no section, contents link or placeholder, 329 pages and 328 sitemap URLs, B2 coverage unchanged, the RA output SHA-256 704c2137...dd0a, Burnley RA 799 £17,246,000 and RA 900 £25,831,000, Birmingham £2,700,482,000 and £2,970,775,000, and prose words under 250 (Burnley 167, Birmingham 100). Check Tom's line 906 ruling is narrow: "Inter-authority transfers in respect of reorganisation" may appear only inside the RA financing table markup on Bromsgrove, Redditch and Buckinghamshire, and a test must refuse it anywhere else; inject it into prose on a built page and confirm the gate fails, then restore. Check no district and county figures are added together, county budgets are never apportioned, signed financing reconciles to RA 900, n/a appears only for zero cells in present reserves rows, the 296 budget game links match the live sitemap, and the CI raw input cache rejects a changed byte. Open the screenshot artifact and look at Burnley, Blackpool and Coventry at 375.

Then ukdemographics PR 155 (L2, ~/wt/ukd-links, branch feat/tax-site-links) against docs/TAX-SITE-LINKS-BRIEF.md and the template on ukcouncils branch docs/sister-link-template. Confirm CI is green. Reproduce 318 route pages, 296 with the line, 22 Welsh without, no refusals, Barnsley and Sheffield through their aliases, Burnley's line exactly as the brief's section 3, each linked URL present in the saved sitemaps, and the site's anonymity kept. Read that repo's CLAUDE.md first.

British English; no em dash, en dash or spaced hyphen in anything you write; name no individual.
```

### Codex, any free slot: B4 item 1a (UK Places names)

```text
Work in ~/ukplaces on a new branch data/official-names-local-links from origin/main. Read its CLAUDE.md, then the brief at git -C ~/wt/ukc-reorg show feat/reorganisation-panel:docs/REORGANISATION-PANEL-BRIEF.md, item 1a only, which is binding (decision D1 is taken: officialName from GOV.UK Local Links Manager's Authority Name). Rename E07000112 to "Folkestone and Hythe" from ONS LAD26NM without changing any slug; take officialName from the Local Links Manager export by exact GSS code, reusing the fetch in scripts/build-local-links.mjs, pinned with last-modified, retrieval date and SHA-256 in the source block, failing the build if a code yields two names; copy names exactly as GOV.UK prints them; reach only the six codes the brief lists through gss-predecessors.json, recording officialNameVia; North Yorkshire and Somerset keep their values; leave reorganisation and county untouched. Run the repo's full gate. Push and open a PR whose body lists every changed name and officialName with old value, new value and source row, against the expected 284 plus up to 6, explaining any difference by export edition. End the body with "Built with Codex from a brief prepared in Claude Code." Stop on the brief's item 1 stop conditions. British English; no em dash, en dash or spaced hyphen anywhere including commit messages; name no individual; stage named paths only. Do not merge or deploy.
```

## After the merges (prompts to be written by the session that sees the reviews)

- A6 the game as a game, on kit `v0.3.0` (`docs/A6-GAME-BRIEF.md`, G1 static, G2 yes), after A5 merges. Prompt outline in the plan, section 3.
- A3 brief revision (kit charts, positionStrip, ChartActions, DataDrawer, the network strip, a line linking the UK Councils reorganisation panel), after A5 merges; then Codex A3; then C1b.
- B4 items 1b (ukcouncils registry) and 1c (ukcounciltax registry, UK Food Hygiene links, hold test) in sequence after 1a; the panel (items 2 to 8) after C3 merges. Stop conditions include MHCLG moving after 29 October 2026 and any change in the Lancashire claim.
- L3 UK Elections from 17 November (rerun its dry run after rebasing); L2b Welsh UK Council Tax line; the UKE `surrey` record carrying Surrey Heath's code is a separate UKE fix.
- L1 network strip on both tax sites; B3 seats by party on decision 1's sourcing.
- Beacon and Search Console: Tom adds the token as a secret, then a short lane A session.

## Still open for Tom

- The beacon token and Search Console.
- The mark (R560) with K5, the accent beside UK Food Hygiene.
- B4 D2 to D5 (Surrey after vesting, the registry field, Lancashire wording once the claim's status is known, `/councils/shepway/`); none blocks.

## Worktrees (local; none to be removed without Tom's yes)

| Worktree | Branch | State |
|---|---|---|
| `~/wt/uct-rankings` | `feat/rankings-parishes` | PR 33 |
| `~/wt/uct-face` | `feat/face-and-game` | PR 34; A6 follows here |
| `~/wt/ukc-budget` | `feat/council-budget-section` | PR 36 |
| `~/wt/ukd-links` | `feat/tax-site-links` (ukdemographics) | PR 155 |
| `~/wt/uke-links` | `feat/tax-site-links` (ukelections) | L3 brief, from 17 November |
| `~/wt/ukc-reorg` | `feat/reorganisation-panel` | B4 brief |
| `~/wt/ukc-links-template` | `docs/sister-link-template` | template |
| `~/wt/kit-uct` | `feat/kit-0.3.0`, merged | can go once Tom agrees |
| `~/wt/uct-docs-pr31`, `~/wt/ukc-front-door`, `~/wt/uct-quick-wins` | merged branches | can go once Tom agrees |
| `~/wt/uct-profile`, `~/wt/uct-scenario` | A3 and C1b briefs | to revise after A5 |

## Lessons

- A root `.gitignore` entry such as `dist` silently swallows a vendored package's `dist`; a vendoring hash test catches it only in a clean checkout, so CI is the first place it shows. Check `git ls-files` against the manifest before opening the PR.
- Tests run while six sessions load the machine can fail on timing; rerun before calling a fault.
- In zsh, `set -- $x` does not split a string into arguments; use a function with explicit arguments.
- Codex stopping on a stop condition is the system working (C3 line 906). Answer with a narrow, tested exception, not a rewording.
