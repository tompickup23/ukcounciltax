import {expect, test} from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`${theme}: charts offer one light image and the locator retains its table`, async ({page}) => {
    await page.emulateMedia({colorScheme: theme});
    await page.goto('/councils/burnley/');
    for (const chart of ['bands', 'bill', 'position']) {
      const actions = page.locator(`[data-chart-actions][data-chart="councils/burnley/${chart}"]`);
      await expect(actions.locator('[data-chart-png]')).toHaveCount(1);
      await expect(actions.locator('[data-chart-png]')).toHaveAttribute('href', `/og/charts/councils/burnley/${chart}-light.png`);
    }
    const locator = page.locator('[data-chart-actions][data-chart="councils/burnley/map"]');
    await expect(locator.locator('[data-chart-png]')).toHaveCount(0);
    await expect(locator.locator('.source-line')).not.toBeEmpty();
    await expect(locator.locator('..').locator('details table')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
  });
}
