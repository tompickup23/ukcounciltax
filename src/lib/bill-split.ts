/**
 * Calculations of published local bill figures: the share of each 100 pounds
 * by charging body, and an annual band charge divided by 52. Both are
 * calculations of published figures, never published figures themselves.
 * Only components and bands the schedule prints are used. Nothing is derived
 * by band ratio, apportioned or carried forward.
 */
import type {ChargeKind, LocalBill} from './local-bill';
import {resolveBill} from './local-bill';
import {BANDS} from './council-tax';

/** Shares are rounded to this many decimal places. */
export const SHARE_PLACES = 2;
/** Largest gap between the sum of the rounded shares and 100, for n parts. */
export const shareTolerance = (parts: number) => parts * 0.5 * 10 ** -SHARE_PLACES;

export const KIND_LABEL: Record<ChargeKind, string> = {
  billing: 'Borough or district council',
  county: 'County council',
  police: 'Police',
  fire: 'Fire and rescue',
  mayoral: 'Mayoral or combined authority',
  parish: 'Parish or town council',
  'adult-social-care': 'Adult social care',
  'special-expense': 'Special expenses',
};

export interface ShareRow {id: string; kind: ChargeKind; label: string; name: string; pence: number; share: number}

const round = (value: number, places: number) => Math.round(value * 10 ** places) / 10 ** places;

/** Each published component as a share of 100 pounds of the published total for one locality and band. */
export function shareSplit(bill: LocalBill, localityId: string, band: string): {total: number; rows: ShareRow[]} {
  const {parts, total} = resolveBill(bill, localityId, band);
  if (!(total > 0)) throw new Error('A published total is needed before a share can be calculated.');
  const rows = parts.map((p) => ({
    id: p.id,
    kind: p.kind as ChargeKind,
    label: p.kind === 'billing' && /borough/i.test(p.name) ? 'Borough council' : KIND_LABEL[p.kind as ChargeKind],
    name: p.name,
    pence: p.pence,
    share: round((p.pence / total) * 100, SHARE_PLACES),
  }));
  return {total, rows};
}

/** Annual pence divided by 52, rounded to the nearest penny. */
export function weeklyPence(annualPence: number): number {
  if (!Number.isSafeInteger(annualPence) || annualPence < 0) throw new Error('A published annual charge is needed.');
  return Math.round(annualPence / 52);
}

/** Weekly figures for the bands the locality's published schedule prints, in band order. */
export function weeklyByBand(bill: LocalBill, localityId: string): {band: string; annualPence: number; weeklyPence: number}[] {
  const locality = bill.localities.find((l) => l.id === localityId);
  if (!locality) throw new Error('Confirm a published locality before calculating.');
  return BANDS.filter((band) => Number.isSafeInteger(locality.totalsPence[band])).map((band) => {
    const annualPence = resolveBill(bill, localityId, band).total;
    return {band, annualPence, weeklyPence: weeklyPence(annualPence)};
  });
}

export const formatShare = (share: number) => share.toFixed(SHARE_PLACES);

/** The calculation sentence shown beside a share. */
export function shareSentence(row: ShareRow, total: number, money: (pence: number) => string): string {
  return `${row.label}: ${formatShare(row.share)} of every 100 pounds, that is the ${row.name} charge of ${money(row.pence)} divided by the total of ${money(total)}, times 100.`;
}

export const ROUNDING_NOTE = `Shares are rounded to ${SHARE_PLACES} decimal places, so the rounded shares can add up to slightly more or less than 100.`;
export const WEEKLY_NOTE = 'Calculation of the published figure: the published annual band charge divided by 52, rounded to the nearest penny. Bills are paid in ten or twelve monthly instalments, not weekly.';
