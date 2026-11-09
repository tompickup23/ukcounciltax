import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('national precept search leads to council components and a filterable parish table',async({page})=>{
 await page.goto('/precepts/');await page.getByLabel('Find your council by name').fill('Burnley');await page.locator('[data-council-finder] a').filter({hasText:'Burnley'}).click();
 await expect(page).toHaveURL(/\/councils\/burnley\/#precept-breakdown/);
 const breakdown=page.locator('#precept-breakdown');await expect(breakdown).toContainText('Lancashire PCC');await expect(breakdown).toContainText('£292.40');await expect(breakdown).toContainText('already included');
 await page.getByText('View the full Band D history and separate council shares',{exact:true}).click();await expect(page.locator('#long-history')).toContainText('1993/94');
 await page.locator('#parish-precepts a[href="/precepts/parishes/burnley/"]').click();await expect(page).toHaveURL(/\/precepts\/parishes\/burnley\//);
 await page.getByLabel('Filter parish or local body').fill('Padiham');
 await expect(page.locator('[data-parish-name]:visible')).toHaveCount(1);
 await expect(page.locator('[data-parish-name]:visible')).toContainText('£44.06');await expect(page.locator('[data-parish-name]:visible')).toContainText('+£5.42');
 await page.getByLabel('Filter parish or local body').fill('no such parish');await expect(page.locator('[data-parish-count]')).toContainText('0 of 8');
 });
test('bundled mayoral services and the City of London exception remain visible',async({page})=>{
 await page.goto('/councils/manchester/');const parts=page.locator('#precept-breakdown');await expect(parts).toContainText('General functions');await expect(parts).toContainText('PCC functions');await expect(parts).toContainText('£153.95');
 await page.goto('/councils/city-of-london/');await expect(page.locator('#precept-breakdown')).toContainText('£176.38');await expect(page.locator('#precept-breakdown tr').filter({hasText:'Police'}).first()).toContainText('£0.00');
});
test('negative parish precepts are shown as published',async({page})=>{
 await page.goto('/precepts/parishes/east-lindsey/');await page.getByLabel('Filter parish or local body').fill('Beesby');await expect(page.locator('[data-parish-name]:visible')).toContainText('-£2.64');
});
test('national components and parish rows remain readable without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();await page.goto('/councils/burnley/');await expect(page.locator('#precept-breakdown')).toContainText('Lancashire Fire');await page.goto('/precepts/parishes/burnley/');await expect(page.locator('[data-parish-name]')).toHaveCount(8);await expect(page.getByLabel('Filter parish or local body')).toBeHidden();await context.close();
});
test('national additions are accessible and do not overflow at the project viewport',async({page})=>{
 for(const path of ['/councils/burnley/','/precepts/parishes/burnley/']) { await page.goto(path);expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true); }
});
test('Sources links to official publications without serving datasets',async({page})=>{
 await page.goto('/data/');
 await expect(page.getByRole('heading',{name:'Sources',exact:true})).toBeVisible();
 await expect(page.locator('a[href^="/downloads/"]')).toHaveCount(0);
 // Thirteen existing publications, three RA files and one ONS population workbook.
 await expect(page.locator('[data-source-publication]')).toHaveCount(17);
 for (const file of ['RA_2026-27_data_Part_1.ods', 'RA_2026-27_data_Part_2.ods', 'SG_2026-27.ods', 'mye25tablesuk.xlsx']) await expect(page.locator(`[data-source-publication] a[href$="${file}"]`)).toHaveCount(1);
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('a Scottish postcode does not claim English national precept coverage',async({page})=>{
 await page.route('https://api.postcodes.io/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({result:{admin_district:'City of Edinburgh',codes:{admin_district:'S12000036'}}})}));
 await page.goto('/precepts/');await page.getByLabel('Your postcode',{exact:true}).fill('EH1 1YZ');await page.getByRole('button',{name:'Find charging area'}).click();
 await expect(page.locator('[data-postcode-status]')).toContainText('currently covers England');await expect(page.locator('[data-postcode-status] a')).toHaveAttribute('href','/coverage/');await expect(page.locator('[data-bill-result]')).toBeHidden();
});
