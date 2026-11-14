import {expect, test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
import {SCENARIO_GAME_PATH, expectPrintedGaps, fitsWidth, watchErrors} from './helpers/burnley-scenario-game';

const meta = JSON.parse(readFileSync('src/components/burnley-game/meta.json', 'utf8')) as {runId: string; editionText: string};

test('Burnley scenario game starts at the council printed gap and returns the second printed gap', async ({page}) => {
  const errors = await watchErrors(page);
  await page.goto(SCENARIO_GAME_PATH);
  await expect(page).toHaveTitle('Burnley budget scenario game 2027/28 | UK Council Tax');
  await expect(page.getByRole('heading', {level: 1})).toHaveCount(1);
  await expect(page.locator('[data-game-edition]')).toHaveText(`Edition of ${meta.editionText}. Model run ${meta.runId}. Figures from Burnley Borough Council's published papers.`);
  await expect(page.locator('[data-burnley-game]')).not.toContainText('Working version');
  expect(await fitsWidth(page)).toBe(true);
  await expectPrintedGaps(page);
  expect(errors).toEqual([]);
});

for (const theme of ['light', 'dark'] as const) test(`Burnley scenario game frame: ${theme} accessibility`, async ({page}) => {
  await page.emulateMedia({colorScheme: theme});
  await page.goto(SCENARIO_GAME_PATH);
  // The site frame and the static figures are this site's. The game itself is checked in the Reports repository.
  const result = await new AxeBuilder({page}).exclude('[data-burnley-game]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(result.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target)}))).toEqual([]);
});

test('Burnley scenario game page is useful without JavaScript', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 375, height: 812}});
  const page = await context.newPage();
  await page.goto(`${baseURL}${SCENARIO_GAME_PATH}`);
  const published = page.locator('[data-game-published]');
  for (const text of ['£0.594 million', '£0.507 million', '£22,428,686', '£351.44', 'Table 4, page 5', 'Table 5, page 6', 'Executive, 16 September 2026', 'Executive, 25 February 2026, page 1', 'Appendix A, Full Council, 3 March 2026']) {
    await expect(published).toContainText(text);
  }
  const scenario = page.locator('[data-game-scenario]');
  await expect(scenario).toContainText('your own scenario');
  await expect(scenario).toContainText('not a forecast');
  await expect(page.locator('[data-model-version]')).toHaveText(`Model version: ${meta.runId}. Edition of ${meta.editionText}.`);
  await expect(page.locator('[data-game-needs-script]')).toBeVisible();
  await expect(page.locator('[data-burnley-game]')).toBeHidden();
  expect(await fitsWidth(page)).toBe(true);
  await context.close();
});

test('Burnley council page links the scenario game and no other council page does', async ({page}) => {
  await page.goto('/councils/burnley/');
  await expect(page.locator('[data-scenario-game-link]')).toHaveAttribute('href', SCENARIO_GAME_PATH);
  await page.goto('/councils/pendle/');
  await expect(page.locator('[data-scenario-game-link]')).toHaveCount(0);
});

test('Burnley budget page links the scenario game and no other budget page does', async ({page}) => {
  await page.goto('/tools/budget/burnley/');
  await expect(page.locator('[data-scenario-game-link]')).toHaveAttribute('href', SCENARIO_GAME_PATH);
  await page.goto('/tools/budget/pendle/');
  await expect(page.locator('[data-scenario-game-link]')).toHaveCount(0);
});
