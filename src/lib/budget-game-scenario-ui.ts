import {allocatePence,BUDGET_SCENARIO_MODEL,SCENARIO_ASSUMPTIONS,SCENARIO_ROUNDING,scenarioShares} from './budget-scenario';
import {gameElement as el,gameButton as button,splitControls} from './budget-game-controls';
import type {ScenarioData,ScenarioScreen} from './budget-game-scenario-data';
import type {GameSource} from './budget-game';

const money=(pence:number,bill=false)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',minimumFractionDigits:bill||pence%100!==0?2:0,maximumFractionDigits:2}).format(pence/100);
function sourceLine(source:GameSource) {
  const p=el('p','Source: ','source-line');const link=el('a',`${source.publisher}, ${source.title}`);link.href=source.url;
  p.append(link,`. ${source.table??''}. ${source.date?`Published ${new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${source.date}T00:00:00Z`))}.`:''}`);return p;
}
export function createScenario(root:HTMLElement,stage:HTMLElement,data:ScenarioData,back:()=>void,play:()=>void) {
  interface State {values:string[]; result:number[]|null; dirty:boolean}
  let states:State[]=[];let current=0;
  const clear=()=>{states=data.screens.map(screen=>({values:screen.items.map(()=>'0'),result:null,dirty:false}));current=0;};
  clear();
  function focus(heading:HTMLElement) {
    heading.tabIndex=-1;heading.focus({preventScroll:true});
    queueMicrotask(()=>heading.scrollIntoView({block:'start'}));
  }
  function lead() {
    root.querySelector<HTMLElement>('[data-game-rail]')!.hidden=true;
    stage.replaceChildren();stage.dataset.scenarioStage='';
    const heading=el('h2','Your version: illustrative scenario');heading.dataset.scenarioHeading='';stage.append(heading,el('p',`User requested scenario | ${BUDGET_SCENARIO_MODEL}`,'eyebrow'));
    return heading;
  }
  function rail() {
    const list=el('ol','','game-rail');list.dataset.scenarioRail='';list.setAttribute('aria-label','Scenario progress');
    data.screens.forEach((screen,index)=>{
      const item=el('li');if(index===current)item.setAttribute('aria-current','step');if(states[index].result)item.classList.add('done');
      const control=button('',()=>showScreen(index));control.className='game-scenario-stop';control.setAttribute('aria-label',`${index+1} ${screen.stop}`);
      control.append(el('span',String(index+1),'game-stop-number'),' ',el('span',screen.stop,'game-stop-name'));item.append(control);list.append(item);
    });
    stage.append(list);
  }
  function sources(screen:ScenarioScreen,parent:HTMLElement) {
    parent.append(sourceLine(screen.round.source),el('p',screen.sourceDetail,'small'));
    for(const context of screen.round.context??[])parent.append(el('p',context.text),sourceLine(context.source));
    const provenance=el('details');provenance.append(el('summary','Pinned source editions and file hashes'));
    for(const item of data.sources) {
      const p=el('p',`${item.key}: ${item.sha256}`,'source-line');provenance.append(sourceLine(item.source),p);
    }
    parent.append(provenance);
  }
  function observedNotes(screen:ScenarioScreen,parent:HTMLElement) {
    const notes=el('section');notes.dataset.recordType='observation';
    if(screen.round.notes.length)notes.append(el('h4',screen.kind==='split'?'Observed net income, outside this exercise':'Observed bill notes'));
    for(const note of screen.round.notes)notes.append(el('p',note));
    sources(screen,notes);
    if(data.fundingContext) {
      const context=el('section');context.append(el('h4','Observed funding context'));
      for(const item of data.fundingContext.items)context.append(el('p',`${item.label}: ${item.detail}`));
      for(const note of data.fundingContext.notes)context.append(el('p',note));
      context.append(sourceLine(data.fundingContext.source));notes.append(context);
    }
    parent.append(notes);
  }
  function showResult(screen:ScenarioScreen,state:State,parent:HTMLElement,grid:HTMLElement) {
    parent.replaceChildren();
    if(!state.result) {
      if(state.dirty)parent.append(el('p','Changed since you showed it. Show your version again.','game-status'));
      return;
    }
    const result=el('section');result.dataset.scenarioResult='';result.dataset.recordType='scenario';result.setAttribute('aria-label','Your illustrative scenario result');
    const pair=el('div','','game-reveal-waffles');
    const yours=el('div');yours.dataset.recordType='scenario';yours.append(el('h4','Your version'));
    const drawing=grid.cloneNode(true) as HTMLElement;drawing.removeAttribute('data-player-grid');yours.append(drawing);
    const reference=el('div');reference.dataset.recordType='observation';reference.append(el('h4','Published split, for reference'));
    reference.append(root.querySelector<HTMLTemplateElement>(`[data-game-published="${screen.roundIndex}"]`)!.content.cloneNode(true));
    pair.append(yours,reference);result.append(pair);
    const wrapper=el('div','','game-scenario-table');
    const table=el('table');table.dataset.recordType='scenario';table.dataset.scenarioTable='';table.append(el('caption',`Your version | ${screen.title}`));
    const head=el('thead'),header=el('tr');
    for(const name of [screen.kind==='bill'?'Charging body':'Service','Your share','Your version','Published, for reference']){const th=el('th',name);th.scope='col';header.append(th);}head.append(header);table.append(head);
    const body=el('tbody');
    screen.items.forEach((item,index)=>{
      const row=el('tr'),name=el('th',item.label);name.scope='row';name.dataset.dashOk='';
      const published=el('td',money(item.publishedPence,screen.kind==='bill'));published.dataset.recordType='observation';published.dataset.publishedPence=String(item.publishedPence);
      const amount=el('td',money(state.result![index],screen.kind==='bill'));amount.dataset.scenarioPence=String(state.result![index]);amount.dataset.recordType='scenario';
      row.append(name,el('td',`${state.values[index]}p`),amount,published);body.append(row);
    });
    table.append(body);const foot=el('tfoot'),total=el('tr'),label=el('th','Fixed total');label.scope='row';
    const publishedTotal=el('td',money(screen.totalPence,screen.kind==='bill'));publishedTotal.dataset.recordType=screen.kind==='bill'?'observation':'calculation';
    total.append(label,el('td','100p'),el('td',money(screen.totalPence,screen.kind==='bill')),publishedTotal);foot.append(total);table.append(foot);wrapper.append(table);result.append(wrapper,el('p',SCENARIO_ROUNDING));
    sources(screen,result);parent.append(result);document.dispatchEvent(new Event('budget:reveal'));
  }
  function showScreen(index:number,entry=false) {
    current=index;const screen=data.screens[index],state=states[index];const heading=lead();rail();
    const title=el('h3',screen.title);title.id=`scenario-screen-${index}`;stage.append(title);
    const fixed=el('section');fixed.dataset.scenarioFixed='';fixed.dataset.recordType=screen.kind==='bill'?'observation':'calculation';
    fixed.append(el('p',screen.kind==='bill'?`Fixed total: ${money(screen.totalPence,true)}, the published ${data.year} Band D area average (MHCLG Table 10)`:`Fixed total: ${money(screen.totalPence)}, the sum of ${screen.name}'s positive service totals in the ${data.year} RA return; net income headings are left out`),sourceLine(screen.round.source));stage.append(fixed);
    const assumptions=el('ul');assumptions.dataset.scenarioAssumptions='';for(const text of SCENARIO_ASSUMPTIONS)assumptions.append(el('li',text));stage.append(assumptions,el('p','Your allocation, pence in each £1','eyebrow'));
    const form=el('form');form.noValidate=true;const submit=el('button','Show your version','button');submit.type='submit';
    const reason=el('p','','game-check-reason'),checkTotal=el('p'),status=el('p','','game-status');status.setAttribute('role','status');
    const result=el('div');result.dataset.scenarioResultSlot='';
    const controls=splitControls({items:screen.items,id:`scenario-${index}`,template:root.querySelector<HTMLTemplateElement>(`[data-game-grid="${screen.roundIndex}"]`)!,submit,reason,checkTotal,status,strictTyped:true,initial:state.values,onChange:values=>{
      state.values=values;if(state.result){state.result=null;state.dirty=true;}stage.querySelectorAll('[data-scenario-rail] li')[index].classList.toggle('done',Boolean(state.result));showResult(screen,state,result,controls.grid);
    }});
    const bar=el('div','','game-check-bar');bar.append(submit,checkTotal);
    form.append(controls.split,reason,bar,status,button('Reset this screen',()=>{states[index]={values:screen.items.map(()=>'0'),result:null,dirty:false};showScreen(index);}));
    form.addEventListener('submit',event=>{
      event.preventDefault();
      try {
        const shares=scenarioShares(controls.values(),screen.items.length);
        if(shares.reduce((sum,value)=>sum+value,0)!==100)throw new Error(reason.textContent!);
        state.result=allocatePence(screen.totalPence,shares);state.values=controls.values();state.dirty=false;status.textContent='Your version is shown below. It is an illustrative scenario, not a score.';
        stage.querySelectorAll('[data-scenario-rail] li')[index].classList.add('done');
        showResult(screen,state,result,controls.grid);
      } catch(error){status.textContent=(error as Error).message;state.result=null;showResult(screen,state,result,controls.grid);}
    });
    stage.append(form);observedNotes(screen,stage);stage.append(result);showResult(screen,state,result,controls.grid);
    const actions=el('div','','game-actions');if(index)actions.append(button('Previous screen',()=>showScreen(index-1)));
    actions.append(button(index===data.screens.length-1?'Show scenario summary':'Next screen',()=>index===data.screens.length-1?summary():showScreen(index+1),false),button('Back to your score',back));stage.append(actions);
    focus(entry?heading:title);
  }
  function summary() {
    const heading=lead();const card=el('div','','game-score-card');card.dataset.scenarioSummary='';card.append(el('h3',`Your version, ${data.name}`));
    const list=el('ul');data.screens.forEach((screen,index)=>{const row=el('li');row.append(button(`${screen.stop}: ${states[index].result?'shown':'not shown yet'}`,()=>showScreen(index)));list.append(row);});card.append(list);
    stage.append(card,button('Back to your score',back),button('Play again',()=>{clear();play();}));focus(heading);
  }
  return {start:()=>{clear();showScreen(0,true);},clear};
}
