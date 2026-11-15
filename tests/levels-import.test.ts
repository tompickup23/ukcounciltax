/**
 * C6: the levels importer and the Table 10 year path, tested against the
 * 2026/27 workbook's own layout. The fixture holds the workbook's sheets as
 * displayed, trimmed to four authorities (Burnley, Birmingham, Westminster and
 * Lancashire); the full workbook is exercised by the rehearsal instead.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import * as levelsLib from "../scripts/lib/levels.mjs";
import * as yearsLib from "../scripts/lib/national-years.mjs";

// Plain JavaScript libraries, driven here with loose fixtures and deliberately broken sheets.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = (...args: any[]) => any;
const { assemble, bandTable, checkSuccession, notesFrom, ownTables } = levelsLib as unknown as Record<string, Loose>;
const { parishYearOfTitle, stagedTable10Source, table10Attachment, vintageOfFile, yearWordsOf } = yearsLib as unknown as Record<string, Loose>;

const ROOT = resolve(import.meta.dirname, "..");
type Sheet = { name: string; rows: string[][] };
const fixture = JSON.parse(readFileSync(join(ROOT, "tests", "fixtures", "levels-2026-27-sheets.json"), "utf-8")) as { sha256: string; sheets: Sheet[] };
const held = JSON.parse(readFileSync(join(ROOT, "data", "council-tax", "england-2026-27.json"), "utf-8"));
const fresh = (): Sheet[] => JSON.parse(JSON.stringify(fixture.sheets));
const manifest = { pageTitle: held.source.title, pageUrl: held.source.url, firstPublished: held.source.published, updated: held.source.updated, files: held.source.files, principles: held.source.referendumPrinciples };
const FOUR = ["E07000117", "E08000025", "E09000033"];
const run = (sheets: Sheet[], extra: Record<string, unknown> = {}) => assemble({
  year: "2026-27", sheets, manifest, generated: "2026-11-15", publisher: held.source.publisher,
  licence: held.source.licence, licenceUrl: held.source.licenceUrl, minAuthorities: 3, ...extra,
});
const sheet = (sheets: Sheet[], name: string) => sheets.find((s) => s.name === name)!;
const row = (s: Sheet, ons: string) => s.rows.find((r) => r.includes(ons))!;

describe("the levels importer on the 2026/27 layout", () => {
  it("is the workbook the held 2026/27 file was built from", () => {
    expect(held.source.files.map((f: { sha256: string }) => f.sha256)).toContain(fixture.sha256);
  });

  it("finds every table by its title and reproduces the held figures cell for cell", () => {
    const data = run(fresh());
    for (const ons of FOUR) {
      expect(data.authorities[ons].bands).toEqual(held.authorities[ons].bands);
      expect(data.authorities[ons].own).toEqual(held.authorities[ons].own);
      expect(data.authorities[ons].notes).toEqual(held.authorities[ons].notes);
    }
    expect(data.counties.E10000017).toEqual(held.counties.E10000017);
    expect(data.england).toEqual(held.england);
    expect(data.source.notes).toEqual(held.source.notes);
    expect(data.source.bandTable).toBe("Table_9");
    expect(data.source.ownTables).toEqual(held.source.ownTables);
  });

  it("finds tables by title, not by sheet name or position (the notes sheet is found by its name, Notes)", () => {
    const sheets = fresh().reverse().map((s, i) => (s.name === "Notes" ? s : { ...s, name: `Sheet${i}` }));
    const data = run(sheets);
    expect(data.authorities.E07000117.bands).toEqual(held.authorities.E07000117.bands);
  });

  it("refuses a missing band, and never writes it as zero", () => {
    const sheets = fresh();
    const t9 = sheet(sheets, "Table_9");
    const header = t9.rows.find((r) => r.includes("ONS Code"))!;
    row(t9, "E08000025")[header.indexOf("Band C")] = "";
    expect(() => run(sheets)).toThrow(/refusing to write, rows missing a band:\n {2}E08000025 Birmingham lacks band C/);
  });

  it("refuses a short row in the band table", () => {
    const sheets = fresh();
    const t9 = sheet(sheets, "Table_9");
    const header = t9.rows.find((r) => r.includes("ONS Code"))!;
    const r = row(t9, "E09000033");
    r.length = header.indexOf("Band H");
    expect(() => run(sheets)).toThrow(/E09000033: short row/);
  });

  it("refuses a short row in an own table, but keeps a marked [x] as unknown", () => {
    const sheets = fresh();
    const t8c = sheet(sheets, "Table_8c");
    const header = t8c.rows.find((r) => r.includes("ONS Code"))!;
    const bandD = header.findIndex((h) => /^Average council tax for the authority/i.test(h) && /excluding parish precepts/i.test(h) && /£$/.test(h.trim()) && !/change/i.test(h));
    const marked = fresh();
    row(sheet(marked, "Table_8c"), "E07000117")[bandD] = "[x]";
    expect(run(marked).authorities.E07000117.own.bandD).toBeNull();
    row(t8c, "E07000117").length = bandD;
    expect(() => run(sheets)).toThrow(/E07000117: short row, no Band D cell/);
  });

  it("refuses an authority with no own figures row", () => {
    const sheets = fresh();
    const t8a = sheet(sheets, "Table_8a");
    t8a.rows = t8a.rows.filter((r) => !r.includes("E09000033"));
    expect(() => run(sheets)).toThrow(/no own figures row:\n {2}E09000033 Westminster/);
  });

  it("refuses a note reference the workbook does not define", () => {
    const sheets = fresh();
    const notes = sheet(sheets, "Notes");
    notes.rows = notes.rows.filter((r) => !/^\[note p\]$/i.test(r[0] ?? ""));
    expect(() => run(sheets)).toThrow(/refers to \[note p\]/);
  });

  it("refuses a missing or new authority against the year before, unless a reviewed record with two sources lists it", () => {
    const current = run(fresh());
    const previous = { year: "2025-26", authorities: { ...current.authorities, E07000999: { name: "Gone District" } }, counties: current.counties };
    expect(() => checkSuccession("2026-27", current, previous)).toThrow(/authority E07000999 Gone District is missing/);
    const oneSource = { removed: [{ ons: "E07000999", sources: ["one"] }] };
    expect(() => checkSuccession("2026-27", current, previous, oneSource)).toThrow(/needs two sources/);
    expect(() => checkSuccession("2026-27", current, previous, { removed: [{ ons: "E07000999", sources: ["a", "b"] }] })).not.toThrow();
    const smaller = { year: "2025-26", authorities: { E07000117: current.authorities.E07000117 }, counties: current.counties };
    expect(() => checkSuccession("2026-27", current, smaller)).toThrow(/E08000025 Birmingham is new/);
  });

  it("refuses a refetch whose authorities differ from the held file", () => {
    const heldSubset = { authorities: { E07000117: {} }, counties: held.counties };
    expect(() => run(fresh(), { held: heldSubset })).toThrow(/authorities differ from the held file/);
  });

  it("exposes the band and own table parsers separately", () => {
    const sheets = fresh();
    const notes = notesFrom(sheets);
    expect(Object.keys(bandTable(sheets, notes, "2026-27").authorities).sort()).toEqual([...FOUR].sort());
    expect(ownTables(sheets, notes, "2026-27").tables).toEqual({ unitary: "Table_8a", county: "Table_8b", district: "Table_8c" });
  });
});

describe("the Table 10 year path", () => {
  const page = [
    { title: "Council Tax levels set by local authorities in England 2026 to 2027: Tables 1 to 9", url: "https://assets.publishing.service.gov.uk/media/x/Tables_1-9_2026-27.ods" },
    { title: "Council Tax levels set by local authorities in England 2026 to 2027: Table 10 Local Authority Level Data", url: "https://assets.publishing.service.gov.uk/media/y/Table_10_2026-27.ods" },
  ];

  it("finds Table 10 on the statistics page by its title", () => {
    expect(table10Attachment(page, "2026-27").url).toMatch(/Table_10_2026-27\.ods$/);
    expect(() => table10Attachment(page, "2027-28")).toThrow(/found 0/);
    expect(() => table10Attachment([...page, page[1]], "2026-27")).toThrow(/found 2/);
  });

  it("writes a staged record in the launch edition's shape, with the hash to review", () => {
    const record = stagedTable10Source({ attachment: page[1], year: "2027-28", pageUrl: "https://www.gov.uk/x", file: "table-10-2027-28.ods", sha256: "b".repeat(64), retrieved: "2027-03-25" });
    expect(record.title).toBe("Council tax levels set by local authorities in England 2027 to 2028: Table 10");
    expect(record.tables).toEqual(["Data_Billing", "Precepting_Bodies", "Notes"]);
    expect(() => stagedTable10Source({ attachment: page[1], year: "2027-28", pageUrl: "", file: "", sha256: "nothex", retrieved: "" })).toThrow(/SHA-256/);
  });

  it("reads each national edition's own year", () => {
    const sources = JSON.parse(readFileSync(join(ROOT, "data", "national", "sources.json"), "utf-8"));
    expect(parishYearOfTitle(sources.parishes.title)).toBe("2026-27");
    expect(vintageOfFile(sources.history.file)).toBe("2026-27");
    expect(yearWordsOf("2027-28")).toBe("2027 to 2028");
    expect(() => parishYearOfTitle("No year here")).toThrow();
  });
});
