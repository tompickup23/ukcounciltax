import {expect, test, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import snapshot from '../../data/pilots/budget-freeze.json' with {type:'json'};
import rules from '../../data/pilots/budget-freeze-referendum.json' with {type:'json'};
const inputPounds = (pence: string | bigint) => { const n = BigInt(pence); return `${n/100n}.${String(n%100n).padStart(2,'0')}`; };

const slugs = ['huntingdonshire','trafford','camden'];
async function accessible(page: Page) {
  await page.locator('.ledger details').first().locator('summary').click();
  const result = await new AxeBuilder({page}).analyze();
  expect(result.violations.map(v => ({id:v.id,targets:v.nodes.map(n => n.target)}))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
  expect(await page.locator('.ledger .table-wrap').evaluate(e => e.scrollHeight <= e.clientHeight)).toBe(true);
  for (const el of await page.locator('.ledger .table-wrap, [data-controls] input').all()) {
    expect(await el.evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
  }
  // The workbench closes its disclosures on arrival; audit what is inside them too.
  await page.evaluate(() => document.querySelectorAll('main details').forEach(d => { d.open = true; }));
  const opened = await new AxeBuilder({page}).analyze();
  expect(opened.violations.map(v => ({id:v.id,targets:v.nodes.map(n => n.target)}))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
}
export function budgetSetJourneys() {
  for (const width of [375,1440]) for (const theme of ['light','dark'] as const) for (const slug of slugs) {
    const pilot = snapshot.pilots.find(p => p.slug === slug)!;
    const rule = rules.principles[pilot.rule as keyof typeof rules.principles];
    const prior = BigInt(pilot.priorOwnPence);
    let crossing = prior+(prior*BigInt(rule.percentageBasisPoints)+9999n)/10000n;
    if (rule.join === 'AND') crossing = crossing > prior+BigInt(rule.poundPence!)+1n ? crossing : prior+BigInt(rule.poundPence!)+1n;
    test(`${slug} set budget at ${width} in ${theme}`, async ({page}) => {
      await page.setViewportSize({width,height:width === 375 ? 812 : 900});
      await page.emulateMedia({colorScheme:theme});
      const errors: string[] = [], violations: string[] = [], external: string[] = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', r => { if (!new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/)) external.push(r.url()); });
      await page.addInitScript(() => {
        Object.defineProperty(window, '__c2Storage', {value:[]});
        for (const name of ['getItem','setItem','removeItem','clear'] as const) {
          const original = Storage.prototype[name];
          Object.defineProperty(Storage.prototype, name, {value:function(...args: unknown[]) {
            (window as unknown as {__c2Storage:string[]}).__c2Storage.push(name);
            return Reflect.apply(original,this,args);
          }});
        }
        document.addEventListener('securitypolicyviolation', e => (window as unknown as {__c2Csp:string[]}).__c2Csp.push(e.violatedDirective));
        Object.defineProperty(window, '__c2Csp', {value:[]});
      });
      const response = await page.goto(`/tools/budget/${slug}/set/`);
      if (test.info().project.testDir.endsWith('e2e-csp')) expect(response?.headers()['content-security-policy']).toContain("script-src 'self'");
      await expect(page.locator('[data-controls]')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('[data-result-status]')).toBeVisible();
      await expect(page.locator('.ledger details').first()).not.toHaveAttribute('open', '');
      const ledger = await page.locator('.ledger table').textContent();
      const freeze = await page.locator('[data-remaining]').textContent();
      const own = page.locator('[data-own]');
      await own.fill(inputPounds(crossing-1n));
      await expect(page.locator('[data-rule-result]')).toContainText('below the level that would need a referendum');
      await own.focus(); await own.press('ArrowUp');
      await expect(own).toHaveValue(inputPounds(crossing));
      await expect(page.locator('[data-rule-result]')).toContainText('A referendum would be required');
      for (const value of ['', '-1', '1.001', inputPounds(BigInt(pilot.ownPence)*2n+1n)]) {
        await own.fill(value);
        await expect(page.locator('[data-error]')).toBeVisible();
        await expect(page.locator('[data-result-status]')).toBeHidden();
        expect(await page.locator('.ledger table').textContent()).toBe(ledger);
      }
      await page.locator('[data-published-reset]').click();
      await expect(page.locator('[data-remaining]')).toHaveText('£0');
      await expect(page.locator('[data-remaining-exact]')).toHaveText('£0.00');
      await expect(page.locator('[data-state]')).toContainText('arithmetic balances');
      // W3: the neutral stamp shows only at an exact zero, and the gap bar sits on its target line.
      await expect(page.locator('[data-stamp]')).toBeVisible();
      await expect(page.locator('[data-state-word]')).toHaveText('Balanced');
      await expect(page.locator('.set-desk [data-gap-bar]')).toHaveAttribute('data-side', 'none');
      const service = page.locator('[data-service]').first();
      const published = await service.inputValue();
      const slider = page.locator('[data-service-range]').first();
      await slider.focus(); await slider.press('ArrowLeft');
      expect(Number(await service.inputValue())).toBeCloseTo(Number(published) * 0.995, 2);
      await service.locator('xpath=ancestor::details').locator('summary').click();
      await service.fill('0');
      await expect(page.locator('[data-remaining]')).not.toHaveText('£0');
      await expect(page.locator('[data-stamp]')).toBeHidden();
      await expect(page.locator('[data-state-word]')).toHaveText('Surplus');
      await expect(page.locator('.set-desk [data-gap-bar]')).toHaveAttribute('data-side', 'surplus');
      await service.fill('0.001');
      await expect(page.locator('[data-error]')).toBeVisible();
      await page.locator('[data-freeze-reset]').click();
      await expect(page.locator('[data-remaining]')).toHaveText(freeze!);
      await expect(service).toHaveValue(published);
      expect(await page.locator('.ledger table').textContent()).toBe(ledger);
      await accessible(page);
      await page.locator('[data-theme-toggle]').click();
      expect(await page.locator('html').getAttribute('data-theme')).toBe(theme === 'light' ? 'dark' : 'light');
      await page.locator('[data-theme-toggle]').click();
      const requests: string[] = [];
      page.on('request', r => requests.push(r.url()));
      await own.fill(inputPounds(crossing));
      await page.locator('[data-freeze-reset]').click();
      expect(requests).toEqual([]);
      expect(await page.evaluate(() => (window as unknown as {__c2Storage:string[]}).__c2Storage)).toEqual([]);
      violations.push(...await page.evaluate(() => (window as unknown as {__c2Csp:string[]}).__c2Csp));
      expect(violations).toEqual([]); expect(errors).toEqual([]); expect(external).toEqual([]);
      await page.evaluate(() => window.scrollTo(0,0));
      if (slug === 'trafford') {
        await page.screenshot({path:`output/playwright/c2-set-${width}-${theme}.png`});
        await page.locator('.tax-control').scrollIntoViewIfNeeded();
        await page.screenshot({path:`output/playwright/c2-controls-${width}-${theme}.png`});
        await page.locator('.ledger table').scrollIntoViewIfNeeded();
        await page.screenshot({path:`output/playwright/c2-ledger-${width}-${theme}.png`});
      }
      await page.reload();
      await expect(own).toHaveValue(inputPounds(pilot.priorOwnPence));
    });
    test(`${slug} static budget at ${width} in ${theme}`, async ({browser,baseURL}) => {
      const context = await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width,height:900},colorScheme:theme});
      const page = await context.newPage();
      const response = await page.goto(`/tools/budget/${slug}/set/`);
      await expect(page.locator('[data-controls]')).toBeHidden();
      await expect(page.locator('[data-copy]')).toBeHidden();
      await expect(page.locator('[data-theme-toggle]')).toBeHidden();
      await expect(page.locator('.ledger tbody tr')).toHaveCount(pilot.ledger.length);
      await expect(page.locator('[data-remaining]')).toBeVisible();
      await page.locator('.assumptions > summary').click();
      await expect(page.locator('.assumptions .baseline')).toBeVisible();
      await expect(page.locator('.assumptions ul').first()).toBeVisible();
      await expect(page.locator('noscript .notice')).toBeVisible();
      await expect(page.locator('noscript .notice')).toContainText('controls need JavaScript');
      await expect(page.locator('.referendum-rule')).toContainText('A referendum would be required');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      // Axe needs timers. Audit a copy of the observed no-script DOM with all
      // page scripts removed, preserving the rendered noscript content and CSS.
      const staticHtml = (await page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<noscript>([\s\S]*?)<\/noscript>/gi, '$1');
      const auditContext = await browser.newContext({baseURL,viewport:{width,height:900},colorScheme:theme});
      const auditPage = await auditContext.newPage();
      const policy = response?.headers()['content-security-policy'];
      await auditPage.route(page.url(), route => route.fulfill({status:200,contentType:'text/html',body:staticHtml,headers:policy ? {'content-security-policy':policy} : {}}));
      await auditPage.goto(page.url());
      await expect(auditPage.locator('[data-controls]')).toBeHidden();
      expect(await auditPage.locator('.ledger').textContent()).toBe(await page.locator('.ledger').textContent());
      await accessible(auditPage);
      await auditContext.close();
      await context.close();
    });
  }
  for (const width of [375,1440]) for (const theme of ['light','dark'] as const) {
    test(`Burnley retains both entries at ${width} in ${theme}`, async ({page}) => {
      await page.setViewportSize({width,height:900});
      await page.emulateMedia({colorScheme:theme});
      await page.route('https://static.cloudflareinsights.com/**', route => route.fulfill({status:200,body:''}));
      await page.goto('/tools/budget/burnley/');
      const entry = page.locator('[data-budget-set-entry]');
      await expect(entry).toHaveText('The parish amounts in the budget and tax returns do not reconcile within the published precision.');
      await expect(page.locator('[data-scenario-game-link]')).toHaveAttribute('href','/councils/burnley/budget-game/');
      await expect(page.locator('[data-budget-door="set"]')).toHaveAttribute('href','/councils/burnley/budget-game/');
      // The reason sits under the doors, labelled, not inside the Set door's link text.
      expect(await entry.evaluate(e => !!e.closest('[data-budget-doors]') && !e.closest('[data-budget-door]'))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await entry.scrollIntoViewIfNeeded();
      await page.screenshot({path:`output/playwright/c2-excluded-${width}-${theme}.png`});
    });
  }

}
