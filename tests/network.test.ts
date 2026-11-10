import {expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {networkLinks} from '../src/lib/network';
import {loadRegistry, contextLinks, sisterLinks} from '../src/lib/registry';
import {loadYear, CURRENT_YEAR} from '../src/lib/council-tax';
it('preserves existing destinations with 294 population and 71 election lines', () => {
  const registry = loadRegistry();
  let residents = 0, elections = 0;
  for (const [gss, tax] of Object.entries(loadYear(CURRENT_YEAR).authorities)) {
    const council = registry.councils[gss];
    const links = networkLinks(council,tax.name);
    const existing = [...contextLinks(council),...sisterLinks(council)].map(link => link.url);
    for (const link of links) expect(existing).toContain(link.url);
    residents += links.filter(link => link.residents !== undefined).length;
    elections += links.filter(link => link.election).length;
  }
  expect(residents).toBe(294);expect(elections).toBe(71);
  const burnley = networkLinks(registry.councils.E07000117,'Burnley');
  expect(burnley.map(link => link.site)).toEqual(['UK Councils','UK Places','UK Demographics','UK Elections','AI DOGE']);
  expect(burnley[2].residents).toBe(100946);expect(burnley[3].election?.nextYear).toBe(2027);
});
it('imports only the 174 verified years and preserves the source register', () => {
  const data = JSON.parse(readFileSync('data/links/next-elections.json','utf8'));
  expect(Object.keys(data.councils)).toHaveLength(174);
  const counts: Record<string,number> = {};
  for (const row of Object.values(data.councils) as {nextYear:number}[]) counts[row.nextYear]=(counts[row.nextYear]??0)+1;
  expect(counts).toEqual({2027:152,2028:8,2029:12,2030:2});
});
