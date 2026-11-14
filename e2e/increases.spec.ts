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
  await expect(page.locator('main table:not(.ek-table)')).toHaveCount(12);
  await expect(page.locator('main table:not(.ek-table) tr')).toHaveCount(1291);
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
    await expect(page.locator(`[id="${CURRENT_YEAR}-district"] table.data`)).toBeVisible();
    for (const year of YEARS.filter(year => year !== CURRENT_YEAR)) {
      const section = page.locator(`details[data-increase-year="${year}"]`);
      await expect(section).not.toHaveAttribute('open');
      await section.locator('summary').click();
      await expect(section.locator('table').first()).toBeVisible();
    }
    await expect(page.locator('main table:not(.ek-table)')).toHaveCount(12);
    await expect(page.locator('main table:not(.ek-table) tr')).toHaveCount(1291);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
  } finally { await context.close(); }
});

for (const theme of ['light', 'dark'] as const) {
  test(`NV14: complete current drawings with scripts off in ${theme}`, async ({browser, baseURL}, testInfo) => {
    const viewport = {width: testInfo.project.name === 'mobile' ? 375 : 1440, height: 900};
    const context = await browser.newContext({javaScriptEnabled: false, colorScheme: theme, viewport});
    const auditContext = await browser.newContext({colorScheme: theme, viewport});
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}/increases/`);
      await page.evaluate(() => document.fonts.ready);
      const current = page.locator(`[data-increase-year="${CURRENT_YEAR}"]`);
      await expect(page.locator('svg.ek-chart')).toHaveCount(3);
      await expect(page.locator('details[data-increase-year] svg.ek-chart')).toHaveCount(0);
      await expect(page.locator('details.increase-drawing[open]')).toHaveCount(0);
      await expect(page.locator('[data-chart-copy]:visible')).toHaveCount(0);
      expect(await current.locator('[data-fact]').first().evaluate(el => Boolean(el.compareDocumentPosition(document.querySelector('[data-increase-drawing]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
      expect(await page.locator('[data-increase-finder]').evaluate(el => Boolean(el.compareDocumentPosition(document.querySelector('[data-increase-drawing]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
      for (const id of ['unitary', 'county', 'district']) {
        const group = current.locator(`[id="${CURRENT_YEAR}-${id}"]`);
        const drawing = group.locator('[data-increase-drawing]');
        const original = group.locator('table.data');
        await expect(original).toBeVisible();
        expect(await original.evaluate(el => el.closest('details'))).toBeNull();
        if (id !== 'county') await drawing.locator(':scope > summary').click();
        const expected = await original.locator('tbody tr').evaluateAll(rows => rows.map(row => ({
          gss: row.getAttribute('data-own-change'), name: row.querySelector('th')!.textContent!.trim(), change: row.querySelectorAll('td')[1].textContent!.trim(),
        })));
        const bars = await drawing.locator('[data-ek-row]').evaluateAll(rows => rows.map(row => ({
          gss: row.getAttribute('data-ek-row')!.split('.').at(-1), title: row.querySelector('title')!.textContent,
        })));
        expect(bars).toEqual(expected.map(row => ({gss: row.gss, title: `${row.name}: ${row.change}`})));
        expect(await drawing.locator('.source-line').innerText()).toBe(await group.locator(':scope > [data-fact] > .source-line').innerText());
        const twin = drawing.locator('details.ek-twin');
        await twin.locator('summary').click();
        await expect(twin.locator('tbody tr')).toHaveCount(expected.length);
        await twin.locator('summary').click();
        const svg = drawing.locator('svg');
        const bounds = await svg.evaluate(el => {
          const box = el.getBoundingClientRect();
          return [...el.querySelectorAll('text')].filter(text => {
            const label = text.getBoundingClientRect();
            return label.left < box.left-1 || label.right > box.right+1 || label.top < box.top-1 || label.bottom > box.bottom+1;
          }).map(text => text.textContent);
        });
        expect(bounds).toEqual([]);
        if (id === 'district') {
          const fall = expected.reduce((a, b) => parseFloat(a.change) < parseFloat(b.change) ? a : b);
          expect(parseFloat(fall.change)).toBeLessThan(0);
          const geometry = await drawing.locator(`[data-ek-row$=".${fall.gss}"]`).evaluate(el => {
            const box = (el.querySelector('path') as SVGGraphicsElement).getBBox();
            return {zero: Number(el.getAttribute('data-ek-zero')), left: box.x, right: box.x+box.width};
          });
          expect(geometry.left).toBeLessThan(geometry.zero);
          expect(Math.abs(geometry.right-geometry.zero)).toBeLessThan(0.02);
        }
        await svg.screenshot({path: testInfo.outputPath(`${id}-${theme}.png`)});
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
      // Axe needs timers. Audit the same static content with every page script removed.
      const audit = await auditContext.newPage();
      await audit.route('**/*', async route => {
        const request = route.request();
        if (request.resourceType() === 'script' || !request.url().startsWith(baseURL!)) return route.abort();
        if (request.resourceType() !== 'document') return route.continue();
        const response = await route.fetch();
        await route.fulfill({response, body: (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')});
      });
      await audit.goto(`${baseURL}/increases/`);
      for (const drawer of await audit.locator('details.increase-drawing > summary').all()) await drawer.click();
      const staticContent = async (target: typeof page) => target.locator('main').evaluate(el => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('script, noscript').forEach(node => node.remove());
        // Playwright restores caret styles after screenshots as empty attributes.
        clone.querySelectorAll('[style=""]').forEach(node => node.removeAttribute('style'));
        return clone.innerHTML;
      });
      expect(await staticContent(audit)).toBe(await staticContent(page));
      await expect(audit.locator('script')).toHaveCount(0);
      const result = await new AxeBuilder({page: audit}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(result.violations.map(v => ({id: v.id, targets: v.nodes.map(n => n.target)}))).toEqual([]);
    } finally { await context.close(); await auditContext.close(); }
  });

  test(`NV9: drawing actions retain their source in ${theme}`, async ({page, context}) => {
    await page.emulateMedia({colorScheme: theme});
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/increases/');
    for (const id of ['unitary', 'county', 'district']) {
      const drawing = page.locator(`[data-increase-drawing="increases-${id}"]`);
      if (id !== 'county') await drawing.locator(':scope > summary').click();
      await expect(drawing.locator('[data-chart-png]')).toHaveCount(1);
      await expect(drawing.locator('[data-chart-png]')).toHaveAttribute('href', `/og/charts/increases-${id}-light.png`);
      await drawing.getByRole('button', {name: 'Copy table', exact: true}).click();
      await expect(drawing.locator('[data-chart-status]')).toContainText('Table copied');
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain('Source: MHCLG');
      expect(copied).toContain('%');
    }
  });
}
