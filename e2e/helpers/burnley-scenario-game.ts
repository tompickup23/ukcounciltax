import {expect, type Page} from '@playwright/test';

export const SCENARIO_GAME_PATH = '/councils/burnley/budget-game/';

/** Console errors and uncaught exceptions on the page. The analytics beacon is stopped first: a test run is not a page load. */
export async function watchErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
  page.on('console', message => {
    if (message.type() === 'error' && !/cloudflareinsights|net::ERR_FAILED/.test(message.text())) errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(String(error)));
  return errors;
}

/** True when the page is no wider than the window, within two pixels. */
export const fitsWidth = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2);

/** Walk from step 1 to the council tax dial on step 5, checking the width at every step. */
export async function openCouncilTaxDial(page: Page) {
  const game = page.locator('[data-burnley-game]');
  for (let step = 2; step <= 5; step++) {
    await game.locator(`section.step[data-step="${step - 1}"] .nav [data-go="${step}"]`).click();
    await expect(game.locator(`section.step[data-step="${step}"]`)).toBeVisible();
    expect(await fitsWidth(page), `overflow at step ${step}`).toBe(true);
  }
  return game;
}

/** The council's two printed gaps for 2027/28: Table 4 at 1.99% and Table 5 at 2.99%. */
export async function expectPrintedGaps(page: Page) {
  const game = await openCouncilTaxDial(page);
  await expect(game.locator('#ct')).toHaveValue('1.99');
  await expect(game.locator('#ctVal')).toHaveText('1.99%');
  await expect(game.locator('#mLbl')).toContainText('2027/28');
  await expect(game.locator('#mGap')).toHaveText('£594,000');
  await game.locator('#rateChips [data-rate="2.99"]').click();
  await expect(game.locator('#ctVal')).toHaveText('2.99%');
  await expect(game.locator('#mGap')).toHaveText('£507,000');
}
