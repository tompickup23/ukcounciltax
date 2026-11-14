import {expect, test} from '@playwright/test';
import {SCENARIO_GAME_PATH, expectPrintedGaps, watchErrors} from '../e2e/helpers/burnley-scenario-game';

test('Burnley scenario game runs under the production headers with no CSP violation', async ({page}) => {
  const errors = await watchErrors(page);
  const violations: string[] = [];
  await page.exposeFunction('scenarioCspViolation', (text: string) => violations.push(text));
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', event => (window as any).scenarioCspViolation(`${event.violatedDirective}: ${event.blockedURI}`)));
  page.on('console', message => { if (/Content Security Policy/i.test(message.text())) violations.push(message.text()); });
  const response = await page.goto(SCENARIO_GAME_PATH);
  const policy = response!.headers()['content-security-policy'];
  expect(policy).toBeTruthy();
  const scriptSrc = policy.match(/script-src[^;]*/)?.[0] ?? '';
  expect(scriptSrc).toContain("'self'");
  expect(scriptSrc).not.toContain("'unsafe-inline'");
  // The game's script and stylesheet are this site's own static files.
  await expect(page.locator('script[src^="/budget-game/burnley/game.js"]')).toHaveCount(1);
  await expect(page.locator('link[rel="stylesheet"][href^="/budget-game/burnley/game.css"]')).toHaveCount(1);
  await expectPrintedGaps(page);
  // The game applies its bar widths through the style object. A blocked style would leave the meter track empty.
  await expect(page.locator('#meter .gtrack')).toBeVisible();
  expect(violations).toEqual([]);
  expect(errors).toEqual([]);
});
