/**
 * The site's Estate Kit figure records, built at build time from the imported data
 * files, so the homepage drawings take every number by key and none is typed. The kit
 * refuses a record without its source, and refuses the bill anatomy unless its parts add
 * to the published total to the penny.
 *
 * Burnley: data/local-bills/burnley-2026-27.json, components[].bandsPence and the
 * unparished locality's totalsPence. The data file records the schedule's file hash but
 * not its page; the page below was read from that file on 9 November 2026 and holds only
 * while the hash matches, which the build checks.
 *
 * England and Burnley area Band D: data/council-tax/england-2026-27.json, from the MHCLG
 * tables the year file names (history, England average and the band table).
 */
import { defineFigures, type FigureSet, type SeriesPoint } from "../vendor/estate-kit/dist/src/index.js";
import { BANDS, CURRENT_YEAR, loadYear, yearLabel } from "./council-tax";
import { loadRegistry } from "./registry";
import { national } from "./national-data";
import { RANK_CLASSES, rankClass } from "./rankings";
import { localBills } from "./local-bill-data";
import { longDate, tableName } from "./sources";

/** Pages read from the published schedule, keyed by the file hash they were read from. */
const SCHEDULE_PAGES: Record<string, { page: string; total: string }> = {
  b9e24c31c2ccb3285b60135ec41fb4d1f5765e629321e5c5fff92773a7726cd9: {
    page: "page 1",
    total: "Row: Total, other parts of the borough.",
  },
};

export const BURNLEY_PARTS = ["billing", "county", "police", "fire"] as const;

const pounds = (pence: number) => Math.round(pence) / 100;

function build(): Record<string, unknown> {
  const bill = localBills.find((b) => b.slug === "burnley" && b.year === CURRENT_YEAR);
  if (!bill) throw new Error(`figures: no Burnley schedule for ${CURRENT_YEAR} in data/local-bills`);
  const read = SCHEDULE_PAGES[bill.source.sha256];
  if (!read) throw new Error(`figures: the Burnley schedule hash ${bill.source.sha256} has no page reading; read the PDF again`);
  const unparished = bill.localities.find((l) => l.id === "unparished");
  if (!unparished) throw new Error("figures: the Burnley schedule has no unparished locality");

  const year = yearLabel(bill.year);
  const schedule = {
    publisher: bill.source.publisher,
    title: bill.source.title,
    page: read.page,
    edition: year,
    url: bill.source.url,
    accessed: bill.source.retrieved,
  };
  const note = `File sha256 ${bill.source.sha256}.`;
  const records: Record<string, unknown> = {};

  for (const id of BURNLEY_PARTS) {
    const part = bill.components.find((c) => c.id === id);
    if (!part) throw new Error(`figures: the Burnley schedule has no ${id} component`);
    records[`burnley.bandd.${id}`] = {
      kind: "value",
      label: `${part.name}, Band D ${year}`,
      name: part.name,
      unit: "gbp",
      dp: 2,
      value: pounds(part.bandsPence.D),
      source: schedule,
      note: `Band D column, row ${part.name}. ${note}`,
    };
  }
  records["burnley.bandd.total"] = {
    kind: "value",
    label: `Band D total, other parts of Burnley (unparished), ${year}`,
    name: "Total",
    unit: "gbp",
    dp: 2,
    value: pounds(unparished.totalsPence.D),
    source: schedule,
    note: `Band D column. ${read.total} ${note}`,
  };
  records["burnley.bands.unparished"] = {
    kind: "series",
    axis: "category",
    label: `Council tax by band, other parts of Burnley (unparished), ${year}`,
    unit: "gbp",
    dp: 2,
    points: BANDS.map((band): SeriesPoint => ({ label: band, value: pounds(unparished.totalsPence[band]) })),
    source: schedule,
    note: `${read.total} ${note}`,
  };

  const data = loadYear(CURRENT_YEAR);
  const mhclg = (table: string) => ({
    publisher: "MHCLG",
    title: data.source.title,
    table: tableName(table),
    edition: longDate(data.source.published) ?? yearLabel(CURRENT_YEAR),
    url: data.source.url,
  });
  const history = data.england.history;
  const area = data.england.areaBandD;
  const burnley = Object.values(data.authorities).find((a) => a.name === "Burnley");
  if (!history || !area || !burnley?.bands.D) throw new Error("figures: the England year file lacks the history, average or Burnley band row");
  const rows = history.rows.filter((r): r is { year: string; pounds: number; changePct: number | null } => r.pounds != null);
  records["england.area_bandd.history"] = {
    kind: "series",
    axis: "category",
    label: "Average area Band D in England, including adult social care and average parish precepts",
    unit: "gbp",
    points: rows.map((r) => ({ label: yearLabel(r.year), value: r.pounds })),
    source: mhclg(history.table),
  };
  records["england.area_bandd.current"] = {
    kind: "value",
    label: `Average area Band D, England, ${yearLabel(CURRENT_YEAR)}`,
    unit: "gbp",
    value: area.england.pounds,
    source: mhclg(area.table),
  };
  records["burnley.area_bandd.current"] = {
    kind: "value",
    label: `Area Band D, Burnley, ${yearLabel(CURRENT_YEAR)}, including adult social care and average parish precepts`,
    unit: "gbp",
    dp: 2,
    value: burnley.bands.D,
    source: mhclg(data.source.bandTable),
  };
  const registry = loadRegistry();
  const bandsSource = mhclg(data.source.bandTable);
  const componentSource = {
    publisher: "MHCLG", title: national.sources.components.title,
    table: "Data_Billing", edition: `retrieved ${longDate(national.sources.components.retrieved)}`,
    url: national.sources.components.fileUrl,
  };
  for (const [gss, authority] of Object.entries(data.authorities)) {
    const slug = registry.councils[gss].slug;
    const key = `council.${slug}`;
    records[`${key}.bands`] = {
      kind: "series", axis: "category", label: `Bands A to H in ${authority.name}, ${year}`,
      unit: "gbp", dp: 2, source: bandsSource,
      points: BANDS.map(band => ({label: band, value: authority.bands[band]})),
    };
    records[`${key}.area_bandd`] = {
      kind: "value", label: `Area Band D in ${authority.name}, ${year}`,
      name: authority.name, value: authority.bands.D, unit: "gbp", dp: 2, source: bandsSource,
    };
    const components = national.components[gss];
    for (const part of [
      {kind: "own", name: `${authority.name} council`, bandDPence: components.ownWithParishPence},
      ...components.parts.map(part => ({...part, name: part.kind === "county"
        ? (authority.classCode === "ILB" || authority.classCode === "OLB" ? "Greater London Authority" : "County council")
        : ({police: "Police", fire: "Fire", combined: "Combined authority"})[part.kind]})),
      {kind: "total", name: "Published area average", bandDPence: components.areaPence},
    ]) {
      if (part.bandDPence === null) throw new Error(`A3: missing component ${gss}/${part.kind}`);
      records[`${key}.bill.${part.kind}`] = {
        kind: "value", label: `${part.name}, ${year}`, name: part.name,
        value: part.bandDPence / 100, unit: "gbp", dp: 2, source: componentSource,
      };
    }
  }
  for (const cls of RANK_CLASSES) {
    const rows = rankClass(data, cls);
    if (!rows) throw new Error(`A3: incomplete class ${cls.slug}`);
    records[`class.${cls.slug}.area_bandd`] = {
      kind: "series", axis: "category", label: `Area Band D within ${cls.label}, ${year}`,
      unit: "gbp", dp: 2, source: bandsSource,
      points: rows.map(row => ({label: row.name, value: row.area})),
    };
  }
  return records;
}

let cached: FigureSet | undefined;

/** The site's figure set. Built once per build; any unsound record throws. */
export function siteFigures(): FigureSet {
  cached ??= defineFigures(build());
  return cached;
}
