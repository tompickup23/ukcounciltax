# Codex prompt | Set the budget, session A | 14 November 2026

Tom chose on 14 November 2026 to put the budget game first and to run C2 in December (decision X2, December). The deeper game lets a reader set each council's own Band D and its net spending by service group, from the official revenue account return. The engine already exists as the local pilot in draft PR 68 for Burnley and Blackburn with Darwen (`docs/C2-PILOT-2026-11-13.md` on `feat/budget-freeze-pilot`). This session takes stages 1 to 3 of that pilot's production brief to every eligible English billing authority. Session B, outlined at the end, puts the mode on the public site after this session is reviewed.

What the reader can and cannot set, settled before this session:

- **Departments** means the RA service groups (education, adult social care, children's social care, highways and transport, housing, cultural, environmental, planning and development, central services, other), not a council's own directorates. Directorate budgets need each council's budget book and stay bespoke, as Burnley's scenario game is.
- **Council tax** means the council's own Band D only. Parish precepts, the county, the GLA, police and fire stay fixed. Setting every precepting body on a bill is later work.
- Counties are not billing authorities and are out of scope. Reserves, fees, demand, service consequences and future years stay out, as the pilot record says.

Paste the block below alone. It authorises no merge, tag or deployment.

```text
Repository tompickup23/ukcounciltax. One draft PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. When the work is done: commit, push and open the PR as a draft; do not finish with anything uncommitted. Do not merge, tag or deploy. Add no public route: this session's output builds only to .ops/c2-dist, as the pilot does.

Why: Tom wants the budget game deeper, so a reader can set a council's own council tax and its spending by service group and see whether the budget balances. The local pilot in draft PR 68 does this for two councils with exact arithmetic. This session decides, from held official sources only, which councils can have it and under which referendum rule, and widens the pilot from two councils to that cohort. It is stages 1 to 3 of the production brief in docs/C2-PILOT-2026-11-13.md.

Setup:
1. Worktree ~/wt/uct-c2-cohort on a new branch feat/budget-c2-cohort from origin/feat/budget-freeze-pilot. Merge origin/main into it (a merge commit; never rebase or force push). Resolve any conflict in favour of main for everything outside the pilot's own files.
2. Copy the ignored folder data/raw/ from ~/wt/uct-c2-pilot/data/raw/. The pilot's seven raw files are listed with URL and SHA256 in data/pilots/budget-freeze.json. Download any that are absent from exactly the recorded URL and stop if a hash differs. These are already pinned sources, not new ones.
3. Read CLAUDE.md, docs/STATE.md, docs/C2-PILOT-2026-11-13.md (all of it), docs/C2-SOURCE-NOTES-2026-11-12.md, docs/C2-COVERAGE-2026-11-13.json, src/lib/budget-freeze.ts, src/lib/budget-freeze-data.ts, pilot/, scripts/audit-c2-pilot.mjs, tests/budget-freeze.test.ts, and the existing game in src/lib/budget-game*.ts and src/pages/tools/budget/.
4. Replay first: node scripts/audit-c2-pilot.mjs --check, npm test -- tests/budget-freeze.test.ts and npm run build:pilot must pass on the merged branch before any change. If they fail only because main moved, fix the merge and record what changed.

Step 1, source gates for every billing authority:
1. Start from the 296 authorities in docs/C2-COVERAGE-2026-11-13.json. Nine have no 2026/27 RA return and seven carry an RA note 4 cross-return discrepancy: both groups stay excluded, with that reason.
2. For each of the other authorities that failed the screen (54 total-requirement differences, 29 parish components, 33 authority-specific notes; reasons overlap), try to resolve the difference using only the held pinned files: RA parts 1 and 2, SG, Table 10, and annual Tables 1 to 9 for 2026/27 and 2025/26. Burnley first: the RA return prints parish precepts of 222,000 pounds and Table 10 prints 222,800 pounds, and own share does not reconcile within half a thousand either.
3. A difference is resolved only when a cell in a held file explains it and you can name the file, sheet, row and column. Printed precision (RA in thousands, Table 10 in pounds) explains a difference only within half a thousand pounds on that component. Never adjust, round, average or carry a figure to make sources agree. An unresolved authority is excluded, with a plain reason a reader can understand.
4. Read every authority-specific note in full. A note that changes the meaning of a figure the model uses excludes the authority; a note that does not is recorded as reviewed, with its text.

Step 2, referendum rules by GSS:
1. Extract the text of Council_Tax_Referendum_Principles_Report_2026-27.pdf with pdftotext -layout into .ops/ and quote from that text, never from a summary. Record page and paragraph for every rule.
2. Map every authority that survives Step 1 to exactly one principle by GSS: the category, the percentage and any pound alternative, whether the conditions are joined by AND or OR, whether each threshold is inclusive or strict, and the adult social care precept where it applies. The pilot found the district rule needs BOTH at least 3% and more than 5 pounds, and the social care authority rule is at least 5% in total; check these against the text rather than reusing them.
3. Read the annexes in full. Any authority with its own named principle, a different threshold or a permission outside the general categories is mapped individually from its own paragraph. An authority whose category cannot be established from the report is excluded with that reason. Do not generalise a category to an authority the report does not place in it. The City of London, the Isles of Scilly and any authority whose prior year own Band D is not comparable (a boundary or structure change between 2025/26 and 2026/27) get an explicit check.
4. Store the mapping in data, keyed by GSS and edition, with the page and paragraph. Unit test both sides of every threshold for every principle that has at least one authority, in exact pence: one penny under, equal, one penny over, and for AND or OR pairs each condition alone.
5. The interface wording stays the pilot's: a referendum would be required above the trigger. It is not a cap, a verdict on legality or a forecast of what any council will do.

Step 3, widen the model and the pilot to the cohort:
1. Generalise data/pilots/budget-freeze.json and its builder from two councils to every eligible authority, keeping the same model rules: integer arithmetic in units of 0.0001 pounds; own Band D in pence; tax base in hundredths of a Band D equivalent; the freeze starts from the prior year own Band D; parish, grants, reserves, other financing and the lines between RA 799 and 900 fixed; education, public health, net income groups and published zeros fixed; the editable range stays the pilot's prototype range of zero to twice each positive published amount, labelled as in the pilot. Bump the model version.
2. Write a full eligibility manifest for all 296 authorities: eligible or excluded, the reason in plain words, the referendum principle and its citation for each eligible one. The reason text must be usable on a public "not available for this council" page in session B. Never offer an estimate or a national average in place of an excluded council.
3. Extend scripts/audit-c2-pilot.mjs so --check rebuilds the fixture and the manifest from the raw files and fails on any drift.
4. The local pilot build in .ops/c2-dist covers every eligible authority, noindex, with no change to the production configuration, routes, sitemap, canonicals or navigation.
5. Check ten eligible authorities by hand against the raw cells (at least two from each of unitary, metropolitan district, inner London, outer London and shire district where the cohort has them) and independently recompute each freeze calculation with Python Decimal. Put the ten in the PR body.

Do not touch: published figures, the public routes, the existing guessing and scenario modes, the reorganisation field (held), the Estate Kit vendor folder, year and release constants.

Questions answered in advance:
- Fractional penny differences: keep the pilot's handling. Exact balance and displayed balance stay distinct.
- A reader may go above the referendum trigger. The page says a referendum would be required; it does not stop them.
- Excluded councils: the manifest says why; nothing is estimated.
- Counties: out of scope. Do not join county precepts.
- If more than half the authorities end up excluded, still finish: record the counts and reasons, and say which single source gap would bring most back.

Stop only for a raw file hash mismatch, a failing security header test that you cannot fix without weakening the policy, or a secret in the diff. Decide everything else by the rules above and record the decision in the PR body.

Verification: npm test (serial with --maxWorkers=1 if timeouts appear; do not change timeouts or assertions), npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, node scripts/audit-c2-pilot.mjs --check, npm run build:pilot, the pilot browser checks at 375 and 1440 in both themes for three eligible authorities of different classes, and the production CSP suite. The number diff must show no public page changed.

PR body: the eligible count by class against the class total; a table of exclusions by reason; the referendum principles used, each with page and paragraph and its authority count; the ten hand checks; anything you decided that Tom should see; the verification results. Replace docs/STATE.md in at most 20 lines. Say in the body that this PR supersedes draft PR 68.
```

## Session B, outline only

Written after session A is reviewed, because its cohort and exclusions set the scope. The recommended shape, for Tom to confirm then:

- Route `/tools/budget/<slug>/set/` beside the existing game at `/tools/budget/<slug>/`, entered from a "Set the budget yourself" link on that page. Excluded councils get the manifest's reason, not the mode.
- Pilot stages 4 to 6: phone control range, source warnings, durable browser tests, production route, sitemap and distribution gates, whole site number diff, release review.
- Open for Tom then: whether the prototype range of zero to twice each amount is the public range, and whether the mode replaces the Burnley scenario link or sits beside it.
