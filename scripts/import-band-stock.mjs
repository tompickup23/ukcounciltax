/** Band mix per English billing authority from HMRC CTSOP1.1, stock of properties 2026.
 * The zipped CSV is fetched once into data/raw and must match the reviewed hash in
 * data/national/sources.json. Counts are kept as printed (rounded to 10 by HMRC);
 * [c] stays unknown, never zero. Shares are calculated here from the printed counts.
 */
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const source = JSON.parse(readFileSync('data/national/sources.json','utf8')).bandStock;
const current = JSON.parse(readFileSync('data/council-tax/england-2026-27.json','utf8')).authorities;
const fail = message => {throw new Error(message);};
const BANDS = ['A','B','C','D','E','F','G','H'];
const HEADER = 'geography|ba_code|ecode|area_name|band_a|band_b|band_c|band_d|band_e|band_f|band_g|band_h|band_i|all_properties';

mkdirSync('data/raw',{recursive:true});
const path = `data/raw/${source.file}`;
if(!existsSync(path)){const response=await fetch(source.fileUrl);if(!response.ok)fail(`bandStock: HTTP ${response.status}`);writeFileSync(path,Buffer.from(await response.arrayBuffer()));}
if(createHash('sha256').update(readFileSync(path)).digest('hex')!==source.sha256)fail('bandStock: source edition changed; review before importing');
const text = execFileSync('unzip',['-p',path,source.member],{encoding:'utf8',maxBuffer:64*1024*1024}).replace(/^﻿/,'');

/** Every field in the file is quoted and none holds a quote, which is checked rather than assumed.
 * Names can hold a comma ("Kingston upon Hull, City of UA"), so fields split on the quoted separator. */
const rows = text.split(/\r?\n/).filter(Boolean).map((line,i)=>{
 if(!/^"[^"]*"(,"[^"]*")*$/.test(line))fail(`bandStock line ${i+1}: unexpected CSV quoting`);
 return line.slice(1,-1).split('","');
});
if(rows[0].join('|')!==HEADER)fail('bandStock: CTSOP1.1 columns changed');
const col = Object.fromEntries(rows[0].map((h,i)=>[h,i]));

/** A printed count, or null for [c] (fewer than five). Anything else stops the import. */
const count = (cell,where) => {
 if(cell==='[c]')return null;
 if(!/^\d+$/.test(cell))fail(`${where}: not a count: ${JSON.stringify(cell)}`);
 return Number(cell);
};
const pct = (part,total) => Math.round(part/total*1000)/10;
function record(row) {
 const where=`${row[col.ecode]} ${row[col.area_name]}`;
 if(row[col.band_i]!=='[z]')fail(`${where}: Band I is not expected in England`);
 const counts=Object.fromEntries(BANDS.map(b=>[b,count(row[col[`band_${b.toLowerCase()}`]],`${where} band ${b}`)]));
 const total=count(row[col.all_properties],`${where} total`) ?? fail(`${where}: total suppressed`);
 const lower=['A','B','C','D'].map(b=>counts[b]);
 return {
  areaName:row[col.area_name],
  baCode:row[col.ba_code],
  counts,
  total,
  shares:Object.fromEntries(BANDS.map(b=>[b,counts[b]===null?null:pct(counts[b],total)])),
  bandDAndBelowShare:lower.includes(null)?null:pct(lower.reduce((s,n)=>s+n,0),total),
 };
}

const nationRows = rows.filter(r=>r[col.geography]==='NATL'&&r[col.ecode]==='E92000001');
if(nationRows.length!==1)fail('bandStock: expected one England row');
const england = record(nationRows[0]);
const councils = {};
for(const row of rows.filter(r=>r[col.geography]==='LAUA'&&r[col.ecode].startsWith('E'))){
 const gss=row[col.ecode];
 if(!current[gss])fail(`bandStock: ${gss} is not a current English billing authority`);
 if(councils[gss])fail(`bandStock: duplicate ${gss}`);
 councils[gss]=record(row);
}
const missing=Object.keys(current).filter(gss=>!councils[gss]);
if(missing.length||Object.keys(councils).length!==296)fail(`bandStock: coverage ${Object.keys(councils).length}, missing ${missing.join(', ')}`);

// Cells as printed in the 24 September 2026 file. A changed edition must fail here, not publish.
const expect = (label,actual,printed) => {if(JSON.stringify(actual)!==JSON.stringify(printed))fail(`bandStock assertion ${label}: file has ${JSON.stringify(actual)}, expected ${JSON.stringify(printed)}`);};
expect('England total',england.total,25936540);
expect('England bands',BANDS.map(b=>england.counts[b]),[6121370,5052560,5705800,4074300,2555840,1355350,916160,155180]);
expect('Burnley',[councils.E07000117.areaName,councils.E07000117.total,councils.E07000117.counts.A,councils.E07000117.counts.D],['Burnley',43290,25810,3100]);
expect('Birmingham',[councils.E08000025.areaName,councils.E08000025.total,councils.E08000025.counts.A,councils.E08000025.counts.D],['Birmingham',469240,165150,45140]);
expect('Westminster',[councils.E09000033.areaName,councils.E09000033.total,councils.E09000033.counts.D,councils.E09000033.counts.H],['Westminster',131940,22860,17270]);
expect('City of London Band A suppressed',councils.E09000001.counts.A,null);

const output={schemaVersion:1,source,england,councils};
writeFileSync('data/national/band-stock.json',JSON.stringify(output,null,1)+'\n');
const suppressed=Object.values(councils).filter(c=>Object.values(c.counts).includes(null)).length;
console.log(`Imported band stock for ${Object.keys(councils).length} councils; England ${england.total} properties, ${england.bandDAndBelowShare}% in Band D or below; ${suppressed} council with a suppressed band.`);
