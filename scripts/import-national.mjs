/** National imports informed by AI DOGE's parish/history collectors, using
 * UK Councils' displayed-cell ODS reader. No sibling checkout is read at runtime.
 * The reviewed source hashes pin editions; upstream changes require review.
 */
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readOds, table, figure} from './lib/ods.mjs';
const sources = JSON.parse(readFileSync('data/national/sources.json','utf8'));
const current = JSON.parse(readFileSync('data/council-tax/england-2026-27.json','utf8')).authorities;
const fail = message => {throw new Error(message);};
const money = (value, where) => {const n=figure(value,where);if(n===null)return null;const p=n*100;if(Math.abs(p-Math.round(p))>0.00001)fail(`${where}: unexpected precision`);return Math.round(p);};
const sheet = (sheets,name) => sheets.find(s=>s.name===name) ?? fail(`Missing sheet ${name}`);
const noteMap = rows => Object.fromEntries(rows.filter(r=>/^\[(note |r\])/.test(r[0])).map(r=>[r[0],r[1]]));
const resolveNotes = (text,notes) => [...new Set((text??'').match(/\[(?:note [a-z]+|r)\]/g)??[])].map(id=>({id,text:notes[id]??fail(`Unknown note ${id}`)}));
const workbooks={};
mkdirSync('data/raw',{recursive:true});
for(const [key,source] of Object.entries(sources)) {
 const path=`data/raw/${source.file}`;
 if(!existsSync(path)){const response=await fetch(source.fileUrl);if(!response.ok)fail(`${key}: HTTP ${response.status}`);writeFileSync(path,Buffer.from(await response.arrayBuffer()));}
 const hash=createHash('sha256').update(readFileSync(path)).digest('hex');
 if(hash!==source.sha256)fail(`${key}: source edition changed; review before importing`);
 workbooks[key]=readOds(path);
}
const p=table(sheet(workbooks.parishes,'Parish_Level_Data'),['ONS code for Local Authority','Parish Name']);
const pn=noteMap(sheet(workbooks.parishes,'Notes').rows);
const pc={gss:p.column(/^ONS code for Local Authority$/),name:p.column(/^Parish Name$/),code:p.column(/^MHCLG Parish/),type:p.column(/^Parish Type/),notes:p.column(/^Notes$/)};
const parishYears=['2025-26','2026-27'];
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
if(Object.keys(components).length!==296)fail('Incomplete billing-authority coverage');
const history={};
for(const [name,measure] of [['Area_CT','area'],['exc_PP','ownExcludingParish'],['inc_PP','ownIncludingParish']]) {
 const t=table(sheet(workbooks.history,name),['ONS Code','Authority','Current']);
 const yc=t.header.flatMap((h,i)=>{const m=/^(\d{4}) to (\d{4})$/.exec(h);return m?[[i,`${m[1]}-${m[2].slice(2)}`]]:[];});
 if(yc.at(-1)?.[1]!=='2026-27')fail(`Unexpected history vintage ${name}`);
 const gc=t.column(/^ONS Code$/),nc=t.column(/^Notes$/);
 for(const row of t.rows.filter(r=>current[r[gc]]&&r[t.column(/^Current$/)]==='YES')){
  const gss=row[gc];history[gss]??={};if(history[gss][measure])fail(`Duplicate historical identity ${gss}`);
  history[gss][measure]={notes:row[nc]??'',values:Object.fromEntries(yc.map(([i,y])=>{const value=figure(row[i],`${gss}/${name}/${y}`);if(value!==null&&Math.abs(value*100-Math.round(value*100))>0.00001)fail(`Unexpected history precision ${gss}/${y}`);return [y,value];}))};
 }
}
if(Object.keys(history).length!==296||Object.values(history).some(r=>!r.area||!r.ownExcludingParish||!r.ownIncludingParish))fail('Incomplete historical series');
const output={schemaVersion:1,year:'2026-27',sources,parishNotes:pn,parishChanges:sheet(workbooks.parishes,'Ceased_New_Renamed_Parishes').rows,historyNotes:sheet(workbooks.history,'Notes').rows,components,parishes,history};
writeFileSync('data/national/england.json',JSON.stringify(output)+'\n');
console.log(`Imported ${Object.keys(components).length} component breakdowns, ${parishes.length} parish records (${parishes.filter(p=>p.years['2026-27'].status==='not-existing').length} ceased), ${Object.keys(history).length} historical series.`);
