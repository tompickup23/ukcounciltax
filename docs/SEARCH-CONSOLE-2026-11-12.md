# Search Console check | 12 November 2026

Observed in the domain properties. No canonical, redirect, ownership or indexing-request changes were made.

| Property | Sitemap result | Discovered pages | Last read |
|---|---|---:|---|
| UK Councils | Existing sitemap successful | 328 | 9 November 2026 |
| UK Council Tax | Submitted `/sitemap.xml`; successful | 908 | 12 November 2026 |

The ten sampled UKCT URLs below are indexed. Each inspection reports its own UKCT URL as the user-declared canonical and `Inspected URL` as Google's selected canonical. These are indexed-copy results at the reported crawl, not a live-test verdict or proof that a cross-domain canonical has been accepted.

| UKCT path | Last crawl shown |
|---|---|
| `/` | 10 November 2026, 11:15:44 |
| `/compare/` | 3 November 2026, 09:47:20 |
| `/council-tax/` | 8 October 2026, 03:56:27 |
| `/council-tax/band-d/` | 7 October 2026, 22:06:37 |
| `/councils/burnley/` | 30 October 2026, 00:42:50 |
| `/councils/birmingham/` | 3 November 2026, 08:20:57 |
| `/councils/westminster/` | 6 November 2026, 12:48:58 |
| `/councils/camden/` | 31 October 2026, 02:04:03 |
| `/councils/manchester/` | 3 November 2026, 13:20:25 |
| `/councils/leeds/` | 8 November 2026, 17:28:51 |

The full local production build at `bcb5a92` declares the UKCT homepage itself canonical and declares the corresponding UK Councils URL for the other nine sampled routes. Those nine recorded crawls predate the 8 November cross-domain canonical deployment. The indexed-copy results therefore do not establish acceptance of the newer canonical instructions. The homepage self-canonical matches the current local build.

Times are copied as displayed by Search Console. A separate command-line live fetch received HTTP 403, so it supplied no current HTML evidence. Recheck this same sample after Google reports new crawls and compare with the published canonical policy. Do not change canonicals to force a result during the current staging period.
