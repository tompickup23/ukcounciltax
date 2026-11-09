# Budget season 2027 | decision note and release day runbook (D5)

Written 8 November 2026 in Claude Code for Tom. It decides what register row I005 ("budget season live") can honestly be in February and March 2027, and sets out the release day steps for R8. No build follows until Tom answers the questions in section 3.

## 1. The facts this rests on

- **Statutory deadline.** Each billing authority sets council tax "before 11th March" for the following year (Local Government Finance Act 1992, s30(6), as quoted on `/council-tax-2027-28/`). The decisions therefore cluster from late January to early March 2027.
- **The official complete figures.** MHCLG's announcement "Council Tax levels set by local authorities in England 2027 to 2028" gives "March 2027", state "provisional" (GOV.UK content API, read 8 November 2026; the announcement was published 31 March 2026). Last year's release was at 09:30 on 25 March 2026 (GOV.UK, "Council Tax levels set by local authorities in England 2026 to 2027", first published). The same release carries Table 10, which the site's national import uses.
- **Referendum principles.** The settlement is now multi-year ("Provisional Local Government Finance Settlement 2026-2027 to 2028-2029", collection of 17 December 2025). The principles are still set by an annual report: the 2026-27 draft came on 17 December 2025 and the final on 9 February 2026. No 2027-28 report is announced. December 2026 may not bring the usual full provisional settlement, so date P6's prep from the principles report, not from a settlement.
- **What the engine can see.** As of `ukskynet` STATE (7 November 2026): 24 active ModernGov cohort rows plus Burnley, 7 rows blocked, and none of Lancashire, East Sussex or most of England. The clean night count has not started; its earliest thirtieth night is 3 December. The first decision events build (3 November) gave 288 current events from 17 councils, of which 254 are unclassified. The meeting kind matcher has four known misses, including budget titles that add a dash or a bracket. It records that a meeting took place and quotes its decision text. **It does not extract a council tax figure, and it covers well under a tenth of English billing authorities.**
- **Who presents it now.** HomeOwners Alliance compiled a hand-made table of all 153 top-tier councils with control and rise; PA lists councils as they vote; Which?, BBC Verify and GB News map MHCLG's figures on release day (register research, files C and F).

## 2. The options

| | What it is | Coverage | Honesty risk | Effort | Verdict |
|---|---|---|---|---|---|
| A | Engine-led: the engine flags the vote and the site publishes the rise next morning | about 25 councils at most, no figures extracted | High: the engine cannot read figures, and partial coverage reads as national | Large (a new parser) for little | **Do not build for 2027.** At most, use the engine's calendar to know when cohort councils meet |
| B | A hand-checked "set so far" tracker on ukcounciltax: each council's own Band D and change exactly as printed in its **adopted** resolution or minutes, with document, page, date and file hash, added as councils vote | B1: the 153 upper-tier councils (21 counties, unitaries, metropolitan districts, London boroughs); B2: all 317 | Medium and manageable: proposed against adopted, amendments on the night, own element against area average. Each is a rule, not a judgement | B1: about 150 documents over five weeks, two or three sweeps a week (Claude prep, Codex batch entry, Claude check) | **Optional.** It is the only honest live product, and it costs real time in February |
| C | Wait for MHCLG: the levels day page and ranking card (C6) are pre-built, and R8 runs the import on release morning | all 296 billing authorities, every band, every precept | Low: one official table | Pre-built in January; release day is data only | **Do it regardless.** This is the guaranteed product |

**Recommendation.** C for certain. B1 only if Tom wants the February moment enough to fund about ten short sessions. If B1 runs, MHCLG's figures replace the tracker on release day, and a published list shows every council where the adopted resolution and MHCLG differ, with neither source changed. Leave A to the engine's own roadmap.

## 3. Questions for Tom

**Decided, 8 November 2026 (Tom, in chat): "MHCLG only".** I005 for 2027 is option C. No B1 tracker, so question 2 falls away. Questions 3 and 4 stay open, with the recommendations below as the defaults until Tom says otherwise.

1. **I005 scope:** C only, or C plus the B1 tracker? (Recommended: C only, unless February traffic matters more than the sessions it costs.)
2. **If B1:** where does it live? Recommended: a section on `/increases/2027-28/`, labelled "Set so far, from councils' adopted resolutions", rather than on each council page, so it is one dated list.
3. **Political control.** I005's original wording states control "as a fact". ukcounciltax is a neutral specialist site and shows no party anywhere today. Recommended: keep control off ukcounciltax; if wanted, it belongs on UK Councils or UK Elections, which already carry seats by party.
4. **Freeze window.** Recommended: no other ukcounciltax PR merges from 22 March 2027 (or the confirmed release week) until the release PR has merged, so the release branch rebases cleanly.

## 4. What C6 must stage in advance, so release day is data only

The year switch is not just data. `src/lib/council-tax.ts` holds `CURRENT_YEAR = "2026-27"`, `PREVIOUS_YEAR` and `YEARS`. `tests/years.test.ts` fails when `CURRENT_YEAR` moves until `council-tax-2027-28.astro` is renamed for the next year and every `RELEASES` record in `src/lib/next-year.ts` is refetched for 2028/29. Doing that on release morning is avoidable risk. So C6 (early January) must also deliver:

- a tested branch, or a feature flag, that switches `CURRENT_YEAR` to 2027-28, renames the not-yet-set page to 2028-29, and carries 2028/29 release records fetched the week before release (with `page: null` and a note where no 2028/29 announcement exists yet, as the type allows);
- the 2027/28 levels importer tested against the 2026/27 workbook's layout, finding tables by title as `scripts/fetch-council-tax.mjs` already does;
- the Table 10 2027/28 import path in `scripts/import-national.mjs`, ready for a new pinned hash;
- the levels day page, ranking card and precept day page rendering nothing until 2027/28 data exists.

## 5. Release day runbook (R8, Claude with Tom on hand to merge)

**The week before**
1. Check the announcement through the content API. When `state` turns "confirmed" and `display_date` gives a day, note it, and refetch the `RELEASES` records.
2. Cut the release worktree from main, run `npm ci`, and run every check on C6's staged switch with 2026/27 data only. Start the freeze.
3. Confirm Tom can merge between 10:30 and 12:00 on the day.

**Release morning (09:30)**
1. Confirm the statistics page is live through the content API. Record the title, publication time and attachment titles.
2. Run `node scripts/fetch-council-tax.mjs`, which pins and hashes the files it downloads. It refuses to write if any authority lacks a band or rows fall short. If it refuses, stop: no partial publication.
3. Run `npm run data:national` for the 2027/28 Table 10, with the new hash reviewed and recorded in `data/national/sources.json`.
4. Checks, each recorded in the PR:
   - 296 billing authorities, all eight bands;
   - the England average Band D and its change match MHCLG's headline text;
   - Burnley, Birmingham and Westminster checked cell by cell against the workbook;
   - Table 10 area totals reconcile as in the 2026/27 import;
   - every 2026/27 to 2027/28 change recomputes from the two published editions;
   - if the B1 tracker ran, its differences listed.
5. `npm test`, `npm run check`, `npm run build`, `npm run test:dist`, `npm run test:text`, `npm run test:e2e`, `npm run test:csp`, then `BUILD_OG=1 npm run build`.
6. Open the PR "Council tax 2027/28 levels" with the evidence. Target: open by 11:00, Tom merges by 12:00. Merging deploys.
7. After the deploy: spot-check five live pages, run `npm run indexnow`, and record the release in `docs/RELEASE.md`.

**If something goes wrong**
- The release slips: nothing changes on the site. The not-yet-set page already says "March 2027 (provisional)".
- The format changes (a table renamed or moved): the importer stops by design. Fix the title match in a reviewed commit the same day, or publish the next day. Never publish half the tables.
- MHCLG revises later that day: rerun from step 2 on a new branch, and say what changed in the PR.

## 6. Dates to diary

| When | What |
|---|---|
| December 2026 to February 2027 | 2027-28 referendum principles report (draft and final), by last year's pattern; triggers P6 |
| Early January 2027 | P6 prep and the C6 build (staged year switch, levels day page, precept day) |
| Late January to 10 March 2027 | Councils set 2027/28 council tax; B1 sweeps if chosen |
| Week before release | Runbook "the week before" |
| March 2027 (25 March last year) | R8 release morning |
