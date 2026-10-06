import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('future scenario preserves assumptions and rejects invalid source choices',async({page})=>{
 await page.goto('/tools/future-cost/?council=burnley&band=D&rate=0&years=5');
 await expect(page.locator('[data-final]')).toHaveText('£2,549.42');
 await expect(page.locator('[data-extra]')).toHaveText('£0.00');
 await page.goto('/tools/future-cost/?council=missing&band=D&rate=5&years=5');
 await expect(page.locator('[data-share-scenario]')).toBeDisabled();
 await expect(page.locator('[data-scenario-rows] tr')).toHaveCount(0);
});
test('local postcode suggestion requires confirmation and reconciles the parish bill',async({page})=>{
 await page.route('https://api.postcodes.io/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({result:{admin_district:'Burnley',parish:'Padiham',codes:{admin_district:'E07000117'}}})}));
 await page.goto('/precepts/');await page.getByLabel('Your postcode',{exact:true}).fill('BB12 8HF');await page.getByRole('button',{name:'Find charging area'}).click();
 await expect(page.getByLabel('Parish or locality')).toHaveValue('padiham');
 await page.getByRole('button',{name:'Show the published breakdown'}).click();
 await expect(page.locator('[data-bill-result]')).toBeHidden();
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Show the published breakdown'}).click();
 await expect(page.locator('[data-bill-total]')).toContainText('£2,584.38');await expect(page.locator('[data-components] tr')).toHaveCount(5);
 await page.getByText('Model different increases for each component',{exact:true}).click();await page.getByRole('button',{name:'Model these changes'}).click();await expect(page.locator('[data-component-result]')).toContainText('Illustrative annual charge');
 await page.getByLabel('Parish or locality').selectOption('unparished');await expect(page.getByRole('checkbox')).not.toBeChecked();await expect(page.locator('[data-bill-result]')).toBeHidden();expect(page.url()).not.toContain('BB12');
});
test('postcode without local schedule never becomes a zero precept bill',async({page})=>{
 await page.route('https://api.postcodes.io/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({result:{admin_district:'Manchester',parish:'Manchester, unparished area',codes:{admin_district:'E08000003'}}})}));
 await page.goto('/precepts/');await page.getByLabel('Your postcode',{exact:true}).fill('M1 1AA');await page.getByRole('button',{name:'Find charging area'}).click();await expect(page.locator('[data-postcode-status]')).toContainText('not yet imported');await expect(page.locator('[data-bill-result]')).toBeHidden();await expect(page.locator('[name=council]')).toHaveValue('');
});
test('increase explorer changes band and time period without losing source context',async({page})=>{
 await page.goto('/increases/');await page.getByLabel('Find a council').fill('Burnley');await page.getByLabel('Band',{exact:true}).selectOption('A');await expect(page.locator('[data-count]')).toContainText('1 councils shown. Band A');await expect(page.locator('tbody tr:visible')).toHaveCount(1);await page.getByLabel('Compare years').selectOption('2024-25');await expect(page.locator('[data-count]')).toContainText('2024/25 to 2026/27');
});
for(const path of ['/','/precepts/','/tools/future-cost/','/increases/','/scotland/city-of-edinburgh/','/wales/cardiff/'])test(`specialist accessibility and layout: ${path}`,async({page})=>{
 await page.goto(path);expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('no-JavaScript local lookup cannot send a postcode in a URL',async({browser,baseURL})=>{const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();await page.goto('/precepts/');await expect(page.getByRole('button',{name:'Find charging area'})).toBeDisabled();await context.close();});
