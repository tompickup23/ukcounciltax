import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { taxRows } from '../src/lib/tax-view-data';
import { CURRENT_YEAR } from '../src/lib/council-tax';
import { moneyPence } from '../src/lib/tax-view';
import { parishPages } from '../src/lib/paths';

test.beforeEach(async ({ page }) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

test('one set of band controls filters and sorts every region within one class', async ({ page }) => {
  await page.goto('/council-tax/band-d/');
  await expect(page.locator('[data-table-filter]')).toHaveCount(1);
  await expect(page.locator('[data-tax-table]')).toHaveCount(9);
  await expect(page.locator('[data-tax-table] tbody tr')).toHaveCount(taxRows().length);
  await expect(page.locator('[data-table-sort] option[value="high"]')).toBeDisabled();
  await page.locator('[data-table-class]').selectOption('SD');
  await page.locator('[data-table-sort]').selectOption('high');
  for (const table of await page.locator('[data-tax-table]').all()) {
    const region = await table.getAttribute('data-region');
    const expected = taxRows().filter(row => row.region === region && row.classCode === 'SD')
      .sort((a, b) => b.years[CURRENT_YEAR].D! - a.years[CURRENT_YEAR].D! || a.name.localeCompare(b.name));
    expect(await table.locator('tbody tr:not([hidden])').evaluateAll(rows => rows.map(row => row.getAttribute('data-slug')))).toEqual(expected.map(row => row.slug));
  }
  await page.locator('[data-table-filter]').fill('burnley');
  const shown = page.locator('[data-tax-table] tbody tr:not([hidden])');
  await expect(shown).toHaveCount(1);
  // A region with no match leaves the page with its heading and its jump link, and one line reports the result.
  await expect(page.locator('section.section:has([data-tax-table]):visible')).toHaveCount(1);
  await expect(page.locator('#north-west')).toBeVisible();
  await expect(page.locator('#london')).toBeHidden();
  await expect(page.locator('[data-region-jump] li:visible')).toHaveCount(1);
  await expect(page.locator('[data-controls-status]')).toHaveText('1 council shown, in North West.');
  await expect(page.locator('#north-west [data-table-status]')).toHaveText(/^1 council, Band D/);
  await expect(page.locator('main [role="status"]:has-text("council")')).toHaveCount(1);
  await page.locator('[data-table-filter]').fill('zzzz');
  await expect(page.locator('section.section:has([data-tax-table]):visible')).toHaveCount(0);
  await expect(page.locator('[data-controls-status]')).toHaveText('No matching councils. Clear the name filter or choose another council type.');
  await page.locator('[data-table-filter]').fill('burnley');
  await expect(shown).toHaveCount(1);
  await expect(shown.locator('[data-row-annual]')).toHaveText(moneyPence(taxRows().find(row => row.slug === 'burnley')!.years[CURRENT_YEAR].D!));
  await page.locator('[data-table-class]').selectOption('');
  await expect(page.locator('[data-table-sort]')).toHaveValue('name');
  await expect(page.locator('[data-table-sort] option[value="high"]')).toBeDisabled();
  await page.locator('[data-table-filter]').fill('');
  await expect(page.locator('[data-tax-table] tbody tr:not([hidden])')).toHaveCount(taxRows().length);
  await expect(page.locator('section.section:has([data-tax-table]):visible')).toHaveCount(9);
  await expect(page.locator('[data-region-jump] li:visible')).toHaveCount(9);
  await expect(page.locator('[data-controls-status]')).toHaveText(`${taxRows().length} councils shown, in all 9 regions.`);
});

test('profile region link starts with its council type and invalid types leave all rows available', async ({ page }) => {
  await page.goto('/councils/burnley/');
  await page.locator('a[href="/council-tax/north-west/?type=SD"]').click();
  await expect(page.locator('[data-table-class]')).toHaveValue('SD');
  await expect(page.locator('[data-table-sort] option[value="high"]')).toBeEnabled();
  const expected = taxRows().filter(row => row.region === 'North West' && row.classCode === 'SD');
  await expect(page.locator('[data-tax-table] tbody tr:not([hidden])')).toHaveCount(expected.length);
  await page.goto('/council-tax/north-west/?type=unknown');
  await expect(page.locator('[data-table-class]')).toHaveValue('');
  await expect(page.locator('[data-tax-table] tbody tr:not([hidden])')).toHaveCount(taxRows().filter(row => row.region === 'North West').length);
});

test('profile contents keep every link under four useful headings', async ({ page }) => {
  for (const slug of ['burnley', 'westminster']) {
    await page.goto(`/councils/${slug}/`);
    const contents = page.getByRole('navigation', { name: 'On this page', exact: true });
    await expect(contents.locator('[data-contents-group]')).toHaveCount(4);
    expect(await contents.locator('a').evaluateAll(links => links.every(link => document.getElementById(link.getAttribute('href')!.slice(1))))).toBe(true);
    await contents.getByRole('link', { name: 'Discounts, exemptions and how to pay' }).click();
    await expect(page).toHaveURL(/#discounts-and-paying$/);
    await expect(page.locator('#discounts-and-paying h2')).toBeInViewport();
  }
});

test('parish headers sort names and regions and chips filter without changing the rows', async ({ page }) => {
  await page.goto('/precepts/parishes/');
  const table = page.locator('[data-parish-index]');
  const rows = table.locator('tbody tr');
  const before = await rows.allTextContents();
  await expect(rows).toHaveCount(parishPages().length);
  await table.getByRole('button', { name: 'Sort by council', exact: true }).click();
  await expect(table.locator('thead th[aria-sort="descending"]')).toHaveCount(1);
  expect(await rows.allTextContents()).toEqual([...before].reverse());
  await table.getByRole('button', { name: 'Sort by region', exact: true }).click();
  await expect(table.locator('thead th[aria-sort="ascending"]')).toHaveCount(1);
  const regions = await rows.evaluateAll(rows => rows.map(row => row.getAttribute('data-region')!));
  expect(regions).toEqual([...regions].sort((a, b) => a.localeCompare(b, 'en-GB')));
  await page.getByRole('button', { name: 'North West', exact: true }).click();
  await expect(page.getByRole('button', { name: 'North West', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const expected = parishPages().filter(council => council.region === 'North West').length;
  await expect(table.locator('tbody tr:not([hidden])')).toHaveCount(expected);
  await expect(page.locator('[data-parish-count]')).toHaveText(`${expected} of ${parishPages().length} councils shown`);
  await page.getByRole('button', { name: 'All regions', exact: true }).click();
  await expect(table.locator('tbody tr:not([hidden])')).toHaveCount(parishPages().length);
  expect((await rows.allTextContents()).sort()).toEqual([...before].sort());
  await expect(table.locator('thead th.num button')).toHaveCount(0);
});

test('band and region pages end with working onward links', async ({ page }) => {
  for (const route of ['band-a', 'band-d', 'band-h', 'north-west']) {
    await page.goto(`/council-tax/${route}/`);
    const onward = page.getByRole('navigation', { name: 'Explore council tax', exact: true });
    await expect(onward.getByRole('link', { name: 'Rankings by council type' })).toHaveAttribute('href', '/council-tax/ranked/');
    if (route === 'band-a') await expect(onward.getByRole('link', { name: 'Band B', exact: true })).toHaveAttribute('href', '/council-tax/band-b/');
    if (route === 'band-h') await expect(onward.getByRole('link', { name: 'Band G', exact: true })).toHaveAttribute('href', '/council-tax/band-g/');
    if (route === 'north-west') await expect(onward.locator('a')).toHaveCount(9);
  }
});

test('scripts off preserves complete band and parish tables and grouped profile links', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto('/council-tax/band-d/');
  await expect(page.locator('[data-table-controls]')).toBeHidden();
  await expect(page.locator('[data-tax-table] tbody tr:visible')).toHaveCount(taxRows().length);
  await page.goto('/precepts/parishes/');
  await expect(page.locator('[data-parish-filters]')).toBeHidden();
  await expect(page.locator('[data-parish-index] tbody tr:visible')).toHaveCount(parishPages().length);
  await page.goto('/councils/burnley/');
  await expect(page.locator('[data-contents-group]')).toHaveCount(4);
  await context.close();
});

for (const theme of ['light', 'dark'] as const) {
  test(`changed pages remain accessible and fit the viewport in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    for (const route of ['/council-tax/band-d/', '/council-tax/north-west/', '/precepts/parishes/', '/councils/burnley/']) {
      await page.goto(route);
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
    }
  });
}
