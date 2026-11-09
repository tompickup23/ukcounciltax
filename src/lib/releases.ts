import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { YEARS, councilTaxPath, loadYear, yearLabel, type Year } from "./council-tax";
import { national, type Parish } from "./national-data";

/**
 * Dataset editions and the two findings notes.
 *
 * Every date here is read from a data file the site already holds: a
 * publication date where the manifest records one, otherwise the access
 * (retrieval) date, and the item says which. Nothing is typed from memory
 * except FINDINGS_DATED, the date the findings notes were written.
 *
 * The findings are counts recomputed from data/national/england.json on every
 * build. Notes in the published tables override arithmetic: a row or a year
 * pair that a note marks as a structural change or not comparable is taken out
 * of the comparison and counted separately. Rows are found by the note text
 * attached to them, never by a typed name.
 */

const root = () => process.cwd();
const readJson = <T>(path: string): T => JSON.parse(readFileSync(join(root(), path), "utf8")) as T;

/** The date the two findings notes were written. */
export const FINDINGS_DATED = "2026-11-05";

export type DateKind = "published" | "accessed" | "generated" | "written";

export interface ReleaseItem {
  id: string;
  /** Which dataset or note this item belongs to. Tests check one item per dataset. */
  dataset: string;
  title: string;
  date: string;
  dateKind: DateKind;
  description: string;
  path: string;
  sourceUrl?: string;
}

const LONG = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const longDate = (iso: string) => LONG.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
export const DATE_WORD: Record<DateKind, string> = {
  published: "Published",
  accessed: "Accessed",
  generated: "Generated",
  written: "Written",
};

/** The two years a source holds, in order, read from the data. */
const sortedYears = (record: Record<string, unknown>) => Object.keys(record).sort();

// Parish and town precepts

export type ParishNoteKind = "structural" | "revised" | "negative" | "other";

/** What a note on a parish row says, read from its text. */
export function parishNoteKind(text: string): ParishNoteKind {
  if (/no longer exist|have formed|has formed|split into|has split/i.test(text)) return "structural";
  if (/revised/i.test(text)) return "revised";
  if (/negative/i.test(text)) return "negative";
  return "other";
}

const noteKinds = (parish: Parish) => new Set(parish.notes.map((note) => parishNoteKind(note.text)));

export interface ParishFinding {
  previousYear: string;
  currentYear: string;
  rows: number;
  newRows: number;
  ceasedRows: number;
  unavailable: number;
  structural: number;
  compared: number;
  rose: number;
  fell: number;
  unchangedNonZero: number;
  zeroBoth: number;
  revisedCompared: number;
  /** Rows carrying the note that their precept is negative: set aside, not compared. */
  negative: number;
  /** New or ceased rows that carry a note on a formation, removal or split. */
  newOrCeasedWithStructuralNote: number;
  structuralNotes: { id: string; text: string }[];
  /** Entries in the table's list of renamed parishes, read from the Ceased_New_Renamed_Parishes sheet. */
  renamedListed: number;
  /** Of those, entries whose new name is a compared row of the same billing authority. */
  renamedCompared: number;
  /** Of those, entries whose new name records a grouping with other parishes. */
  renamedGrouped: number;
}

interface RenamedEntry { gss: string; newName: string }

/** The renamed parishes list in the parish table's changes sheet, read by its title and header row. */
export function renamedParishes(rows: string[][] = national.parishChanges): RenamedEntry[] {
  const start = rows.findIndex((row) => row.length === 1 && /^Renamed parishes/i.test(row[0] ?? ""));
  if (start < 0) return [];
  const header = rows[start + 1] ?? [];
  const gssAt = header.findIndex((cell) => /^ONS code$/i.test(cell));
  const nameAt = header.findIndex((cell) => /^New name$/i.test(cell));
  if (gssAt < 0 || nameAt < 0) return [];
  const entries: RenamedEntry[] = [];
  for (const row of rows.slice(start + 2)) {
    if (row.length <= 1) break;
    entries.push({ gss: row[gssAt], newName: row[nameAt] });
  }
  return entries;
}

export function parishFinding(): ParishFinding {
  const parishes = national.parishes;
  const [previousYear, currentYear] = sortedYears(parishes[0].years);
  const result: ParishFinding = {
    previousYear,
    currentYear,
    rows: parishes.length,
    newRows: 0,
    ceasedRows: 0,
    unavailable: 0,
    structural: 0,
    compared: 0,
    rose: 0,
    fell: 0,
    unchangedNonZero: 0,
    zeroBoth: 0,
    revisedCompared: 0,
    negative: 0,
    newOrCeasedWithStructuralNote: 0,
    structuralNotes: [],
    renamedListed: 0,
    renamedCompared: 0,
    renamedGrouped: 0,
  };
  const comparedKeys = new Set<string>();
  const structuralIds = new Map<string, string>();
  for (const parish of parishes) {
    const a = parish.years[previousYear];
    const b = parish.years[currentYear];
    const kinds = noteKinds(parish);
    const remember = () => {
      for (const note of parish.notes) if (parishNoteKind(note.text) === "structural") structuralIds.set(note.id, note.text);
    };
    if (a.status === "not-existing" || b.status === "not-existing") {
      if (a.status === "not-existing") result.newRows += 1;
      else result.ceasedRows += 1;
      if (kinds.has("structural")) {
        result.newOrCeasedWithStructuralNote += 1;
        remember();
      }
      continue;
    }
    if (a.status !== "published" || b.status !== "published" || a.bandDPence === null || b.bandDPence === null) {
      result.unavailable += 1;
      continue;
    }
    if (kinds.has("structural")) {
      result.structural += 1;
      remember();
      continue;
    }
    if (kinds.has("negative")) {
      result.negative += 1;
      continue;
    }
    result.compared += 1;
    comparedKeys.add(`${parish.gss}|${parish.name}`);
    if (kinds.has("revised")) result.revisedCompared += 1;
    if (b.bandDPence > a.bandDPence) result.rose += 1;
    else if (b.bandDPence < a.bandDPence) result.fell += 1;
    else if (b.bandDPence === 0) result.zeroBoth += 1;
    else result.unchangedNonZero += 1;
  }
  const renamed = renamedParishes();
  result.renamedListed = renamed.length;
  result.renamedCompared = renamed.filter((entry) => comparedKeys.has(`${entry.gss}|${entry.newName}`)).length;
  result.renamedGrouped = renamed.filter((entry) => /grouped with/i.test(entry.newName)).length;
  result.structuralNotes = [...structuralIds].map(([id, text]) => ({ id, text })).sort((x, y) => x.id.localeCompare(y.id));
  return result;
}

// Band D since the first year of the history table

export interface HistoryYearRow {
  from: string;
  to: string;
  compared: number;
  rose: number;
  fell: number;
  unchanged: number;
  excluded: number;
}

export interface HistoryFinding {
  firstYear: string;
  latestYear: string;
  councils: number;
  withFirst: number;
  withLatest: number;
  withBoth: number;
  higherLatestThanFirst: number;
  rows: HistoryYearRow[];
  totals: { compared: number; rose: number; fell: number; unchanged: number; excluded: number };
  exclusions: { note: string; text: string; pair: [string, string]; councils: number }[];
  basisCheck: { year: string; matched: number; compared: number } | null;
  englandRowHeld: false;
}

const NOT_COMPARABLE = [
  /(\d{4}-\d{2}) and (\d{4}-\d{2}) figures are not directly comparable/i,
  /Percentage change between (\d{4}-\d{2}) and (\d{4}-\d{2})/i,
];

/** Year pairs a history note says are not comparable, read from its text. */
export function notComparablePair(text: string): [string, string] | null {
  for (const pattern of NOT_COMPARABLE) {
    const match = pattern.exec(text);
    if (match) return [match[1], match[2]];
  }
  return null;
}

/** Whole pounds as displayed, rounding a half pound up. */
const displayedPounds = (pounds: number) => Math.floor(pounds + 0.5 + 1e-9);

export function historyFinding(): HistoryFinding {
  const noteText = new Map(national.historyNotes.filter((row) => /^\[(note \d+|r)\]$/.test(row[0] ?? "")).map((row) => [row[0], row[1]]));
  const series = Object.entries(national.history);
  const years = sortedYears(series[0][1].area.values);
  const firstYear = years[0];
  const latestYear = years.at(-1)!;

  // Pairs excluded per council, from the notes attached to any of its series.
  const excludedPairs = new Map<string, Set<string>>();
  const exclusionCount = new Map<string, { note: string; text: string; pair: [string, string]; councils: Set<string> }>();
  for (const [gss, measures] of series) {
    const ids = new Set(Object.values(measures).flatMap((s) => s.notes.match(/\[(?:note \d+|r)\]/g) ?? []));
    for (const id of ids) {
      const text = noteText.get(id);
      const pair = text ? notComparablePair(text) : null;
      if (!text || !pair) continue;
      const set = excludedPairs.get(gss) ?? new Set<string>();
      set.add(`${pair[0]}>${pair[1]}`);
      excludedPairs.set(gss, set);
      const entry = exclusionCount.get(id) ?? { note: id, text, pair, councils: new Set<string>() };
      entry.councils.add(gss);
      exclusionCount.set(id, entry);
    }
  }

  const rows: HistoryYearRow[] = [];
  for (let i = 1; i < years.length; i += 1) {
    const from = years[i - 1];
    const to = years[i];
    const row: HistoryYearRow = { from, to, compared: 0, rose: 0, fell: 0, unchanged: 0, excluded: 0 };
    for (const [gss, measures] of series) {
      const a = measures.area.values[from];
      const b = measures.area.values[to];
      if (a === null || a === undefined || b === null || b === undefined) continue;
      if (excludedPairs.get(gss)?.has(`${from}>${to}`)) {
        row.excluded += 1;
        continue;
      }
      row.compared += 1;
      if (b > a) row.rose += 1;
      else if (b < a) row.fell += 1;
      else row.unchanged += 1;
    }
    rows.push(row);
  }
  const totals = rows.reduce(
    (sum, row) => ({
      compared: sum.compared + row.compared,
      rose: sum.rose + row.rose,
      fell: sum.fell + row.fell,
      unchanged: sum.unchanged + row.unchanged,
      excluded: sum.excluded + row.excluded,
    }),
    { compared: 0, rose: 0, fell: 0, unchanged: 0, excluded: 0 },
  );

  const has = (v: number | null | undefined) => v !== null && v !== undefined;
  const withFirst = series.filter(([, m]) => has(m.area.values[firstYear])).length;
  const withLatest = series.filter(([, m]) => has(m.area.values[latestYear])).length;
  const both = series.filter(([, m]) => has(m.area.values[firstYear]) && has(m.area.values[latestYear]));
  const higherLatestThanFirst = both.filter(([, m]) => m.area.values[latestYear]! > m.area.values[firstYear]!).length;

  // The basis: the latest Area_CT figures against the band table for the same
  // year, whose note says its figures include parish precepts.
  let basisCheck: HistoryFinding["basisCheck"] = null;
  if ((YEARS as readonly string[]).includes(latestYear) && existsSync(councilTaxPath(latestYear as Year))) {
    const { authorities } = loadYear(latestYear as Year);
    let matched = 0;
    let compared = 0;
    for (const [gss, measures] of series) {
      const area = measures.area.values[latestYear];
      const bandD = authorities[gss]?.bands.D;
      if (area === null || area === undefined || bandD === null || bandD === undefined) continue;
      compared += 1;
      if (area === bandD || area === displayedPounds(bandD)) matched += 1;
    }
    basisCheck = { year: latestYear, matched, compared };
  }

  return {
    firstYear,
    latestYear,
    councils: series.length,
    withFirst,
    withLatest,
    withBoth: both.length,
    higherLatestThanFirst,
    rows,
    totals,
    exclusions: [...exclusionCount.values()].map((e) => ({ note: e.note, text: e.text, pair: e.pair, councils: e.councils.size })),
    basisCheck,
    englandRowHeld: false,
  };
}

// Dataset editions

interface DevolvedEdition { nation: string; year: string; basis: string; table: string; source: { title: string; url: string } }
interface DevolvedFile { retrieved: string; editions: DevolvedEdition[] }
interface RegistryFile { generated: string; source: { rule: string; sitemaps: Record<string, { name: string }> } }
interface BandStockSource { publisher: string; title: string; url: string; published: string; retrieved: string; tables: string[] }

/** An official title without the file type and size a download link appends. */
export const cleanTitle = (title: string) => title.replace(/\s*,\s*file type:.*$/i, "").trim();

export function findingsItems(): ReleaseItem[] {
  const parish = parishFinding();
  const history = historyFinding();
  const p = national.sources.parishes;
  const h = national.sources.history;
  return [
    {
      id: "findings-parish-precepts",
      dataset: "findings-parishes",
      title: `Findings: parish and town precepts, ${yearLabel(parish.previousYear)} to ${yearLabel(parish.currentYear)}`,
      date: FINDINGS_DATED,
      dateKind: "written",
      description: `Of ${parish.compared.toLocaleString("en-GB")} local precepting authorities compared, the Band D precept rose for ${parish.rose.toLocaleString("en-GB")}, fell for ${parish.fell.toLocaleString("en-GB")} and did not change for ${(parish.unchangedNonZero + parish.zeroBoth).toLocaleString("en-GB")}. Source: MHCLG, ${p.title}, accessed ${longDate(p.retrieved)}.`,
      path: "/findings/#parish-precepts",
      sourceUrl: p.url,
    },
    {
      id: "findings-band-d-history",
      dataset: "findings-history",
      title: `Findings: Band D since ${yearLabel(history.firstYear)}`,
      date: FINDINGS_DATED,
      dateKind: "written",
      description: `${history.withFirst} of ${history.councils} current councils have a whole area Band D figure for ${yearLabel(history.firstYear)}; of those also published for ${yearLabel(history.latestYear)}, ${history.higherLatestThanFirst} are higher in ${yearLabel(history.latestYear)}. Source: MHCLG, ${h.title}, Area_CT, accessed ${longDate(h.retrieved)}.`,
      path: "/findings/#band-d-history",
      sourceUrl: h.url,
    },
  ];
}

/** Years whose levels data file is held; a year listed before its file exists is skipped, not thrown on. */
export function heldYears(years: readonly string[] = YEARS): Year[] {
  return years.filter((year) => existsSync(councilTaxPath(year as Year))) as Year[];
}

export function datasetItems(years: readonly string[] = YEARS): ReleaseItem[] {
  const items: ReleaseItem[] = [];

  for (const year of [...heldYears(years)].reverse()) {
    const { source } = loadYear(year);
    // No recorded publication date: the item is left out rather than dated by guess.
    if (!source.published) continue;
    const updated = source.updated && source.updated !== source.published ? ` Updated ${longDate(source.updated)}.` : "";
    items.push({
      id: `ukcounciltax-council-tax-${year}`,
      dataset: `levels-${year}`,
      title: `Council tax ${yearLabel(year)} for every council in England`,
      date: source.published,
      dateKind: "published",
      description: `${source.title}, published by ${source.publisher}. Band A to H for every billing authority.${updated}`,
      path: "/council-tax/",
      sourceUrl: source.url,
    });
  }

  const s = national.sources;
  const components = s.components;
  items.push({
    id: "ukcounciltax-national-components",
    dataset: "components",
    title: `Band D precept components for every council in England, ${yearLabel(national.year)}`,
    date: components.retrieved,
    dateKind: "accessed",
    description: `MHCLG, ${components.title}. Accessed ${longDate(components.retrieved)}; the publication date is not recorded in the source manifest.`,
    path: "/precepts/",
    sourceUrl: components.url,
  });
  items.push({
    id: "ukcounciltax-national-parishes",
    dataset: "parishes",
    title: `Parish and town precepts in England, ${yearLabel(national.year)}`,
    date: s.parishes.retrieved,
    dateKind: "accessed",
    description: `MHCLG, ${s.parishes.title}, ${national.parishes.length.toLocaleString("en-GB")} rows. Accessed ${longDate(s.parishes.retrieved)}; the publication date is not recorded in the source manifest.`,
    path: "/precepts/",
    sourceUrl: s.parishes.url,
  });
  items.push({
    id: "ukcounciltax-national-history",
    dataset: "history",
    title: `Band D history for every council in England since ${yearLabel(sortedYears(Object.values(national.history)[0].area.values)[0])}`,
    date: s.history.retrieved,
    dateKind: "accessed",
    description: `MHCLG, ${s.history.title}, tables Area_CT, exc_PP and inc_PP. Accessed ${longDate(s.history.retrieved)}; the publication date is not recorded in the source manifest.`,
    path: "/councils/",
    sourceUrl: s.history.url,
  });

  const stock = readJson<Record<string, BandStockSource>>("data/national/sources.json").bandStock;
  if (stock?.published) {
    items.push({
      id: "ukcounciltax-band-stock-2026",
      dataset: "bandStock",
      title: "Properties by council tax band for every council in England",
      date: stock.published,
      dateKind: "published",
      description: `${stock.publisher}, ${stock.title}, table CTSOP1.1, published ${longDate(stock.published)}, accessed ${longDate(stock.retrieved)}.`,
      path: "/councils/",
      sourceUrl: stock.url,
    });
  }

  const devolved = readJson<DevolvedFile>("data/devolved/council-tax.json");
  for (const edition of devolved.editions) {
    const nation = edition.nation.toLowerCase();
    items.push({
      id: `ukcounciltax-${nation}-${edition.year}`,
      dataset: `devolved-${nation}-${edition.year}`,
      title: edition.nation === "Wales" ? `Council tax Band D ${yearLabel(edition.year)} for every council in Wales` : `Council tax ${yearLabel(edition.year)} for every council in ${edition.nation}`,
      date: devolved.retrieved,
      dateKind: "accessed",
      description: `${edition.nation === "Wales" ? "Welsh Government" : "Scottish Government"}, ${cleanTitle(edition.source.title)}, ${edition.table}. ${edition.basis}. Accessed ${longDate(devolved.retrieved)}; the publication date is not recorded in the source manifest.`,
      path: `/${nation}/`,
      sourceUrl: edition.source.url,
    });
  }

  const registry = readJson<RegistryFile>("data/registry/councils.json");
  const sites = Object.values(registry.source.sitemaps).map((site) => site.name);
  items.push({
    id: `ukcounciltax-registry-${registry.generated}`,
    dataset: "registry",
    title: "Sister site links for every council",
    date: registry.generated,
    dateKind: "generated",
    description: `Registry edition generated ${longDate(registry.generated)}, checked against the live sitemaps of ${sites.join(", ")}.`,
    path: "/councils/",
  });

  return items;
}

/** Every item, newest first; equal dates keep their order. */
export function releaseItems(): ReleaseItem[] {
  return [...findingsItems(), ...datasetItems()]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.date.localeCompare(a.item.date) || a.index - b.index)
    .map(({ item }) => item);
}

/** The dataset keys the feed must carry, one item each at least. */
export function expectedDatasets(): string[] {
  const devolved = readJson<DevolvedFile>("data/devolved/council-tax.json");
  return [
    // Only years whose data file is held and whose source records a publication date get an item.
    ...heldYears().filter((year) => loadYear(year).source.published).map((year) => `levels-${year}`),
    "components",
    "parishes",
    "history",
    "bandStock",
    ...devolved.editions.map((e) => `devolved-${e.nation.toLowerCase()}-${e.year}`),
    "registry",
    "findings-parishes",
    "findings-history",
  ];
}

/** Original page release dates recorded in docs/RELEASE.md; never the build clock. */
export const STATIC_PAGE_DATES: Record<string, string> = {
  '/': '2026-10-05',
  '/your-area/': '2026-10-05',
  '/about/': '2026-10-05',
  '/methodology/': '2026-10-05',
  '/sources/': '2026-10-05',
  '/privacy/': '2026-10-05',
  '/compare/': '2026-10-05',
  '/contact/': '2026-10-05',
  '/corrections/': '2026-10-05',
  '/tools/': '2026-10-05',
  '/tools/future-cost/': '2026-10-05',
  '/help/': '2026-10-05',
  '/coverage/': '2026-10-05',
  '/council-tax-2027-28/': '2026-11-05',
  '/findings/': FINDINGS_DATED,
  '/changes/': FINDINGS_DATED,
};

/** The held edition or recorded page release for each route, not a fresh retrieval claim. */
export function sitemapLastmod(path: string): string {
  const nationalSources = readJson<Record<string, {retrieved: string}>>('data/national/sources.json');
  if (path.startsWith('/tools/budget/')) return nationalSources.raPart1.retrieved;
  if (path === '/precepts/') return nationalSources.components.retrieved;
  if (path === '/data/') return Object.values(nationalSources).map(source => source.retrieved).sort().at(-1)!;
  if (/^\/(scotland|wales)\//.test(path)) {
    // The manifest identifies the files but has no dates; the joined extract records retrieval.
    return readJson<DevolvedFile>('data/devolved/council-tax.json').retrieved;
  }
  if (path === '/increases/' || path.startsWith('/councils/') || path.startsWith('/council-tax/')) {
    const edition = loadYear(heldYears().at(-1)!);
    return edition.source.published || edition.generated;
  }
  const date = STATIC_PAGE_DATES[path];
  if (!date) throw new Error(`No recorded sitemap date for ${path}`);
  return date;
}
