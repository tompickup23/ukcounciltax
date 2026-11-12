import {expect, it, vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {councilTaxLink} from '../src/lib/council-links';
import {loadYear, CURRENT_YEAR} from '../src/lib/council-tax';
const data = JSON.parse(readFileSync('data/council-links.json','utf8'));
it('preserves the pinned 316 links and English coverage', () => {
  expect(Object.keys(data.links)).toHaveLength(316);
  expect(Object.keys(loadYear(CURRENT_YEAR).authorities).filter(councilTaxLink)).toHaveLength(266);
  expect(Object.keys(data.links).filter(gss => gss.startsWith('S'))).toHaveLength(29);
  expect(Object.keys(data.links).filter(gss => gss.startsWith('W'))).toHaveLength(21);
  expect(councilTaxLink('E07000117')).toBe('https://burnley.gov.uk/counciltax/paying-your-council-tax/');
  expect(councilTaxLink('E07000121')).toBe('https://www.lancaster.gov.uk/council-tax/pay-your-council-tax/');
  expect(councilTaxLink('E09000007')).toBe('https://www.camden.gov.uk/pay-council-tax');
  expect(councilTaxLink('E06000006')).toBeNull();
  expect(councilTaxLink('S12000033')).toBeNull();
  const http = Object.keys(data.links).filter(gss => councilTaxLink(gss)!.startsWith('http://'));
  expect(http.sort()).toEqual(['E07000199','E08000004','E08000034','S12000020','W06000003'].sort());
  for (const gss of Object.keys(data.links)) expect(councilTaxLink(gss)).toMatch(/^https?:\/\//);
});

it('keeps the refreshed links valid until the 91 day boundary', async () => {
  vi.useFakeTimers();
  try {
    for (const date of ['2027-01-04T00:00:00Z', '2027-02-09T23:59:59.999Z']) {
      vi.setSystemTime(new Date(date));
      vi.resetModules();
      await expect(import('../src/lib/council-links')).resolves.toBeDefined();
    }
    vi.setSystemTime(new Date('2027-02-10T00:00:00Z'));
    vi.resetModules();
    await expect(import('../src/lib/council-links')).rejects.toThrow('council payment links are stale');
  } finally {
    vi.useRealTimers();
    vi.resetModules();
  }
});
