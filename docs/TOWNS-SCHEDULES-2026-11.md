# Council locality schedules | 2026/27

Retrieved 15 November 2026. Data and documents only. No town routes or league table changed.

The national table has 49 councils with positive special expenses. Exactly 48 have parish rows, covering 2,701 MHCLG rows. Camden is the one without parishes.

**Fully held: 1. Held with gaps: 23. Inconsistent: 11. Not found: 13.** There are 3 canonical schedule files with 141 accepted area totals. A raw schedule is held for 35 councils, containing 1,881 decoded areas.

`held` means every decoded area passes the required checks and every MHCLG parish row is mapped. `held with gaps` means a raw schedule is held but some mapping or reconciliation work remains. Only individually reconciled rows enter a canonical file. Some councils in this category have no canonical file. `inconsistent` means at least one requested check fails, or a printed value is malformed: the whole council is excluded. `not found` includes identified links that could not be retrieved, security challenges and pages without a usable locality total table. It does not claim the council publishes no schedule.

A/D is checked against six ninths of D, rounded half up to the nearest penny. A council rounds each charge to the penny at every band and adds them, so its Band A total can differ from six ninths of its Band D total. With n separately rounded charges the difference is at most n/2 pence, rounded down: n counts each non zero major part, the council's basic amount, its special expense, and the parish precept unless the area is known to have none (usually 5 or 6 charges, so 2p or 3p). A difference within that bound is recorded as rounding; a larger one fails, as does a printed amount that is not well formed money (for example `£1,727,88`). This rule replaced an exact penny gate on 15 November 2026, which had failed 16 councils on rounding alone. No source value is corrected. Other printed bands are preserved; differences greater than 5p against the corresponding D ratio are additionally flagged.

Residual means the printed full D total less the unchanged MHCLG parish D and the sum of Table 10 major parts. A pass also requires a common basic amount and independently evidenced local special expenses. Unknown parish mappings remain unresolved, never zero. Source coverage counts mapped MHCLG codes, including codes whose rows are excluded by a later check. Each canonical file separately lists every parish code absent from its accepted rows.

| Council | Status | Council source | Areas parsed / accepted | A/D exact / rounding / fail / not printed | Residual pass / fail / unresolved | MHCLG source coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Bedford | held with gaps | [schedule](https://www.bedford.gov.uk/files/council-tax-resolution-2026-2027.pdf/download) | 49 / 0 | 33 / 16 / 0 / 0 | 0 / 0 / 49 | 46 / 48 |
| Boston | held | [schedule](https://democracy.boston.gov.uk/documents/s25294/Appendix%20E%20-%20Council%20Tax%20including%20LCC%20and%20PCC%20for%20all%20valuation%20bands.pdf) | 19 / 19 | 19 / 0 / 0 / 0 | 19 / 0 / 0 | 18 / 18 |
| Breckland | not found | [candidate](https://www.breckland.gov.uk/media/23318/2026-27-Council-Tax-Charges/pdf/2026-27_Council_Tax_Charges.pdf?m=1773245472397) | 0 / 0 | not run | not run | 0 / 110 |
| Brighton and Hove | held with gaps | [schedule](https://democracy.brighton-hove.gov.uk/documents/g11988/Printed%20minutes%2026th-Feb-2026%2016.30%20Council.htm?CT=2&T=1) | 5 / 0 | 3 / 2 / 0 / 0 | 0 / 0 / 5 | 0 / 1 |
| Broadland | held with gaps | [schedule](https://www.southnorfolkandbroadland.gov.uk/asset-library/broadland-district-council-tax-26-27-charges1.pdf) | 64 / 0 | 55 / 9 / 0 / 0 | 0 / 0 / 64 | 58 / 65 |
| Broxtowe | held with gaps | [schedule](https://www.broxtowe.gov.uk/media/df0c2lms/your-council-tax-useful-information-2026-2027.pdf) | 11 / 11 | 11 / 0 / 0 / 0 | 11 / 0 / 0 | 9 / 10 |
| Buckinghamshire | inconsistent | [schedule](https://www.buckinghamshire.gov.uk/documents/40665/Resolution_26-27.pdf) | 172 / 0 | 110 / 61 / 1 / 0 | 0 / 0 / 172 | 159 / 172 |
| Charnwood | not found | [candidate](https://www.charnwood.gov.uk/pages/council_tax_charges) | 0 / 0 | not run | not run | 0 / 36 |
| Chelmsford | held with gaps | [schedule](https://www.chelmsford.gov.uk/media/k4cc5oop/council-tax-charges-for-2026-27-accessible-document-v3-final.pdf) | 30 / 0 | 30 / 0 / 0 / 0 | 0 / 0 / 30 | 29 / 29 |
| Cheshire West and Chester | not found | [candidate](https://www.cheshirewestandchester.gov.uk/residents/council-tax/council-tax-bands) | 0 / 0 | not run | not run | 0 / 116 |
| Chorley | inconsistent | [schedule](https://chorley.gov.uk/council-tax/council-tax-charges-2026-2027) | 24 / 0 | 18 / 4 / 2 / 0 | 0 / 0 / 24 | 23 / 23 |
| East Riding of Yorkshire | held with gaps | [schedule](https://www.eastriding.gov.uk/housing/council-tax/about-council-tax-and-your-bill/council-tax-banding-and-charges/) | 169 / 0 | 0 / 169 / 0 / 0 | 0 / 0 / 169 | 164 / 172 |
| East Staffordshire | held with gaps | [schedule](https://www.eaststaffsbc.gov.uk/sites/default/files/docs/counciltax/Council%20Tax%20Charges%202026-27_0.pdf) | 38 / 0 | 1 / 37 / 0 / 0 | 0 / 0 / 38 | 36 / 38 |
| Eastleigh | not found | [candidate](https://www.eastleigh.gov.uk/council-tax/council-tax-bands-and-charges) | 0 / 0 | not run | not run | 0 / 12 |
| Folkestone and Hythe | held with gaps | [schedule](https://www.folkestone-hythe.gov.uk/downloads/file/6385/council-tax-charges-by-band) | 30 / 0 | 30 / 0 / 0 / 0 | 0 / 0 / 30 | 29 / 30 |
| Forest of Dean | inconsistent | [schedule](https://fdean.gov.uk/media/p42nrm0c/council-tax-bands-and-charges-2026-to-2027.pdf) | 40 / 0 | 40 / 0 / 0 / 0 | 0 / 0 / 40 | 37 / 41 |
| Fylde | not found | [candidate](https://new.fylde.gov.uk/council-tax-faqs-2026-27/) | 0 / 0 | not run | not run | 0 / 17 |
| Harborough | held with gaps | [schedule](https://www.harborough.gov.uk/download/downloads/id/9350/council_tax_charges_2026-2027.pdf) | 92 / 0 | 92 / 0 / 0 / 0 | 0 / 0 / 92 | 86 / 91 |
| Hertsmere | inconsistent | [schedule](https://www.hertsmere.gov.uk/council-tax/bands-and-charges/council-tax-charges) | 5 / 0 | 2 / 3 / 0 / 0 | 0 / 0 / 5 | 4 / 4 |
| Horsham | not found | [candidate](https://www.horsham.gov.uk/__data/assets/pdf_file/0007/161782/Council-Tax-Public-Notice-Bands-and-Charges-2026.27.pdf) | 0 / 0 | not run | not run | 0 / 33 |
| King's Lynn and West Norfolk | held with gaps | [schedule](https://democracy.west-norfolk.gov.uk/documents/s83771/Appendix%206%20-%20Council%20Tax%202026-2027.pdf) | 102 / 0 | 88 / 14 / 0 / 0 | 0 / 0 / 102 | 99 / 101 |
| Lewes | not found | [candidate](https://democracy.lewes-eastbourne.gov.uk/documents/s39118/Revised%20Setting%20of%20the%202026-27%20Council%20Tax%20for%20Lewes%20Town%20Council%20Area%20-%20Appendix%201.pdf) | 0 / 0 | not run | not run | 0 / 28 |
| Melton | held with gaps | [schedule](https://www.melton.gov.uk/council-tax/your-council-tax/council-tax-charges/) | 29 / 0 | 10 / 19 / 0 / 0 | 0 / 0 / 29 | 19 / 26 |
| North East Lincolnshire | held with gaps | [schedule](https://www.nelincs.gov.uk/assets/uploads/2026/03/Council-Tax-charges-by-band-and-area-for-2026-to-2027.pdf) | 23 / 0 | 8 / 15 / 0 / 0 | 0 / 0 / 23 | 22 / 23 |
| North Kesteven | inconsistent | [schedule](https://www.n-kesteven.gov.uk/sites/default/files/2026-03/NKDC%20Council%20Tax%20guide%202026%20to%202027.pdf) | 71 / 0 | 0 / 0 / 0 / 71 | 50 / 11 / 10 | 61 / 71 |
| North Lincolnshire | not found | [candidate](https://www.northlincs.gov.uk/wp-content/uploads/2026/03/2026-27-NL-Council-tax-band-per-parish.pdf) | 0 / 0 | not run | not run | 0 / 56 |
| North Somerset | held with gaps | [schedule](https://n-somerset.gov.uk/sites/default/files/2026-03/council%20tax%202026-27%20%E2%80%93%20how%20much%20you%20will%20pay.pdf) | 39 / 0 | 0 / 39 / 0 / 0 | 0 / 0 / 39 | 38 / 39 |
| Northumberland | held with gaps | [schedule](https://www.northumberland.gov.uk/NorthumberlandCountyCouncil/media/Council-Tax/Council%20Tax%20Band%20Charges%202026%20to%202027.pdf) | 156 / 0 | 108 / 48 / 0 / 0 | 0 / 0 / 156 | 135 / 156 |
| Oxford | inconsistent | [schedule](https://www.oxford.gov.uk/council-tax-information/council-tax-charges) | 5 / 0 | 0 / 5 / 0 / 0 | 0 / 0 / 5 | 4 / 4 |
| Rother | held with gaps | [schedule](https://www.rother.gov.uk/council-tax/council-tax-details/council-tax-banding/) | 33 / 0 | 32 / 1 / 0 / 0 | 0 / 0 / 33 | 30 / 33 |
| Rugby | not found | [candidate](https://www.rugby.gov.uk/how-much-is-my-council-tax-) | 0 / 0 | not run | not run | 0 / 40 |
| Rushcliffe | inconsistent | [schedule](https://www.rushcliffe.gov.uk/council-tax/how-much-will-i-pay/council-tax-band-charges-202627) | 58 / 0 | 40 / 16 / 1 / 1 | 0 / 0 / 58 | 55 / 57 |
| Somerset | not found | [candidate](https://democracy.somerset.gov.uk/documents/s63334/Appendix%20Y%20-%20Calculation%20of%20Council%20Tax%20Requirement%202026-27.pdf) | 0 / 0 | not run | not run | 0 / 328 |
| South Gloucestershire | held with gaps | [schedule](https://beta.southglos.gov.uk/static/1d3c54deb1e21620f250da9e4090d1bb/Council-tax-charges-2026-27.pdf) | 50 / 0 | 14 / 36 / 0 / 0 | 0 / 0 / 50 | 49 / 50 |
| South Holland | not found | [candidate](https://www.sholland.gov.uk/media/28751/Council-Tax-Charges-by-Parish-2026-27/pdf/SHDC_Council_Tax_Charges_2026-27.pdf?m=1787755597987) | 0 / 0 | not run | not run | 0 / 22 |
| South Kesteven | held with gaps | [schedule](https://www.southkesteven.gov.uk/sites/default/files/2026-03/Council%20Tax%20Precept%20Advert%20-%202026-27.pdf) | 79 / 0 | 79 / 0 / 0 / 0 | 0 / 0 / 79 | 69 / 84 |
| South Norfolk | held with gaps | [schedule](https://www.southnorfolkandbroadland.gov.uk/asset-library/south-norfolk-council-tax-26-27-charges.pdf) | 118 / 111 | 118 / 0 / 0 / 0 | 111 / 7 / 0 | 118 / 118 |
| St Albans | inconsistent | [schedule](https://www.stalbans.gov.uk/bands-and-charges) | 10 / 0 | 6 / 2 / 2 / 0 | 0 / 0 / 10 | 9 / 9 |
| Telford and Wrekin | inconsistent | [schedule](https://www.telford.gov.uk/media/sraho04w/council-tax-bandings-202627.pdf) | 29 / 0 | 0 / 22 / 7 / 0 | 0 / 0 / 29 | 26 / 29 |
| Tendring | held with gaps | [schedule](https://tdcdemocracy.tendringdc.gov.uk/documents/s80563/A.1%20Appendix%20C%20-%20Collection%20Fund%20Appendices%202026-27.pdf) | 28 / 0 | 28 / 0 / 0 / 0 | 0 / 0 / 28 | 27 / 27 |
| Test Valley | held with gaps | [schedule](https://testvalley.gov.uk/assets/attach/25014/Council-Tax-Charges-for-2026-27.pdf) | 51 / 0 | 39 / 12 / 0 / 0 | 0 / 0 / 51 | 50 / 56 |
| Three Rivers | held with gaps | [schedule](https://cdn.threerivers.gov.uk/files/2026/03/edfadf00-1c87-11f1-9487-ddd84f0d24be-COUNCIL%20TAX%202026_27.pdf?v=2026-03-10T13:49:16.710Z) | 7 / 0 | 5 / 2 / 0 / 0 | 0 / 0 / 7 | 6 / 6 |
| Tonbridge and Malling | held with gaps | [schedule](https://www.tmbc.gov.uk/council-tax-5/council-tax-charges/1) | 28 / 0 | 15 / 13 / 0 / 0 | 0 / 0 / 28 | 26 / 27 |
| Tunbridge Wells | not found | [candidate](https://tunbridgewells.gov.uk/council-tax/banding-and-amounts-to-pay) | 0 / 0 | not run | not run | 0 / 16 |
| West Northamptonshire | held with gaps | [schedule](https://www.westnorthants.gov.uk/council-tax-bands-and-charges/council-tax-charges) | 165 / 0 | 117 / 48 / 0 / 0 | 0 / 0 / 165 | 156 / 165 |
| Westminster | inconsistent | [schedule](https://www.westminster.gov.uk/council-tax/council-tax-bands-and-charges) | 3 / 0 | 3 / 0 / 0 / 0 | 3 / 0 / 0 | 1 / 1 |
| Winchester | inconsistent | [schedule](https://www.winchester.gov.uk/assets/attach/46563/Council-Tax-Charges-2026-27.pdf) | 49 / 0 | 49 / 0 / 0 / 0 | 47 / 0 / 2 | 46 / 48 |
| Windsor and Maidenhead | not found | [candidate](https://www.rbwm.gov.uk/home/council-tax-and-benefits/council-tax/council-tax-charges) | 0 / 0 | not run | not run | 0 / 15 |

## Review notes

Chorley is excluded in full. Its raw web table prints Bretherton D as £2,224.72 while A implies £2,442.72. Hoghton differs by 20p in A, equivalent to 30p at D. Neither value is corrected. Rushcliffe also fails: a 39p A discrepancy at East Leake, £1.00 at C in Flawborough, and Stanton-on-the-Wolds printed at A as `£1,727,88`. Hertsmere prints Bushey, Meriden and Potters Bar at B as £1,883.39 while its printed parts sum to £1,833.39. Oxford prints Risinghurst and Sandhills at B as `£2,103.2`. Telford and Wrekin (several rows) and Buckinghamshire (West Wycombe) differ by 3p at A, beyond the rounding bound. Forest of Dean prints Taynton H with an invalid decimal separator; 40 other rows decode, but the council is excluded in full.

North Kesteven prints D only. Its component sum check finds discrepancies despite the absence of an A/D comparison. The guide's year heading and introductory date also disagree. These issues are recorded verbatim in the evidence and nothing is corrected.

* **Breckland:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.
* **Broxtowe:** The proposed £192.93 amendment was defeated in the saved council decision. Published £198.61 remains the basic amount. Strelley is not separately named; no code is inferred from the catch-all row.
* **Charnwood:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.
* **Chelmsford:** Published totals pass A/D but residuals vary across parishes. Independent basic and special expense evidence is not held, so no canonical rows released.
* **Cheshire West and Chester:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.
* **Eastleigh:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.
* **Fylde:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.
* **Harborough:** All 92 published totals extracted. Independent special expense table is an embedded image on page 12 of the council guide. Visual review found the amounts, but text replay cannot independently verify this table; no canonical schedule released.
* **Horsham:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.
* **Lewes:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.
* **North Kesteven:** Guide prints Band D only and separate parish and lighting amounts. Component sums are checked as printed. Heading says 2026/27 but introductory text says 1 April 2027; neither is silently corrected.
* **North Lincolnshire:** Council PDF link found, but retrieval returned an HTML security challenge. No PDF or amounts accepted.
* **Rugby:** Council directory found but only its first page was available in the saved response. No complete locality charge schedule held and no totals inferred.
* **Somerset:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.
* **South Holland:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.
* **South Kesteven:** Published totals pass A/D. Residuals after MHCLG parish charges vary by pennies across ordinary parishes, with a larger Langtoft difference. Grouped parish aliases remain unresolved. No canonical rows released without an independent basic and expense reconciliation.
* **South Norfolk:** Seven grouped member rows have zero MHCLG charges while the council schedule bills the joint precept. Their own codes and amounts are preserved and those rows are excluded; no carrier charge is substituted.
* **Tendring:** Published totals pass A/D. District and parish subtotals held, but four parish residuals differ from the common £192.42, including a negative difference at Manningtree. Independent expense reconciliation unresolved; no canonical rows released.
* **Tunbridge Wells:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.
* **Westminster:** Band D locality totals and A/D totals reconcile, including Queen's Park £1,100.16. However, the standard table prints Band G Westminster and GLA shares as £850.85 and £895.57, reversing the amounts implied by the respective D shares. Entire council excluded under the internal consistency rule; no source figure corrected.
* **Winchester:** The printed district and parish subtotal is £277.22, but its printed components £168.49 and £113.56 sum to £282.05. Entire council excluded without correction. KILMESTON and WICKHAM & KNOWLE also remain explicit mapping gaps.
* **Windsor and Maidenhead:** No usable council-domain locality total schedule held. The candidate and retrieval outcome are recorded in the source register. No amounts inferred.

## Provenance and replay

The source register is `docs/towns-research/schedules-sources.json`. Each held document has its URL, landing URL, council publisher, retrieval date and SHA256. Raw originals retain their bytes, including the publisher's punctuation. Where a separate landing page was not located, the direct document URL is explicitly used as the landing URL. Sources are on council domains only.

Raw files are kept under `data/raw/schedules/`, which is gitignored as for every importer in this repository; the committed record is the source register with every SHA256, the audit and the canonical files. The replay and `tests/towns-schedules.test.ts` check each raw file against its pinned hash wherever it is present. For seven HTML downloads whose embedded scripts carry site keys, the replay reads an `.evidence.html` copy with only the script elements removed, and verifies that transformation against the original's `originalSha256`. Local extraction before and after removing scripts returned identical locality rows.

`docs/towns-research/schedules-review.json` records parser bounds, reviewed name mappings, quoted component evidence and money-token selectors. Exact matching is within the same council. Reviewed punctuation variants require a unique council-local match. Group members keep their own MHCLG amounts; zero-valued member rows are never replaced with the carrier's amount. Unresolved aliases are listed as missing.

`docs/towns-research/schedules-audit.json` contains every decoded row, raw quote, locator, unchanged band values, Table 10 major parts, residual, discrepancy and missing parish code. Quotes come from saved HTML or Poppler text extraction of the saved PDF, never search summaries. A small number of source names and quotes contain prohibited punctuation: these are stored losslessly as fragments and separator Unicode code points. Interleave each separator between its adjacent fragments to recover the exact source string. This encoding changes no amount or spelling.

National input SHA256: `81e6926afd4f4e1c226a1333ee7e5c7be2aa4c2d6f6bbc4c87b52e80ebb36c0f`.

Run `uv run docs/towns-research/schedules.py` from the repository root. It verifies raw hashes, extracts the tables again, checks the cohort, mappings, component quotes and numeric tokens, recomputes all recorded checks, then compares the complete audit, report and canonical files. It uses no network. `--write` regenerates those outputs. Python runs through uv, with Beautiful Soup pinned in the script metadata; Poppler `pdftotext` must be available.

Required repository verification: `npm test`, `npm run check`, `BUILD_OG=1 npm run build`, `npm run test:dist` and `npm run test:text`, with Node 22.23.4 first on PATH. The draft PR records the actual results. The focused regression file is `tests/towns-schedules.test.ts`.
