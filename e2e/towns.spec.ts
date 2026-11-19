import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Below 600px the council, constituency, sort and larger places controls fold under one summary. */
async function openMore(page: import('@playwright/test').Page) {
  const more = page.locator('[data-f-more]');
  if (await more.getAttribute('open') === null) await more.locator('summary').click();
}

const PAGES = ['/council-tax/towns/', '/council-tax/towns/region/north-west/', '/council-tax/towns/county/lancashire/', '/council-tax/towns/constituency/burnley/', '/council-tax/towns/county/herefordshire/'];

for (const path of PAGES) {
  test(`towns page is accessible in both themes with no overflow: ${path}`, async ({page}) => {
    // Axe walks every row of the long tables twice, once per theme.
    test.setTimeout(180_000);
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
    }
  });
}

test('the county table is complete and in order without JavaScript', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, baseURL});
  const page = await context.newPage();
  await page.goto('/council-tax/towns/county/lancashire/');
  const rows = page.locator('[data-town-table] tbody tr');
  await expect(rows).toHaveCount(222);
  await expect(rows.first()).toContainText('1=');
  await expect(page.locator('#E2333P007')).toContainText('£2,584.38');
  await expect(page.locator('[data-town-filters]')).toBeHidden();
  await context.close();
});

test('filters, search, the larger places switch and sorting narrow and reorder the table', async ({page}) => {
  await page.goto('/council-tax/towns/county/lancashire/');
  const visible = page.locator('[data-town-table] tbody tr:visible');
  await expect(page.locator('[data-town-filters]')).toBeVisible();
  await page.getByLabel('Find a place').fill('padiham');
  await expect(visible).toHaveCount(1);
  await expect(page.locator('[data-f-count]')).toHaveText('Showing 1 of 222 areas.');
  await expect(page).toHaveURL(/\?q=padiham/);
  await page.getByLabel('Find a place').fill('');
  await openMore(page);
  await page.locator('[data-f-council]').selectOption({label: 'Burnley'});
  await expect(visible).toHaveCount(9);
  await page.locator('[data-f-council]').selectOption('');
  await page.getByLabel(/Larger places only/).check();
  await expect(visible).toHaveCount(43);
  await page.getByLabel(/Larger places only/).uncheck();
  if (page.viewportSize()!.width >= 600) {
    await page.getByRole('button', {name: 'Full Band D'}).click();
    await page.getByRole('button', {name: 'Full Band D'}).click();
  } else {
    // Rows are cards below 600px: the header is hidden and the select sorts.
    await page.getByLabel('Sort by').selectOption('v:-1');
  }
  await expect(page.locator('[data-town-table] tbody tr').first()).toContainText('Wennington');
  await expect(page.locator('th[data-sort="v"]')).toHaveAttribute('aria-sort', 'descending');
  // Rows without a figure stay after the rows with one in either direction.
  await expect(page.locator('[data-town-table] tbody tr').last()).toContainText('Not placed');
});

test('a hub link opens a row on its county page and the method drawer opens by hash', async ({page}) => {
  await page.goto('/council-tax/towns/county/lancashire/#E2333P007');
  await expect(page.locator('#E2333P007')).toBeInViewport();
  await page.goto('/council-tax/towns/#how-calculated');
  await expect(page.locator('details#how-calculated')).toHaveAttribute('open', '');
  await expect(page.locator('details#how-calculated')).toContainText('£2,584.38');
});

test('the table restores its filters from the address and keeps every sort honest', async ({page}) => {
  await page.goto('/council-tax/towns/county/lancashire/?q=padiham&council=not-a-council&ref=x');
  const visible = page.locator('[data-town-table] tbody tr:visible');
  await expect(visible).toHaveCount(1);
  await expect(page.getByLabel('Find a place')).toHaveValue('padiham');
  // A council value with no option falls back to all councils, and an unrelated parameter is kept.
  await expect(page.locator('[data-f-council]')).toHaveValue('');
  await expect(page).toHaveURL(/ref=x/);
  await page.getByLabel('Find a place').fill('');
  await openMore(page);
  // Sorting by parish change never lifts a row without a figure above one with a figure.
  for (const option of ['ch:-1', 'ch:1', 'pp:-1']) {
    await page.getByLabel('Sort by').selectOption(option);
    const placed = await page.locator('[data-town-table] tbody tr').evaluateAll(rows => rows.map(r => (r as HTMLElement).dataset.v !== undefined));
    expect(placed.lastIndexOf(true), option).toBeLessThan(placed.indexOf(false));
  }
  if (page.viewportSize()!.width >= 600) {
    // A header click always leaves the select naming the order in use.
    for (const key of ['place', 'place', 'v', 'v', 'pos', 'pos']) {
      await page.locator(`th[data-sort="${key}"] button`).click();
      expect(await page.getByLabel('Sort by').evaluate((s: HTMLSelectElement) => s.selectedIndex)).toBeGreaterThanOrEqual(0);
    }
  }
});
