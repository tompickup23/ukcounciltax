import {existsSync,readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {CURRENT_YEAR, PREVIOUS_YEAR, yearLabel, loadYear} from '../src/lib/council-tax';
import {national,parishesFor,parishChange,type Parish} from '../src/lib/national-data';
import {councilPages,parishPages,parishPath} from '../src/lib/paths';
import {parishRange,parishSummary} from '../src/lib/parish-pages';
const year=yearLabel(CURRENT_YEAR), previous=yearLabel(PREVIOUS_YEAR);
const burnley=`The ${year} return lists 8 local precepting authorities in Burnley. 8 set a Band D precept, from £7.36 (Ightenhill) to £44.06 (Padiham).`;
const lancaster=`The ${year} return lists 37 local precepting authorities in Lancaster. 34 set a Band D precept, from £12.18 (Over Wyresdale) to £395.11 (Wennington). 3 set a Band D precept of £0.00.`;
const read=(path:string)=>readFileSync(`dist${path}index.html`,'utf8');
const text=(html:string)=>html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const rows=(html:string)=>[...(html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)?.[1]??'').matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].map(r=>r[0]);

it('matches all parish counts and the two binding sentences',()=>{
 expect(national.parishes).toHaveLength(10245); expect(parishPages()).toHaveLength(214);
 const names=parishPages().map(c=>loadYear(CURRENT_YEAR).authorities[c.gss].name);
 expect(names).toEqual([...names].sort((a,b)=>a.localeCompare(b,'en-GB')));
 expect(parishRange('Burnley',parishesFor('E07000117'))).toBe(burnley);
 expect(parishRange('Lancaster',parishesFor('E07000121'))).toBe(lancaster);
 expect(parishSummary(parishesFor('E07000137'))).toMatchObject({records:163,nonZero:104,zero:59,min:-264,max:35368});
 expect(parishRange('City of London',parishesFor('E09000001'))).toContain('2 set a Band D precept of £2,038.90 (Inner Temple and Middle Temple)');
 expect(parishRange('Bournemouth, Christchurch and Poole',parishesFor('E06000058'))).toContain(`2 listed for ${previous} no longer exist in ${year}`);
 expect(parishesFor('E06000058').filter(p=>parishChange(p)!==null)).toHaveLength(5);
 expect(parishesFor('E06000065')).toHaveLength(665);
 expect(national.parishes.filter(p=>parishChange(p)!==null)).toHaveLength(10234);
});
it('preserves zero and negative figures and gives bounded tied names',()=>{
 const base=parishesFor('E07000117')[0];
 const fixture=(name:string,value:number):Parish=>({...structuredClone(base),name,years:{...base.years,[CURRENT_YEAR]:{...base.years[CURRENT_YEAR],bandDPence:value}}});
 expect(parishRange('Example',[fixture('Only',100)])).toContain('One set a Band D precept of £1.00 (Only).');
 expect(parishRange('Example',[fixture('Only',100)])).toContain(`lists 1 local precepting authority in Example.`);
 expect(parishRange('Example',['A','B','C','D'].map(n=>fixture(n,100)))).toContain('(A and 3 others)');
 expect(parishRange('Example',[fixture('Zero',0)])).toContain('1 set a Band D precept of £0.00.');
 expect(parishRange('East Lindsey',parishesFor('E07000137'))).toContain('minus £2.64 (Beesby with Saleby, a negative precept as published)');
});

describe.skipIf(!existsSync('dist/precepts/parishes/index.html'))('built parish pages',()=>{
 it('builds every area, all source rows, sourced own shares and only official body links',()=>{
  let total=0;
  for(const council of parishPages()) {
   const html=read(parishPath(council)); const body=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)![1];
   expect(rows(html)).toHaveLength(parishesFor(council.gss).length); total+=rows(html).length;
   expect([...html.matchAll(/<h1\b/g)]).toHaveLength(1);
   for(const link of body.matchAll(/href="(https?:[^"]+)"/g)) {
    const url=new URL(link[1]);expect(url.hostname==='ukcounciltax.co.uk'||url.hostname==='www.gov.uk'||link[1]===national.sources.parishes.fileUrl).toBe(true);
   }
  }
  expect(total).toBe(10245);expect(rows(read('/precepts/parishes/'))).toHaveLength(214);
  const names=rows(read('/precepts/parishes/')).map(row=>text(row.match(/<th[^>]*>([\s\S]*?)<\/th>/)![1]));
  expect(names).toEqual([...names].sort((a,b)=>a.localeCompare(b,'en-GB')));
 });
 it('reproduces the published anchors, changes and non comparable rows',()=>{
  const b=read('/precepts/parishes/burnley/');expect(text(b)).toContain(burnley);expect(text(b)).toContain('£351.44');expect(text(b)).toContain('Table 8c');
  const padiham=rows(b).map(text).find(row=>row.startsWith('Padiham'))!;for(const amount of ['£38.64','£44.06','+£5.42'])expect(padiham).toContain(amount);
  const l=read('/precepts/parishes/lancaster/');expect(rows(l)).toHaveLength(37);expect(text(l)).toContain(lancaster);expect(text(l)).toContain('£272.20');
  expect(rows(l).slice(0,3).map(text)).toEqual([expect.stringContaining('Aldcliffe with Stodday'),expect.stringContaining('Arkholme with Cawood'),expect.stringContaining('Bolton le Sands')]);
  const e=text(read('/precepts/parishes/east-lindsey/'));expect(e).toContain('minus £2.64 (Beesby with Saleby, a negative precept as published)');expect(e).toContain('-£2.64');
  expect(text(read('/precepts/parishes/city-of-london/'))).toContain('2 set a Band D precept of £2,038.90 (Inner Temple and Middle Temple)');
  const bcp=read('/precepts/parishes/bournemouth-christchurch-and-poole/');expect(text(bcp)).toContain(`2 listed for ${previous} no longer exist in ${year}`);expect(rows(bcp).filter(row=>text(row).includes('Not comparable'))).toHaveLength(5);
  expect(text(read('/precepts/parishes/county-durham/'))).toContain('Durham Charter Trustees overlap some parish areas.');
 });
});

describe.skipIf(!existsSync('dist/precepts/parishes/index.html'))('profile parish summaries',()=>{
 it('moves every table and links exactly 214 parish areas, preserving 82 absence notices',()=>{
  let linked=0,absent=0;
  for(const {council} of councilPages()) {
   const html=read(`/councils/${council.slug}/`);
   expect(html).not.toContain('data-parish-name');
   const section=html.match(/<section[^>]*id="parish-precepts"[^>]*>([\s\S]*?)<\/section>/)![1];
   if(parishesFor(council.gss).length) {expect(section).toContain(`href="${parishPath(council)}"`);linked++;}
   else {expect(section).toContain('No parish or local-body rows');absent++;}
  }
  expect(linked).toBe(214);expect(absent).toBe(82);
 });
});
