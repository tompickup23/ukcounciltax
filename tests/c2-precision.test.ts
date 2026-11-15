import {describe,expect,it} from 'vitest';
import {withinRaPrecision,withinOwnPrecision,withinTable10Precision,withinTaxJoinPrecision,assertOwnPrecision} from '../scripts/lib/c2-precision.mjs';

describe('C2 printed precision boundaries',()=>{
  for(const [name,within,bound] of [
    ['total',withinRaPrecision,50000n],
    ['parish',withinRaPrecision,50000n],
    ['derived own',withinOwnPrecision,100050n],
    ['Table 10 identity',withinTable10Precision,100n],
  ] as const)it(`${name} includes both bounds and refuses either outside penny`,()=>{
    for(const sign of [-1n,1n]) {
      expect(within(sign*(bound-1n))).toBe(true);
      expect(within(sign*bound)).toBe(true);
      expect(within(sign*(bound+1n))).toBe(false);
    }
  });
  it('allows half a pound plus the Band D penny precision at either tax join bound',()=>{
    for(const base of [10000n,10001n])for(const sign of [-1n,1n]) {
      expect(withinTaxJoinPrecision(sign*9999n,base)).toBe(true);
      expect(withinTaxJoinPrecision(sign*10000n,base)).toBe(true);
      expect(withinTaxJoinPrecision(sign*10001n,base)).toBe(false);
    }
  });
  it('fails as a fixture error when components pass but derived own does not',()=>{
    expect(()=>assertOwnPrecision(50000n,-50000n,100050n,'fixture')).not.toThrow();
    for(const own of [-100051n,100051n])expect(()=>assertOwnPrecision(50000n,-50000n,own,'fixture')).toThrow('C2 fixture error');
    expect(()=>assertOwnPrecision(50001n,0n,100051n,'excluded component')).not.toThrow();
    expect(()=>assertOwnPrecision(0n,-50001n,-100051n,'excluded component')).not.toThrow();
  });
});
