# UK Council Tax specialist build, 5 October 2026

## Scope and provenance

New standalone Astro project, copied selectively from UK Councils commit 779dec32274f39d9d84bb311c49e8476d3b1e2a9. The source project and its live deployment are not migrated by this release. UK Council Tax remains the specialist tax product; broad council, elections, demographics and spending context is linked to public ecosystem routes.

England: three MHCLG editions, 296 billing authorities per edition, published A to H area charges. Historical joins use the same GSS identity; missing historical values remain unavailable. Area averages include average parish precepts and are not exact property bills.

Scotland: 32 councils, all eight published bands, 2024/25 to 2026/27. Official Scottish Government workbook cells, rounded to the displayed penny precision. Excludes water and sewerage. Source URLs and SHA256s in data/devolved/sources.json. Importer verifies hashes and complete identities.

Wales: 22 current Band D area averages, county/community/police elements. Welsh Government 2026/27 Table 1 displays whole pounds, which are preserved. Bands other than D are absent, not inferred. Components rounded separately may differ from the displayed total.

Burnley: adopted public 2026/27 charge schedule, nine localities including the unparished area and eight parishes, all eight bands. The four core component rows plus local parish amounts reconcile exactly to all 72 totals. A postcode suggests the locality but confirmation is required. Source PDF hash is in data/local-bills/burnley-2026-27.json; importer uses Poppler and fails on component discrepancies.

London: approved GLA decision MD3472, Band D precept and police/non-police split; City of London exception. Already part of national area totals. Official page verified via web retrieval; direct HTTP retrieval was denied, so no raw file hash is claimed. This is contextual Band D detail, not an exact all-band local schedule.

## Features

- Homepage with a sourced bill anatomy, prominent area lookup and four task routes.
- Annual increase explorer by band, year pair, council name and class. Whole-area calculated increases remain distinct from the published own-share change.
- Three-year all-band histories on English and Scottish council pages.
- Future-cost calculator with explicit rate/horizon, cumulative cost, frozen-charge comparison, shareable assumptions and source-bearing CSV.
- Local bill tool, locality confirmation, named bodies, separate component modelling, ten/twelve-payment budgeting equivalents, no postcode storage or query strings.
- Help, coverage and downloadable England CSV/source manifest pages. Neutral official guidance links, no eligibility decisions.
- Scotland/Wales routes in sitemap and postcode navigation.
- Contextual UK Councils and UK Places links only where shared slugs match live sitemap routes. Existing Elections, Demographics, AI DOGE and Asylum Stats mappings rechecked on 5 October 2026; no mismatches. No private UK Food Hygiene links.
- Own analytics is disabled. Privacy text reflects actual behaviour.

## Release checks

On 5 October 2026 the final build passed 86 unit tests across ten files, and Astro check across 94 files with no errors, warnings or hints. BUILD_OG=1 produced 389 HTML pages, 388 indexed routes and valid share-card references on all 389 pages. The internal link audit checked 25,119 destinations with no missing local files.

The immutable Cloudflare review deployment https://e1c06f02.ukcounciltax.pages.dev passed all 148 desktop/mobile browser tests and all 51 production-header tests. This includes source-preserving downloads and comparisons, no-JavaScript fallbacks, postcode locality confirmation, missing-precept handling, scenario validation, keyboard navigation, light/dark accessibility, 375px overflow and actual deployed CSP. Mobile homepage and dark council-page screenshots were visually inspected. The calculator heading and increase-selector label issues found in the first review build were fixed before this final passing run. Parallel suites now use independent artifact directories.

An earlier CUA localhost action was rejected by browser URL policy; no alternate route to that blocked local target was used. Release browser checks instead tested the independently authorised public Cloudflare deployment. The production site was also loaded successfully through CUA.

## Remaining coverage and launch gates

- Expand adopted local schedules and date-specific postcode/parish/precept geography joins. Nationwide parish, police, fire and mayoral breakdowns are not complete. Never replace unknown with zero or sum a bundled component twice.
- Add Welsh A to I only from an appropriate published table; Northern Ireland needs its own domestic-rate model.
- Establish a reviewed shared-registry export and any additional source-refresh checks. `data:registry` accepts an explicit source file; it does not open sibling repos implicitly.
- Custom-domain HTTPS and the GitHub release workflow are verified, as recorded in the national-release follow-up below. Some individual DNS resolvers may temporarily retain the original parking address.
- Configure a public corrections/contact address after Tom identifies the mailbox. No address has been invented or published from private account details.
- UK Councils migration/cross-site edits require their own scoped change; none is made by this release.

Public school-holiday homepage independently returned HTTP 200 on 5 October 2026. Its sitemap path could not be verified, so only the homepage is promoted; no unverified council-specific school-holiday routes were added.

The legacy registry entry point now forwards to the explicit-export importer as well; no retained registry command implicitly reads private sibling projects.

Visual artifact check: the generated Burnley share card was inspected and its title, branding and source line are legible. This does not substitute for pending webpage visual QA.

## Hosting release

Private source repository: https://github.com/tompickup23/ukcounciltax. Initial code commit: ce8d72e. Cloudflare Pages project: ukcounciltax. The fully verified build was published to production at deployment de3791fa-0e77-46d4-8be7-4276b2b9a396; https://ukcounciltax.pages.dev is working. The GitHub release workflow is configured with deployment secrets and was queued at the latest check; its cloud execution is not yet claimed as successful. Manual publication used the same committed, verified source and built tree.

Both apex and www have Pages custom-domain attachments and prepared Cloudflare CNAMEs. Null MX was preserved. The parent DS lookup returned no record before delegation. one.com completed the change to lennox.ns.cloudflare.com and sreeni.ns.cloudflare.com. The UK registry and Cloudflare resolver show the new delegation, and the Cloudflare zone is active. Both custom domains have verified ownership. At the initial release check, www certificate validation was active and apex validation was pending; the national-release follow-up below records completion. Some resolver/browser caches still return the old one.com parking address. Normal HTTPS verification reported a certificate name mismatch; no certificate bypass was attempted. The later successful normal-browser HTTPS check below supersedes that initial launch gate.

See DEPLOYMENT.md for operation, token-scope limitations, dependency assessment and rollback. Local evidence and screenshots are in gitignored .ops/; no credentials are committed. UK Councils and the other ecosystem projects were not edited or deployed by this release.

Production follow-up: all three specialist production-CSP smoke tests passed on ukcounciltax.pages.dev. A real public example postcode lookup through the deployed UI resolved to Burnley/Padiham and required locality confirmation, with no postcode placed in the site URL.

## National data expansion, 5 October 2026

Added a standalone national importer informed by existing AI DOGE collectors and using UK Councils' displayed-cell ODS reader. Three pinned MHCLG workbooks now supply 296 English Band D component breakdowns, 10,245 parish/local-body records (including four ceased entries), and 27,751 available observations across the area and two own-share historical series. Parish rows cover 214 billing authorities. Historical coverage varies; the earliest area year is 1993/94.

All English council pages show named county/GLA, police, fire and combined-authority components, a filterable parish table with source-supplied two-year comparisons, and expandable long-term history. The precepts hub has council search, and postcode fallback links now lead to national components. Downloads include component, parish and history CSVs and a complete source-bearing JSON dataset. No new exact all-band schedules are claimed; complete Burnley locality modelling remains a separate layer.

Source safeguards preserve ceased and negative parish entries, groups and charter-trustee overlaps, source notes, missing history and displayed precision. All 296 new area totals match the existing annual-band import exactly. Burnley's imported national Band D components and eight parish figures match its separately imported adopted local schedule. Source projects were not edited. See NATIONAL-DATA-REUSE.md for the scalable geography approach and remaining layers.

Validation: 92 unit tests passed and Astro check reported 105 files with no diagnostics. The final BUILD_OG=1 build passed all 389 page/share-card checks, 388 sitemap destinations and 26,310 internal links. The national import reproduced byte for byte from the pinned originals.

Preview verification: deployment https://0f7837aa.ukcounciltax.pages.dev passed all 160 desktop/mobile browser checks and 57 actual-production-CSP checks. Manual visual review confirmed the component table and a filtered parish comparison at 375px. The postcode fallback message was subsequently tightened so Scottish and other non-English results do not imply coverage by the England national precept dataset; the final rebuilt deployment receives the relevant browser/CSP checks before publication.

Final candidate https://33176228.ukcounciltax.pages.dev passed all 36 relevant desktop/mobile browser checks and all 10 relevant actual-CSP checks after the postcode fallback correction, including the new Scottish-postcode case. The preceding full suites passed 160 and 57 checks respectively. At the final candidate check, main-domain ownership was verified and apex certificate validation was still pending after a retry; it subsequently completed, as recorded below. HTTPS to www succeeds when resolved through the published Cloudflare address; the local default resolver still returns the old parking address. No TLS verification was bypassed.


## Completed national release and custom domain

The verified national build was first published manually at https://5b130dcd.ukcounciltax.pages.dev, with all ten production smoke checks passing. GitHub Actions run 37375394783 then completed successfully on Ubuntu 24.04: 92 unit tests, the type/build/distribution/link gates, all 162 desktop/mobile browser tests and all 58 actual-CSP tests passed. It automatically published https://7494cbda.ukcounciltax.pages.dev from source commit 0c30dee.

Both ukcounciltax.co.uk and www.ukcounciltax.co.uk now report active ownership/certificate validation. The apex homepage and its Burnley national-precept section loaded normally over HTTPS in the in-app browser, without a certificate exception. The canonical page was left open for Tom. The shell's default DNS resolver still returned the former one.com address at the last diagnostic; a TLS-verified request using the published Cloudflare address returned HTTP 200. This is residual resolver caching, not a pending certificate. No system DNS or TLS settings were weakened.

Desktop production and 375px parish-filter screenshots are stored in gitignored .ops/. Exact all-band postcode coverage and the public contact mailbox remain separate outstanding items; this release does not imply those are complete.

## Sources instead of downloads, 6 October 2026

Item 1a removes the six generated download routes and all table, comparison, council and scenario CSV controls. The /data/ route is now a Sources catalogue with one row per retained official publication, publisher links, edition, table, retrieval information and licence. Missing licence or separate retrieval metadata is stated explicitly. Source manifests and normalised datasets remain in the repository. Sharing, printing and on-page figures remain available. Help, privacy and methodology text reflect this change.

The distribution gate rejects CSV or JSON files beneath dist/downloads and download controls or links in built HTML. Browser coverage checks the Sources catalogue, accessibility, mobile overflow, filtered figures and comparison state. Local validation passed: 92 unit tests; Astro check with no diagnostics; BUILD_OG=1 build; 389 pages and 388 sitemap routes; 25,714 internal links; 160 browser tests and 57 production-CSP tests. A supplementary sweep of all 390 built HTML/JSON files found no literal, entity or pseudo-dash violations outside verbatim body names. No new charges or locality coverage are added. Hosted gate passed (run 37391857133); deployed from main merge f5ecdd6 (run 37392313093).

The first browser attempt reused an unrelated preview on port 4321. Both Playwright configurations now use dedicated ports (44321 and 48788) and refuse existing servers, preventing that false target. The successful rerun used the same completed site build with external target overrides cleared.

## Unknown-route checks, 6 October 2026

Fresh HTTPS requests to the production site returned 404 for /council-tax/burnley/ and /this-page-does-not-exist/, with the site's not-found page. /councils/burnley/ returned 200. The earlier HTTP-200 assessment could not be reproduced. The repository history generates band and region pages beneath /council-tax/, never individual council pages; no legacy council redirect map is warranted.

The distribution gate now requires the top-level noindex 404.html, rejects a directory-form 404 and wildcard 200 rewrites, and checks that known invalid routes are not generated. Additional actual-Pages routing tests cover unknown council paths, removed downloads and valid council/band/region routes. These safeguards follow https://developers.cloudflare.com/pages/configuration/serving-pages/. Hosted gate passed (run 37392082871); deployed from main merge 5369440 (run 37392835586).

## Council search metadata, 6 October 2026

All English, Scottish and Welsh council titles now include the council name, 2026/27 and the task, council tax bands and charges. The full name, task, year and required publisher suffix take priority where they exceed the 60-character target. Descriptions state the published Band D amount, the charge basis and the same-basis change where both editions exist. Wales explicitly states that its prior-year comparison is unavailable. The date describes a check of the pinned source extract, not a new upstream retrieval.

Every council page carries a 2027/28 status stating that the next edition is not yet published in the sources held here. No usual publication month is claimed because two council-specific editions' publication dates have not been established; national MHCLG release dates are not council budget meeting dates. No projected charge is generated. Hosted gate passed (run 37392488000); deployed from main merge 64c9853 on 7 October 2026 (run 37644933456).

## Structured data, 6 October 2026

BaseLayout now emits exactly one BreadcrumbList on every HTML page, including the homepage and noindex 404 page. Visible breadcrumb navigation remains in its component without emitting a second schema block. The 296 English council FAQPage blocks and the England hub's Dataset block are removed. No GovernmentService is emitted.

| Routes | Top-level JSON-LD types |
| --- | --- |
| / | WebPage, WebSite, Organization, BreadcrumbList |
| All other HTML routes, including /data/, council pages, nation pages and 404.html | WebPage, Organization, BreadcrumbList |

English council WebPage nodes retain the nested GovernmentOrganization about-record with the council's official name and GSS identifier; the publisher remains UK Council Tax. The distribution gate parses every JSON-LD block, checks required type cardinality and breadcrumb positions/URLs, and rejects FAQPage, Dataset and GovernmentService anywhere in the graph. Hosted gate passed (run 37392691089); deployed from main merge e95087d on 7 October 2026 (run 37645695096).

## Production checks and the text sweep in the gate, 7 October 2026

Production checks after the PR 3 and PR 4 deployments, by HTTPS request: /, /data/ and /councils/burnley/ return 200; /council-tax/burnley/ returns 404. All six removed download routes under /downloads/ (england.csv, components.csv, parishes.csv, history.csv, national.json, sources.json) return 404, which closes the check left outstanding on 6 October. The Burnley page carries the new title, description and 2027/28 status line. Parsed JSON-LD on /, /councils/burnley/, /data/ and /england/ matches the type table above: WebSite on the homepage only, and no FAQPage or Dataset.

The supplementary text sweep moves from the untracked operations folder to scripts/check-text.mjs and runs in the release workflow as npm run test:text, after test:dist. Beyond check-dist's literal and named-entity dash check, it rejects numeric dash entities, JSON dash escapes and spaced hyphens used as dashes in built HTML, JSON, XML and text files. Verbatim body names from the national table and every adopted local schedule are exempt. Local run on the BUILD_OG=1 build: 393 files pass; planted numeric-entity, spaced-hyphen and JSON-escape probes each fail.
