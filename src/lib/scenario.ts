/** Illustrations only. Source charges never change when assumptions change. */
export const MODEL_VERSION = '1.0';
export interface ScenarioYear { year: number; annualPence: number; increasePence: number; cumulativePence: number; extraPence: number }
export function projectCharge(baselinePence: number, rate: number, years: number): ScenarioYear[] {
  if (!Number.isSafeInteger(baselinePence) || baselinePence <= 0 || baselinePence > 100_000_000) throw new Error('Choose a positive annual amount up to £1,000,000.');
  if (!Number.isFinite(rate) || rate < -50 || rate > 50) throw new Error('Choose an annual change between -50% and 50%.');
  if (!Number.isInteger(years) || years < 1 || years > 10) throw new Error('Choose between one and ten years.');
  let cumulativePence = 0;
  return Array.from({length: years}, (_, i) => {
    const year = i + 1;
    const annualPence = Math.round(baselinePence * (1 + rate / 100) ** year);
    cumulativePence += annualPence;
    return {year, annualPence, increasePence: annualPence - baselinePence, cumulativePence, extraPence: cumulativePence - baselinePence * year};
  });
}
export function componentProjection(components: {pence: number; rate: number}[]): {baseline: number; projected: number; change: number; percent: number} {
  if (!components.length) throw new Error('At least one component is required.');
  const baseline = components.reduce((sum, x) => sum + x.pence, 0);
  const projected = components.reduce((sum, x) => sum + projectCharge(x.pence, x.rate, 1)[0].annualPence, 0);
  return {baseline, projected, change: projected - baseline, percent: (projected / baseline - 1) * 100};
}
