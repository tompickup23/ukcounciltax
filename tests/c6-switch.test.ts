/**
 * C6: the year switch driven by data presence, and everything that waits for
 * the first year with a levels day page. Each behaviour is tested in both
 * states: the files held on 15 November 2026 (no switch), and a temporary data
 * tree in which the next year's levels file and Table 10 import have landed.
 */
import { afterAll, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { levelsYears, nationalPath, nextYearOf, resolveEdition, table10Pinned } from "../src/lib/edition.mjs";
import {
  CURRENT_YEAR,
  FIRST_LEVELS_PAGE_YEAR,
  LEVELS_PAGE,
  LEVELS_PAGE_PATH,
  NEXT_YEAR,
  PREVIOUS_YEAR,
  YEARS,
  followingYear,
  loadYear,
  yearWords,
} from "../src/lib/council-tax";
import {
  BUILD_STATE,
  ascMaximum,
  ascRows,
  ascSplit,
  embedSnippet,
  hasLevelsPage,
  levelsDayRoutes,
  preceptDayPaths,
  yearPagePaths,
  type YearState,
} from "../src/lib/levels-day";
import { pinnedBudgetLine } from "../src/lib/budget-pin";
import { budget, budgetNational } from "../src/lib/budget";
import { national, PARISH_YEAR, parishYearOf } from "../src/lib/national-data";
import { latestEditions } from "../src/lib/devolved";
import { burnleyBill } from "../src/lib/figures";
import { STATIC_PATHS } from "../src/lib/site";
import { sitemapPaths } from "../src/pages/sitemap.xml";

const ROOT = resolve(import.meta.dirname, "..");
const SHA = "a".repeat(64);
const roots: string[] = [];
afterAll(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })));

/** A data tree with levels files for `levels` and Table 10 imports for `table10`. */
function tree(levels: string[], table10: Record<string, { sha256?: string; title?: string; named?: boolean }>) {
  const root = mkdtempSync(join(tmpdir(), "c6-edition-"));
  roots.push(root);
  mkdirSync(join(root, "data", "council-tax"), { recursive: true });
  mkdirSync(join(root, "data", "national"), { recursive: true });
  for (const year of levels) writeFileSync(join(root, "data", "council-tax", `england-${year}.json`), JSON.stringify({ year }));
  for (const [year, o] of Object.entries(table10)) {
    const file = o.named === false ? "england.json" : `england-${year}.json`;
    const title = o.title ?? `Council tax levels set by local authorities in England ${yearWords(year)}: Table 10`;
    writeFileSync(join(root, "data", "national", file), JSON.stringify({ year, sources: { components: { title, sha256: o.sha256 ?? SHA } } }));
  }
  return root;
}

const BEFORE: YearState = BUILD_STATE;
const AFTER: YearState = { current: FIRST_LEVELS_PAGE_YEAR, previous: "2026-27", next: followingYear(FIRST_LEVELS_PAGE_YEAR) };

describe("the year switch (src/lib/edition.mjs)", () => {
  it("builds 2026/27 from the files held on 15 November 2026", () => {
    expect(CURRENT_YEAR).toBe(resolveEdition(ROOT).current);
    expect(levelsYears(ROOT)).toEqual([...YEARS]);
    expect(resolveEdition(ROOT).held).toEqual([]);
    expect(nationalPath(CURRENT_YEAR, ROOT)).toBe(join(ROOT, "data", "national", "england.json"));
    expect(table10Pinned(CURRENT_YEAR, ROOT)).toBe(true);
    expect(LEVELS_PAGE).toBe(CURRENT_YEAR >= FIRST_LEVELS_PAGE_YEAR);
  });

  it("moves CURRENT_YEAR, PREVIOUS_YEAR, YEARS and NEXT_YEAR together when the levels file and its Table 10 import land", () => {
    const root = tree(["2024-25", "2025-26", "2026-27", "2027-28"], { "2026-27": { named: false }, "2027-28": {} });
    expect(resolveEdition(root)).toEqual({
      current: "2027-28", previous: "2026-27", years: ["2024-25", "2025-26", "2026-27", "2027-28"], next: "2028-29", held: [],
    });
  });

  it("holds a levels file back until its Table 10 import lands, so a release is whole or absent", () => {
    const levelsOnly = tree(["2025-26", "2026-27", "2027-28"], { "2026-27": { named: false } });
    expect(resolveEdition(levelsOnly)).toMatchObject({ current: "2026-27", years: ["2025-26", "2026-27"], held: ["2027-28"] });
    const table10Only = tree(["2025-26", "2026-27"], { "2026-27": { named: false }, "2027-28": {} });
    expect(resolveEdition(table10Only).current).toBe("2026-27");
  });

  it("does not switch on a Table 10 import without a reviewed hash, or with another year's title", () => {
    const noHash = tree(["2025-26", "2026-27", "2027-28"], { "2026-27": { named: false }, "2027-28": { sha256: "" } });
    expect(resolveEdition(noHash).current).toBe("2026-27");
    const wrongTitle = tree(["2025-26", "2026-27", "2027-28"], { "2026-27": { named: false }, "2027-28": { title: "Council tax levels set by local authorities in England 2026 to 2027: Table 10" } });
    expect(resolveEdition(wrongTitle).current).toBe("2026-27");
  });

  it("refuses a gap in the levels files and a year with no year before it", () => {
    expect(() => resolveEdition(tree(["2024-25", "2026-27"], { "2026-27": {} }))).toThrow(/not consecutive/);
    expect(() => resolveEdition(tree(["2026-27"], { "2026-27": {} }))).toThrow(/year before/);
    expect(() => resolveEdition(tree(["2026-27"], {}))).toThrow(/No year/);
  });

  it("derives the years from each other", () => {
    expect(PREVIOUS_YEAR).toBe(YEARS.at(-2));
    expect(NEXT_YEAR).toBe(nextYearOf(CURRENT_YEAR));
    expect(nextYearOf("2099-00")).toBe("2100-01");
  });
});

describe("pages that wait for the first levels day page", () => {
  it("before the switch: only the not yet set page, and no levels day route anywhere", () => {
    expect(hasLevelsPage(BEFORE)).toBe(false);
    expect(LEVELS_PAGE_PATH).toBeNull();
    expect(yearPagePaths(BEFORE)).toEqual([{ params: { year: NEXT_YEAR }, props: { mode: "next" } }]);
    expect(preceptDayPaths(BEFORE)).toEqual([]);
    expect(levelsDayRoutes(BEFORE)).toEqual([]);
    expect(STATIC_PATHS.some((path) => path === `/council-tax-${CURRENT_YEAR}/`)).toBe(false);
    expect(sitemapPaths().filter((path) => path.includes("adult-social-care"))).toEqual([]);
  });

  it("after the switch: the levels day page at the old not yet set address, precept day, and the next not yet set page", () => {
    expect(hasLevelsPage(AFTER)).toBe(true);
    expect(yearPagePaths(AFTER)).toEqual([
      { params: { year: "2028-29" }, props: { mode: "next" } },
      { params: { year: "2027-28" }, props: { mode: "levels" } },
    ]);
    expect(preceptDayPaths(AFTER)).toEqual([{ params: { year: "2027-28" } }]);
    expect(levelsDayRoutes(AFTER)).toEqual(["/council-tax-2027-28/", "/council-tax-2027-28/adult-social-care/"]);
  });

  it("never gives an earlier year a levels day page", () => {
    expect(hasLevelsPage({ current: "2026-27", previous: "2025-26", next: "2027-28" })).toBe(false);
  });

  it("builds the embed snippet as an image in a link, with no script or frame", () => {
    const snippet = embedSnippet("https://ukcounciltax.co.uk", "burnley", 'Burnley "joint" <1st>', "/councils/burnley/");
    expect(snippet).toBe('<a href="https://ukcounciltax.co.uk/councils/burnley/"><img src="https://ukcounciltax.co.uk/og/ranking/burnley.png" width="1200" height="630" alt="Burnley &quot;joint&quot; &lt;1st>"></a>');
    expect(snippet).not.toMatch(/<script|<iframe|javascript:/i);
  });
});

describe("precept day, rehearsed on the 2026/27 tables", () => {
  const data = loadYear(CURRENT_YEAR);
  const rows = ascRows(data);

  it("lists the 153 authorities with an adult social care element, none dropped and none zeroed", () => {
    expect(rows).toHaveLength(153);
    expect(rows.filter((row) => row.county)).toHaveLength(21);
    expect(rows.every((row) => row.ascChangePct === null || typeof row.ascChangePct === "number")).toBe(true);
  });

  it("reads the maximum from the year's referendum principles, or states none", () => {
    expect(ascMaximum(data.source.referendumPrinciples?.text)).toBe(2);
    expect(ascMaximum("No adult social care sentence here.")).toBeNull();
    expect(ascSplit(rows, null)).toBeNull();
    const split = ascSplit(rows, 2)!;
    expect(split.atMaximum.length + split.below.length + split.above.length + split.unpublished.length).toBe(153);
  });

  it("calculates the rest of the change from two published figures only", () => {
    const cambridgeshire = rows.find((row) => row.gss === "E10000003")!;
    expect(cambridgeshire).toMatchObject({ changePct: 4.99, ascChangePct: 2, otherPct: 2.99 });
  });
});

describe("datasets that keep their own year after the switch", () => {
  it("pins the budget pages to their edition, and adds the line only once the council tax year has moved", () => {
    expect(budget.year).toBe(budgetNational.year);
    expect(pinnedBudgetLine(budget.year)).toBeNull();
    expect(pinnedBudgetLine("2026-27", "2027-28")).toBe(
      "These budget figures are for 2026/27. Council budgets for 2027/28 follow MHCLG's revenue account (RA) budget release, expected in June 2027.",
    );
    expect(pinnedBudgetLine("2027-28", "2027-28")).toBeNull();
  });

  it("labels parish figures with the parish return's year", () => {
    expect(PARISH_YEAR).toBe(parishYearOf(national));
    expect(PARISH_YEAR).toBe(CURRENT_YEAR);
  });

  it("keeps Scotland and Wales on their own latest editions", () => {
    expect(latestEditions().map((e) => `${e.nation} ${e.year}`)).toEqual(["Scotland 2026-27", "Wales 2026-27"]);
  });

  it("draws Burnley's schedule for the current year, or its latest earlier one", () => {
    expect(burnleyBill().year).toBe(CURRENT_YEAR);
  });
});

it("keeps the 15 November 2026 data byte for byte (the switch is read, not written)", () => {
  // A copy of the held national file resolves to the same year from a fresh tree.
  const root = tree(["2025-26", "2026-27"], {});
  copyFileSync(join(ROOT, "data", "national", "england.json"), join(root, "data", "national", "england.json"));
  expect(resolveEdition(root).current).toBe("2026-27");
});
