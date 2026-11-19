import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * F1 (plan section 11.5): the shared desk band, the short record line with its
 * Sources block, and the kit chart title rule, measured in a real browser.
 */

// One page per template that draws kit charts or carries the desk band.
const CHART_PAGES = ['/councils/pendle/', '/', '/council-tax/', '/increases/', '/council-tax/towns/county/lancashire/', '/tools/budget/pendle/'];
const DESK_PAGES = ['/', '/tools/', '/tools/budget/', '/tools/budget/pendle/', '/council-tax/towns/', '/council-tax/towns/constituency/burnley/'];

for (const path of CHART_PAGES) {
  test(`no kit chart title renders larger than its section heading: ${path}`, async ({page}) => {
    await page.goto(path);
    // Charts inside closed disclosures are measured open.
    await page.evaluate(() => document.querySelectorAll<HTMLDetailsElement>('main details').forEach(d => { d.open = true; }));
    const rows = await page.evaluate(() => [...document.querySelectorAll<SVGSVGElement>('svg.ek-chart')].flatMap(svg => {
      const title = svg.querySelector(':scope > text');
      if (!title || !svg.getBoundingClientRect().width) return [];
      // The section heading the chart sits under: the last h1 or h2 before it in document order.
      const heading = [...document.querySelectorAll('h1, h2')].filter(h => h.compareDocumentPosition(svg) & Node.DOCUMENT_POSITION_FOLLOWING).at(-1);
      if (!heading) return [];
      return [{titlePx: parseFloat(getComputedStyle(title).fontSize) * svg.getBoundingClientRect().width / svg.viewBox.baseVal.width, heading: parseFloat(getComputedStyle(heading).fontSize)}];
    }));
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row.titlePx).toBeLessThan(row.heading);
  });
}

for (const path of DESK_PAGES) {
  test(`one desk band, accessible in both themes: ${path}`, async ({page}) => {
    test.setTimeout(120_000);
    await page.goto(path);
    await expect(page.locator('.desk')).toHaveCount(1);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      expect((await new AxeBuilder({page}).include('.desk').analyze()).violations).toEqual([]);
      // In dark themes the band must lift clearly off the page, not sit at the page colour.
      const [band, body] = await page.evaluate(() => [getComputedStyle(document.querySelector('.desk')!).backgroundColor, getComputedStyle(document.body).backgroundColor]);
      expect(band).not.toBe(body);
    }
  });
}

test('every towns record line lands on its Sources entry', async ({page}) => {
  await page.goto('/council-tax/towns/county/lancashire/');
  const links = page.locator('.record-line a.record-full');
  expect(await links.count()).toBeGreaterThan(2);
  await expect(page.locator('[data-page-sources]')).toHaveCount(1);
  await links.first().click();
  await expect(page.locator('#source-band-d')).toBeInViewport();
  await expect(page.locator('#source-band-d')).toContainText('Parish_Level_Data');
});
