import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('national precept search leads to council components and a filterable parish table',async({page})=>{
 await page.goto('/precepts/');await page.getByLabel('Find your council by name').fill('Burnley');await page.locator('[data-council-finder] a').filter({hasText:'Burnley'}).click();
 await expect(page).toHaveURL(/\/councils\/burnley\/#precept-breakdown/);
 const breakdown=page.locator('#precept-breakdown');await expect(breakdown).toContainText('Lancashire PCC');await expect(breakdown).toContainText('£292.40');await expect(breakdown).toContainText('already included');
 await page.getByLabel('Filter parish or local body').fill('Padiham');
 await expect(page.locator('[data-parish-name]:visible')).toHaveCount(1);
 await expect(page.locator('[data-parish-name]:visible')).toContainText('£44.06');await expect(page.locator('[data-parish-name]:visible')).toContainText('+£5.42');
 await page.getByLabel('Filter parish or local body').fill('no such parish');await expect(page.locator('[data-parish-count]')).toContainText('0 of 8');
 await page.getByText('View the full Band D history and separate council shares',{exact:true}).click();await expect(page.locator('#long-history')).toContainText('1993/94');
});
test('bundled mayoral services and the City of London exception remain visible',async({page})=>{
 await page.goto('/councils/manchester/');const parts=page.locator('#precept-breakdown');await expect(parts).toContainText('General functions');await expect(parts).toContainText('PCC functions');await expect(parts).toContainText('£153.95');
 await page.goto('/councils/city-of-london/');await expect(page.locator('#precept-breakdown')).toContainText('£176.38');await expect(page.locator('#precept-breakdown tr').filter({hasText:'Police'}).first()).toContainText('£0.00');
});
test('negative parish precepts are shown as published',async({page})=>{
 await page.goto('/councils/east-lindsey/');await page.getByLabel('Filter parish or local body').fill('Beesby');await expect(page.locator('[data-parish-name]:visible')).toContainText('-£2.64');
});
test('national components and parish rows remain readable without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();await page.goto('/councils/burnley/');await expect(page.locator('#precept-breakdown')).toContainText('Lancashire Fire');await expect(page.locator('[data-parish-name]')).toHaveCount(8);await expect(page.getByLabel('Filter parish or local body')).toBeHidden();await context.close();
});
test('national additions are accessible and do not overflow at the project viewport',async({page})=>{
 await page.goto('/councils/burnley/');expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('downloaded parish evidence retains source, status and negative values',async({request})=>{
 const response=await request.get('/downloads/parishes.csv');expect(response.ok()).toBe(true);const csv=await response.text();expect(csv).toContain('"not-existing"');expect(csv).toContain('"-2.64"');expect(csv).toContain('source_sha256');
});
