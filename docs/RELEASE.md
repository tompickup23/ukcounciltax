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

## Band mix per council, 3 November 2026

Roadmap R509, the first of R351's national layers. Source: HM Revenue & Customs, Council Tax: stock of properties, 2026, table CTSOP1.1, published 24 September 2026, counts at 31 March 2026. File `CTSOP_1_1.zip` from https://assets.publishing.service.gov.uk/media/6ab25147a9c3d267bcccecc1/CTSOP_1_1.zip, retrieved 3 November 2026, sha256 `a59b842ae151513aef295b5f9bfe61f99dbfe4fd1e3054010a2c6fb14c6628ae`, pinned in `data/national/sources.json` as `bandStock`. Asserted against the file: England 25,936,540 properties (A 6,121,370; B 5,052,560; C 5,705,800; D 4,074,300; E 2,555,840; F 1,355,350; G 916,160; H 155,180), Burnley 43,290, Birmingham 469,240 and Westminster 131,940. 296 of 296 English billing authorities joined by GSS. Limitations: counts are rounded to 10, so bands may not add to the total; one suppressed cell (City of London Band A); stock is not the tax base. Not deployed.

## Verify run of 2 November 2026 and PR 6

Recorded from the repository's pull request and Actions history only. PR 6 (SEO: own IndexNow key, deployed key file and post-deploy IndexNow step; head 9919f86) was opened on 2 November 2026. Its Verify and publish run 41520741773 on that head ran from 20:36 to 20:41 UTC on 2 November 2026 and concluded success. The PR body records local results on that branch: 94 of 94 unit tests (one cold first run failure did not recur), Astro check with no diagnostics, a build without BUILD_OG, 389 pages and 388 sitemap URLs in the distribution check, 394 files in the text sweep and 25,714 link destinations; browser and CSP suites were left to CI. The owner merged PR 6 on 3 November 2026 at 23:31 UTC (merge 3ed167d). The push run for that merge (41739849895) and the next one (41739898752) were cancelled; the push run for the PR 7 merge f9af3d9 (41740299571), whose tree includes PR 6, concluded success. Not done: whether the Notify IndexNow step submitted successfully in that run, and the www to apex redirect rule the PR body asks for in the Cloudflare dashboard, are not recorded in the repository and are not claimed here.

## Findings, feed and what changed, 5 November 2026

Register row R346. New /findings/ page with two dated data notes, recomputed from data/national/england.json on every build: parish and town Band D precepts for the two years on the same row of MHCLG's local precepting authorities table, and the whole area Band D (Area_CT) series since 1993/94. Notes override arithmetic: rows are set aside by the text of the notes attached to them (formation, removal or split; negative precept), and history year pairs a note calls not directly comparable leave the comparison. No row or council is found by a typed name. The Area_CT basis (includes average parish precepts) is stated only because its latest figures match the levels release band table for every council; the England row of the history table is not held, so no England figure is given.

The feed now carries one item per data update, dated by the dataset's own edition date as held in the repository: MHCLG levels publication dates, the HMRC CTSOP1.1 publication date, the registry generation date, and access dates where the source manifest records no publication date (Table 10, the parish table, the history table and the Scottish and Welsh editions), plus one item per findings note. /changes/ lists the same items. The sister site design in UK Councils PR 22 could not be read from this session; the work follows the written brief. Not deployed.

## Interim cross-domain canonicals, 4 November 2026

Prepared from origin/main 0c74bfb for Tom's Sunday sheet decision 4. Both live sitemaps were fetched over HTTPS on 4 November 2026. The raw snapshots are retained in data/canonical-sitemaps/; data/canonical-map.json records their source URLs, SHA256 hashes, fetch date, 325 exact same-path pairs and 63 unique URLs. Tom confirmed that the scope includes all 325 shared URLs, comprising 296 council profiles and 29 other routes including the homepage, band pages and regional hubs.

Only the canonical link changes on mapped pages, pointing to the exact UK Councils URL present in its fetched sitemap. Every other route stays self canonical, including the 63 specialist pages and the noindex 404. All English council profiles have a counterpart. The 32 Scottish and 22 Welsh council profiles have none and remain self canonical; the complete unmatched list is recorded in the map and PR body. No charge, page text, title, description, Open Graph URL, structured data URL, sitemap route, redirect or interaction is changed.

Both sites are retained. The split by intent is deferred until after the 2027/28 bill season. This snapshot is committed evidence, not a claim that destinations are monitored continuously. Later mapping changes require fresh sitemap evidence and review. Reverting this change restores self canonicals.

Not merged or deployed. release.yml publishes on push to main, so Tom owns the merge. No UK Councils repository changes, indexing submissions, analytics work or dependency upgrades are included because this change is limited to the interim canonical decision.

Local validation: 103 unit tests across 14 files; Astro check across 108 files with no diagnostics; completed BUILD_OG=1 build on Node 22.23.4; distribution checks for 389 pages, 388 sitemap routes, 325 mapped canonicals and 63 unique self canonicals; text checks across 394 files; 26,012 internal link destinations without missing files. All 389 HTML pages match a fresh origin/main build byte for byte after removing only canonical tags. The five sampled tags are in the PR body. Negative probes for a duplicate canonical, wrong mapped pair and changed unique canonical were rejected, then restored output passed again. The targeted comparison browser test passed on desktop and mobile. The full browser and actual-CSP suites are left to the PR workflow because there is no interactive or client script change.

The initial local build was stopped during slow share-card rendering under memory pressure. The completed build used Node 22, a 768 MiB JavaScript heap limit and one Rayon thread. This is local build configuration only; the workflow and package dependencies are unchanged.

## Canonical rebase on current main, 8 November 2026

Rebased the single PR 15 commit onto origin/main 9a73fa7. The only textual conflict was this release record: retained main's PR 6 and findings records and appended the original canonical record. The automatic merges in scripts/check-dist.mjs and src/lib/site.ts retain all main checks, current routes, contact details and navigation.

The original map and both sitemap snapshots are unchanged dated evidence of 325 reviewed pairs. Main removed /council-tax/rises-2026-27/ and redirects it to /increases/#2026-27 with status 301. Preserve that redirect and do not revive the page or transfer its canonical to /increases/. Consequently 324 current HTML pages carry a cross domain canonical: 296 council profiles and 28 other routes. The 63 original specialist pages remain self canonical, as do main's three new routes /council-tax-2027-28/, /findings/ and /changes/. The noindex 404 also stays self canonical. Tests explicitly account for that single removal and those three additions; any further unexpected removal still fails.

Main also changed mapped page sources for /, /about/, /contact/, /corrections/, /sources/, /council-tax/, all eight /council-tax/band-{a,b,c,d,e,f,g,h}/ pages, all nine regional pages generated by src/pages/council-tax/[slug].astro, and all 296 /councils/{slug}/ profiles. The regional paths are /council-tax/east-midlands/, /council-tax/east-of-england/, /council-tax/london/, /council-tax/north-east/, /council-tax/north-west/, /council-tax/south-east/, /council-tax/south-west/, /council-tax/west-midlands/ and /council-tax/yorkshire-and-the-humber/. Shared footer and navigation changes also affect surviving pages. All main content is preserved; retained routes use only their original exact reviewed pair. No new equivalence or destination claim is made for changed content.

Validation after the rebase: npm test passed all 194 tests across 24 files after the build, with no skipped tests. npm run check covered 132 files with no errors, warnings or hints. BUILD_OG=1 npm run build completed on Node 22.23.4 with all 300 share cards, Pagefind and the repository's CSP hash script. npm run test:dist passed 391 HTML pages and 390 sitemap URLs, including exactly 324 mapped canonicals and all 63 original specialist self canonicals. npm run test:text passed 398 files. The link audit checked 30,525 destinations without a missing local file. All 391 HTML files match a separate build of main 9a73fa7 byte for byte after removing only canonical tags; the sitemap, redirects and CSP headers also match byte for byte. The reviewed map and XML snapshots remain byte for byte unchanged from the original PR. Generated output was produced only by the repository's build scripts.

The targeted comparison test passed on both mobile and desktop. Initial preview startup attempts ended before tests because the installed Astro version backgrounds preview in agent sessions; the successful run used E2E_BASE_URL pointing to a separately started preview whose worktree and mapped canonical were verified. No test configuration or dependency was changed for that local workaround.

All four targeted production header checks in e2e-csp/redirects.spec.ts passed through Wrangler: both forms of the retired rises URL return 301, the destination contains its year section, and the next year page contains no pound sign. The full browser and CSP suites were not rerun locally; the PR workflow remains responsible for those broader gates. No merge or deployment was performed.


## Budget game static pages, 8 November 2026

Phase 2 only, prepared locally for review. Tom requested a stop after this phase because phase 3 asks for band-specific component guesses while the national Table 10 source holds Band D components only. No game, scenario, push, PR, merge or deployment is included. The existing whole-bill band selector remains available with previous-year comparisons suppressed on these pages. See `BUDGET-GAME-PHASE-2-REVIEW.md` for the review question and resumption boundary.

The budget index and 296 self canonical billing-authority pages use the same council list as the council profiles. There are 287 billing authorities with RA data and nine notices without budget tables: Castle Point, Coventry, Cumberland, Dudley, Epping Forest, Greenwich, Guildford, South Gloucestershire and Warwick. Counts and identities are checked against the pinned MHCLG return and existing council list. District pages with data also show their county's tables. No county-only route is created and no earlier-year budget fills a gap.

Source: MHCLG, Local authority revenue expenditure and financing England: 2026 to 2027 budget individual local authority data, published 11 June 2026, retrieved 8 November 2026. The phase 1 edition and hashes are unchanged: RA Part 1 `3ea4d4c2218bc9f49bbf59a6fc82481acb6a3494d5b0f4e114cdb945730653db`; RA Part 2 `55c34505c69513fcba446f3484061d2bd115c4ce06bb5bafba7b36e330be4d65`; SG `6150792dcea97ca58b912a5fbf9fdc99562ba782fb7d6f5c8885e6ca1a17e3b5`. The source manifest holds the original file URLs. RA uses `RA_LA_Data_2026-27`; DSG uses `SG_LA_Data_2026-27`.

Service figures are observed net current expenditure, converted from printed whole thousands of pounds, with negative service totals labelled net income. Financing groups and the non-ringfenced reserve total are calculations with their inputs explained. Funding uses add/deduct labels and retains the original signed financing lines. DSG is shown alongside education without subtraction; special schools and alternative provision is not described as total SEND spending. Reserves use only other earmarked and unallocated balances and quote MHCLG's caveat: “It is not possible to identify usable revenue reserves in the current release.” No reserve ratio or judgement is supplied.

The seven MHCLG note 4 authorities retain the quoted discrepancy warning beside council tax requirement: King's Lynn & West Norfolk, Harborough, Rugby, Colchester, Reigate & Banstead, Enfield and Barnet. Note 8 remains visible for Runnymede and Windsor & Maidenhead. Neither RA nor Table 10 is adjusted. The RA service and financing identities continue to reconcile; the existing reviewed Table 10 fixture remains unchanged. The receipt splitting a resident's bill by service stays outside this build under I006.


Phase 2 validation: 207 unit tests passed across 26 files with no skips, using one worker after the build; Astro check covered 141 files without diagnostics. The final `BUILD_OG=1` build completed. Distribution checks passed 688 HTML pages and 687 sitemap URLs; the text sweep passed 695 files, and 48,236 internal link destinations had no missing file. All 20 targeted static-budget browser tests and all three actual-header budget-route checks passed. The final HTML, headers and sitemap match the browser-tested build byte for byte. Output counts confirm 296 council budget pages, comprising 287 with tables and nine no-return pages, plus the index; the sitemap adds 297 budget routes. Screenshots and logs remain local in `.ops/`. The full game and phase 5 checks remain outstanding because Tom requested the stop after phase 2.

## Budget game rounds and review candidate, 9 November 2026

Tom reviewed phase 2 and authorised phases 3 and 5 on `feat/budget-game-i001`, starting at `915fbd9`. This entry supersedes the static-page entry's stop boundary. Prepared for an unmerged PR; no publication or deployment is authorised by this record. Phase 4 is deferred to C1b.

The budget index and all 296 billing-authority pages remain self canonical. The pinned MHCLG return supplies games on 287 pages. The nine pages without a return remain bill-only: Castle Point, Coventry, Cumberland, Dudley, Epping Forest, Greenwich, Guildford, South Gloucestershire and Warwick. The game adds a county spending round on the 160 district pages with returns. Counts are checked against the committed RA dataset and Table 10 joins by the unit tests and built-output audit.

The edition remains MHCLG's Local authority revenue expenditure and financing England: 2026 to 2027 budget individual local authority data, published 11 June 2026, retrieved 8 November 2026. RA Part 1 SHA-256: `3ea4d4c2218bc9f49bbf59a6fc82481acb6a3494d5b0f4e114cdb945730653db`; RA Part 2: `55c34505c69513fcba446f3484061d2bd115c4ce06bb5bafba7b36e330be4d65`; SG: `6150792dcea97ca58b912a5fbf9fdc99562ba782fb7d6f5c8885e6ca1a17e3b5`. Original URLs and sheet names remain in the source manifest. No source data was changed in phases 3 and 5.

Services are observed net current expenditure, not outturn, and printed whole thousands of pounds are converted to pounds. Positive-service shares, funding groups, reserve totals and reserve changes are labelled calculations with their inputs. Guesses and scores are game state, never observations. Net income remains outside the guessing inputs. Education retains its DSG amount without subtraction; special schools and alternative provision is not presented as total SEND spending. The bill round uses Band D only, preserves printed component rounding, and never infers other bands' component amounts.

Every affected static table and funding reveal retains MHCLG note 4 beside council tax requirement: King's Lynn & West Norfolk, Harborough, Rugby, Colchester, Reigate & Banstead, Enfield and Barnet. Runnymede and Windsor & Maidenhead retain note 8. The non-ringfenced reserves round uses other earmarked and unallocated balances only, with the quoted release caveat: “It is not possible to identify usable revenue reserves in the current release.” No reserve ratio or judgement is made. The service receipt remains with I006.

The game uses a single Astro client bundle, safe JSON data and DOM text nodes. There is no new dependency, inline script permission, fetch, analytics, social network script or storage. Share links use the council slug and score fragment only. Shared results are explicitly unverified and cannot reconstruct the player's answers. Static tables, sources and whole-bill band charges remain readable without JavaScript.

Implementation choices and self-review evidence are recorded in `BUDGET-GAME-REVIEW.md`. Selected browser screenshots are committed under `budget-game-review/`; local logs and intermediate evidence remain ignored in `.ops/`.

Validation on 9 November 2026: 214 unit tests passed across 27 files with no skips; Astro check covered 148 files without diagnostics. The full browser suite passed 202 checks and the actual-header suite passed 74 checks. The final `BUILD_OG=1` build completed with 300 share cards, Pagefind and CSP hashes. Final distribution checks passed 688 HTML pages and 687 sitemap URLs; the text sweep passed 695 files and the link audit checked 48,236 destinations with none missing. All 715 compared HTML, JavaScript, CSS, XML, header and redirect files match the browser-tested build byte for byte. The output audit confirms 296 council budget pages, 287 games, nine no-return notices, 160 county sections, seven note 4 pages and 297 budget sitemap entries. No merge or deployment was performed.


Hosted clean-checkout validation: the first PR run failed before the build because `data/raw/` is gitignored and the RA tests require the three pinned originals. The workflow now runs the existing RA importer before the tests, verifying all source hashes and reconciliations, then requires `git diff --exit-code -- data/national/budget.json`. This is source preparation, not a new edition or a skipped check. A clean archive with no raw files fetched the original workbooks successfully and reproduced the committed budget snapshot byte for byte. The unit suite then passed with only the existing distribution-dependent pre-build skips. The local final-build results above remain valid because this correction changes only CI preparation.

## Budget game review fixes, 10 November 2026

Claude Code's review of the open PR (verdict: merge after small fixes) found three presentation faults, fixed on `feat/budget-game-i001` before Tom's merge. No source value, calculation, score or test tolerance changed.

- **Titles and descriptions.** Every budget page carried the title "[Council] budget game" and one identical description. Pages with a game are now titled "[Council] budget game 2026/27"; the nine pages without a return are titled "[Council] budget 2026/27: no return received". Descriptions name the council and the year and stay under 160 characters.
- **Dedicated Schools Grant sentence.** The sentence "Most schools spending is paid for by the Dedicated Schools Grant" rendered whenever the education total was non zero. The Isles of Scilly prints education £756,000 and DSG £0 in the return, the only such case among 287 available returns, so the sentence was false there. It now renders only when the printed grant is above zero; otherwise the page states the printed grant figure without the claim. The companion sentence for a zero education total now distinguishes a zero grant from a printed grant.
- **Display names.** Round titles, table captions, region labels and the bill round's council line used the RA return's own council name, which differs from the site's display name for 22 of 296 billing authorities (for example "Dorset UA", "Medway Towns" and 19 ampersand forms). They now use the display name the H1 uses, and each budget section states the name printed in the RA return where it differs.

Validation on 10 November 2026 after the fixes: Astro check 148 files with no diagnostics; build with Pagefind and CSP hashes; 214 unit tests across 27 files with no skips; distribution and text checks passed. The hosted run on the pushed head is the record for the browser and actual header suites.

## Social care spend per resident by age, 9 November 2026

I124, prepared locally on `feat/per-resident-i124`, stacked onto the budget branch at `915fbd9`. Not pushed, merged or deployed. The four phases cover the pinned population import, same-code calculations, static presentation and verification. Final check summaries and screenshots are recorded in `docs/PER-RESIDENT-REPORT.md` after phase 4.

Source: Office for National Statistics, Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2025, release MYE25UK, sheet MYE2 Persons, published 1 October 2026 and retrieved 8 November 2026. The source manifest retains the original workbook URL and sheet name. The workbook has 1,026,940 bytes and SHA256 `8ae244e3341257ecccaee55f4973fe12f46afe6656ead6c1a9ed3f4f8585e40f`. The importer verifies this pinned hash before parsing, uses `read-excel-file` as a new development dependency and reproduces 333 English rows. It checks the three disjoint age bands against all ages, and the adult band against its two constituent bands. The source notes' population and ratio anchors are unchanged.

The numerator source is MHCLG's 2026/27 RA budget, Part 1, sheet RA_LA_Data_2026-27, published 11 June 2026. Adult social care uses line 360 divided by residents aged 18 and over. Working-age support uses lines 332, 334, 336, 340 and 344 divided by residents aged 18 to 64. Older people's support uses lines 333, 335, 337, 341 and 345 divided by residents aged 65 and over. Children's social care uses line 330 divided by residents under 18. Each printed numerator in thousands of pounds is multiplied by 1,000. Values retain full precision in the calculation records and display to the nearest pound. Line 360 less the ten age lines is shown as an amount and share, with no per resident ratio; the share displays to one decimal place. Every ratio carries both editions and the sentence: "The population estimate is for mid-2025; the budget is for 2026/27."

The source notes specify 153 social care authorities by classes SC, UA, MD and LB. Five have no return: Coventry, Cumberland, Dudley, Greenwich and South Gloucestershire. Barnsley and Sheffield have different boundary codes in the two editions and are not joined. This leaves 146 councils with ratios. Districts receive no ratio of their own, regardless of printed social care values; their pages show their county under a county heading using the county population. The City of London and the Isles of Scilly retain the required small population note. No England ratio, ranking, average, estimate, earlier-year substitution or claim about need, efficiency or value is introduced. The component adds no client script, and C1's route changes only by an import and one component include.

Final I124 validation after rebasing onto main `c3fc9d8`, 9 November 2026: 225 unit tests across 29 files passed with no skips; Astro checked 152 files with no diagnostics. The full browser suite passed 210 tests, and the actual production header suite passed 75 tests. The final `BUILD_OG=1` build generated all 300 share cards, Pagefind and CSP hashes. Its 688 HTML pages, sitemap and CSP headers match the browser tested output byte for byte, with 690 files checked and no differences. Distribution checks passed 688 pages and 687 sitemap URLs, with every page pointing at a built share card. The text sweep passed 695 files, and 48,532 internal link destinations had no missing file. All source hashes and anchors passed. The six requested screenshots were refreshed, visually inspected and included for the PR. This follow-up is authorised for push and PR creation only. No merge or deployment was made.

## Brand pages self canonical, 9 November 2026

The homepage, About, Contact, Corrections, Privacy and Methodology are this brand's own pages, not duplicates. They are now self canonical; the budget game launches under this homepage. The reviewed map moves from 325 mappings and 63 self canonical URLs to 319 and 69. The retired rises route remains absent, giving 318 built mapped canonicals. All other reviewed mappings and both fetched sitemap snapshots are preserved.

## Sitemap edition dates, 9 November 2026

Every one of the 687 indexed routes now has a lastmod date. English council, band, regional and increase pages use the current England edition's publication date, falling back to its generated date only if needed. Budget pages use the RA retrieval date; precepts use the component retrieval date; the publications catalogue uses the latest held national retrieval date. Scottish and Welsh pages use the retrieval date recorded in the joined devolved extract: the accompanying source manifest identifies the files and hashes but holds no date. Static pages use explicit original release dates in `STATIC_PAGE_DATES`, with the findings and updates pages using their recorded written date. No build timestamp is used and no new retrieval or recent page change is claimed. The gate requires a valid date no later than the day of validation for every URL.

## Quick wins final validation, 9 November 2026

The ten A2 items are complete in the brief's order on `feat/brand-canonicals-nav`, rebased onto main `b202b0d` after the per resident change was merged externally. The source datasets and both fetched canonical sitemap snapshots are unchanged. The six brand pages are self canonical; navigation and body links expose existing routes; presentation formats and source labels are consistent; all Scottish and Welsh profiles have sourced share cards; the 404 offers council lookup; all English profiles link their budget page; sitemap dates use held editions or recorded releases; unused export helpers are removed. The card canvas includes its padding within its dimensions so the source footer remains visible.

Final validation: Astro checked 152 files without diagnostics; 225 unit tests across 30 files passed with no skips; all source hashes, anchors and reconciliations passed. The browser suite passed 210 tests and the actual production header suite passed 75 tests. The final `BUILD_OG=1` build generated 354 share cards, including 32 Scottish and 22 Welsh cards, Pagefind and CSP hashes. Distribution checks passed 688 HTML pages and 687 sitemap URLs, with 318 mapped canonicals and 69 listed self canonicals. The text sweep passed 695 files and the internal link audit checked 55,231 destinations with none missing. All 715 compared HTML, JavaScript, CSS, XML, header and redirect files match the browser tested build byte for byte. The 16 requested screenshots were captured and visually inspected. Per item results, conservative decisions and the screenshots are recorded in `docs/A2-QUICK-WINS-REPORT.md`. This work is authorised for push and PR creation only. No merge or deployment was performed.


## Same class rankings and parish pages, 9 November 2026

A4 adds exactly 221 self canonical routes: a ranking index and five class pages, plus a parish index and 214 billing area pages. The expected distribution grows from 688 to 909 HTML pages and from 687 to 908 sitemap URLs. The 318 mapped canonicals, 69 listed self canonicals and existing A2 profile behaviour are unchanged. Rankings use the current England edition's recorded update date; parish routes use the parish source's recorded retrieval date. No build date is substituted.

Ranking positions are labelled calculations from published Band D figures, lowest first, with standard competition ties and no comparison across council types. All 296 billing authorities must be present and each member of a class must have both area and own figures; county rankings require 21 published own figures. An incomplete class is not ranked. The class counts are 164 shire districts, 63 unitary authorities, 36 metropolitan districts, 33 London authorities and 21 counties. Lewes remains ranked at the highest area Band D in its class, with MHCLG's pending approval note beside its row and in the note list, following decision 5 confirmed on 9 November 2026.

The parish pages preserve all 10,245 source rows, including zero, negative and ceased entries. Changes are labelled calculations on the same source row only. Parish profiles now show the shared range sentence and a link; the filter, full table, source notes and Durham caveat live on the parish pages. The 82 profiles without rows preserve their absence notice. The original source files, hashes and canonical map are unchanged. New pages use the existing default share card, with no additional card renders.

A3 was not merged at the initial rebase onto A2. Profile changes are confined to the existing comparison and parish sections; a rebase onto A3 will be needed. A5's homepage, header, footer and global stylesheet are untouched. Validation and conservative decisions are recorded in the A4 review report. This change is prepared for review only, without merge or deployment.

Final A4 validation on Node 22.23.4: 242 unit tests across 34 files passed with no skips; Astro checked 164 files without diagnostics. The final `BUILD_OG=1` build generated all 354 existing share cards, Pagefind and CSP hashes. Distribution checks passed 909 HTML pages and 908 sitemap URLs; the text sweep passed 916 files and the internal link audit checked 74,261 destinations with none missing. The full browser run passed 220 tests and timed out in four; all four passed serially with the same assertions and time limits. All 78 production header tests passed separately. The 20 requested screenshots and eight supplementary table views were refreshed and visually inspected, and remain local and uncommitted. The review report records the exact output sizes, source anchors, conservative decisions and resumption instructions.

## Budget game scenario mode, 9 November 2026

C1b is stacked on the budget game polish PR. Model `budget-scenario 1.0` uses integer pence and the largest fractional remainders, with source order resolving ties. Its input totals and published references come from the existing game round arrays. The observed scores, score links, published text fixture and the nine no return notices are unchanged. The five implementation commits cover the pure model and adapter, shared stage controls, results and summary, workbook cache, and verification evidence.

The five assumptions remain visible above every screen's controls:

1. This is your allocation, not the council's budget or an exact household bill.
2. Services use only the positive service totals; net income headings stay outside the exercise.
3. The service total is fixed. Moving shares does not model costs, outcomes, ring fenced grants or legal limits.
4. The Band D area average is fixed and includes average parish precepts; only its division between the listed bodies changes.
5. Service and Band D allocations are independent; no change in money raised is calculated.

All 287 games have one hidden scenario entry in static HTML. There are 160 independent whole county screens covering 21 counties and 127 games with two scenario screens. The nine absent returns stay absent. The build retains 296 council budget routes and 297 budget sitemap entries including the index. Scenario state stays in memory only. It adds no request, storage, cookie, share payload or script permission. Observed and scenario amounts have separate labels and record types.

The dry run matches every value in `C1B-DATA-DRY-RUN.json`. Positive service bases in GBP thousands are Burnley 18,015, Birmingham 2,703,694, Lancashire 2,759,432 and Westminster 618,398, with 5, 9, 9 and 9 positive headings. Burnley's observed net income headings remain minus 343 and minus 426; Birmingham's remains minus 3,212. Burnley's Table 10 base stays 254,942 pence, with positive components 36,054, 180,175, 29,240 and 9,473. The combined authority's printed zero is not an input. The explicit scenarios reproduce Burnley services at £10,809,000 and £7,206,000, its Band D split at £1,529.65 and £1,019.77, and the whole Lancashire county split at £1,379,716,000 twice. The one penny tie awards the penny to the first source item. Every invalid input and unsafe product is rejected. None of these scenario results is labelled observed.

Source hashes are unchanged:

| File | SHA256 |
|---|---|
| data/national/budget.json | 704c213738abbff846e9210a6fbb9eda058efb3d72beb5467fd7755cfeefdd0a |
| data/national/england.json | 81e6926afd4f4e1c226a1333ee7e5c7be2aa4c2d6f6bbc4c87b52e80ebb36c0f |
| tests/fixtures/budget-ct-reconciliation.json | 730a5ae7066eb22a2509974265779fa1d99ec7f83e5e46a7d07aab03ffac0e90 |
| data/raw/RA_2026-27_data_Part_1.ods | 3ea4d4c2218bc9f49bbf59a6fc82481acb6a3494d5b0f4e114cdb945730653db |
| data/raw/RA_2026-27_data_Part_2.ods | 55c34505c69513fcba446f3484061d2bd115c4ce06bb5bafba7b36e330be4d65 |
| data/raw/SG_2026-27.ods | 6150792dcea97ca58b912a5fbf9fdc99562ba782fb7d6f5c8885e6ca1a17e3b5 |

The workflow caches only the three raw workbooks, keyed by runner OS and all three full hashes in manifest order, with no restore prefix. The importer still rehashes and reconciles on every hit and miss. Local isolated checks passed a cold download, a warm import with network blocked, rejection of a corrupted workbook at the pinned hash, and a restored warm import. The checkout's original workbooks remained untouched; its blocked network importer reproduced budget.json exactly. No production workflow was triggered.

Conservative decisions: the merged A6 controls were extracted into one shared helper, preserving observed input behaviour while rejecting invalid scenario typing without clamping. The scenario rail keeps its visible number in the accessible name. An invalid score fragment is tested on a fresh load, as required by the existing parser. The supplied dry run test's relative imports were repaired so the binding receipt can type check from its documented location; its arithmetic and receipt were not changed. The user authorised the files required by C1b, including the cache workflow and release evidence. No stop condition was encountered.

Final validation on Node 22.23.4: Astro checked 227 files without diagnostics; 273 unit tests across 38 files passed with no skips. The final `BUILD_OG=1` build produced 909 pages, all share cards, Pagefind and CSP hashes. Distribution checks passed 909 HTML pages and 908 sitemap URLs, including 2,618 valid chart PNG links. The original published text fixture and the separate complete static number fixture are identical for Burnley, Birmingham and Coventry. The text sweep passed 916 files and the internal link audit checked 79,492 destinations with none missing. The game bundle is 9,659 gzip bytes against the agreed 14,034 byte ceiling.

The full browser suite passed 244 tests with one worker against the built local preview. The production header suite passed 89 tests with one worker, including both scenario widths and themes. The design check passed every rule for Burnley, Birmingham and Coventry at 390 and 1440 in light and dark, including the touch icon check. Report: `.ops/c1b/design/20261109T165614Z_mddwofox/report.md`. The 44 requested scenario capture states at 375 and 1440, plus full stage captures, remain local in `.ops/c1b/` and were visually inspected. The phone table keeps full amounts readable in separately labelled columns. Captures, logs and reports are not committed. No merge or deployment was performed.

## Navigation, links and the analytics beacon, 10 November 2026

Not merged or deployed at the time of writing; Tom owns the merge.

- Header: three groups and a direct budget game link; header links fall from 30 to 19. Reference and site pages are linked from a footer list on every page. The homepage gains a budget game callout. No route, title or figure changes.
- The Asylum Stats link is removed from council pages (decision N2, 10 November 2026). No built page links that site.
- Cloudflare Web Analytics is enabled with the site's own token (decision 6, 9 November 2026). Every built page carries exactly one beacon; the dist check enforces the token. The privacy page now describes it. This supersedes "Own analytics is disabled" above.
- Local gate: check, `BUILD_OG=1` build, 293 unit tests, dist check (909 pages, 908 sitemap URLs) and text sweep pass. The CSP suite result is in the pull request.


## Council profile overhaul A3, 10 November 2026

Phases 1 through 11 are complete on `feat/profile-home-overhaul`, rebased onto main `1500163`. Profiles now show published bands, a class aware bill breakdown, class position, locator map, consolidated history, checked payment links and sourced network lines. Phase 12 remains excluded. Main's navigation and analytics fix are preserved. The map geometry ruling is isolated in its own commit, with the selected-band print checks unchanged.

The final Node 22.23.4 gate passed Astro check, the full `BUILD_OG=1` build, 309 unit tests, distribution and text checks, 89 production CSP tests with one worker and 250 browser tests. The internal link audit checked 68,818 destinations without a missing target. The successful build took 979.73 seconds and produced 7,680 files, 1,026,415,422 bytes and 909 HTML pages. All 2,368 profile chart PNGs were generated.

A fresh `79fa7bd` build provided the number baseline. All 2,368 annual band amounts, 2,368 change panels, 9,590 retained history values and 1,282 retained bill rows match exactly. Five North Kesteven history amounts now retain their published pence; no source data or hashes changed. All 198 omitted bill rows are unnamed zeros.

The unchanged pinned design checker completed all seven requested pages with drawers closed at both widths and themes. Its one advisory finding is the two verbatim charging-body titles on Manchester; the existing text rule permits these source names. All other design rules pass in the quiet final run. Captures also record the kit's partly covered Band D label, with its complete value retained in the adjacent tables. No kit file or tolerance was changed.

Per phase evidence, dry run tables, measured build comparison, Decisions taken and capture details are in [the A3 review](A3-REVIEW-2026-11-10.md). Every differing baseline page has a reason in [the number review](A3-NUMBER-REVIEW-2026-11-10.tsv). No merge or deployment was performed.


## A3 review fixes, 10 November 2026

The six review items are fixed separately. Horizontal band bars keep all labels clear in the eight inspected Burnley and Bournemouth, Christchurch and Poole captures at 375 and 1440 in both themes. The contents and history captions, retrieval-date wording, dead-code cleanup and two review-record corrections are included. The live locator test retains the previous geometry thresholds.

The full Node 22.23.4 gate passed: Astro check without diagnostics, `BUILD_OG=1` build, 309 unit tests, distribution and text checks, 89 CSP tests with one worker and 250 browser tests with two workers. The build contains 909 HTML pages, 908 sitemap URLs, 4,986 valid chart PNG links and all 2,368 profile PNGs. The internal link audit passed all 68,818 destinations.

The fresh current-main comparison at `1500163` passed with 515 differing pages and no differences outside existing allowed paths. Exact profile amounts and histories match main. The refreshed measurements, captures and per-page register are recorded in `docs/A3-REVIEW-2026-11-10.md` and `docs/A3-NUMBER-REVIEW-MAIN-2026-11-10.tsv`. This supersedes the earlier clipped-label limitation and original build measurements for the revised branch. No kit, source, gate or tolerance was changed. No merge or deployment was performed.

## Release pipeline efficiency, 10 November 2026

The site job keeps its 60 minute timeout, which was already present at base `8f7002f`. All three existing check names remain. Each job first checks changed paths through GitHub's API. Only `docs/**` and root `*.md` changes qualify for the documents only result. Mixed changes, renames from code, incomplete file lists and manual runs retain the gate. The documents only result applies to pull requests only. Every push to main runs the full gate and publishes, because the release group cancels a running release when a newer push arrives: a documents only push that skipped would leave a cancelled code change unpublished. The documents only path skips checkout, dependencies, tests, builds, browsers and publication, while reporting successful checks.

Code pull requests build without `BUILD_OG`. The unit suite renders the actual homepage card, the generic home card, Burnley's share card and all four Burnley profile chart PNGs in both themes. The production job keeps `BUILD_OG=1` across the build and checks. Missing images fail production checks even if the whole image directory is absent. A PR without images retains chart actions, source, figure and page link checks. Only marked chart PNG downloads may be absent.

Generated images use an exact content key without fallback keys. The key covers every file under `data/` and `src/`, including the downloaded raw sources, vendored kit, drawing code, palette, fonts and OG routes, plus package manifests, Astro configuration and cache implementation. The workflow calculates it after verifying the pinned RA files. Platform, architecture and Node version also contribute. The renderer uses the same key internally. The sample tests do not enable the image cache. The first merged run may still need to populate the main cache because [GitHub keeps child branch caches separate from their parent](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching#restrictions-for-accessing-a-cache). A regression test changes just one England Band D figure by one penny in a temporary fixture, preserving every other byte, and proves the key changes and returns to its original value when reverted.

Profile chart options are reused per council within a build. The parish source is read once by the dist check. The pinned game number fixture is unchanged.

Timing evidence uses successful site job durations, rather than queue time. The requested before runs are:

| Run | Site job | Build | Dist check | Browser suite | CSP suite |
| --- | --- | --- | --- | --- | --- |
| [Main after PR 47](https://github.com/tompickup23/ukcounciltax/actions/runs/42827264926) | 39m07s | 12m36s | 1m58s | 12m02s | 6m09s |
| [PR 48 first run](https://github.com/tompickup23/ukcounciltax/actions/runs/42860213990) | 39m43s | 13m41s | 1m55s | 12m18s | 6m15s |
| [PR 48 latest run](https://github.com/tompickup23/ukcounciltax/actions/runs/42869199791) | 34m09s | 11m37s | 1m37s | 10m37s | 5m21s |

The after runs use code commit `886d002` on `chore/ci-speed`:

| Run | Site job | Build | Dist check | Browser suite | CSP suite |
| --- | --- | --- | --- | --- | --- |
| [PR after, images omitted](https://github.com/tompickup23/ukcounciltax/actions/runs/42908100114) | 19m37s | 2m14s | 1m38s | 7m14s | 3m46s |
| [Full production gate, cold cache](https://github.com/tompickup23/ukcounciltax/actions/runs/42908112615) | 23m14s | 9m17s | 1m19s | 5m48s | 3m05s |
| [Full production gate, warm cache](https://github.com/tompickup23/ukcounciltax/actions/runs/42911813708) | 20m30s | 2m23s | 1m43s | 7m30s | 4m01s |

The two full production gate runs use `workflow_dispatch` on this branch with `BUILD_OG=1`. They execute main's verification steps, but are not post-merge main runs: publication and IndexNow were skipped by the existing branch guard. No merge or deployment was performed. An actual post-merge main timing remains to be recorded after an authorised merge. The warm run log confirms an exact image cache hit.

These are observed runs, not controlled benchmarks. Browser durations varied despite unchanged suites and worker counts. The measured 19m37s PR gate and 20m30s warm production gate do not yet meet the plan's under 10 minute PR and under 20 minute merge-to-live targets. The PR browser and CSP steps alone took 11 minutes.

The full local baseline from `8f7002f` took 1,743.54 seconds. The updated build at `886d002` with an empty cache took 1,097.88 seconds; its warm build took 111.20 seconds. These local elapsed times are separate from the CI timings above.

Both updated full builds match all 909 baseline HTML files byte for byte and all 5,640 image files by SHA256. A further comparison found identical hashes for all 7,691 output files, including search assets, headers and sitemaps. All 5,638 generated PNGs were reused on the warm build without rewriting a cache file. The other PNG is the existing `public/apple-touch-icon.png`; the remaining image is the favicon SVG. The reproducible comparison is `node scripts/compare-builds.mjs <before> <after>`.

Verification passed Astro check, unit tests, the full dist check, text sweep, 68,838 internal link destinations, all 250 browser tests and all 89 production CSP tests. The PR's build without images also passed dist, text, link, browser and CSP checks. CI runs unit tests before building, so its 304 passing unit tests retain the 20 existing built-output skips. A separate local run of the eight test files containing those checks passed all 38 tests after the full build. Production checked 909 share-card references and all 4,996 chart PNG links. No gate, fixture, browser suite or worker count was reduced.

## Council payment links refresh, 11 November 2026

Imported UK Places `src/data/local-links.json` at commit `2bea52dbe74c7a689a500b3b73ff63dcefb900b6`, SHA256 `085eb3b0511aca0f3fad79a9aa3f0decd5a7b5529240229ceed7731b3fb0b617`. The export and UK Places check dates are both 11 November 2026. The existing GOV.UK Local Links Manager source and service identifiers are unchanged.

The reviewed export adds 19 council tax links, changes 15 and removes Halton and Aberdeen City only. UK Places recorded HTTP 404 for Halton and a failed fetch for Aberdeen City. There are 316 imported links: 266 English, 29 Scottish and 21 Welsh. English profiles show 266 payment links and 30 existing fallback notices. The Scottish and Welsh entries remain in the imported data; their page templates do not consume these payment links.

The 91 day expiry rule is unchanged, with the new boundary at 10 February 2027, 00:00 UTC. Expiry messages no longer claim the previous January boundary. No charge, budget, population or other published figure is refreshed. The per authority link changes and permitted page differences are recorded in the pull request. No merge or deployment is part of this refresh.


Validation on Node 22.23.4: `npm test` passed 302 tests before the build, with 20 checks deferred until built pages existed. A targeted post-build run passed all 61 tests in the 12 relevant files, including every deferred check and the payment expiry boundary. Astro checked 248 files with no diagnostics. The full `BUILD_OG=1` build, distribution check for 909 pages and 908 sitemap URLs, and text sweep over 916 files passed. All 308 browser tests passed against the local preview, which was then stopped. An exact link audit verified all 266 rendered payment URLs and their new source dates, plus all 30 fallback notices. No other dataset or figure rendering changed.


## Typed council search NV4, 11 November 2026

The site search now places matching councils above full text results, with separate counts and links to the profile, budget game and parish page where held. The lazy index covers all 350 profiles: 296 English, 32 Scottish and 22 Welsh. It offers 287 games and 214 parish destinations from the existing route and return data. The nine absent returns stay absent. Scottish and Welsh rows identify their nation and offer no game.

The implementation copies the UK Councils search pattern at `993ed703f39fe5ea19e11987d55e04ee7134c028`, with no runtime imports between repositories. Matching uses this site's shared picker helper, including official names, counties and regions. A complete region name selects exactly that region in the dialog, directory picker and name finder. Lancashire returns its twelve districts. Exact council names lead the results; twelve council rows appear initially, with a button for the next twelve. Full text results retain excerpts and gain page type labels. Budget pages use the label Budget because nine explain an absent return. Council-name tables and neighbour navigation are excluded from Pagefind, with their visible figures retained.

The first keystrokes, keyboard navigation, empty results, pagination, stale responses and independent index failures are tested. The directory link remains useful without JavaScript. Queries stay in memory; this adds no query storage or security permission. The comparison tool and its behaviour are unchanged.

Measurements against a fresh build of main `3c8f547da1c97f3442be57ec146cbeb50fd6584a`: Burnley full text matches fall from 42 to 17. The index is 91,146 bytes, or 10,432 gzip bytes. Burnley's HTML changes from 144,672 bytes (32,189 gzip) to 143,006 bytes (31,497 gzip). These are HTML measurements, not total page transfer: the search script moves from inline code to a separately cached bundle, and the council index loads on a search.

Final validation on Node 22.23.4: the full unit run passed 318 tests, with 20 checks deferred until built pages existed. The final post-build run passed all 75 tests in 12 files, including every deferred check and the revised matching tests. Astro checked 253 files without diagnostics. The full `BUILD_OG=1` build, distribution checks for 909 pages and 908 sitemap URLs, all 4,996 chart PNG links and the text sweep over 917 files passed. All 348 browser tests and all 95 actual-header CSP tests passed with two workers. The unchanged pinned design checker passed the homepage, Burnley profile and Burnley game at 390 and 1440 in both themes with zero findings. The final dialog was visually inspected at 375 and 1440 in both themes. An earlier parallel built-page check hit the existing five-second budget fixture timeout; its unchanged rerun and the final post-build run both passed. No assertion or timeout was relaxed. Captures and logs remain local; the preview was stopped.

This branch follows the unmerged payment-link refresh in PR 58. The static number comparison permits only that parent's 267 profile source-date and citation changes; search introduces no further printed number difference. All council amounts, chart text and the four financial source hashes are unchanged. No merge, tag or deployment was performed.

## Comparison improvements, session 4, 11 November 2026

Built on the completed typed-search branch (PR 59), with its payment-link parent PR 58. This preserves the preceding sessions without merging or publishing them. UK Councils is unchanged.

The comparison answer now precedes its form. It states which council has the higher annual charge, the absolute difference, the difference as a percentage of the lower charge, and the annual difference divided by twelve. Both calculations and their rounding are visible, with the published source beside the annual difference. The twelve-month amount is a budgeting equivalent, not a council instalment. The previous ten-instalment figures are removed from this comparison; both annual charges remain unchanged.

Both compact choosers use the existing picker metadata and matching for names, counties and regions. Postcode requests run on Find or Enter, time out after ten seconds, and cannot overwrite a later query or selection. Cancelled requests clear their progress message. The second chooser retains the existing group restrictions. Searches and postcodes stay out of storage and shared URLs. Without scripts, a complete council list opens two profile tables in separate tabs. The homepage card now describes the two-council comparison.

The PR 52 checks for refusals, missing years, shared-link normalisation, London grouping, history, swapping and in-place updates remain. Its select interactions are replaced with equivalent search-button interactions in a separate test commit. New browser checks derive the three answer figures from the held data for two pairs and cover both postcode choosers, recovery, stale replies, county and region matching, keyboard use, accessibility and the no-script fallback.

The initial interactive content reveals after state restoration while retaining its layout. The design check measured zero cumulative layout shift for empty and shared comparisons at both widths in both themes after this change. Browser tests now guard that behaviour as well as the no-script fallback.

Final validation on Node 22.23.4: the full unit run passed 318 tests, with 20 built-page checks deferred. The final post-build run passed all 83 tests in the 12 relevant files, including every deferred check; 49 source safeguards also passed after the final changes. Astro checked 255 files with no diagnostics. The full `BUILD_OG=1` build passed, followed by distribution checks for 909 pages, 908 sitemap URLs and 4,996 chart PNG links, the text sweep over 917 files, and an audit of 71,128 internal-link destinations. All 376 browser tests and all 96 actual-header CSP tests passed with two workers. The unchanged pinned design checker passed the homepage, empty comparison and shared comparison at 390 and 1440 in both themes with zero findings. The final comparison was visually inspected at 375 and 1440 in both themes. The preview and manual browser were stopped.

One post-build budget fixture check reached its existing five-second timeout while other checks ran concurrently. The complete unchanged post-build suite then passed on its own. No assertion or timeout was relaxed. Validation also caught and fixed a cancelled postcode progress message and initial layout movement; regression tests cover both.

Against the session 3 build, only `index.html` and `compare/index.html` differ. All 5,639 PNGs are byte-for-byte identical, no HTML or PNG was added or removed, and the numeric comparison reports zero pages with changed printed values. The 296 comparison rows, bands, years and source metadata match exactly after removing the added search metadata. The financial source files and public security headers are unchanged. No merge, tag or deployment was performed.


## Increases page way in, 13 November 2026

Review candidate for round two prompt 1. The current published answer now
leads, the next-year notice links to its existing page, a council finder jumps
to the current own-share row, and earlier years sit in native details with
working deep links. All 12 tables, 1,291 rows, 17 figure source lines and 39
existing anchors are preserved. No financial figure, source data, canonical or
redirect changed. Phone page height fell from 17,671 to 8,487 pixels.

The full build, distribution and text checks passed. Unit checks and all 404
browser tests passed. The production-header run passed 94 cases; two existing
budget-game cases timed out during a long execution gap and passed a focused
rerun with their original assertions and timeouts unchanged. All 2,845 PNGs are
byte-identical to the baseline. The only numerical text differences are the
dates and repeated year labels removed by shortening the next-year notice.

Measurements, decisions and validation are recorded in
`docs/INCREASES-WAY-IN-2026-11-13.md`. This entry does not record a deployment.
