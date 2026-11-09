/** User requested scenarios only. This module never reads or changes observations. */
export const BUDGET_SCENARIO_MODEL = 'budget-scenario 1.0';
export const SCENARIO_ROUNDING = 'Amounts are calculated from your shares of the fixed total. Any remaining pennies go to the largest fractional remainders, in source order for ties.';
export const SCENARIO_ASSUMPTIONS = [
  "This is your allocation, not the council's budget or an exact household bill.",
  'Services use only the positive service totals; net income headings stay outside the exercise.',
  'The service total is fixed. Moving shares does not model costs, outcomes, ring fenced grants or legal limits.',
  'The Band D area average is fixed and includes average parish precepts; only its division between the listed bodies changes.',
  'Service and Band D allocations are independent; no change in money raised is calculated.',
] as const;

export function allocatePence(totalPence: number, shares: readonly number[]): number[] {
  if (!Number.isSafeInteger(totalPence) || totalPence <= 0) throw new Error('The fixed total must be a positive safe integer in pence.');
  if (!Array.isArray(shares) || !shares.length || Array.from(shares).some(value => !Number.isInteger(value) || value < 0 || value > 100) || shares.reduce((sum,value) => sum+value,0) !== 100) throw new Error('Share exactly 100p using whole pence from 0 to 100.');
  const parts = shares.map((share,index) => {
    const product = totalPence*share;
    if (!Number.isSafeInteger(product)) throw new Error('The allocation exceeds safe integer arithmetic.');
    return {index,pence:Math.floor(product/100),remainder:product%100};
  });
  let remaining = totalPence-parts.reduce((sum,part) => sum+part.pence,0);
  for (const part of [...parts].sort((a,b) => b.remainder-a.remainder || a.index-b.index)) {
    if (!remaining) break;
    part.pence++; remaining--;
  }
  return parts.map(part=>part.pence);
}

/** Validate the complete native input state before calling the pure allocation model. */
export function scenarioShares(values: readonly string[], count: number): number[] {
  if (values.length !== count || !count) throw new Error('The allocation must match every source item.');
  if (Array.from(values).some(value=>typeof value !== 'string' || value.trim() === '')) throw new Error('Enter whole pence from 0 to 100 in every row. Blank is not zero.');
  const shares = values.map(Number);
  if (shares.some(value=>!Number.isInteger(value) || value<0 || value>100)) throw new Error('Enter whole pence from 0 to 100 in every row.');
  return shares;
}
