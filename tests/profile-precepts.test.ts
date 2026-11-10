import {expect, it} from 'vitest';
import {profilePrecepts} from '../src/lib/profile-precepts';
import {national} from '../src/lib/national-data';
import {CURRENT_YEAR, loadYear} from '../src/lib/council-tax';
it('drops exactly 198 empty rows and preserves every published penny', () => {
  let dropped = 0;
  const counts: Record<number, number> = {};
  for (const [gss, tax] of Object.entries(loadYear(CURRENT_YEAR).authorities)) {
    const data = national.components[gss];
    const kept = profilePrecepts(tax.classCode, data.parts);
    dropped += data.parts.length - kept.length;
    expect(data.ownWithParishPence! + kept.reduce((sum,part) => sum + part.bandDPence!,0)).toBe(data.areaPence);
    const count = 1 + kept.filter(part => part.bandDPence !== 0).length;
    counts[count] = (counts[count] ?? 0) + 1;
  }
  expect(dropped).toBe(198);
  expect(counts).toEqual({2:36,3:152,4:103,5:5});
});
it('refuses to drop a named body or a nonzero charge', () => {
  expect(() => profilePrecepts('UA',[{kind:'county',code:null,name:null,bandDPence:1}])).toThrow('A3 stop');
  expect(() => profilePrecepts('UA',[{kind:'county',code:null,name:'Named body',bandDPence:0}])).toThrow('A3 stop');
});
