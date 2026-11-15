/** Import an explicitly supplied shared registry export; never open sibling repos implicitly. */
import {readFileSync,writeFileSync} from 'node:fs';
const input=process.argv[2];
if(!input)throw new Error('Usage: npm run data:registry -- /absolute/path/to/reviewed-councils.json');
const source=readFileSync(input,'utf8');
const data=JSON.parse(source);
if(Object.keys(data.councils??{}).length!==361)throw new Error('Expected the reviewed 361-authority registry edition.');
for(const row of Object.values(data.councils)){if(!row.gss||!row.slug)throw new Error('Missing identity');}
writeFileSync('data/registry/councils.json',source);
console.log('Imported a reviewed shared registry. Recheck public ecosystem sitemaps before release.');
