# Brand pages self canonical, navigation, links, formats, devolved cards, lastmod

The six brand pages now retain their own canonical URLs. Readers can reach nation pages, help and council budget games from the navigation and page body. Formatting and source labels are consistent, Scottish and Welsh council pages have dedicated share cards, the 404 offers council lookup, and all indexed routes carry dates from held editions or recorded releases.

Rebased `feat/brand-canonicals-nav` onto `origin/main` at `b202b0d`, including budget game merge `85f7e33` and the externally merged per resident PR 30. The ten items are committed separately in the brief's order, after the existing brief preparation commit.

## Per item results

| Item | Result |
|---|---|
| 1. Brand canonicals | Homepage, About, Contact, Corrections, Privacy and Methodology moved to self canonical. Other mappings and both fetched snapshots are unchanged. Canonical unit and distribution assertions pass. |
| 2. Navigation | Added Scotland, Wales, All tools and What changed. Renamed the publications entry. Every destination is a known route and every item label is unique. |
| 3. Body links | The England hub links all six requested routes. All 296 English profiles link to help and the existing band guidance anchor. Distribution assertions cover these links inside main content. |
| 4. Formats | Whole area charges use moneyPence. Abbreviated release months retain the original wording and publisher. File hashes remain in a provenance disclosure. Devolved SourceLine titles remove download metadata without changing the data. Percentages use one decimal. The output sweep rejects unseparated four digit pound figures outside scripts. |
| 5. Devolved pages | Added 32 Scottish and 22 Welsh cards with published Band D figures, basis and source. Corrected the shared canvas sizing so padding stays within the image and source footers remain visible. H1 headings include the year and source lines sit under the lede. Scotland's change column explicitly compares the two held editions. |
| 6. Titles | Findings, updates and the future cost calculator have the exact requested rendered titles, asserted in the distribution gate. |
| 7. 404 | Added the existing council finder and four requested links. Noindex and all production header routing tests pass. |
| 8. Budget links | All 296 English profiles link to their corresponding budget route, asserted in the distribution gate. |
| 9. Sitemap dates | All 687 URLs have valid dates no later than validation day. Data routes use held publication or retrieval dates; static routes use explicit release constants. Unknown routes fail instead of falling back to the clock. |
| 10. Export cleanup | Removed both unused export modules and only their export tests. The comparison page has a local type for the four source fields it reads. Source and test reference searches are clear; the distribution gate continues to reject downloadable CSV and JSON. |

## Canonical counts

| Measure | Before | After |
|---|---|---|
| Map entries | 325 | 319 |
| Listed self canonical URLs | 63 | 69 |
| Built mapped canonicals | 324 | 318 |

The retired rises route accounts for the one entry absent from the build. Its redirect is unchanged.

## Decisions taken

The help anchor already present is `#what-council-tax-band-am-i`, so links use it. The stored `Mar-27` belongs to the Scottish Government, so the expanded label attributes that wording to the Scottish Government. No GOV.UK attribution is invented. The devolved source manifest has no retrieval dates; the joined extract records 5 October 2026, which supplies the sitemap date. Static page dates describe recorded original releases, not the current build or a new retrieval. Publication dates are not relabelled as retrieval dates.

The local preview backgrounded itself during Playwright startup. `npx astro preview status` confirmed port 46321, and the successful run set `E2E_PORT=46321` and `E2E_BASE_URL=http://127.0.0.1:46321` to use that worktree's preview. The production header run used port 50788. No server or test configuration was weakened.

## Validation

| Check | Result |
|---|---|
| Pinned RA preparation | Source hashes, anchors and reconciliations pass; committed extract unchanged |
| npm run check | 152 files, no errors, warnings or hints |
| npm test | 225 tests across 30 files pass, no skips |
| npm run build | Pass with Pagefind and CSP hashes |
| npm run test:dist | 688 HTML pages, 687 sitemap URLs, 318 mapped canonicals and 69 listed self canonicals pass |
| npm run test:text | 695 files pass |
| Internal link audit | 55,231 destinations checked, none missing |
| npm run test:e2e | 210 tests pass |
| npm run test:csp | 75 tests pass with actual production headers |
| BUILD_OG=1 npm run build | Pass with 354 share cards, including 32 Scottish and 22 Welsh cards, Pagefind and CSP hashes |
| Final distribution and text checks | Pass with the same page and canonical counts; every page points to a built card |
| Browser tested output comparison | All 715 HTML, JavaScript, CSS, XML, header and redirect files match the final build byte for byte |

Logs are retained locally in `.ops/quick-wins/`. Source datasets, file hashes, canonical sitemap snapshots and test tolerances are unchanged. No individual is named in the changes. No estimates, substitute editions or inferred missing bands are introduced. No merge or deployment is included.

## Screenshots

The homepage, Edinburgh, Burnley and the 404 were inspected at 375px and 1280px, in light and dark themes. The desktop homepage capture uses a taller viewport to include its existing bill illustration. All other captures use a 900px viewport height.

| Page and theme | 375px | Desktop |
|---|---|---|
| Homepage, light | ![Homepage 375 light](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/home-375-light.png?raw=true) | ![Homepage desktop light](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/home-desktop-light.png?raw=true) |
| Homepage, dark | ![Homepage 375 dark](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/home-375-dark.png?raw=true) | ![Homepage desktop dark](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/home-desktop-dark.png?raw=true) |
| Edinburgh, light | ![Edinburgh 375 light](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/edinburgh-375-light.png?raw=true) | ![Edinburgh desktop light](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/edinburgh-desktop-light.png?raw=true) |
| Edinburgh, dark | ![Edinburgh 375 dark](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/edinburgh-375-dark.png?raw=true) | ![Edinburgh desktop dark](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/edinburgh-desktop-dark.png?raw=true) |
| Burnley, light | ![Burnley 375 light](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/burnley-375-light.png?raw=true) | ![Burnley desktop light](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/burnley-desktop-light.png?raw=true) |
| Burnley, dark | ![Burnley 375 dark](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/burnley-375-dark.png?raw=true) | ![Burnley desktop dark](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/burnley-desktop-dark.png?raw=true) |
| 404, light | ![404 375 light](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/404-375-light.png?raw=true) | ![404 desktop light](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/404-desktop-light.png?raw=true) |
| 404, dark | ![404 375 dark](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/404-375-dark.png?raw=true) | ![404 desktop dark](https://github.com/tompickup23/ukcounciltax/blob/feat/brand-canonicals-nav/output/playwright/404-desktop-dark.png?raw=true) |

Built with Codex from a brief prepared in Claude Code.
