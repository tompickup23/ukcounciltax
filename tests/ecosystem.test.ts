import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {loadRegistry,sisterLinks,contextLinks} from '../src/lib/registry';
it('every public contextual link belongs to a checked public sitemap',()=>{
 const keys=['ukcouncils','ukplaces','ukelections','ukdemographics','aidoge','asylumstats'];
 const verified=new Set(keys.flatMap(key=>JSON.parse(readFileSync(join(process.cwd(),'data/ecosystem',`${key}-sitemap.json`),'utf8')).urls));
 for(const council of Object.values(loadRegistry().councils))for(const link of [...contextLinks(council),...sisterLinks(council)]){expect(verified.has(link.url),link.url).toBe(true);expect(link.url).not.toContain('ukfoodhygiene');}
});
