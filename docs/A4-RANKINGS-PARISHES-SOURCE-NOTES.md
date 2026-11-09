# A4: same class rankings and parish precept pages | source notes

Written 9 November 2026 in Claude Code (Opus). **Binding**: where this file and `docs/A4-RANKINGS-PARISHES-BRIEF.md` disagree, this file wins. Every count and anchor below was read on 9 November 2026 from the data files already in the repository at `origin/main` `baf0f05`. No new source is introduced: A4 publishes figures the site already holds, in a new arrangement. Codex cites nothing this file does not name.

## 1. The sources

| Use | Publisher and title | Table or sheet | Edition | File and hash, as recorded in the repo |
|---|---|---|---|---|
| Area Band D, every billing authority | MHCLG, Council Tax levels set by local authorities in England 2026 to 2027 | Table 9: Area council tax for a dwelling occupied by two adults by band 2026 to 2027 | published 25 March 2026 | `Tables_1-9_2026-27.ods`, sha256 `66b7c20f70c804038c0a392ff2b7249fd09e83f4e88ac87d0278ce7e19da5537`; imported to `data/council-tax/england-2026-27.json` (`authorities[gss].bands.D`), generated 27 September 2026 |
| The council's own Band D, unitaries, metropolitan districts, London | same release | Table 8a | same | same file; `authorities[gss].own` with `own.table === "Table_8a"` |
| County council Band D | same release | Table 8b | same | same file; `counties[gss]` (21 rows) |
| The council's own Band D, shire districts | same release | Table 8c | same | same file; `authorities[gss].own` with `own.table === "Table_8c"` |
| Area average Band D by type of area | same release | Table 7 | same | same file; `england.areaBandD.byAreaType` |
| Average Band D by class of authority | same release | Table 2 | same | same file; `england.byClass.rows` |
| Parish and other local precepts | MHCLG, Council Tax statistics for town and parish councils in England: 2026 to 2027 | Parish_Level_Data, Notes, Ceased_New_Renamed_Parishes | retrieved 5 October 2026 | `2026-27_Local_precepting_authorities_in_England.ods`, sha256 `abd04daef51e2e6f469046cdcf8ecd92d6015bfe3e893231ae3e9ea21b278f51`; imported to `data/national/england.json` (`parishes`, `parishNotes`, `parishChanges`, `sources.parishes`) |

What each figure is a count of:

- **Area Band D** (Table 9): the yearly charge for a Band D home occupied by two adults, averaged across the billing authority's area, including every precepting body (county, police, fire, combined authority or GLA) and parish precepts as an area average, and adult social care precepts (MHCLG note p). It is the whole bill for an average Band D home in the area, not a bill for any address.
- **Own Band D** (Table 8a, 8c): the billing authority's own average Band D, including adult social care where the authority has it, **excluding parish precepts** (the importer's column test in `scripts/fetch-council-tax.mjs` line 294 matches "excluding parish precepts"). Burnley: £351.44, equal to Table 10's `ownExcludingParishPence` 35,144.
- **County Band D** (Table 8b): the county council's own Band D precept, including adult social care, charged in every district of the county.
- **Parish Band D** (Parish_Level_Data): each local precepting authority's Band D charge, in pence as displayed, for homes in that parish only. Precept income (`preceptPounds`) and tax base are also held; A4 prints neither.

Licence for all: Open Government Licence v3.0.

## 2. Classes and counts

From `authorities[gss].classCode` in the 2026/27 file. Every one of the 296 has a non null Table 9 Band D and a non null own Band D.

| Page | Class codes | Count | MHCLG own table | Table 7 area type | Table 2 class row |
|---|---|---|---|---|---|
| shire districts | SD | 164 | 8c | shire, £2,452, up 4.6% | Shire Districts, £222 |
| unitary authorities | UA | 63 (includes the Isles of Scilly, which MHCLG classes as a unitary) | 8a | unitary, £2,490, up 5.3% | Shire Unitary Authorities, £2,010 |
| metropolitan districts | MD | 36 | 8a | metropolitan, £2,409, up 5.2% | Metropolitan Districts, £2,020 |
| London boroughs and the City of London | ILB (13, includes the City), OLB (20) | 33 | 8a | london, £2,068, up 4.4% | London Boroughs, £1,559 |
| county councils | `counties` | 21 | 8b | not applicable | Shire Counties, £1,802 |

Table 7 and Table 2 figures are whole pounds as published. Table 7 averages include parish and adult social care precepts (area basis); Table 2 averages are own share (council basis). They are printed as two labelled reference lines, never compared with each other.

**Complete published year rule.** A class is ranked for a year only when every authority of that class in the year's file has a non null Table 9 Band D and a non null own Band D (counties: a non null Table 8b Band D), and the file holds all 296 billing authorities. On 9 November 2026 all five classes are complete for 2026/27. The site ranks the current year only (`CURRENT_YEAR`); no earlier year, no change in position, no ranking across classes.

**Lewes (E07000063), a published figure marked pending.** MHCLG note `ad` on its Table 9 row and note `x` on its Table 8c row say the figure "is pending approval subject to a full council decision on 26 March 2026". The figure is printed in the published tables and Lewes has the highest area Band D of the 164 shire districts (£2,756.17). Decision taken: Lewes is ranked on the published figure, and its row prints the MHCLG note verbatim. If Tom prefers, the alternative is to show Lewes unranked below the table; that would make the class incomplete under the rule above, so the page would then rank nothing. The brief follows the first option.

**MHCLG notes on own share rows** (Table 8a, 8c): 14 authorities carry one (`r` Trafford, Warrington, Windsor and Maidenhead; `s` Leeds, Leicester; `t` Bournemouth, Christchurch and Poole; `u` North Somerset, Shropshire; `w` Mid Devon, Rushmoor, Tonbridge and Malling, Elmbridge, Woking; `x` Lewes). Counties: Norfolk (`s`), Worcestershire (`v`). They concern referendum limits or rounding of the change, not the Band D level; they are listed under the table, verbatim, keyed to the row.

## 3. Ranking conventions

- Order: lowest to highest. Position 1 is the lowest figure.
- Ties: standard competition ranking. Equal figures share a position and the next position skips (two at 21st, then 23rd). Printed "21=" in the table and "joint 21st" in words. Tied rows are listed in `localeCompare(name, "en-GB")` order.
- Two positions per row: by area Band D (the default order of the table) and by own Band D (its own column). Counties have one position (own Band D only; a county is not a billing authority, so it has no area figure).
- Figures compared as the stored numbers (pounds to the penny), never rounded first.
- Words: "lowest", "highest", "position", "of". No "cheapest", "most expensive", "best", "worst", "top", "bottom", and none of the motive words in `tests/site.test.ts` line 203.

### Anchors (2026/27)

| Class | Lowest area Band D | Highest area Band D | Lowest own Band D | Highest own Band D |
|---|---|---|---|---|
| Unitary (63) | Windsor and Maidenhead £1,952.62 | Dorset £2,765.02 | Windsor and Maidenhead £1,526.63 | Nottingham £2,342.08 |
| Metropolitan (36) | Dudley £2,144.84 | Gateshead £2,715.81 | Wigan £1,712.29 | Gateshead £2,396.07 |
| London (33) | Wandsworth £1,028.21 | Kingston upon Thames £2,609.20 | Wandsworth £517.70 | Kingston upon Thames £2,098.69 |
| Shire district (164) | Basingstoke and Deane £2,255.21 | Lewes £2,756.17 (MHCLG note `ad`) | Breckland £125.45 | Ipswich £432.09 |
| County (21) | not applicable | not applicable | Essex £1,641.96 | Oxfordshire £2,006.78 |

Second lowest and second highest, for tests that check order: unitary area Isles of Scilly £2,047.96 (2nd) and Nottingham £2,755.39 (62nd).

Ties in 2026/27: one, in the shire districts. Havant (E07000090) and Rushmoor (E07000092) both have area Band D £2,320.28 (joint 21st of 164) and own Band D £246.87 (joint 116th of 164). No tie in any other class or column.

Positions for the profile line (area, then own):

| Council | Class | Area | Own |
|---|---|---|---|
| Burnley | shire districts, 164 | 130th, £2,549.42 | 160th, £351.44 |
| Lancaster | shire districts, 164 | 116th, £2,503.19 | 138th, £272.20 |
| Lewes | shire districts, 164 | 164th, £2,756.17 | 107th, £242.02 |
| Havant | shire districts, 164 | joint 21st | joint 116th |
| Manchester | metropolitan districts, 36 | 10th, £2,312.04 | 6th, £1,872.79 |
| Camden | London, 33 | 20th, £2,207.55 | 20th, £1,697.04 |
| City of London | London, 33 | 3rd, £1,329.56 | 4th, £1,112.38 |
| Windsor and Maidenhead | unitary, 63 | 1st | 1st |
| Dorset | unitary, 63 | 63rd | 58th, £2,205.90 |
| Lancashire County Council | county councils, 21 | not applicable | 12th, £1,801.75 |

## 4. Parish precepts: counts and conventions

`data/national/england.json`, `parishes` (one row per local precepting authority per billing area, with `years["2025-26"]` and `years["2026-27"]`):

- **10,245 rows across 214 billing areas.** Both counts confirmed. 82 of the 296 billing authorities have no row (MHCLG note d: the table includes only local authorities with local precepting authorities).
- Billing areas with parish rows by class: SD 140, UA 49, MD 23, ILB 2 (Westminster: Queen's Park Community Council; City of London: Inner Temple and Middle Temple).
- Types as published: Precepting parish 8,613; Non precepting parish 960 (published "Non-precepting parish"); Group 654; Charter Trustee 15; Temple 2; and one row typed "Precepting Parish" with a capital P. Print the type verbatim.
- Status, 2026/27: 10,241 published, 4 "not-existing" (Bournemouth Charter Trustee and Poole Charter Trustee in Bournemouth, Christchurch and Poole; Boyatt Wood in Eastleigh; St Albans in Gedling, each marked "(removed)"). Status, 2025/26: 10,238 published, 7 "not-existing" (new in 2026/27: Bournemouth Town, Broadstone Town and Poole Town; Deer Park and St Albans in Gedling; Horsham; Cary Moor in Somerset). No "unavailable" in either year.
- 2026/27 published rows: 8,902 with a non zero Band D, 1,339 at £0.00. One negative: Beesby with Saleby (East Lindsey), minus £2.64, published as such. 10,234 rows have a published figure in both years, so a change can be given on those only.
- Every one of the 214 areas has at least one non zero 2026/27 precept.
- Largest area: North Yorkshire, 665 rows.
- National extremes of the non zero 2026/27 Band D: lowest Beesby with Saleby, minus £2.64; highest Inner Temple and Middle Temple (City of London), £2,038.90 each.
- Every one of the 214 GSS codes has a slug in `data/registry/councils.json` (none missing), so `/precepts/parishes/<slug>/` uses the council slug.

**Change.** `parishChange()` in `src/lib/national-data.ts`: the 2026/27 Band D minus the 2025/26 Band D on the same source row, only where both years are "published"; otherwise null, printed "Not comparable". No name matching across rows. This is a calculation and is labelled as one.

**Range in words** (the sentence under each parish page heading). Let R be the area's rows, P the rows published in 2026/27 with a non zero Band D, Z the rows published at £0.00, X the rows not existing in 2026/27.

1. "The {year} return lists {|R|} local precepting authorities in {name}."
2. If P has two or more distinct values: "{|P|} set a Band D precept, from {min} ({names at min}) to {max} ({names at max})." If every row in P has the same value: "{|P| in words if one, else number} set a Band D precept of {value}" with the names. Names: up to three joined with commas and "and"; more than three tied, "{first} and {n} others".
3. If the minimum is negative: write the minimum as "minus £2.64" and add ", a negative precept as published" after the name.
4. If Z is not empty: "{|Z|} set a Band D precept of £0.00."
5. If X is not empty: "{|X|} listed for {previous year} no longer exist in {year}."

Single value areas (14 with one non zero row, and the City of London with two equal rows): Brighton and Hove, Castle Point, City of London (two, both £2,038.90), Elmbridge, Gateshead, Gloucester, Hyndburn, Mansfield, Redditch, Rossendale, Southend-on-Sea, Sunderland, Tameside, Torbay, Westminster. Ties at the minimum: Maldon (two at £18.51) and Sefton (two at £14.53). No tie at the maximum anywhere.

**The billing authority's own share beside it.** The parish page prints the billing authority's own Band D excluding parish precepts from Table 8a or 8c (`authorities[gss].own.bandD`), with its table reference, as the figure a parish precept sits beside on a bill in that parish. Not the area average: that already contains parish precepts as an average.

### Anchors

**Burnley (E07000117)**: 8 rows, all "Precepting parish", all published in both years, 8 comparable. Own Band D £351.44 (Table 8c). Range: from £7.36 (Ightenhill) to £44.06 (Padiham).

| Parish | 2025/26 | 2026/27 | Change |
|---|---|---|---|
| Briercliffe | £18.40 | £19.98 | +£1.58 |
| Cliviger | £9.83 | £9.43 | £0.40 lower (printed "-£0.40" by the existing table helper) |
| Dunnockshaw | £30.30 | £30.77 | +£0.47 |
| Habergham Eaves | £16.48 | £16.52 | +£0.04 |
| Hapton | £26.42 | £27.81 | +£1.39 |
| Ightenhill | £6.92 | £7.36 | +£0.44 |
| Padiham | £38.64 | £44.06 | +£5.42 |
| Worsthorne with Hurstwood | £24.34 | £26.05 | +£1.71 |

Sentence: "The 2026/27 return lists 8 local precepting authorities in Burnley. 8 set a Band D precept, from £7.36 (Ightenhill) to £44.06 (Padiham)."

**Lancaster (E07000121)**: 37 rows (34 Precepting parish, 3 Non precepting parish), 37 comparable. Own Band D £272.20 (Table 8c). Largest Band D precept: **Wennington, £395.11** (2025/26 £441.20; tax base 63.21 Band D equivalents, precept £24,975). Lowest non zero: Over Wyresdale, £12.18. Three at £0.00 (including Cantsfield). Largest precept by income, for the record and not printed: Morecambe, £1,048,786 (Band D £104.05). "Largest precept" on the site means the largest Band D figure; the page never ranks by income. Sentence: "The 2026/27 return lists 37 local precepting authorities in Lancaster. 34 set a Band D precept, from £12.18 (Over Wyresdale) to £395.11 (Wennington). 3 set a Band D precept of £0.00."

**East Lindsey (E07000137)**: 163 rows, 104 non zero, 59 at £0.00. Range from minus £2.64 (Beesby with Saleby, a negative precept as published) to £353.68 (Alford).

**Bournemouth, Christchurch and Poole (E06000058)**: 10 rows, 2 not existing in 2026/27, 5 comparable (three new town councils have no 2025/26 figure).

**Durham (E06000047)**: 130 rows; the Charter Trustees for the City of Durham overlap parish areas (parish note b and g); the existing caveat sentence on the profile moves to the Durham parish page unchanged.

## 5. What A4 does not use

- No precept income, tax base or Band D equivalents on any page (held, not needed; precept income invites a ranking by size that the site does not make).
- No other band than D for parishes (MHCLG publishes Band D only for parishes; other bands are never derived by ratio).
- No ranking of parishes, and no ranking of billing areas by parish figures.
- No county ranking by area figure (counties are not billing authorities).
- No earlier year rankings and no change in position.
