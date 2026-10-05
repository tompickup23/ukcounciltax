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

86 unit tests passed across ten files. Astro check passed across 94 files with zero errors, warnings or hints. The initial production build passed the distribution check: 389 HTML pages, 388 indexed routes and 389 valid share-card references. Final build result is recorded below when complete.

Browser verification is pending: the CUA browser URL policy rejected the localhost preview action. No alternate browser route was used to bypass that block. New browser regressions are written for postcode confirmation, missing schedule handling, scenario validation, accessibility/mobile overflow and production CSP; they have not been claimed as passing.

No new production deployment, GitHub push or DNS change has been made in this improvement pass. one.com account/domain access remains for Tom to resolve. Do not treat the local preview as a launched custom domain.

## Remaining coverage and launch gates

- Run the browser and actual-CSP suites after the browser access block is resolved, plus visual light/dark/mobile QA. Fix before deployment.
- Expand adopted local schedules and date-specific postcode/parish/precept geography joins. Nationwide parish, police, fire and mayoral breakdowns are not complete. Never replace unknown with zero or sum a bundled component twice.
- Add Welsh A to I only from an appropriate published table; Northern Ireland needs its own domestic-rate model.
- Establish source refresh CI and a reviewed shared-registry export. `data:registry` accepts an explicit source file; it does not open sibling repos implicitly.
- Create the authorised GitHub/Cloudflare targets after release gates, then attach the custom domain once one.com DNS is accessible. Preserve existing DNS/mail and check DNSSEC before changing nameservers.
- UK Councils migration/cross-site edits require their own scoped change; none is made by this release.

Public school-holiday homepage independently returned HTTP 200 on 5 October 2026. Its sitemap path could not be verified, so only the homepage is promoted; no unverified council-specific school-holiday routes were added.

The legacy registry entry point now forwards to the explicit-export importer as well; no retained registry command implicitly reads private sibling projects.

Visual artifact check: the generated Burnley share card was inspected and its title, branding and source line are legible. This does not substitute for pending webpage visual QA.

## Final generated-site result

Final BUILD_OG=1 production build completed successfully. Distribution checks passed for 389 HTML pages, 388 sitemap/search routes and 389 share-card references. Internal link audit checked 25,119 local destinations with no missing files. The final unit suite passed 86 tests across ten files. Browser/mobile/actual-CSP verification remains pending for the policy reason above; these static checks do not replace it.

## Authorised hosting setup, 5 October 2026

Tom explicitly authorised GitHub, Cloudflare and one.com setup. The private GitHub repository and Cloudflare Pages project now exist. An immutable review build was published at https://75bc9f57.ukcounciltax.pages.dev. Testing that independent deployed target is now possible; the earlier local browser block was not bypassed. Initial deployed tests found a scenario heading-level issue and an overlong band-selector label; both were corrected. Test output directories are separate to avoid parallel-suite artifact collisions. A new final build and verification are in progress. Custom-domain records are prepared but registrar delegation is not yet changed.
