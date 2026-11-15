import {afterEach,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {freezePilots} from '../src/lib/budget-freeze-data';
import snapshot from '../data/pilots/budget-freeze.json';
vi.mock('node:fs',async importOriginal=>{
  const original=await importOriginal<typeof import('node:fs')>();
  return {...original,readFileSync:vi.fn(original.readFileSync)};
});
afterEach(()=>vi.mocked(readFileSync).mockReset());
it.each(Object.keys(snapshot.sourceHashes))('names changed production input %s and its rebuild command',async path=>{
  const original=await vi.importActual<typeof import('node:fs')>('node:fs');
  vi.mocked(readFileSync).mockImplementation(((...args: Parameters<typeof readFileSync>)=>String(args[0]).endsWith(path)?Buffer.from('changed fixture'):original.readFileSync(...args)) as typeof readFileSync);
  expect(()=>freezePilots()).toThrow(`C2 input edition changed: ${path}. Rebuild with node scripts/audit-c2-pilot.mjs`);
});
