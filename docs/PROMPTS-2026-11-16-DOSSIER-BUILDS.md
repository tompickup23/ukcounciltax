# Prompts | UK Councils dossier builds from the three decided sources | 16 November 2026

Written in Claude Code for Tom to paste into Codex in the ChatGPT app. The decisions are in `docs/DECISIONS-2026-11-16.md`, section 2; the research each build rests on is UK Councils `docs/DOSSIER-SOURCES-2026-11.md`; the gate is UK Councils `docs/DOSSIER-GATE.md`. All figures below are restated from those two UK Councils files as measured on 15 November 2026.

## How to run them

- **One at a time, in this order: A (seats), B (section 114), C (audit status).** All three change the same files (the dossier state rules, the gate file, the council profile), so two at once would collide. A is first because it reaches 295 of 296 profiles; B is small; C carries the most identity work.
- Each is a data pull request on a held part. A Claude session reviews it against the data rules, then **Tom's yes in words** merges it. None is in the fast track.
- Each prompt stops at a draft pull request with a dry run file first, so the review reads counts before any page changes.

## Four things for Tom before or during the builds

1. **Control.** The gate's part is "seats by party and control". The research excluded the compiler's control and coalition fields, and deriving control from totals is inference. Prompt A builds the party totals and leaves control absent with a stated reason. Say if you want control shown from the compiler's own field instead; that is a second sourced statement and my recommendation is to leave it out.
2. **PSAA.** The decision allows PSAA data "only if its terms allow reuse". Its terms permit non-commercial reproduction with acknowledgement and restrict modification without written consent, so a transformed per body table needs PSAA's permission. Prompt C builds from the MHCLG lists only (Open Government Licence) and drafts a short permission request for you to send. Without PSAA, audit status is built only on the profiles that appear on an MHCLG list (69 of 296 by the measured name join) and stays absent, with the reason stated, on the rest.
3. **City of London and Isles of Scilly.** Scilly has no row in the composition source. The City joins but its chamber is not party political in the usual sense. Prompt A leaves both absent with a reason unless you say otherwise.
4. **Share alike.** The composition table is Creative Commons Attribution ShareAlike 4.0. Prompt A credits it on the page and applies share alike to the composition data file only, as decided. The repository is public, which satisfies it for that file.

## A. Seats by party (Codex)

```text
Repository tompickup23/ukcouncils. One draft PR. New worktree ~/wt/ukc-seats on branch data/dossier-seats from origin/main. Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including JSON and scripts. Stage named paths only. Never bypass the pre-commit hook. The repository is public. Do not edit data/registry/councils.json. The registry reorganisation field stays held and unread. When done: commit, push and open a draft PR. Do not merge, tag or deploy.

Why: the dossier is due on all 296 English billing profiles by mid January 2027 and gates the May to June 2027 reversal. docs/DOSSIER-GATE.md measures "Seats by party and control" as built on 0 of 296 profiles because the source decision was held. On 16 November 2026 Tom decided option A: a dated snapshot of Open Council Data's English council compositions under CC BY-SA 4.0, credited, with share alike applied to the composition table only (tompickup23/ukcounciltax docs/DECISIONS-2026-11-16.md, section 2).

Read first: CLAUDE.md (all of "Held data" and the lines on seats by party), docs/STATE.md, docs/DOSSIER-GATE.md, docs/DOSSIER-SOURCES-2026-11.md section 3 and "Composition provenance retained for the decision", scripts/lib/dossier-state.mjs, scripts/check-dossier.mjs, tests/dossier-coverage.test.ts, src/lib/council-profile.ts, and how data/elections is loaded and cited today.

Step 1, pin the source (commit this before any page work).
- Retrieve the publisher's "English Council Compositions 2026" table and, for identity, each linked council page, as the research did. Record: publisher, table title, URL, retrieval date, the site's last updated label as a separate field, SHA-256 of the original table response, licence (CC BY-SA 4.0 for website content; do not apply the publisher's public domain statement for its CSV downloads to this table).
- Keep only: the publisher's council ID, the GSS code reached through that ID's own linked page, and the printed columns Lab, Con, LD, Grn, Ref, Oth, Vac and Total. No councillor name, ward, control field or coalition field in any file, including raw copies. Strip before writing to disk.
- Join to the 296 profiles by GSS code only, never by name. Expected from the research on 15 November: 295 of 296, Isles of Scilly with no row, 23 rows outside the profile set. If today's counts differ, stop and report; do not repair.
- Fail closed: a row whose columns do not sum to its Total is not admitted.
- Write the dry run JSON: per profile the joined values, the reconciliation result and the row's source ID; totals by class; the unmatched and out of scope rows.

Step 2, build.
- Data file under data/elections (or a new data/composition folder if that reads better against the existing loaders) with a manifest entry: path, SHA-256, source fields above.
- On each profile where a reconciling row joined: one small table of party totals in the publisher's own column labels spelled out (Labour, Conservative, Liberal Democrat, Green, Reform UK, Other, Vacant, Total), one bar drawn with the vendored kit if an existing part fits without a new chart type, and a source line: Open Council Data, English Council Compositions 2026, the retrieval date, "compiled by a third party, not an official council return", licence CC BY-SA 4.0 with a link. Say that "Other" is the publisher's aggregate and that the date is the snapshot's, not an effective date certified for each council.
- No statement of control, majority, coalition or who runs the council, in text, structured data, share text or the search index. Control stays absent with the reason "not derived from totals; no sourced statement held".
- City of London and Isles of Scilly: absent with a stated reason each.
- Lift the seats hold only as far as this: update CLAUDE.md "Held data" and the guards so party totals from the pinned snapshot may render and everything else stays held. A test must fail if a councillor name field, a control field or an unpinned composition value reaches dist.
- Update scripts/lib/dossier-state.mjs and docs/DOSSIER-GATE.md: split "seats by party" from "control" as two parts if the state rules need it, with new measured counts from a full build. Remove an absence reason only where the content now renders.
- Add a refresh note to docs/DOSSIER-GATE.md: how to take a new snapshot, and that a difference between snapshots triggers review, never a reconstructed total.

Verification: npm test, npm run check, npm run build, npm run test:dist, the browser suite and the actual CSP suite if the profile template changed. Number diff against a clean build of the base: list the profile glob under a "## Pages allowed to differ" heading with a fenced list, and say in one sentence what differs. "## Pages to capture" with three profiles (a district, a metropolitan district, a London borough) and Isles of Scilly. A grep that no person's name appears in any new file. PR body: the dry run counts, what is built, what stays absent and why, and every question for Tom.
```

## B. Section 114 original notices (Codex)

```text
Repository tompickup23/ukcouncils. One draft PR. New worktree ~/wt/ukc-s114 on branch data/dossier-section-114 from origin/main (after the seats PR has merged). Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including JSON and scripts. Stage named paths only. Never bypass the pre-commit hook. The repository is public. Do not edit data/registry/councils.json. When done: commit, push and open a draft PR. Do not merge, tag or deploy.

Why: docs/DOSSIER-GATE.md measures "Section 114 original notices" as built on 0 of 296 profiles. On 16 November 2026 Tom decided: a register of original notices only, labelled as not exhaustive (tompickup23/ukcounciltax docs/DECISIONS-2026-11-16.md, section 2).

Read first: CLAUDE.md, docs/STATE.md, docs/DOSSIER-GATE.md, docs/DOSSIER-SOURCES-2026-11.md section 2, docs/dossier-sources-2026-11/section-114-notices.json, section-114-register-search.json and dry-run-section-114.json, scripts/lib/dossier-state.mjs, scripts/check-dossier.mjs.

The rule for a record: the original notice or report on the council's own site has been opened and read; it carries its issue date; it cites the Local Government Finance Act 1988 and an exact subsection of section 114, recorded as printed (do not assume 114(3)). Each record holds: council, GSS code assigned by explicit review of the council's identity and labelled as assigned, notice date, provision, URL, page or paragraph locator, retrieval date, SHA-256 of the original where obtainable (null for a blocked original, never the hash of an error page). A supplementary notice is its own record. No signature, personal name, amount, cause or explanation in any file.

Step 1, the register (commit before page work).
- Start from the two inspected records (Thurrock, 19 December 2022; Nottingham, 29 November 2023).
- Try to complete the nine retrieval leads listed in section 2 of the sources file by obtaining and reading each original. Several returned HTTP 403 to direct fetches; try the council's document library page and the committee system copy. A lead whose original cannot be opened stays a lead and is not rendered. Record every attempt in the search log.
- Do not add a notice from a news report, a government letter, the Commons Library table or Exceptional Financial Support. Those may be leads only.
- Dry run JSON: records admitted, leads not admitted with the reason, and the profiles each admitted record attaches to.

Step 2, build.
- On a profile with an admitted record: under the budget and reserves part, a dated line per notice: the date, "report under section 114(n) of the Local Government Finance Act 1988" with the subsection as printed, a link to the council's document and its locator, described as a historical document record. Nothing about cause, current restrictions or whether it has been withdrawn unless a later official document is itself pinned.
- On every other profile: the existing absence explanation, reworded only if needed so that it says this register lists original notices this site has inspected, is not exhaustive, and that no entry is not a statement that none was issued. No negative claim on any profile.
- One register note in docs/DOSSIER-GATE.md: the record rule above, who maintains it (Tom's sessions, on request), and the leads still open.
- Update scripts/lib/dossier-state.mjs and the measured counts. A test must fail if a notice renders without a pinned record, or if any profile text says or implies that no notice exists.

Verification: npm test, npm run check, npm run build, npm run test:dist. Number diff with the profiles that gained a notice line listed under "## Pages allowed to differ" in a fenced list. "## Pages to capture": each profile with a notice, and one without. A grep that no person's name appears in any new file. PR body: records admitted, leads left open with what blocked each, and any question for Tom.
```

## C. External audit status (Codex)

```text
Repository tompickup23/ukcouncils. One draft PR. New worktree ~/wt/ukc-audit on branch data/dossier-audit-status from origin/main (after the section 114 PR has merged). Node 22.23.4 first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including JSON and scripts. Stage named paths only. Never bypass the pre-commit hook. The repository is public. Do not edit data/registry/councils.json. When done: commit, push and open a draft PR. Do not merge, tag or deploy.

Why: docs/DOSSIER-GATE.md measures "Audit status" as built on 0 of 296 profiles. On 16 November 2026 Tom decided the identity method: the exact name join measured in PR 60, plus a reviewed list for the remaining councils; PSAA data only if its terms allow reuse (tompickup23/ukcounciltax docs/DECISIONS-2026-11-16.md, section 2). PSAA's terms restrict modification without written consent, so this PR builds from the MHCLG publication only and does not commit or render any per body PSAA value.

Read first: CLAUDE.md, docs/STATE.md, docs/DOSSIER-GATE.md, docs/DOSSIER-SOURCES-2026-11.md section 1 (all of it, including "Separate official-name diagnostic"), docs/dossier-sources-2026-11/audit-mhclg-tables.json, dry-run-audit.json and dry-run-audit-names.json, docs/dossier-sources-dry-run.mjs, scripts/lib/dossier-state.mjs, scripts/check-dossier.mjs.

Source: MHCLG, "Addressing the local audit backlog in England: Non-compliance lists", updated 26 March 2026, information as at 9 March 2026, Open Government Licence v3.0. Three tables by backstop date: 13 December 2024 (financial years up to and including 2022/23), 28 February 2025 (2023/24), 27 February 2026 (2024/25). First check whether GOV.UK shows a later edition; if it does, stop and report the difference before pinning anything new.

What the values are, in the publisher's terms: these are lists of bodies that did not publish by the relevant backstop, not a census. A "yes" answers the dated question in its column heading; it is not an opinion type. The oldest table asks about all opinions up to 2022/23, not one year. A pension fund entry is not a council's main accounts. The first table has 67 rows although the publisher's text says 68 bodies: keep that discrepancy stated and do not add a row. A missing row is not evidence of anything.

Step 1, identity crosswalk (commit before page work).
- Tier 1: the normalised official name join exactly as measured in the research (lower case, "&" to "and", one trailing "Council" removed, nothing else) against registry officialName, on the 296 profiles selected by code. Expected: 69 profiles matched, none ambiguous. If the count differs, stop and report.
- Tier 2: a reviewed list for the source labels tier 1 left unmatched (51 distinct labels in the research). For each, record the label exactly as printed, and one of: assigned to a profile code with the evidence (the council's own official name on GOV.UK or its own site, with URL and retrieval date, showing the label is that body); not a billing profile (county, police, fire, pension fund, combined authority, other) with the class; or unresolved. No fuzzy matching, no assignment on similarity alone, no predecessor body mapped to a successor.
- Commit the crosswalk as a data file with a manifest hash, every row carrying its tier and evidence. Dry run JSON: profiles reached by tier and by table, labels unresolved, and the profiles on no list.

Step 2, build.
- On a profile that appears on one or more tables: for each table, one line in the publisher's terms: the backstop date, the financial years it covers, and the answers to the column questions as printed (draft accounts published by the inspection deadline; audit opinion delivered by the backstop and its date; opinion published as at 9 March 2026), with a source line naming publisher, title, table, edition date and licence. No opinion type, no judgement, no ranking, no word such as failed. Nothing about any person or firm beyond the publisher's own "appointed audit firm" column, and leave that column out unless Tom asks for it.
- On a profile that appears on no table: absent, with a reason that says this site holds only MHCLG's lists of bodies that missed a backstop, that a council's absence from those lists is not a statement about its audits, and that per body audit delivery data from PSAA is not shown because its reuse terms have not been cleared.
- Update scripts/lib/dossier-state.mjs, docs/DOSSIER-GATE.md and the measured counts. A test must fail if an audit line renders for a profile without a crosswalk row, or if any profile without a row carries a positive or negative audit statement.
- Draft, as a file in the PR for Tom to send himself, a short request to PSAA for written permission to publish a per council table derived from its monthly audit opinion data with acknowledgement. Do not send anything.

Verification: npm test, npm run check, npm run build, npm run test:dist, and node docs/dossier-sources-dry-run.mjs still passing. Number diff with the affected profiles under "## Pages allowed to differ" in a fenced list. "## Pages to capture": one profile on all three tables, one on one table, one on none. PR body: tier counts, unresolved labels, what is built and absent, and every question for Tom.
```
