import {requireImages} from './og-policy.mjs';
import {JSDOM} from 'jsdom';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
// A5 bundle: 4034 gzip bytes, plus 6000 for A6 and 4000 for the C1b scenario.
export const GAME_GZIP_CEILING=4034+6000+4000;
export function budgetGameProblems(html,slug,dist) {
  const doc=JSDOM.fragment(html);const title=doc.querySelector('title')?.textContent ?? '';const problems=[];
  const fail=(test,message)=>{if(!test)problems.push(`${slug}: ${message}`);};
  const roots=doc.querySelectorAll('[data-budget-game]');
  const notice=doc.querySelector('[data-no-budget-return]');
  if(notice&&slug==='coventry'){
    const before=JSON.parse(readFileSync(join(process.cwd(),'tests/fixtures/c1b-static-numbers.json'),'utf8'));
    fail(JSON.stringify(staticGameNumbers(html))===JSON.stringify(before[slug]),'static page numbers changed during C1b');
  }
  if(notice){
    fail(roots.length===0,'a no return page has a game');
    fail(doc.querySelectorAll('[data-scenario-entry],[data-budget-scenario-data]').length===0,'a no return page has a scenario');
    const parts=title.match(/^(.*?) budget (\d{4}\/\d{2}): no return received \| UK Council Tax$/);
    fail(parts,'no return title changed');
    if(parts){
      fail(doc.querySelector('h1')?.textContent===`${parts[1]} budget`,'no return H1 changed');
      fail(notice.querySelector('p')?.textContent===`No ${parts[2]} return for ${parts[1]} was received in time for MHCLG's publication on 11 June 2026. No budget game or earlier year's budget is shown. The bill breakdown below comes from the separate council tax return.`,'no return notice changed');
    }
    return {problems,available:false};
  }
  fail(roots.length===1,'expected one game');
  if(roots.length!==1){return {problems,available:true};}
  if(['burnley','birmingham','coventry'].includes(slug)){
    const before=JSON.parse(readFileSync(join(process.cwd(),'tests/fixtures/c1b-static-numbers.json'),'utf8'));
    fail(JSON.stringify(staticGameNumbers(html))===JSON.stringify(before[slug]),'static page numbers changed during C1b');
  }
  const root=roots[0];const data=JSON.parse(root.querySelector('[data-budget-game-data]').textContent);
  const name=root.getAttribute('data-council-name');
  const entries=root.querySelectorAll('[data-scenario-entry]');
  fail(entries.length===1&&entries[0].hasAttribute('hidden'),'expected one hidden scenario entry');
  const scenario=JSON.parse(root.querySelector('[data-budget-scenario-data]')?.textContent??'null');
  fail(scenario?.model==='budget-scenario 1.0','scenario model missing');
  fail(scenario?.screens.length===data.rounds.filter(r=>r.kind==='split'||r.kind==='bill').length,'scenario screens differ from published rounds');
  fail(doc.querySelector('h1')?.textContent===`Could you set ${name}'s budget?`,'question H1 changed');
  fail(title===`${name} budget game ${data.year} | UK Council Tax`,'title changed');
  fail(root.querySelectorAll('[data-game-route] > li').length===data.rounds.length,'opening rail does not name every round');
  fail(root.querySelectorAll('.game-lead [data-ek-square]').length===0,'a grid is drawn before round one');
  const drawer=doc.querySelector('#published-budget');
  fail(drawer?.querySelector('#council-budget'),'council anchor is outside drawer');
  if(data.rounds.filter(r=>r.kind==='split').length===2)fail(drawer?.querySelector('#county-budget'),'county anchor is outside drawer');
  for(const [i,round] of data.rounds.entries()) {
    const template=root.querySelector(`template[data-game-published="${i}"]`);
    const published=drawer?.querySelector(`[data-published-round="${i}"]`);
    fail(template&&published,`missing published round ${i}`);
    if(round.kind==='split'||round.kind==='bill'){
      fail(round.items.length<=12,`round ${i} exceeds 12 parts`);
      fail(root.querySelector(`template[data-game-grid="${i}"]`)?.content.querySelectorAll('[data-ek-square]').length===100,`round ${i} grid is not 100 squares`);
      for(const chart of [template?.content,published].filter(Boolean)){
        const counts=[...chart.querySelectorAll('[data-ek-squares]')].map(node=>Number(node.getAttribute('data-ek-squares')));
        fail(counts.reduce((a,b)=>a+b,0)===100,`round ${i} published squares do not sum to 100`);
        const sourceText=[...chart.querySelectorAll('svg text')].map(node=>node.textContent).join(' ');
        fail(sourceText.includes(round.kind==='split'?'RA_LA_Data_2026-27':'Table 10'),`round ${i} lacks its source inside the SVG`);
        if(slug==='burnley'&&(i===0||round.kind==='bill'))fail(JSON.stringify(counts)===JSON.stringify(i===0?[0,12,29,32,27]:[14,71,11,4]),`Burnley anchor fails at round ${i}`);
      }
    }
    for(const chart of [template?.content,published].filter(Boolean)){
      const links=[...chart.querySelectorAll('[data-chart-png]')];fail(links.length===1 && /-light\.png$/.test(links[0]?.getAttribute('href') ?? ''),`round ${i} needs one light PNG action`);
      if(requireImages(dist))for(const link of links)fail(existsSync(join(dist,link.getAttribute('href'))),`missing PNG ${link.getAttribute('href')}`);
    }
  }
  const script=[...doc.querySelectorAll('script[src]')].map(node=>node.getAttribute('src')).find(src=>src.includes('BudgetGame.'));
  fail(script,'missing external game script');
  if(script){const size=gzipSync(readFileSync(join(dist,script))).length;fail(size<=GAME_GZIP_CEILING,`game gzip ${size} exceeds ${GAME_GZIP_CEILING}`);}
  const card=doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
  fail(card&&new URL(card).pathname===`/og/budget/${slug}.png`,'wrong static game card');
  if(card&&requireImages(dist))fail(existsSync(join(dist,new URL(card).pathname)),'static game card missing');
  return {problems,available:true};
}
export function gameHeaderProblem(text) {
  // The source template is unchanged; built script hashes are intentionally variable.
  const hash=createHash('sha256').update(text).digest('hex');
  return hash===HEADER_SHA256?[]:['public/_headers changed during A6'];
}
const HEADER_SHA256='f669fb2fb6fa4b08947d5fbab512bcf7001d75fbb5dc6c2628b9af27ebb660fc';
export function publishedText(html) {
  const doc=JSDOM.fragment(html);const title=doc.querySelector('title')?.textContent ?? '';
  const text=[...doc.querySelectorAll('.budget-tables, [data-no-budget-return], #your-bill, [data-budget-game-data], .band-selector, [data-per-resident]')].map(node=>node.textContent.replace(/\s+/g,' ').trim());
  return text;
}

// Include the complete static page, with executable and inert template content removed.
export function staticGameNumbers(html) {
  const doc=new JSDOM(html).window.document;
  doc.querySelectorAll('script,style,template').forEach(node=>node.remove());
  return doc.body.textContent.match(/\d[\d,.]*(?:%|p)?/g)??[];
}
