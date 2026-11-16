import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const route of ['', 'leeds/', 'burnley/', 'camden/']) {
  for (const theme of ['light', 'dark'] as const) {
    test(`budget doors ${route || 'hub'} in ${theme}`, async ({page}) => {
      await page.emulateMedia({colorScheme: theme});
      await page.goto(`/tools/budget/${route}`);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
      const doors = page.locator(route ? '[data-budget-door]' : '[data-play-door]');
      await expect(doors).toHaveCount(2);
      for (const door of await doors.all()) {
        const bounds = await door.boundingBox();
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
      }
      if (route) {
        // W4: the doors are the one way to Guess and to Set; no mode links repeat them, and there is no second start button.
        await expect(page.locator('[data-budget-modes]')).toHaveCount(0);
        await expect(page.locator('[data-game-start]')).toHaveCount(0);
        const setDoor = page.locator('[data-budget-door="set"]');
        await expect(page.locator('[data-budget-set-entry]')).toHaveCount(1);
        await expect(setDoor.locator('[data-budget-set-entry]')).toHaveCount(route === 'burnley/' ? 0 : 1);
        if (route === 'burnley/') await expect(setDoor).toContainText("Explore the council's own gap");
        await expect(page.locator('#game-heading')).toHaveText(`Could you set ${route === 'leeds/' ? 'Leeds' : route === 'burnley/' ? 'Burnley' : 'Camden'}'s budget?`);
      } else {
        await expect(page.locator('th.picker-action')).toHaveText('Set');
        await expect(page.locator('.featured-strip img')).toHaveCount(3);
      }
      expect((await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    });
  }
}

for (const slug of ['leeds', 'burnley', 'camden']) {
  test(`${slug} score card offers Set only when eligible`, async ({page}) => {
    await page.goto(`/tools/budget/${slug}/`);
    await page.locator('[data-budget-door="guess"]').click();
    const rounds = await page.locator('[data-game-route] > li').count();
    for (let round = 0; round < rounds; round++) {
      await page.getByRole('button', {name: 'Skip and reveal', exact: true}).click();
      await page.getByRole('button', {name: round === rounds-1 ? 'Show summary' : 'Next round', exact: true}).click();
    }
    const next = page.locator('[data-game-score-card] a');
    if (slug === 'burnley') await expect(next).toHaveCount(0);
    else {
      await expect(next).toHaveText('Now set it yourself');
      await expect(next).toHaveAttribute('href', `/tools/budget/${slug}/set/`);
    }
  });
}
