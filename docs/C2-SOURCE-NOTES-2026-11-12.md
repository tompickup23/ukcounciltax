# C2 source review | 12 November 2026

Research only. No new game is authorised by this document. The earlier easy/medium/hard outline is superseded by this review where they differ. The reproducible held-data audit is `python3 docs/c2-dry-run.py`; its committed output is `C2-DRY-RUN-2026-11-12.json`.

## What the held data supports

The audit joins the current 296 English billing-authority routes to RA and Table 10. RA has 287 available returns and nine missing returns, retained as missing. All 296 have the current own precept excluding parish and the tax base. All 164 district county links resolve to a separate RA county record. No county budget is divided among districts.

The published signed financing identity reconciles for all available returns. This is an accounting check, not proof that an RA tax requirement matches the separate council-tax return: seven authorities carry RA note 4 about that disagreement. Two carry note 8 about retained business rates. 148 available returns contain at least one negative net service group. A positive-only pie or a slider that treats a negative group as spare spending would be wrong.

The historical series holds whole pounds for all 296 prior own precepts, so it is unsuitable for a precise freeze. However, the separately held annual Table 8 datasets give penny-precise own precepts for all 296 in both years. Every current Table 8 own value agrees with Table 10 excluding parish. All 164 published pound-change values also agree with the annual-table subtraction. Use those annual inputs, never reverse an area-wide percentage rise. After the nine missing RA returns and seven note 4 cases, 280 authorities are candidates for the narrower mode, subject to the remaining gates.

Burnley's held inputs illustrate the distinction: own precept excluding parish 35,144 pence, tax base 24,497 Band D equivalents. A hypothetical 1% change to that current own precept, holding the base constant, gives £86,092.2568 before display rounding. This is scenario arithmetic, not its published yield from the actual rise. Its prior own precept is £344.58 in annual Table 8c, while the historical series displays £345. The freeze counterfactual is therefore (351.44 minus 344.58) times 24,497 = £168,049.42, with the current tax base and all other financing fixed. That is a counterfactual revenue difference, not a published budget deficit. Its RA tax requirement includes parish precepts; it must not be substituted for the own-precept base.

## Primary sources

### RA 2026/27

MHCLG, [individual authority budget data](https://www.gov.uk/government/statistics/local-authority-revenue-expenditure-and-financing-england-2026-to-2027-budget-individual-local-authority-data), 11 June 2026, parts 1 and 2 and specific grants. Exact workbook URLs, hashes and sheet names are in `data/national/budget.json`. Service lines are net spending, not gross cost or a count of users. Lines 900 to 990 cover revenue expenditure and financing; 911 to 916 record reserve movements; Part 2 lines 1011 to 1016 record reserve stocks. Source note 1 says service values are net of sales, fees, charges and transfers. The held data therefore cannot drive an independent fees dial without double counting. Reserve categories and movements do not establish a freely spendable balance. The source flags differing DSG and High Needs Stability Grant treatments. Preserve those qualifications beside their figures.

Coverage is measured above, not inferred from national totals. England estimates for absent returns cannot fill individual councils.

### Annual Tables 8 and 10, and the historical series

MHCLG, [council tax levels 2026/27](https://www.gov.uk/government/statistics/council-tax-levels-set-by-local-authorities-in-england-2026-to-2027), Table 10, `Data_Billing` and `Precepting_Bodies`; [historical live tables](https://www.gov.uk/government/statistical-data-sets/live-tables-on-council-tax), `exc_PP`. The held source manifest records hashes and precision. Tax base means Band D equivalents, not households or paying accounts. Current own-with-parish, own-excluding-parish and area-wide Band D are distinct fields. The annual [2025/26 tables](https://www.gov.uk/government/statistics/council-tax-levels-set-by-local-authorities-in-england-2025-to-2026), Table 8a and 8c, already supply the prior own value at penny precision; current Table 8 and Table 10 agree for every billing authority. The audit hashes both annual files. Do not derive other bands from Band D under the site's rules.

### Referendum principles

MHCLG, [final 2026/27 report](https://assets.publishing.service.gov.uk/media/6989c723d3f57710b50a9bb4/Council_Tax_Referendum_Principles_Report_2026-27.pdf), 9 February 2026, Annex A. The relevant basic amount excludes parish precepts. Ordinary social-care authorities trigger at 5% or more. Shire districts trigger only when both at least 3% and more than £5 apply. Exceptions: Trafford, Warrington and Windsor and Maidenhead trigger at 7.5%; North Somerset, Shropshire and Worcestershire at 9%; Bournemouth, Christchurch and Poole at 6.75%. These are referendum triggers, not a prohibition on setting a higher amount after the required process. An implementation must preserve strict versus inclusive comparisons and the exceptions by GSS code, with boundary tests. Separate police, fire and GLA rules cannot be applied to a district's own precept. No same rule for all councils.

### Core Spending Power

MHCLG, [final settlement table](https://www.gov.uk/government/publications/core-spending-power-table-final-local-government-finance-settlement-2026-27-to-2028-29) and [methodology](https://www.gov.uk/government/publications/explanatory-note-on-core-spending-power-final-local-government-finance-settlement-2026-27-to-2028-29/explanatory-note-on-core-spending-power-final-local-government-finance-settlement-2026-27-to-2028-29), 9 February 2026. This is a funding measure, not a balanced service budget or a medium-term deficit. It assumes council-tax increases and tax-base growth; exceptional flexibilities are not included. Future-year allocations remain subject to confirmation in those years. A forecast round cannot subtract this measure from current RA and call the difference a funding gap. Authority-level coverage of this separate workbook has not been imported or reconciled against the 296 routes. Gate any later use on that join and explicit assumption labels.

### Employee costs and subjective analysis

MHCLG, [2025/26 individual outturn](https://www.gov.uk/government/statistics/local-authority-revenue-expenditure-and-financing-england-2025-to-2026-individual-local-authority-data-outturn), 17 September 2026, is newer than the 2024/25 release in the earlier outline. RSX and individual RO forms provide employee costs, running expenses and income by service. This is actual past expenditure, not headcount or avoidable payroll. The [SAR guidance](https://www.gov.uk/government/publications/general-fund-revenue-account-outturn/general-fund-revenue-account-outturn-specific-guidance-notes), SAR section, keeps Part A annual and B/C every three years, next in scope 2025/26. Part A includes pay, employer NI and retirement benefits; agency staff sit in running expenses. The current individual-data page does not list a separate SAR file. Collection scope is not proof of a downloadable complete table. We have not imported RSX/SAR, so usable coverage among the 296 remains unverified. Do not turn these costs into jobs lost or a savings delivery rate.

### Adult social care unit costs

DHSC, [2025/26 finance report](https://www.gov.uk/government/statistics/adult-social-care-finance-report-england-2025-to-2026/adult-social-care-finance-report-england-2025-to-2026), published October 2026, supersedes the older NHS series for this review. All 153 social-care authorities returned data. Tables 51 and 53 cover hourly home-care and weekly care costs; measures vary by age, support reason and setting. These are historical averages with specified expenditure/activity denominators, not marginal prices for removing a package of care. Districts have no own social-care return: county information must remain a distinct authority. The route-by-route GSS and unit-cost completeness audit is not yet imported. Never extrapolate a county rate to its districts or claim a pound change buys a precise number of care placements.

## Mechanics reviewed in the separate Lancashire model

Only the mechanics were studied. No political text, figures, imprint, local caps or private source material is copied into this repository.

| Mechanic | National candidate | Decision |
|---|---|---|
| Service blocks and lines | RA groups and detailed signed net lines | Reuse hierarchy with source and negative-value handling |
| Council-tax control | Own precept excluding parish and tax base | Labelled freeze counterfactual feasible from both annual Table 8 files and current tax base |
| Reserve control | Part 2 stocks and Part 1 movements | Show observed values; no free cash slider |
| Savings delivery rate | Local monitoring against agreed savings | No national equivalent established; omit |
| Demand, price and pay dials | Local sensitivities, not RA net totals | Omit until an attributable local model exists |
| Random cards | Source-backed local shocks and probabilities | No national basis established; omit |
| Unit equivalents | ASC-FR historical averages for limited services | Context only after join, not savings consequences |
| Legal floors and maximum cuts | Duties and local delivery plans | No uniform financial minimum in these datasets; omit |
| Second-year carry | Recurring changes, one-off reserves and a sourced medium-term plan | Defer; CSP is not the missing plan |
| Results and sharing | Explicit choices, baseline, formula and remaining difference | Reuse a neutral, labelled scenario summary |

## Competitor evidence

[Delib's Liverpool case study](https://www.delib.net/case-studies/liverpool-city-council) describes residents changing spending against a real council-specified target, with consequences and extensive promotion. It reports almost 3,500 visitors in the first week and over 500 completed responses by the end. Those different periods do not support a completion-rate calculation. [The demonstration](https://3.uk-sandbox.budgetsimulator.com/) is expressly a demo, not a current consultation. [Edinburgh's case study](https://www.delib.net/case-studies/edinburgh-city-council-simulator) reports participation, not a comparable completion rate. Neither source establishes how often people share outcomes. Treat sharing as a proposed convenience, not a proven engagement mechanism. Do not import the council's authored consequence claims into a national game.
