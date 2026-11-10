import {test, expect} from '@playwright/test';
test('the chosen band marks its bar and the compare link', async ({page}) => {
  await page.goto('/councils/burnley/');
  await page.locator('[data-band-label="B"]').click();
  await expect(page.locator('#band-bars figure')).toHaveAttribute('data-band-marked', 'B');
  const fills = await page.locator('#band-bars').evaluate(root => {
    const bars = root.querySelectorAll('g.ek-bar path');
    return [getComputedStyle(bars[1]).fill, getComputedStyle(bars[3]).fill, getComputedStyle(root).getPropertyValue('--accent').trim(), getComputedStyle(root).getPropertyValue('--series-neutral').trim()];
  });
  const rgb = (colour: string) => colour.startsWith('#') ? `rgb(${colour.slice(1).match(/../g)!.map(x => parseInt(x,16)).join(', ')})` : colour;
  expect(fills[0]).toBe(rgb(fills[2]));
  expect(fills[1]).toBe(rgb(fills[3]));
  await expect(page.locator('[data-council-compare]')).toHaveAttribute('href', /band=B/);
});
test('the static band chart marks D without JavaScript', async ({browser,baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled:false,baseURL});
  const page = await context.newPage();
  await page.goto('/councils/burnley/');
  await expect(page.locator('#band-bars g.ek-bar').nth(3).locator('path')).toHaveAttribute('data-ek-focus','D');
  await context.close();
});
