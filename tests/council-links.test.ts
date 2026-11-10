import {expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {councilTaxLink} from '../src/lib/council-links';
import {loadYear, CURRENT_YEAR} from '../src/lib/council-tax';
const data = JSON.parse(readFileSync('data/council-links.json','utf8'));
it('preserves the pinned 299 links and English coverage', () => {
  expect(Object.keys(data.links)).toHaveLength(299);
  expect(Object.keys(loadYear(CURRENT_YEAR).authorities).filter(councilTaxLink)).toHaveLength(254);
  expect(Object.keys(data.links).filter(gss => gss.startsWith('S'))).toHaveLength(26);
  expect(Object.keys(data.links).filter(gss => gss.startsWith('W'))).toHaveLength(19);
  expect(councilTaxLink('E07000117')).toBe('https://burnley.gov.uk/counciltax/paying-your-council-tax/');
  expect(councilTaxLink('E07000121')).toBe('https://www.lancaster.gov.uk/council-tax/pay-your-council-tax');
  expect(councilTaxLink('E09000007')).toBeNull();
  const http = Object.keys(data.links).filter(gss => councilTaxLink(gss)!.startsWith('http://'));
  expect(http.sort()).toEqual(['E07000199','E08000004','E08000034','S12000020','W06000003'].sort());
  for (const gss of Object.keys(data.links)) expect(councilTaxLink(gss)).toMatch(/^https?:\/\//);
});
