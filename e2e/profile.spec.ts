import {test, expect} from '@playwright/test';
test('the chosen band marks its bar and the compare link', async ({page}) => {
  await page.goto('/councils/burnley/');
  const rgb = (colour: string) => colour.startsWith('#') ? `rgb(${colour.slice(1).match(/../g)!.map(x => parseInt(x,16)).join(', ')})` : colour;
  for (const band of 'ABCDEFGH') {
    await page.locator(`[data-band-label="${band}"]`).click();
    await expect(page.locator('#band-bars figure')).toHaveAttribute('data-band-marked', band);
    const marks = await page.locator('#band-bars').evaluate(root => {
      const bars = [...root.querySelectorAll<SVGGraphicsElement>('g.ek-bars > g.ek-bar > [data-ek-bar]')];
      const style = getComputedStyle(root);
      return {
        fills: bars.map(bar => getComputedStyle(bar).fill),
        boxes: bars.map(bar => { const {x,y,width,height} = bar.getBBox(); return {x,y,width,height}; }),
        accent: style.getPropertyValue('--accent').trim(),
        neutral: style.getPropertyValue('--series-neutral').trim(),
      };
    });
    expect(marks.fills).toEqual([... 'ABCDEFGH'].map(label => rgb(label === band ? marks.accent : marks.neutral)));
    for (const [index, box] of marks.boxes.entries()) {
      expect(box.width).toBeGreaterThan(box.height);
      expect(box.x).toBe(marks.boxes[0].x);
      if (index) expect(box.y).toBeGreaterThan(marks.boxes[index-1].y + marks.boxes[index-1].height);
    }
    await expect(page.locator('[data-council-compare]')).toHaveAttribute('href', new RegExp(`band=${band}`));
  }
});
test('the static band chart marks D without JavaScript', async ({browser,baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled:false,baseURL});
  const page = await context.newPage();
  await page.goto('/councils/burnley/');
  await expect(page.locator('#band-bars g.ek-bar').nth(3).locator('[data-ek-bar]')).toHaveAttribute('data-ek-focus','D');
  await context.close();
});

test('ranking own shares stay readable on phones', async ({page}) => {
  await page.setViewportSize({width:375,height:812});
  for (const slug of ['shire-districts','unitary-authorities','london-boroughs']) {
    await page.goto(`/council-tax/ranked/${slug}/`);
    const region = page.locator('.table-wrap').first();
    expect(await region.evaluate(node => node.scrollWidth === node.clientWidth)).toBe(true);
    if (slug === 'shire-districts') await expect(page.locator('tbody tr').filter({has:page.getByRole('link',{name:'Havant',exact:true})})).toContainText('Own share: 116=, £246.87');
  }
});
