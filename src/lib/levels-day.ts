/**
 * Levels day (C6): the pages and cards that wait for the first year with a
 * levels day page (FIRST_LEVELS_PAGE_YEAR) and render nothing until its data has landed. Every
 * function takes the year state as an argument, defaulting to the build's, so
 * tests can exercise both states: before the switch (15 November 2026, where
 * each list below is empty) and after it.
 */
import {
  CURRENT_YEAR,
  FIRST_LEVELS_PAGE_YEAR,
  NEXT_YEAR,
  PREVIOUS_YEAR,
  type OwnFigures,
  type YearFile,
} from "./council-tax";

export interface YearState {
  current: string;
  previous: string;
  next: string;
}
export const BUILD_STATE: YearState = { current: CURRENT_YEAR, previous: PREVIOUS_YEAR, next: NEXT_YEAR };

/** Whether a year state has a levels day page. */
export const hasLevelsPage = (state: YearState = BUILD_STATE) => state.current >= FIRST_LEVELS_PAGE_YEAR;

export interface YearPageProps {
  mode: "next" | "levels";
}

/** /council-tax-<year>/: the not yet set page always, and the levels day page once there is one. */
export function yearPagePaths(state: YearState = BUILD_STATE): { params: { year: string }; props: YearPageProps }[] {
  return [
    { params: { year: state.next }, props: { mode: "next" } },
    ...(hasLevelsPage(state) ? [{ params: { year: state.current }, props: { mode: "levels" as const } }] : []),
  ];
}

/** The adult social care precept page for the current year, or nothing before FIRST_LEVELS_PAGE_YEAR. */
export const preceptDayPath = (year: string) => `/council-tax-${year}/adult-social-care/`;
export function preceptDayPaths(state: YearState = BUILD_STATE): { params: { year: string } }[] {
  return hasLevelsPage(state) ? [{ params: { year: state.current } }] : [];
}

/** Every route this module adds, for the sitemap and STATIC_PATHS; empty before FIRST_LEVELS_PAGE_YEAR. */
export function levelsDayRoutes(state: YearState = BUILD_STATE): string[] {
  return hasLevelsPage(state) ? [`/council-tax-${state.current}/`, preceptDayPath(state.current)] : [];
}

/** The ranking card for one council: its area Band D within its class, as a share image. */
export const rankingCardPath = (slug: string) => `/og/ranking/${slug}.png`;

/**
 * The embed snippet for a council's ranking card: an image inside a link, with
 * no script and no frame, so it needs nothing from the page that pastes it and
 * nothing from this site's Content Security Policy.
 */
export function embedSnippet(site: string, slug: string, alt: string, pagePath: string): string {
  const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return `<a href="${site}${pagePath}"><img src="${site}${rankingCardPath(slug)}" width="1200" height="630" alt="${escape(alt)}"></a>`;
}

/**
 * The adult social care maximum as the year's referendum principles state it,
 * from the technical notes MHCLG publishes with the tables. Null when the text
 * does not state one in the form the notes for the launch year used; the page then lists
 * each council's published figure without saying which used the maximum.
 */
export function ascMaximum(principles: string | null | undefined): number | null {
  const match = /maximum of (\d+(?:\.\d+)?)% for expenditure on adult social care/.exec(principles ?? "");
  return match ? Number(match[1]) : null;
}

export interface AscRow {
  gss: string;
  name: string;
  table: string;
  /** The published change in the council's own Band D, excluding parish precepts, in percent. */
  changePct: number | null;
  /** The published change attributed to the adult social care precept, in percent. */
  ascChangePct: number | null;
  /** The published adult social care element of Band D, in pounds. */
  ascBandD: number | null;
  /** changePct less ascChangePct, calculated, to two places; null when either is unpublished. */
  otherPct: number | null;
  county: boolean;
}

const twoPlaces = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

function ascRow(gss: string, own: OwnFigures, county: boolean): AscRow {
  const otherPct = typeof own.changePct === "number" && typeof own.ascChangePct === "number"
    ? twoPlaces(own.changePct - own.ascChangePct) : null;
  return { gss, name: own.name, table: own.table, changePct: own.changePct, ascChangePct: own.ascChangePct, ascBandD: own.ascBandD, otherPct, county };
}

/**
 * Every authority with an adult social care element in the year's own tables
 * (counties, unitaries, metropolitan districts and London boroughs: 153 in
 * the launch year), A to Z. An authority whose element is published as unavailable is
 * kept with nulls, never dropped and never shown as zero.
 */
export function ascRows(data: YearFile): AscRow[] {
  const rows = [
    ...Object.entries(data.counties).filter(([, own]) => own.ascBandD !== null || own.ascChangePct !== null).map(([gss, own]) => ascRow(gss, own, true)),
    ...Object.entries(data.authorities)
      .filter(([, a]) => a.own && a.classCode !== "SD")
      .map(([gss, a]) => ascRow(gss, a.own!, false)),
  ];
  return rows.sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
}

/** The rows split by whether the published adult social care change equals the stated maximum. */
export function ascSplit(rows: AscRow[], maximum: number | null) {
  if (maximum === null) return null;
  return {
    atMaximum: rows.filter((row) => row.ascChangePct === maximum),
    below: rows.filter((row) => typeof row.ascChangePct === "number" && row.ascChangePct < maximum),
    above: rows.filter((row) => typeof row.ascChangePct === "number" && row.ascChangePct > maximum),
    unpublished: rows.filter((row) => typeof row.ascChangePct !== "number"),
  };
}
