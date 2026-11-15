import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { injectHashes } from './inject_csp_hashes.mjs';
if (process.env.CI || process.env.CF_PAGES) throw new Error('C2 is a local pilot, not a deployment build.');
execFileSync(process.execPath, ['scripts/audit-c2-pilot.mjs','--check'], { stdio:'inherit' });
execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs','build','--config','astro.pilot.config.mjs'], { stdio:'inherit' });
injectHashes(resolve('.ops/c2-dist'));
