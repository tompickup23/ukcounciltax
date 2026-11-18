/**
 * Paging for the long town tables (18 November 2026). A region's table can hold
 * nearly two thousand rows, which took its page past the 500 KB ceiling in the F1
 * gates. The table is split into parts in its own order, never re-sorted or
 * filtered: rows with a figure in position order, then rows without one by name,
 * exactly as one table would print them. Part 1 stays on the region page with
 * the pair, the ledgers and the spread; the other parts are /part-N/ pages under
 * it. County and constituency tables are short enough to stay whole.
 */
import {positionCell} from './rankings';
import type {RankedTown, Town} from './towns';
import {placeName, regionScopes, scopeSummary, type TownScope} from './towns-pages';

/** The most rows one part may carry. Parts are balanced, so a part holds at most this many. */
export const PART_MAX = 650;

export interface TableRow {town: Town; position: string | null}
export interface TownPart {index: number; count: number; path: string; rows: TableRow[]; first: string; last: string; ranked: number}

const byLabel = (a: Town, b: Town) => placeName(a).localeCompare(placeName(b), 'en-GB');

/** Every row of a scope's table in print order. */
export function tableRows(ranked: readonly RankedTown[], unplaced: readonly Town[]): TableRow[] {
  return [
    ...ranked.map(r => ({town: r.town as Town, position: positionCell(r.position, r.tied)})),
    ...[...unplaced].sort(byLabel).map(town => ({town, position: null})),
  ];
}

export const partPath = (scope: TownScope, index: number) => index === 1 ? scope.path : `${scope.path}part-${index}/`;

const cache = new Map<string, TownPart[]>();

/** The parts of a scope's table; one part for every scope that is not a long region. */
export function scopeParts(scope: TownScope): TownPart[] {
  const hit = cache.get(scope.path);
  if (hit) return hit;
  const summary = scopeSummary(scope.rows);
  const rows = tableRows(summary.ranked, summary.unplaced);
  const count = scope.kind === 'region' ? Math.max(1, Math.ceil(rows.length / PART_MAX)) : 1;
  const size = Math.ceil(rows.length / count);
  const parts: TownPart[] = [];
  for (let i = 0; i < count; i++) {
    const slice = rows.slice(i * size, (i + 1) * size);
    const placed = slice.filter(r => r.position !== null);
    parts.push({
      index: i + 1, count, path: partPath(scope, i + 1), rows: slice, ranked: placed.length,
      first: placed[0]?.position ?? 'Not placed', last: placed.at(-1)?.position ?? 'Not placed',
    });
  }
  cache.set(scope.path, parts);
  return parts;
}

/** The link to a row from anywhere on a scope's pages: an anchor on its own part. */
export function rowHref(scope: TownScope, town: Town, from = 1): string {
  const part = scopeParts(scope).find(p => p.rows.some(r => r.town.code === town.code));
  if (!part || part.index === from) return `#${town.code}`;
  return `${part.path}#${town.code}`;
}

/** The part pages beyond part 1, for the sitemap and the route list. */
export function townPartPaths(): string[] {
  return regionScopes().flatMap(scope => scopeParts(scope).slice(1).map(p => p.path));
}
