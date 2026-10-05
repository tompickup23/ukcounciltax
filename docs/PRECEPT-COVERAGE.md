# Local precept coverage and admission rules

A postcode lookup must never imply an exact property bill solely from its postcode point. Keep the matching geography, charging locality, financial year and source edition distinct.

## Current verified output

- England: national area averages already include the precepts in the full charge, including parish averages. They are not exact postcode bills.
- Burnley 2026/27: borough, county (including its social-care responsibilities), police, fire, and all eight parishes plus the unparished area. Published A to H cells; 72 locality totals reconcile in integer pence. No separate mayoral charge in the complete schedule. Lookup suggestion uses postcode parish name, and requires property-locality confirmation.
- Greater London 2026/27: official Band D GLA total and police/non-police split, with the City of London exception. Displayed as already included in national charges. It is not a complete local schedule and cannot produce an address-level bill.

## Required schema for further schedules

Each published component needs a stable body identifier, kind, covered services, authority/locality jurisdiction, financial year, source URL, source table/page, retrieval date, edition hash when downloadable, and directly published band amounts. Each locality needs a stable ID, verified postcode-geography aliases or code mapping, published total and the applicable component set. Special expenses and local charging zones must be supported rather than hidden in a district-wide residual.

Supported charge kinds: billing council, county, police, fire, mayoral, parish, adult social care and special expense. The included-services list is exclusive across components. For example, a mayoral component covering police and fire cannot coexist with standalone components covering those same services. A social-care amount inside the county total must not be added again.

Statuses must distinguish published amount, included in another component, not applicable and not yet available. Missing is never zero. No summing an own-council amount with a national average that already contains it. No county-wide or policing-area assumption without a year-specific jurisdiction source.

## Admission gates

1. Read the adopted charge schedule, not a consultation or proposed budget.
2. Record all published bands and every locality, preserving the source's precision.
3. Validate source edition/hash and row identities. Boundary reorganisations require explicit year-specific handling.
4. Reconcile each component sum to each published local total. Record any rounding discrepancy for review; do not alter a published number to make it fit.
5. Validate postcode-area matching. If only a postcode-point assignment is available, require the visitor to confirm the property locality. Never claim address-level matching without property-level evidence.
6. Test a parish, an unparished area, a boundary ambiguity, an unsupported postcode, a bundled mayoral charge and a missing component.
7. Only then enable that schedule in the public postcode tool.

## Authoritative references

- Burnley adopted charges: https://burnley.gov.uk/wp-content/uploads/2026/03/Council-Tax-Charges-2026-27.pdf
- GLA approved decision: https://www.london.gov.uk/md3472-approval-2026-27-council-tax-and-precepts-and-communication-council-taxpayers
- ONS postcode assignment and boundary limitations: https://www.ons.gov.uk/methodology/geography/geographicalproducts/postcodeproducts
- England published council tax tables: https://www.gov.uk/government/statistical-data-sets/live-tables-on-council-tax

Nationwide local schedule coverage remains an outstanding data programme, not a completed feature.

## National Band D layer, 5 October 2026

The national import now covers all 296 English billing authorities using Table 10's Data_Billing and Precepting_Bodies sheets, plus 10,245 rows in the parish return (four ceased entries). Council pages show named major preceptors and two years of individual local Band D charges. This is separate from complete adopted all-band locality schedules and does not remove their validation requirements. See NATIONAL-DATA-REUSE.md for the exact fields, identifier rules and scalable postcode approach.
