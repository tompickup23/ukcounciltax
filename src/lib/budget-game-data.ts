import {budget, budgetFor, budgetYear, budgetSource, billSource, budgetMoney, funding, nonRingfencedReserves, observation, services, RESERVES_CAVEAT, REVENUE_RELEASE} from './budget';
import {national} from './national-data';
import {moneyPence} from './tax-view';
import type {GameData, GameRound} from './budget-game';

export function gameData(gss: string, slug: string): GameData | null {
  const {council, county} = budgetFor(gss);
  if (council.status !== 'available') return null;
  const rounds: GameRound[] = [council, ...(county ? [county] : [])].map(body => {
    const rows = services(body);
    const positive = rows.filter(row => row.value !== null && row.value > 0);
    return {
      kind: 'split', title: `Guess the split: ${body.name}${body.class === 'SC' ? ' County Council' : ''}`,
      explanation: 'Share 100p across the positive service headings. The answer is calculated from the sum of positive net current expenditure totals, not total service expenditure or your council tax bill. Net current expenditure is net of sales, fees and charges and excludes NHS-funded spending such as the Better Care Fund.',
      items: positive.map(row => ({label: row.label, value: row.value!, detail: `RA line ${row.line}: ${budgetMoney(row.value)}`})),
      base: positive.reduce((sum, row) => sum + row.value!, 0), source: budgetSource(),
      context: body.values.edutot !== 0 ? [{text: `Most schools spending is paid for by the Dedicated Schools Grant, a ring-fenced government grant: ${budgetMoney(body.values.grantindsg)} in ${budgetYear}. Education is shown as printed, without subtracting this grant. Special schools and alternative provision is RA line 140. SEND spending also sits in other education and transport lines; this return does not total it.`, source: budgetSource('raGrants')}] : [],
      notes: rows.filter(row => row.value !== null && row.value < 0).map(row => `${row.label}: ${budgetMoney(row.value)} net income, RA line ${row.line}. Left out of the guess round.`),
    };
  });
  const bill = national.components[gss];
  const parts = [{label: `${council.name}, including average local precepts`, value: bill.ownWithParishPence}, ...bill.parts.map(part => ({label: `${part.kind === 'county' ? 'County or GLA' : part.kind === 'combined' ? 'Combined authority' : part.kind === 'police' ? 'Police' : 'Fire'}: ${part.name ?? 'No separate precept reported'}`, value: part.bandDPence}))];
  if (bill.areaPence === null || parts.some(part => part.value === null)) throw new Error(`Missing printed Band D component: ${gss}`);
  rounds.push({kind: 'bill', title: 'Your bill: Band D only',
    explanation: `Share 100p of the published ${budgetYear} Band D area average between the charging bodies. Average parish precepts are already in the council line. This is an area average, not an exact address-level bill. Shares are calculated as each printed component divided by the printed area average.`,
    items: parts.filter(part => part.value! > 0).map(part => ({label: part.label, value: part.value!, detail: `Published Band D component: ${moneyPence(part.value!)}`})),
    base: bill.areaPence, source: billSource,
    notes: [`Published Band D area average: ${moneyPence(bill.areaPence)}.`, ...parts.filter(part => part.value === 0).map(part => `${part.label}: £0. A zero separate precept does not mean the service is absent.`), ...(bill.differencePence ? [`The printed components sum to ${Math.abs(bill.differencePence)}p ${bill.differencePence > 0 ? 'more' : 'less'} than the printed total. Both are preserved, so calculated shares may not sum to exactly 100p.`] : []), ...bill.notes.map(note => `MHCLG source note: ${note.text}`)],
  });
  rounds.push({kind: 'funding', title: `Where the money comes from: ${council.name}`,
    explanation: 'Order the funding groups from largest to smallest magnitude. These are calculated by grouping the printed RA financing lines and reversing their signs, except council tax requirement. Add/deduct directions are preserved. Revenue expenditure is a different measure from service expenditure. Equal amounts count in either order.',
    items: funding(council).map(row => {
      if (row.value === null) throw new Error(`Missing funding value: ${gss}`);
      return {label: row.label, value: row.value, detail: `${budgetMoney(Math.abs(row.value))}, ${row.value < 0 ? 'deduct' : row.value > 0 ? 'add' : 'no contribution'}; RA lines ${row.lines.join(', ')}. ${row.method}. Printed inputs: ${row.inputIds.map(id => {const cell = observation(council, id); return `${cell.label} (line ${cell.line}): ${budgetMoney(cell.value)}`;}).join('; ')}.${row.inputIds.includes('ctrtot') && council.notes.raPart1.includes('[note 4]') ? ` MHCLG note 4: ${budget.sourceNotes.raPart1['[note 4]']}` : ''}`};
    }), source: budgetSource(), notes: [
      `Revenue expenditure, RA line 900: ${budgetMoney(council.values.revenuetot)}. The signed contributions sum to this printed figure.`,
      'Council tax requirement includes parish precepts. The funding reserves group includes schools, DSG and public health as well as other earmarked and unallocated reserves.',
      ...['[note 4]', '[note 8]'].filter(note => council.notes.raPart1.includes(note)).map(note => `MHCLG ${note}: ${budget.sourceNotes.raPart1[note]}`),
    ]});
  const reserves = nonRingfencedReserves(council);
  if (reserves.some(row => row.value === null)) throw new Error(`Missing reserve balance: ${gss}`);
  rounds.push({kind: 'reserves', title: `Reserves: ${council.name}`,
    explanation: `Does the council plan to draw on non-ringfenced reserves, add to them, or neither in ${budgetYear}? Choose a direction and a size band. Only other earmarked and unallocated reserves are included. Size bands are game answer choices, not estimates.`,
    items: reserves.map(row => ({label: row.period === 'strt' ? 'Start of year' : 'End of year', value: row.value!, detail: `Calculated total: ${budgetMoney(row.value)}, RA Part 2 lines 1015 and 1016. Printed other earmarked reserves: ${budgetMoney(council.values[`resoth_${row.period}`])}; printed unallocated reserves: ${budgetMoney(council.values[`resunall_${row.period}`])}.`})),
    source: budgetSource('raPart2'), notes: [], context: [{text: `MHCLG cautions: “${RESERVES_CAVEAT}”`, source: {publisher: 'MHCLG', title: `Local authority revenue expenditure and financing: ${budgetYear} budget, England`, table: 'Reserves section', date: budget.sources.raPart2.published, url: REVENUE_RELEASE}}],
  });
  return {slug, year: budgetYear, rounds};
}
