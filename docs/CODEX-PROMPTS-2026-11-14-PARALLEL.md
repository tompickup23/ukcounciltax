# Codex prompts that can run beside session A | 14 November 2026

Written after Tom put the budget game first. Session A is `docs/CODEX-PROMPT-2026-11-14-C2-SESSION-A.md`. The two prompts here are in other repositories and touch no file session A touches, so all three can run at the same time. Each is pasted alone. None authorises a merge, tag or deployment.

| Prompt | Repository | Touches | Size |
|---|---|---|---|
| Session A, set the budget | ukcounciltax | The C2 pilot files, its data and audit script | Large |
| 1. Responsible council names | ukcouncils | `src/lib/council-functions.ts` and its tests | Small |
| 2. Compact RankedBars rows | estate-kit | `src/charts/rankedBars.ts`, its goldens and tests | Medium |

Not runnable now, with the reason:

- **The gates pack (session 10).** Its first lift is UK Council Tax's `scripts/inject_csp_hashes.mjs`, which the C2 pilot also changes. After session A merges.
- **Adopting the compact rows on UK Council Tax** (district increase bars, dropping `KIT_DASH_GUARD` from `scripts/check-dist.mjs`, retiring the two 24,500 px increase PNGs). Waits for prompt 2 to merge and be tagged. It touches `src/lib/kit-charts.ts`, so it runs after session A or with care.
- **NV11, compare as paired bars.** `/compare/` draws its comparison in the browser from a JSON island, and the kit draws SVG at build time. Drawing one bar pair per chosen pair needs a design decision (client side drawing, or bars only for a set of pairs) before a prompt.
- **W7, the picker on phones.** Already built on both sites (UK Council Tax `7e6f948`, PR 56; UK Councils has the same rule).
- **Session B, set the budget on the public site.** Written after session A is reviewed.
- **C6, levels day.** January, after the December settlement.

## 1. ukcouncils: responsible council names in two tier areas

```text
Repository tompickup23/ukcouncils. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. The repository is public: never commit a secret, a home path or anything from ~/Documents. Cite no new source and estimate nothing. When the work is done: commit, push and open the PR; do not finish with anything uncommitted. Do not merge, tag or deploy.

Why: on a two tier profile the responsibility table names the county formally and the district by its short name, for example "Lancashire County Council" beside "Burnley". The reader cannot tell the second is a council. docs/STATE.md records this as a small open point.

Setup: worktree ~/wt/ukc-function-names on branch fix/function-names from origin/main. Read CLAUDE.md (note the held reorganisation field), docs/STATE.md, src/lib/council-functions.ts, src/components/ProfileServices.astro and the tests that cover them.

Build:
1. In functionsFor, the billing authority's cell uses the registry's officialName (for Burnley, "Burnley Borough Council") for every class the function covers: SD, UA, MD, ILB, OLB. The county cell keeps its present form. Read officialName from the registry object already passed in; do not edit data/registry/councils.json and do not read or render its reorganisation field.
2. Fail the build, not the page, if an authority that reaches the table has no officialName. Count from the registry how many of the 294 tables this changes and say so in the PR body.
3. Unit tests: a district (Burnley), a unitary, a metropolitan district and a London borough each show their official name; the county row in a two tier area is unchanged; City of London and Isles of Scilly still get no table.
4. Check the county string against the data: if any county name already ends in "County Council", the present suffix doubles it. Report what you find; fix it only if it occurs.

Verification: npm test, npm run check, npm run build, the dist and text checks, and the focused profile browser checks at 375 and desktop. Number diff: profile pages change only in the responsibility table's cells; list the allowance in the PR body under "Pages allowed to differ". Replace docs/STATE.md in at most 20 lines.
```

## 2. estate-kit: compact RankedBars rows

```text
Repository tompickup23/estate-kit. One PR. Node 22: put ~/.nvm/versions/node/v22.23.4/bin first on PATH. British English; no em dash, en dash or spaced hyphen anywhere, including comments, JSON and test names. Stage named paths only, never git add -A or git add . Never bypass the pre-commit hook. Never commit a secret, a home path, anything from ~/Documents or anything from the Reports repository. Do not merge, tag or deploy; tags are made after review. When the work is done: commit, push and open the PR; do not finish with anything uncommitted.

Why: RankedBars draws one full row per area. UK Council Tax's current year district increase drawing has 164 rows and measures about 7,000 px tall at 375 px wide, and its PNG download is 1,200 by 24,500 px. A reader on a phone scrolls past several screens of bars. The rows need a compact form, without dropping any row, sorting rows or changing the comparable group rules.

Setup: worktree ~/wt/kit-compact-rows on branch feat/ranked-bars-compact from origin/main (0.6.2 at e68b5b2). Read README.md, CHANGELOG.md, UPGRADE_PLAN_2026-11-11.md (the stop rule P1: this is an option on a built form, not a new form), src/charts/rankedBars.ts, src/charts/canvas.ts, the RankedBars goldens and tests, and the layout gate tests (NV14).

Build:
1. Add an option density: "regular" | "compact" to RankedBarsOptions, defaulting to "regular". Regular output must be byte for byte unchanged: every existing golden passes untouched.
2. Compact puts the label, the bar and the value on one line at a smaller row height, and the change marker, where rows have one, in the same line after the value or as a short marker beside the bar. Choose the layout that keeps every label and value legible at 375 px in both themes and measure it; text below the kit's smallest permitted size is a failure, not a trade. Unknown stays drawn as unknown. If a label does not fit, truncation is not allowed: throw with the row's name, as the chart already does for a value that leaves no room.
3. The table twin, alt text, caption and source line do not change with density.
4. Goldens for compact: a 164 row fixture with change markers, a fixture with unknown values, and a short fixture of five rows, each in light and dark.
5. Report, in the PR body, the height at 375 and the PNG pixel height for the 164 row fixture in both densities, and the smallest text size used.
6. Bump to 0.6.3, with a CHANGELOG entry.

Verification: the kit's unit tests, type check, golden tests, the layout gate at 375 and 1440 in both themes with axe, and the catalogue build. Open the PR; Claude Code reviews it and tags after merge.
```
