import { describe, expect, test } from "vitest";
import { devolvedRows, englishRows } from "../src/lib/council-picker";
import { gameNeighbours, touchingAreas } from "../src/lib/game-neighbours";
import { matchesCouncil } from "../src/lib/council-search";
import { budget } from "../src/lib/budget";
import { councilPages } from "../src/lib/paths";

describe("council picker rows (NV1)", () => {
  test("every English billing authority, A to Z, one row per profile route", () => {
    const rows = englishRows("profile");
    expect(rows).toHaveLength(councilPages().length);
    expect(rows).toHaveLength(296);
    expect(rows.map((row) => row.name)).toEqual([...rows.map((row) => row.name)].sort((a, b) => a.localeCompare(b, "en-GB")));
    expect(rows.every((row) => /^\/councils\/[a-z0-9-]+\/$/.test(row.href))).toBe(true);
  });

  test("the budget destination links every row to its game and marks the councils without a return", () => {
    const rows = englishRows("budget");
    expect(rows.every((row) => /^\/tools\/budget\/[a-z0-9-]+\/$/.test(row.href))).toBe(true);
    const missing = Object.entries(budget.councils).filter(([gss, council]) => council.status === "no return" && rows.some((row) => row.gss === gss));
    expect(rows.filter((row) => row.noReturn).map((row) => row.gss).sort()).toEqual(missing.map(([gss]) => gss).sort());
    expect([rows.filter((row) => !row.noReturn).length, rows.filter((row) => row.noReturn).length]).toEqual([287, 9]);
    expect(englishRows("profile").some((row) => row.noReturn)).toBe(false);
  });

  test("a county finds its districts and a region finds its councils", () => {
    const rows = englishRows("profile");
    const lancashire = rows.filter((row) => matchesCouncil("Lancashire", row.search));
    expect(lancashire.filter((row) => row.county === "Lancashire")).toHaveLength(12);
    expect(rows.filter((row) => row.county === "Lancashire")).toHaveLength(12);
    expect(rows.filter((row) => matchesCouncil("north east", row.search) && row.region === "North East")).toHaveLength(12);
  });

  test("the 54 Scottish and Welsh councils, each labelled by nation", () => {
    const rows = devolvedRows();
    expect(rows).toHaveLength(54);
    expect(rows.filter((row) => row.type === "Scottish council" && row.region === "Scotland" && row.href.startsWith("/scotland/"))).toHaveLength(32);
    expect(rows.filter((row) => row.type === "Welsh council" && row.region === "Wales" && row.href.startsWith("/wales/"))).toHaveLength(22);
  });
});

describe("play a neighbour (NV2)", () => {
  test("touching areas are symmetric and an island touches none", () => {
    const touching = touchingAreas();
    for (const [a, set] of touching) for (const b of set) expect(touching.get(b)?.has(a)).toBe(true);
    expect(touching.get("E06000046")).toBeUndefined();
  });

  test("a shire district offers the other districts of its county with a game", () => {
    const burnley = gameNeighbours("E07000117");
    expect(burnley.basis).toBe("county");
    expect(burnley.county).toBe("Lancashire");
    expect(burnley.neighbours.map((n) => n.name)).toEqual(["Chorley", "Fylde", "Hyndburn", "Lancaster", "Pendle", "Preston", "Ribble Valley", "Rossendale", "South Ribble", "West Lancashire", "Wyre"]);
  });

  test("a single tier council offers the councils it touches in the boundary file, without the ones that sent no return", () => {
    const manchester = gameNeighbours("E08000003");
    expect(manchester.basis).toBe("boundary");
    expect(manchester.neighbours.map((n) => n.name)).toEqual(["Bury", "Cheshire East", "Oldham", "Rochdale", "Salford", "Stockport", "Tameside", "Trafford"]);
    const wolverhampton = gameNeighbours("E08000031");
    expect(touchingAreas().get("E08000031")?.has("E08000027")).toBe(true);
    expect(wolverhampton.neighbours.map((n) => n.name)).not.toContain("Dudley");
    expect(gameNeighbours("E06000046").neighbours).toEqual([]);
  });
});
