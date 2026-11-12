import { devolvedRows, englishRows } from './council-picker';
import { budgetFor } from './budget';
import { councilPages, parishPages, parishPath } from './paths';

export interface CouncilIndexRow {
  gss: string;
  name: string;
  search: string;
  type: string;
  region: string;
  nation: string;
  url: string;
  budgetUrl?: string;
  parishUrl?: string;
}

/** The picker supplies names and matching; route data supplies destinations. */
export function councilIndex(): CouncilIndexRow[] {
  const parishes = new Map(parishPages().map(council => [council.gss, parishPath(council)]));
  const games = new Map(councilPages()
    .filter(({ council }) => budgetFor(council.gss).council.status === 'available')
    .map(({ council }) => [council.gss, `/tools/budget/${council.slug}/`]));
  return [...englishRows('profile'), ...devolvedRows()].map(row => ({
    gss: row.gss, name: row.name, search: row.search, type: row.type,
    region: row.region, nation: row.gss.startsWith('S') ? 'Scotland' : row.gss.startsWith('W') ? 'Wales' : 'England',
    url: row.href,
    ...(games.has(row.gss) ? { budgetUrl: games.get(row.gss) } : {}),
    ...(parishes.has(row.gss) ? { parishUrl: parishes.get(row.gss) } : {}),
  })).sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
}
