import {describe, expect, it} from 'vitest';
import {taxRows, taxSources} from '../src/lib/tax-view-data';
import {allBandsHeld, bandChart, pairedBandsChart, PAIR_COLOURS} from '../src/lib/compare-charts';
import {comparisonWords, compareTax, TAX_BANDS, type TaxRow} from '../src/lib/tax-view';
import {COMPARE_EXAMPLE, compareExample} from '../src/lib/compare-example';
import {CURRENT_YEAR, YEARS} from '../src/lib/council-tax';

const rows = taxRows();
const sources = taxSources();
const row = (slug: string) => rows.find(r => r.slug === slug)!;
const values = (svg: string, slug: string) => [...svg.matchAll(new RegExp(`data-value="([^"]+)" data-council="${slug}" data-band="([A-H])"`, 'g'))].map(m => [m[2], Number(m[1])]);

describe('compare drawings (W7)', () => {
  it('draw the published pence of both councils and nothing else', () => {
    const [a, b] = [row('camden'), row('barnet')];
    const out = pairedBandsChart(a, b, '2025-26', sources['2025-26']);
    for (const r of [a, b]) expect(values(out.svg, r.slug)).toEqual(TAX_BANDS.map(band => [band, r.years['2025-26'][band]! / 100]));
    expect(out.svg.match(/data-ek-bar=""/g)).toHaveLength(16);
    expect(out.table).toContain('<th');
    expect(out.caption).toContain('MHCLG');
    expect(out.caption).toContain('2025/26');
    // The title is the figure's caption on the page, not text inside the drawing.
    expect(out.titleHtml).toBe('Bands A to H, 2025/26');
    const band = bandChart(a, b, 'H', '2025-26', sources['2025-26']);
    expect(values(band.svg, 'camden')).toEqual([['H', a.years['2025-26'].H! / 100]]);
    expect(band.svg.match(/data-ek-bar=""/g)).toHaveLength(2);
  });

  it('paint each council in one gated series colour in both drawings', () => {
    const [a, b] = [row('burnley'), row('pendle')];
    for (const out of [bandChart(a, b, 'D', CURRENT_YEAR, sources[CURRENT_YEAR]), pairedBandsChart(a, b, CURRENT_YEAR, sources[CURRENT_YEAR])]) {
      PAIR_COLOURS.forEach((colour, i) => {
        const slug = [a, b][i].slug;
        for (const bar of out.svg.matchAll(new RegExp(`<path[^>]*data-council="${slug}"[^>]*>`, 'g'))) expect(bar[0]).toContain(`var(--${colour})`);
      });
    }
  });

  it('refuse a band a council does not hold rather than draw it as zero', () => {
    const barnsley = row('barnsley');
    expect(barnsley.years['2024-25'].D).toBeUndefined();
    expect(allBandsHeld(barnsley, row('leeds'), '2024-25')).toBe(false);
    expect(() => pairedBandsChart(barnsley, row('leeds'), '2024-25', sources['2024-25'])).toThrow(/Not every band/);
    expect(() => bandChart(barnsley, row('leeds'), 'D', '2024-25', sources['2024-25'])).toThrow(/No published Band D/);
    const fake: TaxRow = {...row('leeds'), years: {...row('leeds').years, [CURRENT_YEAR]: {}}};
    expect(() => bandChart(fake, row('bradford'), 'D', CURRENT_YEAR, sources[CURRENT_YEAR])).toThrow();
  });

  it('the example is a valid same type pair in the current year, worded as the browser words it', () => {
    const example = compareExample();
    expect([example.a.slug, example.b.slug, example.band, example.year]).toEqual([COMPARE_EXAMPLE.a, COMPARE_EXAMPLE.b, COMPARE_EXAMPLE.band, CURRENT_YEAR]);
    const checked = compareTax(rows, {...COMPARE_EXAMPLE, year: CURRENT_YEAR}, YEARS);
    if (!checked.ok) throw new Error(checked.message);
    const words = comparisonWords(checked);
    const gap = Math.abs(checked.differencePence);
    expect(words.percentage).toBe(`${(gap / Math.min(checked.aPence, checked.bPence) * 100).toFixed(2)}% of the lower annual charge`);
    expect(words.heading).toBe(`Band D, ${CURRENT_YEAR.replace('-', '/')}`);
  });
});
