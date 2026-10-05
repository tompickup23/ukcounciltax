# UK Council Tax | research and build brief

5 October 2026. Research and proposed implementation, prepared for Tom. No website, DNS, redirects or deployment changed in this session.

## 1. Product direction

Tom's instruction establishes the intended split: **UK Council Tax owns detailed council tax data and tools; UK Councils becomes the broader council and services guide, with a concise tax summary and a link to the specialist site.** This supersedes the earlier tax-first direction for the eventual UK Councils product. Existing routes remain operational during preparation.

Recommended promise: **Understand your council tax, see what changed, and explore what comes next.**

The opportunity is more than another band lookup. Combine published charges, a clearly explained bill breakdown, historical changes and transparent scenarios. Use the existing England service as the starting point and Lancashire as the first detailed parish/precept pilot. National source imports can then extend coverage without duplicating the wider national data programme.

This brief was checked against version 5, sections 8a and 8b, of the Lancashire to National build plan and the UK Council Tax section of `/Users/tompickup/Documents/Reports/UK_State_Product_Strategy_2026-10-05.md`. It develops that strategy's reuse, bill-components and parish-variation direction. Existing Lancashire-first and publication gates remain; live migration still requires separate authorisation.

## 2. What the existing project actually holds

Inspected `/Users/tompickup/ukcouncils` on branch `main`, HEAD `779dec32274f39d9d84bb311c49e8476d3b1e2a9`. Existing modifications to `CLAUDE.md` and the improvement plan were preserved. A read-only JSON audit found:

| Capability | Evidence and reuse decision |
|---|---|
| England charges | `data/council-tax/england-2024-25.json`, `england-2025-26.json`, `england-2026-27.json`: each has 296 billing authorities with all eight positive published band values, plus 21 county records. These are holdings counts, not a newly completed upstream revalidation. |
| Provenance and ingestion | `scripts/fetch-council-tax.mjs` and `scripts/lib/ods.mjs`; attachment discovery, header/title-based parsing, source dates, original URLs and SHA-256 hashes. Reuse rather than build a second scraper. |
| Changes and comparison | `src/lib/council-tax.ts`, `tax-view.ts`, `tax-view-data.ts`; annual differences, integer-pence views and same-class/year/band comparison checks. |
| Existing interface | `BandSelector`, `TaxTable`, `HistoryBars`, `CouncilFinder`, `PostcodeDoor`, `MiniMap`, `Search`, `SourceLine` and `ViewActions`. Existing council, band, regional, rises and comparison routes. |
| Downloads and sharing | `tax-export.ts`, selected-band and comparison URL state, CSV provenance and print styling. |
| Broader council role | Registry and school-holiday adapter are present. The build log records holiday cards on 287 council pages at that release. Elections and procurement require separate integration work; do not describe them as complete. |

**Current tax ingestion is England-only.** Welsh, Scottish and Northern Irish coverage has not been built here. The current model fixes bands A to H, an England source and an `area-average` basis. Full bill components, individual parishes, long local histories, property stock, collection rates and scenario models need new adapters or schemas.

The existing parser reads the annual band and own-share tables. It does **not** import the separate MHCLG Table 10 return as a full precept dataset. Do not mistake a stored county/own Band D figure for a complete bill breakdown.

The canonical build log records the 27 September deployment of the inspected commit. Older stage reports saying the improvements are still local describe an earlier state. This research did not rerun application tests or perform a fresh production audit.

## 3. Existing services and the useful distinction

Reviewed the publicly described tools on 5 October:

| Service | Observed offering | Implication |
|---|---|---|
| [Which? calculator](https://www.which.co.uk/money/tax/tax-calculators/council-tax-calculator-aYiC35u6SfZU) | Postcode entry to local band charges | Fast lookup is expected. |
| [CouncilData tools](https://councildata.co.uk/tools/) | Calculator, band checker, comparisons and rankings | These features alone are not a distinctive proposition. |
| [Council Tax Challenger](https://counciltaxchallenger.co.uk/council-tax) | Band tables, annual increases and links to nation-specific tools | Broad coverage and change tables are also established features. |
| [Official band lookup](https://www.gov.uk/council-tax-bands) | Address/postcode search for England and Wales, with a Scotland route | Link to the official property-band service rather than inventing a property-band inference. |

These are observations about visible offerings, not audits of competitor accuracy, market share or every tool they provide. The recommended positioning is the combination of **bill composition, dated local evidence, historical context and reproducible scenarios**. Do not claim that no competitor offers any of these features.

## 4. Source programme

The linked publications were located/read during this research. New spreadsheet datasets listed below still require download, schema inspection, licence capture and ingestion validation before a coverage claim.

| Dataset | Product value | Coverage and treatment |
|---|---|---|
| [MHCLG 2026/27 levels](https://www.gov.uk/government/statistics/council-tax-levels-set-by-local-authorities-in-england-2026-to-2027) | Published bands; own-authority changes; tax-setting context | England. Existing Tables 1 to 9 adapter; inspect Table 10 separately for requirements, bases and component records. |
| [MHCLG live tables](https://www.gov.uk/government/statistical-data-sets/live-tables-on-council-tax) | Long-run Band D history, average per dwelling, parish precepts | Band D/per-dwelling series are available from 1993; usable history varies by authority and boundaries. Parish 2026/27 release is available. Never imply that every band has this history. |
| [Welsh Government 2026/27 release](https://www.gov.wales/council-tax-levels-april-2026-march-2027) and [StatsWales bands](https://stats.gov.wales/en-GB/1988b6af-2a9c-43b6-8939-83e6cceb3903/start) | Wales band and change pages | Dedicated A to I model, community and police components where supplied. Retain published measure definitions. |
| [Scottish Government datasets](https://www.gov.scot/publications/council-tax-datasets/) | Scottish bands, history and chargeable dwellings | Dedicated A to H source adapter. Do not apply English band ratios. |
| [Scottish Water 2026/27 charges](https://www.scottishwater.co.uk/your-home/your-charges/your-charges-2026-2027) | Explain the additional items on Scottish bills | Display council tax and water/wastewater separately; only combine when the relevant services and charging basis are known. CTR is not an automatic full water-charge exemption. |
| [NI domestic rates method](https://www.nidirect.gov.uk/articles/how-rate-bills-are-calculated) | Clearly labelled Northern Ireland section | Capital value and district/regional rates; a separate calculator contract, never A to H bands or a council-tax league table. Start with an explainer and official lookup links. |
| [Council Tax stock of properties 2026](https://www.gov.uk/government/statistics/council-tax-stock-of-properties-2026) | Band distribution, most common band and housing-stock context | England and Wales; main snapshot at 31 March 2026 and supplementary band/area snapshot at 8 September. Property stock is not a tax-setting base or an actual paid-bill distribution. |
| [England Council Taxbase 2025](https://www.gov.uk/government/statistics/council-taxbase-2025-in-england) | Discounts, exemptions, premiums and chargeable dwelling context | Distinguish this snapshot from the forward tax-setting base. Preserve revision and category definitions. |
| [England collection statistics 2025/26](https://www.gov.uk/government/statistics/collection-rates-for-council-tax-and-non-domestic-rates-in-england-2025-to-2026/collection-rates-for-council-tax-and-non-domestic-rates-in-england-2025-to-2026) | Collection trends and amounts outstanding where supplied | Separate in-year collection from recovery of older debt. No inference that the uncollected percentage is permanently lost. |
| [Scottish collection statistics](https://www.gov.scot/publications/council-tax-collection-statistics-2025-26/) | Scottish collection context | Nation-specific definitions; do not silently merge into an England ranking. |
| Local published resolutions and charge schedules | Parish-specific bills and component changes | Highest-value enrichment. Begin with Lancashire and retain document status, page/table and adoption evidence. |
| [ONS consumer price indices](https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/consumerpriceindices/current) | Inflation-adjusted history | Choose and disclose a consistent index and reference period. Incomplete current financial years cannot have an observed full-year average. |

Add support guidance from [Council Tax Reduction](https://www.gov.uk/apply-council-tax-reduction), [who has to pay](https://www.gov.uk/council-tax/who-has-to-pay), [disabled band reduction](https://www.gov.uk/council-tax/discounts-for-disabled-people) and [payment options](https://www.gov.uk/council-tax/paying-your-bill), supplemented by dated nation and council sources. Begin with explanations and direct application links. Detailed means-tested entitlement is a separate, maintained rules engine.

## 5. The council page

Proposed order:

1. **Your council tax:** place, financial year, band, annual figure, annual change in pounds and percent, and explicit amount basis. Offer 10/12-way annual budgeting calculations with labels; these are not the council's actual instalment schedule.
2. **What makes up the bill:** county/unitary, district, police, fire, combined authority and parish where relevant and evidenced. Show both amount and recipient. Do not double count adult social care already included in the council element.
3. **What changed this year:** component pound changes and contribution to the total increase. Explain differing council-share and whole-bill percentages.
4. **History:** nominal published charges, optional inflation-adjusted view, cumulative change and visible gaps/boundary breaks. Default to the user's band only where that band's history exists.
5. **Compare:** two or three eligible areas, same band/year/measure and compatible class. Keep rank cohorts explicit. No combined UK cheapest/most-expensive table across incompatible systems.
6. **Explore a scenario:** baseline source, editable assumptions and a separate results panel headed “Illustrative scenario”.
7. **Local context and next steps:** band distribution, collection information where held, official band check, help/reductions, billing contact, downloadable evidence.

The homepage starts with council name/postcode lookup and routes to “Find my charge”, “See annual increases”, “Compare areas” and “Model future costs”. Maps support those tasks. Use the existing typography and mobile/table patterns; give the specialist site its own tested accent. Every chart has an accessible table and every figure retains its source and nearby caveat.

A postcode selects an area, not a property's band or guaranteed parish charge. Ask users to choose a band and, where needed, a verified billing locality. Do not store entered household details or include postcodes in share links, analytics or indexed pages.

### Burnley as a concrete pilot

The inspected MHCLG-derived file holds **£2,549.42** for the 2026/27 Band D area average. Burnley's [published budget page](https://burnley.gov.uk/council-democracy/finance-performance/burnley-councils-budget-book/) gives **£2,540.32** for the total before parish additions, with **£351.44** as the borough element. These represent different bases, not automatically a data error.

The [2026/27 resolution document](https://burnley.moderngov.co.uk/documents/s49234/Council%20Tax%20Resolution%202026-27.pdf), pages 2 and 3, contains separate county, borough, police and fire band amounts and locality-specific totals. It is worded as a recommendation to council, so confirm the adopted schedule/minutes before using it as final authority for new parish pages. It also shows £360.53 including average parish precepts, against £360.54 in the stored MHCLG own-share field. Preserve and reconcile this penny discrepancy rather than altering either published source to force agreement.

The useful interface therefore offers a labelled area average first, followed by a locality selector only where adopted charge schedules have been verified. It never adds a parish charge on top of an area average that already includes parish precepts.

## 6. Modelling programme

Tom explicitly requested modelling. The new product should support it while keeping the existing rule against invented published charges. Store observations, arithmetic derived from observations, and scenarios as distinct record types. Missing historical bands remain missing. User assumptions do not enter the official charge tables.

| Model | Inputs and result | Release order |
|---|---|---|
| Future household cost | Published selected-band baseline; user-selected annual increases and horizon; annual cost, added cost and cumulative total | First specialist release |
| Component increases | Verified component baselines and individual increases; show resulting total and each contribution | Lancashire pilot |
| Simple discount illustration | Explicit qualifying assumption and sourced rule; show arithmetic separately from an eligibility decision | After nation-specific guidance checks |
| Inflation comparison | Published nominal series and chosen observed CPI reference periods; show the change in constant-price terms | After historical source import |
| Revenue sensitivity | Own-authority Band D charge and the correct tax-setting base; change in tax requirement under fixed-base assumptions | Later analytical release |
| Reorganisation/harmonisation | Comparable predecessor own-charge series and tax-setting bases; alternative transition paths with unchanged external precepts separately shown | Later, tied to evidenced geography and arrangements |

Implementation rules:

- Household path: `charge(t) = baseline * product(1 + assumed_rate(y))`. State whether one rate repeats or each year differs. Show cash cumulative cost separately from the final year's increase. Retain precision internally and specify penny rounding.
- Component path: `total(t) = sum(component(t))`. The whole-bill increase is a weighted result, not the sum of component percentages. Disable the complete breakdown when components are missing.
- Frozen-base revenue sensitivity: `change_in_requirement = change_in_own_Band_D * tax_setting_base`. This is not cash receipts. Do not apply a collection percentage again if the selected base already incorporates collection assumptions.
- An illustrative revenue-neutral harmonised own charge can be `sum(own_charge_i * base_i) / sum(base_i)`, provided scopes and years match. Do not take an unweighted average of area-total bills or imply an adopted future charge. Show transition timing as an assumption.
- Do not describe an assumed 5% annual increase as a legal maximum. [MHCLG's 2026/27 rules](https://www.gov.uk/government/statistics/council-tax-levels-set-by-local-authorities-in-england-2026-to-2027/council-tax-levels-set-by-local-authorities-in-england-2026-to-2027) distinguish authority types, pound limits and exceptions; these are year-specific referendum principles.
- Scenario exports/share links retain baseline edition, model version, input assumptions and labels. Do not publish forecasts with invented confidence intervals.

## 7. Data and code architecture

Keep Astro and the existing static rendering approach. Use small client-side tools for scenarios. No account system or household database is needed for the initial service.

**One tax data pipeline, two consumers.** Initially keep ingestion in UK Councils and produce a versioned, validated export for the new site's build. UK Councils consumes the same edition for its summary. A later extraction into an independently maintained package is optional; avoid maintaining two diverging scrapers. CI must use committed/pinned artifacts, not imports from another local checkout.

Extend the contract with:

- nation and tax system; authority/recipient IDs, GSS and effective-dated geography;
- financial year, band where applicable, amount in integer pence and explicit basis (`area-average`, `locality-total`, `authority-own`, `component`, `domestic-rates`);
- inclusion/exclusion flags for parish, social care, water and other components;
- adopted/proposed status and source URL, page/table/cell, publisher, publication/revision/retrieval dates, licence and file hash;
- calculation input references and method, distinct from observed source values;
- availability and comparison eligibility, with unknowns never defaulted to zero;
- separate scenario records with model version and assumptions.

Refresh by source edition, validating before replacing the last good snapshot. Reconcile component sums to the corresponding locality schedule with documented source-rounding treatment. Review geographic successors explicitly and preserve predecessor history. Do not hard-code today's authority count as a permanent UK total. Source-check timestamps and page-content modification dates remain separate.

## 8. UK Councils transition and URLs

UK Councils retains identity, official service links, which tier handles which service, school dates, elections and sourced spending/procurement summaries as those adapters become ready. Its tax card can show current Band D area average, annual change and source, followed by a prominent specialist link. Preserve an incoming band selection when forwarding to UK Council Tax.

Proposed route ownership:

| Current UK Councils route | Intended treatment |
|---|---|
| `/councils/<slug>/` | Keep as the broader council profile, self-canonical. Reduce tax detail after the specialist destination is available. |
| `/council-tax/`, band, region and rises routes | Move detailed content to equivalent UK Council Tax routes with a reviewed one-to-one redirect map. |
| `/compare/` | Move the tax comparison tool with validated council, band and year state preserved. |
| `/your-area/`, `/councils/`, homepage | Retain and refocus on the broader council/service journey. |

For the new site, use stable council routes such as `/councils/burnley/`, plus `/compare/`, `/increases/2026-27/`, `/bands/`, `/tools/future-cost/`, `/help/`, `/data/` and nation hubs. These are proposals, not routes already built. Add permanent annual council archives only where there is substantive sourced data; no generated postcode pages, all-pairs comparisons or indexable scenario permutations.

Before migration, capture Search Console landing-page/query data, live URLs and backlinks where available. That access was not inspected in this session. Keep the public service working while the new version is prepared. At release, replace duplicated long-form tax content with summaries or appropriate redirects, update internal links/sitemaps/canonicals and test fragment/query restoration. Do not redirect the entire UK Councils domain: it remains a separate service. Do not use a whole-domain Change of Address for this partial content move. [Google's migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) recommends keeping redirects for at least a year.

## 9. Hosting and one.com

Recommended arrangement: one.com remains the registrar; Cloudflare Pages hosts the Astro build, consistent with the existing estate. The one.com account need not be the same login identity as Cloudflare. Buying a one.com website-builder package is not part of this plan.

The one.com login page was opened in the Codex in-app browser and left available for Tom. Authentication, actual account contents, DNS, mail and domain configuration have not been verified. No credentials were requested in chat.

For an apex domain on Pages, [Cloudflare's documented setup](https://developers.cloudflare.com/pages/configuration/custom-domains/) requires the domain as a zone in the Pages account and Cloudflare nameservers. First inspect/export the existing DNS records, preserve legitimate mail/TXT records, check DNSSEC/DS state and obtain the actual assigned nameservers. Prepare the project and domain attachment before changing the registrar. Never reuse UK Councils' nameservers by assumption.

The immediate instruction is to research the specialist site and enable account login. This session makes no live configuration change. Any subsequent setup uses the established project process and the user's then-current authorisation. A launch needs the finished build, working contact route, HTTPS, apex/www behaviour, headers, redirects and rollback evidence ready first.

## 10. Build order and acceptance

1. **Reuse baseline:** create the new local Astro project from selected components; import a pinned tax export; implement nation/basis-aware types; retain all current England source values and provenance. Prepare a local preview.
2. **Distinctive England release:** current bands, annual increases, comparison, existing history, future-cost scenarios, download/print, guidance and a verified Lancashire component/locality pilot. Clearly label actual territorial and locality coverage.
3. **UK coverage:** Welsh and Scottish adapters, Welsh Band I, Scottish water separation and an NI domestic-rates explainer. Each nation passes its own source reconciliation before it is advertised as covered.
4. **Deeper evidence:** long Band D histories, property-stock distributions, taxbase and collection statistics, inflation views and component histories. Publish gaps and structural breaks.
5. **Analytical tools:** tax-base/revenue sensitivity and evidenced harmonisation scenarios. Avoid misleading claims about affordability or service value from incomparable income/spending measures.
6. **Coordinated release:** verified DNS/hosting, source/contact checks, traffic baseline, route mapping, UK Councils summary changes and specialist launch. Existing publication decisions still apply.

Required implementation checks include source reconciliation, missing/revised data, boundary changes, complete comparison cohorts, Welsh Band I, Scottish water, NI rates separation, component sum and non-double-counting, rounding, zero/negative scenario increases, invalid horizons, share restoration and canonical/redirect parity. Run project unit/type/build checks and relevant 375px, keyboard, print, no-JS and real-CSP checks. No claims of improved traffic or search position without measurement.

Recommended first engineering task: **extract the reusable tax export and build one complete Burnley page plus the future-cost tool locally.** This validates the core product before creating hundreds of new pages or changing the live UK Councils service.
