import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { lineGeometry, niceStep, type SeriesPoint } from "../src/components/band-d-line";
import { national } from "../src/lib/national-data";
import { CURRENT_YEAR, loadYear } from "../src/lib/council-tax";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const areaSeries = (gss: string): SeriesPoint[] =>
  Object.entries(national.history[gss].area.values).map(([year, value]) => ({ year, value }));
const englandSeries = (): SeriesPoint[] =>
  (loadYear(CURRENT_YEAR).england.history?.rows ?? []).map((r) => ({ year: r.year, value: r.pounds }));
const published = (s: SeriesPoint[]) => s.filter((p) => typeof p.value === "number").map((p) => ({ year: p.year, value: p.value }));

describe("Band D line geometry", () => {
  it("plots exactly the published series for every council, in order", () => {
    for (const gss of Object.keys(national.history)) {
      const series = areaSeries(gss);
      const g = lineGeometry(series);
      expect(g.points.map((p) => ({ year: p.year, value: p.value }))).toEqual(published(series));
      expect(g.missing).toEqual(series.filter((p) => p.value === null).map((p) => p.year));
    }
  });

  it("plots exactly the published England series", () => {
    const series = englandSeries();
    expect(series.length).toBeGreaterThan(1);
    const g = lineGeometry(series);
    expect(g.points.map((p) => ({ year: p.year, value: p.value }))).toEqual(published(series));
  });

  it("places a higher value higher on the chart and keeps every point inside the plot", () => {
    const series = areaSeries(Object.keys(national.history)[0]);
    const g = lineGeometry(series);
    for (const p of g.points) {
      expect(p.x).toBeGreaterThanOrEqual(g.plot.left);
      expect(p.x).toBeLessThanOrEqual(g.plot.right);
      expect(p.y).toBeGreaterThanOrEqual(g.plot.top);
      expect(p.y).toBeLessThanOrEqual(g.plot.bottom);
    }
    const sorted = [...g.points].sort((p, q) => p.value-q.value);
    const [a, b] = [sorted[0], sorted.at(-1)!];
    expect(b.y).toBeLessThan(a.y);
    expect(g.yTicks.at(-1)!.value).toBeGreaterThanOrEqual(Math.max(...g.points.map((p) => p.value)));
  });

  it("draws no point for a missing year and does not join the line across it", () => {
    const series: SeriesPoint[] = [
      { year: "2001-02", value: 100 },
      { year: "2002-03", value: 110 },
      { year: "2003-04", value: null },
      { year: "2004-05", value: 130 },
      { year: "2005-06", value: 140 },
    ];
    const g = lineGeometry(series);
    expect(g.points.map((p) => p.year)).toEqual(["2001-02", "2002-03", "2004-05", "2005-06"]);
    expect(g.missing).toEqual(["2003-04"]);
    expect(g.segments).toHaveLength(2);
    const gapX = g.xOf(2);
    for (const d of g.segments) {
      const xs = [...d.matchAll(/[ML]([\d.]+),/g)].map((m) => Number(m[1]));
      const crosses = Math.min(...xs) < gapX && Math.max(...xs) > gapX;
      expect(crosses).toBe(false);
    }
  });

  it("leaves an isolated year as a point with no line, and unknown is not zero", () => {
    const g = lineGeometry([
      { year: "2001-02", value: null },
      { year: "2002-03", value: 120 },
      { year: "2003-04", value: null },
    ]);
    expect(g.points).toHaveLength(1);
    expect(g.segments).toHaveLength(0);
    expect(g.points.some((p) => p.value === 0)).toBe(false);
  });

  it("keeps the one council series with a gap in the middle broken (Derby, 1996/97)", () => {
    const series = areaSeries("E06000015");
    expect(series.find((p) => p.year === "1996-97")?.value).toBeNull();
    const g = lineGeometry(series);
    expect(g.points.some((p) => p.year === "1996-97")).toBe(false);
    expect(g.segments.length).toBe(2);
  });

  it("labels the first and last years on the axis", () => {
    const series = areaSeries(Object.keys(national.history)[0]);
    const g = lineGeometry(series);
    expect(g.xTicks[0].year).toBe(series[0].year);
    expect(g.xTicks.at(-1)!.year).toBe(series.at(-1)!.year);
    for (let i = 1; i < g.xTicks.length; i++) expect(g.xTicks[i].x-g.xTicks[i-1].x).toBeGreaterThanOrEqual(60);
  });

  it("chooses round gridline steps", () => {
    expect(niceStep(2392)).toBe(1000);
    expect(niceStep(160)).toBe(50);
    expect(niceStep(0)).toBe(1);
  });
});

// Built from parts so this file does not itself contain the characters it bans.
const EN = String.fromCharCode(0x2013);
const EM = String.fromCharCode(0x2014);
const SPACED_HYPHEN = ` ${String.fromCharCode(0x2d)} `;
const BANNED = new RegExp(`[${EN}${EM}]|&(?:ndash|mdash|#821[12]|#x201[34]);|\\\\u201[34]|${SPACED_HYPHEN}`, "i");
const OWNED = [
  "src/components/BandDLine.astro",
  "src/components/band-d-line.ts",
  "src/components/LongTaxHistory.astro",
  "tests/band-d-line.test.ts",
];

describe("Band D line text", () => {
  it("has no dashes or spaced hyphens in the chart files", () => {
    for (const file of OWNED) {
      const text = readFileSync(join(ROOT, file), "utf8");
      const bad = text.split("\n").filter((line) => BANNED.test(line));
      expect(bad, file).toEqual([]);
    }
  });
});

const PAGES = [
  { file: "src/pages/index.astro", uses: /<BandDLine\b/, html: "index.html" },
  { file: "src/pages/council-tax/index.astro", uses: /<BandDLine\b/, html: "council-tax/index.html" },
  { file: "src/pages/councils/[slug].astro", uses: /<LongTaxHistory\b[^>]*view="chart"/, html: "councils/derby/index.html" },
];

describe("Band D line on each page that used the bars", () => {
  it("is used in every page source, and the bar chart is gone", () => {
    for (const page of PAGES) {
      const source = readFileSync(join(ROOT, page.file), "utf8");
      expect(source, page.file).toMatch(page.uses);
      expect(source, page.file).not.toMatch(/HistoryBars/);
    }
    expect(existsSync(join(ROOT, "src/components/HistoryBars.astro"))).toBe(false);
  });

  // Runs against the last build. npm run build writes dist; a fresh checkout
  // without one skips this block and the source checks above still apply.
  describe.skipIf(!existsSync(join(DIST, "index.html")))("in the built pages", () => {
    const circles = (html: string) => {
      const figure = html.match(/<figure[^>]*data-band-d-line[\s\S]*?<\/figure>/)?.[0] ?? "";
      return [...figure.matchAll(/<circle[^>]*data-year="([^"]+)"[^>]*data-value="([^"]+)"/g)].map((m) => ({ year: m[1], value: Number(m[2]) }));
    };

    it("renders the line with one point per published year on each page", () => {
      const expected: Record<string, SeriesPoint[]> = {
        "index.html": englandSeries(),
        "council-tax/index.html": englandSeries(),
        "councils/derby/index.html": areaSeries("E06000015"),
      };
      for (const page of PAGES) {
        const html = readFileSync(join(DIST, page.html), "utf8");
        expect(html, page.html).toContain("data-band-d-line");
        expect(html, page.html).not.toMatch(/class="history-bars/);
        expect(circles(html), page.html).toEqual(published(expected[page.html]));
        expect(html.match(/<figure[^>]*data-band-d-line[\s\S]*?<\/figure>/)?.[0], page.html).toMatch(/<title id="[^"]+"[^>]*>[^<]+<\/title><desc id="[^"]+"[^>]*>[^<]+<\/desc>/);
      }
    });

    it("renders on every council page", () => {
      const dirs = readdirSync(join(DIST, "councils"), { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(DIST, "councils", d.name, "index.html")));
      expect(dirs.length).toBeGreaterThan(200);
      for (const d of dirs) {
        const html = readFileSync(join(DIST, "councils", d.name, "index.html"), "utf8");
        expect(html, d.name).toContain("data-band-d-line");
      }
    });
  });
});
