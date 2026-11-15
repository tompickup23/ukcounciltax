# Towns: full Band D by parish and unparished area | source notes

Written 15 November 2026 in Claude Code (Opus), branch `feat/towns-data`, from `origin/main` `6091845`. **Binding** for the town league table pages (session 5 in `docs/PROMPTS-2026-11-15-W1-W3-AND-TOWNS.md`). Every count below is read from `data/towns/england-2026-27.json` as written by `scripts/import-towns.mjs`; `tests/towns.test.ts` holds the anchors.

## 1. Tom's decisions, 15 November 2026

- **T1, departure from A4.** Full Band D for parish and unparished areas is put in order across England and within region, county, council and constituency. This supersedes the line "No ranking of parishes, and no ranking of billing areas by parish figures" in `docs/A4-RANKINGS-PARISHES-SOURCE-NOTES.md` **for the towns routes only**; every other A4 rule stands. The locality bill is the same system, year and basis everywhere, so the comparison is compatible.
- **T2, wording.** Visible copy says "lowest" and "highest". "Cheapest" and "most expensive" are allowed in the page title, meta description and one H2 on the towns pages only, with `tests/rankings-pages.test.ts` widened for those routes alone. Chart titles stay neutral.
- **T3, larger places.** A "larger places" filter at a published tax base of 2,000 Band D equivalents or more, labelled as a tax base, never as population. Field `largerPlace`.
- **T4, special expense councils.** Shown as "Published by the council only" and left out of the order until a council's own schedule is held in `data/towns/schedules/`.
- **T5, constituency pages.** One page per English constituency that contains a parish or unparished area, listing every area that touches it, split areas flagged and never apportioned.

## 2. Sources

| Use | Publisher, title | Table or sheet | Edition, retrieved | File, sha256 |
|---|---|---|---|---|
| Parish Band D, tax base, previous year | MHCLG, Council Tax statistics for town and parish councils in England: 2026 to 2027 | Parish_Level_Data, Notes | retrieved 5 October 2026 | `parishes-2026-27.ods`, `abd04daef51e2e6f469046cdcf8ecd92d6015bfe3e893231ae3e9ea21b278f51` (via `data/national/england.json`) |
| Council Band D excluding local precepts (line 9), major precepts (line 16), tax base (line 7), special expenses (line 1a) | MHCLG, Council tax levels set by local authorities in England 2026 to 2027: Table 10 | Data_Billing, Precepting_Bodies | retrieved 5 October 2026 | `table-10-2026-27.ods`, `b5b8345743fb722e48699243d1654a3e35b96c89a14c6eb26888035c3e38feb0` |
| Region, class, county corroboration | MHCLG, Council Tax levels 2026 to 2027, Tables 1 to 9 | as imported | as imported | `data/council-tax/england-2026-27.json` |
| Parish to ward | ONS Open Geography Portal, Parish to Ward to Local Authority District (December 2025) Lookup in EW | item 477863005ec54371aa300966fbc5943e | December 2025; retrieved 15 November 2026 | `ons/PAR25_WD25_LAD25_EW_LU.csv`, `723c7c67fc60866a0281dce06179152a2f20c5221f353b4d9bec0b6677260d2d` |
| Ward to constituency | ONS Open Geography Portal, Ward to Westminster Parliamentary Constituency to LAD to CTYUA (May 2025) Lookup in the UK | item ac27c7721e664440adcc9e862505c8bc | May 2025 wards, July 2024 constituencies; retrieved 15 November 2026 | `ons/WD25_PCON24_LAD25_CTYUA25_UK_LU.csv`, `0e67328dc8b77295d5042dfbdc82f598550454455db6b02a398a70a5b7da72c4` |
| District to county | ONS Open Geography Portal, Local Authority District to County (December 2024) Lookup in EN | item 7b21cc353fe940e9b0e05442830939ab | December 2024; retrieved 15 November 2026 | `ons/LAD24_CTY24_EN_LU.csv`, `4c78c9a95f2bcb08dc5a54c97c955360dbffd1530f2a4a047cc9feeca497f63b` |
| Constituency slugs | UK Places registry (estate), `src/data/registry/constituencies.json` | slug, name, pcon24cd only | commit 5204fb8, 27 September 2026; copied 15 November 2026 | `data/towns/constituencies.json` |
| Durham bills | Durham County Council, Council Tax bands and how much you pay | Total Council Tax by town/parish area | retrieved 15 November 2026 | `durham-2026-27.html`, `9701bd46b485c22a206b87616b4519204454459a27f4b56dc8ed07b225b8dc9b` |
| City of London bills | City of London Corporation, Council tax bands and charges | 2026/2027 council tax amounts | retrieved 15 November 2026 | `city-of-london-2026-27.html`, `5c33197fafd8440d165cb2255ec618180f8e513c3ac0b5d04ef5a913da766c79` |

The ONS files are the portal's own CSV downloads (`/api/download/v1/items/<id>/csv?layers=0`), not REST query exports. Licence: Open Government Licence v3.0; "Source: Office for National Statistics licensed under the Open Government Licence v3.0. Contains OS data © Crown copyright and database right 2025." Raw files sit under `data/raw/` (not committed, as for every importer here); `data/towns/sources.json` and each schedule JSON pin them by hash, and the importer fails if a hash changes. Constituency names are printed as ONS gives them; UK Places differs in letter case only for Bridlington and the Wolds and for South Holland and the Deepings, recorded in the dataset's sources block.

## 3. Rules

1. **Full Band D** = Table 10 line 9 (`ownExcludingParishPence`) + parish Band D + county or GLA, police, fire and combined authority Band D (Table 10 line 16), where the council's special expenses (line 1a) are 0, the row is a precepting or non precepting parish ("Precepting Parish" normalised) or a group row with a tax base above 0, and the 2026/27 status is published. Status `calculated`, labelled "Calculated from published MHCLG figures".
2. **Group members with no tax base** (MHCLG note f) take the carrying row's parish Band D only when the "(grouped with ...)" text resolves to exactly one row with a tax base in the same council (status `calculated-group-member`, field `groupCarrier`). Resolution tries, in order: the one row whose bracket names the member; the one row named in the member's text (a longer name wins over a name it contains); the one row whose name contains the member's name. Otherwise status `group-member-unresolved`, no figure, listed under its group (`groupLabel` holds the bracket text where there is one). 207 of the 375 members resolve; members in special expense councils then take that status instead.
3. **Unparished area**, one row per council whose Table 10 tax base exceeds the sum of its parish tax bases (charter trustees and Temples left out of the sum) by more than 1 Band D equivalent. The 99 councils within 1 are fully parished; the gap there is rounding (MHCLG note a). Figure = line 9 + majors, tax base marked `calculated`. Where one charter trustee's tax base equals the unparished tax base (Bath, Carlisle in Cumberland, Margate in Thanet), its Band D is added and the trustee row is `charter-trustees-included`. Mansfield and Bassetlaw (partial cover): no figure, status `partial-charter-trustee-cover`.
4. **Special expense councils**: 48 with parishes (49 in all; Camden has none). No figure from national tables, status `special-expenses`, "Published by the council only", unless `data/towns/schedules/<slug>-2026-27.json` exists for the council, when the council's own figure is used (status `council-schedule`). Never line 9 less the special expense average.
5. **Rounding.** Parish Band D amounts are as reported and billed (MHCLG note h), so a figure may differ by 1p from precept divided by tax base. Used as published, stated in note `rounding`, not corrected.
6. **Negative precept.** East Lindsey, Beesby with Saleby, parish part minus £2.64 (MHCLG note i), full Band D £2,180.13, shown as published.
7. **Slugs and labels** are place plus council (`padiham-burnley`); unparished rows are `<council>-unparished-area`. Two North Yorkshire Borrowby rows carry their former district (`borrowby-hambleton-north-yorkshire`, `borrowby-scarborough-north-yorkshire`).
8. **County** is the ONS December 2024 county for shire and metropolitan districts (it agrees with MHCLG's area for every one held), the unitary itself for unitaries, and Greater London for London boroughs, because ONS and MHCLG differ on Inner or Outer London for some boroughs. Barnsley and Sheffield (E08000038, E08000039) are not in the ONS file; their county is MHCLG's area, South Yorkshire.
9. **Change.** `parishChangePence` is the parish part change from the same row of the parish return. The full bill change is "Not comparable": 2025/26 Table 10 components are not held.

## 4. Two departures from the research, each proved against a primary source

- **Durham** (rule 3 said: no figure). Durham County Council publishes every area's total, starring those that include the City of Durham charter trustees. All 126 printed areas equal line 9 + parish + majors, plus the trustees' £2.70 exactly where starred: no difference of even 1p. The page prints no year; its Band D county precept (£2,071.11) equals Table 10 2026/27 line 9, so it is the 2026/27 schedule. Durham's rows use the council's figures; Peterlee is £2,948.01 either way. The unparished area has two rows: "Unparished Areas" £2,499.97 and "Unparished Areas in the former City of Durham Area" £2,502.67; their tax bases are not published separately.
- **City of London** (rule 3 said: Temples no figure; the formula gives the rest of the City £1,288.76). The City prints £1,329.56 at Band D for the Inner Temple, the Middle Temple and the City excluding the Temples, equal to its Table 9 area Band D. So the plain formula is wrong in the City by £40.80, the Temple precepts spread over the whole City tax base. All three rows use the council's figure.

Both schedules are written by `scripts/import-towns-schedules.mjs`, which checks the arithmetic and year. Session 3 adds the special expense councils in the same shape.

## 5. Counts (data/towns/england-2026-27.json)

10,439 rows: 10,241 published parish return rows plus 198 unparished areas. 7,539 have a figure; 2,900 do not.

| Status | Rows | Figure |
|---|---|---|
| Calculated from published MHCLG figures | 7,244 | yes |
| Calculated, group member | 161 | yes |
| Published by the council (Durham, City of London) | 134 | yes |
| Published by the council only (special expenses) | 2,721 | no |
| Listed under its group | 170 | no |
| Charter trustees included in the areas they cover | 4 | no |
| Partial charter trustee cover | 5 | no |

Kinds: 9,572 parish, 654 group, 198 unparished, 13 charter trustees, 2 Temples. Special expense rows by kind: 2,616 parish, 70 group, 29 unparished, 6 charter trustees. Larger places (T3): 1,389, of which 1,009 have a figure. 247 councils have at least one row with a figure; 9 regions; 91 county values.

**Name matching** (published rows, 10,241): exact 9,208; exact after removing brackets 575; combined unit 78; reviewed override 181 (`data/towns/overrides.json`, each with its evidence); unmatched 184; charter trustees 13 and Temples 2 have no ONS parish code. So 9,861 match automatically (96.3%) and 10,042 (98.1%) with the reviewed overrides. Melmerby (North Yorkshire) is rejected: one return row, two ONS parishes, no held source says which.

**Constituency**: 10,042 parish rows and 195 of 198 unparished rows have at least one constituency; 541 English constituencies appear. 869 parish rows touch wards in more than one constituency and list all of them (`constituencySplit`). Unparished rows take the constituencies of the council's wards that contain no parish; partly parished wards are not counted, so their lists may be incomplete (note `constituencyUnparished`).

## 6. Anchors (tests/towns.test.ts)

| Row | Full Band D | Check |
|---|---|---|
| E2333P007 Padiham, Burnley | £2,584.38 | council notice "TOTAL 1,722.91 2,010.07 2,297.22 2,584.38" |
| Burnley unparished area | £2,540.32 | council notice "OTHER PARTS OF THE BOROUGH" |
| E0801P006 Bodmin, Cornwall | £2,779.46 | Cornwall notice |
| E0801P035 Falmouth, Cornwall | £2,877.71 | Cornwall notice |
| E1302P090 Peterlee, County Durham | £2,948.01 | highest with a figure; Durham's schedule |
| Rushcliffe and Chorley rows | none | special expenses |
| Wandsworth unparished area | £1,028.21 | lowest with a figure; equals its Table 9 area Band D |

Lowest parish rows: Inner and Middle Temple £1,329.56 (City of London), then Doncaster: Marr £2,124.95, Cadeby £2,130.97, Hampole £2,134.71. Highest: Peterlee £2,948.01, Dorset Sturminster Newton £2,928.95, Wareham Town £2,925.41, Durham Horden £2,912.29, Dorset Sherborne £2,903.16. Every wholly unparished council's row equals its published area Band D (test). Positions: standard competition ranking; the largest tie is 132 rows at one figure.

## 7. Left out, and why

- Ceased rows (4, status not existing in 2026/27).
- 2,721 special expense rows until session 3's schedules: national tables cannot give their bills.
- 170 group members whose group cannot be resolved to one carrying row.
- Mansfield and Bassetlaw unparished areas and their 3 trustee rows: partial charter trustee cover.
- 184 rows have no constituency because the name does not match an ONS parish (for example Quorndon, Haworth with Stanbury, the 2026 Bournemouth, Broadstone and Poole town councils, which postdate the December 2025 lookup). They keep their figure and appear on region, county and council lists.
- Output area best fit (the research's second lookup) is not used: "mainly in" needs population weighting the files do not give.

## 8. What session 5 needs to know

- Load through `src/lib/towns.ts`: `towns`, `rankTowns`, `filterTowns({region, county, councilGss, constituency, largerPlaces})`, `extremes(rows, n)`, `countTowns`, `townRegions`, `townCounties`, `townCouncils`, `townConstituencies`, `statusLabel`, `noteText`. Rows restore `place`, `label`, full `parts` and constituency names from the compact JSON.
- England's lowest figures are London boroughs' unparished areas (Wandsworth, the City, Hammersmith and Fulham). The hub's pair and copy should say "parish and unparished areas", or show the lowest parish area beside it.
- Every row has a stable `code` for anchors (unparished rows `<MHCLG authority code>U`, Durham `E1302U1` and `E1302U2`).
- The worked example for the "How this is calculated" drawer: Padiham, £351.44 + £44.06 + £1,801.75 + £292.40 + £94.73 = £2,584.38.
