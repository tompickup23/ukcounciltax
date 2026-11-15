# Prompts | next sessions after 15 November 2026

Written in Claude Code on 15 November 2026 after every Codex session on both sites finished. This file replaces `docs/CODEX-PROMPTS-2026-11-15.md` for everything not yet run. Each block is pasted alone. None authorises a merge, tag or deployment unless the block says Tom has given that yes.

## Status, 15 November late evening (read this first)

Done on 15 November: PR 84 merged and live (`4625f53`); UK Councils PRs 59 and 60 merged (prompts 2 and 7); UK Places PRs 53 and 54 merged and deployed (prompts 3 and 3b); PR 85 merged. Prompt 5 is running in Codex. Plan section 10 is the look ahead. The tables below this one are the afternoon record.

| Step | Session | Starts when |
|---|---|---|
| Prompt 5 review and merge, both sites | This Claude Code session | When its two PRs are green |
| Prompt 8, C6 levels day staging | New Claude Code session, Opus | Now |
| Prompt 9, dossier gate definition | Codex, ukcouncils | Now |
| Prompt 10, estate-kit scrub report | Codex, estate-kit | Now |
| Measurement note, weekly | Claude Code | Monday 17 November |
| Prompt 4, gates pack | Codex | After X3 |
| Prompt 6, council links rerun | Codex | 1 to 5 December 2026 |
| Composition, audit status, section 114 builds | Not written | After Tom's decisions in plan section 10.3, by 15 December |

Merge order matters for `docs/STATE.md`: PR 59 before PR 60 on UK Councils; PR 85 before any later docs PR here.

## Where things stand

- **Live:** UK Councils main `f4311a8` (PR 58, registry refresh) and UK Council Tax main `584968e` (PR 81, the bill explained; `/bill` returns 302 to `/precepts/#find-your-bill`). Both publishes and IndexNow runs succeeded.
- **Open:** UK Council Tax PR 84, the public set the budget mode for 197 councils at `/tools/budget/<slug>/set/`, branch `feat/budget-c2-public`, worktree `~/wt/uct-c2-public`. Not merged.
- **The session that ran outside a worktree** was the main UK Councils checkout on `data/registry-refresh-2026-11`. Its tree is identical to main `f4311a8`. Nothing was lost. The checkout was returned to `main` on 15 November.
- **Held:** the registry `reorganisation` field on both sites; seats by party (B2 source notes, section 5); funding share bars, sparkline tiles and history strips (X1).

## Run now, in tandem

One writer per repository. The three touch different repositories.

| Prompt | Tool | Repository | Touches |
|---|---|---|---|
| 1. PR 84 review, merge on Tom's yes, measurement note | Claude Code, Opus | ukcounciltax (PR 84 branch), then read only | PR 84 files only; `docs/MEASUREMENT.md` |
| 2. Dossier source pass: audit status, section 114, composition options | Codex | ukcouncils | new files under `docs/` and `data/sources/` only |
| 3. Folkestone and Hythe short name at source | Codex | ukplaces | the registry build and its overrides |

## Queued, with what releases each

| Prompt | Runs after |
|---|---|
| 4. Gates pack | PR 84 merged, and X3 settled (estate-kit CI) |
| 5. Registry refresh for the short name | Prompt 3 merged and UK Places deployed |
| 6. Council links rerun | Any day in December 2026; `src/lib/council-links.ts` fails every build from 4 January 2027 |
| Composition build (seats by party) | Tom chooses a source from prompt 2's dry run |
| C6 levels day staging | Written in December, after the provisional settlement; staged by mid January 2027 |
| NV11, compare as paired bars | Tom's decision: browser drawing, or bars for a fixed set of pairs |

## Decisions for Tom

1. **Merge PR 84.** It adds 197 indexable pages. Prompt 1 brings it to a merge ready state and asks.
2. **X3.** Settle estate-kit's Actions billing, or make estate-kit public after a scrub for private paths, secrets and anything from Reports. It blocks the gates pack.
3. **X4, worktrees.** Safe to remove (branch merged or folded in, tree clean): `~/.codex/worktrees/ukcouncils-spending-gss`, `~/wt/ukc-docs-1114`, `~/wt/ukc-function-names`, `~/.aidoge-worktrees/ukcounciltax-pr15-rebase`, `~/wt/uct-c2-cohort`, `~/wt/uct-docs-1115`, `~/wt/uct-handoff-1110c`, and this handoff's `~/wt/uct-docs-1115b` and `~/wt/ukc-docs-1115` once their PRs merge. Keep `~/wt/uct-ci` and `~/wt/ukc-search` (prompts copy `data/raw/` from them), `~/wt/uct-c2-public` (PR 84; its `data/raw/` is the C2 copy), `~/ukcouncils-pound` (draft Public Pound pages, not for release, no PR) and `~/wt/uct-c6-switch` (empty branch for C6).
4. **Shepway slug.** UK Places exports short name and slug `Shepway`. Prompt 3 fixes the short name. Changing the slug changes URLs on both sites and needs redirects; it is a separate yes.
5. **Seats by party source**, after prompt 2: a pinned, dated, hashed copy of Open Council Data's composition table (third party, CC BY-SA), or a register built from each council's own composition page.
6. **NV11.**

## 1. ukcounciltax: PR 84 review, merge on Tom's yes, then the first measurement note (Claude Code, Opus)

```text
Repository tompickup23/ukcounciltax, PR 84 (feat/budget-c2-public, worktree ~/wt/uct-c2-public). Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook.

Read first: CLAUDE.md, docs/STATE.md, docs/PROMPTS-2026-11-15-NEXT.md (this file), the PR 84 body, docs/C2-COHORT-2026-11-15.md, docs/RELEASE.md.

0. The handoff for this session is in two docs PRs opened on 15 November: ukcounciltax docs/next-session-prompts-2026-11-15 and ukcouncils docs/state-2026-11-15. If they are still open, read their checks and ask Tom whether to merge them. Merging deploys both sites.
1. Review PR 84 as a reader who did not write it. Read the full diff. Check against both rule sets: no estimate (every amount traces to an RA cell, a Table 10 cell or the referendum report), no named individual anywhere including OG cards and JSON-LD, a rule and a date and never a motive in the 99 exclusion reasons, the source line under every figure, the exploration range labelled as such and never as a forecast or a cap, no storage, no network request, no inline script. Run /code-review on the PR at high, then /design-check on /tools/budget/huntingdonshire/set/, /tools/budget/camden/set/ and /tools/budget/burnley/ (excluded). Check the 375 px layout run and the CSP run passed in CI.
2. Fix what you confirm on the PR branch, with a commit per fix and a line in the PR body. Rerun npm test, npm run check (grep the "- N errors" line), BUILD_OG=1 npm run build, test:dist, test:csp and the number diff.
3. Put the result to Tom in one message: what you checked, what you changed, the number diff line. Ask for the merge yes. Do not merge without it.
4. On Tom's yes: merge, watch the Verify and publish run, then check three live set pages, one excluded budget page and the sitemap count on the live host. Report the merge commit.
5. First measurement note, weekly from 17 November (execution plan 8.5): create docs/MEASUREMENT.md with ten shared URLs, five per site, chosen once and written in the file header (the home page, /councils/, Burnley, Birmingham and one set page on this site; the home page, /councils/, Burnley, Birmingham and /sources/ on UK Councils). Per URL: Cloudflare page loads for the week, Search Console clicks, impressions and Google's chosen canonical, each with the date read. Read Cloudflare and Search Console in Tom's Chrome; never type a password or handle a 2FA prompt; if a sign in is needed, ask Tom. Judge nothing on less than two weeks of data. Commit it on a docs branch and open a PR.
6. Replace docs/STATE.md in at most 20 lines in the PR that lands last. Ask Tom about X4 using the list in this file; remove only what Tom approves, with git worktree remove, never rm.
```

## 2. ukcouncils: dossier source pass for audit status, section 114 and composition options (Codex)

```text
Repository tompickup23/ukcouncils. One draft PR. Worktree ~/wt/ukc-dossier-sources on branch docs/dossier-sources-2026-11 from origin/main. Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including JSON. Stage named paths only. Never bypass the pre-commit hook. The repository is public. No page, component, route or test changes rendering in this PR: documents, pinned source files and a dry run only. When done: commit, push and open a draft PR. Do not merge, tag or deploy.

Why: docs/DOSSIER-STATE-2026-11-14.md leaves the dossier incomplete for the mid January 2027 gate on source dependencies. Two of them can be resolved now with research: C3 (section 114 notices and external audit status) and C2 (seats by party, held since B2 on a source decision). The dossier must be live on all 296 English billing profiles by mid January 2027.

Read first: CLAUDE.md, docs/STATE.md, docs/DOSSIER-STATE-2026-11-14.md, docs/DOSSIER-SOURCE-NOTES.md, docs/B2-FRONT-DOOR-BRIEF.md (decision 1 and the visual 2 appendix), docs/B2-FRONT-DOOR-SOURCE-NOTES.md (section 5), docs/IMPROVEMENT-PLAN-2026-09-27.md (lines 195 to 205), src/lib/redaction.ts.

Work:
1. External audit status. Find the official, dated, per body publication of local audit opinion status for English councils (for example the MHCLG or PSAA publication on the local audit backlog and backstop dates, or the NAO). Record publisher, title, table, date or edition, URL, file hash and licence. Dry run: exact GSS or ONS code joins to the 296 profiles, coverage count, the years covered, and the bodies with no row. Say what each value is a count or status of, in the publisher's words.
2. Section 114 notices. Find whether any official register exists. If none, say so and list what a council by council register would need (the notice document on the council's own site, its date and the section of the Local Government Finance Act 1988 it cites). Record any notices found from official documents only, each with date and URL. Never infer a notice from Exceptional Financial Support, and say nothing about cause.
3. Seats by party, both options for Tom. Option A: a pinned, dated, hashed copy of Open Council Data's current composition table; record its licence, date, coverage and whether it reflects the 7 May 2026 elections. Option B: each council's own published composition page; sample 20 councils across all classes, record the URL, the date the page shows, the party totals, and whether the total equals the number of seats. For both: reconciliation of seat totals, councils changed by by-elections or defections since the last election, and the cost of keeping it current. Party totals only; never a councillor's name, in any file, including raw copies (strip names before committing).
4. Write docs/DOSSIER-SOURCES-2026-11.md: one section per item, each ending with what a build would show, what it would leave absent, and the decision Tom must take. Pinned raw files under data/sources/ with hashes in a manifest. A dry run JSON per item.
Verification: npm test, npm run check, npm run test:text on the new files, and a grep that no person's name appears in the new files.
```

## 3. ukplaces: Folkestone and Hythe short name at source (Codex)

```text
Repository tompickup23/ukplaces. One PR. Clone or reuse a worktree; branch fix/folkestone-hythe-short-name from origin/main. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook. The repository is public. When done: commit, push and open the PR. Do not merge, tag or deploy.

Why: the registry export gives GSS E07000112 the short name "Shepway" and slug "shepway". The council has been Folkestone and Hythe District Council since 1 April 2018 (officialName already says so, from GOV.UK Local Links Manager). UK Councils and UK Council Tax read this export.

1. Find where the short name comes from in the build and correct it at source to "Folkestone and Hythe", citing the change of name order or the council's own statement, with publisher, title and date. No hand edit of a built file.
2. Do not change the slug. Inventory every URL on UK Places, UK Councils (ukcouncils.co.uk) and UK Council Tax (ukcounciltax.co.uk) that carries "shepway", from each site's live sitemap. Put the list and what a slug change would need (301s on each site, sitemap, canonicals, IndexNow) in the PR body as a decision for Tom.
3. Check no other record has a short name that disagrees with its officialName in a way that is a renamed body, not an abbreviation; list any found, change none.
Verification: the repository's own test and build commands; the export diff shows exactly one changed field.
```

## 4. Gates pack (Codex, after PR 84 merges and X3 is settled)

```text
Repositories tompickup23/estate-kit, then tompickup23/ukcounciltax and tompickup23/ukcouncils. Three PRs, kit first. Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook. When done: commit, push and open the PRs. Do not merge, tag or deploy.

Why: stage 2 of the kit's upgrade plan. Both sites carry their own copies of the same gates: the CSP hash injector (scripts/inject_csp_hashes.mjs), the built page check (scripts/check-dist.mjs), and the text gate (dashes, held words, the motive word list). They drift. Lift them into estate-kit as one versioned gates module, delivered by the existing vendor command, with each site keeping only its configuration (site URL, held fields, allowed connect-src hosts, pages allowed to differ).

Read first: each repository's CLAUDE.md and docs/STATE.md; estate-kit's upgrade plan; both copies of each gate, with git log for each since 1 November.
1. Diff the two copies of each gate and list every behavioural difference. A difference is kept as configuration or resolved toward the stricter rule; say which, per difference.
2. estate-kit: the gates module with tests that run both sites' current fixtures. Hosted CI green.
3. Each site: vendor the module, replace the local copy, keep configuration local. The production CSP suite, test:dist and test:text must give the same result before and after on the same build. Number diff: zero pages differing.
Verification on each site: npm test, npm run check, BUILD_OG=1 npm run build, test:dist, test:text, test:csp.
```

## 5. ukcouncils and ukcounciltax: registry refresh for the short name (Codex, after prompt 3 merges and UK Places deploys)

```text
Repositories tompickup23/ukcouncils and tompickup23/ukcounciltax. Two PRs, one per repository, branch data/registry-refresh-2026-11b from origin/main in a worktree each (never the main checkout). Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook. When done: commit, push and open both PRs. Do not merge, tag or deploy.

Refresh data/registry/councils.json from UK Places through the existing build route, never by hand, as PR 58 (ukcouncils) and PR 83 (ukcounciltax) did. Expected field diff: the short name of E07000112 only, plus anything UK Places changed since 15 November, each listed. The slug stays unless Tom has given the separate yes. The reorganisation field stays held; npm run test:dist and tests/reorganisation-held.test.ts must pass. Both registries byte identical. PR bodies: the field by field diff, the pages allowed to differ, and the verification each CLAUDE.md requires.
```

## 6. Council links rerun (Codex, any day in December 2026)

```text
Repositories tompickup23/ukplaces, then tompickup23/ukcouncils and tompickup23/ukcounciltax. Read src/lib/council-links.ts on both sites: the build fails from 4 January 2027 unless the UK Places link check is rerun. Rerun the check in UK Places from a fresh GOV.UK Local Links Manager export, list every link whose destination changed or failed, and refresh both sites through the existing route with the new check date. No hand edit of a link. Same branch, staging, hook and no merge rules as prompt 5.
```

## 7. ukcouncils: PR 60 fix, keep the seats hold and pass both guards (Codex)

```text
Repository tompickup23/ukcouncils, draft PR 60 (branch docs/dossier-sources-2026-11, worktree ~/wt/ukc-dossier-sources). Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including JSON. Stage named paths only. Never bypass the pre-commit hook. The repository is public. Push to the same branch and keep the PR a draft. Do not merge, tag or deploy.

Why: PR 60 fails validate on two guards that are doing their job. Do not change either test. tests/council-profile.test.ts holds seats by party: no committed file under data/ may carry seat, control or councillor in its name, and the hold means no committed copy of composition data until Tom chooses a source. tests/sources-coverage.test.ts requires every directory under data/ to be in the sources catalogue; research is not a site dataset.

1. Composition: remove from the branch every composition file and dry-run-seats.json (the option A copy, the option B sample, the 2026 baseline, by-elections, party changes, official change evidence and publisher metadata). They stay recoverable from commit 3e708ae; say so in the PR body. Keep in docs/DOSSIER-SOURCES-2026-11.md each URL, retrieval date, original hash, licence, count and reconciliation finding, so Tom can decide from the document alone.
2. Audit and section 114: move the remaining source files and dry runs from data/sources/dossier-2026-11/ to docs/dossier-sources-2026-11/. Update the manifest paths and docs/dossier-sources-dry-run.mjs, and confirm every hash still verifies.
3. Audit join: add a second dry run that joins the MHCLG backstop lists and the PSAA workbook to the 296 profiles by exact match on the registry officialName (the pinned GOV.UK Local Links Manager names in data/registry/councils.json). Allow only a stated normalisation: case, "and" for "&", and a trailing "Council". Nothing fuzzier. Report the matched, unmatched and ambiguous counts, list every unmatched and ambiguous body, and keep the exact code join result (0 of 296) beside it. Adopt no crosswalk; it is a decision for Tom.
4. After ukcouncils PR 59 merges, rebase on origin/main. Keep main's docs/STATE.md and add at most three lines to it.
Verification: npm test (both guards pass with no test changed), npm run check, the hash check in docs/dossier-sources-dry-run.mjs, and the dash and personal name scans. The PR body gives the test counts before and after, and the matched counts from step 3.
```

## 3b. ukplaces: Folkestone and Hythe display and search names (Codex, after PR 53 merges)

```text
Repository tompickup23/ukplaces. One PR, branch fix/folkestone-hythe-display-name from origin/main after PR 53 has merged, in a worktree, never the main checkout ~/ukplaces (it holds unrelated uncommitted work on feat/local-links). British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook. The repository is public. When done: commit, push and open the PR. Do not merge, tag or deploy.

Why: PR 53 corrected only the exported name of E07000112. UK Places still shows "Shepway" and its finder does not find "Folkestone" or "Hythe".
1. Through the same evidenced correction in scripts/place-names.mjs, give E07000112 displayName "Folkestone and Hythe" and searchNames ["Folkestone and Hythe", "Shepway"], so the old name still finds it. The slug stays shepway.
2. Tests: "Folkestone", "Hythe" and "Shepway" each find E07000112 and nothing else new; no other record changes.
3. List every built page whose text changes as pages allowed to differ in the PR body.
Verification: the repository's test, build and check commands. The export diff shows two changed fields on one record.
```

## 8. ukcounciltax: C6 levels day staging (Claude Code, Opus, new session)

```text
Repository tompickup23/ukcounciltax. One draft PR, branch feat/c6-levels-day-staging from origin/main in a new worktree ~/wt/uct-c6-staging. The empty branch feat/c6-year-switch and ~/wt/uct-c6-switch may be removed once you have checked they hold nothing. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere. Stage named paths only. Never bypass the pre-commit hook. Commit and push before any archive step. Do not merge, tag or deploy.

Why: levels day (MHCLG, "Council Tax levels set by local authorities in England 2027 to 2028", expected late March 2027; 25 March in 2026) must be staged by mid January 2027 so that release day is data only. The freeze starts on 20 March. This is the critical path and nothing blocks it.

Read first: CLAUDE.md, docs/STATE.md, docs/D5-BUDGET-SEASON-2027.md (sections 4 and 5 are the specification), docs/ASSESSMENT-2026-11-09-TAX-SITES.md (the C6 row), docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md section 10 (on branch docs/plan-lookahead-2026-11-15 until it merges), src/lib/council-tax.ts, src/lib/next-year.ts, tests/years.test.ts, scripts/fetch-council-tax.mjs, scripts/import-national.mjs.

A Codex registry refresh PR may be open; it changes data/registry/councils.json only. Do not touch that file. If another open PR touches a file you need, stop and ask Tom.

1. Write docs/C6-STAGING-BRIEF.md first: what changes on release day, what is staged now, and the switch design. Prefer a switch driven by data presence (the 2027/28 levels file and its Table 10 hash), so the release PR adds data and nothing else. If you choose a flag instead, say why.
2. Build the switch. CURRENT_YEAR, PREVIOUS_YEAR and YEARS move together. The not yet set page moves from 2027/28 to 2028/29. RELEASES carries 2028/29 records with page null and a note where no announcement exists. With today's data the built site must be byte identical to main: the number diff shows zero pages differing.
3. Importers: the 2027/28 levels import and the Table 10 2027/28 path, tested against the 2026/27 workbook layout and finding tables by title. Refuse to write on any missing authority, band or short row; unknown is never zero.
4. Rehearsal: a scripted dry run that treats 2026/27 as the incoming year against a 2025/26 baseline, runs the switch and the importers, and compares the result with what is live. Record every difference and its cause in the brief. Never publish rehearsal output.
5. Pages that wait for data: everything D5 section 4 and the assessment's C6 row list renders nothing until 2027/28 data exists, with a test for both states.
6. The set the budget pages stay pinned to 2026/27. Behind the same switch, add one line saying their figures are 2026/27 and that 2027/28 budgets follow MHCLG's RA release in June 2027. Put the wording in the PR body for Tom to confirm.
7. Update the D5 runbook in place wherever the build changes it.
Verification: npm test, npm run check (grep the "- N errors" line), BUILD_OG=1 npm run build, test:dist, test:text, test:csp, the rehearsal, and the number diff against main (zero pages differing). PR body: the brief's summary, the rehearsal differences and the decisions for Tom, with fenced "## Pages allowed to differ" and "## Pages to capture" blocks. Replace docs/STATE.md in at most 20 lines.
```

## 9. ukcouncils: what "dossier complete" means, encoded as a gate (Codex)

```text
Repository tompickup23/ukcouncils. One PR, branch feat/dossier-gate-definition from origin/main in a new worktree ~/wt/ukc-dossier-gate. Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including JSON. Stage named paths only. Never bypass the pre-commit hook. The repository is public. Commit, push and open the PR. Do not merge, tag or deploy.

Why: the dossier on all 296 English billing profiles must be complete by mid January 2027, and it gates the reversal in May to June 2027. No document says what complete means, so the gate can be neither passed nor failed. A Codex registry refresh PR may be open; it changes data/registry/councils.json only. Do not touch that file.

Read first: CLAUDE.md, docs/STATE.md, docs/DOSSIER-STATE-2026-11-14.md, docs/DOSSIER-SOURCES-2026-11.md, the existing dossier coverage gate in the build checks, and tompickup23/ukcounciltax docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md section 10 (on branch docs/plan-lookahead-2026-11-15 until it merges).
1. Write docs/DOSSIER-GATE.md. For each item D1, D3 and C1 to C9, give each profile one of three states: built from a pinned source; absent with a stated reason (no source, not published, held); or out of the January scope by Tom's decision. Measure today's counts from a full build. List each open decision (composition source, audit identity method, section 114 register, C7 and C9 scope) with its default if Tom does not decide by 15 December 2026: out of the January gate, with the absence stated on the page as today.
2. Encode it. Extend the dossier coverage gate so every section on every profile falls into exactly one of those states, and the build fails on any section that is neither built nor carries its reason. No page text changes unless a profile today shows a section with neither; list any.
3. School holidays. For the nine profiles without a calendar (Barnsley, Blackpool, City of London, Enfield, Halton, Isles of Scilly, Newham, Sheffield, South Tyneside), find each council's own published 2026/27 term dates page. Record the URL, the date it shows and the retrieval date in docs/DOSSIER-GATE.md. Do not build or infer a calendar; how to add them is for Tom.
Verification: npm test, npm run check, npm run build, npm run test:dist. Number diff: zero pages differing unless step 2 lists a change. Fenced "## Pages allowed to differ" and "## Pages to capture" blocks in the PR body.
```

## 10. estate-kit: the scrub report that settles X3 (Codex)

```text
Repository tompickup23/estate-kit (private). One draft PR adding one file, docs/X3-PUBLIC-SCRUB-2026-11.md, on branch docs/x3-public-scrub from origin/main in a worktree. Change nothing else: no code, no settings, no visibility change, no history rewrite. British English; no em dash, en dash or spaced hyphen anywhere. Never print a secret value; refer to a finding by commit, file and line only. Stage the one file by name. Never bypass the pre-commit hook. Do not merge, tag or deploy.

Why: decision X3 (estate-kit's Actions are blocked by billing) holds up the gates pack and the kit's CI. Making the repository public, as both sites were, is the recommended route, but only after a scrub. This report should make the decision a five minute one.
1. Scan the whole history, not just the tip. Run gitleaks over every commit, using the configuration that ~/.config/git-hooks/gitleaks-staged.sh uses. Search for /Users/ paths, ~/Documents, the Reports and clawd repositories, personal email addresses, the hostnames vps-main and vps-news, IP addresses and tokens, and for anything copied from the private Reports repository or the Council Intel skins.
2. Classify each finding: a secret (needs rotation and a history rewrite); a private path or name (rewrite or accept); licensed or third party content (state the licence); or harmless.
3. Recommend one route: public as it is; public after a cleanup at the tip; public only after a history rewrite (say what and how); or stay private and settle billing. Give the cost of each in steps.
4. List what changes for the two sites that vendor the kit if it goes public.
```
