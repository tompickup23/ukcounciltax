import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CURRENT_YEAR } from "./council-tax";

/**
 * The GLA's precept decision for a year, or null when none is held. The GLA
 * approves its precept before MHCLG publishes the levels, but the decision for a
 * new year is added by hand, so after the year switch it can lag (C6). London
 * pages say the precept is already inside the area charge above, so they show
 * it only for the same year as that charge.
 */
export function glaDecision(year: string = CURRENT_YEAR) {
  const path = join(process.cwd(), "data", "precepts", `gla-${year}.json`);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf-8")) : null;
}
