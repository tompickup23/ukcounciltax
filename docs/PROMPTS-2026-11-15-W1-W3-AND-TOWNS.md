# Prompts | W1 to W3 and the town league table | 15 November 2026, night

Written in Claude Code (Opus) on 15 November 2026, at main `b5f8ced` (PR 89, W0, live). Each prompt block is pasted into a fresh session on its own. A prompt never authorises a merge, tag or deployment unless it says Tom has given that yes.

## Why this order

- W1, W2 and W3 restyle `/tools/budget/`, `/tools/budget/<slug>/` and `/tools/budget/<slug>/set/`. They are a chain: W2 waits on W1, and W3 waits on W2. All three edit files held by draft PR 88 (C6 levels day staging, 60 files). So PR 88 has to merge first (decision D11, option (a)). PR 88 renders nothing new today (number diff 0 against main), so merging it is low risk once Tom has taken its six decisions.
- W1 was listed as waiting on "W6 components". W0 already shipped the two-door band (`src/components/PlayBand.astro`). W1 reuses it, so it does not wait for W6.
- The town league table is independent of PR 88 at the data stage: it adds new files only. So its data work runs now, beside the PR 88 merge, and its pages run beside W1. That gets W1 to W3 done in the order Tom asked for, without the towns work waiting idle.
- Research for the towns work is done: `docs/TOWNS-RESEARCH-2026-11-15.md` (four reports), scripts in `docs/towns-research/`. The raw ONS exports (45 MB) stay untracked under `output/town-research/downloads/` in the main checkout. Session 2 downloads the portal's own CSVs again for provenance.

## Waves

| Wave | Session | Tool | Starts when | Branch and worktree |
|---|---|---|---|---|
| 1 | 1. PR 88: decisions, rebase, merge on Tom's yes | Claude Code, Opus | Now | `feat/c6-levels-day-staging`, `~/wt/uct-c6-staging` |
| 1 | 2. Towns stage 1: data layer and importer | Claude Code, Opus | Now, after this docs PR merges | `feat/towns-data`, `~/wt/uct-towns-data` |
| 1 | 3. Special expense councils: own schedules | Codex | Now | `data/special-expense-schedules`, `~/wt/uct-sx-schedules` |
| 2 | 4. W1: two ways to play across the budget area | Codex | PR 88 merged | `feat/w1-budget-doors`, `~/wt/uct-w1` |
| 2 | 5. Towns stage 2: pages, SEO and design | Claude Code, Opus | Session 2 merged | `feat/towns-pages`, `~/wt/uct-towns-pages` |
| 3 | 6. W2: set page workbench, layout and controls | Codex | W1 merged | `feat/w2-set-workbench`, `~/wt/uct-w2` |
| 4 | 7. W3: set page feedback, meter and next | Claude Code, Opus | W2 merged | `feat/w3-set-feedback`, `~/wt/uct-w3` |
| After each Codex PR | R. Review of a Codex PR | Claude Code, Opus | The Codex PR is green | that PR's worktree |

One writer per file set. Sessions 1, 2 and 3 touch disjoint files. Sessions 4 and 5 overlap only in `src/lib/site.ts` and `src/lib/paths.ts`; whichever merges second rebases. Sessions 5 and 6 do not overlap. Merge each PR as its own step after reading its checks, never during a publish run.

## Decisions for Tom before pasting (defaults filled in; edit the prompt text if you choose otherwise)

PR 88, from its body: (1) the 2027/28 budget line on set pages only; (2) `YEARS` keeps all four years; (3) authorities for 1 April 2027 settled before the freeze, not in PR 88; (4) the levels day page at `/council-tax-2027-28/`; (5) keep the image embed snippet; (6) Burnley's schedule shown under its own year. D11: option (a). D10 (W2): option (a), one or two labelled presets, mainly for the 16 frozen-charge councils.

Towns:
- **T1, departure from A4.** The A4 source notes (binding) said "No ranking of parishes, and no ranking of billing areas by parish figures". Tom asked for a town league table on 15 November 2026. Default: full Band D for parish and unparished areas is put in order across England and within region, county, council and constituency, recorded as Tom's decision of 15 November 2026. The locality bill is the same system, year and basis everywhere, so the comparison is compatible.
- **T2, wording.** The house rule and `tests/rankings-pages.test.ts:17` bar "cheapest" and "most expensive" on ranking pages; the kit gate bars ranking words in chart titles. Search demand is for "cheapest council tax". Default: visible copy says "lowest" and "highest"; "cheapest" and "most expensive" are allowed in the page title, meta description and one H2 on the towns pages only, with the test widened for those routes alone. Chart titles stay neutral.
- **T3, larger places.** No official town list exists. Default: a "larger places" filter at a published tax base of 2,000 Band D equivalents or more (about 1,195 rows), labelled as a tax base, never as population.
- **T4, special expense councils.** 48 councils with parishes charge special expenses (about 2,700 rows). The national tables cannot give their per area bills (verified penny by penny against Rushcliffe, Chorley and Westminster). Default: shown as "Published by the council only" and left out of the order until session 3 imports each council's own schedule.
- **T5, constituency pages.** Default: one page per English constituency that contains a parish or unparished area, listing every area that touches it, split areas flagged and never apportioned.

---

## 1. PR 88: decisions, rebase, merge on Tom's yes (Claude Code, Opus)

```text
Repository tompickup23/ukcounciltax, draft PR 88 (feat/c6-levels-day-staging, worktree ~/wt/uct-c6-staging). Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook.

Read first: CLAUDE.md, docs/STATE.md, docs/PROMPTS-2026-11-15-W1-W3-AND-TOWNS.md, the PR 88 body (its "Decisions for Tom"), the C6 staging brief it names, docs/RELEASE.md.

Tom's decisions, 15 November 2026: D11 option (a), merge PR 88 before the budget redesign. PR 88 decisions: (1) the 2027/28 budget line on set pages only; (2) YEARS keeps all four years; (3) authorities for 1 April 2027 settled before the freeze in a separate PR, none here; (4) the levels day page at /council-tax-2027-28/; (5) keep the image embed snippet; (6) Burnley's schedule shown under its own year.

1. Rebase PR 88 on origin/main (main has moved: PR 89 W0 touched the homepage, /tools/, /tools/budget/index.astro, global.css, the 404, e2e/budget-static.spec.ts and the Burnley game skin). Resolve conflicts keeping both sides' intent; W0's gates (homeProblems, the budget band, the Set links on /tools/budget/) must stay green.
2. Apply the decisions above where the PR has a switch or copy for them; record them, dated, in the PR body and the brief.
3. Full verification: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, npm run test:csp, the browser suite (local trap in docs/STATE.md: start npx astro preview --host 127.0.0.1 --port 44321, run with E2E_BASE_URL, then astro preview stop), the rehearsal scripts, and the number diff against main (expect 0 pages differing apart from the allowed list in the PR body).
4. Mark ready, put the result to Tom in one message (what changed in the rebase, the number diff line, the checks) and ask for the merge yes. Do not merge without it. On the yes: merge as its own step, never during a publish run, watch Verify and publish, check three live pages, report the merge commit.
5. Then tell Tom that sessions 4 (W1, Codex) and 6 later can start, and replace docs/STATE.md (20 lines) in a small docs PR.
```

## 2. Towns stage 1: data layer and importer (Claude Code, Opus)

```text
Repository tompickup23/ukcounciltax. Worktree ~/wt/uct-towns-data on new branch feat/towns-data from origin/main. Node 22.23.4 first on PATH; Python by uv run only. British English; no em dash, en dash or spaced hyphen anywhere, including JSON and generator scripts. Stage named paths only. Never bypass the pre-commit hook. One draft PR. Do not merge or deploy.

Goal: a tested, sourced dataset of full Band D council tax for every parish area and unparished area in England for 2026/27, with region, county, council and Westminster constituency, ready for the league pages in session 5. No routes or page changes in this PR.

Read first: CLAUDE.md, docs/STATE.md, docs/PROMPTS-2026-11-15-W1-W3-AND-TOWNS.md (decisions T1 to T5 as Tom took them), docs/TOWNS-RESEARCH-2026-11-15.md parts 1 and 2 in full, docs/towns-research/ (scripts), docs/A4-RANKINGS-PARISHES-SOURCE-NOTES.md, src/lib/national-data.ts, src/lib/parish-pages.ts, scripts/import-national.mjs.

Rules from the research, binding unless you prove them wrong against a primary source:
1. Full Band D = Table 10 line 9 (components.ownExcludingParishPence) + parish bandDPence + the sum of components.parts[].bandDPence, only where the council's specialExpensesPounds is 0, the row is a precepting or non-precepting parish (normalise "Precepting Parish") or a Group row with taxBase above 0, and the status is published. Label it a calculation from published MHCLG figures.
2. Zero tax base group members take the carrying row's figure only when "(grouped with ...)" resolves to exactly one carrying row in the same council; otherwise they appear under the group, not as their own row.
3. Unparished area = line 9 + majors, only with no special expenses and no charter trustee over it. Where a charter trustee's tax base equals the unparished tax base, add the trustee's Band D. Durham, Mansfield and Bassetlaw (partial cover) and the two City of London Temples: no figure, with a note.
4. Special expense councils (48 with parishes): no figure from national tables, status "published by the council only", unless session 3's schedule file for that council exists in data/towns/schedules/, in which case use the council's own published figure with its source. Never line 9 minus the special expense average.
5. 1p rounding in parish Band D as published (MHCLG note h) is stated in the methodology, not corrected.
6. Negative precept (East Lindsey, Beesby with Saleby) shown as published.
7. Slugs and labels are parish plus council: 466 names repeat across councils.

Work:
A. Constituency and county lookup: download the ONS Open Geography Portal's own CSV downloads (not REST exports) for Parish to Ward to LAD (December 2025), Ward to Westminster Parliamentary Constituency to LAD to CTYUA (May 2025) and LAD to County (December 2024) into data/raw/ons/ with sha256 and a source record (publisher, title, item URL, edition, retrieved, licence OGL v3 with the OS attribution). Port docs/towns-research/match2.py to a Node importer step. Matching: exact normalised name within council, then without brackets, then combined units. Prefix and spelling matches go to a reviewed override file data/towns/overrides.json that you check row by row (state your evidence per row), never auto accepted. North Yorkshire duplicates (Aislaby, Borrowby, Melmerby) by former district through the override file. A parish in more than one constituency lists all of them, split flagged, never apportioned. Charter trustee and unmatched rows: no constituency, with a note. Constituency slugs: match the estate's existing slugs if UK Elections or UK Councils hold a list (search ~/ukcouncils and ~/clawd data); otherwise derive from the ONS name and record that.
B. scripts/import-towns.mjs writes data/towns/england-2026-27.json: per row MHCLG code, slug, name, kind (parish, group, unparished, charter trustees), council gss and name, region, county (shire county name or the unitary itself), constituencies[], full Band D pence or null with status and note id, the parts (own, parish, county or GLA, police, fire, combined), parish part change on the same source row only, tax base as published, larger place flag at T3's threshold. Plus a sources block with every file hash and a notes block. Full bill change is "Not comparable" unless 2025/26 Table 10 components are held from a published file; if you add that file, hash and cite it.
C. src/lib/towns.ts: loaders, standard competition positions (ties share a position, as /council-tax/ranked/ does), filters by region, county, council and constituency, the extremes, and counts. Positions only over rows with a figure; unknown is never zero.
D. Tests: anchors from the research reproduced exactly (Burnley Padiham 2,584.38 and unparished 2,540.32; Cornwall Bodmin 2,779.46 and Falmouth 2,877.71; Durham Peterlee 2,948.01 as the highest with a figure; Rushcliffe and Chorley rows have no national figure), every row accounted for (sum of statuses equals 10,241 published rows plus unparished rows), no dash characters in the JSON, no individual named.
E. docs/TOWNS-SOURCE-NOTES.md: the rules, counts by status, the anchors, what is left out and why, and Tom's T1 to T5 decisions dated 15 November 2026 (T1 supersedes the A4 "no ranking of parishes" line for the towns routes only).
Verification: npm test, npm run check, npm run build (no route change expected), npm run test:dist, npm run test:text. PR body: counts, anchors, match rates, the override list size, and what session 5 needs.
```

## 3. Special expense councils: their own 2026/27 schedules (Codex)

```text
Repository tompickup23/ukcounciltax. Worktree ~/wt/uct-sx-schedules on new branch data/special-expense-schedules from origin/main. Node 22.23.4 first on PATH; Python by uv run only. British English; no em dash, en dash or spaced hyphen anywhere, including JSON. Stage named paths only. Never bypass the pre-commit hook. One draft PR. Data and documents only: no src/, no tests outside tests/towns-schedules.test.ts. Do not merge or deploy.

Why: 48 English councils with parishes charge special expenses, so national tables cannot give the full Band D in each of their parishes and unparished areas (docs/TOWNS-RESEARCH-2026-11-15.md, part 1, sections 2 and 3: Rushcliffe off by 22.05 everywhere, Chorley by varying amounts, Westminster by 0.40). The town league table leaves them out until each council's own published schedule is held.

Read first: CLAUDE.md, docs/TOWNS-RESEARCH-2026-11-15.md part 1, data/local-bills/burnley-2026-27.json and scripts/import-local-bills.py (the pattern to copy), docs/towns-research/rush.py and chor.py.

Work:
1. List the councils from data/national/england.json: components[gss].specialExpensesPounds above 0 and at least one parish row. Expect 48 with parishes (49 in all).
2. For each, find the council's own official 2026/27 council tax charges document that lists the Band D (or all bands) total per parish and for the unparished or special expense areas. Council domains only. Save the raw file under data/raw/schedules/<slug>-2026-27.<ext> with sha256, URL, landing page, publisher and retrieved date.
3. Extract to data/towns/schedules/<slug>-2026-27.json: per area the name as printed, the matching MHCLG parish code where one exists (exact name within the council, otherwise a reviewed mapping with evidence), the Band D total in pence, and the band A to H totals where printed. Quote from the raw text, never a fetch summary.
4. Checks per council, all recorded: every area's Band D minus that parish's MHCLG Band D minus the majors (Table 10 parts) gives the same basic amount, plus only that area's special expense; Band A equals 6/9 of Band D to the penny where both are printed; every MHCLG parish row of the council is covered or listed as missing. Known trap: Chorley's web page prints Bretherton Band D as 2,224.72 when Band A implies 2,442.72, and Hoghton is 30p out. Where a council source is internally inconsistent, hold that council (no file) and record why; do not correct it.
5. docs/TOWNS-SCHEDULES-2026-11.md: one row per council: status (held, held with gaps, not found, inconsistent), source, area count, check results. Councils not found stay out; never estimate.
Verification: npm test, npm run test:text, a script that recomputes every check from the raw files. PR body: the table and the count held.
```

## 4. W1: two ways to play across the budget area (Codex)

```text
Repository tompickup23/ukcounciltax. Worktree ~/wt/uct-w1 on new branch feat/w1-budget-doors from origin/main, after PR 88 has merged (check: git log origin/main mentions C6; if not, stop and say so). Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook. One PR, draft until every gate below is green. Do not merge or deploy.

Read first: CLAUDE.md, docs/STATE.md, docs/DESIGN-AUDIT-2026-11-15.md (direction "Ledger and Desk", the findings "Set the budget yourself has one way in" and "Budget game hero and rounds look primitive", workstream W1 and its gates), src/components/PlayBand.astro (W0's two-door band, reuse it), src/lib/budget-set-entry.ts, scripts/lib/budget-game.mjs and scripts/lib/face.mjs (the pinned gates), tests/fixtures/c1b-static-numbers.json.

Scope (W1 in the audit, with W6 not required because W0 shipped the doors):
1. Game hero on /tools/budget/<slug>/: a desk band with the existing H1 text unchanged byte for byte, two toned through a span only; a two-door chooser, Guess and Set as equal full-card links with 44px targets. The [data-budget-set-entry] element and its exact text stay inside the Set door. No digits in door copy; no modelled figure on the game page.
2. budgetSetEntry extended with a tested Burnley scenario branch and an England guard. No /set/ link for Burnley or the 98 other ineligible councils; never rendered for a non-England GSS.
3. A mode switcher (Guess, Set, and for Burnley the council's own gap) as plain links.
4. /tools/budget/ hub: hero with the two doors (PlayBand), a featured councils strip using the existing OG cards in public/og/budget, and a Set column for eligible rows (W0 put a link in each row; make it a real column that reads well at 375px).
5. "Now set it yourself" in the final score card, eligible councils only.
Use only existing tokens and the estate font; interim desk bands on --ground until Estate Kit 0.6.4. Decorative thumbs are aria-hidden SVG with no text and no ek-chart class.
Gates: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, npm run test:csp, the browser suite (docs/STATE.md local trap), /design-check at 390 and 1440 in light and dark on /tools/budget/, /tools/budget/leeds/, /tools/budget/burnley/ and /tools/budget/camden/; budgetGameProblems green (exact H1 and title, rail li count, no grid in .game-lead, in-SVG sources, one light PNG per round, gzip ceiling, static OG); c1b fixture unchanged or the allowance stated; number diff with the allowed pages listed; 375px no overflow; axe. PR body in the design check format (memory: plan-and-ci traps), with screenshots, and "Built with Codex from a prompt prepared in Claude Code."
```

## 5. Towns stage 2: pages, SEO and design (Claude Code, Opus)

```text
Repository tompickup23/ukcounciltax. Worktree ~/wt/uct-towns-pages on new branch feat/towns-pages from origin/main, after session 2's PR (feat/towns-data) has merged. Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook. One draft PR. Do not merge or deploy.

Goal: the town league table, done to a very high aesthetic standard and built to be found in search. Tom asked for cheapest and most expensive towns, with region, county, council area and constituency filtering, and SEO.

Read first: CLAUDE.md, docs/STATE.md, docs/TOWNS-SOURCE-NOTES.md (session 2), docs/PROMPTS-2026-11-15-W1-W3-AND-TOWNS.md (decisions T1 to T5), docs/TOWNS-RESEARCH-2026-11-15.md parts 3 (implementation map, file and line references) and 4 (design spec), docs/DESIGN-AUDIT-2026-11-15.md (Ledger and Desk), src/pages/council-tax/ranked/ and src/pages/precepts/parishes/ (patterns), src/lib/towns.ts.

Build:
1. Routes, all self canonical and in the sitemap: /council-tax/towns/ (hub), /council-tax/towns/region/<slug>/ (9), /council-tax/towns/county/<slug>/, /council-tax/towns/constituency/<slug>/ (T5). No per council route: add a full Band D column and a link on each existing /precepts/parishes/<slug>/ page instead. No per parish pages; each row has a stable anchor id from its MHCLG code.
2. Hub: a desk hero with the pair (the lowest and highest full Band D in England with place, council and the gap), "Lowest ten" and "Highest ten" ledgers, a distribution strip (kit PositionStrip or RankedBars with neutral titles, chart actions, PNG and table twin), the larger places table (T3), grids linking every region and county, and a plain sentence naming the five lowest and five highest places so the text is crawlable. The hub never ships all rows.
3. Region, county and constituency pages: the same hero pattern scoped to the area, then the full table (position, place, council, county, constituency, full Band D, parish part, parish change, status chip), static HTML fully readable without JavaScript. Progressive filters in one hashed client script (no inline script): council and constituency selects, a place search, the larger places toggle, sortable columns, a live count. At 375px rows become cards with no horizontal overflow; the longest names checked.
4. Rows without a figure (special expense councils not yet held, Temples, partial charter trustee cover) are listed with a status chip and the note, never as zero and never in the order.
5. SEO: titles and descriptions per T2 with figures from data; H2s phrased as the questions people search; JSON-LD Dataset plus an ItemList of the lowest and highest ten (names and anchors only); OG cards with the pair; Pagefind indexes place names on these pages; inbound links from /council-tax/ranked/, /precepts/parishes/ and each parish page, the council profile's parish section, /precepts/ and the footer or nav (tests/site.test.ts caps the header at 15 items); llms.txt.
6. Sources: every figure has its source line within its data-fact block; a "How this is calculated" drawer gives the formula with the Burnley Padiham worked example from data, the special expense and charter trustee rules, and the 1p rounding note.
Gates: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, npm run test:csp, the browser suite, /design-check at 390 and 1440 light and dark on the hub, /council-tax/towns/region/north-west/, /council-tax/towns/county/lancashire/ and one constituency page; tests modelled on tests/rankings-pages.test.ts (exact row counts, ties, anchors, the T2 word rule scoped to these routes); canonical test URL count updated; number diff with allowed pages listed; HTML size of the largest county page in the PR body; 375px no overflow; axe. Ask Tom before merge.
```

## 6. W2: set page workbench, part 1, layout and controls (Codex)

```text
Repository tompickup23/ukcounciltax. Worktree ~/wt/uct-w2 on new branch feat/w2-set-workbench from origin/main, after W1 (feat/w1-budget-doors) has merged (check; if not, stop and say so). Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook. One PR, draft until every gate is green. Do not merge or deploy.

Read first: CLAUDE.md, docs/STATE.md, docs/DESIGN-AUDIT-2026-11-15.md (finding "Set page is a document of caveats, not a tool", workstream W2 and its gates, decision D10), src/pages/tools/budget/[slug]/set.astro, src/scripts/budget-freeze.ts, data/pilots/budget-freeze*.json, tests/budget-set.test.ts.

Tom's decision D10, 15 November 2026: option (a), one or two presets (for example "Raise to the referendum trigger"), each labelled as a user requested scenario with its assumptions and the budget-freeze model version.

Scope: controls in the first screen of /set/. A compact hero with a three-cell result board and the published starting figures as source lines; assumptions folded into "How this exercise works" with a visible summary, scenario label and model version; service cards with the pound value, a change chip, a 0.5% range with the published tick, steppers of at least 44px, percentage chips, exact-pounds entry and a source disclosure, aria-valuetext in pounds; the tax control with the published charge and referendum trigger marks; the theme toggle kept and restyled as a small icon; the ledger closed by default; the D10 presets, which give the 16 frozen-charge councils something to do on arrival.
Gates (audit W2): arithmetic in 1/10000 pound units unchanged with unit tests; logic only in src/scripts/budget-freeze.ts, no inline script; chromeProblems and tests/budget-set.test.ts green (one memory-only theme button); without JS the baseline, assumptions, ledger and noscript notice stay readable; debounced live region; forced-colors rules; 375px no overflow; desktop page under 3,000px (now 8,700px); CLS at or below 0.1; axe; npm test, npm run check, BUILD_OG=1 npm run build, test:dist, test:text, test:csp, browser suite; /design-check at 390 and 1440 light and dark on /tools/budget/leeds/set/, /tools/budget/hyndburn/set/ and one frozen-charge council. PR body with page heights before and after, screenshots, and "Built with Codex from a prompt prepared in Claude Code."
```

## 7. W3: set page workbench, part 2, feedback, meter, keep and next (Claude Code, Opus)

```text
Repository tompickup23/ukcounciltax. Worktree ~/wt/uct-w3 on new branch feat/w3-set-feedback from origin/main, after W2 (feat/w2-set-workbench) has merged (check; if not, stop and say so). Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook. One draft PR. Do not merge or deploy.

Read first: CLAUDE.md, docs/STATE.md, docs/DESIGN-AUDIT-2026-11-15.md (workstream W3 and its gates), the merged W2 PR body, src/pages/tools/budget/[slug]/set.astro, src/scripts/budget-freeze.ts, the vendored ZeroBar.astro, and /Users/tompickup/tompickup.co.uk/src/data/burnley-budget-game/game.html lines 123 to 133, 300 to 305 and 961 to 985 (CSS only, never copy, framing or palette).

Scope: a gap bar with a target line, token state colours with text labels, and a stamp at exactly zero with neutral wording ("Arithmetic balances"); a phone fixed meter (amount at 2rem, gap track, one-word state, a short visible scenario label, safe-area padding, scroll-padding-bottom equal to its height); a diverging ZeroBar summary of service changes; "What next" (the bill, increases, compare with a prefilled side, four neighbour set links filtered by eligibility); "Copy your scenario" and a print view, both carrying the scenario label and model version.
Gates (audit W3): as W2; the meter never obscures the focused element (WCAG 2.2, 2.4.11) and is static at 200% zoom; no storage and no request, so the privacy statement stays true; a unit test over the clipboard text builder for U+2013, U+2014 and the spaced hyphen; a print snapshot test; /code-review at high on your own diff before asking Tom; /design-check at 390 and 1440 light and dark. Ask Tom before merge.
```

## R. Review of a Codex PR (Claude Code, Opus)

```text
Repository tompickup23/ukcounciltax, PR <number> (<branch>, worktree <path>), written by Codex from docs/PROMPTS-2026-11-15-W1-W3-AND-TOWNS.md prompt <n>. Node 22.23.4 first on PATH. British English; no dashes. Stage named paths only.
Review as a reader who did not write it: read the full diff against its prompt's scope and gates and the design audit. Run /code-review at high, /design-check on the prompt's pages, and confirm CI's browser, CSP and 375px runs. Check every figure has its source line, no modelled figure appears where the gates forbid it, no individual is named, no inline script. Fix what you confirm on the branch, a commit per fix with a line in the PR body; rerun the gates and the number diff. Put the result to Tom in one message and ask for the merge yes. Merge only on it, as its own step, never during a publish run; then check the live pages and say which session can start next.
```
