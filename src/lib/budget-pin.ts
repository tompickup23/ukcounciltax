import {CURRENT_YEAR, startYear, yearLabel} from './council-tax';

/**
 * The one line the set the budget pages add once the council tax pages lead with
 * a later year than their budget edition (C6). Null while the two years agree,
 * which they do with the files held on 15 November 2026, so nothing renders.
 * The wording is in the C6 pull request for Tom to confirm.
 */
export function pinnedBudgetLine(editionYear: string, councilTaxYear: string = CURRENT_YEAR): string | null {
  if (editionYear >= councilTaxYear) return null;
  return `These budget figures are for ${yearLabel(editionYear)}. Council budgets for ${yearLabel(councilTaxYear)} follow MHCLG's revenue account (RA) budget release, expected in June ${startYear(councilTaxYear)}.`;
}
