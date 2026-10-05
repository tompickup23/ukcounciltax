/** Audit built internal page destinations without a browser or network requests. */
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root=join(process.cwd(),'dist');
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]);
const failures=[];let checked=0;
for(const file of walk(root).filter(f=>f.endsWith('.html'))){const html=readFileSync(file,'utf8');for(const [,href] of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)){if(!href.startsWith('/')||href.startsWith('//'))continue;const path=href.split(/[?#]/)[0];if(!path)continue;const target=join(root,path,path.endsWith('/')?'index.html':'');if(!existsSync(target))failures.push(`${file.slice(root.length)} links to absent ${path}`);checked++;}}
if(failures.length){console.error([...new Set(failures)].join('\n'));process.exit(1);}console.log(`Internal links: ${checked} destinations checked, no missing local files.`);
