import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AREA_BAND_D_REGISTRY, TOLERANCE, assertMapJoin, englandMapData, simplifyRing } from '../src/lib/england-map';
import { CURRENT_YEAR, loadYear } from '../src/lib/council-tax';
import { englandMapOptions, chartKeys, chartPng } from '../src/lib/kit-charts';
import { siteFigures } from '../src/lib/figures';
import { areaMap, defineFigures, mapClass } from '../src/vendor/estate-kit/dist/src/index.js';

const data = englandMapData();
const raw = JSON.parse(readFileSync(join(process.cwd(), 'data/geography/lad26-england.geojson'), 'utf8')).features;

describe('England area Band D map', () => {
  it('joins every boundary and current billing authority by exact GSS code', () => {
    const tax = loadYear(CURRENT_YEAR);
    expect(data.areas).toHaveLength(296);
    expect(new Set(data.areas.map(a => a.properties.code))).toEqual(new Set(Object.keys(tax.authorities)));
    expect(() => assertMapJoin(raw.slice(1), tax.authorities)).toThrow(raw[0].properties.LAD26CD);
    expect(() => assertMapJoin(raw, {})).toThrow(raw[0].properties.LAD26CD);
    expect(() => assertMapJoin([...raw, raw[0]], tax.authorities)).toThrow('duplicate boundaries');
  });

  it('pins pound breaks across editions, including equality and unknown', () => {
    const indicator = AREA_BAND_D_REGISTRY.areaBandD;
    expect(indicator).toEqual({kind: 'fixed', label: 'Area Band D', unit: 'gbp', breaks: [2000, 2200, 2400, 2600, 2800]});
    expect(mapClass(indicator, 1999.99)).toBe(0);
    expect(mapClass(indicator, 2000)).toBe(1);
    expect(mapClass(indicator, 2800)).toBe(5);
    expect(mapClass(indicator, null)).toBeNull();
    const counts = Array(6).fill(0);
    for (const row of Object.values(loadYear(CURRENT_YEAR).authorities)) counts[mapClass(indicator, row.bands.D)!]++;
    expect(counts).toEqual([9, 18, 89, 145, 35, 0]);
  });

  it('uses every published area figure with its original source and council link', () => {
    const set = siteFigures();
    const tax = loadYear(CURRENT_YEAR);
    expect(chartKeys('england-area-band-d')).toEqual(Object.values(data.values));
    for (const [code, key] of Object.entries(data.values)) {
      const record = set.valueRecord(key);
      expect(record.value).toBe(tax.authorities[code].bands.D);
      expect(record.unit).toBe('gbp');
      expect(record.source.table).toBe('Table 9');
      expect(data.links[code]).toMatch(/^\/councils\/[^/]+\/$/);
    }
  });

  it('draws a sourced null as striped unknown, retaining its native link', () => {
    const options = englandMapOptions();
    const area = data.areas.find(a => a.properties.code === 'E06000053')!;
    const source = siteFigures().valueRecord(data.values[area.properties.code]).source;
    const out = areaMap({...options, areas: [area], values: {[area.properties.code]: 'missing'},
      set: defineFigures({missing: {kind: 'value', label: 'Area Band D', unit: 'gbp', value: null, source}})});
    expect(out.svg).toContain('data-ek-class="unknown"');
    expect(out.svg).toContain('fill="url(#england-area-band-d-pattern-7)"');
    expect(out.svg).toContain('Isles of Scilly: Unknown');
    expect(out.svg).toContain('href="/councils/isles-of-scilly/"');
  });

  it('registers only one light map download', async () => {
    vi.stubEnv('BUILD_OG', '1');
    vi.resetModules();
    try {
      const {getStaticPaths} = await import('../src/pages/og/charts/[chart].png');
      expect(getStaticPaths().filter(p => p.params.chart.startsWith('england-area-band-d')).map(p => p.params.chart)).toEqual(['england-area-band-d-light']);
    } finally { vi.unstubAllEnvs(); }
  });

  it('exports a palette PNG at twice the drawing size', () => {
    const out = areaMap(englandMapOptions());
    const png = chartPng('england-area-band-d', 'light');
    expect(png.readUInt32BE(16)).toBe(out.width * 2);
    expect(png.readUInt32BE(20)).toBe(Math.round(out.height * 2));
    expect(png[25]).toBe(3);
  }, 60_000);

  it('simplifies below a pixel: no area dropped and every dropped point within the tolerance of the drawn line', () => {
    expect(TOLERANCE).toBe(0.004);
    const K = Math.cos((52 * Math.PI) / 180);
    const original = new Map<string, { type: string; coordinates: number[][][] | number[][][][] }>(raw.map((f: { properties: { LAD26CD: string }; geometry: { type: string; coordinates: number[][][] } }) => [f.properties.LAD26CD, f.geometry]));
    const rings = (g: { type: string; coordinates: unknown }) => (g.type === 'Polygon' ? [g.coordinates as number[][][]] : g.coordinates as number[][][][]).flat();
    let before = 0, after = 0, worst = 0;
    for (const area of data.areas) {
      const was = rings(original.get(area.properties.code)!), now = rings(area.geometry);
      expect(now.length, area.properties.name).toBe(was.length);
      for (const [r, ring] of was.entries()) {
        const kept = now[r];
        expect(kept.length).toBeGreaterThanOrEqual(4);
        expect(kept[0]).toEqual(kept.at(-1));
        before += ring.length; after += kept.length;
        // The simplified ring is a subsequence of the published one; walk both together.
        let k = 0;
        for (const point of ring) {
          if (k < kept.length && point[0] === kept[k][0] && point[1] === kept[k][1]) { k++; continue; }
          const [a, b] = [kept[k-1], kept[k]];
          const [px, py, ax, ay, bx, by] = [point[0] * K, point[1], a[0] * K, a[1], b[0] * K, b[1]];
          const dx = bx-ax, dy = by-ay, length = dx * dx + dy * dy;
          const t = length ? Math.max(0, Math.min(1, ((px-ax) * dx + (py-ay) * dy) / length)) : 0;
          worst = Math.max(worst, Math.hypot(px-ax-t * dx, py-ay-t * dy));
        }
        expect(k, area.properties.name).toBe(kept.length);
      }
    }
    expect(worst).toBeLessThanOrEqual(TOLERANCE);
    expect(after / before).toBeLessThan(0.6);
  });

  it('keeps a ring as published when simplifying would leave fewer than four points', () => {
    const tiny = [[0, 0], [0.0001, 0], [0.0001, 0.0001], [0, 0.0001], [0, 0]];
    expect(simplifyRing(tiny)).toEqual(tiny);
  });

});
