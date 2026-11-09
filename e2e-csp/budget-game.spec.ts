import {expect, test} from '@playwright/test';
for (const slug of ['', 'burnley/', 'birmingham/']) test(`budget game has no actual-header CSP violations: ${slug || 'index'}`, async ({page}) => {
  const violations: string[] = [];
  await page.exposeFunction('budgetCspViolation', (directive: string) => violations.push(directive));
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', event => (window as any).budgetCspViolation(`${event.violatedDirective}: ${event.blockedURI}`)));
  const response = await page.goto(`/tools/budget/${slug}`);
  const policy = response!.headers()['content-security-policy'];
  expect(policy).toBeTruthy();
  expect(policy.match(/script-src[^;]*/)?.[0]).not.toContain("'unsafe-inline'");
  if (slug) {
    const game = page.locator('[data-budget-game]');
    await game.getByRole('button', {name: 'Start the game'}).click();
    const rounds = slug === 'burnley/' ? 5 : 4;
    for (let i = 0; i < rounds; i++) {
      const stage=game.locator('[data-game-stage]');
      if(await stage.getByRole('spinbutton').count())await stage.getByRole('spinbutton').first().fill('100');
      if(await stage.getByRole('radio').count()){await stage.getByRole('radio').first().check();await stage.getByLabel('Size of the change').selectOption('0');}
      await game.getByRole('button', {name: 'Reveal answer',exact:true}).click();
      await expect(game.getByRole('heading', {level: 3})).toContainText('published answer');
      await game.getByRole('button', {name: i === rounds - 1 ? 'Show summary' : 'Next round', exact: true}).click();
    }
    await expect(game.getByRole('heading', {name: 'Your game summary'})).toBeVisible();
    const download=page.waitForEvent('download');await game.getByRole('button',{name:'Save score as PNG'}).click();await download;
    await page.goto(`/tools/budget/${slug}#council-budget`);await expect(page.locator('#published-budget')).toHaveAttribute('open','');
  } else await expect(page.locator('.budget-directory a')).toHaveCount(296);
  expect(violations).toEqual([]);
});
