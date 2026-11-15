import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineMapIndicators } from '../vendor/estate-kit/dist/src/index.js';
import type { AreaFeature } from '../vendor/estate-kit/dist/src/charts/grammar/geo.js';
import { CURRENT_YEAR, loadYear } from './council-tax';
import { loadRegistry } from './registry';
import { councilPath } from './paths';

// W2: site owned thresholds, unchanged between editions. Never derive them from observations.
export const AREA_BAND_D_REGISTRY = defineMapIndicators({
  areaBandD: { kind: 'fixed', label: 'Area Band D', unit: 'gbp', breaks: [2000, 2200, 2400, 2600, 2800] },
});

// Copied from UK Councils PR 55: Douglas Peucker in degrees, longitude scaled at 52 degrees.
// Keep every area and ring, retaining a small ring if simplification would erase it.
export const TOLERANCE = 0.004;
const K = Math.cos((52 * Math.PI) / 180);
type Ring = number[][];
/** The indices Douglas Peucker keeps, so the points drawn are the published ones exactly. */
function douglasPeucker(points: Ring, tol: number): Uint8Array {
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length-1] = 1;
  const stack: [number, number][] = [[0, points.length-1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [x1, y1] = points[a], [x2, y2] = points[b];
    const dx = x2-x1, dy = y2-y1, length = dx * dx + dy * dy;
    let worst = -1, far = 0;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = points[i];
      const t = length ? Math.max(0, Math.min(1, ((x-x1) * dx + (y-y1) * dy) / length)) : 0;
      const d = (x-x1-t * dx) ** 2 + (y-y1-t * dy) ** 2;
      if (d > far) { far = d; worst = i; }
    }
    if (worst >= 0 && far > tol * tol) { keep[worst] = 1; stack.push([a, worst], [worst, b]); }
  }
  return keep;
}
export function simplifyRing(ring: Ring, tol = TOLERANCE): Ring {
  const keep = douglasPeucker(ring.map(([x, y]) => [x * K, y]), tol);
  const out = ring.filter((_, i) => keep[i]);
  return out.length >= 4 ? out : ring;
}

export interface RawArea { properties: { LAD26CD: string; LAD26NM: string }; geometry: AreaFeature['geometry'] }

/** Fail closed on either side of the exact GSS join, including duplicate geometry. */
export function assertMapJoin(raw: RawArea[], authorities: Record<string, unknown>): void {
  const codes = raw.map(f => f.properties.LAD26CD);
  const missing = [
    ...codes.filter(code => !Object.hasOwn(authorities, code)).map(code => `${code} has no authority`),
    ...Object.keys(authorities).filter(code => !codes.includes(code)).map(code => `${code} has no boundary`),
    ...codes.filter((code, i) => codes.indexOf(code) !== i).map(code => `${code} has duplicate boundaries`),
  ];
  if (missing.length) throw new Error(`England Band D map: GSS join failed:\n${missing.join('\n')}`);
}

export function englandMapData() {
  const data = loadYear(CURRENT_YEAR);
  const registry = loadRegistry();
  const raw: RawArea[] = JSON.parse(readFileSync(join(process.cwd(), 'data/geography/lad26-england.geojson'), 'utf8')).features;
  assertMapJoin(raw, data.authorities);
  const areas: AreaFeature[] = raw.map(f => {
    const g = f.geometry;
    const geometry = g.type === 'Polygon'
      ? { type: 'Polygon' as const, coordinates: g.coordinates.map(r => simplifyRing(r)) }
      : { type: 'MultiPolygon' as const, coordinates: g.coordinates.map(p => p.map(r => simplifyRing(r))) };
    return { type: 'Feature', properties: { code: f.properties.LAD26CD, name: data.authorities[f.properties.LAD26CD].name }, geometry };
  });
  const values = Object.fromEntries(areas.map(area => {
    const code = area.properties.code;
    if (!registry.councils[code]) throw new Error(`${code} has no council page`);
    return [code, `council.${registry.councils[code].slug}.area_bandd`];
  }));
  const links = Object.fromEntries(areas.map(area => [area.properties.code, councilPath(registry.councils[area.properties.code])]));
  return { areas, values, links };
}
