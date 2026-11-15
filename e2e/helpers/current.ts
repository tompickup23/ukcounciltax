/**
 * C6: figures the browser specs check, read from the data the build used
 * rather than typed, so the levels day release changes data and not tests.
 * Figures from editions that do not move with the year switch (the budget,
 * the Burnley scenario game, parish returns, history) stay typed in the specs.
 */
import { CURRENT_YEAR, YEARS, loadYear, pounds, type Band } from '../../src/lib/council-tax';
import { national } from '../../src/lib/national-data';
import { glaDecision } from '../../src/lib/gla';
import { levelsDayRoutes } from '../../src/lib/levels-day';
import { projectCharge } from '../../src/lib/scenario';
import { moneyPence } from '../../src/lib/tax-view';
import { COUNTY_CLASS, RANK_CLASSES, positionCell, rankClass } from '../../src/lib/rankings';
import { increaseGroups } from '../../src/lib/increase-groups';

export { YEARS, glaDecision, levelsDayRoutes };

/** A council's published band for CURRENT_YEAR, as the site prints it. */
export const band = (gss: string, b: Band) => pounds(loadYear(CURRENT_YEAR).authorities[gss].bands[b]);

/** One precepting part of a council's Band D, from the current Table 10 import. */
export const part = (gss: string, kind: 'county' | 'police' | 'fire' | 'combined') =>
  moneyPence(national.components[gss].parts.find((p) => p.kind === kind)!.bandDPence!);

/** The future cost tool's last year for a council and band, as the page computes it. */
export function futureCost(gss: string, b: Band, rate: number, years: number) {
  const baseline = Math.round(loadYear(CURRENT_YEAR).authorities[gss].bands[b] * 100);
  return moneyPence(projectCharge(baseline, rate, years).at(-1)!.annualPence);
}

/** "Own share: 116=, £246.87" as a class ranking table prints a council's row. */
export function ownShareCell(name: string, slug: string) {
  const cls = [...RANK_CLASSES, COUNTY_CLASS].find((c) => c.slug === slug)!;
  if (!('codes' in cls)) throw new Error('county rows print differently');
  const row = rankClass(loadYear(CURRENT_YEAR), cls)!.find((r) => r.name === name)!;
  return `Own share: ${positionCell(row.ownPosition, row.ownTied)}, ${pounds(row.own)}`;
}

/**
 * The tables and rows /increases/ prints, from the data: per year, the three own
 * share groups and the class averages where the year's file has Table 2; for the
 * current year only, the whole area table. Each table has one header row.
 */
const increaseYears = YEARS.map((year) => ({ year, groups: increaseGroups(year), classes: loadYear(year).england.byClass }));
export const INCREASES_TABLES = increaseYears.reduce((n, y) => n + y.groups.length + (y.classes ? 1 : 0) + (y.year === CURRENT_YEAR ? 1 : 0), 0);
export const INCREASES_ROWS = increaseYears.reduce((n, y) =>
  n + y.groups.reduce((m, g) => m + g.rows.length + 1, 0)
    + (y.classes ? y.classes.rows.length + 1 : 0)
    + (y.year === CURRENT_YEAR ? Object.keys(loadYear(y.year).authorities).length + 1 : 0), 0);
