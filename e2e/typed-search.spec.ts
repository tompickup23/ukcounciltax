import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { councilIndex } from '../src/lib/council-index';

test.beforeEach(async ({ page }) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

for (const [name, href] of [
  ['Burnley', '/councils/burnley/'], ['Leeds', '/councils/leeds/'], ['Cornwall', '/councils/cornwall/'],
  ['Westminster', '/councils/westminster/'], ['Kingston upon Hull', '/councils/kingston-upon-hull-city-of/'],
  ['Bristol', '/councils/bristol-city-of/'], ['Durham', '/councils/county-durham/'],
  ['York', '/councils/york/'], ['Rutland', '/councils/rutland/'], ['Cardiff', '/wales/cardiff/'],
]) {
  test(`${name} leads the council results and is keyboard reachable`, async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-search-open]').focus(); await page.keyboard.press('Enter');
    await page.getByLabel('Council, region or topic').fill(name);
    const first = page.locator('[data-council-profile]').first();
    await expect(first).toHaveAttribute('href', href);
    await page.keyboard.press('Tab'); await expect(first).toBeFocused();
    await page.keyboard.press('Enter'); await expect(page).toHaveURL(new RegExp(`${href}$`));
  });
}

test('the first keystrokes search lazily and expose the held destinations', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  expect(requests.some(url => /\/pagefind\/|\/council-index.json/.test(url))).toBe(false);
  await page.locator('[data-search-open]').click();
  await page.getByLabel('Council, region or topic').pressSequentially('burn');
  await expect(page.locator('[data-council-profile]').first()).toHaveAttribute('href', '/councils/burnley/');
  const burnley = page.locator('[data-search-council-results] li').filter({ has: page.locator('a[href="/councils/burnley/"]') });
  await expect(burnley.getByRole('link', { name: 'Budget game for Burnley', exact: true })).toHaveAttribute('href', '/tools/budget/burnley/');
  await expect(burnley.getByRole('link', { name: 'Parish precepts for Burnley', exact: true })).toHaveAttribute('href', '/precepts/parishes/burnley/');
  await expect(burnley.locator('.council-detail')).toHaveText('Shire district · North West');
});

test('county matches show all twelve districts and broad searches can show more', async ({ page }) => {
  await page.goto('/'); await page.locator('[data-search-open]').click();
  const input = page.getByLabel('Council, region or topic');
  await input.fill('lancashire');
  await expect(page.locator('[data-council-profile]')).toHaveCount(12);
  await expect(page.locator('[data-search-status]')).toContainText('12 matching councils;');
  await expect(page.locator('[data-search-councils-more]')).toBeHidden();
  await input.fill('north west');
  const regionRows = councilIndex().filter(row => row.region === 'North West');
  await expect(page.locator('[data-search-status]')).toContainText(`${regionRows.length} matching councils`);
  await expect(page.locator('[data-search-council-results]')).not.toContainText('North West Leicestershire');
  await expect(page.locator('[data-search-council-results]')).not.toContainText('West Northamptonshire');
  await input.fill('south east');
  await expect(page.locator('[data-search-councils-more]')).toBeVisible();
  await expect(page.locator('[data-search-status]')).toContainText('(12 listed)');
  await page.locator('[data-search-councils-more]').click();
  await expect(page.locator('[data-council-profile]')).toHaveCount(24);
  await expect(page.locator('[data-search-status]')).toContainText('(24 listed)');
  await input.fill('zxqvnomatchingplace');
  await expect(page.locator('[data-search-status]')).toContainText('No matching pages or councils');
  await expect(page.locator('[data-search-councils]')).toBeHidden();
  await expect(page.locator('[data-search-councils-more]')).toBeHidden();
});

test('nations stay labelled and unavailable destinations stay absent', async ({ page }) => {
  await page.goto('/'); await page.locator('[data-search-open]').click();
  const input = page.getByLabel('Council, region or topic');
  for (const name of ['Glasgow City', 'Cardiff']) {
    await input.fill(name);
    const row = page.locator('[data-search-council-results] li').first();
    await expect(row.locator('[data-council-profile]')).toHaveText(name);
    await expect(row.locator('.council-detail')).toContainText(name === 'Cardiff' ? 'Wales' : 'Scotland');
    await expect(row.locator('a')).toHaveCount(1);
  }
  const noGame = councilIndex().find(row => row.nation === 'England' && !row.budgetUrl)!;
  await input.fill(noGame.name);
  const row = page.locator('[data-search-council-results] li').first();
  await expect(row.locator('[data-council-profile]')).toHaveAttribute('href', noGame.url);
  await expect(row.getByRole('link', { name: /Budget game/ })).toHaveCount(0);
});

test('the directory picker and name finder use the same exact region rule', async ({ page }) => {
  const expected = councilIndex().filter(row => row.region === 'North West');
  await page.goto('/councils/');
  await page.locator('[data-picker-input]').fill('North West');
  if ((page.viewportSize()?.width ?? 1280) < 600) {
    await expect(page.locator('tr[data-row]:visible')).toHaveCount(12);
    await expect(page.locator('[data-picker-count]')).toContainText(`${expected.length} of 296 match`);
    await page.getByRole('button', { name: `Show all ${expected.length} matching councils` }).click();
  }
  await expect(page.locator('tr[data-row]:visible')).toHaveCount(expected.length);
  expect(await page.locator('tr[data-row]:visible').evaluateAll(rows => rows.every(row => (row as HTMLElement).dataset.region === 'north-west'))).toBe(true);
  await page.goto('/');
  await page.locator('[data-council-finder] input').fill('North West');
  await expect(page.locator('[data-finder-status]')).toContainText(`${expected.length} matching councils`);
  await expect(page.locator('[data-council-finder] li:visible a')).toHaveCount(8);
  expect(await page.locator('[data-council-finder] li:visible').evaluateAll(rows => rows.every(row => (row as HTMLElement).dataset.region === 'North West'))).toBe(true);
});

test('full text matches keep excerpts and page type labels', async ({ page }) => {
  await page.goto('/'); await page.locator('[data-search-open]').click();
  await page.getByLabel('Council, region or topic').fill('Burnley');
  const hit = page.locator('[data-search-results] li').filter({ has: page.locator('a[href="/councils/burnley/"]') });
  await expect(hit.locator('[data-search-type]')).toHaveText('Council');
  await expect(hit.locator('p').last()).not.toBeEmpty();
  const count = await page.locator('[data-search-results] li').count();
  await expect(page.locator('[data-search-results] [data-search-type]')).toHaveCount(count);
  await expect(page.locator('[data-search-status]')).toHaveText(/1 matching council; \d+ matching pages\./);
});

test('a failed council index keeps page results and retry restores councils', async ({ page }) => {
  let blocked = true;
  await page.route('**/council-index.json', route => blocked ? route.abort() : route.continue());
  await page.goto('/'); await page.locator('[data-search-open]').click();
  await page.getByLabel('Council, region or topic').fill('Burnley');
  await expect(page.locator('[data-search-results] a[href="/councils/burnley/"]')).toBeVisible();
  await expect(page.locator('[data-search-status]')).toContainText('Council search could not load');
  await expect(page.locator('[data-search-retry]')).toBeVisible();
  blocked = false; await page.locator('[data-search-retry]').click();
  await expect(page.locator('[data-council-profile]').first()).toHaveAttribute('href', '/councils/burnley/');
  await expect(page.locator('[data-search-retry]')).toBeHidden();
});

test('a delayed first response cannot overwrite a newer query', async ({ page }) => {
  let release!: () => void; let requested!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const arrived = new Promise<void>(resolve => { requested = resolve; });
  await page.route('**/council-index.json', async route => { requested(); await gate; await route.continue(); });
  await page.goto('/'); await page.locator('[data-search-open]').click();
  const input = page.getByLabel('Council, region or topic');
  await input.fill('Burnley'); await arrived;
  await input.fill('Cardiff'); release();
  await expect(page.locator('[data-council-profile]').first()).toHaveAttribute('href', '/wales/cardiff/');
  await expect(page.locator('[data-search-status]')).toContainText('1 matching council;');
  await expect(page.locator('[data-search-council-results] a[href="/councils/burnley/"]')).toHaveCount(0);
  await input.fill(''); await expect(page.locator('[data-search-councils]')).toBeHidden();
});

for (const theme of ['light', 'dark'] as const) {
  test(`search fits and is accessible in ${theme} without storing the query`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    const storage = await page.evaluate(() => [JSON.stringify(localStorage), JSON.stringify(sessionStorage)]);
    await page.locator('[data-search-open]').click();
    await page.getByLabel('Council, region or topic').fill('lancashire');
    await expect(page.locator('[data-council-profile]')).toHaveCount(12);
    expect(await page.locator('[data-site-search]').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(axe.violations.map(row => ({ id: row.id, nodes: row.nodes.map(n => n.target) }))).toEqual([]);
    expect(await page.evaluate(() => [JSON.stringify(localStorage), JSON.stringify(sessionStorage)])).toEqual(storage);
    await page.keyboard.press('Escape'); await expect(page.locator('[data-search-open]')).toBeFocused();
  });
}

test('search remains a directory link without scripts', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage(); await page.goto('/');
    await page.locator('[data-search-open]').click();
    await expect(page).toHaveURL(/\/councils\/$/);
    await expect(page.getByRole('link', { name: 'Burnley', exact: true }).first()).toBeVisible();
  } finally { await context.close(); }
});
