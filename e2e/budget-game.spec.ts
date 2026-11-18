import {expect, test, type Page, type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ANALYTICS_ORIGINS = ['https://static.cloudflareinsights.com', 'https://cloudflareinsights.com'];

async function keyboardTo(page: Page, target: Locator) {
  for (let i = 0; i < 220; i++) {
    if (await target.evaluate(el => el === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('Control could not be reached by keyboard');
}
async function keyboardActivate(page: Page, target: Locator) {await keyboardTo(page, target); await page.keyboard.press('Enter');}
async function axe(page: Page) {
  const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(result.violations.map(v => ({id: v.id, targets: v.nodes.map(n => n.target)}))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
  if(page.viewportSize()?.width===375)expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(375);
}
for (const slug of ['burnley', 'birmingham']) for (const theme of ['light', 'dark'] as const) {
  test(`${slug} game completes by keyboard in ${theme}`, async ({page}) => {
    test.setTimeout(120_000);
    await page.emulateMedia({colorScheme: theme});
    const external: string[] = [];
    // The site's analytics beacon is on every page and is not part of the game.
    // Its requests are stopped and left out, so this still proves the game itself calls nothing external.
    await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
    await page.route('https://cloudflareinsights.com/**', route => route.abort());
    page.on('request', request => {
      const origin = new URL(request.url()).origin;
      if (ANALYTICS_ORIGINS.includes(origin)) return;
      if (!request.isNavigationRequest() && origin !== new URL(page.url()).origin) external.push(request.url());
    });
    await page.goto(`/tools/budget/${slug}/?postcode=ignore&band=H`);
    const root = page.locator('[data-budget-game]');
    const stage = root.locator('[data-game-stage]');
    await keyboardActivate(page, root.locator('[data-budget-door="guess"]'));
    const rounds = slug === 'burnley' ? 5 : 4;
    for (let i = 0; i < rounds; i++) {
      await expect(root.locator('[data-game-rail] [aria-current=step] .game-stop-number')).toHaveText(String(i+1));
      const heading = await stage.getByRole('heading', {level: 3}).innerText();
      if (heading.startsWith('Guess the split') || heading.startsWith('Your bill')) {
        const input = stage.getByRole('spinbutton').first();
        await keyboardTo(page, input);
        await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type('100');
        await expect(stage.locator('[data-player-grid] [data-ek-filled]')).toHaveAttribute('data-ek-filled','100');
        if (heading.startsWith('Your bill')) {await expect(stage.getByRole('combobox')).toHaveCount(0); await expect(stage).toContainText('Band D');}
      } else if (heading.startsWith('Where the money')) {
        await keyboardActivate(page, stage.getByRole('button', {name: /^Move down:/}).first());
        await expect(stage.locator('[role="status"]')).toContainText('moved to position 2');
      } else {
        await keyboardTo(page, stage.getByRole('radio',{name:'Draw on reserves',exact:true}));
        await page.keyboard.press('Space');
        await expect(stage.getByRole('radio',{name:'Draw on reserves',exact:true})).toBeChecked();
        await keyboardTo(page, stage.getByLabel('Size of the change'));
        await page.keyboard.press('n');
        await expect(stage.getByLabel('Size of the change')).toHaveValue('0');
      }
      await axe(page);
      if (i === 0) {
        await stage.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120));
        await page.screenshot({path: `.ops/budget-game-${slug}-${test.info().project.name}-${theme}.png`});
      }
      await keyboardActivate(page, stage.getByRole('button', {name: 'Reveal answer', exact: true}));
      await expect(stage.getByRole('heading', {level: 3})).toContainText('published answer');
      await expect(stage.locator('.source-line').first()).toContainText('Published');
      await axe(page);
      await keyboardActivate(page, stage.getByRole('button', {name: i === rounds - 1 ? 'Show summary' : 'Next round', exact: true}));
    }
    await expect(stage.getByRole('heading', {name: 'Your game summary'})).toBeVisible();
    await expect(stage.locator('.game-result')).toHaveCount(3);
    await axe(page);
    const href = await stage.locator('[data-game-share]').getAttribute('href');
    const link = new URL(href!);
    expect(link.search).toBe(''); expect(link.hash).toMatch(/^#scores=[\d,]+$/);
    expect(href).not.toMatch(/postcode|band=/);
    const original = await stage.locator(':scope > ul > li').allTextContents();
    await page.goto(href!);
    await expect(stage.getByRole('heading', {name: 'Shared game scores'})).toBeVisible();
    await expect(stage.locator(':scope > ul > li')).toHaveText(original);
    await expect(stage).toContainText('not verified');
    await expect(stage).toContainText('cannot be restored');
    expect(external).toEqual([]);
    expect(await page.evaluate(() => ({local: {...localStorage}, session: {...sessionStorage}}))).toEqual({local: {}, session: {}});
  });
}
test('all rounds can be skipped and invalid share totals can be corrected', async ({page}) => {
  await page.goto('/tools/budget/burnley/');
  const root = page.locator('[data-budget-game]');
  await root.locator('[data-budget-door="guess"]').click();
  await root.getByRole('button', {name: 'Reveal answer', exact: true}).press('Enter');
  await expect(root.locator('[role="status"]')).toContainText('Share exactly 100p');
  const input = root.getByRole('spinbutton').first();
  await root.getByRole('button', {name: /^Increase /}).first().click();
  await expect(input).toHaveValue('1');
  await root.getByRole('button', {name: /^Decrease /}).first().click();
  await expect(input).toHaveValue('0');
  for (let i = 0; i < 5; i++) {
    await root.getByRole('button', {name: 'Skip and reveal'}).click();
    await expect(root).toContainText('Round skipped. No score recorded.');
    await expect(root.locator('[data-game-rail] [data-step-status]').nth(i)).toHaveText('skipped');
    await root.getByRole('button', {name: i === 4 ? 'Show summary' : 'Next round', exact: true}).click();
  }
  await expect(root).toContainText('No scored answers to compare');
  await expect(root.locator('[data-game-share]')).toHaveAttribute('href', /#scores=s,s,s,s,s$/);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await root.getByRole('button', {name: 'Copy score link'}).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await root.locator('[data-game-share]').getAttribute('href'));
  await root.getByRole('button', {name: 'Play again'}).click();
  await expect(root.getByRole('spinbutton').first()).toHaveValue('0');
});
test('invalid shared scores cannot inject markup or create a summary', async ({page}) => {
  await page.goto('/tools/budget/birmingham/#scores=101,2,3,4');
  await expect(page.locator('[data-budget-door="guess"]')).toBeVisible();
  await expect(page.locator('[data-game-rail]')).toBeHidden();
  await expect(page.getByRole('heading', {name: 'Shared game scores'})).toHaveCount(0);
  // W4 part two: a designed message and a fresh start, never a broken board.
  const message = page.locator('.game-unreadable');
  await expect(message.getByRole('heading', {name: 'This score link could not be read'})).toBeVisible();
  await message.getByRole('button', {name: 'Start a fresh game'}).click();
  await expect(page).not.toHaveURL(/#scores/);
  await expect(page.locator('[data-game-rail] [aria-current=step] .game-stop-number')).toHaveText('1');
  for (const hash of ['#scores=', '#scores=1,2', '#scores=a,b,c,d', '#scores']) {
    await page.goto('/tools/budget/birmingham/'); await page.goto(`/tools/budget/birmingham/${hash}`); await page.reload();
    await expect(page.locator('.game-unreadable')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  }
});

test('W4 part two: the reveal pairs the waffles with a dot plot, gap bars and one table twin', async ({page}) => {
  await page.goto('/tools/budget/burnley/');
  await page.locator('[data-budget-door="guess"]').click();
  const stage = page.locator('[data-game-stage]');
  const inputs = stage.getByRole('spinbutton');
  for (const [i, value] of [5, 30, 25, 25, 15].entries()) await inputs.nth(i).fill(String(value));
  await stage.getByRole('button', {name: 'Reveal answer', exact: true}).click();
  await expect(stage.locator('.game-score-panel')).toContainText('out of 100');
  await expect(stage.locator('.game-reveal-waffles [data-ek-square]')).toHaveCount(200);
  const dots = stage.locator('svg.game-dots');
  await expect(dots).toHaveCount(1);
  await expect(dots.locator('circle.game-dot-pub')).toHaveCount(6);
  expect((await dots.locator('text').allTextContents()).join(' ')).toContain('RA_LA_Data_2026-27');
  await expect(stage.locator('.game-gap-row')).toHaveCount(5);
  const twin = stage.locator('.game-twin');
  await twin.locator('summary').click();
  await expect(twin.locator('tbody tr')).toHaveCount(5);
  await expect(twin.locator('tbody tr').first()).toContainText('Adult Social Care');
  await expect(twin.locator('tbody tr').nth(1)).toContainText('30p');
  // Chart titles stay under the round heading (F1).
  const sizes = await stage.evaluate(el => ({round: parseFloat(getComputedStyle(el.querySelector('h3')!).fontSize), titles: [...el.querySelectorAll('h4')].map(h => parseFloat(getComputedStyle(h).fontSize))}));
  for (const size of sizes.titles) expect(size).toBeLessThan(sizes.round);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test('W4 part two: the end card has a grade, three closest and three furthest calls, a stamp, and a PNG from the canvas', async ({page}) => {
  test.setTimeout(90_000);
  const requests: string[] = [];
  await page.goto('/tools/budget/burnley/');
  await page.locator('[data-budget-door="guess"]').click();
  const stage = page.locator('[data-game-stage]');
  for (let i = 0; i < 5; i++) {
    if (await stage.getByRole('spinbutton').count()) await stage.getByRole('spinbutton').first().fill('100');
    if (await stage.getByRole('radio').count()) {await stage.getByRole('radio').first().check(); await stage.getByLabel('Size of the change').selectOption('2');}
    await stage.getByRole('button', {name: 'Reveal answer', exact: true}).click();
    await stage.getByRole('button', {name: i === 4 ? 'Show summary' : 'Next round', exact: true}).click();
  }
  const card = stage.locator('[data-game-score-card]');
  await expect(card.locator('.game-end-grade strong')).toHaveText(/^[A-E]$/);
  await expect(card.locator('.game-end-calls ol').first().locator('li')).toHaveCount(3);
  await expect(card.locator('.game-end-calls ol').last().locator('li')).toHaveCount(3);
  await expect(card.locator('.game-end-stamp')).toHaveText('Scored against published figures');
  await expect(card.locator('.game-end-source')).toContainText('Ministry of Housing, Communities and Local Government');
  await expect(stage.locator('svg.ek-chart .ek-score-total')).toHaveText(/^\d+$/);
  page.on('request', request => {if (!request.url().startsWith('data:')) requests.push(request.url());});
  const download = page.waitForEvent('download');
  await stage.getByRole('button', {name: 'Save score as PNG'}).click();
  const file = await (await download).path();
  const {readFileSync} = await import('node:fs');
  const bytes = readFileSync(file!);
  expect(bytes.subarray(1, 4).toString()).toBe('PNG');
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.length).toBeLessThan(400_000);
  test.info().annotations.push({type: 'png-bytes', description: String(bytes.length)});
  expect(requests).toEqual([]);
  expect(page.url()).not.toMatch(/#/);
  expect(await page.evaluate(() => ({local: {...localStorage}, session: {...sessionStorage}}))).toEqual({local: {}, session: {}});
  // A restored link has no guesses, so the card says so and the stamp says it is not verified.
  await page.goto(await stage.locator('[data-game-share]').getAttribute('href') as string);
  await expect(card.locator('.game-end-stamp')).toHaveText('Shared score, not verified');
  await expect(card.locator('.game-end-calls li')).toHaveCount(0);
});


test('62p stays in the round, sliders recolour squares and the phone check bar stays visible', async ({page}) => {
  await page.goto('/tools/budget/burnley/');
  await page.locator('[data-budget-door="guess"]').click();
  const stage=page.locator('[data-game-stage]');const numbers=stage.getByRole('spinbutton');
  await numbers.first().fill('62');
  const check=stage.getByRole('button',{name:'Reveal answer',exact:true});
  await expect(check).toHaveAttribute('aria-disabled','true');await expect(check).not.toHaveAttribute('disabled','');
  await check.press('Enter');await expect(stage.locator('[role=status]')).toContainText('Share exactly 100p using whole pence.');
  await expect(stage.getByRole('heading',{level:3})).not.toContainText('published answer');
  const slider=stage.getByRole('slider').first();await slider.evaluate(el=>el.scrollIntoView({block:'center'}));
  const rect=(await slider.boundingBox())!;
  await page.mouse.move(rect.x+rect.width*0.62,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width*0.3,rect.y+rect.height/2,{steps:8});await page.mouse.up();
  expect(Number(await numbers.first().inputValue())).not.toBe(62);
  const total=(await numbers.evaluateAll(inputs=>inputs.reduce((sum,node)=>sum+Number((node as HTMLInputElement).value),0)));
  await expect(stage.locator('[data-player-grid] [data-ek-filled]')).toHaveAttribute('data-ek-filled',String(total));
  await numbers.last().scrollIntoViewIfNeeded();
  if(page.viewportSize()!.width===375){const box=(await stage.locator('.game-check-bar').boundingBox())!;expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(page.viewportSize()!.height);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(375);}
});

test('drawer hashes open the published tables and a restored score saves a PNG', async ({page}) => {
  await page.goto('/tools/budget/burnley/#county-budget');await expect(page.locator('#published-budget')).toHaveAttribute('open','');
  await page.goto('/tools/budget/burnley/#scores=100,50,s,0,100');
  await expect(page.locator('[data-game-score-card]')).toContainText('250 out of 400');
  const result=page.waitForEvent('download');await page.getByRole('button',{name:'Save score as PNG'}).click();
  expect((await result).suggestedFilename()).toBe('burnley-budget-game-score.png');
});

test('without JavaScript the lead explains the game and the published tables remain available', async ({browser}) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});const page=await context.newPage();
  await page.goto((test.info().project.use.baseURL as string)+'/tools/budget/burnley/');
  await expect(page.locator('noscript p')).toHaveText("The game needs JavaScript. Burnley's published budget, with the same figures, is in the tables below.");
  await expect(page.locator('noscript p')).toBeVisible();
  await expect(page.locator('[data-game-rail]')).toBeHidden();await expect(page.locator('[data-game-route] > li')).toHaveCount(5);await expect(page.locator('[data-game-route]')).toBeVisible();await page.locator('#published-budget > summary').click();
  await expect(page.locator('#council-budget')).toBeVisible();await expect(page.locator('#published-budget [data-published-round]')).toHaveCount(5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(375);await context.close();
});

test('W4 play frame: one start control, Your move per screen, a stepper that scrolls inside itself and turns static on a short screen', async ({page}) => {
  await page.goto('/tools/budget/burnley/');
  await expect(page.locator('.game-desk [data-game-route] > li')).toHaveCount(5);
  await expect(page.locator('.game-desk [data-ek-square]')).toHaveCount(0);
  await expect(page.locator('[data-game-start], [data-budget-modes]')).toHaveCount(0);
  await expect(page.getByText('Start the game', {exact: true})).toHaveCount(0);
  await page.locator('[data-budget-door="guess"]').click();
  const stage = page.locator('[data-game-stage]'), rail = page.locator('[data-game-rail]');
  await expect(stage.locator('.game-move')).toHaveCount(1);
  await expect(stage.locator('.game-move')).toContainText('Your move');
  for (let i = 0; i < 3; i++) {
    await stage.getByRole('button', {name: 'Skip and reveal', exact: true}).click();
    await expect(stage.locator('.game-move')).toContainText('next round');
    await stage.getByRole('button', {name: 'Next round', exact: true}).click();
  }
  await expect(rail.locator('[aria-current=step] .game-stop-number')).toHaveText('4');
  const state = () => rail.evaluate(list => {
    const box = list.getBoundingClientRect(), current = list.querySelector('[aria-current=step]')!.getBoundingClientRect();
    return {position: getComputedStyle(list).position, inside: current.left >= box.left - 1 && current.right <= box.right + 1, page: document.documentElement.scrollWidth - document.documentElement.clientWidth};
  });
  const width = page.viewportSize()!.width;
  await page.evaluate(() => window.scrollBy(0, 400));
  expect(await state()).toEqual({position: 'sticky', inside: true, page: 0});
  if (width === 375) expect(await rail.evaluate(list => list.scrollWidth > list.clientWidth)).toBe(true);
  await page.setViewportSize({width: 720, height: 450});
  expect((await state()).position).toBe('static');
  await page.setViewportSize({width, height: 800});
});
