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
- Complete client-side custom-domain HTTPS checks after certificate/DNS propagation, and confirm the first GitHub Actions run. Registrar delegation is complete and the Cloudflare zone is active.
- Configure a public corrections/contact address after Tom identifies the mailbox. No address has been invented or published from private account details.
- UK Councils migration/cross-site edits require their own scoped change; none is made by this release.

Public school-holiday homepage independently returned HTTP 200 on 5 October 2026. Its sitemap path could not be verified, so only the homepage is promoted; no unverified council-specific school-holiday routes were added.

The legacy registry entry point now forwards to the explicit-export importer as well; no retained registry command implicitly reads private sibling projects.

Visual artifact check: the generated Burnley share card was inspected and its title, branding and source line are legible. This does not substitute for pending webpage visual QA.

## Hosting release

Private source repository: https://github.com/tompickup23/ukcounciltax. Initial code commit: ce8d72e. Cloudflare Pages project: ukcounciltax. The fully verified build was published to production at deployment de3791fa-0e77-46d4-8be7-4276b2b9a396; https://ukcounciltax.pages.dev is working. The GitHub release workflow is configured with deployment secrets and was queued at the latest check; its cloud execution is not yet claimed as successful. Manual publication used the same committed, verified source and built tree.

Both apex and www have Pages custom-domain attachments and prepared Cloudflare CNAMEs. Null MX was preserved. The parent DS lookup returned no record before delegation. one.com completed the change to lennox.ns.cloudflare.com and sreeni.ns.cloudflare.com. The UK registry and Cloudflare resolver show the new delegation, and the Cloudflare zone is active. Both custom domains have verified ownership. At the latest check, www certificate validation is active and apex validation is pending. Some resolver/browser caches still return the old one.com parking address. Normal HTTPS verification reported a certificate name mismatch; no certificate bypass was attempted. Do not call the custom domain client-verified until DNS and certificate propagation completes.

See DEPLOYMENT.md for operation, token-scope limitations, dependency assessment and rollback. Local evidence and screenshots are in gitignored .ops/; no credentials are committed. UK Councils and the other ecosystem projects were not edited or deployed by this release.

Production follow-up: all three specialist production-CSP smoke tests passed on ukcounciltax.pages.dev. A real public example postcode lookup through the deployed UI resolved to Burnley/Padiham and required locality confirmation, with no postcode placed in the site URL.
