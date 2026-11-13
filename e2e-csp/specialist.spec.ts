import {test,expect} from '@playwright/test';
for(const path of ['/precepts/','/increases/','/tools/future-cost/'])test(`specialist scripts work under production CSP: ${path}`,async({page})=>{
 const violations:string[]=[];await page.addInitScript(()=>{document.addEventListener('securitypolicyviolation',e=>console.error(`CSP violation: ${e.violatedDirective}`));});page.on('console',m=>{if(m.text().includes('CSP violation'))violations.push(m.text());});
 const response=await page.goto(path);expect(response?.headers()['content-security-policy']).toContain("script-src 'self'");
 if(path==='/tools/future-cost/')await expect(page.locator('[data-final]')).toHaveText('£3,253.78');
 if(path==='/precepts/'){await page.getByLabel('Council with a complete imported schedule').selectOption('E07000117');await page.getByLabel('Parish or locality').selectOption('unparished');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Show the published breakdown'}).click();await expect(page.locator('[data-bill-total]')).toContainText('£2,540.32');}
 if(path==='/increases/'){
  await page.getByLabel('Find a council').fill('Burnley');await expect(page.locator('[data-increases] tbody tr:visible')).toHaveCount(1);
  await page.getByRole('searchbox',{name:'Find my council',exact:true}).fill('Burnley');
  await page.getByRole('button',{name:'Burnley Shire district',exact:true}).click();
  await expect(page.locator('[data-own-change="E07000117"]')).toBeFocused();
  await expect(page.locator('[data-own-change="E07000117"]')).toHaveAttribute('data-increase-selected','');
  const year=page.locator('details[data-increase-year]').first();
  const id=await year.getAttribute('id');
  await page.evaluate(hash=>{location.hash=hash;},`#${id}-district`);
  await expect(year).toHaveAttribute('open','');
 }
 expect(violations).toEqual([]);
});

test('parish filtering works under the production policy',async({page})=>{
 const violations:string[]=[];
 await page.addInitScript(()=>document.addEventListener('securitypolicyviolation',e=>console.error(`CSP violation: ${e.violatedDirective}`)));
 page.on('console',message=>{if(message.text().includes('CSP violation'))violations.push(message.text());});
 const response=await page.goto('/precepts/parishes/burnley/');
 expect(response?.headers()['content-security-policy']).toContain("script-src 'self'");
 await page.getByLabel('Filter parish or local body').fill('Padiham');
 await expect(page.locator('[data-parish-name]:visible')).toHaveCount(1);
 await expect(page.locator('[data-parish-name]:visible')).toContainText('+£5.42');
 expect(violations).toEqual([]);
});
