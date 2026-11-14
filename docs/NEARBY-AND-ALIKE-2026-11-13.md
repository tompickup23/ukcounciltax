# Nearby and alike | 13 November 2026

## Scope and provenance

This follows the completed round two sessions and the next task in
`HANDOFF-2026-11-12-REVIEW-AND-NEXT.md`. The UK Council Tax baseline is
`bcde00c9fe60e5b369e739913e6e6f6cf9d9a98f`, with PR 66 merged.
The donor is reviewed UK Councils main `f1e33e6`, including the outline
intersection correction in `339921e`. No merge or deployment is recorded here.

Every English council tax profile gains an open Nearby and alike section,
linked from its existing fourth contents group. It lists neighbouring council
areas, the other districts of the same county, and same-type councils in the
same region for other council types. A district's county and similar list are
identical and appear once. Each section also links to the council's existing
class ranking. Names and types are shown without new Band D figures.
The county heading already identifies its links as districts, so their type
is not repeated. County councils remain text where they have no profile.

The section is static HTML and excluded from Pagefind. Existing Scottish and
Welsh onward links, budget game neighbours, map drawings, figures, sources,
canonicals, redirects and security permissions are preserved. The broader
NV5 locator-map interaction is outside this session. No new source is fetched.

The copied geometry uses exact integer segment intersection on the existing
pinned ONS file, including all six pairs that identical-point matching misses.
The method and limits remain visible beside the lists: simplified outlines can
miss a short shared border, and the coastline-clipped map does not bridge sea,
estuary or tidal-river gaps. Point contacts count. No distance or travel
connection is inferred. The same-source limitation remains as in UK Councils.

## Independent dry run

Run `python3 scripts/nearby-dry-run.py` with Shapely installed, or the uv
command in its docstring. It uses GEOS line intersection rather than the site's
TypeScript segment implementation. Unlike the donor script, it derives its
council and county rows directly from this repository's registry and current
England edition; no prior output file is required.

| Measure | Count |
| --- | ---: |
| English profiles | 296 |
| Directed boundary links | 1,506 |
| Reciprocal boundary pairs | 753 |
| Districts with county links | 164 |
| Directed same-county links | 1,244 |
| Boundary neighbours per council | 0 to 15 |

All boundary and same-county GSS lists match the reviewed UK Councils dry run.
Only the Isle of Wight and Isles of Scilly have neither kind; both retain
same-type regional links and their class ranking. Burnley has five map
neighbours and eleven other Lancashire districts. City of London has five
map neighbours. The six corrected boundary pairs are required by regression
tests, alongside reciprocal joins, missing-boundary rejection, no self links,
valid destinations, absence of money fields and complete static rendering.

Boundary SHA256: `b2c54790c27cbacad55228ec574926d855eacfe0d7cab3f2990af85acc888a23`.

Dry-run SHA256: `2ba98d69dee53787cee38c0ad2b9bbd962e8fd9a0702d50bd91ce1b3bb1a90ab`.

The donor and destination registry snapshots also match byte for byte.
The dry-run file differs from the donor in row collation and records a county
only for districts, rather than carrying unrelated registry labels such as
Outer London. The neighbour and same-county lists are identical.

## Validation

Node 22.23.4. All 362 unit tests pass across 55 files after the complete build,
with no skipped checks. Astro check reports zero errors, warnings or hints.
The full `BUILD_OG=1` build passes, with 909 HTML pages and 908 sitemap URLs.
The distribution check confirms 2,202 chart download links; the text sweep
passes 917 files. The internal-link audit checks 72,249 local destinations
without a missing file.

The baseline build took 241.06 seconds; the candidate took 239.67 seconds.
Both generated all images. This is a local observation, not a performance claim.
All 2,845 PNGs and every inline SVG in all 909 pages are byte-identical.
Every existing anchor, link, title, H1 and canonical is retained. There are no
duplicate IDs. Scottish and Welsh pages and budget game pages retain their
exact HTML. The whole-build number diff changes only the 296 English profiles:
each adds one `2026` token in the repeated ONS source title. No number is
removed and no financial or SVG figure changes. No assertion is made obsolete.

| Burnley page height | Baseline | Candidate |
| --- | ---: | ---: |
| 375 pixels wide | 14,026 | 15,459 |
| 1440 pixels wide | 10,174 | 10,868 |

The increase comes from the open lists and the contents entry. Burnley,
Cornwall, the Isle of Wight and the City of London were captured at both widths
in both themes. All sixteen measurements have zero horizontal overflow.
Representative section captures for every page at both widths were visually
inspected, covering both themes. Labels wrap without clipping; long London
lists remain open on a phone, as in the reviewed UK Councils form.

All 440 browser tests pass with two workers, including twenty new cases for
the section, its links and class ranking, scripts-off access and accessibility.
The pinned design checker passes all four pages at 390 and 1440 pixels in
both themes, with zero failed checks. Its screenshots are outside the checkout
as the checker requires; the local log records the result.
All 104 tests under the actual production headers pass with two workers.
No assertion, timeout, security policy or vendored file was changed.
The preview server and manual browser were stopped; the CSP test server
closed when its suite completed.
Local logs, baseline output and screenshots remain ignored.
