# Spend per resident by age | source notes (C4, idea I124)

Prep done in Claude Code on 8 November 2026. Binding on the Codex build in `docs/PER-RESIDENT-BRIEF.md`. It builds on the budget game's data (`docs/BUDGET-GAME-SOURCE-NOTES.md` and `data/national/budget.json`, which arrive when the C1 PR merges).

## 1. The population source

| | |
|---|---|
| Publisher | Office for National Statistics |
| Release | Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2025 |
| Dataset page | https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/populationestimatesforukenglandandwalesscotlandandnorthernireland |
| File | `mye25tablesuk.xlsx`, https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/populationestimatesforukenglandandwalesscotlandandnorthernireland/mid2025/mye25tablesuk.xlsx |
| Size and sha256 | 1,026,940 bytes; `8ae244e3341257ecccaee55f4973fe12f46afe6656ead6c1a9ed3f4f8585e40f` |
| Published | The cover sheet says: "originally published at 9.30am 1 October 2026". Release number MYE25UK. Next publication "summer 2027". |
| Licence | Open Government Licence v3.0 |
| Retrieved | 8 November 2026 |

**Sheet `MYE2 - Persons`.** Rows 0 to 6 are titles and feedback links. Row 7 is the header: `Code`, `Name`, `Geography`, `All ages`, then `0` to `89` and `90 and over`. The age labels are **text**, not numbers, so parse them as strings. There are 333 English rows (9-character codes starting with E): 164 non-metropolitan districts, 63 unitaries, 36 metropolitan districts, 33 London boroughs, 21 counties, 9 regions, 6 metropolitan counties and England. Every row's single years sum exactly to `All ages`.

**The age bands used:** under 18 is 0 to 17; working age is 18 to 64; older people are 65 to 89 plus `90 and over`; adults are 18 and over. They match the RA adult social care line labels ("adults (18–64)", "older people (65+)"). The reference date is mid-2025. The RA figures are 2026/27 budgets. The two are not the same year: say so next to every ratio, and use no other edition.

## 2. Geography

All 317 RA councils (296 billing plus 21 counties) have a row in MYE2 by code except two.

| Council | RA 2026/27 and Table 10 code | ONS mid-2025 code |
|---|---|---|
| Barnsley | E08000038 | E08000016 |
| Sheffield | E08000039 | E08000019 |

ONS's December 2024 local authority boundaries (Open Geography Portal, `LAD_DEC_2024_UK_NC`, queried 8 November 2026) still list E08000016 and E08000019. A new code means the boundary between the two councils changed after December 2024. The date and the size of the change were not confirmed here. **Decision:** no per-resident figure for Barnsley or Sheffield. Their pages say the population estimate and the budget return use different boundary codes, and that the site does not join them. No name-based join.

## 3. Which councils get ratios

Ratios are given only for social care authorities, defined by RA class: SC (county), UA, MD and LB, which includes the City of London and the Isles of Scilly. **Never** decide this by a non-zero value. 30 shire districts print small adult or children's social care amounts in the RA (for example North Hertfordshire 961, Epsom & Ewell 727 and Surrey Heath 695, in £ thousand). Adur prints -67 for adult social care, and Waverley prints -15 for children's social care. Those figures stay in the game's tables as printed, with no ratio.

| | Councils |
|---|---|
| Social care authorities (SC, UA, MD, LB) | 153 |
| No 2026/27 return (Coventry, Cumberland, Dudley, Greenwich, South Gloucestershire) | 5 |
| Boundary code mismatch (Barnsley, Sheffield) | 2 |
| **Councils with ratios** | **146** |

On a district's budget page, the county's ratios appear under the county heading, using the ONS county row (all 21 counties have one).

## 4. The ratios

Every ratio is a calculation: an RA figure in £ thousand × 1,000, divided by an ONS count. Both editions are named beside it.

| Ratio | RA numerator | ONS denominator |
|---|---|---|
| Adult social care per adult | line 360 `asctot` | 18 and over |
| Adult social care attributed to working-age adults, per resident aged 18 to 64 | lines 332, 334, 336, 340, 344 (`ascphyadl`, `ascsnsadl`, `ascmmradl`, `asclrnadl`, `ascmntadl`) | 18 to 64 |
| Adult social care attributed to older people, per resident aged 65 and over | lines 333, 335, 337, 341, 345 (`ascphyold`, `ascsnsold`, `ascmmrold`, `asclrnold`, `ascmntold`) | 65 and over |
| Adult social care not attributed by age (amount and share of line 360) | line 360 less the ten lines above: social support, assistive equipment, assessment and safeguarding, information and early intervention, commissioning | none: an amount and a share, no ratio |
| Children's social care per child | line 330 `csctot` | under 18 |

The part not attributed by age is large and varies: from 0 per cent of line 360 to 100 per cent, with a median of 18 per cent among councils with adult social care above £1m. That is why the two age ratios must always appear beside it, and why they never add up to the adult ratio. Show values to the nearest pound. The page must say which lines feed each ratio.

**Small populations.** The City of London has 667 residents under 18 and 1,441 aged 65 and over. The Isles of Scilly has 341 and 616. Their ratios are arithmetic on very small denominators. Print them with a note to that effect and no other comment.

### Anchor values (ratios unrounded, to 2 decimal places)

| | Birmingham E08000025 | Westminster E09000033 | Lancashire E10000017 |
|---|---|---|---|
| ONS 18 and over | 894,082 | 185,163 | 1,048,053 |
| ONS 18 to 64 | 737,841 | 157,520 | 768,005 |
| ONS 65 and over | 156,241 | 27,643 | 280,048 |
| ONS under 18 | 282,878 | 27,204 | 260,514 |
| RA working-age lines (£k) | 256,855 | 32,384 | 255,061 |
| RA older people lines (£k) | 178,702 | 60,945 | 259,412 |
| RA not attributed by age (£k) | 137,585 | 20,510 | 168,653 |
| Adult social care per adult | £641.04 | £614.80 | £651.80 |
| Working-age lines per resident 18 to 64 | £348.12 | £205.59 | £332.11 |
| Older people lines per resident 65 and over | £1,143.76 | £2,204.72 | £926.31 |
| Children's social care per child | £1,449.70 | £2,038.12 | £1,248.36 |

Burnley (a district) gets no ratio of its own. Its budget page shows Lancashire's under the county heading.

## 5. Rules

- No ranking, no league table and no "above or below average". An England figure is not computed: the RA England row includes MHCLG's estimates for authorities with no return.
- No claim about need, efficiency or value. A ratio is a budget divided by a head count.
- Every ratio carries both editions and the year mismatch sentence.
- Unknown is blank, with the reason, never zero.
