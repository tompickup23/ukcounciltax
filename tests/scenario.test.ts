import {describe,it,expect} from 'vitest';
import {projectCharge,componentProjection} from '../src/lib/scenario';
describe('future-cost illustrations',()=>{
it('compounds and compares with a frozen baseline, excluding the baseline year',()=>{const rows=projectCharge(200000,5,2);expect(rows.map(r=>r.annualPence)).toEqual([210000,220500]);expect(rows[1].cumulativePence).toBe(430500);expect(rows[1].extraPence).toBe(30500);});
it('supports freezes and reductions without inventing history',()=>{expect(projectCharge(123456,0,10)[9].extraPence).toBe(0);expect(projectCharge(200000,-10,1)[0].annualPence).toBe(180000);});
it('rejects invalid, missing or extreme assumptions',()=>{for(const args of [[0,5,2],[NaN,5,2],[1000,Infinity,2],[1000,51,2],[1000,5,0],[1000,5,1.5],[1000,5,11]])expect(()=>projectCharge(...args as [number,number,number])).toThrow();});
it('uses weighted component changes, not a sum of percentages',()=>{const result=componentProjection([{pence:180000,rate:5},{pence:20000,rate:10}]);expect(result.projected).toBe(211000);expect(result.percent).toBeCloseTo(5.5);});
});
