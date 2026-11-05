import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sax from "sax";
import { expectedDatasets, historyFinding, parishFinding, releaseItems } from "../src/lib/releases";
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
    for (const dataset of expectedDatasets()) expect(datasets.has(dataset), dataset).toBe(true);
    for (const item of items) {
      expect(item.title?.trim()).toBeTruthy();
      expect(item.link).toMatch(/^https:\/\/ukcounciltax\.co\.uk\//);
      expect(Number.isNaN(new Date(item.pubDate).getTime())).toBe(false);
      expect(item.description).toMatch(/\S/);
    }
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

describe("the sitemap", () => {
  it("lists /findings/ and /changes/", () => {
    expect(sitemapPaths()).toContain("/findings/");
    expect(sitemapPaths()).toContain("/changes/");
  });
});
