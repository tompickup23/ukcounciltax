import {test,expect} from '@playwright/test';
for(const path of ['/precepts/','/increases/','/tools/future-cost/'])test(`specialist scripts work under production CSP: ${path}`,async({page})=>{
 const violations:string[]=[];await page.addInitScript(()=>{document.addEventListener('securitypolicyviolation',e=>console.error(`CSP violation: ${e.violatedDirective}`));});page.on('console',m=>{if(m.text().includes('CSP violation'))violations.push(m.text());});
 const response=await page.goto(path);expect(response?.headers()['content-security-policy']).toContain("script-src 'self'");
 if(path==='/tools/future-cost/')await expect(page.locator('[data-final]')).toHaveText('£3,253.78');
 if(path==='/precepts/'){await page.getByLabel('Council with a complete imported schedule').selectOption('E07000117');await page.getByLabel('Parish or locality').selectOption('unparished');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Show the published breakdown'}).click();await expect(page.locator('[data-bill-total]')).toContainText('£2,540.32');}
 if(path==='/increases/'){await page.getByLabel('Find a council').fill('Burnley');await expect(page.locator('[data-increases] tbody tr:visible')).toHaveCount(1);}
 expect(violations).toEqual([]);
});
