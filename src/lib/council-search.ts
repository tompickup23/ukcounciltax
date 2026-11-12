/** Adapted from AI DOGE's local CouncilSearch; no network or query storage. */
export function normalise(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
export function matchesCouncil(query: string, ...names: string[]): boolean {
  const words = normalise(query).split(' ').filter(Boolean);
  const name = normalise(names.join(' '));
  return words.every(word => name.includes(word));
}

/** A complete region name selects that region, not similar words in a council name. */
export function matchingRegion(query: string, regions: Iterable<string>): string | undefined {
  const wanted = normalise(query);
  return wanted && [...regions].some(region => normalise(region) === wanted) ? wanted : undefined;
}

/** Exact names lead, then prefixes, word prefixes and other picker matches. */
export function councilRank(query: string, name: string): number {
  const q = normalise(query); const n = normalise(name);
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.split(' ').some(word => word.startsWith(q))) return 2;
  return 3;
}

export function rankCouncils<T extends { name: string }>(query: string, rows: T[]): T[] {
  return [...rows].sort((a, b) => councilRank(query, a.name) - councilRank(query, b.name)
    || a.name.localeCompare(b.name, 'en-GB'));
}

export const COUNCILS_SHOWN = 12;

/** Null means that index failed, distinct from a successful search with no hits. */
export function searchStatus(councils: number | null, pages: number | null, shown = COUNCILS_SHOWN): string {
  const councilText = councils === null ? 'Council search could not load' : `${councils} matching council${councils === 1 ? '' : 's'}${councils > shown ? ` (${shown} listed)` : ''}`;
  const pageText = pages === null ? 'Page search could not load' : `${pages} matching page${pages === 1 ? '' : 's'}`;
  if (councils === 0 && pages === 0) return 'No matching pages or councils. Try a council name or a broader topic.';
  return `${councilText}; ${pageText}.${councils === null || pages === null ? ' Retry or use the council directory below.' : ''}`;
}
