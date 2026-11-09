import {AREA_TYPE_LABEL, pounds, yearLabel, type YearFile} from './council-tax';
import {COUNTY_CLASS, RANK_CLASSES, rankClass, rankCounties, type RankingClass} from './rankings';
import {loadRegistry} from './registry';

export const rankingClasses = [...RANK_CLASSES, COUNTY_CLASS];
export const rankingRule = 'The site ranks councils only against councils of the same type, and only for a year in which every council of that type has a published figure.';
export const rankingMethod = 'Positions calculated from the published figures: equal figures share a position';

/** The page consumes this same state for complete and incomplete editions. */
export function rankingPage(year: YearFile, cls: RankingClass) {
  const county = !('codes' in cls);
  const rows = 'codes' in cls ? rankClass(year, cls) : rankCounties(year)?.map(row => ({...row, slug: null, area: null, areaPosition: null, areaTied: false, areaNotes: [], londonType: null})) ?? null;
  const label = yearLabel(year.year);
  const title = county ? `County council precepts ranked: Band D ${label}` : `Council tax Band D ranked: ${cls.label} ${label}`;
  const first = rows?.[0], last = rows?.at(-1);
  const table = county ? 'Table 8b' : `Table 9 and ${cls.ownTable.replace('_', ' ')}`;
  const descriptionClass = cls.slug === 'london-boroughs' ? 'London authorities' : cls.label;
  const description = first && last ? `${rows!.length} ${descriptionClass}, ${label}: ${county ? 'own ' : ''}Band D ${pounds(county ? first.own : first.area)} in ${first.name} to ${pounds(county ? last.own : last.area)} in ${last.name}. ${county ? '' : 'Own shares shown. '}MHCLG ${table}.` : `Band D for ${label} is not yet published for every ${cls.label}, so this page does not rank them.`;
  const available = county ? Object.values(year.counties).filter(a => typeof a.bandD === 'number').map(a => ({name:a.name, slug:null})) : Object.entries(year.authorities).filter(([,a]) => 'codes' in cls && (cls.codes as readonly string[]).includes(a.classCode) && typeof a.bands.D === 'number').map(([gss,a]) => ({name:a.name,slug:loadRegistry().councils[gss].slug}));
  const notes = rows?.flatMap(row => [...row.areaNotes, ...row.ownNotes].map(note => ({...note, gss:row.gss, name:row.name}))) ?? [];
  return {county, rows, title, description, table, available, notes,
    areaLabel: 'areaType' in cls ? AREA_TYPE_LABEL[cls.areaType] : null,
    areaAverage: 'areaType' in cls ? year.england.areaBandD?.byAreaType[cls.areaType].pounds : null,
    ownAverage: year.england.byClass?.rows.find(row => row.class === cls.table2)?.bandD,
  };
}
