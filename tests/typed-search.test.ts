import { describe, expect, it } from 'vitest';
import { councilIndex } from '../src/lib/council-index';
import { englishRows, devolvedRows } from '../src/lib/council-picker';
import { budgetFor } from '../src/lib/budget';
import { councilPages, parishPages, parishPath, programmaticPaths } from '../src/lib/paths';
import { matchesCouncil, matchingRegion, normalise, rankCouncils, searchStatus } from '../src/lib/council-search';
import { pageTypeFor, pageTypeLabel } from '../src/lib/page-type';
import { GET } from '../src/pages/council-index.json';

const rows = councilIndex();
const matches = (query: string) => {
  const region = matchingRegion(query, rows.map(row => row.region));
  return rankCouncils(query, rows.filter(row => matchesCouncil(query, row.search) && (!region || normalise(row.region) === region)));
};

describe('council search destinations', () => {
  it('covers each current profile once, including all devolved profiles', () => {
    const routes = programmaticPaths().filter(path => /^\/(?:councils|scotland|wales)\/[^/]+\/$/.test(path));
    expect(rows.map(row => row.url).sort()).toEqual(routes.sort());
    expect(new Set(rows.map(row => row.gss)).size).toBe(rows.length);
    expect(rows.filter(row => row.nation !== 'England')).toHaveLength(54);
    for (const picker of [...englishRows('profile'), ...devolvedRows()]) {
      expect(rows.find(row => row.gss === picker.gss)).toMatchObject({ name: picker.name, search: picker.search, type: picker.type, region: picker.region, url: picker.href });
    }
  });

  it('offers games only where a return exists and parishes only where routes exist', () => {
    const parishes = new Map(parishPages().map(row => [row.gss, parishPath(row)]));
    for (const { council } of councilPages()) {
      const row = rows.find(row => row.gss === council.gss)!;
      const game = budgetFor(council.gss).council.status === 'available';
      expect(row.budgetUrl).toBe(game ? `/tools/budget/${council.slug}/` : undefined);
      expect(row.parishUrl).toBe(parishes.get(council.gss));
    }
    expect(rows.filter(row => row.nation === 'England' && !row.budgetUrl)).toHaveLength(9);
    for (const row of rows.filter(row => row.nation !== 'England')) {
      expect(row.budgetUrl).toBeUndefined(); expect(row.parishUrl).toBeUndefined();
    }
  });

  it('serves the same rows as JSON', async () => {
    const response = await GET({} as Parameters<typeof GET>[0]);
    expect(response.headers.get('content-type')).toBe('application/json; charset=utf-8');
    expect(await response.json()).toEqual(rows);
  });
});

it.each([
  ['Burnley', 'burnley'], ['Leeds', 'leeds'], ['Cornwall', 'cornwall'], ['Westminster', 'westminster'],
  ['Kingston upon Hull', 'kingston-upon-hull-city-of'], ['Bristol', 'bristol-city-of'], ['Durham', 'county-durham'],
  ['York', 'york'], ['Rutland', 'rutland'], ['Cardiff', 'cardiff'],
])('puts %s first', (query, slug) => {
  expect(matches(query)[0].url).toBe(`/${slug === 'cardiff' ? 'wales' : 'councils'}/${slug}/`);
});

it('uses picker matching for counties, regions, multiple words and accents', () => {
  const expected = englishRows('profile').filter(row => row.county === 'Lancashire').map(row => row.gss).sort();
  expect(expected).toHaveLength(12);
  expect(matches('lancashire').map(row => row.gss).sort()).toEqual(expected);
  for (const region of new Set(rows.map(row => row.region))) {
    expect(matches(region).map(row => row.gss).sort()).toEqual(rows.filter(row => row.region === region).map(row => row.gss).sort());
  }
  expect(matches('ley burn')[0].url).toBe('/councils/burnley/');
  expect(matches('BÚRNLEY')[0].url).toBe('/councils/burnley/');
  expect(matches('zxqvnomatchingplace')).toEqual([]);
  expect(normalise('  Caerffili  ')).toBe('caerffili');
});

it('labels each kind of search result from its own route', () => {
  for (const [path, type] of [
    ['/councils/burnley/', 'council'], ['/scotland/glasgow-city/', 'council'], ['/wales/cardiff/', 'council'],
    ['/tools/budget/burnley/', 'budget'], ['/precepts/parishes/burnley/', 'parish'],
    ['/council-tax/ranked/shire-districts/', 'ranking'], ['/council-tax/band-d/', 'band'],
    ['/council-tax/north-west/', 'region'], ['/scotland/', 'nation'], ['/help/', 'guide'],
    ['/increases/', 'guide'], ['/compare/', 'tool'], ['/tools/budget/', 'hub'], ['/about/', 'other'],
  ]) expect(pageTypeFor(path)).toBe(type);
  expect(pageTypeLabel('council')).toBe('Council');
  expect(pageTypeLabel('other')).toBe('Page');
  expect(pageTypeLabel('toString')).toBeNull();
});

it('reports both counts, pagination and failures without claiming an empty result', () => {
  expect(searchStatus(12, 5, 12)).toBe('12 matching councils; 5 matching pages.');
  expect(searchStatus(25, 1, 12)).toBe('25 matching councils (12 listed); 1 matching page.');
  expect(searchStatus(25, 1, 24)).toContain('(24 listed)');
  expect(searchStatus(0, 0)).toContain('No matching pages or councils');
  expect(searchStatus(null, 5)).toContain('Council search could not load');
  expect(searchStatus(1, null)).toContain('1 matching council; Page search could not load');
});
