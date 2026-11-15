/** Towns dataset loader: full Band D by parish and unparished area, England.
 * Data: data/towns/england-2026-27.json (scripts/import-towns.mjs); rules in
 * docs/TOWNS-SOURCE-NOTES.md. Positions are standard competition ranking over
 * rows with a figure only, lowest first, as /council-tax/ranked/ does. A row
 * without a figure is never treated as zero and never gets a position.
 */
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {competitionRank} from './rankings';

export type TownKind = 'parish' | 'group' | 'unparished' | 'charter trustees' | 'temple';
export type TownStatus = 'calculated' | 'calculated-group-member' | 'council-schedule' | 'special-expenses'
  | 'group-member-unresolved' | 'charter-trustees-included' | 'partial-charter-trustee-cover';
export interface TownParts {own: number; parish: number; trustees: number; county: number; police: number; fire: number; combined: number}
export interface TownConstituency {code: string; name: string; slug: string}
interface RawTown {
  code: string; slug: string; name: string; place?: string; label?: string; kind: TownKind; type: string;
  councilGss: string; councilName: string; region: string; county: string;
  constituencies: string[]; constituencySplit?: boolean; constituencyNote?: string;
  match: {how: string; ons: string[]}; fullBandDPence: number | null; status: TownStatus; noteIds?: string[];
  parts: {parish: number; trustees: number} | null; parishChangePence: number | null;
  taxBase: number | null; taxBaseBasis?: string; largerPlace?: boolean; mhclgNotes?: string[];
  groupCarrier?: string; groupLabel?: string; charterTrustees?: string;
  schedule?: {name: string; quoted: string; includesCharterTrustee: boolean};
}
export interface Town extends Omit<RawTown, 'place' | 'label' | 'constituencies' | 'parts' | 'mhclgNotes' | 'constituencyNote' | 'constituencySplit' | 'noteIds' | 'taxBaseBasis' | 'largerPlace'> {
  constituencySplit: boolean; noteIds: string[]; taxBaseBasis: string; largerPlace: boolean; place: string; label: string; constituencies: TownConstituency[]; constituencyNote: string | null;
  parts: TownParts | null; mhclgNotes: string[]; councilSlug: string; regionCode: string; countyKind: string;
}
export interface TownCouncil {
  name: string; slug: string; mhclgName: string; region: string; regionCode: string; classCode: string; county: string; countyKind: string;
  ownExcludingParishPence: number; parts: {kind: 'county' | 'police' | 'fire' | 'combined'; name: string | null; bandDPence: number}[];
  specialExpensesPounds: number; taxBase: number; schedule: string | null;
}
export interface TownsData {
  schemaVersion: number; year: string; title: string; method: Record<string, string | number>;
  sources: Record<string, unknown>; fullChange: string; fullChangeNote: string;
  notes: Record<string, string>; statusLabels: Record<TownStatus, string>; statusesWithFigure: TownStatus[];
  counts: Record<string, unknown>; councils: Record<string, TownCouncil>;
  constituencies: Record<string, {name: string; slug: string}>;
}

const raw = JSON.parse(readFileSync(join(process.cwd(), 'data/towns/england-2026-27.json'), 'utf8')) as TownsData & {rows: RawTown[]};
export const townsData: TownsData = raw;

function restore(r: RawTown): Town {
  const council = raw.councils[r.councilGss];
  const place = r.place ?? r.name;
  const part = (kind: string) => council.parts.find(p => p.kind === kind)?.bandDPence ?? 0;
  return {
    ...r, place, label: r.label ?? (r.kind === 'unparished' ? place : `${place}, ${r.councilName}`),
    constituencies: r.constituencies.map(code => ({code, ...raw.constituencies[code]})),
    constituencyNote: r.constituencyNote ?? null, mhclgNotes: r.mhclgNotes ?? [],
    constituencySplit: r.constituencySplit ?? false, largerPlace: r.largerPlace ?? false, taxBaseBasis: r.taxBaseBasis ?? 'published',
    noteIds: r.noteIds ?? ['calculated', 'rounding'],
    parts: r.parts && {own: council.ownExcludingParishPence, parish: r.parts.parish, trustees: r.parts.trustees,
      county: part('county'), police: part('police'), fire: part('fire'), combined: part('combined')},
    councilSlug: council.slug, regionCode: council.regionCode, countyKind: council.countyKind,
  };
}

export const towns: readonly Town[] = raw.rows.map(restore);
export const townByCode = new Map(towns.map(t => [t.code, t]));
export const townBySlug = new Map(towns.map(t => [t.slug, t]));
export const hasFigure = (t: Town): t is Town & {fullBandDPence: number} => t.fullBandDPence !== null;
export const statusLabel = (t: Town) => raw.statusLabels[t.status];
export const noteText = (id: string) => raw.notes[id] ?? null;

export interface RankedTown {town: Town & {fullBandDPence: number}; position: number; tied: boolean; of: number}
const byName = (a: Town, b: Town) => a.label.localeCompare(b.label, 'en-GB');

/** Lowest first; ties share a position and are listed by label. Rows without a figure are left out. */
export function rankTowns(rows: readonly Town[]): RankedTown[] {
  const ranked = rows.filter(hasFigure).sort((a, b) => a.fullBandDPence - b.fullBandDPence || byName(a, b));
  const positions = competitionRank(ranked.map(t => t.fullBandDPence));
  return ranked.map((town, i) => ({town, ...positions[i], of: ranked.length}));
}

export interface TownFilter {region?: string; county?: string; councilGss?: string; constituency?: string; largerPlaces?: boolean}
/** Filters compare exact values: region and county names, council GSS, constituency code or slug. */
export function filterTowns(filter: TownFilter, rows: readonly Town[] = towns): Town[] {
  return rows.filter(t => (!filter.region || t.region === filter.region)
    && (!filter.county || t.county === filter.county)
    && (!filter.councilGss || t.councilGss === filter.councilGss)
    && (!filter.constituency || t.constituencies.some(c => c.code === filter.constituency || c.slug === filter.constituency))
    && (!filter.largerPlaces || t.largerPlace));
}

/** The n lowest and n highest by position; ties at the edge are all included. */
export function extremes(rows: readonly Town[], n = 10) {
  const ranked = rankTowns(rows);
  if (!ranked.length) return {lowest: [], highest: [], lowestFigure: null, highestFigure: null};
  const cutLow = ranked[Math.min(n, ranked.length) - 1].town.fullBandDPence;
  const cutHigh = ranked[Math.max(ranked.length - n, 0)].town.fullBandDPence;
  return {
    lowest: ranked.filter(r => r.town.fullBandDPence <= cutLow),
    highest: ranked.filter(r => r.town.fullBandDPence >= cutHigh).reverse(),
    lowestFigure: ranked[0].town.fullBandDPence, highestFigure: ranked.at(-1)!.town.fullBandDPence,
  };
}

export function countTowns(rows: readonly Town[] = towns) {
  const byStatus = Object.fromEntries(Object.keys(raw.statusLabels).map(s => [s, rows.filter(t => t.status === s).length])) as Record<TownStatus, number>;
  const withFigure = rows.filter(hasFigure);
  return {
    rows: rows.length, withFigure: withFigure.length, withoutFigure: rows.length-withFigure.length, byStatus,
    unparished: rows.filter(t => t.kind === 'unparished').length, largerPlaces: rows.filter(t => t.largerPlace).length,
  };
}

const sortedUnique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'en-GB'));
export const townRegions = () => sortedUnique(towns.map(t => t.region));
export const townCounties = () => sortedUnique(towns.map(t => t.county));
export const townCouncils = () => sortedUnique(towns.map(t => t.councilGss)).map(gss => ({gss, ...raw.councils[gss]}));
export const townConstituencies = (): TownConstituency[] => Object.entries(raw.constituencies).map(([code, c]) => ({code, ...c})).sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
