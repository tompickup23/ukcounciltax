import edition from '../../data/pilots/budget-freeze-model.json';
/** Exact arithmetic for the opt-in C2 pilot. One unit is GBP 0.0001. */
export const FREEZE_YEAR = edition.year;
const yearText = FREEZE_YEAR.replace('-', '/');
export const FREEZE_MODEL = 'budget-freeze 0.1';
export const FREEZE_ASSUMPTIONS = [
  `This is a user requested scenario for ${yearText}, not an actual council deficit or an adopted budget.`,
  'Only this council\'s own Band D charge changes. Parish and other charging bodies stay outside the exercise.',
  'The current published tax base stays fixed. It is measured in Band D equivalents, not households.',
  'Grants, reserves, other financing and the adjustments between service spending and revenue expenditure stay fixed.',
  'Net-income and zero service groups, education and public health stay fixed in this pilot.',
  'Service figures are net of fees, charges and transfers and exclude NHS-funded expenditure. Changes do not establish achievable savings, service outcomes or compliance with statutory duties.',
  'The control limits are prototype limits, not legal limits. No future year, fees or demand changes are modelled.',
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
  rule: 'district' | 'ordinary-social-care';
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

/** Guidance for the two explicitly mapped pilot authorities and this edition only. */
export function referendumTriggered(rule: FreezeBaseline['rule'], prior: bigint, selected: bigint): boolean {
  if (prior <= 0n || selected < 0n) throw new Error('Invalid referendum comparison.');
  const rise = selected - prior;
  if (rule === 'district') return rise * 100n >= prior * 3n && rise > 500n;
  if (rule === 'ordinary-social-care') return rise * 100n >= prior * 5n;
  throw new Error('Unmapped referendum rule.');
}

export function initialFreezeInputs(baseline: FreezeBaseline, frozen = true): FreezeInputs {
  return {
    ownPounds: inputPounds(frozen ? baseline.priorOwnPence : baseline.ownPence),
    servicePounds: Object.fromEntries(baseline.services.filter(s => s.editable).map(s => [s.id, inputPounds(s.pence)])),
  };
}

export function calculateFreeze(baseline: FreezeBaseline, inputs: FreezeInputs) {
  if (baseline.year !== FREEZE_YEAR) throw new Error(`The pilot is pinned to ${yearText}.`);
  const current = integer(baseline.ownPence, true);
  const prior = integer(baseline.priorOwnPence, true);
  const base = integer(baseline.taxBaseHundredths, true);
  const selected = parsePence(inputs.ownPounds);
  if (selected > current * 2n) throw new Error('The tax amount exceeds this prototype\'s range.');
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
    if (chosen > published * 2n) throw new Error(`${service.label}: the amount exceeds this prototype's range.`);
    return { id: service.id, selectedPence: chosen, deltaUnits: (chosen - published) * 100n };
  });
  const spendingChange = changes.reduce((sum, s) => sum + s.deltaUnits, 0n);
  const financingChange = (selected - current) * base;
  const remaining = spendingChange - financingChange;
  return {
    changes, spendingChange, financingChange, remaining,
    status: remaining === 0n ? 'balanced' : remaining > 0n ? 'shortfall' : 'surplus',
    referendum: referendumTriggered(baseline.rule, prior, selected),
  };
}

export function freezeSummary(baseline: FreezeBaseline, inputs: FreezeInputs, sources: string[]): string {
  const result = calculateFreeze(baseline, inputs);
  return [
    `User requested scenario | ${FREEZE_MODEL}`,
    `${baseline.name} (${baseline.gss}), ${yearText}`,
    `Previous own Band D: £${inputPounds(baseline.priorOwnPence)}; fixed current tax base: ${inputPounds(baseline.taxBaseHundredths)} Band D equivalents`,
    `Own Band D selected: £${inputPounds(parsePence(inputs.ownPounds))}; published: £${inputPounds(baseline.ownPence)}`,
    ...result.changes.filter(s => s.deltaUnits !== 0n).map(change => {
      const service = baseline.services.find(s => s.id === change.id)!;
      return `${service.label}: selected £${inputPounds(change.selectedPence)}; change £${exactPounds(change.deltaUnits)}`;
    }),
    `Spending change: £${exactPounds(result.spendingChange)}`,
    `Financing change: £${exactPounds(result.financingChange)}`,
    `Remaining difference: £${exactPounds(result.remaining)} (${result.status})`,
    'Formula: remaining difference = spending change minus (selected own Band D minus published own Band D) times the fixed tax base.',
    `Referendum trigger under the mapped ${yearText} rule: ${result.referendum ? 'reached' : 'not reached'}. This is not a legal feasibility assessment.`,
    ...FREEZE_ASSUMPTIONS,
    ...(baseline.sourceWarnings ?? []),
    'Displayed money rounds to pennies; this summary preserves four decimal places. Zero is tested before rounding.',
    'Sources:', ...sources,
  ].join('\n');
}
