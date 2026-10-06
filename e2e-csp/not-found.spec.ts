import {test, expect} from '@playwright/test';

for (const path of ['/council-tax/burnley/', '/councils/no-such-council/', '/this-page-does-not-exist/', '/downloads/national.json']) {
  test(`unknown route returns 404 under Pages routing: ${path}`, async ({request}) => {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('<h1>Page not found</h1>');
  });
}
test('real council, band and region routes remain available', async ({request}) => {
  for (const path of ['/councils/burnley/', '/council-tax/band-d/', '/council-tax/north-west/']) {
    expect((await request.get(path)).status()).toBe(200);
  }
});
