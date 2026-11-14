import { expect, test } from '@playwright/test';

test('England map links, table and actions work under production CSP', async ({page, context}) => {
  const violations: string[] = [];
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error(`CSP violation: ${e.violatedDirective}`)));
  page.on('console', message => { if (message.text().includes('CSP violation')) violations.push(message.text()); });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const response = await page.goto('/council-tax/');
  expect(response?.headers()['content-security-policy']).toContain("script-src 'self'");
  await page.locator('[data-england-map] > summary').click();
  const map = page.locator('[data-england-map]');
  await expect(map.locator('svg a.ek-area-link')).toHaveCount(296);
  await map.locator('details.ek-twin > summary').click();
  await expect(map.locator('details.ek-twin table')).toBeVisible();
  await map.getByRole('button', {name: 'Copy table', exact: true}).click();
  await expect(map.locator('[data-chart-status]')).toContainText('Table copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Source: MHCLG');
  await page.getByRole('link', {name: 'Skip the map', exact: true}).click();
  await expect(page.locator('#table-heading')).toBeFocused();
  const area = map.locator('svg a[href="/councils/northumberland/"]');
  await area.focus();
  await area.press('Enter');
  await expect(page).toHaveURL(/\/councils\/northumberland\/$/);
  expect(violations).toEqual([]);
});
