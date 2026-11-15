import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {national} from '../src/lib/national-data';
import {countTowns, extremes, filterTowns, rankTowns, townByCode, towns, townsData, townConstituencies} from '../src/lib/towns';

const json = readFileSync('data/towns/england-2026-27.json', 'utf8');
const figure = (code: string) => townByCode.get(code)?.fullBandDPence;
const BURNLEY = 'E07000117', RUSHCLIFFE = 'E07000176', CHORLEY = 'E07000118', DURHAM = 'E06000047';

describe('towns dataset anchors (docs/TOWNS-RESEARCH-2026-11-15.md, part 1)', () => {
  it('reproduces the councils\' own published figures to the penny', () => {
    expect(figure('E2333P007')).toBe(258438); // Burnley, Padiham: council notice "2,584.38"
    expect(towns.find(t => t.councilGss === BURNLEY && t.kind === 'unparished')?.fullBandDPence).toBe(254032); // "2,540.32"
    expect(figure('E0801P006')).toBe(277946); // Cornwall, Bodmin: "2,779.46"
    expect(figure('E0801P035')).toBe(287771); // Cornwall, Falmouth
    expect(townByCode.get('E2333P007')!.parts).toEqual({own: 35144, parish: 4406, trustees: 0, county: 180175, police: 29240, fire: 9473, combined: 0});
  });
  it('puts Durham, Peterlee highest of the rows with a figure', () => {
    const ranked = rankTowns(towns);
    expect(ranked.at(-1)!.town.code).toBe('E1302P090');
    expect(ranked.at(-1)!.town.fullBandDPence).toBe(294801);
    expect(ranked.at(-1)!.position).toBe(ranked.length);
  });
  it('gives special expense councils no national figure', () => {
    for (const gss of [RUSHCLIFFE, CHORLEY]) {
      const rows = towns.filter(t => t.councilGss === gss);
      expect(rows.length).toBeGreaterThan(20);
      expect(rows.every(t => t.fullBandDPence === null && t.status === 'special-expenses' && t.parts === null)).toBe(true);
    }
    const special = Object.entries(national.components).filter(([gss, c]) => (c.specialExpensesPounds ?? 0) > 0).map(([gss]) => gss);
    expect(special).toHaveLength(49);
    expect(towns.filter(t => special.includes(t.councilGss)).every(t => t.fullBandDPence === null)).toBe(true);
  });
  it('shows the negative precept as published', () => {
    const t = townByCode.get('E2532P011')!;
    expect(t.parts!.parish).toBe(-264);
    expect(t.fullBandDPence).toBe(218013);
    expect(t.noteIds).toContain('negative');
  });
  it('takes group carriers only when the group text resolves to one row', () => {
    const member = townByCode.get('E1031P037');
    expect(member?.name).toMatch(/^Ashleyhay \(grouped with Idridgehay and Alton\)/);
    expect(member?.groupCarrier).toBe('E1031P016');
    expect(member?.fullBandDPence).toBe(figure('E1031P016'));
    expect(member?.fullBandDPence).toBe(234881);
    const unresolved = towns.filter(t => t.status === 'group-member-unresolved');
    expect(unresolved.every(t => t.kind === 'group' && t.taxBase === 0 && t.fullBandDPence === null && !t.groupCarrier)).toBe(true);
  });
});

describe('council schedules', () => {
  it('uses Durham\'s own schedule, which adds the City of Durham charter trustees to starred areas', () => {
    const rows = towns.filter(t => t.councilGss === DURHAM && t.status === 'council-schedule');
    expect(rows.length).toBeGreaterThan(120);
    const c = national.components[DURHAM], majors = c.parts.reduce((s, p) => s + p.bandDPence!, 0);
    for (const t of rows.filter(r => r.kind !== 'unparished')) {
      const parishCode = t.groupCarrier ?? t.code;
      const parish = national.parishes.find(p => p.code === parishCode)!.years['2026-27'].bandDPence!;
      expect(t.fullBandDPence).toBe(c.ownExcludingParishPence! + parish + majors + (t.schedule?.includesCharterTrustee ? 270 : 0));
    }
    expect(towns.filter(t => t.councilGss === DURHAM && t.kind === 'unparished').map(t => t.fullBandDPence)).toEqual([249997, 250267]);
  });
  it('uses the City of London\'s own figure for the Temples and the rest of the City', () => {
    expect(towns.filter(t => t.councilGss === 'E09000001').map(t => [t.kind, t.fullBandDPence])).toEqual([['temple', 132956], ['temple', 132956], ['unparished', 132956]]);
  });
  it('leaves partial charter trustee cover without a figure', () => {
    const partial = towns.filter(t => t.status === 'partial-charter-trustee-cover');
    expect([...new Set(partial.map(t => t.councilGss))].sort()).toEqual(['E07000171', 'E07000174']);
    expect(partial.every(t => t.fullBandDPence === null)).toBe(true);
  });
  it('adds a charter trustee covering the whole unparished area', () => {
    const bath = towns.find(t => t.councilGss === 'E06000022' && t.kind === 'unparished')!;
    expect(bath.parts!.trustees).toBe(761);
    expect(townByCode.get('E0101P052')!.status).toBe('charter-trustees-included');
    expect(bath.fullBandDPence).toBe(bath.parts!.own + 761 + bath.parts!.county + bath.parts!.police + bath.parts!.fire + bath.parts!.combined);
  });
});

describe('every row accounted for', () => {
  it('has one status per published parish row plus each unparished area', () => {
    const c = countTowns();
    const published = national.parishes.filter(p => p.years['2026-27'].status === 'published');
    expect(published).toHaveLength(10241);
    expect(Object.values(c.byStatus).reduce((s, n) => s + n, 0)).toBe(10241 + c.unparished);
    expect(c.rows).toBe(towns.length);
    expect(new Set(towns.filter(t => t.kind !== 'unparished').map(t => t.code))).toEqual(new Set(published.map(p => p.code)));
    expect(c.withFigure + c.withoutFigure).toBe(c.rows);
    expect(townsData.counts).toMatchObject({rows: c.rows, withFigure: c.withFigure});
  });
  it('keeps figure and status consistent and never treats unknown as zero', () => {
    for (const t of towns) expect(townsData.statusesWithFigure.includes(t.status)).toBe(t.fullBandDPence !== null);
    expect(rankTowns(towns).every(r => r.town.fullBandDPence !== null)).toBe(true);
    expect(rankTowns(towns)).toHaveLength(countTowns().withFigure);
  });
  it('makes wholly unparished councils equal their published area Band D', () => {
    const parished = new Set(national.parishes.map(p => p.gss));
    const whole = towns.filter(t => t.kind === 'unparished' && !parished.has(t.councilGss) && t.status === 'calculated');
    expect(whole.length).toBeGreaterThan(70);
    for (const t of whole) expect(t.fullBandDPence).toBe(national.components[t.councilGss].areaPence);
  });
  it('has unique slugs that carry the council name', () => {
    expect(new Set(towns.map(t => t.slug)).size).toBe(towns.length);
    for (const t of towns) expect(t.slug).toContain(t.councilSlug);
    expect(townByCode.get('E2702P076')!.slug).toBe('borrowby-hambleton-north-yorkshire');
    expect(townByCode.get('E2702P077')!.slug).toBe('borrowby-scarborough-north-yorkshire');
  });
});

describe('positions and filters', () => {
  it('uses standard competition positions with ties shared', () => {
    const ranked = rankTowns(towns);
    for (let i = 1; i < ranked.length; i++) {
      const a = ranked[i - 1], b = ranked[i];
      if (a.town.fullBandDPence === b.town.fullBandDPence) { expect(b.position).toBe(a.position); expect(a.tied && b.tied).toBe(true); }
      else expect(b.position).toBe(i + 1);
    }
    const city = ranked.filter(r => r.town.councilGss === 'E09000001');
    expect(city.map(r => r.position)).toEqual([2, 2, 2]);
    expect(ranked[4].position).toBe(5);
  });
  it('filters by region, county, council and constituency', () => {
    const lancs = filterTowns({county: 'Lancashire'});
    expect(lancs.every(t => t.region === 'North West')).toBe(true);
    expect(filterTowns({councilGss: BURNLEY})).toHaveLength(9);
    const burnleySeat = filterTowns({constituency: 'burnley'});
    expect(burnleySeat.map(t => t.code)).toContain('E2333P007');
    expect(filterTowns({constituency: 'E14001142'})).toEqual(burnleySeat);
    expect(filterTowns({region: 'North East'}).some(t => t.code === 'E1302P090')).toBe(true);
    expect(filterTowns({largerPlaces: true}).every(t => t.largerPlace && t.taxBase! >= 2000)).toBe(true);
  });
  it('gives the extremes, including ties at the edge', () => {
    const e = extremes(filterTowns({councilGss: BURNLEY}), 3);
    expect(e.highestFigure).toBe(258438);
    expect(e.lowest.length).toBeGreaterThanOrEqual(3);
    expect(e.highest[0].town.code).toBe('E2333P007');
    expect(extremes([], 10)).toEqual({lowest: [], highest: [], lowestFigure: null, highestFigure: null});
  });
  it('lists split constituencies in full, never apportioned', () => {
    const split = towns.filter(t => t.constituencySplit);
    expect(split.length).toBeGreaterThan(500);
    expect(split.every(t => t.constituencies.length > 1)).toBe(true);
    expect(townConstituencies().every(c => /^E14/.test(c.code) && /^[a-z0-9-]+$/.test(c.slug))).toBe(true);
  });
});

describe('text rules', () => {
  it('has no dash characters in the dataset or its inputs', () => {
    for (const path of ['data/towns/england-2026-27.json', 'data/towns/overrides.json', 'data/towns/sources.json', 'data/towns/constituencies.json', 'data/towns/schedules/durham-2026-27.json', 'data/towns/schedules/city-of-london-2026-27.json']) {
      const text = readFileSync(path, 'utf8');
      expect(text, path).not.toMatch(/[–—]| - |&ndash;|&mdash;/);
    }
  });
  it('names no individual', () => {
    expect(json).not.toMatch(/"(mp|winnerName|councillor|leader|chair|clerk|electedDate)"/i);
    const constituencies = JSON.parse(readFileSync('data/towns/constituencies.json', 'utf8')).constituencies;
    for (const c of Object.values(constituencies) as Record<string, unknown>[]) expect(Object.keys(c).sort()).toEqual(['name', 'slug']);
  });
  it('records a reviewed override with evidence for every non automatic match', () => {
    const overrides = JSON.parse(readFileSync('data/towns/overrides.json', 'utf8'));
    expect(overrides.accepted.length).toBe(181);
    for (const o of overrides.accepted) { expect(o.evidence.length).toBeGreaterThan(40); expect(o.reviewed).toBe('2026-11-15'); }
    expect(towns.filter(t => t.match.how === 'override')).toHaveLength(181);
    expect(towns.some(t => /review/.test(t.match.how))).toBe(false);
  });
});
