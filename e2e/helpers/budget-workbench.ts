import {expect, test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import snapshot from '../../data/pilots/budget-freeze.json' with {type:'json'};

export function budgetWorkbenchJourneys() {
for (const slug of ['leeds', 'hyndburn', 'east-cambridgeshire']) {
  test(`${slug} workbench controls, presets and accessibility`, async ({page}) => {
    const pilot = snapshot.pilots.find(p => p.slug === slug)!;
    const response = await page.goto(`/tools/budget/${slug}/set/`);
    if (test.info().project.testDir.endsWith('e2e-csp')) expect(response?.headers()['content-security-policy']).toContain("script-src 'self'");
    await expect(page.locator('[data-controls]')).toBeVisible();
    await expect(page.locator('.assumptions')).not.toHaveAttribute('open', '');
    await expect(page.locator('.ledger details').first()).not.toHaveAttribute('open', '');
    const preset = page.locator('[data-trigger-preset]');
    const firstChoice = (await preset.boundingBox())!;
    expect(firstChoice.y + firstChoice.height).toBeLessThan(page.viewportSize()!.height);
    await expect(page.locator('[data-mobile-result]')).toBeHidden();
    if (page.viewportSize()!.width >= 1000) expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(3000);
    await page.locator('[data-service-range]').first().scrollIntoViewIfNeeded();
    if (page.viewportSize()!.width < 760) await expect(page.locator('[data-mobile-result]')).toBeVisible();
    await page.locator('[data-service-preset]').click();
    expect(Number(await page.locator('[data-service]').first().inputValue())).toBeCloseTo(Number(pilot.services.find(s => s.editable)!.pence) / 100 * .95, 2);
    await expect(page.locator('[data-own]')).toHaveValue((Number(pilot.priorOwnPence) / 100).toFixed(2));
    await preset.click();
    await expect(page.locator('[data-rule-result]')).toContainText('A referendum would be required');
    await expect(page.locator('[data-service]').first()).toHaveValue((Number(pilot.services.find(s => s.editable)!.pence) / 100).toFixed(2));
    const range = page.locator('[data-service-range]').first();
    await expect(range).toHaveAttribute('step', '0.5');
    await page.locator('[data-service-step][data-step="-1"]').first().click();
    await expect(range).toHaveValue('99.5');
    const actual = Number(await page.locator('[data-service]').first().inputValue());
    await expect(range).toHaveAttribute('aria-valuetext', `£${actual.toLocaleString('en-GB', {minimumFractionDigits:2, maximumFractionDigits:2})}`);
    await page.locator('[data-service-percent][data-percent="110"]').first().click();
    await expect(range).toHaveValue('110');
    for (const button of await page.locator('[data-service-step]').all()) {
      const box = (await button.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44); expect(box.width).toBeGreaterThanOrEqual(44);
    }
    await page.waitForTimeout(300);
    const {announcement, immediate} = await range.evaluate((node: HTMLInputElement) => {
      const region = document.querySelector('[data-announcement]')!;
      const announcement = region.textContent;
      node.value='90';node.dispatchEvent(new Event('input',{bubbles:true}));
      return {announcement, immediate:region.textContent};
    });
    expect(immediate).toBe(announcement);
    await expect(page.locator('[data-announcement]')).not.toHaveText(announcement!);
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
    await page.emulateMedia({forcedColors:'active'});
    expect(await page.locator('.control-card').first().evaluate(e => getComputedStyle(e).borderTopStyle)).toBe('solid');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
  });
}
}
