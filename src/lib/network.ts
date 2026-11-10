import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {contextLinks, sisterLinks, type Council} from './registry';
const population = JSON.parse(readFileSync(join(process.cwd(), 'data/national/population.json'), 'utf8')) as {
  source: {publisher: string; title: string; fileUrl: string; published: string};
  areas: Record<string, {allAges: number}>;
};
const elections = JSON.parse(readFileSync(join(process.cwd(), 'data/links/next-elections.json'), 'utf8')) as {
  source: {source: {checked: string}};
  councils: Record<string, {nextYear: number; sourceLabel: string; sourceUrl: string}>;
};
export const populationSource = population.source;
export const electionsChecked = elections.source.source.checked;
export function networkLinks(council: Council, name: string) {
  const existing = [...contextLinks(council), ...sisterLinks(council)];
  return ['UK Councils', 'UK Places', 'UK Demographics', 'UK Elections', 'AI DOGE'].flatMap(site => {
    const link = existing.find(link => link.name === site);
    if (!link) return [];
    const residents = site === 'UK Demographics' ? population.areas[council.gss]?.allAges : undefined;
    const election = site === 'UK Elections' ? elections.councils[council.gss] : undefined;
    const label = site === 'UK Councils' ? `${name}'s council profile on UK Councils`
      : site === 'UK Places' ? `${name} on UK Places: the place, its boundaries and services`
      : site === 'UK Demographics' ? residents === undefined ? `${name}'s population on UK Demographics` : `${name} had ${residents.toLocaleString('en-GB')} residents at mid-2025: the area's population on UK Demographics`
      : site === 'UK Elections' ? election ? `${name}'s next scheduled council election is in ${election.nextYear}: seats and results on UK Elections` : `${name}'s seats and results on UK Elections`
      : `${name} on AI DOGE`;
    return [{site, url: link.url, label, residents, election}];
  });
}
