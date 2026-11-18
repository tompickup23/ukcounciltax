import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {STATIC_PATHS} from '../src/lib/site';
import {programmaticPaths, rankingPaths, parishPages, parishPath} from '../src/lib/paths';
import {townPaths} from '../src/lib/towns-pages';
import {townPartPaths} from '../src/lib/towns-parts';
import {townsData} from '../src/lib/towns';
import {sitemapLastmod, STATIC_PAGE_DATES} from '../src/lib/releases';
import {CURRENT_YEAR, loadYear} from '../src/lib/council-tax';

describe('sitemap edition dates', () => {
  it('covers every indexed route without falling back to the clock', () => {
    const routes = [...STATIC_PATHS, ...programmaticPaths()];
    // 1,748 before the league tables split seven long region tables into 11 more part pages.
    expect(townPartPaths()).toHaveLength(11);
    expect(routes).toHaveLength(1748 + 11);
    for (const route of routes) expect(sitemapLastmod(route), route).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(() => sitemapLastmod('/unrecorded/')).toThrow('No recorded sitemap date');
  });
  it('uses the held dates for each data family', () => {
    const national = JSON.parse(readFileSync('data/national/sources.json', 'utf8'));
    const devolved = JSON.parse(readFileSync('data/devolved/council-tax.json', 'utf8'));
    expect(sitemapLastmod('/councils/burnley/')).toBe(loadYear(CURRENT_YEAR).source.published);
    expect(sitemapLastmod('/tools/budget/burnley/')).toBe(national.raPart1.retrieved);
    expect(sitemapLastmod('/precepts/')).toBe(national.components.retrieved);
    expect(sitemapLastmod('/scotland/city-of-edinburgh/')).toBe(devolved.retrieved);
    expect(sitemapLastmod('/wales/cardiff/')).toBe(devolved.retrieved);
    expect(sitemapLastmod('/about/')).toBe(STATIC_PAGE_DATES['/about/']);
    for (const path of ['/council-tax/ranked/', ...rankingPaths()]) expect(sitemapLastmod(path)).toBe(loadYear(CURRENT_YEAR).source.updated);
    for (const path of ['/precepts/parishes/', ...parishPages().map(parishPath)]) expect(sitemapLastmod(path)).toBe(national.parishes.retrieved);
    // The towns pages: the later of the parish return and Table 10 retrievals.
    const towns = townsData.sources as Record<string, {retrieved: string}>;
    const townsDate = [towns.parishes.retrieved, towns.components.retrieved].sort().at(-1);
    for (const path of ['/council-tax/towns/', ...townPaths(), ...townPartPaths()]) expect(sitemapLastmod(path)).toBe(townsDate);
  });
});
