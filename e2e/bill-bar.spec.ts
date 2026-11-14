import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// NV10: the bill is drawn as a bar wherever it is split.

test('the precepts page draws the published Burnley split as a bar with its table and source', async ({page}) => {
  await page.goto('/precepts/');
  const fact = page.locator('#precepts-split-chart');
  await expect(fact.locator('svg.ek-chart')).toBeVisible();
  await expect(fact.locator('[data-ek-part]')).toHaveCount(4);
  await expect(fact.locator('.source-line')).toHaveCount(1);
  await expect(fact.locator('.source-line')).toContainText('Council Tax Charges 2026/27');
  await fact.getByText('The figures as a table').click();
  await expect(fact.locator('details.ek-twin table')).toContainText('£2,540.32');
  await expect(fact.locator('a[data-chart-png]')).toHaveAttribute('href', '/og/charts/home-bill-light.png');
  // The calculation lines stay under the bar.
  await expect(page.locator('#precepts-split-shares ~ ul.shares li')).toHaveCount(4);
});

test('the local bill tool draws the chosen locality and band, and clears the bar when the choice changes', async ({page}) => {
  await page.goto('/precepts/');
  await page.getByLabel('Council with a complete imported schedule').selectOption({label: 'Burnley'});
  await page.getByLabel('Parish or locality').selectOption('padiham');
  await page.getByLabel('Property band').selectOption('B');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', {name: 'Show the published breakdown'}).click();
  const chart = page.locator('[data-bill-chart]');
  await expect(chart.locator('svg.ek-chart')).toBeVisible();
  await expect(chart.locator('[data-ek-part]')).toHaveCount(5);
  await expect(chart.locator('svg')).toContainText('Padiham parish precept');
  const total = (await page.locator('[data-bill-total]').textContent())!.split(' ')[0];
  await expect(chart.locator('svg')).toContainText(total);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel('Property band').selectOption('D');
  await expect(chart).toBeHidden();
  await expect(chart.locator('svg')).toHaveCount(0);
});

test('without script the precepts page still shows the bar and its table', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, baseURL});
  const page = await context.newPage();
  await page.goto('/precepts/');
  await expect(page.locator('#precepts-split-chart svg.ek-chart')).toBeVisible();
  await expect(page.locator('#precepts-split-chart details.ek-twin')).toHaveCount(1);
  await context.close();
});
