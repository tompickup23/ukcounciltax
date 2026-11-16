import {expect, test} from '@playwright/test';
import {FREEZE_MODEL} from '../../src/lib/budget-freeze';

/** W3: the desk board, the phone meter, copy, print and What next. */
export function budgetSetW3Journeys() {
  for (const slug of ['leeds', 'trafford', 'east-cambridgeshire', 'warrington']) {
    test(`${slug} desk board, fit and copy at 1440`, async ({page, context}) => {
      test.skip(test.info().project.name === 'mobile', 'desktop layout');
      await page.setViewportSize({width:1440, height:900});
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const requests: string[] = [];
      await page.goto(`/tools/budget/${slug}/set/`);
      await expect(page.locator('[data-controls]')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      // The tax control is the lever, drawn larger than any service card.
      const tax = (await page.locator('.tax-control').boundingBox())!;
      const taxFont = await page.locator('[data-own-value]').evaluate(e => parseFloat(getComputedStyle(e).fontSize));
      const serviceFont = await page.locator('[data-service-value]').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize));
      expect(taxFont).toBeGreaterThan(serviceFont);
      const card = (await page.locator('.service-card').first().boundingBox())!;
      expect(tax.width).toBeGreaterThan(card.width);
      // Tax and every service fit one 900px screen.
      const last = (await page.locator('.service-card').last().boundingBox())!;
      expect(last.y + last.height - tax.y).toBeLessThanOrEqual(900);
      // The board stays in view while the services scroll.
      await page.locator('.service-card').last().scrollIntoViewIfNeeded();
      await page.mouse.wheel(0, 400);
      await expect.poll(async () => (await page.locator('.set-desk').boundingBox())!.y).toBeLessThan(40);
      await expect.poll(async () => (await page.locator('.set-desk').boundingBox())!.y).toBeGreaterThanOrEqual(0);
      // Compact amounts with exact pounds one click away.
      await page.locator('[data-service-percent][data-percent="90"]').first().click();
      await expect(page.locator('[data-remaining]')).not.toHaveText(/\.\d{2}$/);
      await page.locator('.board-exact summary').click();
      await expect(page.locator('[data-remaining-exact]')).toHaveText(/\.\d{2}$/);
      // Clipboard only: no request, and the copied text carries the label and model version.
      page.on('request', r => requests.push(r.url()));
      await page.locator('[data-copy]').click();
      await expect(page.locator('[data-copy-status]')).toContainText('Scenario copied');
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied.startsWith(`User requested scenario | ${FREEZE_MODEL}`)).toBe(true);
      expect(copied).not.toMatch(/[–—]| - /);
      expect(requests).toEqual([]);
      // Print: the scenario text, assumptions and model version; no controls.
      await page.emulateMedia({media:'print'});
      await expect(page.locator('.print-scenario')).toBeVisible();
      await expect(page.locator('[data-scenario-text]')).toHaveText(copied);
      await expect(page.locator('.assumptions ul')).toBeVisible();
      await expect(page.locator('[data-controls]')).toBeHidden();
      await expect(page.locator('.desk-eyebrow')).toContainText(FREEZE_MODEL);
      await page.emulateMedia({media:'screen'});
      await expect(page.locator('.print-scenario')).toBeHidden();
    });
  }
  test('phone meter shows the scenario label and never covers the focused control', async ({page}) => {
    await page.setViewportSize({width:390, height:844});
    await page.goto('/tools/budget/leeds/set/');
    await expect(page.locator('[data-controls]')).toBeVisible();
    const meter = page.locator('[data-mobile-result]');
    await expect(meter).toBeHidden();
    await page.locator('[data-service-range]').nth(2).scrollIntoViewIfNeeded();
    await expect(meter).toBeVisible();
    await expect(meter.locator('.meter-label')).toHaveText(`Your scenario | ${FREEZE_MODEL}`);
    await expect(meter.locator('[data-mobile-state]')).toHaveText(/^(Shortfall|Surplus|Balanced)$/);
    expect(await meter.locator('strong').evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBe(32);
    const top = (await meter.boundingBox())!.y;
    for (const index of [3, 5]) {
      const target = page.locator('[data-service-step][data-step="1"]').nth(index);
      await page.evaluate(() => window.scrollTo(0, 0));
      await target.focus();
      const box = (await target.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(top);
    }
    // At 200% zoom (1280 by 720 halves to 640 by 360) the meter stays in the page.
    await page.setViewportSize({width:640, height:360});
    expect(await meter.evaluate(e => getComputedStyle(e).position)).toBe('static');
  });
}
