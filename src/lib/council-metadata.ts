import {moneyPence} from './tax-view';
import {CURRENT_YEAR, NEXT_YEAR, PREVIOUS_YEAR, yearLabel} from './council-tax';

// Review of the pinned source extracts, not a claim of a fresh upstream publication.
export const EXTRACT_CHECKED = '6 October 2026';
export const NEXT_EDITION_STATUS = `${yearLabel(NEXT_YEAR)} charges: not yet published in the source editions held here.`;
const YEAR = yearLabel(CURRENT_YEAR);
const PREVIOUS = yearLabel(PREVIOUS_YEAR);

export type CouncilNation = 'England' | 'Scotland' | 'Wales';

interface CouncilMetadata {
  name: string;
  currentPence: number;
  previousPence: number | null;
  basis: string;
  wholePounds?: boolean;
  percentageDigits?: number;
  nation?: CouncilNation;
}

function councilTitle(name: string, nation: CouncilNation): string {
  if (nation === 'Scotland') {
    return `${name} council tax ${YEAR} (council tax only, water and sewerage excluded)`;
  }
  if (nation === 'Wales') {
    return `${name} council tax Band D ${YEAR}, Wales`;
  }
  return `${name} council tax bands and charges ${YEAR}`;
}

export function councilMetadata({
  name,
  currentPence,
  previousPence,
  basis,
  wholePounds = false,
  percentageDigits = 1,
  nation = 'England',
}: CouncilMetadata) {
  const amount = wholePounds
    ? new Intl.NumberFormat('en-GB', {style:'currency', currency:'GBP', maximumFractionDigits:0}).format(currentPence / 100)
    : moneyPence(currentPence);
  const difference = previousPence === null ? null : currentPence - previousPence;
  const change = difference === null || previousPence === null || previousPence <= 0
    ? 'Prior-year comparison unavailable.'
    : difference === 0 ? `Unchanged from ${PREVIOUS} on the same basis.`
    : `${difference > 0 ? 'Up' : 'Down'} ${moneyPence(Math.abs(difference))} (${(Math.abs(difference) / previousPence * 100).toFixed(percentageDigits)}%) from ${PREVIOUS} on the same basis.`;
  return {
    title: councilTitle(name, nation),
    description: `Band D is ${amount} for ${YEAR}; ${basis}. ${change}`,
  };
}
