import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {budget, budgetYear, type BudgetCouncil} from './budget';

export interface PopulationArea {
  code: string; name: string; geography: string;
  allAges: number; under18: number; age18to64: number; age65plus: number; age18plus: number;
}
export interface PopulationSource {
  publisher: string; title: string; release: string; edition: string; published: string;
  reference: string; url: string; fileUrl: string; file: string; sha256: string;
  retrieved: string; tables: string[]; precision: string; licence: string;
}
export const population = JSON.parse(readFileSync(join(process.cwd(), 'data/national/population.json'), 'utf8')) as {
  source: PopulationSource; areas: Record<string, PopulationArea>;
};
if (budget.sources.raPart1.sha256 !== '3ea4d4c2218bc9f49bbf59a6fc82481acb6a3494d5b0f4e114cdb945730653db' || population.source.sha256 !== '8ae244e3341257ecccaee55f4973fe12f46afe6656ead6c1a9ed3f4f8585e40f') throw new Error('Per resident source edition changed; stop for review');
export const YEAR_MISMATCH = `The population estimate is for mid-2025; the budget is for ${budgetYear}.`;
export const BOUNDARY_REASON = 'The population estimate and the budget return use different boundary codes, and the site does not join them.';
export const NO_RETURN_REASON = `No ${budgetYear} return was received in time for MHCLG’s publication on 11 June 2026.`;
export const DISTRICT_REASON = 'Per resident social care figures are shown only for social care authorities, defined by RA class SC, UA, MD or LB.';
export const WORKING_AGE_IDS = ['ascphyadl', 'ascsnsadl', 'ascmmradl', 'asclrnadl', 'ascmntadl'];
export const OLDER_PEOPLE_IDS = ['ascphyold', 'ascsnsold', 'ascmmrold', 'asclrnold', 'ascmntold'];
export const AGE_IDS = [...WORKING_AGE_IDS, ...OLDER_PEOPLE_IDS];
export const isSocialCareAuthority = (council: BudgetCouncil) => ['SC', 'UA', 'MD', 'LB'].includes(council.class);
const editions = {budget: {...budget.sources.raPart1, year: budget.year}, population: population.source};
type Band = 'age18plus' | 'age18to64' | 'age65plus' | 'under18';
function numerator(council: BudgetCouncil, ids: string[]) {
  return ids.map(id => {
    const field = budget.fields[id];
    const value = council.values[id];
    if (!field || value === null || !Number.isFinite(value)) throw new Error(`Missing social care line ${council.name} ${id}`);
    return {id, line: field.line, label: field.label, value, unit: 'GBP thousand' as const};
  });
}
function ratio(council: BudgetCouncil, area: PopulationArea, ids: string[], band: Band, label: string) {
  const lines = numerator(council, ids);
  const count = area[band];
  if (!(count > 0)) throw new Error(`Non-positive population ${area.code} ${band}`);
  const pounds = lines.reduce((total, line) => total + line.value, 0) * 1000;
  return {recordType: 'calculation' as const, label, numeratorLines: lines, numeratorPounds: pounds,
    denominator: {code: area.code, band, count}, editions, value: pounds / count,
    unit: 'GBP per resident', method: 'Sum of the printed RA figures in thousands of pounds multiplied by 1,000, divided by the ONS resident count.'};
}

/** Same-code join only. Class determines eligibility, never the value of a service line. */
export function perResidentFor(code: string, council = budget.councils[code], areas = population.areas) {
  if (!council) throw new Error(`Missing budget council ${code}`);
  const area = areas[code];
  if (!area && !['E08000038', 'E08000039'].includes(code)) throw new Error(`Unexpected missing ONS row ${code}; stop for review`);
  if (!isSocialCareAuthority(council)) return {code, ratios: null, reason: DISTRICT_REASON};
  if (council.status === 'no return') return {code, ratios: null, reason: NO_RETURN_REASON};
  if (['E08000038', 'E08000039'].includes(code)) return {code, ratios: null, reason: BOUNDARY_REASON};
  const adult = ratio(council, area, ['asctot'], 'age18plus', 'Adult social care per adult');
  const workingAge = ratio(council, area, WORKING_AGE_IDS, 'age18to64', 'Adult social care attributed to working-age adults, per resident aged 18 to 64');
  const olderPeople = ratio(council, area, OLDER_PEOPLE_IDS, 'age65plus', 'Adult social care attributed to older people, per resident aged 65 and over');
  const children = ratio(council, area, ['csctot'], 'under18', 'Children’s social care per child');
  const amount = adult.numeratorPounds - workingAge.numeratorPounds - olderPeople.numeratorPounds;
  return {code, ratios: {adult, workingAge, olderPeople, children}, reason: null,
    unattributed: {recordType: 'calculation' as const, amount, unit: 'GBP',
      share: adult.numeratorPounds === 0 ? null : amount / adult.numeratorPounds * 100,
      shareReason: adult.numeratorPounds === 0 ? 'A percentage cannot be calculated because line 360 is zero.' : null,
      totalLines: adult.numeratorLines, subtractedLines: [...workingAge.numeratorLines, ...olderPeople.numeratorLines], editions},
    smallPopulation: ['E09000001', 'E06000053'].includes(code)};
}
export const perResident = Object.fromEntries(Object.keys(budget.councils).map(code => [code, perResidentFor(code)]));
