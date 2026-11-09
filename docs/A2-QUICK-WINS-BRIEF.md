# A2: UK Council Tax quick wins | Codex brief

Written 10 November 2026 in Claude Code. Worktree `~/wt/uct-quick-wins`, branch `feat/brand-canonicals-nav`, cut from `origin/main` at `baf0f05`. **Before starting, fetch and rebase onto the current `origin/main`**: PR 26 (the budget game) is expected to have merged, and item 8 depends on its routes. One PR, one commit per item, in the order below. Read `CLAUDE.md` and `docs/RELEASE.md` first. Every assertion below was checked against the data on 10 November 2026.

## Rules that bind every item

- British English. No em dash, en dash or spaced hyphen as a dash anywhere, including JSON, comments and commit messages; `npm run test:text` sweeps the build.
- Never estimate or derive. Every figure keeps its source line. Name no individual.
- No inline script permission: component scripts are hashed after the build; run `npm run test:csp` after any script or header change.
- New static routes go into `STATIC_PATHS` in `src/lib/site.ts` in the same change; `tests/site.test.ts` fails otherwise.
- Stage named paths only. Do not merge or deploy. Merging deploys and is Tom's.
- Stop only on the conditions in the last section. Any other question gets the most conservative choice and a "Decisions taken" line in the PR.

## Item 1: brand pages self canonical

`data/canonical-map.json` has 325 `mappings` from ukcounciltax URLs to ukcouncils URLs and 63 `selfCanonicalUrls`. Move these six from `mappings` to `selfCanonicalUrls`: `https://ukcounciltax.co.uk/`, `/about/`, `/contact/`, `/corrections/`, `/privacy/`, `/methodology/`. Leave `/sources/`, `/your-area/`, `/compare/` and every council, band and region page mapped. Do not edit the two fetched sitemap snapshots under `data/canonical-sitemaps/`.

Update `tests/canonical.test.ts`: the three counts become 319 mapped (from 325), 69 unique (from 63) and 318 built mapped canonicals (from 324; the difference of one is the retired rises route, unchanged). `scripts/check-dist.mjs` reads the map and needs no count change; confirm its summary line reports 318 and 69. Record the change in `docs/RELEASE.md` under a dated heading: the six are this brand's own pages, not duplicates, and the budget game launches under the homepage.

## Item 2: navigation

`NAV_GROUPS` in `src/lib/site.ts`. Add to "Councils": `/scotland/` "Scotland" and `/wales/` "Wales" with one line descriptions in the house voice. Add to "Tools and help": `/tools/` "All tools" and `/changes/` "What changed". Relabel the "Tools and help" entry for `/data/` from "Sources" to "Official publications" so the "About" group's `/sources/` "Sources" is the only entry with that label. Assert in `tests/site.test.ts`: every `NAV_GROUPS` href is in `STATIC_PATHS` or a known programmatic hub, and no two items share a label.

## Item 3: body links from the hubs and profiles

On `/council-tax/` (`src/pages/council-tax/index.astro`) add a short "Also on this site" list after the England table: `/help/`, `/increases/`, `/precepts/`, `/scotland/`, `/wales/`, `/council-tax-2027-28/`. On every English council profile (`src/pages/councils/[slug].astro`) add two links to the existing related links block: "Help with your bill" to `/help/` and "What council tax band am I?" to `/help/#what-band` (use the anchor the help page already has; confirm its id). Assert in a dist check: `/council-tax/index.html` links all six, and every `/councils/<slug>/index.html` links `/help/`.

## Item 4: format sweep

Four known faults, each fixed where the value is formatted, never in data files:

- The increases table (`src/pages/increases.astro`, the whole area charges table) prints pounds without thousands separators, "£2432.50" where every other page prints "£2,432.50". Use `moneyPence` from `src/lib/tax-view.ts`. Add a dist check that no built HTML contains `£` followed by four or more digits without a separator, outside `<script>` and JSON blocks.
- `src/lib/next-year.ts` holds `stated: "Mar-27"`, the GOV.UK announcement's own display text, and `council-tax-2027-28.astro` prints it raw. Keep the stored value verbatim and render it as "March 2027 (stated on GOV.UK as “Mar-27”)" through one helper that maps `Mon-YY` to the month name and year, falling back to the stored text in quotes.
- The same page prints a SHA-256 in reader copy. Move file hashes into a `<details>` provenance block ("File provenance") on that page; keep them on the page.
- Welsh source titles carry ", file type: XLSX, file size: 26 KB" from gov.wales. `src/lib/releases.ts` already has `cleanTitle`; apply it where devolved source titles render (`[nation]/[slug].astro` and `[nation]/index.astro` through `SourceLine`), leaving `data/devolved/sources.json` verbatim.

Also make percentages one decimal on the Scottish and Welsh pages where England uses one (the Edinburgh page shows "4.00%"); find the formatter in `src/lib/devolved.ts` and match `council-tax.ts` line 208's convention.

## Item 5: Scottish and Welsh council pages

- Own share card: `src/pages/og/councils/[slug].png.ts` covers English councils only. Add `src/pages/og/[nation]/[slug].png.ts` rendering the same card template with the nation's Band D figure and basis line ("council tax only, water and sewerage excluded" for Scotland). Point `[nation]/[slug].astro` at it. Set `BUILD_OG=1` only in the final build; the workflow already does.
- H1 gains the year: "City of Edinburgh council tax 2026/27" (use `yearLabel`). Titles are unchanged (they are tested for the basis).
- A `SourceLine` directly under the lede figure, the same source as the table's.
- `/scotland/` gains a change column against 2025/26 where the dataset holds both editions (it holds three), labelled as a calculation.

Assert in a dist check: every Scottish and Welsh page's `og:image` points at a file that exists in `dist/og/<nation>/` and is not the homepage card; 54 such cards. Dry run: 32 Scottish and 22 Welsh councils in `data/devolved/council-tax.json`.

## Item 6: titles that carry the query

`src/pages/findings.astro` `title="Findings"` becomes "Council tax findings: parish precepts and Band D since 1993/94". `src/pages/changes.astro` `title="What changed"` becomes "What changed: council tax data updates". `src/pages/tools/future-cost.astro` becomes "Council tax future cost calculator". The layout appends " | UK Council Tax". Assert in the dist check that these three built titles match.

## Item 7: the 404 page

`src/pages/404.astro` has one sentence and one link. Add the `CouncilFinder` component (already used on `/your-area/`) and links to `/council-tax/`, `/help/`, `/scotland/`, `/wales/`. Keep `noindex`. `e2e-csp/not-found.spec.ts` must still pass.

## Item 8: budget game links from profiles

After the rebase, `src/lib/paths.ts` exposes the `/tools/budget/<slug>/` routes (PR 26). On every English council profile add a link "Explore [council]'s budget and play the budget game" to its budget page, in the related links block. Assert in a dist check that every `/councils/<slug>/index.html` links `/tools/budget/<slug>/`. If the rebase shows PR 26 has not merged, build this item on a stacked basis from `origin/feat/budget-game-i001` only if Tom has said so in the paste prompt; otherwise leave the item out and say so in the PR.

## Item 9: sitemap lastmod

`src/pages/sitemap.xml.ts` emits no `<lastmod>`. Add one per URL from data dates, never the build time: council and band pages from the England file's `source` publication or `generated` date, national pages from `data/national/sources.json` retrieval dates, devolved pages from `data/devolved/sources.json`, static pages from a dated constant per page in `src/lib/releases.ts` (the release records already carry dates). Assert in `scripts/check-dist.mjs`: every `<url>` has a `<lastmod>` in `YYYY-MM-DD` form, none later than today, and all 390 (or the post PR 26 count) are present. Record the rule in `docs/RELEASE.md`.

## Item 10: unused export helpers

`src/lib/national-export.ts` imports `csvCell` from `src/lib/tax-export.ts`; `src/pages/compare.astro` imports only a type from `tax-export.ts`; downloads were removed in PR 1. Remove `national-export.ts` and its tests (`tests/national-data.test.ts` and `tests/phase-two.test.ts` reference it; keep the tests that cover other behaviour). Keep `tax-export.ts` only if the compare page still needs its type after inlining is tried; otherwise remove it too. Assert: `git grep` finds no reference, `npm test` and `npm run check` pass, and the dist check still rejects CSV or JSON under `dist/downloads`.

## Self review before the PR

`npm run check`, `npm test`, `npm run build`, `npm run test:dist`, `npm run test:text`, `node scripts/audit-links.mjs`, `npm run test:e2e`, `npm run test:csp`, then `BUILD_OG=1 npm run build` and the distribution and text checks again. Grep the built HTML for dashes. Confirm no individual is named. Screenshots at 375px and desktop, light and dark: the homepage, `/scotland/city-of-edinburgh/`, `/councils/burnley/` and the 404. Open the PR titled "Brand pages self canonical, navigation, links, formats, devolved cards, lastmod" with per item results, the canonical counts before and after, the decisions taken and the screenshots. End with: "Built with Codex from a brief prepared in Claude Code." Do not merge.

## Stop and report, rather than work around it, if

- the canonical counts after item 1 are not 319, 69 and 318;
- any page would need a figure, date or source not held in `data/`;
- the `BUILD_OG=1` build fails on the new devolved cards;
- a test tolerance or source hash would have to change.
