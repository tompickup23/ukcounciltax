/**
 * One published local bill as the kit's BillAnatomy: the chosen locality and band split
 * by the bodies that charge it. Browser-safe, so the local bill tool can draw the result
 * a reader asked for with the same drawing the pages use.
 *
 * Every number comes from the imported schedule. resolveBill refuses a bill whose parts
 * do not add to the published locality total, and the kit refuses the same again, so a
 * bar cannot be drawn from figures that do not reconcile.
 */
import { defineFigures } from "../vendor/estate-kit/dist/src/figures/figures.js";
import { billAnatomy } from "../vendor/estate-kit/dist/src/charts/billAnatomy.js";
import type { BillAnatomyOptions } from "../vendor/estate-kit/dist/src/charts/billAnatomy.js";
import type { ChartOutput } from "../vendor/estate-kit/dist/src/charts/frame.js";
import { resolveBill, type LocalBill } from "./local-bill";

/**
 * Pages read from a published schedule, keyed by the file hash they were read from. A
 * reading holds only while the imported file's hash matches it.
 */
export const SCHEDULE_PAGES: Record<string, { page: string; total: string }> = {
  b9e24c31c2ccb3285b60135ec41fb4d1f5765e629321e5c5fff92773a7726cd9: {
    page: "page 1",
    total: "Row: Total, other parts of the borough.",
  },
};

const pounds = (pence: number) => Math.round(pence) / 100;

/** The chart options for one locality and band, with their own figure records. */
export function localBillChartOptions(bill: LocalBill, localityId: string, band: string): BillAnatomyOptions {
  const read = SCHEDULE_PAGES[bill.source.sha256];
  if (!read) throw new Error("The schedule's page has not been read for this file, so the bar is not drawn.");
  const { locality, parts, total } = resolveBill(bill, localityId, band);
  const year = bill.year.replace("-", "/");
  const source = {
    publisher: bill.source.publisher,
    title: bill.source.title,
    page: read.page,
    edition: year,
    url: bill.source.url,
    accessed: bill.source.retrieved,
  };
  const note = `File sha256 ${bill.source.sha256}.`;
  const records: Record<string, unknown> = {};
  for (const part of parts) {
    const name = part.kind === "parish" ? `${part.name} parish precept` : part.name;
    records[`local.${part.id}`] = {
      kind: "value", label: `${name}, Band ${band} ${year}`, name,
      unit: "gbp", dp: 2, value: pounds(part.pence), source, note,
    };
  }
  records["local.total"] = {
    kind: "value", label: `Band ${band} total, ${locality.name}, ${year}`, name: "Total",
    unit: "gbp", dp: 2, value: pounds(total), source, note,
  };
  return {
    set: defineFigures(records),
    parts: parts.map((part) => `local.${part.id}`),
    total: "local.total",
    title: `Who charges a Band ${band} bill in ${locality.name}, ${bill.name}, ${year}`,
  };
}

/** The drawing itself, painted from the page's theme. */
export function localBillChart(bill: LocalBill, localityId: string, band: string): ChartOutput {
  return billAnatomy(localBillChartOptions(bill, localityId, band));
}
