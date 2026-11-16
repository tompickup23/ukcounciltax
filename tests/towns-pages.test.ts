import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {filterTowns, hasFigure, rankTowns, townByCode} from '../src/lib/towns';
import {
  constituencyScopes, countyScopes, englandScope, placeLabel, placeName, printedName, regionScopes,
  scopeStructuredData, scopeSummary, scopeText, townCountyPath, townPaths,
} from '../src/lib/towns-pages';
import {townOgCard} from '../src/lib/towns-og';

const T2 = /\b(?:cheapest|most expensive|best|worst)\b/i;
const read = (path: string) => readFileSync(`dist${path}index.html`, 'utf8');
const text = (html: string) => html.replace(/<script\b[\s\S]*?<\/script>/g, ' ').replace(/<style\b[\s\S]*?<\/style>/g, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&').trim();
const bodyRows = (html: string) => [...html.matchAll(/<tr id="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)].map(m => ({id: m[1], text: text(m[2])}));

describe('towns page layer', () => {
  it('builds 9 region, 91 county and 541 constituency routes with unique slugs', () => {
    expect(regionScopes()).toHaveLength(9);
    expect(countyScopes()).toHaveLength(91);
    expect(constituencyScopes()).toHaveLength(541);
    expect(townPaths()).toHaveLength(641);
    expect(new Set(townPaths()).size).toBe(641);
    for (const scope of countyScopes()) expect(scope.name).not.toMatch(/, (?:City|County) of$/);
    expect(townCountyPath('Herefordshire, County of')).toBe('/council-tax/towns/county/herefordshire/');
  });

  it('gives printed council schedule names a tidy label and keeps the printed name', () => {
    const boston = townByCode.get('E2531U')!;
    expect(placeName(boston)).toBe('Boston, unparished area');
    expect(printedName(boston)).toBe('Boston Special Expenses*');
    expect(placeName(townByCode.get('E3033U1')!)).toBe('Broxtowe, Beeston special expense area');
    expect(placeName(townByCode.get('E3033U2')!)).toBe('Broxtowe, rest of the borough');
    expect(printedName(townByCode.get('E3033U2')!)).toBe('All other parts of the Council’s area');
    expect(placeName(townByCode.get('E2333U')!)).toBe('Burnley, unparished area');
  });

  it('names England\'s pair and the lowest parish area beside it', () => {
    const s = scopeSummary(englandScope().rows);
    expect(placeLabel(s.lowest!.town)).toBe('Wandsworth, unparished area');
    expect(s.lowest!.town.fullBandDPence).toBe(102821);
    expect(s.highest!.town.code).toBe('E1302P090');
    expect(s.highest!.town.fullBandDPence).toBe(294801);
    expect(s.lowestParish!.town.place).toBe('Marr');
    expect(s.lowestParish!.town.fullBandDPence).toBe(212495);
    expect(s.gap).toBe(294801-102821);
    expect(s.ranked).toHaveLength(7680);
    expect(s.unplaced).toHaveLength(2760);
    expect(s.ranked.every(r => hasFigure(r.town))).toBe(true);
  });

  it('keeps cheapest and most expensive to the title and description (T2)', () => {
    for (const scope of [englandScope(), ...regionScopes(), ...countyScopes().slice(0, 10), ...constituencyScopes().slice(0, 10)]) {
      const summary = scopeSummary(scope.rows);
      const t = scopeText(scope, summary);
      expect(t.title).toMatch(summary.ranked.length >= 2 ? /^Cheapest and most expensive council tax / : /^Council tax by parish and unparished area in /);
      expect(t.title.replace(scope.name, '')).not.toContain(', ');
      expect(`${t.h1Lead} ${t.h1Place}`).not.toMatch(T2);
      expect(t.description.length).toBeLessThanOrEqual(160);
    }
    expect(scopeText(englandScope(), scopeSummary(englandScope().rows)).title).toBe('Cheapest and most expensive council tax areas in England 2026/27');
  });

  it('lists names and anchors only in the ItemLists', () => {
    const scope = countyScopes().find(s => s.slug === 'lancashire')!;
    const nodes = scopeStructuredData(scope, scopeSummary(scope.rows), 'x') as {'@type': string; itemListElement?: {name: string; url: string}[]}[];
    expect(nodes.map(n => n['@type'])).toEqual(['Dataset', 'ItemList', 'ItemList']);
    for (const item of nodes[1].itemListElement!) {
      expect(item.url).toMatch(/^https:\/\/ukcounciltax\.co\.uk\/council-tax\/towns\/county\/lancashire\/#E\d{4}[PU]/);
      expect(item.name).not.toMatch(/£/);
    }
  });

  it('puts the pair on every share card with its caveat', () => {
    const card = townOgCard(englandScope());
    expect(card.pair?.map(p => p.value)).toEqual(['£1,028.21', '£2,948.01']);
    expect(card.caveat).toBeTruthy();
  });
});

describe.skipIf(!existsSync('dist/council-tax/towns/index.html'))('built towns pages', () => {
  it('lists every row of each county, region and constituency once, anchored by code', () => {
    for (const scope of [...regionScopes(), ...countyScopes(), ...constituencyScopes()]) {
      const rows = bodyRows(read(scope.path));
      expect(rows, scope.path).toHaveLength(scope.rows.length);
      expect(new Set(rows.map(r => r.id))).toEqual(new Set(scope.rows.map(t => t.code)));
    }
    expect(bodyRows(read('/council-tax/towns/county/lancashire/'))).toHaveLength(222);
    expect(bodyRows(read('/council-tax/towns/region/north-west/'))).toHaveLength(799);
    expect(bodyRows(read('/council-tax/towns/constituency/burnley/'))).toHaveLength(12);
  });

  it('prints ties, positions and the Padiham anchor row', () => {
    const rows = bodyRows(read('/council-tax/towns/county/lancashire/'));
    expect(rows.slice(0, 8).every(r => r.text.startsWith('1= '))).toBe(true);
    expect(rows[8].text).toMatch(/^9 Clayton le Dale/);
    const padiham = rows.find(r => r.id === 'E2333P007')!;
    expect(padiham.text).toMatch(/^165 Padiham .*£2,584\.38 £44\.06 \+£5\.42 Calculated$/);
    const england = rankTowns(filterTowns({county: 'Lancashire'}));
    expect(england).toHaveLength(181);
  });

  it('never shows a row without a figure as zero or in the order', () => {
    for (const path of ['/council-tax/towns/county/nottinghamshire/', '/council-tax/towns/county/lincolnshire/', '/council-tax/towns/region/east-midlands/']) {
      for (const row of bodyRows(read(path))) {
        const town = townByCode.get(row.id)!;
        if (hasFigure(town)) continue;
        expect(row.text, row.id).toMatch(/^Not placed /);
        expect(row.text).toMatch(town.status === 'special-expenses' ? /Published by the council only/ : /Not published/);
      }
    }
    const boston = bodyRows(read('/council-tax/towns/county/lincolnshire/')).find(r => r.id === 'E2531U')!;
    expect(boston.text).toContain('Boston, unparished area');
    expect(boston.text).toContain('printed as Boston Special Expenses*');
  });

  it('uses cheapest and most expensive only in the title, description and one H2 on every towns page', () => {
    for (const path of ['/council-tax/towns/', ...townPaths()]) {
      const html = read(path);
      const placed = bodyRows(html).filter(r => !r.text.startsWith('Not placed')).length;
      const ranked = path === '/council-tax/towns/' || placed >= 2;
      expect(html.match(/<title>(.*?)<\/title>/)![1]).toMatch(ranked ? /^Cheapest and most expensive council tax / : /^Council tax by parish and unparished area in /);
      const h2s = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(m => text(m[1]));
      expect(h2s.filter(h => T2.test(h)), path).toHaveLength(ranked ? 1 : 0);
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)![1].replace(/<h2 id="ledgers-heading"[^>]*>[\s\S]*?<\/h2>/, '');
      expect(text(main), path).not.toMatch(T2);
      const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
      expect(h1s).toHaveLength(1);
      expect(text(h1s[0][1])).toMatch(/^Council tax by parish and unparished area in .+ 2026\/27$/);
      expect(html.match(/"@type":"Dataset"/g)).toHaveLength(1);
    }
  });

  it('keeps the hub to bounded lists and links every region, county and constituency', () => {
    const hub = read('/council-tax/towns/');
    expect(bodyRows(hub)).toHaveLength(0);
    for (const scope of [...regionScopes(), ...countyScopes(), ...constituencyScopes()]) expect(hub).toContain(`href="${scope.path}"`);
    const t = text(hub);
    expect(t).toContain('Wandsworth, unparished area');
    expect(t).toContain('Lowest parish area: Marr, Doncaster');
    expect(t).toMatch(/The five lowest full Band D figures in England are Wandsworth, unparished area \(£1,028\.21\)/);
  });

  it('adds the full Band D column and county link to each parish page', () => {
    const html = read('/precepts/parishes/burnley/');
    expect(html).toMatch(/href="\/council-tax\/towns\/county\/lancashire\/#E2333P007"[^>]*>£2,584\.38<\/a>/);
    expect(text(html)).toContain('Burnley, unparished area, full Band D 2026/27: £2,540.32');
    expect(html).toContain('href="/council-tax/towns/county/lancashire/"');
    for (const path of ['/precepts/parishes/', '/council-tax/ranked/', '/council-tax/ranked/shire-districts/', '/precepts/', '/councils/burnley/']) expect(read(path), path).toContain('/council-tax/towns/');
  });
});
