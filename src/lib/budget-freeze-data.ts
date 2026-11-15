import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import snapshot from '../../data/pilots/budget-freeze.json';
import rules from '../../data/pilots/budget-freeze-referendum.json';
import {FREEZE_MODEL, FREEZE_YEAR} from './budget-freeze';
import type { FreezeBaseline } from './budget-freeze';

export type FreezePilot = FreezeBaseline & Omit<typeof snapshot.pilots[number], keyof FreezeBaseline>;
export function freezePilots(): FreezePilot[] {
  for (const [path, expected] of Object.entries(snapshot.sourceHashes)) {
    const actual = createHash('sha256').update(readFileSync(join(process.cwd(), path))).digest('hex');
    if (actual !== expected) throw new Error(`C2 input edition changed: ${path}. Rebuild with node scripts/audit-c2-pilot.mjs and review the generated fixture before committing.`);
  }
  if (snapshot.model !== FREEZE_MODEL || rules.edition !== FREEZE_YEAR) throw new Error('C2 model or rule edition changed.');
  const mappings = rules.byEdition[FREEZE_YEAR as keyof typeof rules.byEdition];
  if (!mappings) throw new Error('Unmapped C2 edition.');
  for (const pilot of snapshot.pilots) {
    const mapping = mappings[pilot.gss as keyof typeof mappings];
    if (!mapping || mapping.principle !== pilot.rule) throw new Error(`Unmapped C2 authority: ${pilot.gss}`);
  }
  return structuredClone(snapshot.pilots) as FreezePilot[];
}
