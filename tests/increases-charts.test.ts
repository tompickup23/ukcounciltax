import {describe, expect, it, vi} from 'vitest';
import {CURRENT_YEAR, loadYear, percent} from '../src/lib/council-tax';
import {increaseGroups, increaseFigureKey, sortRows} from '../src/lib/increase-groups';
import {increaseChartNames, increaseChartOptions, chartKeys, chartPng} from '../src/lib/kit-charts';
import {siteFigures} from '../src/lib/figures';
import {rankedBars} from '../src/vendor/estate-kit/dist/src/index.js';
import {tableName} from '../src/lib/sources';

const groups = increaseGroups(CURRENT_YEAR);

describe('the published own share increases', () => {
  it('keeps the three existing cohorts and reports missing published changes', () => {
    expect(groups.map(group => [group.id, group.rows.length, group.omitted])).toEqual([
      ['unitary', 132, 0], ['county', 21, 0], ['district', 164, 0],
    ]);
    const data = loadYear(CURRENT_YEAR);
    for (const group of groups) for (const row of group.rows) {
      if (group.id === 'county') expect(data.counties[row.gss]).toEqual(row.own);
      else expect(data.authorities[row.gss].classCode === 'SD').toBe(group.id === 'district');
    }
  });

  it('omits only missing changes and retains a published zero and fall', () => {
    const example = groups[0].rows[0];
    const rows = [null, 0, -1, 2].map((changePct, i) => ({...example, gss: String(i), own: {...example.own, changePct}}));
    expect(sortRows(rows).map(row => row.own.changePct)).toEqual([2, 0, -1]);
  });

  it('draws each table value in table order with its own source table and no change marker', () => {
    const set = siteFigures();
    const data = loadYear(CURRENT_YEAR);
    for (const group of groups) {
      const name = `increases-${group.id}` as const;
      const options = increaseChartOptions(name);
      expect(options.rows).toEqual(group.rows.map(row => ({figure: increaseFigureKey(CURRENT_YEAR, group.id, row.gss)})));
      expect(chartKeys(name)).toEqual(options.rows.map(row => row.figure));
      for (const row of group.rows) {
        const record = set.value(increaseFigureKey(CURRENT_YEAR, group.id, row.gss));
        expect(record.value).toBe(row.own.changePct);
        expect(record.name).toBe(row.name);
        expect(record.unit).toBe('percent');
        expect(record.source).toMatchObject({publisher: 'MHCLG', title: data.source.title, table: tableName(group.table)});
        expect(record.source.edition).toBeTruthy();
      }
      for (const theme of ['light', 'dark'] as const) {
        const out = rankedBars({...options, mode: {kind: 'hex', theme, site: 'ukcounciltax'}});
        expect(out.table.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr>/g)).toHaveLength(group.rows.length);
        expect(out.svg).not.toMatch(/Rise:|Fall:|No change:/);
        for (const row of group.rows) expect(out.table).toContain(percent(row.own.changePct, 2));
      }
    }
  });

  it('registers only current group downloads in the light theme', async () => {
    vi.stubEnv('BUILD_OG', '1');
    vi.resetModules();
    try {
      const {getStaticPaths} = await import('../src/pages/og/charts/[chart].png');
      expect(getStaticPaths().filter(path => path.params.chart.startsWith('increases-')).map(path => path.params.chart)).toEqual(increaseChartNames().map(name => `${name}-light`));
    } finally { vi.unstubAllEnvs(); }
  });

  it('exports a palette PNG at twice the drawing size', () => {
    const out = rankedBars({...increaseChartOptions('increases-county'), mode: {kind: 'hex', theme: 'light', site: 'ukcounciltax'}});
    const png = chartPng('increases-county', 'light');
    expect(png.readUInt32BE(16)).toBe(out.width*2);
    expect(png.readUInt32BE(20)).toBe(Math.round(out.height*2));
    expect(png[25]).toBe(3);
  }, 60_000);
});
