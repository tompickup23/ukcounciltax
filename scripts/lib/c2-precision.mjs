/** Closed bounds: the pinned RA files state units but no tie rounding rule. */
const absolute = n => n < 0n ? -n : n;
export const RA_COMPONENT_BOUND_PENCE = 50000n;
// Two RA half thousand pound bounds plus half a pound for printed own.
export const OWN_BOUND_PENCE = RA_COMPONENT_BOUND_PENCE * 2n + 50n;
export const withinRaPrecision = difference => absolute(difference) <= RA_COMPONENT_BOUND_PENCE;
export const withinOwnPrecision = difference => absolute(difference) <= OWN_BOUND_PENCE;
export const withinTable10Precision = difference => absolute(difference) <= 100n;
// Half a penny times the base plus half a pound, in GBP 0.0001 units.
export const withinTaxJoinPrecision = (differenceUnits, baseHundredths) => absolute(differenceUnits) <= baseHundredths / 2n + 5000n;
export function assertOwnPrecision(totalDifference, parishDifference, ownDifference, label) {
  if (withinRaPrecision(totalDifference) && withinRaPrecision(parishDifference) && !withinOwnPrecision(ownDifference)) {
    throw new Error(`C2 fixture error: own requirement exceeds derived printed precision for ${label}`);
  }
}
