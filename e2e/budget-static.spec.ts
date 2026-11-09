import {expect, test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const theme of ['light', 'dark'] as const) {
  for (const slug of ['burnley', 'birmingham', 'coventry']) {
    test(`${slug} budget: ${theme} accessibility and layout`, async ({page}) => {
      await page.emulateMedia({colorScheme: theme});
      await page.goto(`/tools/budget/${slug}/`);
      await expect(page.getByRole('heading', {name: 'Your bill', exact: true})).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
      const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(result.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target)}))).toEqual([]);
      if (slug === 'burnley') await page.screenshot({path: `.ops/budget-phase2-${test.info().project.name}-${theme}.png`});
    });
  }
}
test('budget index links all billing authorities', async ({page}) => {
  await page.goto('/tools/budget/');
  await expect(page.locator('.budget-directory a')).toHaveCount(296);
  const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
});
test('static two-tier budget and band selector work without JavaScript', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 375, height: 812}});
  const page = await context.newPage();
  await page.goto(`${baseURL}/tools/budget/burnley/`);
  for (const id of ['council-budget', 'county-budget']) {
    const section = page.locator(`#${id}`);
    await expect(section.getByRole('table', {name: 'net current expenditure by service', exact: false})).toBeVisible();
    await expect(section.getByRole('table', {name: 'calculated funding view', exact: false})).toBeVisible();
    await expect(section.getByRole('table', {name: 'non-ringfenced reserve balances', exact: false})).toBeVisible();
    await expect(section.getByText('net current expenditure by service.', {exact: false}).first()).toBeVisible();
    await section.getByText('Read the service sub-lines', {exact: true}).click();
    for (const table of await section.locator('.service-detail table').all()) await expect(table).toBeVisible();
    await section.getByText('Read the financing lines as printed', {exact: true}).click();
    await expect(section.getByRole('table', {name: 'observed RA financing lines', exact: false})).toBeVisible();
  }
  await expect(page.getByText('£17,246,000', {exact: true})).toBeVisible();
  await expect(page.getByText('£1,174,566,000', {exact: false}).first()).toBeVisible();
  await page.locator('[data-band-label="H"]').click();
  await expect(page.locator('[data-band-panel="H"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
  await context.close();
});
test('missing return has only current bill information and no budget tables', async ({page}) => {
  await page.goto('/tools/budget/coventry/');
  await expect(page.locator('[data-no-budget-return]')).toBeVisible();
  await expect(page.locator('.budget-tables')).toHaveCount(0);
  await expect(page.locator('[data-budget-game]')).toHaveCount(0);
  await expect(page.getByRole('table')).toHaveCount(1);
  await expect(page.locator('main')).not.toContainText('2025/26');
  await expect(page.locator('main')).not.toContainText('2024/25');
});
test('note 4 stays next to the council tax requirement', async ({page}) => {
  await page.goto('/tools/budget/barnet/');
  const row = page.getByRole('row').filter({has: page.getByRole('rowheader', {name: /^Council tax requirement/})});
  await expect(row).toContainText('No explanation for this discrepancy has been provided.');
});

test('every no-return page preserves its notice and every note 4 page preserves the warning', async ({page}) => {
  const {councilPages} = await import('../src/lib/paths');
  const {budgetFor, budget} = await import('../src/lib/budget');
  for (const {council} of councilPages()) {
    const source = budgetFor(council.gss).council;
    if (source.status !== 'no return' && !source.notes.raPart1.includes('[note 4]')) continue;
    await page.goto(`/tools/budget/${council.slug}/`);
    if (source.status === 'no return') {
      await expect(page.locator('[data-no-budget-return]')).toContainText('11 June 2026');
      await expect(page.locator('[data-budget-game], .budget-tables')).toHaveCount(0);
      await expect(page.getByRole('table')).toHaveCount(1);
      await expect(page.locator('main')).not.toContainText('2025/26');
    } else {
      await expect(page.locator('#council-budget').getByRole('row').filter({has: page.getByRole('rowheader', {name: /^Council tax requirement/})})).toContainText(budget.sourceNotes.raPart1['[note 4]']);
      const game = page.locator('[data-budget-game]');
      await game.getByRole('button', {name: 'Start the game'}).click();
      while (!(await game.getByRole('heading', {level: 3}).innerText()).startsWith('Where the money')) {
        await game.getByRole('button', {name: 'Skip and reveal'}).click();
        await game.getByRole('button', {name: 'Next round', exact: true}).click();
      }
      await game.getByRole('button', {name: 'Skip and reveal'}).click();
      await expect(game.locator('li').filter({hasText: /^Council tax requirement:/})).toContainText(budget.sourceNotes.raPart1['[note 4]']);
    }
  }
});
