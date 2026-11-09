import {expect, it} from 'vitest';
import {profileChartNames, drawProfileChart} from '../src/lib/kit-charts';
it('registers four charts for all 296 councils', () => {
  expect(profileChartNames()).toHaveLength(1184);
});
it('draws the Burnley profile charts through the unchanged kit gates', () => {
  for (const chart of ['bands', 'bill', 'position', 'map'] as const) {
    const out = drawProfileChart(`councils/burnley/${chart}`);
    expect(out.svg).toContain('ek-chart');
    expect(out.table).toContain('Source:');
  }
}, 60000);
it('draws every profile chart in both PNG themes through the kit gates', () => {
  for (const name of profileChartNames()) {
    for (const theme of ['light', 'dark'] as const) {
      expect(() => drawProfileChart(name, theme), `${name}/${theme}`).not.toThrow();
    }
  }
}, 300000);
