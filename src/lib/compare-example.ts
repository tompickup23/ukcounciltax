/**
 * The compare page's worked example (W7): the pair a reader sees before choosing,
 * labelled as an example on the page. Two shire districts, the current year, Band D.
 * Build time only; the browser reads the same pair from the page's data block.
 */
import {CURRENT_YEAR, YEARS} from './council-tax';
import {taxRows, taxSources} from './tax-view-data';
import {compareTax, type TaxBand} from './tax-view';

export const COMPARE_EXAMPLE = {a: 'burnley', b: 'pendle', band: 'D' as TaxBand};

export function compareExample() {
  const checked = compareTax(taxRows(), {...COMPARE_EXAMPLE, year: CURRENT_YEAR}, YEARS);
  if (!checked.ok) throw new Error(`The compare example is not a valid comparison: ${checked.message}`);
  return {...checked, source: taxSources()[CURRENT_YEAR]};
}

/** The example drawings' PNG paths, in the existing /og/charts/ family. */
export const comparePng = (chart: 'band' | 'bands') => `/og/charts/compare/example-${chart}-light.png`;
