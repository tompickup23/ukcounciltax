# A3 amendments | 10 November 2026

Written in Claude Code after the phase 1b stop recorded in `A3-ARCHIVE-HANDOVER-2026-11-09.md`. Where this note and `A3-PROFILE-BRIEF.md` differ, this note wins. Everything else in the brief stands, including its stop conditions. The decisions cited are in `docs/PLAN-2026-11-10-SPLIT-AND-NETWORK.md` on main (PR 42).

## 1. The stop is resolved: bill bar label and title (phase 5b)

The kit draws each part name on one line beside its charge and has no wrapping option, so the brief's own part label overlaps the charge. A probe on a throwaway copy of `c15b7cc` drew the bill chart for all 296 councils in light hex, dark hex and inline css (888 draws): the brief's label passes for 102 councils and fails for 194; the wording below passes for all 296 with the kit, its gates and every figure unchanged, and the unmodified `tests/profile-charts.test.ts` then passes.

`src/lib/figures.ts`, the own part of the bill figure:

```
-      {kind: "own", name: `${authority.name} council, including average local precepts`, bandDPence: components.ownWithParishPence},
+      {kind: "own", name: `${authority.name} council`, bandDPence: components.ownWithParishPence},
```

`src/lib/kit-charts.ts`, the bill chart title:

```
-      total: `${key}.bill.total`, title: `Where a Band D bill in ${tax.name} goes, ${year}`} satisfies BillAnatomyOptions,
+      total: `${key}.bill.total`, title: `Where a Band D bill in ${tax.name} goes, ${year}, council part including average local precepts`} satisfies BillAnatomyOptions,
```

The phrase then appears in the drawing's title, the caption of the kit's table twin and the alt text. The existing HTML table under the chart keeps its own row label as the brief has it. Update any assertion that quotes the old label or title to the new strings. After the page is built, look at the Burnley and the Bournemouth, Christchurch and Poole bill charts at 390 and 1440 in both themes: the longer title wraps, and that was not captured in the probe.

The full sweep took 237 seconds against the test's 300,000 ms timeout. Raising that timeout to 900,000 ms is allowed; it is a run time allowance, not a gate tolerance.

## 2. Phase 9: no Asylum Stats line (decision N2)

Delete the Asylum Stats row from the strip table. Burnley's strip has five lines, not six. Add an assertion that no built page contains `asylumstats.co.uk`. Main already skips that site in `sisterLinks` once the navigation PR has merged; if it has not, make the same two line change here.

The strip is not added to the budget routes. Budget routes stay untouched in this PR, as the handover records.

## 3. Phase 10: section order and the action links

Final order, replacing the brief's: header; PageContents; `#council-tax`; three action links; `CouncilActions` (share and print); `#precept-breakdown`; `#compared`; `#map`; `#history`; `#discounts-and-paying`; `#who-sets-it`; `#mayoral-precept`; `#parish-precepts`; `#band-mix`; `#collection`; `#where-money-goes`; `#reorganisation`; `#more`.

Reason: a resident wants the bill breakdown, the comparison and the history before band stock and collection, which are specialist. `PageContents` is built from document order, so its assertion is unchanged. `tests/collection-rates.test.ts` still finds `#collection` after `#band-mix`.

The row of loose links under the band answer is cut to three: "What makes up this bill" to `#precept-breakdown`; "Compare this council" as today; and the budget game link as today, for councils with a budget route. The help, band check and GOV.UK links move into `#discounts-and-paying`. No link target is dropped from the page.

## 4. Scope and order of work

- Phase 12 (Scottish and Welsh pages) is out of this PR, as the handover records.
- Fetch and rebase onto `origin/main` before anything else. Main has moved since the checkpoint: the game polish, scenario mode, the CI number diff and design check, and (once merged) the navigation PR, which changes `src/lib/site.ts`, the header, the footer, `src/pages/index.astro`, `src/lib/registry.ts` and the privacy page. Keep main's side of any conflict in those files and reapply only what an A3 phase needs.
- Then apply section 1 in a new commit on top of the checkpoint so phase 1b passes, and continue from phase 1c in the brief's order.
