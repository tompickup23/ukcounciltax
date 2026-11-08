import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildPopulation, verifyPopulationHash} from '../scripts/import-population.mjs';
import population from '../data/national/population.json';

const areas = population.areas;
describe('ONS mid-2025 population contract', () => {
  it('verifies the pinned raw hash and reproduces the committed extract', async () => {
    const bytes = readFileSync(`data/raw/${population.source.file}`);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe('8ae244e3341257ecccaee55f4973fe12f46afe6656ead6c1a9ed3f4f8585e40f');
    expect(() => verifyPopulationHash(Buffer.from('different file'))).toThrow('pinned hash differs');
    expect(await buildPopulation()).toEqual(population);
  }, 30000);
  it('retains 333 English rows and the reviewed geography counts', () => {
    expect(Object.keys(areas)).toHaveLength(333);
    const counts: Record<string, number> = {};
    for (const [code, area] of Object.entries(areas)) {
      expect(code).toMatch(/^E\d{8}$/);
      expect(area.code).toBe(code);
      counts[area.geography] = (counts[area.geography] ?? 0) + 1;
    }
    expect(counts).toEqual({'Country': 1, 'Region': 9, 'Unitary Authority': 63, 'Metropolitan County': 6, 'Metropolitan District': 36, 'County': 21, 'Non-metropolitan District': 164, 'London Borough': 33});
  });
  it('reconciles all four bands without double counting the overlapping adult band', () => {
    for (const area of Object.values(areas)) {
      expect(area.under18 + area.age18to64 + area.age65plus, area.code).toBe(area.allAges);
      expect(area.age18to64 + area.age65plus, area.code).toBe(area.age18plus);
      expect(area.under18 + area.age18plus, area.code).toBe(area.allAges);
    }
  });
  it('matches the source notes population anchors exactly', () => {
    const anchors = {E08000025: [894082, 737841, 156241, 282878], E09000033: [185163, 157520, 27643, 27204], E10000017: [1048053, 768005, 280048, 260514]};
    for (const [code, expected] of Object.entries(anchors)) {
      const area = areas[code as keyof typeof areas];
      expect([area.age18plus, area.age18to64, area.age65plus, area.under18], code).toEqual(expected);
    }
  });
  it('keeps Barnsley and Sheffield under ONS codes only', () => {
    expect(areas.E08000016.name).toBe('Barnsley');
    expect(areas.E08000019.name).toBe('Sheffield');
    expect(areas).not.toHaveProperty('E08000038');
    expect(areas).not.toHaveProperty('E08000039');
  });
});
