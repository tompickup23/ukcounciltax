import {describe,it,expect} from 'vitest';
import {national,parishesFor,parishChange} from '../src/lib/national-data';
import {loadYear} from '../src/lib/council-tax';
import {localBills} from '../src/lib/local-bill-data';

describe('national data source contracts',()=>{
 it('joins every English billing area by GSS and matches independently imported annual area totals',()=>{
  const annual=loadYear('2026-27').authorities;
  expect(Object.keys(national.components).sort()).toEqual(Object.keys(annual).sort());
  for(const [gss,c] of Object.entries(national.components)){
   expect(c.areaPence).toBe(Math.round(annual[gss].bands.D*100));
   expect(c.parts.map(p=>p.kind)).toEqual(['county','police','fire','combined']);
   expect(c.differencePence).not.toBeNull();expect(Math.abs(c.differencePence!)).toBeLessThanOrEqual(3);
   for(const p of c.parts)if(p.bandDPence!==0)expect(p.name).toBeTruthy();
  }
 });
 it('matches Burnley national components and parish Band D to the separately imported adopted schedule',()=>{
  const bill=localBills.find(b=>b.slug==='burnley')!;
  const c=national.components[bill.gss];
  expect(c.ownExcludingParishPence).toBe(bill.components.find(p=>p.kind==='billing')!.bandsPence.D);
  for(const kind of ['county','police','fire'])expect(c.parts.find(p=>p.kind===kind)!.bandDPence).toBe(bill.components.find(p=>p.kind===kind)!.bandsPence.D);
  for(const p of parishesFor(bill.gss)){const locality=bill.localities.find(l=>l.parishNames.some(n=>n.toLowerCase()===p.name.toLowerCase()));expect(locality,p.name).toBeTruthy();expect(p.years['2026-27'].bandDPence).toBe(locality!.parishPence!.D);}
 });
 it('keeps City of London and bundled combined-authority functions distinct',()=>{
  expect(national.components.E09000001.parts.find(p=>p.kind==='county')!.bandDPence).toBe(17638);
  expect(national.components.E09000001.parts.find(p=>p.kind==='police')!.bandDPence).toBe(0);
  const manchester=national.components.E08000003.parts;
  expect(manchester.find(p=>p.kind==='police')!.bandDPence).toBe(28530);
  expect(manchester.find(p=>p.kind==='combined')!.bandDPence).toBe(15395);
  expect(manchester.find(p=>p.kind==='police')!.code).toBe(manchester.find(p=>p.kind==='combined')!.code);
  expect(manchester.find(p=>p.kind==='fire')!.bandDPence).toBe(0);
 });
 it('preserves ceased, zero, negative and overlapping parish records without guessing identities',()=>{
  expect(national.parishes).toHaveLength(10245);
  expect(new Set(national.parishes.map(p=>p.code)).size).toBe(10245);
  const ceased=national.parishes.filter(p=>p.years['2026-27'].status==='not-existing');expect(ceased).toHaveLength(4);
  for(const p of ceased){expect(p.years['2026-27'].bandDPence).toBeNull();expect(parishChange(p)).toBeNull();}
  const negative=national.parishes.find(p=>p.name==='Beesby with Saleby')!;
  expect(negative.years['2026-27'].bandDPence).toBe(-264);expect(negative.notes[0].text).toContain('negative');
  expect(national.parishNotes['[note g]']).toContain('24,500');
  expect(national.parishes.some(p=>p.code==='E353829')).toBe(true);
  expect(national.parishes.some(p=>p.years['2026-27'].bandDPence===0&&p.years['2026-27'].status==='published')).toBe(true);
 });
 it('preserves long-series gaps and published precision instead of backfilling predecessors',()=>{
  expect(Object.keys(national.history)).toHaveLength(296);
  expect(national.history.E07000117.area.values['1993-94']).toBeTypeOf('number');
  expect(national.history.E06000063.area.values['1993-94']).toBeNull();
  expect(national.history.E07000139.area.values['2022-23']).toBe(1990.16);
  expect(national.history.E07000117.ownExcludingParish.values['1993-94']).toBeUndefined();
 });

});
