import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const theme of ['light', 'dark'] as const) {
  test(`NV14: England map and table work without scripts in ${theme}`, async ({browser, baseURL}, testInfo) => {
    const viewport = {width: testInfo.project.name === 'mobile' ? 375 : 1440, height: 812};
    const context = await browser.newContext({javaScriptEnabled: false, colorScheme: theme, viewport});
    const auditContext = await browser.newContext({colorScheme: theme, viewport});
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}/council-tax/`);
      await page.evaluate(() => document.fonts.ready);
      const map = page.locator('[data-england-map]');
      const table = page.locator('[data-tax-table] table');
      await expect(map).not.toHaveAttribute('open');
      await expect(table).toBeVisible();
      await expect(table.locator('tbody tr')).toHaveCount(296);
      expect(await table.evaluate(el => el.closest('details'))).toBeNull();
      expect(await page.locator('#average-heading').evaluate(el => Boolean(el.compareDocumentPosition(document.querySelector('[data-england-map]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
      await map.locator(':scope > summary').click();
      await expect(map.locator('svg a.ek-area-link')).toHaveCount(296);
      await expect(map.locator('script:not([src])')).toHaveCount(0);
      const svg = map.locator('svg');
      await expect(svg.locator(':scope > title')).toContainText('Area Band D');
      await expect(svg.locator('desc')).toContainText('Scotland and Wales');
      for (const code of ['E06000057', 'E06000052', 'E06000053']) {
        const area = svg.locator(`[data-ek-area="${code}"]`);
        const box = await area.boundingBox();
        expect(box!.width).toBeGreaterThan(0);
        expect(box!.height).toBeGreaterThan(0);
      }
      const labelsOutside = await svg.evaluate(el => {
        const box = el.getBoundingClientRect();
        return [...el.querySelectorAll('text')].filter(text => {
          const label = text.getBoundingClientRect();
          return label.left < box.left-1 || label.right > box.right + 1 || label.top < box.top-1 || label.bottom > box.bottom + 1;
        }).map(text => text.textContent);
      });
      expect(labelsOutside).toEqual([]);
      await svg.screenshot({path: testInfo.outputPath(`england-${theme}.png`)});
      const twin = map.locator('details.ek-twin');
      await twin.locator('summary').click();
      await expect(twin.locator('tbody tr')).toHaveCount(296);
      expect(await page.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
      await page.getByRole('link', {name: 'Skip the map', exact: true}).click();
      await expect(page.locator('#table-heading')).toBeFocused();
      await expect(page.locator('#table-heading')).toBeInViewport();

      // Axe needs timers, so audit the same HTML with every page script removed.
      const audit = await auditContext.newPage();
      await audit.route('**/*', async route => {
        const request = route.request();
        if (request.resourceType() === 'script' || !request.url().startsWith(baseURL!)) return route.abort();
        if (request.resourceType() !== 'document') return route.continue();
        const response = await route.fetch();
        await route.fulfill({response, body: (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')});
      });
      await audit.goto(`${baseURL}/council-tax/`);
      await audit.locator('[data-england-map] > summary').click();
      await audit.locator('[data-england-map] details.ek-twin > summary').click();
      const staticMap = (target: typeof page) => target.locator('[data-england-map]').evaluate(el => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('script').forEach(node => node.remove());
        clone.querySelectorAll('[style=""]').forEach(node => node.removeAttribute('style'));
        return clone.innerHTML;
      });
      expect(await staticMap(audit)).toBe(await staticMap(page));
      await expect(audit.locator('script')).toHaveCount(0);
      const result = await new AxeBuilder({page: audit}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(result.violations.map(v => ({id: v.id, targets: v.nodes.map(n => n.target)}))).toEqual([]);
      const northumberland = svg.locator('a[href="/councils/northumberland/"]');
      await northumberland.focus();
      await northumberland.press('Enter');
      await expect(page).toHaveURL(/\/councils\/northumberland\/$/);
    } finally { await context.close(); await auditContext.close(); }
  });
}

test('England map actions download a light PNG and copy the sourced table', async ({page, context, request}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/council-tax/');
  await page.locator('[data-england-map] > summary').click();
  const map = page.locator('[data-england-map]');
  await expect(map.locator('[data-chart-png]')).toHaveCount(1);
  const href = await map.locator('[data-chart-png]').getAttribute('href');
  expect(href).toBe('/og/charts/england-area-band-d-light.png');
  // Pull request builds skip image generation; main builds them with BUILD_OG=1 before publishing.
  if (process.env.BUILD_OG === '1') {
    const response = await request.get(href!);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
  }
  await map.getByRole('button', {name: 'Copy table', exact: true}).click();
  await expect(map.locator('[data-chart-status]')).toContainText('Table copied');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('Source: MHCLG');
  expect(text).toContain('Area Band D');
  expect(text).toContain('Wandsworth');
});
