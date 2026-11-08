# Budget game family | Codex session plan

Written 8 November 2026 in Claude Code, while Codex session C1 (the national budget game, I001) runs in `~/wt/uct-budget-game`. This file plans what follows, so that each Codex session is a pure build with nothing left to research or decide. Committed with the sources label tidy on 8 November 2026; update it in place as sessions finish.

## How each session runs

The C1 pattern worked, so every session repeats it:

1. **Claude prep (here).** Pin the sources with hashes. Read the documents and record any figure a test will assert. Settle the design choices the data forces. Write a brief and source notes into a fresh worktree, commit locally, and hand over a short paste prompt.
2. **Codex build.** One worktree, one branch, one PR, one commit per phase, explicit stop conditions. Codex never researches a source and never decides wording that carries risk.
3. **Claude review.** `/code-review medium`, `/design-check` and `/fact-check` on two representative pages. Claude fixes small issues in place; a larger fix list becomes a short Codex fix session.
4. **Tom merges.** Merging deploys on both sites.

**Lanes.** Run sessions in different repos at the same time, and sessions in the same repo one after another.

| Lane | Repo | Shared files that force one writer at a time |
|---|---|---|
| A | ukcounciltax | `src/lib/site.ts`, `src/lib/paths.ts`, `src/pages/councils/[slug].astro`, `data/national/sources.json`, `package.json` (`data:national`), `docs/RELEASE.md`, the methodology, sources and coverage pages |
| B | ukcouncils | its council page and its sitemap; PR 30 (council page profile sections, reviewed 8 Nov, ready to merge) must merge before C3 touches council pages; PR 13 closed as superseded on 8 Nov |
| C | Claude | prep and review only; writes briefs in the worktree that the next Codex session will use |

**Rules every brief repeats:** British English; no em dash, en dash or spaced hyphen as a dash, anywhere; every figure sourced; never estimate; no inline script; stage named paths only; no merge or deploy; stop and report rather than work around.

## Efficiency rules (added 8 November 2026 after C1's three stops)

C1 stopped three times: once on an error in my phase 0 notes, once on a reference cross-check that disagreed, and once to ask a design question mid-build. Each stop cost a full round trip. From now on:

1. **Dry-run the brief before handing it over.** Claude runs every assertion the brief asks Codex to test against the real data, and states every convention a test depends on (hash input, row filter, label rules). Two of C1's three stops would not have happened.
2. **Stop only on primary-source and security failures.** A reference that is not a source (AI DOGE, an earlier edition) disagreeing goes in the PR body, not a stop. A design question the brief does not answer gets the most conservative choice (show less, never derive), recorded under "Decisions taken" in the PR.
3. **Answer predictable design questions in the brief.** For example: band ranges, what happens with no data, negative values, small populations. C1's bill round question was predictable from Table 10's shape.
4. **Stack dependent work.** A session that depends on an open PR may branch from that PR's branch, then rebase onto main after the merge, instead of waiting for the merge. C4 can start as soon as C1's PR opens.
5. **Split optional scope into its own PR.** C1's scenario (old phase 4) is now C1b, so the game goes live without it.
6. **No new sources from Codex.** It may only cite what the notes name. C2 added an unvetted source, which the review had to correct.
7. **Self-review list in each brief.** Codex runs the checks the Claude review will run, so the review is a confirmation, not a rework.
8. **Clear blockers in other repos early.** Done 8 November: PR 30 reviewed and ready to merge; PR 13 closed as superseded. Tom, 8 November 2026: "AI DOGE links are fine", so the 7 October rule against linking AI DOGE from UK Councils no longer applies, and main's AI DOGE links (footer, council pages, spending record) stay. Tom, same day: "The footer link block is fine, no data downloads is optimal to start with." So the footer sister block stays, and UK Councils' CSV download buttons should go: `ViewActions`/`CouncilActions`, `TaxTable`, `compare.astro`, `src/lib/tax-export.ts` and their tests. UK Council Tax already ships no CSV buttons; its `tax-export.ts` is unused, and its `/data/` page links to official files only. Tom, same day: "No asylum stats link for now." All three are applied in ukcouncils PR 32 (CSV downloads removed, Asylum Stats links skipped, guarded by a built-page test), opened 8 November and not merged.

## The queue

| ID | When | Lane | What | Depends on | Size |
|---|---|---|---|---|---|
| C1 | phases 1 and 2 done and reviewed (296 pages); resume at phase 3 from `915fbd9`; phase 4 split out to C1b | A | National budget game (I001): game rounds and checks, then PR | none | M |
| R1 | when C1's PR opens | C | Review C1; fix small issues; write the fix list | C1 | S |
| C1f | after R1, only if needed | A | Fixes from R1 on the same branch | R1 | S |
| C1b | after C1 merges | A | The "your version" illustrative scenario (old phase 4), its own PR | C1 merged | S |
| C2 | built and reviewed: ukcouncils PR 31, every check green, ready for Tom to merge | B | Exceptional Financial Support by year, a standalone page (I007) | Tom's merge | S |
| C3 | after C1 merges and ukcouncils PR 30 merges | B | Observed "where the money goes" on ukcouncils council pages | C1 merged | M |
| C4 | brief set for a stacked start on C1's local branch now (`b1ed40c`); builds and commits locally, pushes only after C1 merges | A | Spend per resident by age beside the game (I124) | none to start; C1 merged to open its PR | S |
| D5 | decided 8 Nov: MHCLG only (option C), no live tracker; see `docs/D5-BUDGET-SEASON-2027.md` | C | Budget season live (I005) and the release day runbook | done | S |
| C6 | early January 2027 | A | The 2027/28 levels day page and ranking card (I028), and precept day (I048), built behind a gate | C4 merged; prep P6 | M |
| C2b | late February 2027 | B | Add the 2027/28 EFS list to C2's page | MHCLG publishes (23 Feb last year) | XS |
| C7 | February to March 2027, if Tom wants it | A | Close the gap round where a budget report has been read, Lancashire first (I018) | C1 merged; prep P7 reads the report | M |
| R8 | release day, about 25 March 2027 | C | Run C6's gated import against the 2027/28 levels; check; open the data PR | C6 merged | S |
| C9 | June 2027 | A | Annual edition: the RA 2027/28 refresh of the game | MHCLG RA 2027/28; prep P9 | S |

Parked, each needing a decision before any session: I006 (a receipt splitting the bill by service; it needs an apportionment method Tom accepts), I024 (completion metrics; blocked on the open analytics decision of 3 November), I026 (classroom mode; small, but its lesson text needs a neutral wording review, so batch it into C9 if wanted).

## Session briefs

### R1. Review of C1 (Claude)

When Codex reports the PR: read the reconciliation section first, then run `/code-review medium` on the PR, and `/design-check` and `/fact-check` on `/tools/budget/burnley/` (two tier) and one unitary page. Check the nine no-return pages, the seven note 4 pages and the DSG sentence on a county. Fix small issues directly on the branch. If more than about five changes remain, write them as a numbered list in `docs/BUDGET-GAME-FIXES.md` on the branch and give Tom the C1f prompt.

C1f paste prompt:

```text
Continue on branch feat/budget-game-i001 in ~/wt/uct-budget-game. Read docs/BUDGET-GAME-FIXES.md and make each numbered fix as its own commit, then rerun every check listed in phase 5 of docs/PLAN-2026-11-08-BUDGET-GAME.md and push. Same rules as before: British English, no em or en dashes or spaced hyphens as dashes, every figure sourced, no estimates, no merge or deploy. Reply with each fix number against its commit and the check results.
```

### C2. Exceptional Financial Support by year on ukcouncils (I007)

**Why now:** it touches a different repo from C1, it is a single standalone page, and the 2027/28 list is due in late February (23 February last year). The register's own count is 36 councils in principle for 2026/27 (GOV.UK table of 23 February 2026, updated 18 August 2026).

**Prep P2 (Claude):** find every GOV.UK EFS list from 2020/21 to 2026/27 and pin each page and table with its date. Record what each list counts (in principle, final direction, amount, capitalisation or borrowing) and how the definitions change between years. Map council names to GSS through the ukcouncils registry. Record anchor rows. Choose the route (proposed `/exceptional-financial-support/`) and confirm how ukcouncils handles a national page outside the council template. Write `docs/EFS-BRIEF.md` and `docs/EFS-SOURCE-NOTES.md` in a worktree at `~/wt/ukc-efs` on branch `feat/efs-by-year`.

**Codex scope:** a pinned importer and data file; one page with a table by year and council (each year's own definitions kept separate, never summed across different measures); a map only if the site already has the geography; a source line under every figure; and a sitemap entry. No link from council pages until ukcouncils PR 30 merges (that becomes C3's job). No motive words; the ukcouncils tests already grep for them.

Paste prompt (once P2 is done):

```text
Build the Exceptional Financial Support by year page on UK Councils (idea I007). Work only in the existing worktree ~/wt/ukc-efs on branch feat/efs-by-year. Read in order: ~/.codex/AGENTS.md; ~/.claude/CLAUDE.md; CLAUDE.md in the worktree and the files it says to read first; docs/EFS-SOURCE-NOTES.md (binding); docs/EFS-BRIEF.md (your instructions). Carry out its phases, one commit each, honour every stop condition, then push and open one PR. Do not touch the council page template or any open PR's files, and do not merge or deploy. British English; no em dash, en dash or spaced hyphen as a dash; every figure sourced; never estimate; no names of individuals; no motive words. Finish with the report the brief asks for.
```

### C3. Observed budget section on ukcouncils council pages

**Scope:** copy, not import, C1's importer and `data/national/budget.json` approach into ukcouncils. That fits the ukcouncils rule that components are copied and nothing is read from a sibling checkout at build. Each council page gets an observed section showing spending by MHCLG service heading, funding, and non-ringfenced reserves with the caveat, plus a link to the game on ukcounciltax. No game, no scenario, no ratio. County figures are never apportioned to a district (a ukcouncils rule); a district page names its county and links to the county page instead. The nine councils with no return show no section at all, because the ukcouncils rule is that an absent figure means an absent section. It also adds the EFS link from C2.

**Prep (Claude, short):** confirm C1's merged data contract and the C2 page, read ukcouncils PR 30's final council page structure, and write `docs/BUDGET-SECTION-BRIEF.md` in `~/wt/ukc-budget` on branch `feat/council-budget-section`. No new source research: the source notes from C1 carry over.

### C4. Spend per resident by age (I124)

**Scope:** beside the game's tables on ukcounciltax, adult social care net spending per resident aged 18 and over, split into 18 to 64 and 65 and over where the RA sub-lines allow, and children's social care per resident under 18. Each is a ratio of two published figures, both editions named, labelled as a calculation. No ranking, unless every council has the same complete year; the nine no-return councils are left out of any comparison.

**Prep P4 (Claude):** pin the ONS mid-year population estimates edition that matches 2026/27 best (state the reference date and why), check its geography against all 317 GSS codes after the 2023 to 2026 boundary changes, decide which RA sub-lines map to which age group, and record anchor ratios for Burnley, Birmingham, Westminster and Lancashire. Write `docs/PER-RESIDENT-BRIEF.md` and notes in `~/wt/uct-per-resident` on branch `feat/per-resident-i124`, cut from main after C1 merges.

### D5. Budget season live and the release day runbook (Claude only, December)

The engine sees about 30 ModernGov councils plus Burnley, and adds one new host a night, so it cannot detect every council's 2027/28 tax resolution live. D5 decides with Tom what I005 can honestly be in February 2027: the engine's cohort only, a hand-verified list from published resolutions, or nothing until the MHCLG release on about 25 March. It also writes the release day runbook for R8: the expected file names, the hash step, the checks, who opens the data PR, and the "not yet set" page switching over. The output is a decision note, plus a brief for C6 if the scope grows.

### C6. Levels day page, ranking card and precept day (I028, I048)

**Scope:** for ukcounciltax's 2027/28 release:
- the council tax levels importer extended to the 2027/28 file, tested against the 2026/27 file's layout as a fixture, and run by hand on release day (R8), never on a schedule;
- a "your council against all" ranking card per council, ranking within class only and highlighting the reader's council;
- the precept day page: which of the 153 adult social care authorities used the full adult social care precept and which did not, from the levels tables, with the core decision alongside, stated as facts;
- the "not yet set" page (`council-tax-2027-28.astro`) switching to published figures through the existing NEXT_YEAR mechanism.
Everything ships hidden behind data that does not yet exist, so the merged code renders nothing new until R8 adds the data.

**Prep P6 (Claude, early January):** read the December provisional settlement's referendum principles for 2027/28 and the 2026/27 levels workbook layout, confirm what MHCLG's 2027/28 release page announces, define the ranking cohorts, and write the brief in `~/wt/uct-levels-day` on branch `feat/levels-day-2027-28`.

### C7. Close the gap, where a budget report has been read (I018)

Only if Tom wants it before May. **Prep P7 (Claude)** reads Lancashire's 2027/28 budget report and medium-term financial strategy once published (the Full Council date is in the LCC model's records), and quotes the gap figures with page numbers into a `gaps.json` fixture format that other councils can join later. **Codex** adds the round only for councils with an entry, labelled with the document, page and date, and leaves every other council unchanged. It uses no Reform framing and nothing from the Lancashire game's savings story.

### R8. Release day (Claude, about 25 March 2027)

Follow D5's runbook: fetch, hash, run C6's importer, run every check, open the data PR, and give Tom the merge decision the same morning. No Codex session: it is a short checked run, and speed matters more than build capacity.

### C9. Annual edition, June 2027

**Prep P9 (Claude):** pin the RA 2027/28 files, rerun the phase 0 checks from `docs/BUDGET-GAME-SOURCE-NOTES.md` (the row filter, the councils with no return, the Table 10 reconciliation fixture rebuilt against the 2027/28 levels, new anchors), and write a short refresh brief. **Codex:** update the source entries, fixtures and copy for the new year; keep 2026/27 as a dated archive only if the brief says so. Optionally add classroom mode (I026) here, with Claude reviewing its wording.

## What to do next

1. Now: P2 (EFS prep) in Claude, then start C2 in Codex beside C1.
2. When C1's PR opens: R1.
3. After Tom merges C1: P4 and C4, then C3 once ukcouncils PR 30 is in.
4. December: D5. Early January: P6 and C6.
