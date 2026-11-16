/**
 * Record line sources for the budget game page (W4, plan section 11.5).
 * Each figure on /tools/budget/<slug>/ carries a short record line; the full
 * reference (publisher, title, table, publication date) is printed once, in the
 * page's Sources block. Every value here is read from the data's own source
 * blocks, never typed.
 */
import type {SourceEntry} from '../components/PageSources.astro';
import {councilTaxSource, tableName, type SourceRef} from './sources';
import {loadYear} from './council-tax';
import {budget, budgetYear, budgetSource, billSource} from './budget';
import {population} from './per-resident';

const short = (part: string) => `Revenue expenditure and financing, ${budgetYear} budget, ${part}`;
/** The three RA files share one title and sheet name, so the full reference names the file as well. */
const ra = (key: 'raPart1' | 'raPart2' | 'raGrants', part: string): SourceRef => {
  const source = budgetSource(key);
  return {...source, table: `${budget.sources[key].fileUrl.split("/").pop()}, ${source.table}`, retrieved: budget.sources[key].retrieved, short: short(part)};
};

export const raPart1Ref = ra('raPart1', 'Part 1');
export const raPart2Ref = ra('raPart2', 'Part 2');
export const raGrantsRef = ra('raGrants', 'grants');
/** The published band charges, from the edition the budget page shows (C6). */
const bandTable = loadYear(budget.year).source.bandTable;
export const bandsRef: SourceRef = {...councilTaxSource(budget.year, bandTable), short: `Council tax levels ${budgetYear}, ${tableName(bandTable)}`};
export const billRef: SourceRef = {...billSource, short: `Council tax levels ${budgetYear}, Table 10`};
export const populationRef: SourceRef = {
  publisher: population.source.publisher,
  title: population.source.title,
  url: population.source.fileUrl,
  table: 'MYE2 Persons',
  date: population.source.published,
  retrieved: population.source.retrieved,
  short: `Population estimates, ${population.source.reference}, MYE2 Persons`,
};

/** Sources block entries, keyed by the record lines that point to them. */
export function budgetPageEntries(available: boolean): SourceEntry[] {
  const entries: SourceEntry[] = [
    {key: 'budget-ra-part1', label: 'Service spending, funding and the per resident numerators', method: 'Published in whole £ thousand and shown in pounds', sources: [raPart1Ref]},
    {key: 'budget-ra-part2', label: 'Non-ringfenced reserve balances', method: 'Published in whole £ thousand and shown in pounds', sources: [raPart2Ref]},
    {key: 'budget-ra-grants', label: 'Dedicated Schools Grant', method: 'Published in whole £ thousand and shown in pounds', sources: [raGrantsRef]},
    {key: 'budget-bill', label: 'Band D bill components', method: 'Published area averages in pounds and pence', sources: [billRef]},
    {key: 'budget-bands', label: 'Published whole-bill charges by band', method: 'Area averages including parish precepts, in pounds and pence', sources: [bandsRef]},
    {key: 'budget-population', label: 'Per resident ratios: budget lines and resident populations', method: 'A budget line divided by residents; single years of age grouped as under 18, 18 to 64, 65 and over, and 18 and over', sources: [raPart1Ref, populationRef]},
  ];
  if (available) return entries;
  // No budget return: the notice cites the publication it is missing from, and no RA figure is shown.
  return entries
    .filter(entry => entry.key !== 'budget-ra-part2' && entry.key !== 'budget-ra-grants')
    .map(entry => entry.key === 'budget-ra-part1' ? {key: entry.key, label: 'The budget publication with no return for this council', sources: entry.sources} : entry);
}
