import manifest from '../../data/pilots/budget-freeze-eligibility.json';
import {budgetSetPath, scenarioGamePath} from './paths';
export function budgetSetEntry(gss: string) {
  if (!gss.startsWith('E')) return null;
  const decision = manifest.councils.find(row => row.gss === gss);
  if (!decision) throw new Error(`Missing C2 eligibility: ${gss}`);
  if (decision.slug === 'burnley') return {href: scenarioGamePath(decision.slug), text: decision.reason};
  return {href: decision.eligible ? budgetSetPath(decision.slug) : null, text: decision.eligible ? 'Set the budget yourself' : decision.reason};
}
