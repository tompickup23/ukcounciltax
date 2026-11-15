import manifest from '../../data/pilots/budget-freeze-eligibility.json';
import {budgetSetPath} from './paths';
export function budgetSetEntry(gss: string) {
  const decision = manifest.councils.find(row => row.gss === gss);
  if (!decision) throw new Error(`Missing C2 eligibility: ${gss}`);
  return {href: decision.eligible ? budgetSetPath(decision.slug) : null, text: decision.eligible ? 'Set the budget yourself' : decision.reason};
}
