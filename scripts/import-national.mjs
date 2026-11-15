/** National imports informed by AI DOGE's parish/history collectors, using
 * UK Councils' displayed-cell ODS reader. No sibling checkout is read at runtime.
 * The reviewed source hashes pin editions; upstream changes require review.
 *
 *   node scripts/import-national.mjs                  the launch edition (Table 10 for
 *                                                     the year in sources.json), written to
 *                                                     data/national/england.json, as before
 *   node scripts/import-national.mjs --stage 2027-28  release morning, step one: find the
 *                                                     year's Table 10 on its statistics page
 *                                                     by title, download it, and write its
 *                                                     source record with the SHA-256 to
 *                                                     data/national/table-10-2027-28.source.json
 *                                                     for review. Nothing else is written.
 *   node scripts/import-national.mjs --year 2027-28   step two: import that Table 10, checked
 *                                                     against the reviewed hash and the year's
 *                                                     levels file, to data/national/england-2027-28.json
 *   --out <dir>     where the national file and staged source go (default data/national)
 *   --levels <dir>  where the levels files are read (default data/council-tax)
 *   --raw <dir>     where downloads go (default data/raw)
 *   --as-incoming   rehearsal only: import the launch year through its staged record
 *
 * The parish return and the Band D history keep their own editions from
 * sources.json; a year's file says which it holds. Writing england-<year>.json
 * is what switches the site to that year (src/lib/edition.mjs), so step two is
 * run only after the levels import has passed and the hash has been reviewed.
 */
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join, resolve} from 'node:path';
import {readOds, table, figure} from './lib/ods.mjs';
import {parishYearOfTitle, stagedTable10Source, table10Attachment, vintageOfFile, yearWordsOf} from './lib/national-years.mjs';
const args=process.argv.slice(2);
const option=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:null;};
const OUT=resolve(option('--out')??'data/national'), LEVELS=resolve(option('--levels')??'data/council-tax'), RAW=resolve(option('--raw')??'data/raw');
const fail = message => {throw new Error(message);};
const sources = JSON.parse(readFileSync('data/national/sources.json','utf8'));
const LAUNCH = /England (\d{4}) to (\d{4}): Table 10/.exec(sources.components.title)?.slice(1).join('-').replace(/-(\d{2})(\d{2})$/,'-$2') ?? fail('sources.json components title names no year');
mkdirSync(RAW,{recursive:true});mkdirSync(OUT,{recursive:true});
const STAGE=option('--stage');
if(STAGE){
 const words=yearWordsOf(STAGE), slug=`council-tax-levels-set-by-local-authorities-in-england-${words.replace(/ /g,'-')}`;
 const response=await fetch(`https://www.gov.uk/api/content/government/statistics/${slug}`);if(!response.ok)fail(`${STAGE}: statistics page HTTP ${response.status}`);
 const page=await response.json();
 const attachment=table10Attachment(page.details?.attachments??[],STAGE);
 const file=`table-10-${STAGE}.ods`, path=join(RAW,file);
 const bytes=Buffer.from(await (await fetch(attachment.url)).arrayBuffer());writeFileSync(path,bytes);
 const record=stagedTable10Source({attachment,year:STAGE,pageUrl:`https://www.gov.uk/government/statistics/${slug}`,file,sha256:createHash('sha256').update(bytes).digest('hex'),retrieved:new Date().toISOString().slice(0,10)});
 const out=join(OUT,`table-10-${STAGE}.source.json`);writeFileSync(out,JSON.stringify(record,null,2)+'\n');
 console.log(`Staged ${record.title}, SHA-256 ${record.sha256}, to ${out}. Review the hash and title, then run --year ${STAGE}.`);
 process.exit(0);
}
const YEAR=option('--year')??LAUNCH;
// The rehearsal (scripts/rehearse-levels-day.mjs) treats the launch year as incoming, through the staged record.
const INCOMING=YEAR!==LAUNCH||args.includes('--as-incoming');
// The launch edition keeps its place in sources.json; a later year's Table 10 is its own reviewed record.
if(INCOMING&&!existsSync(join(OUT,`table-10-${YEAR}.source.json`)))fail(`${YEAR}: no staged Table 10 record; run --stage ${YEAR} first`);
const componentsSource=!INCOMING?sources.components:JSON.parse(readFileSync(join(OUT,`table-10-${YEAR}.source.json`),'utf8'));
if(!componentsSource.title.includes(`${yearWordsOf(YEAR)}: Table 10`))fail(`${YEAR}: Table 10 record title does not name the year`);
const editions={parishes:sources.parishes,components:componentsSource,history:sources.history};
const levelsPath=join(LEVELS,`england-${YEAR}.json`);
if(!existsSync(levelsPath))fail(`${YEAR}: no levels file at ${levelsPath}; run fetch-council-tax.mjs --year ${YEAR} first`);
const current = JSON.parse(readFileSync(levelsPath,'utf8')).authorities;
const AUTHORITIES = Object.keys(current).length;
const money = (value, where) => {const n=figure(value,where);if(n===null)return null;const p=n*100;if(Math.abs(p-Math.round(p))>0.00001)fail(`${where}: unexpected precision`);return Math.round(p);};
const sheet = (sheets,name) => sheets.find(s=>s.name===name) ?? fail(`Missing sheet ${name}`);
const noteMap = rows => Object.fromEntries(rows.filter(r=>/^\[(note |r\])/.test(r[0])).map(r=>[r[0],r[1]]));
const resolveNotes = (text,notes) => [...new Set((text??'').match(/\[(?:note [a-z]+|r)\]/g)??[])].map(id=>({id,text:notes[id]??fail(`Unknown note ${id}`)}));
const workbooks={};
// The band stock file is a zipped CSV with its own importer, import-band-stock.mjs.
const ODS_KEYS=['parishes','components','history'];
for(const key of ODS_KEYS) {
 const source=editions[key];
 const path=join(RAW,source.file);
 if(!existsSync(path)){const response=await fetch(source.fileUrl);if(!response.ok)fail(`${key}: HTTP ${response.status}`);writeFileSync(path,Buffer.from(await response.arrayBuffer()));}
 const hash=createHash('sha256').update(readFileSync(path)).digest('hex');
 if(hash!==source.sha256)fail(`${key}: source edition changed; review before importing`);
 workbooks[key]=readOds(path);
}
const p=table(sheet(workbooks.parishes,'Parish_Level_Data'),['ONS code for Local Authority','Parish Name']);
const pn=noteMap(sheet(workbooks.parishes,'Notes').rows);
const pc={gss:p.column(/^ONS code for Local Authority$/),name:p.column(/^Parish Name$/),code:p.column(/^MHCLG Parish/),type:p.column(/^Parish Type/),notes:p.column(/^Notes$/)};
// The parish return's own year and the year before it, from its title.
const PARISH_YEAR=parishYearOfTitle(editions.parishes.title);
const parishYears=[`${Number(PARISH_YEAR.slice(0,4))-1}-${PARISH_YEAR.slice(2,4)}`,PARISH_YEAR];
const parishColumns=Object.fromEntries(parishYears.map(y=>[y,{band:p.column(new RegExp(`^Band D council tax.*${y}`,'s')),precept:p.column(new RegExp(`^Amount precepted.*${y}`,'s')),base:p.column(new RegExp(`^Tax base.*${y}`,'s'))}]));
const parishes=p.rows.map(row=>{
 const gss=row[pc.gss],code=row[pc.code];if(!current[gss]||!/^E\d{4}(?:P\d{3,4}|\d{2,3})$/.test(code))fail(`Unrecognised parish identity ${gss}/${code}`);
 return {code,gss,name:row[pc.name],type:row[pc.type],notes:resolveNotes(row[pc.notes],pn),years:Object.fromEntries(parishYears.map(year=>{const c=parishColumns[year];return [year,{bandDPence:money(row[c.band],code),preceptPounds:figure(row[c.precept],code),taxBase:figure(row[c.base],code),status:row[c.band]==='[z]'?'not-existing':row[c.band]==='[x]'?'unavailable':'published'}];}))};
});
if(parishes.length!==10245 || new Set(parishes.map(p=>p.code)).size!==parishes.length)fail('Unexpected parish count or duplicate code');
// Preserve source-supplied previous-year comparisons. Never merge by parish name.
const b=table(sheet(workbooks.components,'Data_Billing'),['ONS Code','Authority']);
const bn=Object.fromEntries(sheet(workbooks.components,'Notes').rows.filter(r=>/^\[/.test(r[0])).map(r=>[r[0],r[3]]));
const bodySheet=sheet(workbooks.components,'Precepting_Bodies');
if(bodySheet.rows[0].slice(4,12).join('|')!=='County|Police|Fire|Combined Authorities|County|Police|Fire|Combined Authority')fail('Precepting body layout changed');
const bodyRows=table(bodySheet,['Local Authority','ONS Codes']);
const bodyGss=bodyRows.column(/^ONS Codes$/);
const bodies=new Map(bodyRows.rows.filter(r=>current[r[bodyGss]]).map(r=>[r[bodyGss],r]));
const bc={gss:b.column(/^ONS Code$/),notes:b.column(/^Notes/),own:b.column(/^9\..*current year/s),withParish:b.column(/^8\..*current year/s),total:b.column(/^17\./),special:b.column(/^1a\..*current year/s),base:b.column(/^7\..*current year/s)};
const slots=[['county','county or GLA'],['police','police'],['fire','fire'],['combined','combined authority']].map(([kind,label],i)=>({kind,column:b.column(new RegExp(`^16\\..*\\(${label}\\)`,'s')),nameColumn:4+i,codeColumn:8+i}));
const components={};
for(const row of b.rows.filter(r=>current[r[bc.gss]])) {
 const gss=row[bc.gss],body=bodies.get(gss);if(!body||components[gss])fail(`Missing/duplicate body mapping ${gss}`);
 const parts=slots.map(s=>{const pence=money(row[s.column],gss),name=body[s.nameColumn],code=body[s.codeColumn]||null;if(pence!==null&&pence!==0&&(!name||name==='-'))fail(`Unmapped nonzero charge ${gss}/${s.kind}`);return {kind:s.kind,name:name&&name!=='-'?name:null,code,bandDPence:pence};});
 const ownWithParishPence=money(row[bc.withParish],gss),areaPence=money(row[bc.total],gss);
 const differencePence=ownWithParishPence===null||areaPence===null||parts.some(p=>p.bandDPence===null)?null:ownWithParishPence+parts.reduce((s,p)=>s+p.bandDPence,0)-areaPence;
 if(differencePence!==null&&Math.abs(differencePence)>3)fail(`Unreconciled national components ${gss}: ${differencePence}p`);
 components[gss]={ownWithParishPence,ownExcludingParishPence:money(row[bc.own],gss),areaPence,parts,differencePence,specialExpensesPounds:figure(row[bc.special],gss),taxBase:figure(row[bc.base],gss),notes:resolveNotes(row[bc.notes],bn)};
}
if(Object.keys(components).length!==AUTHORITIES)fail('Incomplete billing-authority coverage');
const history={};
for(const [name,measure] of [['Area_CT','area'],['exc_PP','ownExcludingParish'],['inc_PP','ownIncludingParish']]) {
 const t=table(sheet(workbooks.history,name),['ONS Code','Authority','Current']);
 const yc=t.header.flatMap((h,i)=>{const m=/^(\d{4}) to (\d{4})$/.exec(h);return m?[[i,`${m[1]}-${m[2].slice(2)}`]]:[];});
 if(yc.at(-1)?.[1]!==vintageOfFile(editions.history.file))fail(`Unexpected history vintage ${name}`);
 const gc=t.column(/^ONS Code$/),nc=t.column(/^Notes$/);
 for(const row of t.rows.filter(r=>current[r[gc]]&&r[t.column(/^Current$/)]==='YES')){
  const gss=row[gc];history[gss]??={};if(history[gss][measure])fail(`Duplicate historical identity ${gss}`);
  history[gss][measure]={notes:row[nc]??'',values:Object.fromEntries(yc.map(([i,y])=>{const value=figure(row[i],`${gss}/${name}/${y}`);if(value!==null&&Math.abs(value*100-Math.round(value*100))>0.00001)fail(`Unexpected history precision ${gss}/${y}`);return [y,value];}))};
 }
}
if(Object.keys(history).length!==AUTHORITIES||Object.values(history).some(r=>!r.area||!r.ownExcludingParish||!r.ownIncludingParish))fail('Incomplete historical series');
const output={schemaVersion:1,year:YEAR,sources:Object.fromEntries(ODS_KEYS.map(key=>[key,editions[key]])),parishNotes:pn,parishChanges:sheet(workbooks.parishes,'Ceased_New_Renamed_Parishes').rows,historyNotes:sheet(workbooks.history,'Notes').rows,components,parishes,history};
const outPath=join(OUT,!INCOMING?'england.json':`england-${YEAR}.json`);
writeFileSync(outPath,JSON.stringify(output)+'\n');
console.log(`Imported ${Object.keys(components).length} component breakdowns, ${parishes.length} parish records (${parishes.filter(p=>p.years[PARISH_YEAR].status==='not-existing').length} ceased), ${Object.keys(history).length} historical series, ${YEAR}, to ${outPath}.`);
