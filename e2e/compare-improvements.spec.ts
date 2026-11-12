import {test, expect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {taxRows} from '../src/lib/tax-view-data';
import {englishRows} from '../src/lib/council-picker';

const rows = taxRows();
const money = (pence: number) => new Intl.NumberFormat('en-GB', {style:'currency', currency:'GBP'}).format(pence / 100);
const query = (page: Page, side: string) => page.locator(`[data-picker-filter="${side}"]`);
const choices = (page: Page, side: string) => page.locator(`[data-chooser-matches="${side}"] button`);
async function choose(page: Page, side: string, slug: string) {
  await query(page, side).fill(slug);
  await page.locator(`[data-chooser-matches="${side}"] [data-compare-choice="${slug}"]`).click();
}
test.beforeEach(async ({page}) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

for (const [a, b, band, year] of [['burnley','pendle','D','2026-27'], ['camden','barnet','H','2025-26']] as const) {
  test(`annual, percentage and monthly gaps reproduce the held figures for ${a} and ${b}`, async ({page}) => {
    const first = rows.find(row => row.slug === a)!;
    const second = rows.find(row => row.slug === b)!;
    const x = first.years[year][band]!; const y = second.years[year][band]!;
    const gap = Math.abs(x - y); const low = Math.min(x, y);
    await page.goto(`/compare/?a=${a}&b=${b}&band=${band}&year=${year}`);
    await expect(page.locator('[data-result-difference]')).toHaveText(`${x > y ? first.name : second.name} is ${money(gap)} more a year than ${x > y ? second.name : first.name}.`);
    await expect(page.locator('[data-result-percentage]')).toHaveText(`${(gap / low * 100).toFixed(2)}% of the lower annual charge`);
    await expect(page.locator('[data-result-monthly-difference]')).toHaveText(`${money(Math.round(gap / 12))} a month, spread over 12 months`);
    await expect(page.locator('[data-percentage-calculation]')).toContainText(`${money(gap)} ÷ ${money(low)} × 100`);
    await expect(page.locator('[data-monthly-calculation]')).toContainText(`${money(gap)} ÷ 12`);
    const positions = await page.evaluate(() => ['[data-result-difference]', '[data-result-side="a"]', '[data-comparison-form]'].map(selector => document.querySelector(selector)!.getBoundingClientRect().top));
    expect(positions[0]).toBeLessThan(positions[1]); expect(positions[1]).toBeLessThan(positions[2]);
    const headline = await page.locator('[data-result-difference]').textContent();
    await page.getByRole('button', {name:'Swap councils'}).click();
    await expect(page.locator('[data-result-difference]')).toHaveText(headline!);
  });
}

test('both choosers match counties and exact regions and keep the comparison group', async ({page}) => {
  await page.goto('/compare/');
  await query(page,'a').fill('lancashire');
  const expected = englishRows('profile').filter(row => row.county === 'Lancashire').map(row => rows.find(tax => tax.gss === row.gss)!.slug).sort();
  expect(expected).toHaveLength(12);
  expect((await choices(page,'a').evaluateAll(elements => elements.map(el => (el as HTMLElement).dataset.compareChoice))).sort()).toEqual(expected);
  await query(page,'a').fill('north west');
  const regionCount = rows.filter(row => row.region === 'North West').length;
  await expect(page.locator('[data-chooser-status="a"]')).toContainText(`${regionCount} matching councils`);
  while (await page.locator('[data-chooser-more="a"]').isVisible()) await page.locator('[data-chooser-more="a"]').click();
  expect((await choices(page,'a').evaluateAll(elements => elements.map(el => (el as HTMLElement).dataset.compareChoice))).sort()).toEqual(rows.filter(row => row.region === 'North West').map(row=>row.slug).sort());
  await choose(page,'a','adur');
  await query(page,'b').fill('lancashire');
  expect((await choices(page,'b').evaluateAll(elements => elements.map(el => (el as HTMLElement).dataset.compareChoice))).sort()).toEqual(expected);
  await query(page,'b').fill('manchester');
  await expect(choices(page,'b')).toHaveCount(0);
  await page.goto('/compare/?a=burnley&b=manchester');
  await expect(page.locator('[data-comparison-status]')).toHaveText('Manchester is a metropolitan district and Burnley is a shire district. Compare works within one type of council, so choose another shire district.');
});

test('postcode lookup chooses each side without storing or navigating with the query', async ({page}) => {
  await page.route('https://api.postcodes.io/postcodes/**', route => route.fulfill({json:{result:{codes:{admin_district:route.request().url().includes('BB11') ? rows.find(row=>row.slug==='burnley')!.gss : rows.find(row=>row.slug==='pendle')!.gss}}}}));
  await page.goto('/compare/');
  await query(page,'a').fill('BB11 1DU'); await query(page,'a').press('Enter');
  await expect(page.locator('[data-chosen="a"]')).toContainText('Selected: Burnley');
  await query(page,'b').fill('BB9 7LG'); await page.getByRole('button',{name:'Find second council'}).click();
  await expect(page.locator('[data-chosen="b"]')).toContainText('Selected: Pendle');
  await page.getByRole('button',{name:'Compare',exact:true}).click();
  await expect(page.locator('[data-comparison-results]')).toBeVisible();
  expect(page.url()).not.toMatch(/BB11|BB9|postcode/);
  expect(await page.evaluate(()=>({local:Object.keys(localStorage), session:Object.keys(sessionStorage)}))).toEqual({local:[],session:[]});
});

test('a postcode cannot bypass the comparison group and failures can be retried', async ({page}) => {
  let reply = 'refused';
  await page.route('https://api.postcodes.io/postcodes/**', route => reply === 'outage' ? route.abort() : reply === 'missing' ? route.fulfill({status:404,json:{}}) : route.fulfill({json:{result:{codes:{admin_district:rows.find(row=>row.slug === (reply === 'refused' ? 'manchester' : 'pendle'))!.gss}}}}));
  await page.goto('/compare/?a=burnley');
  await query(page,'b').fill('M1 1AE'); await page.getByRole('button',{name:'Find second council'}).click();
  await expect(page.locator('[data-chooser-status="b"]')).toContainText('Compare works within one type of council');
  await expect(page.locator('#council-b')).toHaveValue('');
  reply='missing'; await page.getByRole('button',{name:'Find second council'}).click();
  await expect(page.locator('[data-chooser-status="b"]')).toContainText('does not know');
  reply='outage'; await page.getByRole('button',{name:'Find second council'}).click();
  await expect(page.locator('[data-chooser-status="b"]')).toContainText('did not answer');
  reply='pendle'; await page.getByRole('button',{name:'Find second council'}).click();
  await expect(page.locator('[data-chosen="b"]')).toContainText('Selected: Pendle');
});

test('an old postcode reply cannot overwrite a newer council choice', async ({page}) => {
  let release!: () => void; let handled!: () => void;
  const completed = new Promise<void>(resolve => {handled = resolve;});
  const pending = new Promise<void>(resolve => {release = resolve;});
  await page.route('https://api.postcodes.io/postcodes/**', async route => {await pending; await route.fulfill({json:{result:{codes:{admin_district:rows.find(row=>row.slug==='burnley')!.gss}}}}).catch(()=>{}); handled();});
  await page.goto('/compare/'); await query(page,'a').fill('BB11 1DU');
  const sent = page.waitForRequest('https://api.postcodes.io/postcodes/**');
  await page.getByRole('button',{name:'Find first council'}).click(); await sent;
  await choose(page,'a','adur'); release(); await completed;
  await expect(page.locator('[data-chosen="a"]')).toContainText('Selected: Adur');
  await expect(page.locator('#council-a')).toHaveValue('adur');
});

for (const theme of ['light','dark'] as const) {
  test(`choosers, answer and calculations fit and are accessible in ${theme}`, async ({page}) => {
    await page.emulateMedia({colorScheme:theme});
    await page.goto('/compare/?a=burnley&b=pendle&band=D&year=2026-27');
    await query(page,'a').fill('lancashire');
    const audit = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
    await query(page,'a').focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    await expect(choices(page,'a').first()).toBeFocused();
    await page.keyboard.press('Enter'); await expect(query(page,'a')).toBeFocused();
  });
}

test('without scripts readers can choose two working council tables', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false}); const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL + '/compare/');
  await expect(page.locator('[data-comparison-form]')).toBeHidden();
  await page.getByText('Choose from all councils',{exact:true}).click();
  const fallback = page.locator('[aria-labelledby="compare-without-scripts"]');
  await expect(fallback.locator('li a')).toHaveCount(rows.length);
  for (const name of ['Burnley','Pendle']) {
    const popup = context.waitForEvent('page'); await fallback.getByRole('link',{name,exact:true}).click();
    const council = await popup; await council.waitForLoadState();
    await expect(council.locator('[data-band-panel="D"]')).toBeVisible();
    await council.close();
  }
  await context.close();
});

test('changing the other chooser clears a cancelled postcode progress message', async ({page}) => {
  await page.route('https://api.postcodes.io/postcodes/**', async route => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    await route.fulfill({json:{result:{codes:{admin_district:'E07000117'}}}}).catch(()=>{});
  });
  await page.goto('/compare/?a=burnley&b=pendle');
  await query(page,'a').fill('BB11 1DU');
  const sent = page.waitForRequest('https://api.postcodes.io/postcodes/**');
  await page.getByRole('button',{name:'Find first council'}).click(); await sent;
  await query(page,'b').fill('hyndburn');
  await expect(page.locator('[data-chooser-status="a"]')).toContainText('cancelled');
  await expect(page.locator('[data-chosen="a"]')).toContainText('Selected: Burnley');
});

for (const theme of ['light','dark'] as const) {
  for (const path of ['/compare/', '/compare/?a=burnley&b=pendle&band=D&year=2026-27']) {
    test(`initial comparison layout stays stable in ${theme}: ${path}`, async ({page}) => {
      await page.emulateMedia({colorScheme:theme});
      await page.addInitScript(() => {
        const state = window as unknown as Window & {comparisonCLS: number}; state.comparisonCLS = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & {hadRecentInput: boolean; value: number};
            if (!shift.hadRecentInput) state.comparisonCLS += shift.value;
          }
        }).observe({type:'layout-shift', buffered:true});
      });
      await page.goto(path);
      await expect(page.locator('[data-tax-compare]')).toHaveAttribute('data-comparison-ready','');
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      expect(await page.evaluate(() => (window as unknown as Window & {comparisonCLS: number}).comparisonCLS)).toBeLessThanOrEqual(0.1);
      await expect(page.locator('[data-comparison-form]')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });
  }
}
