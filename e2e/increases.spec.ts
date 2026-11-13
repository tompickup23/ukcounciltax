import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { CURRENT_YEAR, YEARS, yearLabel } from '../src/lib/council-tax';

const previous = YEARS.at(-2)!;
const drawer = `details[data-increase-year="${previous}"]`;
const burnley = '[data-own-change="E07000117"]';

test.beforeEach(async ({ page }) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

test('current figures lead, earlier years close, and the finder covers every published row', async ({ page }) => {
  await page.goto('/increases/');
  await expect(page.locator('[data-increase-year]').first()).toHaveAttribute('id', CURRENT_YEAR);
  await expect(page.locator('details[data-increase-year][open]')).toHaveCount(0);
  const current = page.locator(`[data-increase-year="${CURRENT_YEAR}"]`);
  expect(await current.locator('[data-fact]').first().evaluate(el =>
    Boolean(el.compareDocumentPosition(document.querySelector('[data-increase-finder]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  expect(await page.locator('[data-increase-finder]').evaluate(el =>
    Boolean(el.compareDocumentPosition(document.querySelector('main table')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const rows = await page.locator('[data-own-change]').evaluateAll(all => all.map(el => el.getAttribute('data-own-change')).sort());
  const choices = await page.locator('[data-increase-choice]').evaluateAll(all => all.map(el => el.getAttribute('data-increase-choice')).sort());
  expect(choices).toEqual(rows);
  await expect(page.locator('main table')).toHaveCount(12);
  await expect(page.locator('main table tr')).toHaveCount(1291);
});

for (const theme of ['light', 'dark'] as const) {
  test(`finds, marks and focuses a council without changing the URL in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/increases/');
    const url = page.url();
    await page.getByRole('searchbox', { name: 'Find my council', exact: true }).fill('burnley');
    await page.getByRole('button', { name: 'Burnley Shire district', exact: true }).click();
    await expect(page.locator(burnley)).toBeFocused();
    await expect(page.locator(burnley)).toHaveAttribute('data-increase-selected', '');
    await expect(page.locator(burnley)).toBeInViewport();
    expect(page.url()).toBe(url);
    expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual({ local: [], session: [] });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(result.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  });
}

test('county matching includes its districts and separate county; Enter reaches the choices', async ({ page }) => {
  await page.goto('/increases/');
  const input = page.getByRole('searchbox', { name: 'Find my council', exact: true });
  await input.fill('lancashire');
  await expect(page.locator('#increase-finder-status')).toContainText('13 matching councils, first 12 listed');
  await input.press('Enter');
  await expect(page.getByRole('button', { name: 'Burnley Shire district', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Show all matching councils' }).click();
  await expect(page.getByRole('button', { name: 'Wyre Shire district', exact: true })).toBeFocused();
  await expect(page.locator('[data-increase-choice]:visible')).toHaveCount(13);
  await page.getByRole('button', { name: 'Lancashire County Council Shire county council', exact: true }).click();
  await expect(page.locator('[data-own-change="E10000017"]')).toBeFocused();
  await expect(page.locator('[data-increase-selected]')).toHaveCount(1);
});

test('an exact region matches that region, with no unrelated name matches', async ({ page }) => {
  await page.goto('/increases/');
  await page.getByRole('searchbox', { name: 'Find my council', exact: true }).fill('London');
  await page.getByRole('button', { name: 'Show all matching councils' }).click();
  const regions = await page.locator('.increase-matches li:visible').evaluateAll(all => all.map(el => el.getAttribute('data-region')));
  expect(regions).toHaveLength(33);
  expect(new Set(regions)).toEqual(new Set(['London']));
  await page.getByRole('searchbox', { name: 'Find my council', exact: true }).fill('no such council');
  await expect(page.locator('#increase-finder-status')).toContainText('No matching council');
  await expect(page.locator('[data-increase-choice]:visible')).toHaveCount(0);
  await expect(page.locator('[data-increase-more]')).toBeHidden();
});

test('a council without a listed current change is explained, never shown as zero', async ({ page }) => {
  await page.goto('/increases/');
  // All current returns have a change. Exercise the missing-row fallback without altering source data.
  await page.locator(burnley).evaluate(row => row.remove());
  await page.getByRole('searchbox', { name: 'Find my council', exact: true }).fill('burnley');
  await page.getByRole('button', { name: 'Burnley Shire district', exact: true }).click();
  await expect(page.locator('#increase-finder-status')).toHaveText('No published own-share change is listed for Burnley.');
  await expect(page.locator('[data-increase-selected]')).toHaveCount(0);
});

test('deep links reveal years on load, hash change and click even without browser assistance', async ({ page }) => {
  await page.goto(`/increases/#${previous}-district`);
  await expect(page.locator(drawer)).toHaveAttribute('open', '');
  await expect(page.locator(`[id="${previous}-district-heading"]`)).toBeInViewport();
  await page.locator(drawer).evaluate((el: HTMLDetailsElement) => { el.open = false; });
  await page.evaluate(hash => { location.hash = hash; }, `#${previous}-county`);
  await expect(page.locator(drawer)).toHaveAttribute('open', '');
  await page.locator(drawer).evaluate((el: HTMLDetailsElement) => { el.open = false; });
  // Cancel native fragment navigation: the site's click handler must still reveal the year.
  await page.evaluate(() => document.addEventListener('click', event => {
    if ((event.target as Element)?.closest('nav[aria-label="Years on this page"] a')) event.preventDefault();
  }, true));
  await page.getByRole('navigation', { name: 'Years on this page' }).getByRole('link', { name: yearLabel(previous), exact: true }).click();
  await expect(page.locator(drawer)).toHaveAttribute('open', '');
  await expect(page.locator(drawer).locator('summary')).toBeInViewport();
  // Same hash, closed again: a repeated click must still open it.
  await page.locator(drawer).evaluate((el: HTMLDetailsElement) => { el.open = false; });
  await page.getByRole('navigation', { name: 'Years on this page' }).getByRole('link', { name: yearLabel(previous), exact: true }).click();
  await expect(page.locator(drawer)).toHaveAttribute('open', '');
});

test('without scripts the finder is hidden and every table remains reachable', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  try {
    const page = await context.newPage();
    await page.goto(`${baseURL}/increases/`);
    await expect(page.locator('[data-increase-finder]')).toBeHidden();
    await expect(page.locator(`[id="${CURRENT_YEAR}-district"] table`)).toBeVisible();
    for (const year of YEARS.filter(year => year !== CURRENT_YEAR)) {
      const section = page.locator(`details[data-increase-year="${year}"]`);
      await expect(section).not.toHaveAttribute('open');
      await section.locator('summary').click();
      await expect(section.locator('table').first()).toBeVisible();
    }
    await expect(page.locator('main table')).toHaveCount(12);
    await expect(page.locator('main table tr')).toHaveCount(1291);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
  } finally { await context.close(); }
});
