import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for(const path of ['/council-tax/ranked/unitary-authorities/','/council-tax/ranked/shire-districts/','/precepts/parishes/lancaster/','/precepts/parishes/']) {
 test(`new sourced page is accessible in both themes: ${path}`,async({page})=>{
  await page.goto(path);
  for(const theme of ['light','dark']) {
   await page.evaluate(value=>document.documentElement.dataset.theme=value,theme);
   expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 });
}
test('class rankings remain complete without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});
 const page=await context.newPage();await page.goto('/council-tax/ranked/shire-districts/');
 await expect(page.locator('main tbody tr')).toHaveCount(164);
 await expect(page.locator('main tbody tr').filter({hasText:'Havant'})).toContainText('21=');
 await expect(page.locator('main tbody tr').last()).toContainText('pending approval');
 await context.close();
});
