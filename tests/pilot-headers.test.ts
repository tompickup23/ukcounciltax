import { expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { injectHashes, scriptSrcOf } from '../scripts/inject_csp_hashes.mjs';

it('writes hashes only into the requested build, keeps the policy and is idempotent',()=>{
  const root=mkdtempSync(join(tmpdir(),'uct-pilot-headers-'));
  try {
    const pilot=join(root,'pilot'), other=join(root,'other');
    mkdirSync(pilot);mkdirSync(other);
    const template=readFileSync('public/_headers','utf8');
    writeFileSync(join(pilot,'_headers'),template);writeFileSync(join(other,'_headers'),template);
    const code='document.documentElement.dataset.test="ready";';
    writeFileSync(join(pilot,'index.html'),`<script type="module">${code}</script><script type="application/ld+json">{"x":1}</script>`);
    injectHashes(pilot);
    const once=readFileSync(join(pilot,'_headers'),'utf8');
    const expected=`'sha256-${createHash('sha256').update(code).digest('base64')}'`;
    expect(scriptSrcOf(once)).toContain(expected);
    expect(scriptSrcOf(once)).not.toContain("'unsafe-inline'");
    expect(scriptSrcOf(once).filter((t:string)=>!t.startsWith("'sha256-"))).toEqual(scriptSrcOf(template));
    expect(readFileSync(join(other,'_headers'),'utf8')).toBe(template);
    injectHashes(pilot);
    expect(readFileSync(join(pilot,'_headers'),'utf8')).toBe(once);
  } finally { rmSync(root,{recursive:true,force:true}); }
});
