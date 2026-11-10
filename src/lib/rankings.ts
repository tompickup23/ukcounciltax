import type { Authority, YearFile } from './council-tax';
import { loadRegistry } from './registry';

export const RANK_CLASSES = [
  {slug: 'shire-districts', label: 'shire districts', codes: ['SD'], ownTable: 'Table_8c', areaType: 'shire', table2: 'Shire Districts'},
  {slug: 'unitary-authorities', label: 'unitary authorities', codes: ['UA'], ownTable: 'Table_8a', areaType: 'unitary', table2: 'Shire Unitary Authorities'},
  {slug: 'metropolitan-districts', label: 'metropolitan districts', codes: ['MD'], ownTable: 'Table_8a', areaType: 'metropolitan', table2: 'Metropolitan Districts'},
  {slug: 'london-boroughs', label: 'London boroughs and the City of London', codes: ['ILB', 'OLB'], ownTable: 'Table_8a', areaType: 'london', table2: 'London Boroughs'},
] as const;
export const COUNTY_CLASS = {slug: 'county-councils', label: 'county councils', ownTable: 'Table_8b', table2: 'Shire Counties'} as const;
export type RankClass = typeof RANK_CLASSES[number];
export type RankingClass = RankClass | typeof COUNTY_CLASS;
export const classFor = (code: Authority['classCode']) => RANK_CLASSES.find(cls => (cls.codes as readonly string[]).includes(code));
const numeric = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const members = (year: YearFile, cls: RankClass) => Object.entries(year.authorities).filter(([, a]) => (cls.codes as readonly string[]).includes(a.classCode));

export function isComplete(year: YearFile, cls: RankingClass): boolean {
  if (Object.keys(year.authorities).length !== 296) return false;
  if (!('codes' in cls)) return Object.keys(year.counties).length === 21 && Object.values(year.counties).every(a => numeric(a.bandD));
  const rows = members(year, cls);
  return rows.length > 0 && rows.every(([, a]) => numeric(a.bands.D) && numeric(a.own?.bandD));
}

/** One result per input, in input order; positions compare the stored precision. */
export function competitionRank(values: readonly number[]) {
  const sorted = [...values].sort((a, b) => a-b);
  const positions = new Map<number, {position: number; tied: boolean}>();
  sorted.forEach((value, index) => {
    if (!positions.has(value)) positions.set(value, {position: index + 1, tied: sorted[index + 1] === value});
  });
  return values.map(value => positions.get(value)!);
}

export function rankClass(year: YearFile, cls: RankClass) {
  if (!isComplete(year, cls)) return null;
  const registry = loadRegistry();
  const rows = members(year, cls).sort(([, a], [, b]) => a.bands.D-b.bands.D || a.name.localeCompare(b.name, 'en-GB'));
  const areas = competitionRank(rows.map(([, a]) => a.bands.D));
  const own = competitionRank(rows.map(([, a]) => a.own!.bandD!));
  return rows.map(([gss, a], index) => ({gss, name: a.name, slug: registry.councils[gss].slug,
    area: a.bands.D, areaPosition: areas[index].position, areaTied: areas[index].tied,
    own: a.own!.bandD!, ownPosition: own[index].position, ownTied: own[index].tied,
    areaNotes: a.notes, ownNotes: a.own!.notes, londonType: a.area}));
}

export function rankCounties(year: YearFile) {
  if (!isComplete(year, COUNTY_CLASS)) return null;
  const rows = Object.entries(year.counties).sort(([, a], [, b]) => a.bandD!-b.bandD! || a.name.localeCompare(b.name, 'en-GB'));
  const positions = competitionRank(rows.map(([, a]) => a.bandD!));
  return rows.map(([gss, a], index) => ({gss, name: a.name, own: a.bandD!, ownPosition: positions[index].position, ownTied: positions[index].tied, ownNotes: a.notes}));
}

export function ordinal(n: number): string {
  const last = n % 100;
  return `${n}${last >= 11 && last <= 13 ? 'th' : ({1: 'st', 2: 'nd', 3: 'rd'} as Record<number, string>)[n % 10] ?? 'th'}`;
}
export const positionWords = (position: number, tied: boolean) => `${tied ? 'joint ' : ''}${ordinal(position)}`;
export const positionCell = (position: number, tied: boolean) => `${position}${tied ? '=' : ''}`;

export function sentenceCase(label: string): string { return label.charAt(0).toUpperCase() + label.slice(1); }
