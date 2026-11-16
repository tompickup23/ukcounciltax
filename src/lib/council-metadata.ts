import {formatMoney} from './money';
import {moneyPence} from './tax-view';
import {CURRENT_YEAR, PREVIOUS_YEAR, followingYear, yearLabel} from './council-tax';

// Review of the pinned source extracts, not a claim of a fresh upstream publication.
export const EXTRACT_CHECKED = '6 October 2026';
/**
 * The status line for the year after a page's own year. Scottish and Welsh pages
 * pass their own edition's year, which can lag England's after the switch (C6).
 */
export const nextEditionStatus = (year: string = CURRENT_YEAR) => `${yearLabel(followingYear(year))} charges: not yet published in the source editions held here.`;
export const NEXT_EDITION_STATUS = nextEditionStatus();

export type CouncilNation = 'England' | 'Scotland' | 'Wales';

interface CouncilMetadata {
  name: string;
  currentPence: number;
  previousPence: number | null;
  basis: string;
  wholePounds?: boolean;
  percentageDigits?: number;
  nation?: CouncilNation;
  /** The page's own year and the year it is compared with; Scotland and Wales pass their editions' (C6). */
  year?: string;
  previousYear?: string;
}

function councilTitle(name: string, nation: CouncilNation, YEAR: string): string {
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
  year = CURRENT_YEAR,
  previousYear = PREVIOUS_YEAR,
}: CouncilMetadata) {
  const YEAR = yearLabel(year), PREVIOUS = yearLabel(previousYear);
  const amount = wholePounds
    ? formatMoney(currentPence, {unit: 'pence', style: 'whole'})
    : moneyPence(currentPence);
  const difference = previousPence === null ? null : currentPence - previousPence;
  const change = difference === null || previousPence === null || previousPence <= 0
    ? 'Prior-year comparison unavailable.'
    : difference === 0 ? `Unchanged from ${PREVIOUS} on the same basis.`
    : `${difference > 0 ? 'Up' : 'Down'} ${moneyPence(Math.abs(difference))} (${(Math.abs(difference) / previousPence * 100).toFixed(percentageDigits)}%) from ${PREVIOUS} on the same basis.`;
  return {
    title: councilTitle(name, nation, YEAR),
    description: `Band D is ${amount} for ${YEAR}; ${basis}. ${change}`,
  };
}
