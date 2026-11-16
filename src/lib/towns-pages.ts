/**
 * The page layer for the town league table (/council-tax/towns/): scopes, paths,
 * display labels, sources, titles and structured data. The rows and their
 * positions come from src/lib/towns.ts; nothing here changes a figure. Rules:
 * docs/TOWNS-SOURCE-NOTES.md, decisions T1 to T5.
 *
 * Wording (T2): visible copy says "lowest" and "highest". "Cheapest" and "most
 * expensive" are used only in the page title, the meta description and one H2,
 * which is why the H1 differs from the title on these routes.
 */
import {national} from './national-data';
import {parishPath} from './paths';
import {loadRegistry} from './registry';
import {moneyPence} from './tax-view';
import {absoluteUrl, SITE_URL} from './site';
import type {SourceRef} from './sources';
import {
  countTowns, extremes, filterTowns, hasFigure, rankTowns, statusLabel, townsData, towns,
  type RankedTown, type Town, type TownStatus,
} from './towns';
import {REGIONS, slugify} from './paths';

export const TOWNS_YEAR = townsData.year;
export const townsYear = TOWNS_YEAR.replace('-', '/');

export const townsPath = () => '/council-tax/towns/';
export const townRegionPath = (region: string) => `/council-tax/towns/region/${slugify(region)}/`;
/** Official names such as "Bristol, City of" read as "Bristol" in titles, copy and slugs. */
export const tidy = (name: string) => name.replace(/, (?:City|County) of$/, '');
export const townCountyPath = (county: string) => `/council-tax/towns/county/${slugify(tidy(county))}/`;
export const townConstituencyPath = (slug: string) => `/council-tax/towns/constituency/${slug}/`;
/** The deep link to one row: every row carries its MHCLG code as its id. */
export const townAnchor = (path: string, town: Town) => `${path}#${town.code}`;

export type ScopeKind = 'england' | 'region' | 'county' | 'constituency';
export interface TownScope {kind: ScopeKind; name: string; slug: string; path: string; rows: Town[]; code?: string}

/** "in the North West", "in Lancashire", "in the Burnley constituency". */
export function scopeIn(scope: Pick<TownScope, 'kind' | 'name'>): string {
  if (scope.kind === 'england') return 'in England';
  if (scope.kind === 'constituency') return `in the ${scope.name} constituency`;
  if (scope.kind === 'region' && !['London', 'Yorkshire and the Humber'].includes(scope.name)) return `in the ${scope.name}`;
  return `in ${scope.name}`;
}

export function englandScope(): TownScope {
  return {kind: 'england', name: 'England', slug: 'england', path: townsPath(), rows: [...towns]};
}

/** The nine regions, each with at least one row. */
export function regionScopes(): TownScope[] {
  return REGIONS.map(name => ({kind: 'region' as const, name, slug: slugify(name), path: townRegionPath(name), rows: filterTowns({region: name})}))
    .filter(scope => scope.rows.length > 0);
}

/** Every county value in the dataset (ONS county, the unitary itself, or Greater London). */
export function countyScopes(): TownScope[] {
  const names = [...new Set(towns.map(t => t.county))].sort((a, b) => a.localeCompare(b, 'en-GB'));
  return names.map(name => ({kind: 'county' as const, name: tidy(name), slug: slugify(tidy(name)), path: townCountyPath(name), rows: filterTowns({county: name})}));
}

/** T5: one page per English constituency that contains a parish or unparished area. */
export function constituencyScopes(): TownScope[] {
  const codes = new Set(towns.flatMap(t => t.constituencies.map(c => c.code)));
  return Object.entries(townsData.constituencies)
    .filter(([code]) => codes.has(code))
    .map(([code, c]) => ({kind: 'constituency' as const, name: c.name, slug: c.slug, code, path: townConstituencyPath(c.slug), rows: filterTowns({constituency: code})}))
    .sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
}

let pathsCache: string[] | undefined;
/** The programmatic towns routes (the hub is a static path in site.ts). */
export function townPaths(): string[] {
  pathsCache ??= [...regionScopes(), ...countyScopes(), ...constituencyScopes()].map(scope => scope.path);
  return pathsCache;
}

/** The county page a row belongs to, and its region. */
export const countyPathOf = (town: Town) => townCountyPath(town.county);
export const regionPathOf = (town: Town) => townRegionPath(town.region);

/**
 * Display labels. Council schedules print their unparished areas in their own
 * words ("Boston Special Expenses*"); the page gives them a tidy label and keeps
 * the printed name in the row's source detail. The JSON is never edited.
 */
const UNPARISHED_LABELS: Record<string, string> = {
  E2531U: 'Boston, unparished area',
  E3033U1: 'Broxtowe, Beeston special expense area',
  E3033U2: 'Broxtowe, rest of the borough',
  E1302U1: 'County Durham, unparished area',
  E1302U2: 'County Durham, unparished area in the former City of Durham',
};

/** The place as shown in tables, ledgers and copy: "Padiham" or "Burnley, unparished area". */
export function placeName(town: Town): string {
  if (town.kind === 'unparished') return UNPARISHED_LABELS[town.code] ?? `${tidy(town.councilName)}, unparished area`;
  return town.place;
}

/** The place with its council, for copy that names a row on its own. */
export function placeLabel(town: Town): string {
  if (town.kind === 'unparished') return placeName(town);
  return tidy(town.label);
}

/** The name the council printed, where it differs from the display label. */
export function printedName(town: Town): string | null {
  const printed = town.schedule?.name;
  return printed && printed !== town.place && printed !== placeName(town) ? printed : null;
}

/** Short chip words; the legend gives each status's full label from the data. */
export const STATUS_CHIPS: Record<TownStatus, string> = {
  'calculated': 'Calculated',
  'calculated-group-member': 'Calculated, group',
  'council-schedule': 'Published by the council',
  'special-expenses': 'Published by the council only',
  'group-member-unresolved': 'Listed under its group',
  'charter-trustees-included': 'Included in the areas it covers',
  'partial-charter-trustee-cover': 'Not available',
};

export const money = (pence: number) => pence < 0 ? `minus ${moneyPence(-pence)}` : moneyPence(pence);
export const signedMoney = (pence: number) => pence > 0 ? `+${moneyPence(pence)}` : pence < 0 ? `minus ${moneyPence(-pence)}` : moneyPence(0);

/** The figure cell for a row without a figure: never zero, never blank. */
export const noFigure = (town: Town) => town.status === 'special-expenses' ? 'Published by the council only' : 'Not published';

const sameParishReturn = national.sources.parishes.sha256 === (townsData.sources.parishes as {sha256: string}).sha256;
const parishByCode = new Map(sameParishReturn ? national.parishes.map(p => [p.code, p]) : []);
/**
 * The parish part of a row: from the row where the dataset holds its parts, else
 * from the same parish return row (the file hashes must match). Null when unknown.
 */
export function parishPart(town: Town): number | null {
  if (town.parts) return town.parts.parish + town.parts.trustees;
  if (town.kind === 'unparished') return null;
  const year = parishByCode.get(town.code)?.years[TOWNS_YEAR];
  return year?.status === 'published' ? year.bandDPence : null;
}

/** The council link for a row: its parish precepts page where one exists, else its profile. */
const parishPageSlugs = new Set(national.parishes.map(p => p.gss));
const registry = loadRegistry();
export function councilHref(gss: string): string {
  const council = registry.councils[gss];
  return parishPageSlugs.has(gss) ? parishPath(council) : `/councils/${council.slug}/`;
}

/** Sources, from the dataset's own sources block. */
type RawSource = {publisher: string; title: string; url: string; fileUrl?: string; retrieved: string; tables?: string[]; itemUrl?: string};
const src = townsData.sources as Record<string, RawSource>;
export const FULL_METHOD = 'Full Band D calculated from published figures: the council\'s Band D excluding local precepts and the major precepts (Table 10), plus the parish Band D';
export const POSITION_METHOD = 'Positions and differences are our calculation from the figures above: lowest first, equal figures share a position';
export const townSources = {
  /** The GOV.UK statistics page for Table 10, for pages that link only to GOV.UK pages. */
  componentsPage: src.components.url,
  components: {publisher: 'MHCLG', title: src.components.title, url: src.components.fileUrl ?? src.components.url, table: 'Data_Billing, lines 9 and 16', retrieved: src.components.retrieved} satisfies SourceRef,
  parishes: {publisher: 'MHCLG', title: src.parishes.title, url: src.parishes.fileUrl ?? src.parishes.url, table: 'Parish_Level_Data', retrieved: src.parishes.retrieved} satisfies SourceRef,
  parishWard: {publisher: 'ONS', title: src.parishWard.title, url: src.parishWard.itemUrl ?? src.parishWard.url, retrieved: src.parishWard.retrieved} satisfies SourceRef,
  wardConstituency: {publisher: 'ONS', title: src.wardConstituency.title, url: src.wardConstituency.itemUrl ?? src.wardConstituency.url, retrieved: src.wardConstituency.retrieved} satisfies SourceRef,
  ladCounty: {publisher: 'ONS', title: src.ladCounty.title, url: src.ladCounty.itemUrl ?? src.ladCounty.url, retrieved: src.ladCounty.retrieved} satisfies SourceRef,
};

type ScheduleSource = {publisher: string; title?: string; table?: string; url: string; retrieved: string};
const schedules = (townsData.sources as {councilSchedules: Record<string, ScheduleSource>}).councilSchedules;
/** The council's own published schedule for a council with status council-schedule rows. */
export function scheduleSource(gss: string): SourceRef | null {
  const s = schedules[gss];
  if (!s) return null;
  return {publisher: s.publisher, title: s.title ?? `Council tax by area, ${townsYear} (council document)`, url: s.url, table: s.table ?? 'totals by area, as printed', retrieved: s.retrieved};
}
/** Every council schedule behind the rows given, in council name order. */
export function scheduleSourcesFor(rows: readonly Town[]): SourceRef[] {
  const gss = [...new Set(rows.filter(t => t.status === 'council-schedule').map(t => t.councilGss))];
  return gss.sort((a, b) => townsData.councils[a].name.localeCompare(townsData.councils[b].name, 'en-GB')).map(g => scheduleSource(g)!);
}

/** One scope's numbers, as every scope page and the hub use them. */
export function scopeSummary(rows: readonly Town[]) {
  const ranked = rankTowns(rows);
  const ext = extremes(rows, 10);
  const counts = countTowns(rows);
  const figures = ranked.map(r => r.town.fullBandDPence);
  const median = figures.length ? (figures.length % 2 ? figures[(figures.length-1) / 2] : Math.round((figures[figures.length / 2-1] + figures[figures.length / 2]) / 2)) : null;
  const parishes = ranked.filter(r => r.town.kind === 'parish' || r.town.kind === 'group');
  const lowest = ranked[0] ?? null, highest = ranked.at(-1) ?? null;
  return {
    ranked, counts, median,
    lowest, highest,
    lowestJoint: lowest ? ranked.filter(r => r.town.fullBandDPence === lowest.town.fullBandDPence) : [],
    highestJoint: highest ? ranked.filter(r => r.town.fullBandDPence === highest.town.fullBandDPence) : [],
    lowestParish: parishes[0] ?? null,
    gap: lowest && highest ? highest.town.fullBandDPence-lowest.town.fullBandDPence : null,
    ledgerLow: ledger(ext.lowest, 'low'), ledgerHigh: ledger(ext.highest, 'high'),
    unplaced: rows.filter(t => !hasFigure(t)),
  };
}

/**
 * A ledger of at most ten places. A tie at the edge can hold many rows, so beyond
 * ten the list stops and says how many more share the last figure shown.
 */
function ledger(rows: RankedTown[], side: 'low' | 'high') {
  if (rows.length <= 12) return {rows, more: 0, moreAt: null as RankedTown | null};
  const shown = rows.slice(0, 10);
  const edge = shown.at(-1)!;
  const sameAsEdge = rows.filter(r => r.town.fullBandDPence === edge.town.fullBandDPence).length;
  const shownAtEdge = shown.filter(r => r.town.fullBandDPence === edge.town.fullBandDPence).length;
  void side;
  return {rows: shown, more: sameAsEdge-shownAtEdge, moreAt: edge};
}

/** The plain sentence naming the five lowest and five highest, so the text is crawlable. */
export function crawlSentence(summary: ReturnType<typeof scopeSummary>, where: string): string | null {
  const {ranked} = summary;
  if (ranked.length < 10) return null;
  const name = (r: RankedTown) => `${placeLabel(r.town)} (${money(r.town.fullBandDPence)})`;
  const list = (rows: RankedTown[]) => `${rows.slice(0, -1).map(name).join('; ')} and ${name(rows.at(-1)!)}`;
  return `The five lowest full Band D figures ${where} are ${list(ranked.slice(0, 5))}. The five highest are ${list(ranked.slice(-5).reverse())}.`;
}

/** Title, H1 and meta description per T2, with the figures from the data. */
export function scopeText(scope: TownScope, summary: ReturnType<typeof scopeSummary>) {
  const where = scopeIn(scope);
  const h1Lead = 'Council tax by parish and unparished area in';
  const h1Place = `${where.replace(/^in /, '')} ${townsYear}`;
  // A scope with fewer than two figures has no lowest and highest to name, so no T2 words.
  const title = summary.ranked.length >= 2
    ? `Cheapest and most expensive council tax ${scope.kind === 'england' ? 'areas ' : ''}${where} ${townsYear}`
    : `${h1Lead} ${h1Place}`;
  const n = summary.counts.withFigure.toLocaleString('en-GB');
  const {lowest, highest, lowestParish} = summary;
  const short = (r: RankedTown) => `${placeLabel(r.town)} ${money(r.town.fullBandDPence)}`;
  let description: string;
  if (lowest && highest && lowest !== highest) {
    const parishBit = scope.kind === 'england' && lowestParish && lowestParish !== lowest ? `, lowest parish ${placeName(lowestParish.town)} ${money(lowestParish.town.fullBandDPence)}` : '';
    description = `Cheapest and most expensive full Band D ${where}, ${townsYear}, across ${n} areas: lowest ${short(lowest)}${parishBit}, highest ${short(highest)}.`;
    if (description.length > 160) description = `Cheapest and most expensive full Band D ${where}, ${townsYear}: lowest ${short(lowest)}, highest ${short(highest)}.`;
    if (description.length > 160) description = `Full Band D ${where}, ${townsYear}: ${n} areas from ${money(lowest.town.fullBandDPence)} to ${money(highest.town.fullBandDPence)}. MHCLG figures.`;
  } else if (lowest) {
    description = `Full Band D ${where}, ${townsYear}: ${short(lowest)}. Calculated from published MHCLG figures.`;
  } else {
    description = `Parish and unparished areas ${where}, ${townsYear}. Full Band D is published by the council only for these areas.`;
  }
  if (description.length > 160) description = `Full Band D by parish and unparished area ${where}, ${townsYear}, with sources.`;
  return {title, h1Lead, h1Place, description, where};
}

const OGL = 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/';
/** JSON-LD: a Dataset for the table, and the lowest and highest ten by name and anchor only. */
export function scopeStructuredData(scope: TownScope, summary: ReturnType<typeof scopeSummary>, description: string) {
  const where = scopeIn(scope);
  const item = (r: RankedTown, i: number) => ({'@type': 'ListItem', position: i + 1, name: placeLabel(r.town), url: absoluteUrl(townAnchor(scope.path, r.town))});
  const list = (name: string, rows: RankedTown[], order: string) => ({
    '@context': 'https://schema.org', '@type': 'ItemList', name, itemListOrder: order,
    numberOfItems: rows.length, itemListElement: rows.map(item),
  });
  const low = summary.ranked.slice(0, 10), high = summary.ranked.slice(-10).reverse();
  const nodes: object[] = [{
    '@context': 'https://schema.org', '@type': 'Dataset',
    name: `Full Band D council tax by parish and unparished area ${where}, ${townsYear}`,
    description,
    url: absoluteUrl(scope.path),
    temporalCoverage: `${TOWNS_YEAR.slice(0, 4)}-04-01/${Number(TOWNS_YEAR.slice(0, 4)) + 1}-03-31`,
    spatialCoverage: {'@type': 'Place', name: scope.kind === 'constituency' ? `${scope.name} constituency` : scope.name},
    isBasedOn: [townSources.components.url, townSources.parishes.url],
    creator: {'@id': `${SITE_URL}/#publisher`},
    license: OGL,
    isAccessibleForFree: true,
    variableMeasured: 'Full Band D council tax, including the parish precept',
  }];
  if (low.length >= 2) nodes.push(list(`Lowest full Band D ${where}, ${townsYear}`, low, 'https://schema.org/ItemListOrderAscending'));
  if (high.length >= 2) nodes.push(list(`Highest full Band D ${where}, ${townsYear}`, high, 'https://schema.org/ItemListOrderDescending'));
  return nodes;
}

export {statusLabel};
