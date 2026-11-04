import {moneyPence} from './tax-view';

// Review of the pinned source extracts, not a claim of a fresh upstream publication.
export const EXTRACT_CHECKED = '6 October 2026';
export const NEXT_EDITION_STATUS = '2027/28 charges: not yet published in the source editions held here.';

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
    return `${name} council tax 2026/27 (council tax only, water and sewerage excluded)`;
  }
  if (nation === 'Wales') {
    return `${name} council tax Band D 2026/27, Wales`;
  }
  return `${name} council tax bands and charges 2026/27`;
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
    : difference === 0 ? 'Unchanged from 2025/26 on the same basis.'
    : `${difference > 0 ? 'Up' : 'Down'} ${moneyPence(Math.abs(difference))} (${(Math.abs(difference) / previousPence * 100).toFixed(percentageDigits)}%) from 2025/26 on the same basis.`;
  return {
    title: councilTitle(name, nation),
    description: `Band D is ${amount} for 2026/27; ${basis}. ${change}`,
  };
}
