import type {Authority} from './council-tax';
import {national} from './national-data';
type Part = typeof national.components[string]['parts'][number];
/** Only omit a class's inapplicable row when the source confirms it is empty. */
export function profilePrecepts(classCode: Authority['classCode'], parts: Part[]): Part[] {
  return parts.filter(part => {
    const drop = part.kind === 'county' ? ['UA', 'MD'].includes(classCode) : ['ILB', 'OLB'].includes(classCode);
    if (drop && (part.bandDPence !== 0 || part.name !== null)) throw new Error(`A3 stop: cannot drop ${classCode}/${part.kind} with a charge or named body`);
    return !drop;
  });
}
