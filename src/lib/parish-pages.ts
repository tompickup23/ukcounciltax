import {CURRENT_YEAR, PREVIOUS_YEAR, yearLabel} from './council-tax';
import {national, type Parish} from './national-data';
import {moneyPence} from './tax-view';
import type {SourceRef} from './sources';

export const parishSource: SourceRef = {publisher: 'MHCLG', title: national.sources.parishes.title, url: national.sources.parishes.fileUrl, table: 'Parish_Level_Data and Notes', retrieved: national.sources.parishes.retrieved};
export const parishAmountWords = (pence: number) => pence < 0 ? `minus ${moneyPence(Math.abs(pence))}` : moneyPence(pence);
export function parishSummary(rows: readonly Parish[]) {
  const published = rows.filter(row => row.years[CURRENT_YEAR].status === 'published' && row.years[CURRENT_YEAR].bandDPence !== null);
  const nonZero = published.filter(row => row.years[CURRENT_YEAR].bandDPence !== 0);
  const values = nonZero.map(row => row.years[CURRENT_YEAR].bandDPence!);
  return {records: rows.length, nonZero: nonZero.length, zero: published.length-nonZero.length,
    ceased: rows.filter(row => row.years[CURRENT_YEAR].status !== 'published').length,
    min: values.length ? Math.min(...values) : null, max: values.length ? Math.max(...values) : null};
}
function joinedNames(rows: readonly Parish[], value: number): string {
  const names = rows.filter(row => row.years[CURRENT_YEAR].status === 'published' && row.years[CURRENT_YEAR].bandDPence === value).map(row => row.name).sort((a,b) => a.localeCompare(b,'en-GB'));
  if (names.length > 3) return `${names[0]} and ${names.length-1} others`;
  return names.length < 2 ? names[0] : `${names.slice(0,-1).join(', ')} and ${names.at(-1)}`;
}
export function parishRange(name: string, rows: readonly Parish[]): string {
  const summary = parishSummary(rows), year = yearLabel(CURRENT_YEAR);
  const sentences = [`The ${year} return lists ${summary.records} local precepting authorities in ${name}.`];
  const {min,max,nonZero,zero,ceased} = summary;
  if (min !== null && max !== null) {
    const minNames = `${joinedNames(rows,min)}${min < 0 ? ', a negative precept as published' : ''}`;
    if (min === max) sentences.push(`${nonZero === 1 ? 'One' : nonZero} set a Band D precept of ${parishAmountWords(min)} (${minNames}).`);
    else sentences.push(`${nonZero} set a Band D precept, from ${parishAmountWords(min)} (${minNames}) to ${parishAmountWords(max)} (${joinedNames(rows,max)}).`);
  }
  if (zero) sentences.push(`${zero} set a Band D precept of £0.00.`);
  if (ceased) sentences.push(`${ceased} listed for ${yearLabel(PREVIOUS_YEAR)} no longer exist in ${year}.`);
  return sentences.join(' ');
}
