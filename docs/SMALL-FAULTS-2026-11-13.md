# Small faults and the parish index | 13 November 2026

Round two prompt 3 from `docs/CODEX-PROMPTS-2026-11-12.md`. Baseline is main
`d7c151c1fd5bdff9b3c0f8bc0924a96d4ffa7144`, after prerequisite PR 65 merged.

## Audit before implementation

Code references below are at the baseline commit. Live pages were inspected
at 375 and 1440 pixels, in both themes, before editing their implementation.

| Item | Baseline evidence | Work in this session |
| --- | --- | --- |
| One set of band table controls | `src/pages/council-tax/[slug].astro:119` renders TaxTable inside the regional loop; the built Band D page has nine controls and nine primary tables | One shared control set above all nine English tables |
| Charge sorting explanation and incoming type | `src/components/TaxTable.astro:27` already explains the type restriction; its script does not restore an incoming type. Profile region link at `src/pages/councils/[slug].astro:214` has no type | Keep the explanation and complete-class gate; add validated type restoration and the profile link |
| Group profile contents | `src/pages/councils/[slug].astro:121` passes a flat list. Burnley prints thirteen links | Four groups retaining every existing link and conditional section |
| Scottish and Welsh names | `src/components/CouncilFinder.astro:14` includes devolved rows for tax profiles; line 24 labels the nation. The built homepage has all 54 devolved rows and nation labels | Already done; leave it unchanged |
| Parish index | `src/pages/precepts/parishes/index.astro:18` renders a static table; the built page has 214 rows and no sort buttons | Council and region sorting with aria-sort, and region chips with aria-pressed |
| Onward links | `src/pages/council-tax/[slug].astro` has band and region navigation at the top but no onward section at the end | Adjacent bands, all other regions and the class-ranking hub |

## Small design decisions

- Band pages keep the band named by their title and URL. Their existing band
  navigation changes band; the shared controls filter names and council types
  and sort all English regional tables. Scottish tables remain separate and
  unchanged. Region pages retain their existing band selector.
- A `type` query value is accepted only when it matches an option offered by
  the page. Invalid values leave all types selected. Nothing is stored.
- All four profile groups are ordinary HTML, usable without scripts. Existing
  link labels, document order, section IDs and source text are retained. The
  first distribution check caught a group order mismatch; the groups were
  corrected without changing the gate or the document sections.
- The parish index sorts by council name or region. Monetary and record-count
  columns are unchanged and unsorted: the page does not acquire a ranking of
  different parish charging areas. Filtering preserves every row and source.
- All other English regions are offered as onward links. This is a directory,
  not a new geographic-adjacency claim. Band links use the existing neighbour
  helper and do not wrap from the last band to the first.
- No existing test assertion requires replacement. New browser journeys also
  run under the actual production headers.

## Baseline measurements

The height includes the whole page with an 812 pixel viewport and loaded fonts.
Tables in existing scroll containers remain in those containers.

| Page | Height at 375 | Height at 1440 | Main table rows |
| --- | ---: | ---: | ---: |
| Band D | 14,519 | 10,938 | 624, including the existing neighbouring-band tables |
| North West | 2,740 | 1,849 | 70, including the full-band drawer |
| Burnley | 13,888 | 10,090 | 88 |
| Parish index | 2,114 | 1,444 | 214 |

## Candidate measurements and validation

The final candidate was measured at the same widths and viewport height, in
both themes. Heights agree between themes. The band page loses eight repeated
control sets; the other pages gain the requested navigation or filter controls.

| Page | Height at 375, before to after | Height at 1440, before to after | Preserved rows |
| --- | ---: | ---: | ---: |
| Band D | 14,519 to 12,019 | 10,938 to 9,406 | 624 |
| North West | 2,740 to 2,970 | 1,849 to 1,966 | 70 |
| Burnley | 13,888 to 14,026 | 10,090 to 10,174 | 88 |
| Parish index | 2,114 to 2,355 | 1,444 to 1,531 | 214 |

All four pages were inspected at 375 and 1440 in both themes, with zero
horizontal page overflow. The pinned design checker passed all four routes
at 390 and 1440 in both themes, including source placement, initial layout
movement, desktop height and accessibility presentation checks. Its LCP and
CLS observations are local lab results, not field performance.

- Unit suite: 356 passed across 54 files, with no skipped tests. After the final
  build, all 38 build-dependent tests across eight files passed again.
- Astro check: 279 files, zero errors, warnings or hints.
- Final build used `BUILD_OG=1`, followed by successful distribution and text
  checks: 909 HTML pages, 908 sitemap URLs, 2,202 chart links and 917 text files.
- Internal link audit: 67,291 destinations, with no missing local files.
- Complete browser suite against the final built preview: 420 passed, including
  all sixteen new cases across phone and desktop. Preview stopped afterwards.
- Actual production-header suite: 104 passed, including the eight new cases.
  No production-header assertion or security permission was relaxed.
- Whole-build number diff against the saved baseline: zero changed, added or
  removed pages, without an allowlist.
- A separate HTML comparison confirms every marked figure, source line and
  table body row is retained across all 909 pages, with unchanged titles, H1s,
  canonicals and existing profile IDs. All 2,845 PNG hashes are identical.
- No data file, vendored file, redirect or source security-header file changed.
  The normal postbuild step hashes the candidate scripts.

This document records a review candidate, not its deployment.

## Prerequisite releases verified in this session

Tom explicitly authorised both merges and continuation in chat. Checked heads
were pinned separately for each merge; no unrelated pull request was merged.

- UK Council Tax PR 65 merged as `d7c151c`. Production run
  [43426163952](https://github.com/tompickup23/ukcounciltax/actions/runs/43426163952)
  completed successfully, including its publish step. The live Burnley profile
  serves the v0.5.0 release stylesheet. Its three profile downloads and five
  budget downloads return HTTP 200 with the baseline SHA256 hashes, verified
  through the live browser.
- UK Councils PR 49 merged as `556f692`. Production run
  [43426183494](https://github.com/tompickup23/ukcouncils/actions/runs/43426183494)
  completed successfully, including publication. The live page has 57 council
  drawers, 432 rendered figures and 13 yearly tables. Birmingham's deep link
  opens its drawer and focuses its heading. Finding Worcestershire opens and
  focuses that council. Both themes at 375 and 1440 have no horizontal overflow.

The next UK Councils session is round two prompt 5, nearby and alike on council
profiles. This session implements the next UK Council Tax session only.

## Review fix, 13 November 2026

A review used the built Band D page at 375 wide. One filter now drove nine
tables, but a region with no match kept its heading, an empty table and its
source lines. Typing "kensington" left the one match 3,116 px below the
filter box, past six empty regions; choosing "Shire district" left three
empty tables of 400 to 450 px each; and nine status lines changed on every
keystroke.

Changes:

- A region with no matching council leaves the page with its heading, and
  its link in "Jump to a region" leaves with it. With scripts off nothing is
  hidden.
- One status line sits under the shared controls, for example
  "1 council shown, in London." or "164 councils shown, in 6 of 9 regions."
  It is the only live region for the nine tables; the line above each table
  stays as plain text. Region pages, which have their own controls, are
  unchanged.
- A table's own line now reads "1 council", not "1 councils".
- The parish index sentence no longer promises sorting when scripts are off.

Measured on the fixed build, both themes agreeing, 812 px viewport:

| Band D state | Match below the controls, 375 | Page height, 375 | Page height, 1440 | Regions shown |
| --- | ---: | ---: | ---: | ---: |
| No filter | 215 px | 12,052 | 9,439 | 9 |
| Name "kensington" | 189 px (3,116 before) | 4,088 | 2,773 | 1 |
| Shire district | 215 px | 9,250 | 7,104 | 6 |
| Inner London borough | 189 px | 4,499 | 3,177 | 1 |

The unfiltered page is 33 px taller than the first build at both widths (the
new status line). No sideways overflow in any state.

Not changed: the controls stay at the top of the tables and do not follow
the reader down the page. Hiding empty regions shortens the journey back,
but a reader in the last region still scrolls up to change the filter.
