import {describe,it,expect} from 'vitest';
import {localBills} from '../src/lib/local-bill-data';
import {resolveBill,modelComponents} from '../src/lib/local-bill';
import {devolved,nationNeighbours} from '../src/lib/devolved';
describe('published local schedules',()=>{
 it('only admits complete, year-specific published schedules',()=>{for(const bill of localBills){expect(bill.status).toBe('complete-published-schedule');expect(bill.year).toBe('2026-27');expect(bill.source.sha256).toMatch(/^[a-f0-9]{64}$/);expect(new Set(bill.localities.map(l=>l.id)).size).toBe(bill.localities.length);}});
 it('reconciles every locality and band to its published total',()=>{for(const bill of localBills)for(const locality of bill.localities)for(const band of Object.keys(locality.totalsPence)){expect(resolveBill(bill,locality.id,band).total).toBe(locality.totalsPence[band]);}});
 it('keeps parish totals separate from the area average',()=>{const bill=localBills[0];expect(resolveBill(bill,'unparished','D').total).toBe(254032);expect(resolveBill(bill,'padiham','D').total).toBe(258438);});
 it('rejects missing localities, missing bands and incomplete charges',()=>{const bill=structuredClone(localBills[0]);expect(()=>resolveBill(bill,'unknown','D')).toThrow();expect(()=>resolveBill(bill,'unparished','I')).toThrow();delete bill.components[0].bandsPence.D;expect(()=>resolveBill(bill,'unparished','D')).toThrow('unavailable');});
 it('rejects police or fire added again inside a mayoral charge',()=>{const bill=structuredClone(localBills[0]);bill.components.push({...bill.components[2],id:'mayoral',kind:'mayoral',includes:['police','fire']});expect(()=>resolveBill(bill,'unparished','D')).toThrow('twice');});
 it('uses each component base when modelling changes',()=>{const parts=[{id:'council',pence:100000},{id:'police',pence:20000}];const result=modelComponents(parts,{council:5,police:10},1);expect(result.reduce((s,p)=>s+p.projectedPence,0)).toBe(127000);expect(()=>modelComponents(parts,{council:5},1)).toThrow();});
});
describe('devolved source editions',()=>{
 it('has complete Scottish published bands without mixing water charges',()=>{for(const e of devolved.editions.filter(e=>e.nation==='Scotland')){expect(e.records).toHaveLength(32);expect(e.basis).toContain('excludes water');for(const r of e.records){expect(Object.keys(r.bandsPence)).toEqual('ABCDEFGH'.split(''));expect(Object.values(r.bandsPence).every(v=>Number.isSafeInteger(v)&&v>0)).toBe(true);}}});
 it('preserves Welsh published precision and does not infer Band I',()=>{const e=devolved.editions.find(e=>e.nation==='Wales')!;expect(e.records).toHaveLength(22);for(const r of e.records){expect(Object.keys(r.bandsPence)).toEqual(['D']);expect(r.bandsPence.D%100).toBe(0);}});
});
describe('onward links on devolved council pages',()=>{
 it('gives every current devolved council two others in its own nation',()=>{
  for(const e of devolved.editions.filter(e=>e.year===devolved.editions.map(x=>x.year).sort().at(-1))){
   const slugs=new Set(e.records.map(r=>r.slug));
   for(const row of e.records){
    const near=nationNeighbours(e.nation,row.slug);
    expect(near).toHaveLength(2);
    for(const n of near){expect(slugs.has(n.slug)).toBe(true);expect(n.slug).not.toBe(row.slug);}
   }
  }
 });
 it('returns nothing for a council it does not hold',()=>{expect(nationNeighbours('Scotland','no-such-council')).toEqual([]);});
});
