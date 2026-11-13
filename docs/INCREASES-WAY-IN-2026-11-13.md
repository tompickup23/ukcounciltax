# Increases page way in | 13 November 2026

Implements round two prompt 1. Review candidate, not deployed.

The increases page now opens with the published current-year answer and offers a council finder before the tables. Choosing a council brings its unchanged own-share row into view, marks it and moves keyboard focus there. Earlier years remain complete inside closed native details, and links into them open the correct year on load, hash change or click.

The next-year notice is reduced to one paragraph linking to the existing next-year page. The whole-bill band and period controls remain available.

## Measurements

Baseline: main at `4e2ff87`. Measured at an 812 pixel viewport height after fonts loaded. Both themes give the same heights.

| Measure | Before | After |
|---|---:|---:|
| Page height at 375 pixels wide | 17,671 px | 8,487 px |
| Page height at 1440 pixels wide | 12,242 px | 6,087 px |
| Tables in the static page | 12 | 12 |
| Table rows, including headers | 1,291 | 1,291 |
| Billing councils with a published current own-share change | 296 | 296 |
| Counties with a published current own-share change | 21 | 21 |

## Preservation and decisions taken

- Every table cell, table link and within-class row order matches the baseline. All 17 figure source lines, figure labels and values, caveats, 39 existing anchors, title, H1 and canonical are unchanged. No data source or redirect changed.
- The finder reuses the existing picker rows and matching helper. It includes the 21 county rows already printed on this page, labelled separately; Lancashire therefore offers the county and its 12 districts. It lists the first 12 matches and offers the rest through a button, using the existing shared limit.
- A selection targets the current own-share table. Missing rows receive a written absence message. The query and choice are not stored or put in the URL. The finder is hidden without scripts, and reserves its space before its module runs when scripts are available.
- All 2,845 PNGs match their baseline SHA256 hashes. No drawing or vendored kit file changed.
- The whole-build number comparison finds only the removed dates and repeated year labels from the explicitly shortened next-year notice. No monetary amount, percentage, table figure or SVG number changes.
- No obsolete assertion needed replacement. The existing CSP interaction test is extended and a dedicated browser suite is added; no gate or tolerance changes.

## Validation

- Initial full unit run: 347 passed, nine built-page checks deferred. All eight files containing conditional built-page checks were rerun after the final build: 38 passed, none skipped.
- Astro check: zero errors, warnings or hints.
- Full build with share images passed. Distribution checks: 909 pages, 908 sitemap URLs and 2,202 chart image links. Text sweep: 917 files passed.
- Full Chromium browser suite: 404 passed, including 16 new cases for focus, highlighting, county and exact-region matching, missing rows, scripts off, deep links without native browser assistance, accessibility and both themes.
- Production CSP suite: 94 passed in the full run. Two existing Burnley budget scenario cases timed out during a 1.9 hour execution gap; both passed in a focused one-worker rerun (30.4 and 36.6 seconds), with their original timeouts and assertions unchanged. All 96 cases are covered successfully, including the new finder and year-opening interactions. The failed-run traces were retained locally.
- Before and after views inspected at 375 and 1440 in both themes, plus the mobile finder and highlighted row. No horizontal overflow.

The checkout initially lacked its pinned Chromium revision. It was installed and the unchanged browser guard passed before testing. No browser gate, assertion or tolerance was weakened.

## Pages allowed to differ

```text
increases/index.html
```

Current-year figures move first, earlier years collapse, the finder is added and the next-year notice loses its release-date list and repeated year labels. Every existing financial figure and table remains unchanged.

## Pages to capture

```text
/increases/
```

Built with Codex from a brief prepared in Claude Code. No merge, tag or deployment performed.

Next: round two prompt 2, the kit upgrade, after this change merges.
