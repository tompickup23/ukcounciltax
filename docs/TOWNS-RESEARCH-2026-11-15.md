# Town league table research | 15 November 2026

Four read only research agents, run in Claude Code (Opus) on 15 November 2026 on branch `feat/town-league-table`, at main `b5f8ced`. Their reports are kept below as returned, with dashes replaced by commas and headings demoted. Scratch scripts and the ONS exports were under `output/town-research/` in the main checkout; the scripts and the match file are copied to `docs/towns-research/`. These reports are research, not published figures: every figure must be rebuilt by the importer from held raw files before it appears on a page.

## Part 1. Is the full Band D formula exact?

TOWN/PARISH FULL BAND D: IS THE FORMULA EXACT? (England, 2026-27)

Scratch work is in /Users/tompickup/ukcounciltax/output/town-research/:
- compute.py writes rows.json (10,241 rows)
- cmp.py, burnley.py, rush.py, chor.py, corn.py, analyse.py
- downloads/{rushcliffe,chorley,westminster,cornwall,durham}/

Nothing under src/ or tests/ was touched. Nothing was committed.

FORMULA TESTED
full = components.ownExcludingParishPence + parish bandDPence + the sum of parts[] (county/GLA, police, fire, combined).

A correction to the brief: the component figures come from Table 10 (Data_Billing), line 9, not Table 8.

VERDICT
- **Councils with no special expenses:** the formula is exact to the penny, apart from rare 1p rounding in the parish Band D that MHCLG reports. Note h says those figures are "as billed".
- **The 48 special-expense councils that have parishes:** the formula is wrong for every row, whether parished or unparished.

1. ROW COUNTS (status published, 10,241 rows; 4 rows are not-existing)
- Precepting parish: 8,611, plus 1 row typed "Precepting Parish" (capital P; it needs normalising)
- Non-precepting parish: 960
- Group: 654 rows across 35 councils
- Charter Trustee: 13
- Temple: 2

Groups (note f: "individual parishes that have been grouped for precepting purposes"):
- 375 group members have bandD 0 and taxBase 0. One carrying member holds the whole group's precept and tax base, e.g. Amber Valley "Ashleyhay (grouped with Idridgehay and Alton)" 0/0 against "Idridgehay and Alton (grouped with Ashleyhay)" 29.04 / 255.69.
- So for a zero-tax-base member, own+0+majors is wrong. Those residents pay the group's Band D.
- Only 202 of the 375 can be matched to exactly one carrying row from the "(grouped with X)" text. 173 cannot, e.g. Herefordshire "Bridge Sollars (grouped with BISHOPSTONE Byford ...)", and some Dorset or Hampshire group names have no "grouped with" text at all.
- Two members have bandD 0 but a positive tax base: Shropshire Lydham, Stockton Aislaby.
- Rule: a zero-tax-base group member takes the carrying row's Band D only when it resolves to one row. Otherwise drop it from the league table, or show it as part of "<carrying parish> group".

Charter trustees: these are local precepts on unparished towns. In 7 councils the trustee's tax base equals the council's unparished tax base exactly:
- Bath 34,552.77
- Carlisle 20,735.29
- Margate 14,003.75
- High Wycombe 24,648.77 (against 24,648.72)
- Scunthorpe 17,199.6
- Grimsby + Cleethorpes 32,947.08
- Chester + Ellesmere Port 44,032.8 (against 44,481.1)

Unparished residents there pay own + trustee + majors, not own + majors. Exceptions:
- Durham: the trustees overlap parishes (notes b and g: 24,500 Band D equivalents are charged by both). City of Durham parish areas pay parish + 2.70. The unparished remainder is split.
- Mansfield (16,070 of 27,895) and Bassetlaw (Retford + Worksop 20,828.52 of 20,828.52) also need care.
- Mansfield and Scunthorpe trustees have Band D 0 in 2026-27.
- BCP trustees ceased (note j).

Temples (City of London, Inner and Middle Temple at 2,038.90 each, tax base 117 and 91): the formula gives £3,327.66, which is implausible. I found no City document to verify it, so exclude them with a note.

Internal check: for all 214 councils with parishes, line 8 = line 9 + (sum of parish precepts / line 7 tax base) to within 2p. Parish Band D figures are therefore consistent with Table 10.

2. CHECKS AGAINST COUNCILS' OWN PUBLISHED SCHEDULES (penny by penny)

**(a) Burnley** (data/local-bills/burnley-2026-27.json; data/raw/burnley-2026-27.txt; no special expenses)
- All 8 parishes exact. Padiham raw text: "TOTAL 1,722.91 2,010.07 2,297.22 2,584.38", formula 258438.
- Unparished: "TOTAL, OTHER PARTS OF THE BOROUGH ... 2,540.32" = 351.44 + 2,188.88 exactly.

**(b) Cornwall** (unitary, no special expenses, fully parished)
- Source: "Notice of Council Tax for 2026-27", https://www.cornwall.gov.uk/media/44lak3cj/cor4959_wmn_260226_council-tax.pdf (sha256 32679732…). Raw line: "Bodmin 1,852.97 2,161.80 2,470.63 2,779.46".
- Matched 199 parishes: 198 exact, 1 differs by 1p (Lanhydrock: local 2,426.86, formula 2,426.87, a parish Band D rounding issue).
- Unmatched rows are spelling differences ("St." against "St", Botusfleming and similar), not figure differences.

**(c) Rushcliffe** (special expenses £1,069,300)
- Source: https://www.rushcliffe.gov.uk/council-tax/how-much-will-i-pay/council-tax-band-charges-202627 (sha256 a3ca75c8…).
- 0 of 55 exact. 53 rows are off by exactly -2,205p, which is the special expenses average: 1,069,300 / 48,486.3 = £22.05.
- Keyworth is off by -18.70 and Ruddington by -18.65, because they carry their own special expenses of £3.35 and £3.40.
- Raw example: "Clipston £1,696.81 … £2,545.21" against formula £2,567.26. So 2,545.21 = 161.77 basic + 2,383.44 majors.
- West Bridgford is the unparished special-expense area: "£2,612.61" = 161.77 + 67.40 + 2,383.44. Own + majors would give 2,567.26.

**(d) Chorley** (special expenses £901,145, varying by parish)
- Source: https://chorley.gov.uk/council-tax/council-tax-charges-2026-2027 (sha256 e5bd6ef9…).
- 0 of 23 exact. Differences run from -23.15 to +22.67 (Adlington -17.27, Astley Village +9.81, Clayton le Woods +22.67).
- The basic amount implied by Anglezarke (no parish precept) is 2,381.73, 2,188.88 = 192.85.
- "All other parts of the council's area £2,414.10": the formula gives 2,404.87.
- The council's own page shows the average including special expenses: "Chorley Council | 9% | £215.99".
- The source page has an error: Bretherton Band D reads "£2,224.72", but its Band A of £1,628.48 × 9/6 = £2,442.72. Hoghton is off by 30p on the same test. Do not ingest that page uncritically.

**(e) Westminster** (GLA area, special expenses £62,400, Queen's Park the only London parish)
- Source: https://www.westminster.gov.uk/council-tax/council-tax-bands-and-charges (sha256 d04862ab…). Raw row: "D | £68,001 to £88,000 | £1,100.16 | £52.31 | £537.34 | £510.51".
- Formula: 537.74 + 52.31 + 510.51 = 1,100.56, so it is 40p too high. The 40p is 62,400 / 154,862.86.
- Montpelier Square, a special-expense area, is charged "£1,598.70" with an "MP precept £550.85". Westminster's basic amount is 537.34, not the 537.74 in Table 10.

**(f) Durham** (unitary with charter trustee): I could not get its 2026-27 schedule. The public notice page is rendered by JavaScript and the setting report was not found, so this is still unchecked.

3. WHAT SPECIAL EXPENSES DO
- Table 10 line 3 is "Council Tax Requirement ... (including special expenses ... but excluding local precepts)". Line 9 (ownExcludingParishPence) is "Average ... council tax (including Adult Social Care precept and excluding local precepts)", meaning line 3 divided by line 7.
- So line 9 spreads the special expenses (line 1a) across the whole council. Residents actually pay a lower basic amount plus the special expense for their own area, which may be zero.
- Proven by Rushcliffe (-22.05 everywhere), Westminster (-0.40) and Chorley (varying amounts).
- Deriving the basic amount as line 9, 1a/line 7 matches Rushcliffe (161.77) and Westminster (537.34) but misses Chorley by 13p (192.98 against 192.85). Even when it matches, no national table says which parishes carry which special expense.
- No official national table gives per-parish special expenses or per-parish totals. The parish table carries parish precepts only; Table 10 carries the 1a aggregate only.
- Under the "never derive" rule, the right treatment is: exclude rows in special-expense councils from the national ranking with a labelled note ("this council charges special expenses in parts of its area; per-area totals are published only by the council"), until a council's own schedule is imported as a local bill (as Burnley is) and checked.
- Affected: 48 councils with parishes (Camden has special expenses but no parishes), covering 2,700 rows (2,379 precepting, 237 non-precepting, 78 group, 6 charter trustee). That is 26% of rows.
- The 49 councils with specialExpensesPounds > 0: Bedford, Boston, Breckland, Brighton and Hove, Broadland, Broxtowe, Buckinghamshire, Camden, Charnwood, Chelmsford, Cheshire West and Chester, Chorley, East Riding of Yorkshire, East Staffordshire, Eastleigh, Folkestone and Hythe, Forest of Dean, Fylde, Harborough, Hertsmere, Horsham, Kings Lynn and West Norfolk, Lewes, Melton, North East Lincolnshire, North Kesteven, North Lincolnshire, North Somerset, Northumberland, Oxford, Rother, Rugby, Rushcliffe, Somerset, South Gloucestershire, South Holland, South Kesteven, South Norfolk, St Albans, Telford and Wrekin, Tendring, Test Valley, Three Rivers, Tonbridge and Malling, Tunbridge Wells, West Northamptonshire, Westminster, Winchester, Windsor and Maidenhead.
- Some amounts are tiny (Northumberland £4,119, South Norfolk £7,540, Forest of Dean £8,320) but still break penny exactness. Do not make exceptions.

4. UNPARISHED AREAS
- Unparished tax base = component taxBase minus the sum of parish tax bases (excluding charter trustees and temples).
- 114 councils with parishes have an unparished share above 1%. 100 are fully parished (within 1%). None is negative. 82 councils have no parish rows at all.
- In a council with no special expenses and no charter trustee, the unparished Band D = own + majors exactly. Burnley shows 2,540.32 (unparished tax base 16,217).
- It is wrong:
 , with special expenses: Chorley 2,414.10 against 2,404.87; Rushcliffe West Bridgford 2,612.61 against 2,567.26;
 , where a charter trustee covers the area: add the trustee's Band D;
 , in Durham and Mansfield, where trustee cover is partial, so there is more than one rate.

5. DISTRIBUTION AND DATA FEATURES
- All non-trustee, non-temple rows (n 10,226): min 1,100.56 (Westminster Queen's Park, which has special expenses), median 2,454.63, max 2,948.01.
- Excluding the special-expense councils (n 7,532): min 2,124.95 (Doncaster: Marr; Fenwick and Kirk Bramwith are zero-tax-base group members, so wrong for the reason in section 1), median 2,461.70, max 2,948.01 (Durham: Peterlee).
- Next highest: Dorset Sturminster Newton 2,928.95, Wareham Town 2,925.41, Durham Horden 2,912.29, Dorset Sherborne 2,903.16.
- One negative precept: East Lindsey "Beesby with Saleby", -2.64 Band D, precept -£198, note i (rental income returned to residents). Show it as a negative figure, not as zero.
- Zero Band D: 960 non-precepting parishes, 377 group rows, 2 charter trustees. No precepting parish has zero; no non-precepting parish is non-zero.
- No duplicate names within a council. But 466 names are shared across councils (1,153 rows; "Sutton" ×12, e.g. Adlington in both Cheshire East and Chorley). Slugs and page titles need the council name, which matters for SEO and canonical URLs.

Example rows (code, council, name, own + parish + majors = formula, then status):
- E2333P007 Burnley, Padiham: 351.44 + 44.06 + 2,188.88 = 2,584.38. Verified against the council.
- E0801P006 Cornwall, Bodmin: 2,086.36 + 389.90 + 303.20 = 2,779.46. Verified.
- E0801P035 Cornwall, Falmouth: 2,086.36 + 488.15 + 303.20 = 2,877.71. Verified.
- E1302P090 Durham, Peterlee: 2,071.11 + 448.04 + 428.86 = 2,948.01. No special expenses; not externally verified, and the trustee is not involved.
- E0603P002 Cheshire East, Adlington: 1,975.95 + 77.25 + 395.53 = 2,448.73. No special expenses.
- E4402P030 Doncaster, Marr: 1,749.86 + 0 + 375.09 = 2,124.95. Non-precepting.
- E1031P016 Amber Valley, Idridgehay and Alton (group carrier): 203.77 + 29.04 + 2,116.00 = 2,348.81.
- E2532P011 East Lindsey, Beesby with Saleby: 176.67, 2.64 + 2,006.10 = 2,180.13. Negative precept.
- E3038P034 Rushcliffe, Radcliffe on Trent: formula 2,879.26 against the council's 2,857.21. Wrong because of special expenses.
- E2334P001 Chorley, Adlington: formula 2,415.17 against the council's 2,397.90. Wrong because of special expenses.
- E5022P001 Westminster, Queen's Park: formula 1,100.56 against the council's 1,100.16. Wrong because of special expenses.

RECOMMENDED RULE
1. Publish full Band D = Table 10 line 9 (ownExcludingParishPence) + parish bandDPence + sum of parts[].bandDPence only when all of these hold:
  , the billing council's specialExpensesPounds is 0;
  , the row is a Precepting or Non-precepting parish (normalise "Precepting Parish"), or a Group row with taxBase > 0;
  , status is published.
   Label it as exact to the billed penny, except for possible 1p rounding in the parish Band D as reported (MHCLG note h).
2. A zero-tax-base group member takes its carrying row's figure only when "(grouped with …)" resolves to exactly one carrying row with taxBase > 0 in the same council. Otherwise exclude it, or list it under the group.
3. Unparished area in a council with no special expenses = line 9 + majors, only if no charter trustee covers it. Where a trustee's tax base equals the unparished tax base, add the trustee's Band D. Durham, Mansfield and Bassetlaw-style partial cover: exclude, or source from the council's own schedule.
4. The 48 special-expense councils with parishes (2,700 rows) and the 2 Temples: exclude from the national ranking with a visible note. Bring them in only from each council's own published schedule, imported and hashed like the Burnley local bill. Never use line 9 minus the 1a average: it is a derivation and missed Chorley by 13p.
5. Name pages and slugs as parish + council; 466 names are shared across councils.

Still unverified: Durham's own schedule (charter trustee overlap) and any City of London Temple charge.

## Part 2. Parish to constituency lookup

REPORT: Parish to constituency and county research for the town league table (ukcounciltax, branch feat/town-league-table). Nothing in src/ or tests/ was edited. Nothing was committed.

#### Headline findings
- **No direct lookup exists.** ONS does not publish a parish to Westminster constituency (July 2024) lookup. The defensible route is a two-step chain: parish to ward (ONS), then ward to constituency (ONS, which flags split wards). The ONS output-area best-fit lookups are used only to say where most of a parish sits when the chain gives more than one constituency.
- **MHCLG parish codes are not ONS codes.** `E3831P001` is the MHCLG code: the MHCLG authority code (`E3831`) plus `P` plus a sequence number. `data/raw/parishes-2026-27.ods`, sheet `Parish_Level_Data`, has these columns: MHCLG E-code for Local Authority, ONS code for Local Authority, Local Authority, Parish Name, Region, Class, Parish Type, three 2025-26 columns, three 2026-27 columns, MHCLG Parish Code, Notes. There is **no ONS parish (E04) column**, so matching has to be by name within the council area (`gss`).

#### 1. ONS files downloaded
All files are from the ONS Open Geography Portal. Licence: Open Government Licence v3, contains OS data, Crown copyright (https://www.ons.gov.uk/methodology/geography/licences). Retrieved 2026-11-15.

Each file is in `/Users/tompickup/ukcounciltax/output/town-research/downloads/<folder>/`, with a `.source.json` beside it holding the title, item URL, service URL, row count and sha256. Item URL pattern: `https://geoportal.statistics.gov.uk/datasets/<itemId>`. Service pattern: `https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/<SERVICE>/FeatureServer/0`.

| Title | Folder | Service | Item ID | Rows | sha256 |
|---|---|---|---|---|---|
| Parishes (April 2026) Names and Codes in EW | par-apr2026-nc | PAR_APR_2026_EW_NC | b4136c1f3cbe48daa7c4efb069e88a73 | 11,342 (10,464 E04) | f890d8ea…316b |
| Parish to Ward to LAD (December 2025) Lookup in EW | par25-wd25-lad25 | PAR25_WD25_LAD25_EW_LU | 477863005ec54371aa300966fbc5943e | 13,331 | c862d7eb…0efb |
| Ward to Westminster Parliamentary Constituency to LAD to CTYUA (May 2025) Lookup in the UK | wd25-pcon24 | WD25_PCON24_LAD25_CTYUA25_UK_LU | ac27c7721e664440adcc9e862505c8bc | 8,844 | 120f8baf…9e81 |
| OA (2021) to Westminster Parliamentary Constituency (July 2024) Best Fit Lookup in EW | oa21-pcon24 | OA21_PCON25_LAD21_EW_LU | 5968b5b2c0f14dd29ba277beaae6dec3 | 188,880 | b85ad13b…76e9 |
| Output Area (2021) to PARNCP to LAD to RGN to CTRY (December 2025) Best Fit Lookup in EW | oa21-parncp25 | OA21_PARNCP25_LAD_CTYUA_RGN_CTRY_EW_LU | bd62998fdf3a4441b628bd52ba75ef8b | 188,880 | c1db6526…6c45 |
| Local Authority District to County (December 2024) Lookup in EN | lad24-cty24 | LAD24_CTY24_EN_LU | 7b21cc353fe940e9b0e05442830939ab | 233 | 2204f590…7a3a |
| Parish to Ward to LAD (December 2026) Lookup in EW | par26-wd26-lad26 | PAR26_WD26_LAD26_EW_LU | 7d4a6791cfe643f7a23f5141e1f4cc4f | 16,558 | 547ef00e…7de6 |

Notes on the files:
- The ward to constituency file has a SPLIT_WARD flag: 870 rows say "Yes" and 1 says "TRUE". 423 wards have one row per constituency.
- In the output-area to constituency file the columns are named PCON25CD/PCON25NM, but the codes are the July 2024 E14001xxx set (576 codes for England and Wales).
- The December 2026 parish to ward file was modified on 2026-11-05. It is a future-dated edition, and there is no ward-2026 to constituency file to go with it, so I did not use it.
- **Provenance caveat:** I built these CSVs by paging through the ArcGIS REST query API (script `/Users/tompickup/ukcounciltax/output/town-research/scripts/fetch_ons.py`). The hashes are for those exports, not for ONS-hosted files. For release provenance, the importer should take the portal's own CSV download for each item ID and hash that.

**How split parishes are handled:**
- The parish to ward file has one row for each ward a parish touches. 913 E04 parishes appear in more than one ward.
- The ward to constituency file has one row for each part of a split ward.
- The output-area files are best fit (an output area goes to the area holding its population-weighted centroid). Small parishes that hold no such centroid are missing from them: 869 matched parishes had no output area at all.

#### 2. Code mapping
- There is no ONS code in the MHCLG file (see headline).
- The MHCLG `gss` council codes match ONS LAD26 codes in every case except City of London (E09000001). That is the 2 Temple rows. The ward file puts all of the City in Cities of London and Westminster.

#### 3. Match results
Results are in `/Users/tompickup/ukcounciltax/output/town-research/parish-match.json` (script `/Users/tompickup/ukcounciltax/output/town-research/scripts/match2.py`). The rows needing review are in `/Users/tompickup/ukcounciltax/output/town-research/unmatched.txt`.

**Matching rules, in order:**
1. Exact match on the normalised name within the same council. Normalising means: ASCII, lower case, `&` becomes "and", hyphens and apostrophes dropped, "St." becomes "st", and "town/parish council" and "charter trustees" suffixes removed.
2. The same, after removing anything in brackets (this catches "(grouped with …)", "(Richmondshire)" and similar).
3. A combined unit: "A & B" or "Great & Little X", where every part matches a separate ONS parish.
4. A prefix match. Flagged for review.
5. A spelling match (difflib, ratio 0.88 or more). Flagged for review.

**Results for the 10,241 rows published for 2026-27:**

| Outcome | Rows |
|---|---|
| Exact | 9,212 |
| Exact after removing brackets | 576 |
| Combined unit (one MHCLG row covers several ONS parishes) | 78 |
| Prefix, needs review | 102 |
| Spelling, needs review | 50 |
| Same name twice in the council area | 31 |
| Unmatched | 190 |
| Council not in the ONS list (Temples) | 2 |

That gives 9,866 clean matches (96.3%), or 10,018 (97.8%) if the review rows are accepted.

**By type:**

| Type | Clean matches | Review | Same name twice | Unmatched |
|---|---|---|---|---|
| Precepting parish | 8,361 | 117 | 22 | 112 |
| Non-precepting parish | 917 | 9 | 8 | 26 |
| Group | 588 | 26 | 1 | 39 |
| Charter Trustee | 0 | 0 | 0 | 13 |

The 2 Temple rows sit in City of London, which has no ONS parish list (see section 2).

The matched rows cover 10,073 of the 10,464 ONS E04 parishes.

**Unmatched examples:**
- Quorndon (ONS: Quorn)
- Haworth with Stanbury
- Tattershall with Thorpe
- Staveley with Ings
- Barrow cum Denham
- Kennet Valley Joint Parish Council
- Whyteleafe Village
- Walden Stubbs
- Cheviotside
- Herefordshire long-form group rows such as "Border Group (grouped: Adforton …)" and "Kenderchurch (forms KILPECK GROUP …)"
- Canterbury non-precepting rows (Elliot College, Park Wood Courts, Howe Barracks)
- the 2026 new councils in Bournemouth, Christchurch and Poole (Bournemouth Town, Poole Town, Broadstone Town)

**Same name twice:** in North Yorkshire (E06000065) there are two each of Aislaby, Borrowby and Melmerby. The former district is needed to tell them apart, which means a hand-kept override list.

**Group rows:** most are single parishes carrying a "(grouped with …)" note. They match after the brackets are removed, and every member parish shares the group's Band D. Some ONS parishes are matched by more than one MHCLG row: Deane, Nutley and Weston Patrick appear both alone and inside the group-name rows "Oakley and Deane" etc. in Basingstoke. The importer must not double count these: rank one row per MHCLG code and do not sum by ONS code.

**Charter trustees:** none matched (13 rows). Their areas are unparished parts of towns, which have no E04 code. Durham's charter trustees also overlap parishes (MHCLG note b). Treat them as a separate class with a hand-assigned constituency, or show them without a constituency.

**Constituency result for the 9,866 clean matches (ward chain):**

| Basis | Rows | Meaning |
|---|---|---|
| Single | 8,995 | Every ward the parish touches lies in one constituency, with no split ward involved. Treat as wholly in that constituency. |
| Multi-candidate | 846 | The parish's wards lie in more than one constituency. |
| No ward lookup | 25 | The ONS code is not in the December 2025 parish to ward file (new in April 2026). |

The 846 multi-candidate rows break down further using the output-area best fit:
- 121 have output areas in more than one constituency. These genuinely span. Examples: Crich 9 output areas in E14001195 and 2 in E14001066; Rustington 49 and 2.
- 687 have all their output areas in one constituency. Most likely wholly in it, but not proven.
- 58 have no output area.

In 13 "single" rows the output-area fit disagrees (for example Tankersley, 5 output areas against 1). The ward chain should win there.

#### 4. County
- `data/council-tax/england-2026-27.json` `authorities[gss].area` matches ONS LAD24_CTY24 CTY24NM for all 164 shire districts, with no differences. For metropolitan districts it gives the metropolitan county name.
- Unitaries have `area` null and stand alone (63 of them). London boroughs have area Inner London or Outer London.
- E08000038 and E08000039 (Barnsley and Sheffield codes) are missing from the LAD24 lookup, but the data's `area` is already correct for them.
- Recommendation: take county from the data's `area` for shire districts. Cite ONS LAD24_CTY24 as corroboration, or LAD25_CTYUA25 V2 (item 3a815d3b4fa746a98390f52b1196d37d) if a CTYUA code is wanted.

#### 5. Recommended importer
**Inputs:** `parishes-2026-27.ods` (already held), plus the ONS PAR_APR_2026_EW_NC, PAR25_WD25_LAD25, WD25_PCON24_LAD25_CTYUA25 and the two output-area files. Pin each by item ID, edition and sha256 in a `.source.json`.

**Matching:** apply the rules above, plus a checked-in override CSV (`mhclgCode, par26cd[;par26cd], note`) for the roughly 375 review, same-name and unmatched rows. Fail the build if an MHCLG row has no outcome. Rows that cannot be resolved are listed with no constituency, never guessed.

**Constituency fields per row:**
- `pconBasis` is one of:
 , `wholly`: single candidate.
 , `spans`: output areas in more than one constituency. Store all constituencies and output-area counts, and label the largest "mainly in X, also part of Y" (ONS output-area best fit).
 , `candidates`: wards cross constituencies but the output-area fit puts it in one. Say "in X; ward boundaries cross into Y, so part may lie in Y". Use "mainly in" only on output-area evidence, never on ward evidence alone.
 , `unknown`.
- Do not use output-area counts as population shares unless they are weighted by Census 2021 output-area population, which is a further download.

**Constituency pages:** a parish appears on every constituency page it lists. Rank by the full parish-area Band D (`components[gss].areaPence` plus the parish's `bandDPence`).

**Slugs (for SEO and estate consistency):**
- Use UK Places `/Users/tompickup/ukplaces/src/data/registry/constituencies.json`: keyed by slug, with `pcon24cd`, 650 constituencies (543 in England), last changed cb44174 on 2026-10-06 in tompickup23/ukplaces. Join on `pcon24cd`.
- Slugs look like `cities-of-london-and-westminster`. UK Places has `/constituencies/[slug]` pages, and links to `ukelections.co.uk/seats/parliament/<slug>/` and `ukdemographics.co.uk/constituencies/<slug>/`.
- UK Places also has `src/data/registry/place-constituencies.json` (LAD to constituencies) and ukelections has `data/ons-pcon24-lad25-postcode-crosswalk.json`.
- No constituency data exists in ukcouncils or in ukcounciltax `data/registry`.
- SEO pages: one static page per constituency (543), county (taken from the data's `area`), region and council. Copy the slug into ukcounciltax rather than importing it across repos. Each page links to its UK Places and UK Elections pages and uses the same slug, canonical on this site.

#### Files
- Downloads: `/Users/tompickup/ukcounciltax/output/town-research/downloads/`
- Scripts: `/Users/tompickup/ukcounciltax/output/town-research/scripts/fetch_ons.py`, `/Users/tompickup/ukcounciltax/output/town-research/scripts/match2.py` (`match_parishes.py` and `suggest.py` there are earlier drafts)
- Outputs: `/Users/tompickup/ukcounciltax/output/town-research/parish-match.json`, `/Users/tompickup/ukcounciltax/output/town-research/unmatched.txt`, `/Users/tompickup/ukcounciltax/output/town-research/unmatched-suggest.txt` (from the first matcher; its "unmatched" list is out of date)

## Part 3. Site conventions and implementation map

IMPLEMENTATION MAP: /council-tax/towns/ route set (ukcounciltax, branch feat/town-league-table, read-only survey; I created the empty folders /Users/tompickup/ukcounciltax/output/town-research/ and /Users/tompickup/ukcounciltax/output/town-research/downloads/, and changed nothing else)

#### 0. Blockers and decisions for Tom before any build

1. **Recorded editorial rule against this feature.** docs/A4-RANKINGS-PARISHES-SOURCE-NOTES.md:140 says "No ranking of parishes, and no ranking of billing areas by parish figures". src/pages/precepts/parishes/index.astro:17 prints "...listed in council name order, without ranking parish charges or billing areas". src/lib/ranking-page.ts:6 `rankingRule` says the site ranks "councils only against councils of the same type". The project CLAUDE.md Data section says "Compare only compatible systems, classes, years and charge bases". A table that ranks across England reverses all of these, so Tom has to decide explicitly, and the parishes index sentence has to change in the same PR. docs/DESIGN-AUDIT-2026-11-15.md:491 (item 5) also says council page deep links "never point at league or 'worst' pages".
2. **"Cheapest" and "most expensive" are banned words.**
  , tests/rankings-pages.test.ts:17 fails a ranked page containing `cheapest|most expensive|best|worst`.
  , docs/A4-RANKINGS-PARISHES-BRIEF.md:16 and :108 set the house words: "lowest", "highest", "position", "of".
  , The Estate Kit chart gate (src/vendor/estate-kit/dist/src/qa/gates.js:25 RANKING_WORDS) rejects `highest|lowest|most|least|top|bottom|ranked|ranking|rank|league` in any chart title or alt text. A RankedBars or PositionStrip title therefore cannot use those words either.
  , For SEO, the search phrase "cheapest council tax" can only go in visible copy if Tom lifts the rule for these pages. Otherwise titles use "lowest to highest".
  , src/pages/coverage.astro:23 states "Why there is no UK league table", so the new pages must stay England only.
3. **Region and county slugs collide.** "West Midlands" is both a region (src/lib/paths.ts:18) and a metropolitan county (MD `area` in england-2026-27.json, and registry `county`). A flat /council-tax/towns/<slug>/ cannot hold both. Use /council-tax/towns/region/<slug>/ and /council-tax/towns/county/<slug>/, matching /constituency/<slug>/.
4. **No constituency data is held.**
  , No Westminster constituency field exists anywhere in data/ or src/lib.
  , The MHCLG parish rows carry only the MHCLG parish code (E3831P001 style) and the billing ONS code (scripts/import-national.mjs:29). There is no ONS parish GSS (E04...), so joining to an ONS parish-to-PCON lookup means name matching. That needs its own source, hash and match audit. I have not verified that such an ONS lookup exists.
5. **County is defined differently in different places.**
  , authorities[].area is the county name only for the 164 shire districts (21 counties, matching year.counties).
  , It is null for all 63 unitaries, "Greater Manchester" and similar for metropolitan districts, and "Inner London" or "Outer London" for London boroughs.
  , The registry `county` (data/registry/councils.json, from the UK Places spine; field typed at src/lib/registry.ts:27) is ceremonial-style and covers unitaries ("North Yorkshire" 703 published parish rows, "Somerset", "Berkshire"…). It differs from MHCLG: for example North and North East Lincolnshire fall under "Lincolnshire" (565 rows under registry county, against 486 under the MHCLG area). One basis has to be chosen and labelled. Only the `reorganisation` field is held (CLAUDE.md "Held data"), and `county` may render.
6. **Year coupling with PR 88 (open, draft).** PR 88 touches paths.ts, site.ts, releases.ts, national-data.ts, parish-pages.ts, check-dist.mjs and tests/site.test.ts. It adds `PARISH_YEAR`, which can lag CURRENT_YEAR, plus `nationalFor(year)`. A town Band D mixes parish and Table 10 components, so it must take both from the same year. Key the pages on the parish year, never on CURRENT_YEAR alone. Expect merge conflicts in those files.
7. **"Towns" is a loose name.** The parish return covers parished areas only. Large unparished towns have no parish row. London has 3 published parish rows (Queen's Park). Title and copy should say "town and parish areas" and state the unparished caveat. specialExpensesPounds in components affects unparished and some parished bills, which matters to the data work.

#### 1. Paths and slugs: src/lib/paths.ts
- REGIONS :13-23 (9 regions; `Region` type :24).
- slugify :26-34 (NFKD, `&`→"and"). regionSlug :36. regionPath :39-41 gives /council-tax/<region>/, which already exists, so do not reuse that namespace.
- programmaticPaths() :92-104. This is the one list the sitemap, canonical test, nav test and sitemap-dates test all read. Add `...townPaths()` here.
- The ranking path pattern to copy: rankingPath :106, rankingPaths :107. parishPath and parishPages :109-118 throw on an unmapped gss, a good guard to copy.
- Proposed additions: `townsPath()`, `townRegionPath(r)`, `townCountyPath(c)`, `townConstituencyPath(s)`, `townPaths()`, each built from the data so getStaticPaths and the sitemap cannot disagree (header comment :8-11).
- Region filtering helper: REGIONS.filter(r => rows.some(...)), as in parishes/index.astro:21.

#### 2. Static hub registration: src/lib/site.ts
- STATIC_PATHS :43-68. A new src/pages/council-tax/towns/index.astro must add "/council-tax/towns/". tests/site.test.ts:28-52 walks src/pages and fails a missing hub, and :54-57 requires the `^/([a-z0-9-]+/)*$` shape.
- NAV_GROUPS :77-107 holds 4+5+5 = 14 items plus NAV_DIRECT :110 = 15. tests/site.test.ts:239-243 caps that at 15, so the header is full: swap an item (for example in "Compare and rank" :88-96) or add to FOOTER_LINKS :117-130.
- tests/site.test.ts:230-237 requires every STATIC_PATH in the header or footer exactly once, and nav labels must be unique (:223-228).
- pageTitle :141-143 appends " | UK Council Tax". DEFAULT_DESCRIPTION :19.

#### 3. Existing patterns to copy
**Ranked pages**
- src/pages/council-tax/ranked/index.astro:1-38 is the hub.
 , Breadcrumbs :18.
 , A `.fact[data-fact]` around `.table-wrap[tabindex=0][role=region]` around `table.data` with a caption; `data-figure` on number cells; SourceLine inside the fact :20-24.
 , PositionStrip from src/vendor/estate-kit plus ChartActions per class :25-37.
- src/pages/council-tax/ranked/[class].astro:
 , getStaticPaths :11. Title and description come from src/lib/ranking-page.ts:14 and :18, with the H1 equal to the title :20.
 , Fact grid :28-31. The table carries `data-pagefind-ignore` and `class:list` :35. Position cell via positionCell (src/lib/rankings.ts:58 "21=" ties). Inline mobile own-share column :41 and :57.
 , MHCLG notes section :52, the incomplete-data state :53, related links :54.
- Ranking logic: competitionRank, standard competition with ties (src/lib/rankings.ts:25-32). isComplete :17-22 refuses to rank unless every member has a figure. Mirror it: refuse to rank a group with any unknown component, and never treat unknown as zero.

**Parish pages**
- src/pages/precepts/parishes/index.astro: region chips plus sortable table.
 , Markup :18-29: `[data-parish-filters] hidden`, revealed by the script so the page works without JS; `aria-pressed` chips; `aria-sort` headers; `data-*` on rows.
 , Client `<script>` :32-72. Styles :73-84 (chip, sort-button, print hide).
- src/pages/precepts/parishes/[slug].astro: search filter :33-34 and :49-58; parishSource SourceLine :27 and :41 (check-dist requires it twice on parish pages, scripts/check-dist.mjs:167-171); notes list :43; Durham charter trustee caveat :44.
- src/lib/parish-pages.ts:6 parishSource; :7 parishAmountWords (negative precepts printed as "minus £x"); :8 parishSummary; :21 parishRange.
- The Table 10 components source has no SourceRef helper yet. Copy src/lib/budget.ts:42-44 or src/lib/figures.ts:131-133 (title, Data_Billing, fileUrl from national.sources.components).

**Large-table pattern**
- src/components/TaxTable.astro:46 ships row data as `<script type="application/json">`, which is not hashed (inject_csp_hashes EXECUTABLE set :30) and suits thousands of rows.
- src/components/TaxTableControls.astro:21 disables charge sorting until one council type is chosen (the "within class" rule in UI form).
- global.css:418 and :425: `.table-wrap` max-height 34rem once a table has more than 30 rows (scroll box). This keeps county pages like North Yorkshire (703 rows) under the design-check 12000px height cap. A hub with 10,241 rows is not viable; the hub and region pages should show bounded lowest and highest lists and link down.

#### 4. CSP for client scripts
- A plain `<script>` in .astro is bundled by Astro. Small ones are inlined. scripts/inject_csp_hashes.mjs:70-81 hashesIn and :104-121 injectHashes run after build (package.json "build" ends with pagefind then inject_csp_hashes) and write the hashes into dist/_headers. Nothing to do by hand.
- `is:inline` without src is forbidden (tests/site.test.ts:141-150). public/_headers must hold no hashes (:115-123).
- check-dist imports hashesIn and scriptSrcOf (:24) and fails a missing hash.
- Add an e2e-csp test like e2e-csp/specialist.spec.ts:30-40 (parish filter under the production policy) for any filter or sort script.

#### 5. BaseLayout: src/layouts/BaseLayout.astro
- Props :26-42: title (pipe appended), description, path (canonical, required), noindex, ephemeral, structuredData (extra JSON-LD nodes; no page passes it today), ogImage (defaults to the home card :52), ogImageAlt, about (used only by councils/[slug].astro:111, GovernmentOrganization).
- Emits BreadcrumbList via src/lib/breadcrumbs.ts, plus WebPage, WebSite (home only) and Organization (:57-93).
- Canonical via src/lib/canonical.ts (:102). Robots :103.
- `<main data-pagefind-body data-pagefind-meta="type:...">` from pageTypeFor (:126).
- **Breadcrumb JSON-LD depth:** src/lib/breadcrumbs.ts:3-24 emits at most Home, top parent (PARENTS map, 'council-tax' → "Council tax"), then the page. For /council-tax/towns/county/kent/ it skips "Towns". Extend it if a 4-level trail is wanted; check-dist validates the trail (:197-198).
- The visible Breadcrumbs component (src/components/Breadcrumbs.astro:9-26) takes `items: {label, href?}[]`.
- **JSON-LD types:** check-dist.mjs:185-187 requires exactly one WebPage, Organization and BreadcrumbList. :196 FAILS on FAQPage, Dataset or GovernmentService. **Dataset is banned; ItemList is allowed** (not used anywhere yet). Pass via `structuredData={[{ '@context':'https://schema.org','@type':'ItemList', itemListOrder:'https://schema.org/ItemListOrderAscending', numberOfItems, itemListElement:[{ '@type':'ListItem', position, name, url? }] }]}`. Keep the list short (for example the first and last 10) and name no person. `about: {'@type':'AdministrativeArea', name}` suits county and region pages.

#### 6. Search page type: src/lib/page-type.ts
- :27 `startsWith('/council-tax/ranked/')` gives "ranking".
- :29 `/^\/council-tax\/[^/]+\/$/` gives "region", so /council-tax/towns/ would be mislabelled "region" and the deeper pages fall to "other".
- Add `if (path.startsWith('/council-tax/towns/')) return "ranking"` (or a new type in PAGE_TYPE_LABELS :2-14) before :28.
- tests/typed-search.test.ts:71-77 pins examples.

#### 7. Sitemap and lastmod
- src/pages/sitemap.xml.ts:7-9 is STATIC_PATHS plus programmaticPaths(), and :14 calls sitemapLastmod.
- src/lib/releases.ts:509-534 sitemapLastmod: /council-tax/towns/* currently falls into the :527 branch (council tax edition published date). That is wrong for a figure built from the parish return (retrieved 2026-10-05) and Table 10 (components retrieved). Add a branch before :527, for example the later of national.sources.parishes.retrieved and national.sources.components.retrieved.
- STATIC_PAGE_DATES :489-506 is only for undated static pages.
- tests/sitemap-dates.test.ts:11 hard-codes 1106 routes; add an expectation like :24-25.

#### 8. Canonicals
- data/canonical-map.json has 319 mappings and 69 selfCanonicalUrls. New paths with no mapping are self-canonical automatically (src/lib/canonical.ts:10-13). Do not edit the map.
- tests/canonical.test.ts:52-76: line 62 `addedUrls` must include every new towns URL, because :64 asserts that built-but-not-in-snapshot URLs equal addedUrls exactly. :55-57 a4Paths count 221 is unchanged. :65 (318 mapped) is unchanged.
- check-dist.mjs:234-235 (318 mapped, 69 unique) is unchanged.
- SEO note: /council-tax/, its band and region pages, /compare/ and all 296 /councils/ pages are canonical to UK Councils until the May to June 2027 reversal (DESIGN-AUDIT :491). The self-canonical pages that link with full weight are /, /precepts/, /precepts/parishes/*, /council-tax/ranked/*, /increases/ and /findings/. Towns pages would be self-canonical UKCT pages, which fits "UKCT owns the bill".

#### 9. Hard counts to update (all go up by N new pages)
- scripts/check-dist.mjs:239 `pages !== 1107`, with the comment ledger at :236-238; add a line for the towns routes.
- scripts/check-dist.mjs:307 sitemap 1106.
- tests/sitemap-dates.test.ts:11 (1106).
- e2e/stage-one.spec.ts:141 (1106).
- check-dist.mjs:392 Pagefind indexed count must equal sitemap URLs, so every new page must be indexable and not noindex.
- check-dist.mjs:240 parishPagesChecked 214 and the regex :167 only match /precepts/parishes/<slug>/, so they are unaffected.

#### 10. Figure, source and text gates
- scripts/lib/figures.mjs:14-40 unsourcedFigures, run at check-dist :200-201: every `data-figure` must sit inside a `data-fact` that contains a `.source-line` (SourceLine.astro:16-18), and every data-fact must contain one. The Fact.astro:18-26 wrapper does both.
- check-dist :78-91: the title must end " | UK Council Tax" with no ", "; the beacon is required once (:203-207).
- scripts/check-text.mjs:31-35 and :79-92: no dashes, dash entities,, /, JSON escapes or spaced hyphens in html, json, xml or txt in dist. Parish and body `name`s from data/national/england.json are exempt as verbatim (:25-30, :42-60).
- tests/site.test.ts:
 , :80-88 no ", " or dash inside `title=` in .astro.
 , :165-184 dashes and pseudo-dashes in src, scripts, public and data, including a new data or scratch JSON under data/.
 , :208-218 motive words (`hiding|failing|waste|scandal|shocking|secretive|unlawful|...`) in .astro.
 , :186-206 no hex colour outside global.css.
- tests/council-tax.test.ts:86-91 forbids keys containing rank, position, percentile, league or vs_peer in the year file. Do not bake positions into any data JSON; compute them on the page, as rankings.ts does.
- The CLAUDE.md held-data test tests/reorganisation-held.test.ts and `npm run test:dist` fail if the registry reorganisation text reaches dist. Use only `county`, `region`, `name` and `slug` from the registry.
- No inline script anywhere; no host name outside site.ts (tests/site.test.ts:60-70).

#### 11. Pagefind, llms.txt and council-index.json
- **Pagefind:** BaseLayout marks main as the body. Put `data-pagefind-ignore` on the big tables, as ranked/[class].astro:35, parishes/index.astro:25 and TaxTable.astro:26 do. Parish names are already indexed through /precepts/parishes/<slug>/, whose table is not ignored, so this avoids near-duplicate hits. The design audit's promo cards also carry data-pagefind-ignore.
- **llms.txt:** src/pages/llms.txt.ts:80-83 builds its link lists from NAV_GROUPS, NAV_DIRECT and FOOTER_LINKS, so a nav or footer entry appears there automatically. tests/contact-security.test.ts:66-67 forbids any digit in that route file.
- **council-index.json:** src/lib/council-index.ts:18-30 adds optional budgetUrl and parishUrl per council. A `townsUrl` would be optional. check-dist.mjs:400-412 checks that the index equals the profile routes and that every url resolves, and :383-ish refuses English destinations on devolved rows. Not required.

#### 12. OG cards
- src/lib/og.ts:138 HUB_CARDS = home, councils, council-tax, rises; :141 hubCardPath; OgCard :35-44 (one figure plus a required caveat and a source).
- src/pages/og/[card].png.ts: cards() :13-30, built only when BUILD_OG=1 (:32-35).
- The ranked and parish pages use the default home card (tests/a4-cards.test.ts:7-15 asserts this for the 221 A4 pages).
- For towns, either keep the default or add a "towns" hub card. With BUILD_OG=1, check-dist :359-375 requires every og:image to resolve.
- PR 88 adds src/pages/og/ranking/[slug].png.ts (per-council ranking cards); coordinate with it.

#### 13. Estate Kit (vendored, not in node_modules): src/vendor/estate-kit, v0.6.3, tag commit 8b04278
Components are in src/vendor/estate-kit/src/components/. Option types are in dist/src/charts/*.d.ts. All take ChartOptions (frame.d.ts): set, sourcePlacement, sourceFormat, template, mode, site, ground, title (supports {key} slots), alt.
- **RankedBars.astro**: RankedBarsOptions (rankedBars.d.ts) with rows: {figure, change?}[] in caller order, one comparable group, never sorted by the chart; classLabel, basis, density 'regular'|'compact'; plus tableOpen, class, id. Used for increases via src/lib/kit-charts.ts:60.
- **PositionStrip.astro**: figure, distribution (a series figure), place?, classLabel, basis, requireNames?; MIN_CLASS = 10. Used via kit-charts.ts:81 classChartOptions.
- **SummaryRow.astro**: facts: {figure?, label?, perspective?, perspectiveWaived?}[]; returns only the facts present.
- **StatTile.astro**: figure, label?, perspective?, perspectiveWaived? (a money tile needs one or the other).
- **ChartFigure.astro**: out, keys, tableOpen, class, id, actions.
- **ChartActions.astro**: the local copy at src/components/kit/ChartActions.astro, with `chart` and `target` props.
- **Others:** AreaMap, LocatorMap, BillAnatomy, ZeroBar, Line, Waffle, Hemicycle, ScoreCard.
- **Table twin:** tableTwin(TableSpec{caption, head, rows, source, numeric?, rowLinks?}) in table.d.ts.
- Kit figures need figure-set keys with sources (src/lib/figures.ts). Chart PNG routes come from kit-charts.ts:178-217 and src/pages/og/charts/[chart].png.ts.
- tests/vendor.test.ts pins the vendor tree byte for byte; do not edit it.

#### 14. Tests to add, following existing patterns
- **Unit, built-dist and skipIf-dist:** copy tests/rankings-pages.test.ts:10-21 (exact row counts, one H1 equal to the title minus " | UK Council Tax", no motive words, resolving /councils/ links) and :22-35 (named extremes and ties).
- **e2e:** e2e/rankings-parishes.spec.ts:4-13 runs axe in light and dark plus a no-overflow check; :14-21 checks the table is complete with JavaScript disabled.
- e2e/layout.spec.ts:20-38 automatically covers every STATIC_PATH (so the hub) at 375 px. Add a county and a region sample to SAMPLES.
- **e2e-csp:** a filter test like specialist.spec.ts:30-40.
- Local trap (docs/STATE.md): start `npx astro preview --host 127.0.0.1 --port 44321` and run with E2E_BASE_URL.

#### 15. CI: number diff and design check
- .github/workflows/release.yml:207-247 runs .github/scripts/number-review.mjs, which runs scripts/diff-numbers.mjs with globs from the PR body's "## Pages allowed to differ" fenced block (number-review.mjs:8-9).
- diff-numbers.mjs:107-128 counts **added** pages as unallowed unless a glob matches. Globs are built file paths with no leading slash, for example `council-tax/towns/**`, plus any page whose numbers change (for example `precepts/parishes/index.html` if its copy changes, or `index.html`).
- Design check (release.yml:249+, .github/scripts/design-review.mjs:18-32): the PR body needs a fenced `text` block of site paths under "## Pages to capture" (for example /council-tax/towns/, /council-tax/towns/region/north-west/, /council-tax/towns/county/kent/). It captures 390 and 1440 in light and dark.
- design-check rules (~/.claude/skills/design-check/SKILL.md): data-figure inside a sourced data-fact; og:image at least 1200 px; no overflow at 390; page height below 12000 px at 1440; LCP below 2.5 s; CLS below 0.1; no dashes; one visible H1.
- Editing the PR body re-runs the check (about 22 minutes).

#### 16. Every file the route set would touch
**New**
- src/pages/council-tax/towns/index.astro (hub; STATIC_PATHS).
- src/pages/council-tax/towns/region/[slug].astro
- src/pages/council-tax/towns/county/[slug].astro
- src/pages/council-tax/towns/constituency/[slug].astro (only once a sourced constituency lookup exists).
- src/lib/towns.ts: the row builder from data/national/england.json parishes and components plus the year file; positions via competitionRank; refusal when incomplete; pence integers; same-year guard.
- Optionally src/components/TownTable.astro (+ client script), a sourced data file if constituency is added (with publisher, title, table, sha256), tests/towns.test.ts and tests/towns-pages.test.ts, and e2e/towns.spec.ts plus an e2e-csp case.

**Edit**
- src/lib/paths.ts: town path helpers, and townPaths() into programmaticPaths :92-104.
- src/lib/site.ts: STATIC_PATHS :43; NAV_GROUPS :77 swap or FOOTER_LINKS :117.
- src/lib/releases.ts: sitemapLastmod branch before :527; a sitemap-dates expectation.
- src/lib/page-type.ts: branch before :27-29.
- src/lib/breadcrumbs.ts: optional 4-level trail.
- src/lib/og.ts:138 and src/pages/og/[card].png.ts (optional card).
- scripts/check-dist.mjs: :239 page count, :307 sitemap count, and a towns-specific built check (row counts, source lines, no banned words).
- tests/canonical.test.ts:62 addedUrls; tests/sitemap-dates.test.ts:11; e2e/stage-one.spec.ts:141; e2e/layout.spec.ts:20 SAMPLES; tests/typed-search.test.ts:71 (page type example).
- **Internal links:**
 , src/pages/council-tax/index.astro:136 ("Also on this site")
 , src/pages/council-tax/[slug].astro:206 (region pill nav; link region X to towns region X)
 , src/pages/index.astro:96-101 (homepage "Council tax by region" block; add a towns line)
 , src/pages/council-tax/ranked/index.astro:19 and ranked/[class].astro:54 (related list)
 , src/pages/precepts/parishes/index.astro:17 (must reword the "without ranking" sentence) and parishes/[slug].astro:47 (footer links; link to the council's county or region towns page)
 , src/components/NationalPrecepts.astro:56 (profile parish link)
 , src/pages/councils/[slug].astro:216 or NearbyCouncils :306. Per the design audit, profiles should not link "league" pages without Tom's call. Profiles are canonical to UK Councils anyway.
 , src/pages/precepts.astro (bill parts page, self-canonical) is a good contextual linker.
- docs/RELEASE.md (provenance and limitations), docs/STATE.md, and docs/methodology if the method is new (src/pages/methodology.astro).
- Tests and src are off limits for this task. These are the edits the build would need.

#### 17. SEO surfaces available
- **Title** through `title` (piped). Existing pattern: "Council tax Band D ranked: shire districts 2026/27" (ranking-page.ts:14). Suggested: "Council tax by town and parish in England 2026/27: Band D lowest to highest", "Town and parish council tax in Kent 2026/27: full Band D", "...in the North West 2026/27". Use "lowest/highest" unless Tom lifts the "cheapest" ban. Keep the H1 identical to the title for the test parity pattern.
- **Description** leads with the figure sentence, as ranking-page.ts:18 does: "N town and parish areas in Kent, 2026/27: full Band D £a in A to £b in B. MHCLG parish return and Table 10." Every figure needs a nearby source line on the page.
- **JSON-LD:** BreadcrumbList, WebPage and Organization come automatically, plus ItemList (allowed) and `about` AdministrativeArea. **Not Dataset** (check-dist.mjs:196).
- **Canonical:** self, automatically.
- **Sitemap and lastmod:** automatic through programmaticPaths plus the releases.ts branch. IndexNow (scripts/indexnow.mjs:15-16) reads the live sitemap.
- **Pagefind type label:** page-type.ts.
- **llms.txt** through nav or footer.
- **OG:** the default home card, or a new hub card.
- **Crawlable links with no JS:** static anchors from the self-canonical pages listed in section 8, and cross links between region, county and council parish pages (/precepts/parishes/<slug>/ ↔ county towns page).

## Part 4. Design specification

DESIGN SPEC: Band D league table by town and parish, England 2026/27 (ukcounciltax, branch feat/town-league-table)

Nothing was edited. output/town-research/ and its downloads/ subfolder now exist and are empty.

0. BLOCKERS TO SETTLE BEFORE BUILD (house rules that clash with the brief)
B1 Wording. docs/A4-RANKINGS-PARISHES-SOURCE-NOTES.md section 3 (binding) and the A4 brief bar "cheapest", "most expensive", "best", "worst", "top" and "bottom" on ranking pages. tests/rankings-pages.test.ts:17 enforces the first four on /council-tax/ranked/. The allowed words are "lowest", "highest", "position" and "of". The kit gate src/vendor/estate-kit/dist/src/qa/gates.js:25 RANKING_WORDS also refuses highest, lowest, top, bottom, rank, ranked, ranking and league in any kit chart title or alt text. Recommendation: the visible copy says "lowest" and "highest Band D". The "podium" is labelled "Lowest ten" and "Highest ten". Kit chart titles use neutral words, for example "Full Band D by parish area". The new routes join the rankings-pages word check. Using "cheapest" in the title or meta for SEO is a decision for Tom, and the recommendation is no.
B2 Cross-class ranking. A4 ranks only within a class of council. A locality full Band D across all of England uses the same system, year and basis (a locality bill, not an area average), so it is compatible under CLAUDE.md. It is still a departure from A4, so Tom must decide it and the PR should record it.
B3 Change column. data/national/england.json components hold 2026/27 only. Full Band D change therefore needs the 2025/26 components (county, police, fire, combined, own excluding parish) from a published table. Without them the cell reads "Not comparable", never a parish-only change printed as if it were the bill change. Parish part change is computable today: years[2025-26] and [2026-27] on the same row, as on the parish pages.
B4 Constituency is not in held data. It needs an ONS parish to Westminster constituency lookup with publisher, edition and hash. Some parishes straddle two constituencies, so a row needs "Split: A; B" with a note. Constituency pages list every parish that touches the constituency and flag split rows. They never apportion.
B5 "Larger places" is not population. taxBase is Band D equivalent properties. Label the toggle "Tax base of 2,000 Band D equivalents or more" (1,195 of 10,241 rows) or 5,000 (371 rows). Tom picks the threshold. Never say "towns over N people".
B6 Unparished areas are rows too (for example "Burnley, unparished area"). Most large towns and cities have no parish council. Each billing authority's unparished full Band D needs specialExpensesPounds handled. Where special expenses vary by locality and are not published per locality, the row is "Not published", never the parish-free figure. Rows use status chips ("Parish", "Group", "Charter trustees", "Unparished area") so that unknown is never zero. A published £0.00 precept shows as £0.00 with the label "no parish precept".

1. ROUTES, TITLES AND SEO (self-canonical, outside data/canonical-map.json; this fits the split, since UKCT owns the bill)
Hub: /council-tax/towns/
  title "Council tax by town and parish in England 2026/27". The site name is added after the pipe by BaseLayout pageTitle. The H1 equals the title, as the ranked test pattern expects. Always build the year with yearLabel(CURRENT_YEAR).
  meta description, with figures from data: "Full Band D council tax for {n} parish and unparished areas in England, {year}: lowest {place} £x, highest {place} £y. Filter by region, county, council and constituency. Sourced from MHCLG."
Region: /council-tax/towns/region/{regionSlug}/ (9). Do not reuse /council-tax/{region}/, which is canonical to UK Councils.
County: /council-tax/towns/county/{slug}/ (the authorities[gss].area name, plus unitaries grouped under their ceremonial county only if a published lookup exists; otherwise "Unitary authorities in {region}").
Constituency: /council-tax/towns/constituency/{slug}/ (after B4).
Council level: do NOT add a new route. Add a "Full Band D" column and a link to /precepts/parishes/{slug}/, which already exists. This avoids two pages competing for "parish council tax {council}".
Per-town pages: not in phase 1. 10k thin pages risk thin-content treatment. Each row gets a stable anchor id={MHCLG code}, for example #E3831P001, so search results and shares can deep link. Phase 2 option: pages only for places above the B5 threshold, each with its own BillAnatomy, so the content is unique.
Pattern for region, county and constituency titles: "Council tax by parish in {Lancashire} {year}". H2s phrased as the query: "Where is Band D council tax lowest in {Lancashire}?" and "Where is it highest?". No FAQPage markup, because Google limits it to government and health sites.
Structured data (BaseLayout structuredData prop): Dataset (name, description, temporalCoverage 2026/2027, spatialCoverage England or the county, isBasedOn the MHCLG ODS URLs, creator UK Council Tax, license OGL v3.0); ItemList of the lowest ten and highest ten (name and url anchor only, no figures in the markup); BreadcrumbList is already automatic.
OG: one card per page through src/pages/og (hubCardPath pattern) showing the pair figure. ogImageAlt with no ranking words.
Sitemap and links: add to programmaticPaths and STATIC_PATHS. Inbound links: /precepts/parishes/ index, each /precepts/parishes/{slug}/, the region pages, the homepage task cards (a sixth card would break the pinned five-card gate, so put the link under the cards instead), /council-tax/ranked/ "Related", and NAV (after PR 88). UK Councils never deep links here (audit linking rule 5).
Pagefind: today ranked tables carry data-pagefind-ignore. On these pages, index place names (keep data-pagefind-body on the table and ignore the chrome) so a site search for "Padiham" finds its county page. Body copy names the five lowest and five highest places in plain sentences, crawlable text and not only table cells.
Performance: the hub never ships all 10k rows. It carries the ledgers, the distribution, region and county link grids and the B5 larger-places table. Full lists live on county pages (largest county about 1,000 rows, plain HTML, fine) and region pages (paginate the static table by county sections, each an h2 with an anchor).

2. PAGE ANATOMY (hub; region, county and constituency pages use the same parts with the scope swapped)
a. Breadcrumbs (src/components/Breadcrumbs.astro): Council tax > Towns and parishes > {scope}.
b. PAIR HERO: the one desk band on the page (Ledger and Desk allows at most one). Copy the .play-band recipe from src/components/PlayBand.astro, renamed .pair-band, with --pair-ground: color-mix(in srgb, var(--accent) 26%, var(--ground)), --ground-ink text, 18px radius, a 1px border of color-mix(var(--accent-bright) 30%), and padding clamp(1.5rem, 1rem + 3vw, 3rem).
  Eyebrow: .play-eyebrow recipe (0.14em, 28x2px rule, --accent-bright): "Full Band D | {year} | {n} areas".
  H1 in two tones through a span in the same text node: "Council tax by town and parish in <span>England {year}</span>". Size clamp(2.3rem, 1.6rem + 3vw, 4rem) (the homepage .hero-copy h1 scale until the K1 hero step lands), line-height 1.04, letter-spacing -0.02em, text-wrap balance.
  Pair: two .pair-card on a two-column grid from 600px (stacked at 375). Each card has a kicker ("Lowest full Band D" or "Highest full Band D"), the place name in Serif 600 var(--text-lg) with overflow-wrap anywhere (grouped names reach 100 characters: show the short name and give the full name in a span.full-name under it), "{parish type}, {council}, {county}", and a figure of var(--text-2xl) Serif 600 with tabular-nums. The highest card keeps the same neutral style. No red and no "warning" state.
  Gap rule between them: "Difference {£x} a year at Band D, {£y} a month", our calculation, with the method in the source line. A ZeroBar from the kit (two bars from zero on one scale) sits under the pair from 900px, with a table twin.
  Every figure in its own .fact[data-fact] with a SourceLine inside, so check-dist pairs them. On the desk, override .source-line color to color-mix(var(--ground-ink) 75%, transparent) and give the links the same colour plus an underline.
  Tie rule: if two or more places share the extreme, the card says "joint lowest, with N others" and links to the anchor.
c. LEDGERS ("Lowest ten" and "Highest ten"), on paper, not the desk. Two columns from 900px. Each is an ordered list styled as the audit's "ledger row": a 2px var(--text) top rule, var(--border) hairlines, rows of [position with "=" for ties | place plus council | figure in tabular-nums, right aligned]. Position is set in var(--font-display) at var(--text-md) in var(--text-faint). It is an <ol> with real positions in <span>, not CSS counters, so text copy and screen readers keep them. One SourceLine under each list. Optional bars: kit RankedBars density "compact", rows in caller order (the kit never sorts), title "Full Band D, ten lowest areas" with no gate words. Note that "lowest" is in RANKING_WORDS, so the safe title is "Full Band D, first ten in order", or put the words in the HTML h3, not the SVG title.
d. DISTRIBUTION: "How the {n} areas spread". The kit has no histogram, so use a page component (new src/components/BandDSpread.astro, written in the BandDLine.astro style: static SVG built at build time, aria-labelledby, .tick and .value with tabular-nums). A binned strip of £25 bins, each a column whose height is the count of areas, using var(--series-neutral-soft), with the scope's own areas in var(--accent) on region and county pages against England in neutral. Markers for England lowest, median (labelled "median, our calculation from published figures") and highest. The table twin is a details element using .ek-twin styling. On region and county pages, also use the kit PositionStrip (MIN_CLASS 10, so it is hidden for constituencies with fewer than 10 rows). Its alt and title must pass RANKING_WORDS: basis "Full Band D, including parish precept".
e. FILTER BAR (progressive): new src/components/TownFilters.astro, modelled on TaxTableControls.astro. The wrapper is [hidden], with fieldset disabled until script runs. External module script only, hashed by inject_csp_hashes.mjs, no inline script permission.
  Without JS: region chips render as real links (.pill-nav, aria-current on the active page) to the region routes. County and council appear as link grids lower down (.link-list columns). So every filter has a static URL equivalent, which is better for SEO and needs no JS.
  With JS (hub and region pages): chips filter the B5 table in place and update ?region= with history.replaceState (no request, no storage). Also a county <select>, a council <select>, a constituency search (type=search, datalist, matching on name), a "Tax base 2,000 or more" checkbox, and a sort select (Position | Place A to Z | Full Band D highest first). One role="status" line: "Showing 212 of 1,195 areas."
  Layout: grid 2fr 1.4fr 1.4fr 1.6fr from 900px, two columns from 600px, one column at 375px. Inputs use the .field recipe at a minimum of 44px. The chips row wraps and never scrolls sideways.
f. MAIN TABLE (.table-wrap > table.data, caption = scope + year + basis, tabindex 0, role region, aria-label):
  Columns: Position (competition rank, "21=") | Place (th scope=row: short name, type chip span.place-kind using the .parish-kind recipe, full grouped name in small) | Council (link to /precepts/parishes/{slug}/) | County | Constituency | Full Band D (num) | Parish part (num) | Change (num, signed, "Not comparable" per B3) .
  Numerics are td.num, right aligned, tabular-nums, with nowrap only on figure cells. Unknown cells say "Not published", never "n/a" (pounds() returns "n/a", so wrap it), never blank and never 0.
  The sticky header and the stripe fix are already in global.css, as is the scroll box above 30 rows (.table-wrap:not(:has(tbody tr:nth-child(31)))). On county pages, drop max-height so the page scrolls rather than a nested box: add a .table-wrap--long modifier with max-height none.
  Row anchors id={code}. :target row background var(--accent-wash) with an inset 3px var(--accent) bar on the first cell.
  One SourceLine under the table, plus MHCLG notes listed verbatim under it, keyed to rows (the ranked [class].astro pattern).
g. "HOW THIS IS CALCULATED" drawer: DataDrawer.astro (heading outside summary, details closed by default, opened by hash). Content: full Band D = billing council own Band D excluding parish (Table 8a or 8c) + parish Band D (Parish_Level_Data) + county (8b) + police + fire + combined authority or GLA precepts, with special expenses rules, then the tie rule, the position direction (1 = lowest), the tax base meaning, overlaps (Durham charter trustees, grouped parishes), the constituency lookup and split rule, and "a postcode alone cannot establish every charge". A worked example row with each component and its table. Before discounts and premiums.
h. Related links block, as on [class].astro.

3. MOBILE 375px
Pair cards stack, with the figure at var(--text-xl) at most. The ledgers become one column.
Table to card rows below 600px (the [class].astro own-inline pattern, extended). Keep the <table> semantics and switch display with CSS: tr becomes a grid "pos place figure" / "pos meta meta". Position at the left in the display face; the place name wraps (overflow-wrap anywhere); Full Band D right aligned and bold. Council, county and constituency go on one small muted line. Parish part and Change go as "Parish £x · Change +£y" on a third line. Header cells are visually hidden but kept for screen readers (each td gets a data-label rendered by ::before only in card mode). No table-wrap scroll in card mode. Test the longest grouped name and "Kingston upon Thames" at 375px with no page overflow (gate: check-dist and design-check).

4. TOKENS (use only names that exist today in src/styles/global.css; light and dark are already defined, including the prefers-color-scheme guard)
Ground: --bg, --bg-subtle, --bg-card, --border, --border-strong. The --paper, --paper-warm and --paper-line tokens exist in src/vendor/estate-kit/generated/skins/ukcounciltax.css but are NOT spliced yet (W8), so do not use them.
Ink: --text, --text-muted, --text-faint. Desk: --ground, --ground-ink, --ground-muted, with --accent and --accent-bright for the two-tone text. Wash: --accent-wash. Data: --series-neutral, --series-neutral-soft, --series-1 (only if a second series is needed), --positive, --warning and --critical never used for high or low (the figures are neutral). Change sign as text "+£12.34" and "£0.00", with no colour coding.
Type: --font-display (Source Serif 4 600) for H1, pair figures, place names in ledgers and positions; --font-sans for everything else. Scale: --text-xs (eyebrow, chips, record line), --text-sm (table on mobile, source), --text-base (body and table), --text-md (lede), --text-lg (place names in cards), --text-xl, --text-2xl (pair figures). Hero H1 uses the homepage clamp until K1 adds the hero step.
Numerals: body already has tabular-nums (global.css:197). Add font-variant-numeric: tabular-nums lining-nums to .pair-figure, the ledger figures and td.num explicitly, and to SVG text.
Space and shape: --space-* scale, --radius, --radius-sm, --shadow-soft, --shadow, and 999px chips.
Motion: hover lift -2px only under prefers-reduced-motion: no-preference. Nothing holding a figure or source is animated to opacity below 1.
Print: the desk prints on white with a rule, filters are hidden, the full table prints with links shown.
Forced colours: pair cards, chips and bars get 1px CanvasText borders (copy PlayBand's block).

5. EXISTING COMPONENTS TO REUSE
BaseLayout (title, description, path, structuredData, ogImage, ogImageAlt), Breadcrumbs, SourceLine, Fact, DataDrawer, ChartActions (src/components/kit/ChartActions.astro, giving PNG, SVG and table actions on charts), kit ZeroBar, RankedBars, PositionStrip, SummaryRow (an optional row under the hero: areas counted, median full Band D, share with no parish precept, each with a source), .pill-nav, .link-list, .table-wrap, table.data, .field, .caveat, .badge, and PlayBand's desk recipe. The new page-level components would be TownFilters.astro, BandDSpread.astro, PairHero.astro and TownTable.astro (these names are proposals; they do not exist yet).

6. SOURCE LINE AND RECORD
Every figure sits in .fact[data-fact] with SourceLine (publisher, title, table, published date, retrieved date). Positions and differences carry a method prefix ("Our calculation from published figures. Source: ..."). The full Band D source line names all the tables it adds up (Parish_Level_Data; Tables 8a, 8b, 8c; police, fire and combined tables) with the ODS file hash, which goes in docs/RELEASE.md, not the page. The record line style stays .source-line at var(--text-xs) with the publisher in small caps (font-variant-caps: all-small-caps on a span), per the audit's type section.

7. GATES TO ADD OR KEEP
No em or en dashes and no spaced hyphens (test:text). The rankings word check extended to the new routes. Every data-figure paired with a source (check-dist). No colour literals outside the token file (tests/site.test.ts). The reorganisation field never rendered. No individuals named (parish and council names are bodies). One H1 equal to the title. No overflow at 375px. CSP hash for the filter script. The page fully readable with JS off.

Files read: /Users/tompickup/ukcounciltax/docs/DESIGN-AUDIT-2026-11-15.md, /Users/tompickup/ukcounciltax/docs/A4-RANKINGS-PARISHES-SOURCE-NOTES.md, /Users/tompickup/ukcounciltax/src/styles/global.css, /Users/tompickup/ukcounciltax/src/vendor/estate-kit/ (the kit is vendored at 0.6.3 here, not in node_modules), /Users/tompickup/ukcounciltax/src/components/PlayBand.astro, /Users/tompickup/ukcounciltax/src/components/EnglandMap.astro, /Users/tompickup/ukcounciltax/src/pages/council-tax/ranked/, /Users/tompickup/ukcounciltax/src/pages/precepts/parishes/[slug].astro, /Users/tompickup/ukcounciltax/tests/rankings-pages.test.ts.

