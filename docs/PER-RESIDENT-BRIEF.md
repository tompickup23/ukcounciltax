# Spend per resident by age | Codex brief (C4, idea I124)

Written 8 November 2026 in Claude Code. Read `docs/PER-RESIDENT-SOURCE-NOTES.md` first; it is binding and wins over this brief.

**Start only after the budget game PR (C1, branch `feat/budget-game-i001`) has merged into main.** This worktree was cut from main before that merge. Your first step is to rebase onto `origin/main` and confirm that `data/national/budget.json`, `src/lib/budget.ts` and `src/pages/tools/budget/[slug].astro` exist. If they do not, stop and report.

## Phases

### Phase 1: population data (commit "Import ONS mid-2025 population by age")

1. `scripts/import-population.mjs`, on the pattern of the existing national importers: it fetches the pinned `mye25tablesuk.xlsx` only when missing and refuses a file whose sha256 differs. It reads sheet `MYE2 - Persons` (header row with `Code`; age labels are text) and writes `data/national/population.json`. That file holds, for every English row with a 9-character code starting with E: code, name, ONS geography, all ages, under 18, 18 to 64, 65 and over, and 18 and over, plus the edition block (publisher, release, file URL, sha256, published 2026-10-01, reference mid-2025, retrieved). Add the source entry to `data/national/sources.json` and append the importer to `data:national`. If the repo cannot read `.xlsx` with an existing dependency, add the smallest well-known reader as a dev dependency and say so in the PR. Never convert the file by hand.
2. Tests in `tests/population.test.ts`: the hash; 333 English rows with the geography counts in the notes, section 1; the four bands sum to all ages for every row; the anchor populations for Birmingham, Westminster and Lancashire; Barnsley and Sheffield present only under E08000016 and E08000019.

### Phase 2: ratios (commit "Social care spend per resident")

1. `src/lib/per-resident.ts` joins `budget.json` to `population.json` by code. Ratios only for RA classes SC, UA, MD and LB with a return and an ONS row by the same code. Each ratio is a calculation record holding numerator lines, denominator band, both editions and the unrounded value. The five councils with no return and Barnsley and Sheffield get null with a reason string.
2. Tests in `tests/per-resident.test.ts`:
   - 146 councils with ratios; the seven exclusions by code and reason;
   - no shire district has a ratio, even those with non-zero social care lines;
   - the anchor ratios in the notes, section 4, to the cent;
   - the not-attributed-by-age amount equals line 360 less the ten age lines, for every council with ratios;
   - the class filter, not values, decides eligibility.

### Phase 3: display (commit "Show per resident figures on budget pages")

On `/tools/budget/<slug>/`, beside the adult and children's social care rows:
- a short "Per resident" block with the four ratios to the nearest pound, and the amount and share not attributed by age;
- the lines feeding each ratio, named in words;
- the source sentence naming both editions;
- the sentence "The population estimate is for mid-2025; the budget is for 2026/27.";
- for the City of London and the Isles of Scilly, the small population note.

On a district page, the county's block sits under the county heading. Barnsley and Sheffield get the boundary sentence from the notes, section 2, and no figures. Plain HTML, no new client script. No ranking, average or comparison. Add a methodology paragraph, a sources entry and a release entry in `docs/RELEASE.md`. Copy the source notes' facts; do not paraphrase figures.

### Phase 4: checks and PR

Run, all green, and paste the summaries into the PR: `npm test`, `npm run check`, `npm run build`, `npm run test:dist`, `npm run test:text`, `npm run test:e2e`, `npm run test:csp`, then `BUILD_OG=1 npm run build`. Then push `feat/per-resident-i124` and open one PR, "Social care spend per resident by age (I124)". In the body: each phase, the counts, screenshots of Birmingham, Burnley (showing the county block) and the City of London at 375px and desktop, and what you did not do. End with: "Built with Codex from a brief prepared in Claude Code." Do not merge or deploy.

## Stop and report, rather than work around it, if

- the C1 files are missing after the rebase;
- the ONS file's hash differs;
- any anchor value fails;
- a council outside the notes' exclusion list lacks an ONS row;
- the page would need a figure, average or ranking not described in the notes.
