# Budget game | source notes (phase 0)

Done in Claude Code on 8 November 2026, before the Codex build. These notes are phase 0 of `docs/PLAN-2026-11-08-BUDGET-GAME.md`. They settle the source, the measure and the design choices that depend on the data. The figures here come from the workbooks themselves (read with pandas and odfpy in a scratch directory) and from the GOV.UK release text, which was fetched through the GOV.UK content API. Nothing here is published yet.

## 1. The edition

| | |
|---|---|
| Publisher | Ministry of Housing, Communities and Local Government |
| Release | Local authority revenue expenditure and financing England: 2026 to 2027 budget individual local authority data |
| Page | https://www.gov.uk/government/statistics/local-authority-revenue-expenditure-and-financing-england-2026-to-2027-budget-individual-local-authority-data |
| Published | 11 June 2026, 09:30 BST. Change history: "First published." Never revised. |
| Licence | Open Government Licence v3.0 |
| Retrieved | 8 November 2026 |

| File | URL | Bytes | sha256 |
|---|---|---|---|
| `RA_2026-27_data_Part_1.ods` | https://assets.publishing.service.gov.uk/media/6a2962166d178a6fb7e32089/RA_2026-27_data_Part_1.ods | 508,696 | `3ea4d4c2218bc9f49bbf59a6fc82481acb6a3494d5b0f4e114cdb945730653db` |
| `RA_2026-27_data_Part_2.ods` | https://assets.publishing.service.gov.uk/media/6a281185e371d9d2c0052b0a/RA_2026-27_data_Part_2.ods | 233,292 | `55c34505c69513fcba446f3484061d2bd115c4ce06bb5bafba7b36e330be4d65` |
| `SG_2026-27.ods` | https://assets.publishing.service.gov.uk/media/6a28119b6d178a6fb7e31f7f/SG_2026-27.ods | 118,283 | `6150792dcea97ca58b912a5fbf9fdc99562ba782fb7d6f5c8885e6ca1a17e3b5` |

The national release is "Local authority revenue expenditure and financing: 2026-27 budget, England" (https://www.gov.uk/government/statistics/local-authority-revenue-expenditure-and-financing-england-2026-to-2027-budget). It was published on 11 June 2026, and on 25 June 2026 its change note reads "Correcting Table 3 and 4 description." The individual authority files were not changed.

### The register's claims, checked

- **406 of 415 authorities: confirmed.** The release says: "This publication is based on returns from 406 out of 415 (98%) local authorities in England."
- **£151.3bn revenue expenditure: confirmed.** The release says: "Total Revenue Expenditure by local authorities in England is budgeted to be £151.3 billion in 2026-27".
- **£46.8bn council tax requirement: not found** in the release text. Do not quote it.

## 2. The nine councils with no return

MHCLG says: "Nine authorities have not submitted data: Guildford, South Gloucestershire, Castle Point, Cumberland, Epping Forest, Warwick, Coventry, Dudley and Greenwich." All nine are billing authorities with a page on this site. In the workbook, every one of their cells is `[x]` and the Notes column carries `M`. The Notes sheet defines `[x]` as "RA return not received in time for publication." The file holds no imputed council figures; only the England and class totals are estimated.

| Council | ONS code | Class |
|---|---|---|
| Castle Point | E07000069 | SD |
| Coventry | E08000026 | MD |
| Cumberland | E06000063 | UA |
| Dudley | E08000027 | MD |
| Epping Forest | E07000072 | SD |
| Greenwich | E09000011 | LB |
| Guildford | E07000209 | SD |
| South Gloucestershire | E06000025 | UA |
| Warwick | E07000222 | SD |

**Decision.** 287 of the 296 billing authorities get a game. The other nine get a `/tools/budget/<slug>/` page that says no 2026/27 return was received in time for MHCLG's publication on 11 June 2026, links to the release, and shows the Table 10 bill split only. They get no figures from any other year and no game. Each class's response rate is printed in the file: districts 160 of 164, unitaries 61 of 63, counties 21 of 21, metropolitan districts 34 of 36, London boroughs 32 of 33.

## 3. Workbook layout

**Part 1, sheet `RA_LA_Data_2026-27`** (439 rows by 210 columns). Rows 0 to 5 are the title rows. Row 2 reads "Data are reported in £ thousand." Row 6 holds the asset IDs (for example `edutot`, `ctrtot`), row 7 the section headings, row 8 the RA line numbers, and row 9 the header (`E-code`, `ONS Code`, `Local authority`, `Class`, `Subclass`, `Notes`, then the lines). Data starts at row 10. Below the authorities sits a class breakdown block: rows such as "Shire Districts" with ONS code `E07`, plus "Response rate". The ENGLAND row has code `E92000001`, and there are rows for other bodies (classes `O`, `POL`, `Fir`, `WA`, `CA`, `NPA`, `GLA`). **Keep only rows whose ONS code is nine characters and starts with E06, E07, E08, E09 or E10.** That leaves 296 billing authorities plus 21 counties, 317 in all, 308 of them with data.

**Part 2, sheet `RA_LA_Data_2026-27`** (441 by 95), with the same row scheme. It holds the reserves. pandas cannot read it as it stands: it contains ODF cells of value type `error` and raises "Unrecognized type error". **The repo's own displayed-cell reader, `scripts/lib/ods.mjs` `readOds()`, reads all three workbooks without error** (checked 8 November 2026: Part 1 in 188 ms, Part 2 in 86 ms, SG in 36 ms, with Burnley's row matching the anchors below). It returns displayed text with thousands separators (for example "19,978"), so parse values through the existing `figure()` helper.

**SG, sheet `SG_LA_Data_2026-27`** (440 by 35). Line 102 `grantindsg`, Dedicated Schools Grant (DSG); line 699 `grantintot`; line 800 `granttot`.

Cell values are integers in £ thousand. Non-numeric markers: `[x]` (1,836 cells, all in the nine missing rows) and one cell holding `-` padded with spaces, which the Notes sheet defines as "Not relevant". Store the printed integer in £ thousand together with the unit. Unknown stays null, never zero.

### Lines the game uses

| Use | Lines (asset ID) |
|---|---|
| Service totals (net current expenditure) | 190 `edutot`, 290 `transtot`, 330 `csctot`, 360 `asctot`, 390 `phtot`, 490 `housgfcftot`, 509 `cultot`, 590 `envtot`, 599 `plantot`, 601 `poltot`, 602 `frstot`, 690 `centot`, 698 `othtot` |
| Total service expenditure | 799 `servicetot` |
| Revenue expenditure | 900 `revenuetot` |
| Financing | 904 `grantinaef`, 906 `trnsreorg`, 911 `appressch`, 913 `appresdsg`, 914 `appresph`, 915 `appresoth`, 916 `appresunall`, 951 `grantrsg`, 956 `grantpol`, 970 `retainnndr`, 980 `colfunct`, 985 `othinc` |
| Council tax requirement | 990 `ctrtot` ("total of lines 900 to 985") |
| Parish precepts | 821 `parishaggprecept` |
| Reserves (Part 2), start and end of year | 1011 schools, 1012 DSG adjustment account, 1013 DSG, 1014 public health, 1015 other earmarked, 1016 unallocated (`res*_strt`, `res*_end`) |
| DSG (SG) | 102 `grantindsg` |

The service sub-lines exist for drill-down (each total is preceded by its sub-lines in the column order). Adult social care is split by support type and by age (18 to 64, 65 and over). Children's social care is split into looked-after children, safeguarding, family support, youth justice, asylum seekers, services for young people, Sure Start and other. Education is split into early years, primary, secondary, line 140 "Special schools and alternative provision", post-16, and other.

## 4. Checks run on the data (all 308 councils with data)

- **Service totals sum to line 799:** exact for every council, no mismatch beyond £2k.
- **Sub-lines sum to their totals:** two mismatches beyond £2k (one environmental total, one adult social care total), both rounding at the thousands. Report them; do not adjust them.
- **Financing identity:** line 900 plus the twelve financing lines equals line 990 for every council, exactly. Financing lines are printed as negatives and line 990 as a positive.
- **Table 10 reconciliation:** line 990 × 1,000 against `ownWithParishPence / 100 × taxBase` from `data/national/england.json` for the 287 billing authorities with data. 271 agree within 0.05 per cent and 275 within 0.5 per cent. Excluding parish precepts gives a far worse fit (80 within 0.05 per cent), which confirms that line 990 includes parish precepts.

| Council | ONS code | RA against Table 10 | MHCLG note |
|---|---|---|---|
| King's Lynn & West Norfolk | E07000146 | -26.79% | [note 4] |
| Harborough | E07000131 | -20.47% | [note 4] |
| Rugby | E07000220 | -15.60% | [note 4] |
| Colchester | E07000071 | -15.32% | [note 4] |
| Reigate & Banstead | E07000211 | -12.34% | [note 4] |
| Enfield | E09000010 | -7.30% | [note 4] |
| Gedling | E07000173 | +4.47% | none |
| Thanet | E07000114 | -4.26% | none |
| Barnet | E09000003 | -1.83% | [note 4] |
| Melton | E07000133 | +0.96% | none |
| Cheltenham | E07000078 | -0.66% | none |
| Mole Valley | E07000210 | +0.61% | none |
| Waltham Forest | E09000031 | +0.20% | none |
| Bexley | E09000004 | -0.15% | none |
| Wokingham | E06000041 | -0.13% | none |
| Isles of Scilly | E06000053 | -0.08% | none |

MHCLG's note 4 reads: "Seven authorities have provided council tax figures that materially differ from figures reported in their CTR return. No explanation for this discrepancy has been provided." The seven flagged rows are exactly the seven marked [note 4] above. Runnymede and Windsor & Maidenhead carry note 8 (a collection fund deficit entered as a positive figure) and still reconcile.

**Test policy.** Commit the 16 rows above as a reviewed fixture. The test fails if any other council falls outside 0.05 per cent, or if a listed council's difference moves by more than 0.01 percentage points. Pages for the seven [note 4] councils quote MHCLG's note beside the council tax figure. Neither source is ever adjusted.

- **Counties:** the 21 county codes in Table 10's county parts all match an RA row of class SC, and every county has at least one district.

### Anchor values (£ thousand, as printed)

| | Burnley E07000117 | Birmingham E08000025 | Westminster E09000033 | Lancashire E10000017 |
|---|---|---|---|---|
| Total service expenditure (799) | 17,246 | 2,700,482 | 552,973 | 2,759,432 |
| Revenue expenditure (900) | 25,831 | 2,970,775 | 525,414 | 2,826,392 |
| Council tax requirement (990) | 8,832 | 560,016 | 83,475 | 717,078 |
| Education (190) | 0 | 1,117,292 | 147,311 | 1,409,030 |
| of which special schools and AP (140) | 0 | 268,053 | 7,946 | 221,200 |
| Adult social care (360) | 2 | 573,142 | 113,839 | 683,126 |
| Children's social care (330) | 0 | 410,088 | 55,445 | 325,214 |
| Highways and transport (290) | -343 | 161,402 | -63,028 | 57,581 |
| DSG, SG line 102 | 0 | 884,812 | 116,704 | 1,174,566 |
| Other earmarked reserves, start to end (1015) | 19,978 to 17,829 | 574,278 to 531,445 | 255,423 to 235,416 | 245,022 to 229,961 |
| Unallocated reserves, start to end (1016) | 1,379 to 1,379 | 156,722 to 157,323 | 59,671 to 49,831 | 66,250 to 66,250 |

Burnley's other values: culture 5,287; environment 5,681; central 4,809; housing 2,236; planning -426; parish precepts 222; RSG -6,908; retained business rates -4,787; specific grants inside AEF -3,150; other earmarked reserves appropriation -2,149; collection fund -5.

## 5. Design decisions that follow from the data

1. **Measure.** Net current expenditure by service, from RA lines 190 to 698. Total service expenditure is line 799. Every page names the measure and says it is net of sales, fees and charges (note 1) and excludes NHS-funded spending such as the Better Care Fund (note 2).
2. **Groups.** Use MHCLG's own service headings as printed, not a custom mapping. Drop any heading that is zero for that council. Police and fire are zero for most councils but not all: fire and rescue is a county service in Cornwall, Gloucestershire, Hertfordshire, Isles of Scilly, Lincolnshire, Norfolk, Northumberland, Oxfordshire, Suffolk, Surrey, Warwickshire and West Sussex, and the City of London carries police services (227,848). Keep those headings wherever they are non-zero. This removes a judgement call and keeps every label traceable to the return.
3. **Negative service totals.** 150 of the 308 councils with data have at least one negative service total. Most are highways and transport (132 councils, mostly parking income); the rest are other services (19), planning (14), culture (9), housing (4), central (2), adult social care (1) and children's social care (1). A negative total cannot take part in a "share 100p" round. Such totals appear in the table as printed, with "net income" in words, and are left out of the guess round. The round's shares are of the sum of the positive service totals, and the page says so.
4. **Education and DSG.** Education is shown as printed, with the council's DSG from SG line 102 stated beside it as an observed figure: "Most schools spending is paid for by the Dedicated Schools Grant, a ring-fenced government grant: £X in 2026/27." No subtraction. In Lancashire, education is 51 per cent of service spending.
5. **SEND.** The return has no SEND line. Line 140, "Special schools and alternative provision", is shown under its printed name. The page says that SEND spending also sits in other education and transport lines, and that the return does not total it.
6. **The receipt is dropped from this build.** A pro rata receipt that splits a resident's Band D across services needs an apportionment assumption, and education and public health are largely funded by ring-fenced grants. That belongs to register row I006 and its own review. The "your bill" round uses the Table 10 parts only.
7. **Reserves round.** Only the non-ringfenced reserves, which the release defines as "unallocated reserves and other earmarked reserves" (lines 1015 and 1016), at the start and end of the year. The question: does the council plan to draw on these reserves in 2026/27 or add to them, and by about how much? Of the 308 councils with data, 193 plan to draw, 99 to add and 16 neither. Show the release's caveat: "It is not possible to identify usable revenue reserves in the current release." Leave out the schools, DSG and DSG adjustment account reserves; the DSG adjustment account can be negative (Lancashire starts at -97,366). Part 2 notes 1, 2 and 4 warn about how these are recorded. No ratio of reserves to spending.
8. **Funding round.** Revenue expenditure (line 900) split into: specific grants inside AEF (904); Revenue Support Grant (951); retained business rates (970); council tax (990); use of or addition to reserves (911 to 916 together); and other items (906, 956, 980, 985 together). Show them as positive amounts, using the identity in section 4. Note 7 (business rates changes for 2026/27) applies to any comparison with an earlier year, and the game makes none.
9. **No other year.** The 2025/26 outturn individual authority data (published 17 September 2026) is a different measure and is not used. Budget and outturn are never mixed on a page.

## 6. Not checked here

- Which cells in Part 2 carry the error type, and what they display through `readOds()`. Add a test that they come through as null or as their displayed marker, never as zero.
- The release's revision policy wording, beyond the change history read above.
- Any per-council page wording. That is phase 2 of the plan.
