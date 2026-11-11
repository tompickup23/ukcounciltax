import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { councilPages } from "./paths";
import { budgetFor } from "./budget";

/**
 * "Play a neighbour" on the budget game page (NV2). Names only, never a figure.
 *
 * A shire district offers the other districts of its county, as the registry
 * holds the county. Every other council (unitary, metropolitan, London)
 * offers the councils whose areas touch it in the pinned ONS boundary file,
 * data/geography/lad26-england.geojson: two areas touch when they share at
 * least one boundary point at the file's five decimal places. That file is
 * clipped to the coastline, so councils that face each other across an
 * estuary or a tidal river are not listed, and an island has none.
 *
 * Only councils with a game are offered: a council that sent no budget return
 * has no game to play.
 */

export interface GameNeighbour {
  slug: string;
  name: string;
}

export interface GameNeighbours {
  basis: "county" | "boundary";
  county: string | null;
  neighbours: GameNeighbour[];
}

let touching: Map<string, Set<string>> | undefined;

/** Every pair of areas that share a boundary point in the pinned file. */
export function touchingAreas(root = process.cwd()): Map<string, Set<string>> {
  if (touching && root === process.cwd()) return touching;
  const raw = JSON.parse(readFileSync(join(root, "data/geography/lad26-england.geojson"), "utf8")) as FeatureCollection<Polygon | MultiPolygon, { LAD26CD: string }>;
  const points = new Map<string, Set<string>>();
  for (const feature of raw.features) {
    const code = feature.properties.LAD26CD;
    const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    for (const polygon of polygons) for (const ring of polygon) for (const [x, y] of ring) {
      const key = `${x.toFixed(5)},${y.toFixed(5)}`;
      const codes = points.get(key) ?? new Set<string>();
      codes.add(code);
      points.set(key, codes);
    }
  }
  const result = new Map<string, Set<string>>();
  for (const codes of points.values()) {
    if (codes.size < 2) continue;
    for (const a of codes) for (const b of codes) if (a !== b) {
      const set = result.get(a) ?? new Set<string>();
      set.add(b);
      result.set(a, set);
    }
  }
  if (root === process.cwd()) touching = result;
  return result;
}

export function gameNeighbours(gss: string): GameNeighbours {
  const pages = councilPages();
  const self = pages.find(({ council }) => council.gss === gss);
  if (!self) throw new Error(`No council page for ${gss}`);
  const playable = pages.filter(({ council }) => council.gss !== gss && budgetFor(council.gss).council.status === "available");
  const shire = self.council.type === "Non-metropolitan district" && self.council.county;
  const chosen = shire
    ? playable.filter(({ council }) => council.type === "Non-metropolitan district" && council.county === self.council.county)
    : playable.filter(({ council }) => touchingAreas().get(gss)?.has(council.gss));
  return {
    basis: shire ? "county" : "boundary",
    county: shire ? self.council.county : null,
    neighbours: chosen.map(({ council, tax }) => ({ slug: council.slug, name: tax.name })),
  };
}
