/**
 * One money formatter for the site (F1, plan section 11.5). Every amount is
 * printed through here, so the rule about precision lives in one place:
 *
 *   An amount is never printed more precisely than its source publishes it.
 *
 * MHCLG band tables publish pounds and pence, so a Band D charge prints as
 * £2,345.67. Revenue Account budget returns publish £ thousand, so a service
 * budget can print as £366,008,000 or £366.0m, never £366,008,000.00. Pinned
 * set mode inputs are pence. The caller names the unit the value is held in;
 * the formatter refuses a style finer than that unit allows.
 *
 * The output of `exact` and `whole` is byte for byte what the Intl currency
 * formats the pages used before F1 printed, so converging on this module
 * changes no published text.
 */

/** The unit a value is held in, which is the unit its source publishes. */
export type MoneyUnit = "pence" | "pounds" | "thousands";

/**
 * exact: to the published unit (pence for pence and pounds sources, whole
 * pounds for £ thousand sources). whole: rounded to the pound. compact: £ million
 * to one decimal at £1m and above, £ billion to one decimal at £1bn and above,
 * otherwise whole pounds.
 */
export type MoneyStyle = "exact" | "whole" | "compact";

export interface MoneyOptions {
  /** The unit the value is held in. Defaults to pounds. */
  unit?: MoneyUnit;
  style?: MoneyStyle;
  /** Printed for a value that is not a finite number. Unknown is not zero. */
  missing?: string;
}

const EXACT = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const WHOLE = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});
const ONE_PLACE = new Intl.NumberFormat("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** The value in pounds. Pence divide by 100, £ thousand multiply by 1,000. */
export function inPounds(value: number, unit: MoneyUnit = "pounds"): number {
  if (unit === "pence") return value / 100;
  if (unit === "thousands") return value * 1000;
  return value;
}

/** True when the unit carries pence, so an exact amount prints two places. */
export function carriesPence(unit: MoneyUnit): boolean {
  return unit !== "thousands";
}

/** "£366.0m", "£1.2bn", or whole pounds below £1m. Sign before the pound sign. */
function compact(pounds: number): string {
  const sign = pounds < 0 ? "-" : "";
  const size = Math.abs(pounds);
  // Rounded first, so £999.96m prints as £1.0bn rather than £1,000.0m.
  const millions = Math.round(size / 1e5) / 10;
  if (millions >= 1000) return `${sign}£${ONE_PLACE.format(size / 1e9)}bn`;
  if (size >= 1e6) return `${sign}£${ONE_PLACE.format(millions)}m`;
  return WHOLE.format(pounds);
}

/**
 * Formats an amount held in `unit`. A missing value prints `missing` ("n/a"
 * by default, as the band tables have always printed it), never £0.00.
 */
export function formatMoney(value: number | null | undefined, options: MoneyOptions = {}): string {
  const { unit = "pounds", style = "exact", missing = "n/a" } = options;
  if (typeof value !== "number" || !Number.isFinite(value)) return missing;
  const pounds = inPounds(value, unit);
  if (style === "compact") return compact(pounds);
  if (style === "whole" || !carriesPence(unit)) return WHOLE.format(pounds);
  return EXACT.format(pounds);
}
