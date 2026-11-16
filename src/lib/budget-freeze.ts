import edition from '../../data/pilots/budget-freeze-model.json' with {type:'json'};
import { formatMoney } from './money';
// Only the principles: the full referendum file carries every authority's mapping and would bloat the page script.
import referendum from '../../data/pilots/budget-freeze-principles.json' with {type:'json'};
const {principles} = referendum;
/** Exact arithmetic for the C2 budget exercise. One unit is GBP 0.0001. */
export const FREEZE_YEAR = edition.year;
export const FREEZE_YEAR_TEXT = FREEZE_YEAR.replace('-', '/');
export const FREEZE_MODEL = 'budget-freeze 0.2';
export const FREEZE_ASSUMPTIONS = [
  `This is a user requested scenario for ${FREEZE_YEAR_TEXT}, not an actual council deficit or an adopted budget.`,
  'Only this council\'s own Band D charge changes. Parish and other charging bodies stay outside the exercise.',
  'The current published tax base stays fixed. It is measured in Band D equivalents, not households.',
  'Grants, reserves, other financing and the adjustments between service spending and revenue expenditure stay fixed.',
  'Net-income and zero service groups, education and public health stay fixed in this exercise.',
  'Service figures are net of fees, charges and transfers and exclude NHS-funded expenditure. Changes do not establish achievable savings, service outcomes or compliance with statutory duties.',
  'The control range is for exploration, not a forecast, a legal limit or a deliverable budget. No future year, fees or demand changes are modelled.',
] as const;

export interface FreezeService {
  id: string;
  label: string;
  line: number;
  pence: string;
  editable: boolean;
  heldReason: string | null;
}
export interface FreezeBaseline {
  gss: string;
  name: string;
  year: string;
  ownPence: string;
  priorOwnPence: string;
  taxBaseHundredths: string;
  rule: keyof typeof principles;
  services: FreezeService[];
  sourceWarnings?: string[];
}
export interface FreezeInputs { ownPounds: string; servicePounds: Record<string, string> }

/** Accept decimal text only. Blank, exponent notation and extra precision fail. */
export function parsePence(value: string): bigint {
  if (typeof value !== 'string' || !/^\d{1,13}(?:\.\d{1,2})?$/.test(value.trim())) {
    throw new Error('Enter a non-negative amount in pounds with at most two decimal places. Blank is not zero.');
  }
  const [whole, fraction = ''] = value.trim().split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}
function integer(value: string, positive = false): bigint {
  if (typeof value !== 'string' || !/^-?\d{1,18}$/.test(value)) throw new Error('Missing or invalid pinned input.');
  const result = BigInt(value);
  if (positive && result <= 0n) throw new Error('A positive pinned input is required.');
  return result;
}
export function inputPounds(pence: string | bigint): string {
  const value = BigInt(pence);
  if (value < 0n) throw new Error('An editable amount cannot be negative.');
  return `${value / 100n}.${String(value % 100n).padStart(2, '0')}`;
}
export function money(units: bigint): string {
  const absolute = units < 0n ? -units : units;
  if (absolute > 0n && absolute < 100n) return `${units < 0n ? 'minus ' : ''}less than £0.01`;
  const pennies = (absolute + 50n) / 100n;
  return `${units < 0n ? '−' : ''}£${(pennies / 100n).toLocaleString('en-GB')}.${String(pennies % 100n).padStart(2, '0')}`;
}
export function exactPounds(units: bigint): string {
  const absolute = units < 0n ? -units : units;
  return `${units < 0n ? '-' : ''}${absolute / 10000n}.${String(absolute % 10000n).padStart(4, '0')}`;
}

/** Only rules reconstructed from the pinned report are executable. */
export function referendumTriggered(rule: FreezeBaseline['rule'], prior: bigint, selected: bigint): boolean {
  if (prior <= 0n || selected < 0n) throw new Error('Invalid referendum comparison.');
  const principle = principles[rule];
  if (!principle) throw new Error('Unmapped referendum rule.');
  if (principle.percentageComparison !== 'greater-than-or-equal') throw new Error('Unsupported percentage comparison.');
  const rise = selected-prior;
  const percentage = rise * 10000n >= prior * BigInt(principle.percentageBasisPoints);
  if (principle.join === 'single') return percentage;
  if (principle.join === 'AND' && principle.poundComparison === 'greater-than' && principle.poundPence !== null) return percentage && rise > BigInt(principle.poundPence);
  throw new Error('Unsupported referendum comparison.');
}
export function referendumExplanation(rule: FreezeBaseline['rule']): string {
  const principle = principles[rule];
  if (principle.join === 'AND') return `Under the ${FREEZE_YEAR_TEXT} rule for this council, a referendum would be needed for a rise that is both at least ${principle.percentageBasisPoints / 100}% and more than £${inputPounds(principle.poundPence!)} over the previous own charge.`;
  return `Under the ${FREEZE_YEAR_TEXT} rule for this council, the rise that would need a referendum is at least ${principle.percentageBasisPoints / 100}% over the previous own charge: ${principle.ascBasisPoints / 100}% for adult social care and ${principle.otherBasisPoints / 100}% for other expenditure.`;
}

export function initialFreezeInputs(baseline: FreezeBaseline, frozen = true): FreezeInputs {
  return {
    ownPounds: inputPounds(frozen ? baseline.priorOwnPence : baseline.ownPence),
    servicePounds: Object.fromEntries(baseline.services.filter(s => s.editable).map(s => [s.id, inputPounds(s.pence)])),
  };
}

export function calculateFreeze(baseline: FreezeBaseline, inputs: FreezeInputs) {
  if (baseline.year !== FREEZE_YEAR) throw new Error(`The exercise is pinned to ${FREEZE_YEAR_TEXT}.`);
  const current = integer(baseline.ownPence, true);
  const prior = integer(baseline.priorOwnPence, true);
  const base = integer(baseline.taxBaseHundredths, true);
  const selected = parsePence(inputs.ownPounds);
  if (selected > current * 2n) throw new Error('The tax amount exceeds this exploration range.');
  const ids = baseline.services.map(s => s.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate service input.');
  const editable = baseline.services.filter(s => s.editable);
  if (Object.keys(inputs.servicePounds).length !== editable.length || editable.some(s => !(s.id in inputs.servicePounds))) {
    throw new Error('Supply exactly the editable service amounts. Held groups cannot be changed.');
  }
  const changes = baseline.services.map(service => {
    const published = integer(service.pence);
    if (!service.editable) return { id: service.id, selectedPence: published, deltaUnits: 0n };
    if (published <= 0n || ['edutot', 'phtot'].includes(service.id)) throw new Error('This service group must stay fixed.');
    const chosen = parsePence(inputs.servicePounds[service.id]);
    if (chosen > published * 2n) throw new Error(`${service.label}: the amount exceeds this exploration range.`);
    return { id: service.id, selectedPence: chosen, deltaUnits: (chosen-published) * 100n };
  });
  const spendingChange = changes.reduce((sum, s) => sum + s.deltaUnits, 0n);
  const financingChange = (selected-current) * base;
  const remaining = spendingChange-financingChange;
  return {
    changes, spendingChange, financingChange, remaining,
    status: (remaining === 0n ? 'balanced' : remaining > 0n ? 'shortfall' : 'surplus') as 'balanced' | 'shortfall' | 'surplus',
    referendum: referendumTriggered(baseline.rule, prior, selected),
  };
}

/**
 * The copied and printed scenario (W3). Published service figures print in whole
 * pounds, as their RA source prints them in £ thousand; the user's own choices and
 * the changes print to pennies, the precision of the entry. Only the financing
 * change and the remaining difference carry sub-penny parts (a pence change times a
 * tax base in hundredths), so the four decimal place values appear once, in a
 * labelled calculation line.
 */
export function freezeSummary(baseline: FreezeBaseline, inputs: FreezeInputs, sources: string[]): string {
  const result = calculateFreeze(baseline, inputs);
  const pounds = (pence: bigint) => money(pence * 100n);
  const publishedService = (pence: string) => formatMoney(Number(BigInt(pence) / 100000n), {unit: 'thousands'});
  return [
    `User requested scenario | ${FREEZE_MODEL}`,
    `${baseline.name} (${baseline.gss}), ${FREEZE_YEAR_TEXT}`,
    `Previous own Band D: ${pounds(BigInt(baseline.priorOwnPence))}; fixed current tax base: ${inputPounds(baseline.taxBaseHundredths)} Band D equivalents`,
    `Own Band D selected: ${pounds(parsePence(inputs.ownPounds))}; published: ${pounds(BigInt(baseline.ownPence))}`,
    ...result.changes.filter(s => s.deltaUnits !== 0n).map(change => {
      const service = baseline.services.find(s => s.id === change.id)!;
      return `${service.label}: selected ${pounds(change.selectedPence)}; published ${publishedService(service.pence)}; change ${money(change.deltaUnits)}`;
    }),
    `Spending change: ${money(result.spendingChange)}`,
    `Financing change: ${money(result.financingChange)}`,
    `Remaining difference: ${money(result.remaining)} (${result.status})`,
    `Exact calculation in pounds, four decimal places: financing change ${exactPounds(result.financingChange)}; remaining difference ${exactPounds(result.remaining)}.`,
    'Formula: remaining difference = spending change minus (selected own Band D minus published own Band D) times the fixed tax base.',
    `The rise that would need a referendum under the ${FREEZE_YEAR_TEXT} rule: ${result.referendum ? 'reached' : 'not reached'}. This is not a legal feasibility assessment.`,
    ...FREEZE_ASSUMPTIONS,
    ...(baseline.sourceWarnings ?? []),
    'Published service figures are whole pounds, printed in £ thousand in the RA return. Your choices and the changes are shown to pennies; the financing change and remaining difference also appear to four decimal places above. Zero is tested before rounding.',
    'Sources:', ...sources,
  ].join('\n');
}
