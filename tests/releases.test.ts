import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sax from "sax";
import { YEARS } from "../src/lib/council-tax";
import { datasetItems, expectedDatasets, heldYears, historyFinding, parishFinding, releaseItems, renamedParishes } from "../src/lib/releases";
import { GET as rss } from "../src/pages/rss.xml";
import { sitemapPaths } from "../src/pages/sitemap.xml";

const read = (path: string) => JSON.parse(readFileSync(join(process.cwd(), path), "utf8"));
const national = read("data/national/england.json");

// Built from character codes so this file carries none of the characters it looks for.
const DASHES = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]|&${"m"}dash;|&${"n"}dash;|&#(?:8211|8212|x2013|x2014);|\\s-\\s`, "i");

describe("parish findings", () => {
  it("equal a recomputation from the data file", () => {
    const [prev, cur] = Object.keys(national.parishes[0].years).sort();
    const counts = { rose: 0, fell: 0, same: 0, zero: 0, newRows: 0, ceased: 0, negative: 0, structural: 0 };
    for (const p of national.parishes) {
      const texts: string[] = p.notes.map((note: { text: string }) => note.text);
      const a = p.years[prev];
      const b = p.years[cur];
      if (a.status === "not-existing") { counts.newRows += 1; continue; }
      if (b.status === "not-existing") { counts.ceased += 1; continue; }
      if (texts.some((t) => /no longer exist|formed|split/i.test(t))) { counts.structural += 1; continue; }
      if (texts.some((t) => /negative/i.test(t))) { counts.negative += 1; continue; }
      if (b.bandDPence > a.bandDPence) counts.rose += 1;
      else if (b.bandDPence < a.bandDPence) counts.fell += 1;
      else if (b.bandDPence === 0) counts.zero += 1;
      else counts.same += 1;
    }
    const f = parishFinding();
    expect(f.rose).toBe(counts.rose);
    expect(f.fell).toBe(counts.fell);
    expect(f.unchangedNonZero).toBe(counts.same);
    expect(f.zeroBoth).toBe(counts.zero);
    expect(f.newRows).toBe(counts.newRows);
    expect(f.ceasedRows).toBe(counts.ceased);
    expect(f.negative).toBe(counts.negative);
    expect(f.structural).toBe(counts.structural);
    expect(f.compared).toBe(counts.rose + counts.fell + counts.same + counts.zero);
    expect(f.compared + f.newRows + f.ceasedRows + f.negative + f.structural + f.unavailable).toBe(national.parishes.length);
  });

  it("finds note rows by the note text, never by a name", () => {
    const source = readFileSync(join(process.cwd(), "src/lib/releases.ts"), "utf8");
    for (const p of national.parishes.filter((row: { notes: unknown[] }) => row.notes.length > 0)) {
      expect(source.includes(`"${p.name}"`)).toBe(false);
    }
  });
});

describe("renamed parishes", () => {
  it("are counted from the changes sheet and found among the compared rows", () => {
    const rows: string[][] = national.parishChanges;
    const start = rows.findIndex((row) => row.length === 1 && /^Renamed parishes/i.test(row[0]));
    let listed = 0;
    for (const row of rows.slice(start + 2)) {
      if (row.length <= 1) break;
      listed += 1;
    }
    const f = parishFinding();
    expect(renamedParishes()).toHaveLength(listed);
    expect(f.renamedListed).toBe(listed);
    expect(f.renamedCompared).toBeLessThanOrEqual(listed);
    expect(f.renamedGrouped).toBe(renamedParishes().filter((e) => /grouped with/i.test(e.newName)).length);
  });

  it("returns none when the sheet holds no renamed list", () => {
    expect(renamedParishes([["Background"], ["Some text"]])).toEqual([]);
  });
});

describe("Band D history findings", () => {
  it("equal a recomputation from the data file", () => {
    const series = Object.values(national.history) as { area: { values: Record<string, number | null> } }[];
    const years = Object.keys(series[0].area.values).sort();
    const first = years[0];
    const last = years.at(-1)!;
    const ok = (v: number | null | undefined) => v !== null && v !== undefined;
    let rose = 0, fell = 0, same = 0, compared = 0;
    for (let i = 1; i < years.length; i += 1) {
      for (const s of series) {
        const a = s.area.values[years[i - 1]];
        const b = s.area.values[years[i]];
        if (!ok(a) || !ok(b)) continue;
        compared += 1;
        if (b! > a!) rose += 1; else if (b! < a!) fell += 1; else same += 1;
      }
    }
    const f = historyFinding();
    expect(f.firstYear).toBe(first);
    expect(f.latestYear).toBe(last);
    expect(f.withFirst).toBe(series.filter((s) => ok(s.area.values[first])).length);
    expect(f.withLatest).toBe(series.filter((s) => ok(s.area.values[last])).length);
    expect(f.higherLatestThanFirst).toBe(series.filter((s) => ok(s.area.values[first]) && ok(s.area.values[last]) && s.area.values[last]! > s.area.values[first]!).length);
    // Pairs a note sets aside leave the comparison; the rest add up.
    expect(f.totals.compared + f.totals.excluded).toBe(compared);
    expect(f.totals.rose + f.totals.fell + f.totals.unchanged).toBe(f.totals.compared);
    expect(Math.abs(f.totals.rose - rose) + Math.abs(f.totals.fell - fell) + Math.abs(f.totals.unchanged - same)).toBe(f.totals.excluded);
  });

  it("sets aside the pairs a note says are not comparable", () => {
    const f = historyFinding();
    for (const e of f.exclusions) expect(e.text).toMatch(/not directly comparable|Percentage change between/);
    expect(f.totals.excluded).toBe(f.exclusions.reduce((sum, e) => sum + e.councils, 0));
  });

  it("states a basis the data supports", () => {
    const f = historyFinding();
    expect(f.basisCheck).not.toBeNull();
    expect(f.basisCheck!.matched).toBe(f.basisCheck!.compared);
    expect(f.englandRowHeld).toBe(false);
  });
});

async function feed(): Promise<string> {
  const response = await rss({} as Parameters<typeof rss>[0]);
  return (response as Response).text();
}

describe("the feed", () => {
  it("parses with an XML parser and carries one item per dataset", async () => {
    const xml = await feed();
    const parser = sax.parser(true);
    const items: Record<string, string>[] = [];
    let current: Record<string, string> | null = null;
    let tag = "";
    parser.onopentag = (node) => {
      tag = node.name;
      if (node.name === "item") current = {};
    };
    parser.ontext = (text) => {
      if (current && tag) current[tag] = (current[tag] ?? "") + text;
    };
    parser.onclosetag = (name) => {
      if (name === "item" && current) {
        items.push(current);
        current = null;
      }
      tag = "";
    };
    parser.write(xml).close();
    const ids = new Set(items.map((item) => item.guid));
    const byId = new Map(releaseItems().map((item) => [item.id, item.dataset]));
    const datasets = new Set([...ids].map((id) => byId.get(id)));
    // A levels item is expected only for a year whose data file exists and whose source records a publication date.
    const levels = YEARS.filter((year) => {
      const path = join(process.cwd(), "data", "council-tax", `england-${year}.json`);
      return existsSync(path) && Boolean(JSON.parse(readFileSync(path, "utf8")).source?.published);
    }).map((year) => `levels-${year}`);
    expect(expectedDatasets().filter((d) => d.startsWith("levels-"))).toEqual(levels);
    expect([...datasets].filter((d) => d?.startsWith("levels-")).sort()).toEqual([...levels].sort());
    for (const dataset of expectedDatasets()) expect(datasets.has(dataset), dataset).toBe(true);
    for (const item of items) {
      expect(item.title?.trim()).toBeTruthy();
      expect(item.link).toMatch(/^https:\/\/ukcounciltax\.co\.uk\//);
      expect(Number.isNaN(new Date(item.pubDate).getTime())).toBe(false);
      expect(item.description).toMatch(/\S/);
    }
  });

  it("skips a listed year whose data file does not exist", () => {
    // A year built from numbers, so no year label is typed here; no data file is held for it.
    const missing = `${2090 + 9}-${String(100).slice(1)}`;
    expect(existsSync(join(process.cwd(), "data", "council-tax", `england-${missing}.json`))).toBe(false);
    expect(heldYears([...YEARS, missing])).toEqual(heldYears());
    expect(() => datasetItems([...YEARS, missing])).not.toThrow();
    expect(datasetItems([...YEARS, missing]).some((item) => item.dataset === `levels-${missing}`)).toBe(false);
    expect(datasetItems([...YEARS, missing]).map((item) => item.id)).toEqual(datasetItems().map((item) => item.id));
  });

  it("uses a parser that rejects malformed XML", () => {
    expect(() => sax.parser(true).write("<rss><item></rss>").close()).toThrow();
  });

  it("has no dashes", async () => {
    expect(DASHES.test(await feed())).toBe(false);
  });

  it("dates the HMRC band stock item by its recorded publication date", () => {
    const stock = read("data/national/sources.json").bandStock;
    const item = releaseItems().find((i) => i.dataset === "bandStock");
    expect(item?.date).toBe(stock.published);
    expect(item?.dateKind).toBe("published");
  });
});

describe("year labels", () => {
  it("are read from the data, never typed, in the findings and feed sources", () => {
    const typed = /\b(?:19|20)\d{2}\/\d{2}\b/;
    for (const file of ["src/lib/releases.ts", "src/pages/findings.astro", "src/pages/changes.astro", "src/pages/rss.xml.ts"]) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(typed.test(source), file).toBe(false);
    }
  });
});

describe("the sitemap", () => {
  it("lists /findings/ and /changes/", () => {
    expect(sitemapPaths()).toContain("/findings/");
    expect(sitemapPaths()).toContain("/changes/");
  });
});
