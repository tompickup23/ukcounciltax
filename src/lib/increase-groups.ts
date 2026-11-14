/** The existing own share table cohorts and order, shared with their drawings. */
import {loadYear, type OwnFigures, type Year} from './council-tax';

export interface IncreaseRow {gss: string; name: string; own: OwnFigures}
export const INCREASE_GROUP_IDS = ['unitary', 'county', 'district'] as const;
export type IncreaseGroupId = typeof INCREASE_GROUP_IDS[number];

export const sortRows = (list: IncreaseRow[]) => list
  .filter(row => typeof row.own.changePct === 'number')
  .sort((a, b) => (b.own.changePct as number)-(a.own.changePct as number) || a.name.localeCompare(b.name));

export function increaseGroups(year: Year) {
  const file = loadYear(year);
  const authorities = Object.entries(file.authorities).filter(([, authority]) => authority.own);
  const rowsFor = (district: boolean): IncreaseRow[] => authorities
    .filter(([, authority]) => (authority.classCode === 'SD') === district)
    .map(([gss, authority]) => ({gss, name: authority.name, own: authority.own as OwnFigures}));
  const tables = file.source.ownTables;
  const groups = [
    {id: 'unitary', label: 'London boroughs, metropolitan districts and unitary authorities', question: 'How much did London boroughs, metropolitan districts and unitary authorities raise their share', table: tables.unitary, rows: rowsFor(false), pounds: false},
    {id: 'county', label: 'Shire county councils', question: 'How much did county councils raise their share', table: tables.county, rows: Object.entries(file.counties).map(([gss, own]) => ({gss, name: `${own.name} County Council`, own})), pounds: false},
    {id: 'district', label: 'Shire district councils', question: 'How much did district councils raise their share', table: tables.district, rows: rowsFor(true), pounds: true},
  ] satisfies {id: IncreaseGroupId; label: string; question: string; table: string; rows: IncreaseRow[]; pounds: boolean}[];
  return groups.map(group => {
    const rows = sortRows(group.rows);
    return {...group, rows, omitted: group.rows.length-rows.length};
  });
}

export const increaseFigureKey = (year: Year, group: IncreaseGroupId, gss: string) => `increase.${year}.${group}.${gss}`;
