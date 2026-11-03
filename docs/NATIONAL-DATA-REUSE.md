# National council tax data and reuse

5 October 2026. Implementation follows Tom's instruction to prioritise reusable national datasets over council-by-council PDF collection. Source projects were inspected read-only. This updates the sequencing in BUILD-BRIEF.md; it does not authorise a UK Councils migration or alter another project.

## Reuse found

| Existing work | Reuse in UK Council Tax |
|---|---|
| UK Councils `scripts/lib/ods.mjs`, annual band importer, GSS registry and page templates | Retained displayed-cell ODS reader and council identities. National totals are checked against its independently imported annual band table. |
| AI DOGE `scripts/drive_archive/build_parish_registry.py` and `registries/parish_sources.json` | Located the national parish workbooks, their fields and source-change tables. Re-fetched the official edition; copied no operational compliance data or guessed parish website domains. |
| AI DOGE `burnley-council/scripts/govuk_budgets.py`, `parse_council_tax` | Reused knowledge of the three historical measures: `Area_CT`, `exc_PP`, `inc_PP`. Re-fetched the revised 2026 workbook and preserved displayed precision. |
| AI DOGE `burnley-council/data/shared/lancashire_tax_bases_2627.json` | Identified Table 10 as the common national tax-setting source and its correct tax-base field. Inspected the workbook directly and found the national billing-area-to-preceptor mapping. |
| AI DOGE `burnley-council/scripts/collection_rates_etl.py` | Existing QRC4 Table 6 importer is the next reusable collector. Its present council allowlist should become a GSS-based national adapter, and the latest pinned release must advance from 2024/25 to the current 2025/26 edition; tax and business-rate measures must stay separate. Not imported in this release. |
| UK Places registry and the existing shared-registry export | Reuse GSS identities and verified public place routes. The inspected UK Places scripts did not establish a date-versioned postcode-to-parish/precept crosswalk. Do not claim that it already holds one. |

No build or refresh command reads sibling checkouts. A standalone, pinned national import produces reviewed JSON under `data/national/`. All public downloads include official source URLs and SHA-256 checksums. No account information or private project records are included.

## Implemented national layers

1. **MHCLG Table 10, 2026/27:** all 296 English billing authorities; their own share, area average, and four published major-precept slots. `Precepting_Bodies` supplies names and codes directly by billing GSS. Police and general functions of the same combined authority remain separate source slots; do not deduplicate by body code. County/GLA, fire and police services already bundled into another slot are never added a second time. Explicit zero separate slots are retained without implying absence of the service. Small published rounding differences remain visible. The workbook's provisional/adoption and revision notes are displayed.
2. **MHCLG local precepting authorities, 2026/27:** 10,245 source rows, including four ceased entries, so not 10,245 active or charging parish councils. Published 2025/26 comparisons appear on the same source row. Preserve non-precepting, grouped, charter-trustee, Temple, zero, negative, missing and ceased cases. Band D is reported directly; it is not recalculated as precept / tax base. Group and charter-trustee overlaps mean tax bases and charges cannot be naively summed.
3. **Revised Band D live tables:** all 296 current billing GSS identities, with available area histories from 1993/94 and own-share histories on their published bases. Most cells display whole pounds; occasional penny values are preserved. Missing years are not backfilled. Some district-to-unitary historical area continuity is already supplied by MHCLG; the site discloses this and makes no extra predecessor joins. Council responsibility changes and source notes remain visible.
4. **HMRC Council Tax: stock of properties 2026, table CTSOP1.1 (published 24 September 2026, snapshot 31 March 2026):** band counts A to H and the all-properties total for all 296 English billing authorities and England, as printed (rounded to 10 by HMRC). The `[c]` cell for City of London Band A stays unknown, never zero. Shares are calculated from the printed counts and total. The table also covers Wales on its own band scale; Welsh rows are not imported and Welsh and Scottish pages are unchanged. The block sits on each English council page with its source line. Stock is properties on the valuation list, not the tax-setting base or households paying.

These are national Band D analytical layers. They are not a national exact address-level bill calculator. The complete Burnley all-band schedule remains separately reconciled to the adopted local charge table.

## Scaling postcode results

The scalable route is **postcode → dated billing GSS → Table 10 preceptor mapping**, plus a separate verified local-precept geography layer. It does not require finding a police/fire council PDF for every postcode.

For localities, use an ONS Postcode Directory edition and a dated parish/charging-area crosswalk. An MHCLG parish ID is not an ONS E04 parish code; official MHCLG codes also have irregular formats, which are preserved. Do not globally join by parish name or use AI DOGE's historical name fallback as proof of identity. Candidate matches must be scoped to billing GSS and reviewed against grouped parishes, renamed/split/ceased bodies and charter-trustee geography. Preserve ambiguous and unmatched results. A postcode can span boundaries and does not establish a property's band or guarantee its full local charge.

Current postcode tools lead to the matching English council's national breakdown; the exact local tool still requires locality confirmation. National parish search operates within the council page. No postcode is retained in URLs or stored.

Exact all-band bills need adopted schedules, service inclusion definitions, local special expenses and reconciliation. Prefer machine-readable official council tables; use local PDFs to fill the verified gaps. Never add a selected parish precept to an area average that already includes average parish charges. Even a council share excluding parishes may contain average special expenses and may not apply uniformly across the billing area.

## Next national additions, in order

- **Collection rates and arrears:** generalise the existing AI DOGE QRC4 collector. [MHCLG 2025/26 release](https://www.gov.uk/government/statistics/collection-rates-for-council-tax-and-non-domestic-rates-in-england-2025-to-2026/collection-rates-for-council-tax-and-non-domestic-rates-in-england-2025-to-2026) covers all 296 authorities. Keep in-year collection, collection of older debt and outstanding arrears separate; uncollected does not mean permanently lost.
- **Discounts, exemptions and premiums:** [Council Taxbase 2025](https://www.gov.uk/government/statistics/council-taxbase-2025-in-england) supplies a national October snapshot. This is different from the forward tax-setting base already imported from Table 10.
- **Parish geography:** use [ONS postcode products](https://www.ons.gov.uk/methodology/geography/geographicalproducts/postcodeproducts) and reviewed crosswalks, then extend exact Lancashire locality schedules. No address-level guarantee from postcode-centroid geography.
- **Older parish history:** fetch prior revised workbooks, keyed by source edition and year-specific identity. Do not merge every older row onto the newest parish name. Keep boundary breaks explicit.

This supports a small number of maintainable national imports plus targeted local validation. UK Council Tax owns detailed tax analysis; the existing ecosystem registry continues to supply verified, relevant sister-site links. No bulk low-value parish page creation or changes to UK Councils URLs are part of this release.

## Refresh and validation

`npm run data:national` fetches missing originals and requires the reviewed hashes in `data/national/sources.json`. It runs `scripts/import-national.mjs` for the three MHCLG workbooks and then `scripts/import-band-stock.mjs` for the HMRC zipped CSV, which also asserts the printed England row and three named councils (Burnley, Birmingham, Westminster) before writing `data/national/band-stock.json`. A changed upstream file stops the import for review. Data is written only after all three source contracts pass. Re-running against the same source editions is deterministic.

Checks cover GSS completeness, source columns and body mapping, reconciliation of all 296 area totals, independent Burnley schedule agreement, London/combined-authority exceptions, ceased and negative parish records, source precision, history gaps and downloadable evidence. Browser and actual-CSP checks exercise parish filtering, council lookup, no-JavaScript reading and mobile layout.
