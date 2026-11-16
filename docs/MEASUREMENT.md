# Measurement | UK Council Tax and UK Councils | started 16 November 2026

One record for both sites, kept here because UK Councils `docs/STATE.md` already points at this path. It exists so the May to June 2027 reversal can be decided on a before and after record, and so each wave of the restyle can be judged on something other than taste. A session adds one dated row to section 4 each Monday. Nothing is estimated: a figure that was not read is left blank with the reason.

## 1. What was already live when measuring began

Measuring was planned to start before the first restyle wave (design audit, workstream P0). It starts on 16 November 2026, after these had merged. Times are the merge commits on each main branch, in UTC; publication follows the hosted run a few minutes later.

| Merged | Site | Change |
|---|---|---|
| 8 November 2026 | UK Council Tax | Cross domain canonicals to UK Councils deployed (`docs/SEARCH-CONSOLE-2026-11-12.md`) |
| 15 November 2026 | UK Council Tax | W0: budget band on the homepage and `/tools/`, the England map card (PR 89) |
| 15 November, 23:13 | UK Council Tax | W1: Guess and Set doors on the budget pages (PR 93) |
| 16 November, 02:54 | UK Council Tax | W2: set page workbench (PR 96) |
| 16 November, 03:24 | UK Council Tax | Towns pages, 642 new routes (PR 95) |
| 16 November, 12:17 | UK Council Tax | F1 foundation: shared desk band and record lines (PR 97) |
| 16 November, 15:00 | UK Councils | U2 homepage with the UK Council Tax tools band (PR 63) |

So there is no clean before figure for W0 to W2, the towns pages or U2 from this record. Search Console keeps 16 months of history and Cloudflare Web Analytics keeps a rolling window, so the period before 15 November can still be read back from both as long as it is read soon; that read is the first job in section 4. The only earlier written record is `docs/SEARCH-CONSOLE-2026-11-12.md`: 328 discovered pages for UK Councils (last read 9 November) and 908 for UK Council Tax (last read 12 November), and a ten URL canonical sample.

## 2. Measures

| Measure | Source | What it counts | Limits |
|---|---|---|---|
| Clicks, impressions, click through rate, average position | Google Search Console, Performance, Search results, one row per domain property | Google web search only, for the dates shown in the report | Recent days are provisional; record the date range as displayed |
| Pages indexed and pages discovered through the sitemap | Search Console, Pages and Sitemaps reports | Google's count at its own last read date | Record the last read date beside the figure |
| Canonical sample | Search Console URL inspection of the ten URLs in `docs/SEARCH-CONSOLE-2026-11-12.md` | For each URL: the declared canonical, Google's selected canonical and the last crawl | An indexed copy result, not a live test |
| Page views by path | Cloudflare Web Analytics, each site's own token | Page loads reported by the beacon, paths only | No beacon on the set pages (below); blocked by some browsers |
| Share of visits arriving from the other site | Cloudflare Web Analytics, referrers | Page loads whose referrer host is the sister site | Referrer is often withheld |
| Page height, LCP and CLS at 390 and 1440 | The design check in each page pull request | A lab measure on the built page | Not field data; copy from the PR body with its PR number |

Paths to read each week on UK Council Tax: `/`, `/tools/`, `/tools/budget/`, the `/tools/budget/<slug>/` family as a total, `/compare/`, the `/council-tax/towns/` family as a total, the `/councils/<slug>/` family as a total. On UK Councils: `/`, `/your-area/`, `/councils/`, the `/councils/<slug>/` family as a total.

**The set pages cannot be measured.** `docs/RELEASE.md` records that the set pages omit the analytics beacon. The audit's first proxy, set page views as a share of game page views, therefore has no source. Two honest substitutes exist: Search Console clicks and impressions for the `/set/` URLs, and game page views before and after W1 (which added the Set door). Adding the beacon to the set pages would change what the privacy page says and is Tom's decision; the default is to leave it off.

No event tracking, no cookies, no personal data. Nothing here needs a change to either site.

## 3. What the reversal needs from this record

Not decided. My recommendation for Tom, by 15 December 2026 with the other dossier decisions: no numeric threshold; the record must show (a) at least eight consecutive weekly rows before the decision, (b) Google's selected canonical for the ten sampled URLs matching the declared one, and (c) the clicks and impressions of both properties for the 28 days before the reversal, so the same read 28 days after it can be set beside it. Until Tom decides, the weekly rows are kept and no conclusion is drawn from them.

## 4. Weekly record

Each row: the date read, who read it, the date range the report displayed, and the figures as displayed. Blank means not read.

### 16 November 2026 (week 1)

Read by: Claude Code. Search Console and Cloudflare Web Analytics were not read: the Chrome extension was not connected in this session and no API token for either is held. This row is owed, with the read back of the 28 days to 14 November, by the next session that has Chrome, or by Tom.

| Measure | UK Council Tax | UK Councils | Date range shown |
|---|---|---|---|
| Clicks, 28 days | | | |
| Impressions, 28 days | | | |
| Click through rate | | | |
| Average position | | | |
| Pages indexed | | | |
| Pages discovered through the sitemap | 908 (read 12 November, from the 12 November note) | 328 (read 9 November, from the 12 November note) | As stated |
| Canonical sample, selected matches declared | | Not applicable | |
| Page views, 7 days, paths in section 2 | | | |
| Share of page loads referred by the sister site | | | |

Lab measures on record for this week, from pull request bodies: PR 99 (W3, open) reports the set page at 2,733 px and 2,760 px desktop height, LCP under 0.32 s and CLS under 0.001 on its two set page templates, against a local preview.
