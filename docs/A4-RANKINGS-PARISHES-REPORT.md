# A4 review and handover | 9 November 2026

Worktree: `~/wt/uct-rankings`. Branch: `feat/rankings-parishes`. A2 PR 32 was confirmed merged before the initial rebase. A3 was not merged at that point. The final rebase onto `aad466c` picked up planning documents only and completed without conflicts. This change is for review only; do not merge or deploy from this handover.

## Per phase results

1. Added the ranking library and tests for completeness, stored precision, standard competition ties, every required position anchor and ordinal wording. Class counts are 164, 63, 36, 33 and 21, covering all 296 billing authorities and 21 counties.
2. Added the ranking index and five class pages. Each table has sources, the appropriate area and own reference figures, keyed verbatim MHCLG notes, and an incomplete-class state tested through the page data function.
3. Added one sourced class position within the existing comparison section on each of the 296 profiles. No county position is added to district profiles.
4. Added a parish index and 214 area pages, preserving all 10,245 rows. Shared range sentences handle zero, negative, single-value, tied and ceased entries. Own share excludes parish precepts. Changes are calculated only on the same source row.
5. Replaced profile parish tables with shared summaries and links on 214 profiles; 82 absence notices retain their wording. The filter, table, notes and Durham caveat now live on the parish pages. The precept breakdown markup is unchanged from A2.
6. Added links in NAV_GROUPS, the England tax hub, precepts hub and increases page. The homepage, header, footer and global stylesheet are untouched.
7. Added exactly 221 self canonical URLs: six ranking routes and 215 parish routes. HTML pages move from 688 to 909, sitemap URLs from 687 to 908. The existing 318 mapped canonicals and 69 listed self canonicals remain. Ranking lastmod is 2026-03-25 from the held edition's update date; parish lastmod is 2026-10-05 from the held parish retrieval date. The canonical map and its two snapshots are unchanged.
8. All 221 new pages use the existing default share card. There are no new card templates or per-route renders. Added browser coverage for accessibility in both themes and static rankings without JavaScript, and checked the moved filter under the production policy.

## Built anchors

- Unitary area Band D: Windsor and Maidenhead first, £1,952.62; Isles of Scilly second, £2,047.96; Nottingham 62nd, £2,755.39; Dorset last, £2,765.02.
- Havant and Rushmoor: both area position 21= at £2,320.28 and own position 116= at £246.87. The next area position is 23.
- Lewes: area position 164, £2,756.17, with note ad beside the row and the published pending approval wording. Own position 107, £242.02, with note x in the keyed list.
- Burnley: area position 130 and own position 160 of 164. Eight parish rows, own share £351.44 from Table 8c; Padiham shows £38.64, £44.06 and +£5.42.
- Lancaster: 37 rows, 34 non zero, from £12.18 at Over Wyresdale to £395.11 at Wennington, with three published £0.00 rows. Own share is £272.20 from Table 8c.
- East Lindsey preserves minus £2.64 for Beesby with Saleby in prose and -£2.64 in its table. City of London preserves both Temples at £2,038.90. Bournemouth, Christchurch and Poole has two ceased rows and five comparable changes. North Yorkshire retains all 665 parish rows on its parish page.

Exact Burnley sentence from the built page:

> The 2026/27 return lists 8 local precepting authorities in Burnley. 8 set a Band D precept, from £7.36 (Ightenhill) to £44.06 (Padiham).

Exact Lancaster sentence from the built page:

> The 2026/27 return lists 37 local precepting authorities in Lancaster. 34 set a Band D precept, from £12.18 (Over Wyresdale) to £395.11 (Wennington). 3 set a Band D precept of £0.00.

## Decisions taken

- Decision 5, confirmed on 9 November 2026: rank Lewes on the published figure, with MHCLG's pending approval note beside the row and in the keyed note list.
- A3 was absent at the initial rebase. Keep the profile edits inside the existing comparison and parish sections; a rebase onto A3 will be needed when it lands.
- Preserve the protected shared footer, including its existing ecosystem links. The new parish page content links externally only to its MHCLG workbook and GOV.UK; the external-link assertion is scoped to main content. No new ecosystem destination is introduced.
- Sort the parish index by MHCLG display name, using the registry only for identity and slugs. This keeps Durham and Folkestone and Hythe in the displayed alphabetical order without changing registry data.
- County names are plain row headings because this site has no county profiles. No county route or unsupported link is invented.
- Use the longer London wording for both title and H1 so they match and explicitly include the City of London.
- Shorten the brief's metadata descriptions to preserve the existing 160-character gate. Keep the complete figures, names, basis and source information in the body. No tolerance is changed.
- Record route dates when the routes are created, because A2 requires a date for every sitemap route; phase 7 audits the exact dates and counts.
- Use “All” before plural class labels in the lede and profile link for grammatical British English. The meaning and ranking conventions are unchanged.
- Use “in addition to” in the parish own-share explanation to avoid the prohibited ranking word while preserving the billing distinction.
- Retain screenshots locally and uncommitted. The available GitHub browser is signed out and cannot attach to this private PR; the PR records the local image directory and archive. No public image host is introduced.

## Screenshots

Local directory: `output/playwright/a4/`. Each named view has mobile 375 by 812 and desktop 1440 by 1000 captures in light and dark, with the comparison section captured at its full element height. Files use `{view}-{mobile|desktop}-{light|dark}.png`.

| View | Route and position |
| --- | --- |
| unitary | `/council-tax/ranked/unitary-authorities/` |
| shire-havant | `/council-tax/ranked/shire-districts/`, scrolled to Havant |
| lancaster | `/precepts/parishes/lancaster/` |
| parish-index | `/precepts/parishes/` |
| burnley-compared | `/councils/burnley/#compared` |

There are 20 requested captures and eight supplementary table views for unitary authorities and Lancaster. The archive is `output/playwright/a4/screenshots.zip`. Review sheets are also local. All captures were visually inspected; no page overflow occurred at 375px. Wide tables retain the site's keyboard-focusable scroll regions. Screenshots are not staged.

## Validation and resumption

Final validation results and output sizes are recorded below. The PR URL and hosted check state are retained locally in `.ops/a4/pr.json`; the PR can also be found with `gh pr view feat/rankings-parishes`. Local command logs and baseline evidence are in `.ops/a4/`. Resume by reading this report and the two binding A4 documents, checking the PR and current main, and preserving A5's protected files. Do not merge or deploy without a new explicit instruction.


## Final output measurements

| Output | Bytes |
| --- | ---: |
| `/council-tax/ranked/shire-districts/` | 103,209 |
| `/precepts/parishes/north-yorkshire/` | 297,674 |
| `/councils/north-yorkshire/` | 144,619 |

The North Yorkshire profile baseline was 383,294 bytes on the rebased A2 build before A4. Final measurements include the added navigation links. The output audit also verifies 10,241 published parish rows, 1,339 published zero rows, 8,902 non zero rows and all 354 existing share cards. Both binding source hashes remain unchanged.

## Final checks

- `npm test`: 242 tests across 34 files passed, no skips.
- `npm run check`: 164 files, no errors, warnings or hints.
- `BUILD_OG=1 npm run build`: completed on Node 22.23.4, including all 354 share cards, Pagefind and CSP hashing.
- `npm run test:dist`: 909 HTML pages, 908 sitemap URLs, 318 mapped canonicals and 69 listed self canonicals, all passed.
- `npm run test:text`: 916 files passed.
- `node scripts/audit-links.mjs`: 74,261 destinations checked, none missing.
- `npm run test:e2e`: 220 passed in the full run; four tests timed out, then all four passed with `--last-failed --workers=1`. Every one of the 224 tests has a passing result against the final build. No assertion or timeout changed.
- `npm run test:csp`: all 78 production header tests passed, including parish filtering, with two workers.

Initial validation caught an ambiguous test link selector, a browser sitemap assertion still using the previous route count, and descriptions longer than the existing limit. These were corrected without changing a tolerance. Final review also corrected the parish index's displayed-name ordering and added a regression assertion. The final build contains that correction.

The final browser run initially timed out in both mobile Burnley keyboard game tests and the desktop shire ranking and parish index accessibility tests. Their serial rerun passed in 38.7, 31.5, 10.2 and 16.9 seconds respectively. Both run logs are retained locally. Screenshots were refreshed against the final build and visually inspected in all four viewport and theme combinations. No application code changed after the final build.
