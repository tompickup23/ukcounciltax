import {test, expect} from '@playwright/test';

// _redirects is read by `wrangler pages dev`, the same rules Cloudflare Pages applies.
for (const path of ['/council-tax/rises-2026-27/', '/council-tax/rises-2026-27']) {
  test(`moved rises page is a 301 to its year on /increases/: ${path}`, async ({request}) => {
    const response = await request.get(path, {maxRedirects: 0});
    expect(response.status()).toBe(301);
    const location = new URL(response.headers()['location'], 'http://localhost');
    expect(location.pathname + location.hash).toBe('/increases/#2026-27');
  });
}

test('the redirect lands on the 2026/27 section', async ({page}) => {
  await page.goto('/council-tax/rises-2026-27/');
  await expect(page).toHaveURL(/\/increases\/#2026-27$/);
  await expect(page.locator('section[id="2026-27"] h2')).toContainText('How much has council tax gone up in 2026/27?');
});

test('the next year page carries no pound sign', async ({page}) => {
  const response = await page.goto('/council-tax-2027-28/');
  expect(response?.status()).toBe(200);
  expect(await page.content()).not.toContain('£');
});
