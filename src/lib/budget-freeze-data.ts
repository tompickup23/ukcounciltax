import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import snapshot from '../../data/pilots/budget-freeze.json';
import type { FreezeBaseline } from './budget-freeze';

export type FreezePilot = FreezeBaseline & Omit<typeof snapshot.pilots[number], keyof FreezeBaseline>;
export function freezePilots(): FreezePilot[] {
  for (const [path, expected] of Object.entries(snapshot.sourceHashes)) {
    const actual = createHash('sha256').update(readFileSync(join(process.cwd(), path))).digest('hex');
    if (actual !== expected) throw new Error(`C2 input edition changed: rerun and review the source audit for ${path}`);
  }
  return structuredClone(snapshot.pilots) as FreezePilot[];
}
