import {expect,test,type Page,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function keyboardTo(page:Page,target:Locator) {
  for(let i=0;i<240;i++){if(await target.evaluate(el=>el===document.activeElement))return;await page.keyboard.press('Tab');}
  throw new Error('Scenario control could not be reached by keyboard');
}
async function activate(page:Page,target:Locator){await keyboardTo(page,target);await page.keyboard.press('Enter');}
async function type(page:Page,input:Locator,value:string){await keyboardTo(page,input);await page.keyboard.press('ControlOrMeta+A');await page.keyboard.type(value);}
async function accessible(page:Page) {
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
}
export function scenarioJourneys(widths:(number|undefined)[]=[undefined]) {
  for(const width of widths)for(const slug of ['burnley','birmingham'])for(const theme of ['light','dark'] as const) {
    test(`${slug} scenario by keyboard in ${theme}${width?` at ${width}`:''}`,async({page})=>{
      test.setTimeout(150000);
      if(width)await page.setViewportSize({width,height:width===375?812:900});
      await page.emulateMedia({colorScheme:theme});await page.goto(`/tools/budget/${slug}/`);await page.evaluate(()=>document.fonts.ready);
      const root=page.locator('[data-budget-game]'),stage=root.locator('[data-game-stage]');
      const tables=await page.locator('.budget-tables').allTextContents();
      const storage=await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage},cookie:document.cookie}));
      await activate(page,root.getByRole('button',{name:'Start the game',exact:true}));
      const rounds=slug==='burnley'?5:4;
      for(let i=0;i<rounds;i++){
        await activate(page,stage.getByRole('button',{name:'Skip and reveal',exact:true}));
        await activate(page,stage.getByRole('button',{name:i===rounds-1?'Show summary':'Next round',exact:true}));
      }
      const scoreLink=await stage.locator('[data-game-share]').getAttribute('href');
      const scores=await stage.locator('.game-summary-rows li').allTextContents();
      const requests:string[]=[];const collect=(request:{url():string})=>requests.push(request.url());page.on('request',collect);
      await activate(page,stage.getByRole('button',{name:'Try your version',exact:true}));
      await expect(stage.locator('[data-scenario-heading]')).toBeFocused();
      await expect(stage).toContainText('User requested scenario | budget-scenario 1.0');
      await expect(stage.locator('[data-scenario-assumptions] li')).toHaveCount(5);
      expect(await stage.evaluate(el=>Boolean(el.querySelector('[data-scenario-assumptions]')!.compareDocumentPosition(el.querySelector('input')!)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
      await expect(stage.locator('[data-scenario-rail] li')).toHaveCount(slug==='burnley'?3:2);
      if(slug==='birmingham')await expect(stage.getByRole('button',{name:/County services$/})).toHaveCount(0);
      const inputs=stage.getByRole('spinbutton');await expect(inputs.first()).toHaveValue('0');
      await expect(stage.locator('[data-player-grid] [data-ek-filled]')).toHaveAttribute('data-ek-filled','0');
      await accessible(page);
      await type(page,inputs.nth(0),'60');await expect(stage.locator('[data-player-grid] [data-ek-filled]')).toHaveAttribute('data-ek-filled','60');
      await activate(page,stage.getByRole('button',{name:'Show your version',exact:true}));
      await expect(stage.locator('[role=status]')).toContainText('60p of 100p placed. Place 40p more to show your version.');
      await expect(stage.locator('[data-scenario-result]')).toHaveCount(0);await accessible(page);
      await type(page,inputs.nth(1),'40');await expect(stage.locator('[data-player-grid] [data-ek-filled]')).toHaveAttribute('data-ek-filled','100');
      await inputs.last().scrollIntoViewIfNeeded();
      if(page.viewportSize()!.width===375){const bar=(await stage.locator('.game-check-bar').boundingBox())!;expect(bar.y).toBeGreaterThanOrEqual(0);expect(bar.y+bar.height).toBeLessThanOrEqual(812);}
      await activate(page,stage.getByRole('button',{name:'Show your version',exact:true}));
      await expect(stage.locator('[data-scenario-result]')).toContainText('Any remaining pennies go to the largest fractional remainders, in source order for ties.');
      if(slug==='burnley')await expect(stage.locator('[data-scenario-pence]').first()).toHaveText('£10,809,000');
      if(slug==='burnley')await expect(stage.locator('[data-scenario-pence]').nth(1)).toHaveText('£7,206,000');
      const reference=await stage.locator('[data-published-pence]').allTextContents();
      await accessible(page);
      await type(page,inputs.first(),'59');await expect(stage.locator('[data-scenario-result-slot]')).toContainText('Changed since you showed it. Show your version again.');
      await expect(stage.locator('[data-scenario-pence]')).toHaveCount(0);
      await type(page,inputs.first(),'60');await activate(page,stage.getByRole('button',{name:'Show your version',exact:true}));
      await expect(stage.locator('[data-published-pence]')).toHaveText(reference);
      await activate(page,stage.getByRole('button',{name:'Next screen',exact:true}));
      if(slug==='burnley'){
        await expect(stage.getByRole('heading',{name:'Lancashire County Council services, whole county council area',exact:true})).toBeFocused();
        await expect(stage.locator('[data-scenario-fixed]')).toContainText('£2,759,432,000');
        await type(page,inputs.first(),'50');await type(page,inputs.nth(1),'50');
        await activate(page,stage.getByRole('button',{name:'Show your version',exact:true}));
        await expect(stage.locator('[data-scenario-pence]').first()).toHaveText('£1,379,716,000');await expect(stage.locator('[data-scenario-pence]').nth(1)).toHaveText('£1,379,716,000');
        await activate(page,stage.getByRole('button',{name:/Council services$/}));
        await expect(inputs.first()).toHaveValue('60');await expect(inputs.nth(1)).toHaveValue('40');await expect(stage.locator('[data-scenario-result]')).toBeVisible();
        await activate(page,stage.getByRole('button',{name:/Band D split$/}));
      }
      await expect(stage.getByRole('heading',{name:'Band D split',exact:true})).toBeFocused();
      await expect(stage.locator('[data-scenario-rail] [aria-current=step]')).toContainText('Band D split');
      await expect(inputs.first()).toHaveValue('0');await type(page,inputs.first(),'60');await type(page,inputs.nth(1),'40');
      await activate(page,stage.getByRole('button',{name:'Show your version',exact:true}));
      if(slug==='burnley'){
        await expect(stage.locator('[data-scenario-pence]').first()).toHaveText('£1,529.65');await expect(stage.locator('[data-scenario-pence]').nth(1)).toHaveText('£1,019.77');
        await expect(stage.locator('[data-published-pence]')).toHaveText(['£360.54','£1,801.75','£292.40','£94.73']);
      }
      await accessible(page);await expect(page.locator('.budget-tables')).toHaveText(tables);
      await activate(page,stage.getByRole('button',{name:'Show scenario summary',exact:true}));
      await expect(stage.locator('[data-scenario-summary]')).toContainText('Your version,');await expect(stage.locator('.game-score,[data-game-share]')).toHaveCount(0);
      await expect(stage.getByRole('button',{name:/Copy|Save/})).toHaveCount(0);
      await activate(page,stage.getByRole('button',{name:'Back to your score',exact:true}));
      await expect(stage.locator('.game-summary-rows li')).toHaveText(scores);await expect(stage.locator('[data-game-share]')).toHaveAttribute('href',scoreLink!);
      expect(requests).toEqual([]);page.off('request',collect);
      expect(await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage},cookie:document.cookie}))).toEqual(storage);
      await page.context().grantPermissions(['clipboard-read','clipboard-write']);await stage.getByRole('button',{name:'Copy score link',exact:true}).click();expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(scoreLink);
      await stage.getByRole('button',{name:'Try your version',exact:true}).click();await expect(inputs.first()).toHaveValue('0');
      await inputs.first().fill('60');await stage.getByRole('button',{name:'Reset this screen',exact:true}).click();await expect(inputs.first()).toHaveValue('0');
      await inputs.first().fill('60');await page.reload();await expect(root.getByRole('button',{name:'Start the game',exact:true})).toBeVisible();
      await page.goto(scoreLink!);await expect(stage).toContainText('not verified');await stage.getByRole('button',{name:'Try your version',exact:true}).click();await expect(inputs.first()).toHaveValue('0');
      await stage.getByRole('button',{name:/Band D split$/}).click();await stage.getByRole('button',{name:'Show scenario summary',exact:true}).click();await expect(stage).toContainText('not shown yet');
      await stage.getByRole('button',{name:'Play again',exact:true}).click();await expect(stage.getByRole('heading',{level:3})).toContainText('Guess the split');await expect(stage.getByRole('spinbutton').first()).toHaveValue('0');
      await page.goto(`${scoreLink}&scenario=60,40`);await page.reload();await expect(root.getByRole('button',{name:'Start the game',exact:true})).toBeVisible();
    });
  }
  test('scenario pointer controls update squares and typed invalid values remain invalid',async({page})=>{
    await page.goto('/tools/budget/burnley/#scores=s,s,s,s,s');const stage=page.locator('[data-game-stage]');await stage.getByRole('button',{name:'Try your version',exact:true}).click();
    const slider=stage.getByRole('slider').first();await slider.scrollIntoViewIfNeeded();const rect=(await slider.boundingBox())!;
    await page.mouse.move(rect.x+2,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.3,rect.y+rect.height/2,{steps:6});await page.mouse.up();
    const input=stage.getByRole('spinbutton').first();const placed=Number(await input.inputValue());expect(placed).toBeGreaterThan(0);await expect(stage.locator('[data-player-grid] [data-ek-filled]')).toHaveAttribute('data-ek-filled',String(placed));
    for(const value of ['','1.5','101','-1']) {
      await input.fill(value);await stage.getByRole('button',{name:'Show your version',exact:true}).press('Enter');await expect(input).toHaveValue(value);await expect(stage.locator('[data-scenario-result]')).toHaveCount(0);await expect(stage.locator('[role=status]')).toContainText('Enter whole pence');
    }
    await input.fill('60');await stage.getByRole('spinbutton').nth(1).fill('60');await stage.getByRole('button',{name:'Show your version',exact:true}).press('Enter');await expect(input).toHaveValue('60');await expect(stage.locator('[role=status]')).toContainText('Remove 20p');
  });

  test('scenario controls stay absent without JavaScript and on all nine no return pages',async({browser,page})=>{
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});
    const nojs=await context.newPage();await nojs.goto(new URL('/tools/budget/burnley/',test.info().project.use.baseURL as string).href);
    await expect(nojs.locator('[data-scenario-entry]')).toBeHidden();await expect(nojs.locator('[data-scenario-stage]')).toHaveCount(0);
    await nojs.locator('#published-budget > summary').click();await expect(nojs.locator('#council-budget')).toBeVisible();await context.close();
    for(const slug of ['castle-point','coventry','cumberland','dudley','epping-forest','greenwich','guildford','south-gloucestershire','warwick']) {
      await page.goto(`/tools/budget/${slug}/`);await expect(page.locator('[data-no-budget-return]')).toBeVisible();await expect(page.locator('[data-scenario-entry],[data-budget-scenario-data]')).toHaveCount(0);
    }
  });
  test('small authorities and every Note 4 and Note 8 page retain their observed context',async({page})=>{
    test.setTimeout(120000);
    for(const slug of ['isles-of-scilly','dorset','barnet','colchester','enfield','harborough','king-s-lynn-and-west-norfolk','reigate-and-banstead','rugby','runnymede','windsor-and-maidenhead']) {
      await page.goto(`/tools/budget/${slug}/`);
      const data=JSON.parse((await page.locator('[data-budget-game-data]').textContent())!);
      await page.evaluate(hash=>{location.hash=hash;},`scores=${data.rounds.map(()=>'s').join(',')}`);
      const stage=page.locator('[data-game-stage]');await stage.getByRole('button',{name:'Try your version',exact:true}).click();
      await expect(stage.locator('[data-scenario-fixed]')).toBeVisible();
      const funding=data.rounds.find((round:{kind:string})=>round.kind==='funding');
      for(const note of funding.notes.filter((note:string)=>/MHCLG \[note [48]\]/.test(note)))await expect(stage).toContainText(note.replace(/^MHCLG \[note [48]\]: /,''));
    }
  });
}
