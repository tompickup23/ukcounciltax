import {describe,it,expect} from 'vitest';
import {billChanges} from '../src/lib/local-bill-changes-data';
import {localityChanges,change} from '../src/lib/local-bill-changes';
import {localBills} from '../src/lib/local-bill-data';
import {resolveBill} from '../src/lib/local-bill';
import {bodyRole} from '../src/lib/body-roles';
describe('local bill changes since the previous year',()=>{
 it('covers every imported schedule, every body and every parish',()=>{
  for(const bill of localBills){
   const c=billChanges.find(x=>x.gss===bill.gss)!;expect(c).toBeTruthy();expect(c.band).toBe('D');
   expect(c.bodies.map(b=>b.componentId)).toEqual(bill.components.map(x=>x.id));
   expect(c.parishes.map(p=>p.localityId).sort()).toEqual(bill.localities.filter(l=>l.parishPence).map(l=>l.id).sort());
   expect(c.sources.previousBodies.sha256).toMatch(/^[a-f0-9]{64}$/);
  }
 });
 it('uses the schedule as the current year, so every locality total ties to the published Band D bill',()=>{
  for(const bill of localBills){const c=billChanges.find(x=>x.gss===bill.gss)!;for(const l of bill.localities)expect(localityChanges(c,l.id).total.currentPence).toBe(resolveBill(bill,l.id,'D').total);}
 });
 it('holds the published Burnley figures',()=>{
  const c=billChanges.find(x=>x.slug==='burnley')!;const u=localityChanges(c,'unparished');
  expect(u.total.previousPence).toBe(244750);expect(u.total.currentPence).toBe(254032);
  expect(u.rows.find(r=>r.kind==='billing')).toMatchObject({previousPence:34458,currentPence:35144,pence:686,percent:1.99});
  expect(localityChanges(c,'cliviger').rows.at(-1)).toMatchObject({previousPence:983,currentPence:943,pence:-40});
 });
 it('refuses a missing figure rather than treating it as zero',()=>{expect(()=>change({name:'x',previousPence:0,currentPence:100})).toThrow();});
 it('has a plain line for every body on the bill and for parishes',()=>{for(const bill of localBills)for(const c of bill.components)expect(bodyRole(c.kind)).toBeTruthy();expect(bodyRole('parish')).toBeTruthy();});
});
