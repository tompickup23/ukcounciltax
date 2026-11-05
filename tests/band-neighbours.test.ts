import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BANDS, CURRENT_YEAR, loadYear, pounds, type Band } from "../src/lib/council-tax";
import { devolved } from "../src/lib/devolved";
import {
  BAND_PROPORTIONS,
  LAST_REVIEWED,
  fullBandEdition,
  neighbourBands,
  neighbourLines,
  positionLabel,
} from "../src/lib/band-neighbours";

const ROOT = process.cwd();
const data = loadYear(CURRENT_YEAR);
const authorities = Object.values(data.authorities);
const page = (band: Band) => join(ROOT, "dist", "council-tax", `band-${band.toLowerCase()}`, "index.html");
const built = BANDS.every((band) => existsSync(page(band)));

// Built from parts so this file does not carry the characters it looks for.
const DASH_CHARS = new RegExp(`[\\u${"2013"}\\u${"2014"}]|&(?:m|n)dash;|&#(?:x201[34]|821[12]);`, "i");
const DASHES = new RegExp(`${DASH_CHARS.source}|${[" ", "-", " "].join("")}`, "i");

describe("neighbouring band lines", () => {
  it("Band A has no lower band and Band H no higher band", () => {
    expect(neighbourBands("A")).toEqual({ lower: null, higher: "B" });
    expect(neighbourBands("H")).toEqual({ lower: "G", higher: null });
    for (const row of authorities) {
      expect(neighbourLines(row.bands, "A").map((line) => line.position)).toEqual(["higher"]);
      expect(neighbourLines(row.bands, "H").map((line) => line.position)).toEqual(["lower"]);
    }
  });

  it("every English line equals the published figure for the neighbouring band in the same MHCLG row", () => {
    expect(authorities.length).toBeGreaterThan(0);
    for (const row of authorities) {
      for (const [index, band] of BANDS.entries()) {
        for (const line of neighbourLines(row.bands, band)) {
          const expected = line.position === "lower" ? BANDS[index - 1] : BANDS[index + 1];
          expect(line.band).toBe(expected);
          expect(line.value).toBe(row.bands[expected]);
        }
      }
    }
  });

  it("every Scottish line equals the published figure for the neighbouring band in the same row", () => {
    const edition = fullBandEdition("Scotland", CURRENT_YEAR);
    expect(edition).toBeDefined();
    for (const record of edition!.records) {
      for (const band of BANDS) {
        for (const line of neighbourLines(record.bandsPence, band)) {
          expect(line.value).toBe(record.bandsPence[line.band]);
        }
      }
    }
  });

  it("a band the row does not hold gives no line, never a derived figure or zero", () => {
    const row = { C: 1500, D: 1700 } as Record<string, number>;
    expect(neighbourLines(row, "D")).toEqual([{ position: "lower", band: "C", value: 1500 }]);
    expect(neighbourLines({ D: 1700, E: null }, "D")).toEqual([]);
    expect(neighbourLines({ D: 1700, E: 0 }, "D")).toEqual([]);
  });

  it("Wales has no lines, because the Welsh table held gives Band D only", () => {
    expect(devolved.editions.some((edition) => edition.nation === "Wales")).toBe(true);
    expect(fullBandEdition("Wales", CURRENT_YEAR)).toBeUndefined();
  });

  it("labels are neutral", () => {
    for (const band of BANDS) {
      for (const label of [positionLabel("lower", band), positionLabel("higher", band)]) {
        expect(label).not.toMatch(/save|saving|pay more|cheaper|dearer|expensive/i);
      }
    }
  });

  it("the explanation records its source and dates", () => {
    expect(BAND_PROPORTIONS.url).toBe("https://www.legislation.gov.uk/ukpga/1992/14/section/5");
    expect(BAND_PROPORTIONS.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(LAST_REVIEWED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(BAND_PROPORTIONS.ninths).toEqual({ A: 6, B: 7, C: 8, D: 9, E: 11, F: 13, G: 15, H: 18 });
  });

  it("the band page and its component carry no dashes and link to the help heading", () => {
    const route = readFileSync(join(ROOT, "src", "pages", "council-tax", "[slug].astro"), "utf8");
    const component = readFileSync(join(ROOT, "src", "components", "BandNeighbours.astro"), "utf8");
    const lib = readFileSync(join(ROOT, "src", "lib", "band-neighbours.ts"), "utf8");
    // A spaced minus in code is arithmetic, so the spaced hyphen check reads the templates only.
    for (const text of [route, component, lib]) expect(text).not.toMatch(DASH_CHARS);
    for (const text of [route, component]) expect(text).not.toMatch(DASHES);
    expect(route).toContain('href="/help/#what-council-tax-band-am-i"');
  });
});

// The built pages, when a build is present (npm run build before npm test).
describe.runIf(built)("built band pages", () => {
  const cells = (html: string) =>
    [...html.matchAll(/<tr data-neighbour-ons="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => ({
      ons: m[1],
      cells: [...m[2].matchAll(/data-neighbour="(lower|self|higher)" data-neighbour-band="([A-H])"[^>]*>([^<]*)</g)].map((c) => ({
        position: c[1],
        band: c[2] as Band,
        text: c[3],
      })),
    }));

  it("all eight pages link to the help heading by its anchor", () => {
    for (const band of BANDS) expect(readFileSync(page(band), "utf8")).toContain('href="/help/#what-council-tax-band-am-i"');
  });

  it("each printed line equals the published neighbouring figure, with none below A or above H", () => {
    const scotland = fullBandEdition("Scotland", CURRENT_YEAR)!;
    for (const band of BANDS) {
      const html = readFileSync(page(band), "utf8");
      const rows = cells(html);
      expect(rows.length).toBe(authorities.length + scotland.records.length);
      for (const row of rows) {
        const english = data.authorities[row.ons]?.bands;
        const scottish = scotland.records.find((record) => record.gss === row.ons)?.bandsPence;
        const figure = (b: Band) => (english ? english[b] : scottish![b] / 100);
        const { lower, higher } = neighbourBands(band);
        expect(row.cells.map((cell) => cell.position)).toEqual([lower && "lower", "self", higher && "higher"].filter(Boolean));
        for (const cell of row.cells) expect(cell.text).toBe(pounds(figure(cell.band)));
      }
      expect(html).toContain("Last reviewed");
      expect(html).toContain(BAND_PROPORTIONS.url);
    }
  });

  it("the pages carry no dashes", () => {
    for (const band of BANDS) {
      const visible = readFileSync(page(band), "utf8").replace(/<script(?![^>]*application\/(?:ld\+)?json)[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "");
      expect(visible).not.toMatch(DASHES);
    }
  });
});
