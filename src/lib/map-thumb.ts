import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CURRENT_YEAR, loadYear } from "./council-tax";
import { AREA_BAND_D_REGISTRY } from "./england-map";

/**
 * The map card's thumb (front doors, plan section 4 stage 2): the England map's
 * own outlines, from data/geography/lad26-england.geojson, simplified much
 * harder than the map so the drawing stays a few kilobytes. Decoration under a
 * link, so it carries no text and no figure; each area is placed in one of the
 * map's six fixed area Band D steps (the site owned breaks in england-map.ts),
 * never a value of its own. Outer rings only; an island too small to keep four
 * points at this scale is left out. An area with no area Band D fails the build,
 * as the map's own join does, rather than leaving a hole in the outline.
 */

const K = Math.cos((52 * Math.PI) / 180);
/** Degrees: three times the map's tolerance, about half a unit at this size. */
const TOLERANCE = 0.03;
const HEIGHT = 120;

type Ring = number[][];

function keepPoints(points: Ring, tol: number): Uint8Array {
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [x1, y1] = points[a], [x2, y2] = points[b];
    const dx = x2 - x1, dy = y2 - y1, length = dx * dx + dy * dy;
    let worst = -1, far = 0;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = points[i];
      const t = length ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / length)) : 0;
      const d = (x - x1 - t * dx) ** 2 + (y - y1 - t * dy) ** 2;
      if (d > far) { far = d; worst = i; }
    }
    if (worst >= 0 && far > tol * tol) { keep[worst] = 1; stack.push([a, worst], [worst, b]); }
  }
  return keep;
}

interface Thumb { shapes: string[]; width: number; height: number }
let cache: Thumb | undefined;

export function mapThumb(): Thumb {
  if (cache) return cache;
  const features: { properties: { LAD26CD: string }; geometry: { type: "Polygon" | "MultiPolygon"; coordinates: Ring[][] | Ring[] } }[] =
    JSON.parse(readFileSync(join(process.cwd(), "data/geography/lad26-england.geojson"), "utf8")).features;
  const authorities = loadYear(CURRENT_YEAR).authorities;
  const indicator = AREA_BAND_D_REGISTRY.areaBandD;
  if (indicator.kind !== "fixed") throw new Error("The map thumb needs the fixed area Band D breaks");
  const breaks: readonly number[] = indicator.breaks;
  const outer = (f: (typeof features)[number]): Ring[] =>
    f.geometry.type === "Polygon" ? [(f.geometry.coordinates as Ring[])[0]] : (f.geometry.coordinates as Ring[][]).map((p) => p[0]);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  const areas = features.map((f) => {
    const rings = outer(f).map((ring) => {
      const points = ring.map(([x, y]) => [x * K, y]);
      const keep = keepPoints(points, TOLERANCE);
      return points.filter((_, i) => keep[i]);
    }).filter((ring) => ring.length >= 4);
    for (const ring of rings) for (const [x, y] of ring) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const value = authorities[f.properties.LAD26CD]?.bands.D;
    if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${f.properties.LAD26CD} has no area Band D for the map thumb`);
    const step = breaks.filter((b) => value >= b).length;
    return { rings, step };
  });
  const scale = HEIGHT / (y1 - y0);
  const width = Math.ceil((x1 - x0) * scale);
  const shapes = Array.from({ length: breaks.length + 1 }, () => "");
  for (const { rings, step } of areas) {
    for (const ring of rings) {
      let px = 0, py = 0;
      const parts = ring.map(([x, y], i) => {
        const qx = Math.round((x - x0) * scale), qy = Math.round((y1 - y) * scale);
        const part = i === 0 ? `M${qx} ${qy}` : `l${qx - px} ${qy - py}`;
        px = qx; py = qy;
        return part;
      });
      shapes[step] += `${parts.join("").replace(/l0 0/g, "")}z`;
    }
  }
  cache = { shapes, width, height: HEIGHT };
  return cache;
}
