import {pounds, tenInstalments, twelveInstalments} from './council-tax';
/** Missing published charges remain unavailable in all three columns. */
export function profileBandCells(annual: number | null | undefined): string[] {
  return annual == null ? ['Unavailable', 'Unavailable', 'Unavailable']
    : [pounds(annual), pounds(tenInstalments(annual)), pounds(twelveInstalments(annual))];
}
