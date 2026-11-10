import {expect, it} from 'vitest';
import {billShareRounding, KIT_CHARTS, profileChartNames, profileChartOptions} from '../src/lib/kit-charts';
it('uses the kit share strings and prints exactly 81 profile rounding notes', () => {
  expect(billShareRounding(KIT_CHARTS['home-bill'].options())).toContain('99.9%');
  expect(billShareRounding(profileChartOptions('burnley').bill)).toBeNull();
  expect(billShareRounding(profileChartOptions('tameside').bill)).toContain('100.1%');
  expect(billShareRounding(profileChartOptions('trafford').bill)).toContain('99.9%');
  const bills = profileChartNames().filter(name => name.endsWith('/bill'));
  expect(bills.filter(name => billShareRounding(profileChartOptions(name.split('/')[1]).bill))).toHaveLength(81);
}, 60000);
