import {describe, expect, it} from 'vitest';
import {readFileSync, existsSync} from 'node:fs';
import {budget, budgetFor, budgetMoney, funding, nonRingfencedReserves, observation, services} from '../src/lib/budget';
import {councilPages, programmaticPaths} from '../src/lib/paths';
import {canonicalUrl} from '../src/lib/canonical';
import {absoluteUrl} from '../src/lib/site';

describe('budget page source views', () => {
  it('covers every billing page with a self canonical budget route and preserves no returns', () => {
    const pages = councilPages();
    expect(pages).toHaveLength(296);
    expect(pages.filter(({council}) => budgetFor(council.gss).council.status === 'available')).toHaveLength(287);
    const routes = programmaticPaths().filter(path => path.startsWith('/tools/budget/'));
    expect(routes).toHaveLength(296);
    for (const {council} of pages) {
      const path = `/tools/budget/${council.slug}/`;
      expect(routes).toContain(path);
      expect(canonicalUrl(path)).toBe(absoluteUrl(path));
      const view = budgetFor(council.gss);
      if (view.council.class === 'SD') expect(view.county?.class).toBe('SC');
      if (view.council.status === 'no return') {
        expect(services(view.council).every(row => row.value === null)).toBe(true);
        expect(funding(view.council).every(row => row.value === null)).toBe(true);
        expect(nonRingfencedReserves(view.council).every(row => row.value === null)).toBe(true);
      }
    }
  });
  it('preserves negative service observations, printed labels and units', () => {
    const burnley = budgetFor('E07000117').council;
    const transport = services(burnley).find(row => row.id === 'transtot')!;
    expect(transport).toMatchObject({value: -343, label: 'Highways and Transport', line: 290, recordType: 'observation', unit: 'GBP thousand'});
    expect(budgetMoney(transport.value)).toBe('-£343,000');
    expect(observation(burnley, 'eduspc').label).toBe('Special schools and alternative provision');
    expect(budgetMoney(null)).toBe('Unavailable');
  });
  it('reconciles every grouped funding view including deductions and reserve additions', () => {
    let withDeduction = 0;
    for (const council of Object.values(budget.councils).filter(c => c.status === 'available')) {
      const rows = funding(council);
      expect(rows.every(row => row.recordType === 'calculation')).toBe(true);
      expect(rows.reduce((total, row) => total + row.value!, 0), council.name).toBe(council.values.revenuetot);
      if (rows.some(row => row.value! < 0)) withDeduction++;
    }
    expect(withDeduction).toBeGreaterThan(0);
    const runnymede = funding(budgetFor('E07000212').council).find(row => row.label === 'Retained business rates');
    expect(runnymede?.value).toBe(-880);
  });
  it('excludes ring-fenced balances from non-ringfenced reserves', () => {
    const lancashire = budgetFor('E07000117').county!;
    const rows = nonRingfencedReserves(lancashire);
    expect(rows.map(row => row.value)).toEqual([245022 + 66250, 229961 + 66250]);
    expect(rows[0].inputIds).toEqual(['resoth_strt', 'resunall_strt']);
    expect(rows.every(row => row.recordType === 'calculation')).toBe(true);
    expect(lancashire.values.resdsgadj_strt).toBe(-97366);
  });
});

it.skipIf(!existsSync('dist/tools/budget/burnley/index.html'))('preserves the complete pre-A6 tables, notes, source lines and game data on the three comparison pages', async () => {
  const {publishedText}=await import('../scripts/lib/budget-game.mjs');
  const before=JSON.parse(readFileSync('tests/fixtures/a6-published-text.json','utf8'));
  for(const slug of ['burnley','birmingham','coventry']) {
    const file=`dist/tools/budget/${slug}/index.html`;
    if(!existsSync(file))throw new Error('Build the site before the published text comparison');
    expect(publishedText(readFileSync(file,'utf8')),slug).toEqual(before[slug]);
  }
});
