import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {localBills} from '../src/lib/local-bill-data';
import {shareSplit, shareTolerance, weeklyByBand, weeklyPence, shareSentence, formatShare, ROUNDING_NOTE, WEEKLY_NOTE, SHARE_PLACES} from '../src/lib/bill-split';
import {BANDS} from '../src/lib/council-tax';
import {moneyPence} from '../src/lib/tax-view';

const bill = localBills[0];
const dashes = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]|&(?:ndash|mdash);|&#(?:8211|8212|x201[34]);|${[' ', '-', ' '].join('')}`, 'i');

describe('share of every 100 pounds', () => {
  it('uses every published component and sums to 100 within the stated rounding', () => {
    for (const b of localBills) for (const locality of b.localities) for (const band of Object.keys(locality.totalsPence)) {
      const {rows, total} = shareSplit(b, locality.id, band);
      expect(rows.reduce((s, r) => s + r.pence, 0)).toBe(total);
      const sum = rows.reduce((s, r) => s + r.share, 0);
      expect(Math.abs(sum-100)).toBeLessThanOrEqual(shareTolerance(rows.length) + 1e-9);
    }
  });
  it('divides each published Band D charge by the published total', () => {
    const {rows, total} = shareSplit(bill, 'unparished', 'D');
    expect(total).toBe(bill.localities.find((l) => l.id === 'unparished')!.totalsPence.D);
    expect(rows.map((r) => r.id)).toEqual(bill.components.map((c) => c.id));
    for (const row of rows) {
      const published = bill.components.find((c) => c.id === row.id)!.bandsPence.D;
      expect(row.pence).toBe(published);
      expect(row.share).toBe(Math.round((published / total) * 100 * 10 ** SHARE_PLACES) / 10 ** SHARE_PLACES);
    }
  });
  it('shows the calculation beside each share', () => {
    const {rows, total} = shareSplit(bill, 'unparished', 'D');
    const police = rows.find((r) => r.kind === 'police')!;
    const text = shareSentence(police, total, moneyPence);
    expect(text).toContain(`${formatShare(police.share)} of every 100 pounds`);
    expect(text).toContain(`divided by the total of ${moneyPence(total)}`);
  });
  it('refuses a band the schedule does not print', () => {
    expect(() => shareSplit(bill, 'unparished', 'I')).toThrow();
  });
});

describe('weekly figure per band', () => {
  it('is the published annual band charge divided by 52, to the penny', () => {
    const locality = bill.localities.find((l) => l.id === 'unparished')!;
    const rows = weeklyByBand(bill, 'unparished');
    expect(rows.map((r) => r.band)).toEqual(BANDS.filter((b) => Number.isSafeInteger(locality.totalsPence[b])));
    for (const r of rows) {
      expect(r.annualPence).toBe(locality.totalsPence[r.band]);
      expect(r.weeklyPence).toBe(Math.round(locality.totalsPence[r.band] / 52));
    }
  });
  it('lists only bands the schedule prints and never derives one', () => {
    const copy = structuredClone(bill);
    const locality = copy.localities.find((l) => l.id === 'unparished')!;
    delete (locality.totalsPence as Record<string, number>).H;
    expect(weeklyByBand(copy, 'unparished').map((r) => r.band)).not.toContain('H');
    expect(() => weeklyPence(Number.NaN)).toThrow();
    expect(() => weeklyPence(-1)).toThrow();
  });
  it('says bills are paid monthly, not weekly', () => {
    expect(WEEKLY_NOTE).toContain('ten or twelve monthly instalments, not weekly');
    expect(WEEKLY_NOTE).toContain('divided by 52');
  });
});

describe('no dashes in what people read', () => {
  it('keeps calculation text and the new files free of dashes', () => {
    const {rows, total} = shareSplit(bill, 'unparished', 'D');
    const texts = [ROUNDING_NOTE, WEEKLY_NOTE, ...rows.map((r) => shareSentence(r, total, moneyPence).replace(r.name, ''))];
    for (const t of texts) expect(t).not.toMatch(dashes);
    for (const file of ['src/components/BillSplit.astro', 'src/lib/bill-split.ts', 'src/pages/precepts.astro']) {
      expect(readFileSync(join(process.cwd(), file), 'utf8')).not.toMatch(dashes);
    }
  });
});
