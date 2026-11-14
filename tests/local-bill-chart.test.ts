import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {localBills} from '../src/lib/local-bill-data';
import {localBillChart, localBillChartOptions, SCHEDULE_PAGES} from '../src/lib/local-bill-chart';
import {resolveBill} from '../src/lib/local-bill';
import {moneyPence} from '../src/lib/tax-view';
import {BANDS} from '../src/lib/council-tax';

const bill = localBills[0];
const dashes = /[–—]/;

describe('the local bill as a bar (NV10)', () => {
  it('draws every published locality and band from the schedule, reconciled to its total', () => {
    let drawn = 0;
    for (const locality of bill.localities) for (const band of BANDS) {
      const {parts, total} = resolveBill(bill, locality.id, band);
      const out = localBillChart(bill, locality.id, band);
      expect(out.svg).toContain('class="ek-chart');
      expect(out.svg).toContain(`data-ek-total="${total / 100}"`);
      expect((out.svg.match(/data-ek-part=/g) ?? []).length).toBe(parts.length);
      for (const part of parts) expect(out.table).toContain(moneyPence(part.pence));
      expect(out.table).toContain(moneyPence(total));
      expect(out.svg).not.toMatch(dashes);
      expect(out.alt).not.toMatch(dashes);
      drawn++;
    }
    expect(drawn).toBe(bill.localities.length * BANDS.length);
  });

  it('names a parish part as a precept and leaves it out of the unparished area', () => {
    expect(localBillChartOptions(bill, 'unparished', 'D').parts).toEqual(['local.billing', 'local.county', 'local.police', 'local.fire']);
    const padiham = localBillChart(bill, 'padiham', 'D');
    expect(padiham.table).toContain('Padiham parish precept');
    expect(padiham.title).toBe('Who charges a Band D bill in Padiham, Burnley, 2026/27');
  });

  it('carries the schedule as its source, with the page read from that file', () => {
    const out = localBillChart(bill, 'cliviger', 'A');
    expect(out.caption).toContain('Burnley Borough Council');
    expect(out.caption).toContain('Council Tax Charges 2026/27');
    expect(out.caption).toContain(SCHEDULE_PAGES[bill.source.sha256].page);
  });

  it('refuses a schedule whose page has not been read, and a bill that does not reconcile', () => {
    const unread = {...bill, source: {...bill.source, sha256: 'not-a-read-file'}};
    expect(() => localBillChart(unread, 'unparished', 'D')).toThrow(/page has not been read/);
    const broken = structuredClone(bill);
    broken.components[0].bandsPence.D += 1;
    expect(() => localBillChart(broken, 'unparished', 'D')).toThrow(/do not reconcile/);
  });

  it('is drawn by the tool and on the precepts page', () => {
    const tool = readFileSync(join(process.cwd(), 'src/components/LocalBillTool.astro'), 'utf8');
    expect(tool).toContain('data-bill-chart');
    expect(tool).toContain('localBillChart(bill');
    expect(readFileSync(join(process.cwd(), 'src/pages/precepts.astro'), 'utf8')).toContain('chart="home-bill"');
    expect(readFileSync(join(process.cwd(), 'src/lib/local-bill-chart.ts'), 'utf8')).not.toMatch(dashes);
  });
});
