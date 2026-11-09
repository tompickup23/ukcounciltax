import {describe, expect, it} from 'vitest';
import {gameData} from '../src/lib/budget-game-data';
import {orderScore, readScores, reserveBand, reserveDirection, scoreLink, shares, splitScore} from '../src/lib/budget-game';
import {budget, budgetFor, funding, services} from '../src/lib/budget';
import {councilPages} from '../src/lib/paths';
import {national} from '../src/lib/national-data';

const item = (value: number) => ({value, label: 'Test', detail: 'Synthetic game test input'});
describe('budget game calculations and sharing', () => {
  it('scores exact shares, reversed guesses, penny rounding and invalid allocations', () => {
    expect(splitScore([75, 25], [75, 25])).toBe(100);
    expect(splitScore([0, 100], [100, 0])).toBe(0);
    expect(splitScore([33, 67], [100 / 3, 200 / 3])).toBe(100);
    expect(splitScore([100], [100.001])).toBe(100);
    for (const guess of [[0, 0], [-1, 101], [0.5, 99.5], [NaN, 100], [100]]) expect(() => splitScore(guess, [50, 50])).toThrow();
    expect(shares([item(2), item(6)], 8)).toEqual([25, 75]);
    expect(() => shares([item(-2)], 2)).toThrow();
    expect(() => shares([item(2)], 0)).toThrow();
  });
  it('ranks funding magnitudes, accepts ties and preserves deductions', () => {
    const items = [item(-40), item(20), item(20), item(0)];
    expect(orderScore([0, 1, 2, 3], items)).toBe(100);
    expect(orderScore([0, 2, 1, 3], items)).toBe(100);
    expect(orderScore([3, 2, 1, 0], items)).toBe(0);
    expect(orderScore([0, 1], [item(0), item(0)])).toBe(100);
    expect(() => orderScore([0, 0, 2, 3], items)).toThrow();
  });
  it('handles exact reserve thresholds, additions, drawdowns and unchanged balances', () => {
    expect([0, 1, 999, 1000, 9999, 10000, 99999, 100000].map(reserveBand)).toEqual([0, 1, 1, 2, 2, 3, 3, 4]);
    expect(reserveBand(-1000)).toBe(2);
    expect([-1, 0, 1].map(reserveDirection)).toEqual(['draw', 'neither', 'add']);
  });
  it('shares only the slug and strictly validated scores, including skips', () => {
    const url = new URL(scoreLink('https://example.test', 'burnley', [100, 80, null, 50, 0]));
    expect(url.pathname).toBe('/tools/budget/burnley/');
    expect(url.search).toBe('');
    expect(readScores(url.hash, 5)).toEqual([100, 80, null, 50, 0]);
    for (const hash of ['#scores=101,2', '#scores=-1,2', '#scores=1.5,2', '#scores=NaN,2', '#scores=1,2&postcode=x', '#scores=1,2,3', '#scores=<script>,2', '#scores=,2']) expect(readScores(hash, 2)).toBeNull();
  });
  it('builds games only from available councils, preserving every positive heading and component', () => {
    let games = 0, countyRounds = 0;
    for (const {council, tax} of councilPages()) {
      const data = gameData(council.gss, council.slug, tax.name);
      const source = budgetFor(council.gss);
      if (source.council.status === 'no return') {expect(data).toBeNull(); continue;}
      games++;
      const splits = data!.rounds.filter(r => r.kind === 'split');
      if (source.county) countyRounds++;
      expect(splits).toHaveLength(source.county ? 2 : 1);
      for (const [i, body] of [source.council, ...(source.county ? [source.county] : [])].entries()) {
        const positive = services(body).filter(r => r.value! > 0);
        expect(splits[i].items.map(item => item.label)).toEqual(positive.map(r => r.label));
        expect(splits[i].items.map(item => item.value)).toEqual(positive.map(r => r.value));
        expect(splits[i].base).toBe(positive.reduce((sum, r) => sum + r.value!, 0));
        expect(splits[i].notes).toHaveLength(services(body).filter(r => r.value! < 0).length);
      }
      const bill = data!.rounds.find(r => r.kind === 'bill')!;
      const observed = national.components[council.gss];
      expect(bill.base).toBe(observed.areaPence);
      expect(bill.items.map(item => item.value)).toEqual([observed.ownWithParishPence, ...observed.parts.map(p => p.bandDPence)].filter(v => v! > 0));
      expect(data!.rounds.find(r => r.kind === 'funding')!.items.map(item => item.value)).toEqual(funding(source.council).map(r => r.value));
      for (const round of data!.rounds) {
        expect(round.source.url).toMatch(/^https:\/\//);
        expect(round.source.table).toBeTruthy();
        expect(round.source.date).toBeTruthy();
        expect(round.items.every(item => Number.isFinite(item.value))).toBe(true);
      }
      if (source.council.notes.raPart1.includes('[note 4]')) expect(data!.rounds.find(r => r.kind === 'funding')!.items.find(i => i.label === 'Council tax requirement')!.detail).toContain(budget.sourceNotes.raPart1['[note 4]']);
    }
    // Coverage from the pinned MHCLG return and Table 10 county joins.
    expect(games).toBe(287); expect(countyRounds).toBe(160);
  });
});

it('keeps every stored printed label and service heading equal to the pinned workbook with punctuation changes only', async () => {
  const {readOds} = await import('../scripts/lib/ods.mjs');
  const {readFileSync} = await import('node:fs');
  const manifest = JSON.parse(readFileSync('data/national/sources.json', 'utf8'));
  const normalise = (text: string) => text.replace(new RegExp(`(\\d)\\s*[${String.fromCharCode(8211, 8212)}]\\s*(\\d)`, 'g'), '$1 to $2').replace(new RegExp(`\\s*[${String.fromCharCode(8211, 8212)}]\\s*`, 'g'), ': ').replaceAll([' ', '-', ' '].join(''), ': ').replace(/\s+/g, ' ').trim();
  for (const key of ['raPart1', 'raPart2', 'raGrants']) {
    const source = manifest[key];
    const sheet = readOds(`data/raw/${source.file}`).find((s: {name: string}) => s.name === source.tables[0]);
    if (!sheet) throw new Error(`Missing pinned sheet ${source.tables[0]}`);
    const header = sheet.rows.findIndex((r: string[]) => r[0] === 'E-code');
    for (const [id, field] of Object.entries(budget.fields).filter(([, f]) => f.source === key)) {
      const column = sheet.rows[header - 3].indexOf(id);
      expect(column, id).toBeGreaterThanOrEqual(0);
      expect(field.label, id).toBe(normalise(sheet.rows[header][column]));
      expect(field.heading, id).toBe(normalise(sheet.rows[header - 2].slice(6, column + 1).filter(Boolean).at(-1) ?? ''));
    }
  }
});

it('uses the kit rule for whole pence and every published split without changing the data', async () => {
  const {squaresFor}=await import('../src/lib/budget-game');
  const {gameChart}=await import('../src/lib/budget-game-charts');
  for(const guesses of [[100,0],[62,12,26],[0,12,29,32,27],[14,71,11,4]]) expect(squaresFor(guesses)).toEqual(guesses);
  for(const {council,tax} of councilPages()) {
    const data=gameData(council.gss,council.slug,tax.name);
    for(const [i,round] of (data?.rounds??[]).entries()) {
      if(round.kind!=='split'&&round.kind!=='bill')continue;
      expect(round.items.length).toBeLessThanOrEqual(12);
      const out=gameChart(round,`${council.slug}-${i}`).out;
      const counts=[...out.svg.matchAll(/data-ek-squares="(\d+)"/g)].map(match=>Number(match[1]));
      expect(counts,`${council.slug} round ${i}`).toEqual(squaresFor(shares(round.items,round.base!)));
      expect(counts.reduce((a,b)=>a+b,0)).toBe(100);
      if(council.slug==='burnley'&&i===0)expect(counts).toEqual([0,12,29,32,27]);
      if(council.slug==='burnley'&&round.kind==='bill')expect(counts).toEqual([14,71,11,4]);
    }
  }
},30000);


it('gives Birmingham funding bars at least half the drawing width with recorded short values', async () => {
  const {gameChart}=await import('../src/lib/budget-game-charts');
  const data=gameData('E08000025','birmingham','Birmingham')!;
  const funding=data.rounds.find(round=>round.kind==='funding')!;
  const chart=gameChart(funding,'birmingham-funding').out;
  expect(chart.width).toBe(600);
  const lengths=[...chart.svg.matchAll(/data-base="([^"]+)" data-end="([^"]+)"/g)].map(([,base,end])=>Math.abs(Number(end)-Number(base)));
  expect(Math.max(...lengths)).toBeGreaterThanOrEqual(300);
  expect(chart.svg).toContain('£1.3bn');
  expect(chart.table).toContain('£1,334,018,000');
  expect(chart.table).not.toContain('£1.3bn');
  for(const theme of ['light','dark'] as const) {
    const pngChart=gameChart(funding,'birmingham-funding',theme).out;
    const background=pngChart.svg.match(/<rect x="0" y="0" width="600" height="([^"]+)"/);
    expect(Number(background?.[1])).toBe(pngChart.height);
  }
  expect(chart.svg).not.toContain('(add)');
  expect(chart.svg).not.toContain('(deduct)');
  const reserves=gameChart(data.rounds.find(round=>round.kind==='reserves')!,'birmingham-reserves').out;
  expect(reserves.svg).toContain('£731m');
  expect(reserves.svg).toContain('£688.8m');
});
