# Prompts | 15 November 2026

Written after the review of the three Codex sessions of 14 November (session A, function names, compact rows). PR 78 (NV8 map) and estate-kit PR 26 merged on 15 November; kit `v0.6.3` is tagged. This file replaces `docs/CODEX-PROMPTS-2026-11-14-PARALLEL.md` for everything not yet run. Each block is pasted alone. None authorises a merge, tag or deployment.

## Run now, in parallel

The three touch different repositories or different files. Prompt 3 shares `package.json` and `scripts/check-dist.mjs` with open PRs; it rebases on whichever lands first.

| Prompt | Tool | Repository | Touches |
|---|---|---|---|
| 1. Cohort fix pass | Codex | ukcounciltax, PR 80 | `scripts/lib/c2-cohort.mjs`, pilot data and tests, pilot pages, the cohort note |
| 2. Official names at source | Codex | ukplaces | the registry build and its source block |
| 3. Kit 0.6.3 on the tax site, and PR 81 review | Claude Code, Opus | ukcounciltax | `src/vendor/estate-kit`, `src/lib/kit-charts.ts`, `scripts/check-dist.mjs`, `/increases/` |

## Queued, with what releases each

| Prompt | Runs after |
|---|---|
| 4. Set the budget on the public site (session B) | PR 80 merged |
| 5. Registry refresh on both sites, with PR 57 folded in | Prompt 2 merged and UK Places deployed |
| Gates pack (plan section 5, session 10) | PR 80 merged (both change `scripts/inject_csp_hashes.mjs`) |
| NV11, compare as paired bars | Tom's decision: browser drawing, or bars for a fixed set of pairs |

Decisions taken in the review (Tom, 15 November 2026):

- **C2 own share tolerance.** The own share check stays, with its bound derived from printed precision. RA prints total and parish in thousands, so each may differ from Table 10 by up to half a thousand pounds, and own share (total less parish) by up to the sum of the two. Testing own share at half a thousand demanded more precision than the source prints, and excluded 22 councils (Trafford among them) through two passing checks combined.
- **Official names.** No interim label. `officialName` is fixed at source in UK Places from GOV.UK Local Links Manager (decision D1, 9 November), then refreshed into both sites. UK Councils PR 57's code is correct and lands with that refresh.

## 1. ukcounciltax: cohort fix pass on PR 80 (Codex)

```text
Repository tompickup23/ukcounciltax. Continue draft PR 80 on branch feat/budget-c2-cohort in the existing worktree ~/wt/uct-c2-cohort (clean at b0573fd; git pull first). Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. Merge origin/main in first with a merge commit (main now has PR 78); never rebase or force push. When done: commit, push, update the PR body, mark the PR ready for review with gh pr ready. Do not merge, tag or deploy. No public route: output stays in .ops/c2-dist.

Why: review of PR 80 found the own share test is not independent. Own share is total less parish, so the own difference equals the total difference less the parish difference, within Table 10's own whole pound printing. All 27 councils whose only reason is own-difference show exactly that. Testing own at half a thousand pounds asks for more precision than RA prints. Tom decided: keep the check, with its bound derived from printed precision.

Read first: CLAUDE.md, the PR 80 body (gh pr view 80), docs/C2-COHORT-2026-11-15.md, scripts/lib/c2-cohort.mjs, scripts/lib/c2-referendum.mjs, src/lib/budget-freeze.ts, src/lib/budget-freeze-data.ts, pilot/, tests/budget-freeze.test.ts. data/raw/ is already in the worktree; stop if any of the seven recorded hashes differs.

Build:
1. Tolerances from printed precision. Find whether the RA guidance or file states its rounding rule. Total and parish: the bound is half a thousand pounds each. If a rule is stated, use the exact interval it implies (for half up rounding, Table 10 minus RA times 1000 lies in [minus 500, plus 500) ); if none is stated, use the closed interval and say so. Own share: the bound is the sum of the total and parish bounds plus Table 10's own whole pound printing. Write the derivation in docs/C2-COHORT-2026-11-15.md in five lines or fewer. Keep the own check as an assertion: if it ever fails while total and parish pass, the audit fails as a fixture error, not an exclusion.
2. Rebuild the manifest and fixture with node scripts/audit-c2-pilot.mjs. Expected: up to 192 eligible (170 plus the 22 that failed only own share). Burnley stays excluded on its parish component. Report the new count by class and the principle counts; Trafford should now carry the 7.5% rule. Recheck Hull and West Northamptonshire (total exactly 500 pounds out) against the interval from step 1 and record the outcome for each.
3. Tax join tolerance: c2-cohort.mjs line 108 adds 50n (half a penny in 0.0001 pound units). Whole pound printing needs half a pound, 5000n. Fix and record whether any decision changes.
4. Tests: add referendum tests with a prior whose threshold does not divide evenly in pence (for example 5% of 1,731.05 pounds, and 3% of a district prior where the pound condition decides), one penny below, at and above. Add boundary tests for each tolerance at, inside and outside its bound.
5. Year and rule text: replace the hard coded 2026/27 in pilot/scripts/freeze.ts and pilot/pages/[slug].astro, and the hard coded 3% and 5 pounds in src/lib/budget-freeze.ts, with values read from the model edition and referendum data. Session B builds on this.
6. The production data tripwire: src/lib/budget-freeze-data.ts hashes four production files, so a refresh of any of them fails npm test on main. Keep the tripwire, make its failure name the changed file and the exact rebuild command, and record it in docs/RELEASE.md under limitations.
7. Correct the PR body: the cohort counts, the exclusion table, the "not pooled" sentence (replace with the derivation), and the ten hand checks if any changes. Replace docs/STATE.md in at most 20 lines.

Stop only for a raw hash mismatch, a security header test you cannot pass without weakening the policy, or a secret in the diff.

Verification: npm test (serial with --maxWorkers=1 if timeouts appear; change no timeout or assertion), npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, node scripts/audit-c2-pilot.mjs --check, npm run build:pilot, python3 scripts/check-c2-decimal.py, the pilot browser checks at 375 and 1440 in both themes for Trafford and two previously eligible councils, and the production CSP suite. The number diff must show no public page changed.
```

## 2. ukplaces: official names from GOV.UK Local Links Manager (Codex)

```text
Repository tompickup23/ukplaces. One PR. Clone to ~/ukplaces if absent; worktree ~/wt/ukplaces-official-names on branch data/official-names-2026-11 from origin/main. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. Never commit a secret, a home path or anything from ~/Documents. When done: commit, push and open the PR. Do not merge, tag or deploy.

Why: the registry's officialName is mostly the short name plus "Council" ("Birmingham Council", "Bromley Council", "Kingston-upon-Hull Council"), a display name from AI DOGE, not the council's name. UK Councils PR 57 would print it in the responsibility table on 292 profiles, so it is parked until the field is right at source. Tom decided the source on 9 November 2026 (D1): GOV.UK Local Links Manager, Authority Name.

The specification is item 1a of the brief in tompickup23/ukcouncils, commit 3f5041f, file docs/REORGANISATION-PANEL-BRIEF.md (read it with git show 3f5041f:docs/REORGANISATION-PANEL-BRIEF.md in ~/ukcouncils, lines 37 to 60 and 183 to 191). Follow it exactly: the export URL, the GSS join by exact code, copy Authority Name as printed with no tidying, pin the edition (last-modified, retrieval date, SHA-256 in the registry source block), fail on a code yielding two names, the eight predecessor joins with officialNameVia, North Yorkshire and Somerset keep their existing value, ignore export rows outside the 361 places and 21 county councils, county councils in county-councils.json the same way, listed separately.

Add one guard the brief does not have: fail the build if any officialName has no source, meaning it is not from an export row, not reached through a listed predecessor, and not one of the two listed kept values. Report the count of values that equal the short name plus " Council" after the change, each with its export row (some are genuine, for example "Cornwall Council").

Do not change slug, name, type, country, region, county, parentGss or reorganisation. The reorganisation field stays as it is; its Lancashire note is recorded as withdrawn and is held on both tax sites.

PR body: every changed officialName with old value, new value and export row; the predecessor joins; the two kept values; the county council changes; the pinned edition. The 9 November dry run expected 284 changes among 353 directly held codes plus up to 6 through predecessors; a different count is fine if each difference is explained by a newer edition. Verification: UK Places' own tests and build, and a field by field diff showing only officialName changed.
```

## 3. ukcounciltax: Estate Kit 0.6.3, compact district bars, and the PR 81 review (Claude Code, Opus)

```text
Work in tompickup23/ukcounciltax. Read CLAUDE.md, docs/STATE.md and docs/CODEX-PROMPTS-2026-11-15.md first. Two parts, in order. Do not merge or deploy anything; Tom approves merges.

Part 1, PR 81 (Burnley bill explained, feat/burnley-bill-explained). Its number diff failed only for a missing allowance; "Pages allowed to differ: precepts/index.html" was added to the body on 15 November and the failed job rerun. Read the checks on the head. Then review the diff against the data rules in CLAUDE.md: every figure sourced nearby, the importer's reconciliation gates, no derived bands, no individuals named, the /bill 302 in public/_redirects and its tests. Spot check four figures against the raw files. Report: ready, or the findings with file and line. The /bill short address is for the films' end cards and goes live only with Tom's yes.

Part 2, kit adoption. Worktree ~/wt/uct-kit-063, branch feat/kit-063-compact from origin/main. UK Council Tax is on kit 0.6.0; 0.6.1 (a dash guard that names no entity), 0.6.2 and 0.6.3 (RankedBars density: "compact") are tagged. Vendor v0.6.3 with the kit's own scripts/vendor.mjs, never by hand, and keep verify-vendor first in the build.
1. Draw the current year district increase bars on /increases/ (164 rows) with density "compact". If any real district name throws for lack of room, report the name and the measured shortfall; do not truncate, abbreviate or shrink text. Decide with Tom before changing the layout to fit.
2. Retire the two 24,500 px increase PNGs if the compact drawing's PNG replaces them; report the new pixel height.
3. Drop KIT_DASH_GUARD from scripts/check-dist.mjs if 0.6.1's guard makes it unnecessary; prove it by the dist check passing without it.
4. Check every other kit chart on the site is byte identical apart from the version stamp; list any that is not, with the reason.
Verification: npm test, npm run check, BUILD_OG=1 npm run build, test:dist, test:text, the production CSP suite, /design-check on /increases/ at phone and desktop in both themes. Number diff allowance: increases/index.html, SVG only, no body figure changes. Open a PR with the measurements (height at 375 before and after, PNG heights, smallest text). If PR 81 merges first, rebase onto main before opening.
```

## 4. ukcounciltax: set the budget on the public site, session B (Codex, after PR 80 merges)

Defaults below are recommendations for Tom to confirm or change before pasting: the prototype range of zero to twice each positive published amount becomes the public range, labelled as an exploration range and not a forecast; the mode sits beside the Burnley scenario link, it does not replace it.

```text
Repository tompickup23/ukcounciltax. One PR. Worktree ~/wt/uct-c2-public on branch feat/budget-c2-public from origin/main (PR 80 merged). Copy data/raw/ from ~/wt/uct-c2-cohort/data/raw/ and check the seven recorded hashes. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public. Cite no new source and estimate nothing. When done: commit, push and open the PR. Do not merge, tag or deploy.

Why: PR 80 audited which councils can have the set the budget mode and under which referendum rule, and built it as a local pilot. This session puts it on the public site. It is stages 4 to 6 of docs/C2-PILOT-2026-11-13.md.

Read first: CLAUDE.md, docs/STATE.md, docs/C2-PILOT-2026-11-13.md, docs/C2-COHORT-2026-11-15.md, docs/RELEASE.md, pilot/, src/lib/budget-freeze*.ts, data/pilots/, the existing game at src/pages/tools/budget/, and src/lib/site.ts (STATIC_PATHS).

Build:
1. Route /tools/budget/<slug>/set/ for each eligible council, from the pilot page, in the production layout. Each existing /tools/budget/<slug>/ page gains one line: "Set the budget yourself" linking to it for eligible councils, or the manifest's plain reason for excluded councils. Never an estimate or national average in place of an excluded council. Burnley keeps its scenario link; the new line sits beside it.
2. Range: zero to twice each positive published amount, labelled as an exploration range, not a forecast or a deliverable budget. Published zeros and fixed lines stay fixed and say why.
3. Phone first: controls usable at 375 px with no horizontal overflow; the ledger and the referendum result stay readable without JavaScript (static values, inert controls hidden).
4. Every amount has its source nearby: RA, Table 10, the referendum report page and paragraph. Model version and assumptions visible, separate from observed figures. No storage, no network request, no saved choices.
5. Sitemap, canonicals, structured data and the search index include the new pages; noindex is removed only on them. Scripts are external or hashed by postbuild; no inline script permission.
6. Durable browser tests: three councils of different classes at 375 and 1440 in both themes, a referendum crossing at one penny, reset, invalid input, no script, axe.
7. docs/RELEASE.md: provenance, model version, limitations (including the production data tripwire). Replace docs/STATE.md in at most 20 lines.

Verification: npm test, npm run check, BUILD_OG=1 npm run build, test:dist, test:text, node scripts/audit-c2-pilot.mjs --check, the production CSP suite, /design-check on one set page and one excluded council's budget page. Number diff: list under "Pages allowed to differ" tools/budget/*/set/index.html (added) and tools/budget/*/index.html (one added line, no figure removed).
```

## 5. ukcouncils and ukcounciltax: registry refresh with official names (Codex, after prompt 2 is merged and UK Places is deployed)

```text
Repositories tompickup23/ukcouncils and tompickup23/ukcounciltax. Two PRs, one per repository. Node 22 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook. Both repositories are public. When done: commit, push and open both PRs. Do not merge, tag or deploy.

Follow items 1b and 1c of docs/REORGANISATION-PANEL-BRIEF.md (ukcouncils commit 3f5041f, lines 49 to 60), with these changes since it was written:
1. ukcouncils: branch data/registry-refresh-2026-11 from origin/main. Refresh data/registry/councils.json from UK Places through the existing build route, never by hand. Then cherry pick commit 8ea2e12 from fix/function-names (PR 57) onto it, update its tests to the refreshed official names, and close PR 57 with a link to the new PR. One number diff covers both.
2. The reorganisation field stays held on both sites from 13 November (each CLAUDE.md, "Held data"). The refresh must not render it; npm run test:dist and tests/reorganisation-held.test.ts must pass. If the refreshed field differs from the held one, list the difference and change nothing about rendering.
3. ukcounciltax: branch data/registry-refresh-2026-11 from origin/main, the same refresh; list pages whose JSON-LD name or finder data-name changes.
PR bodies: the field by field diff against the previous file (expected: officialName changes from UK Places, the county changes the brief lists, sister links from live sitemaps; anything else is a stop), the pages allowed to differ, and the verification each CLAUDE.md requires.
```
