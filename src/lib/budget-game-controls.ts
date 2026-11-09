import {squaresFor, type GameItem} from './budget-game';
import {scenarioShares} from './budget-scenario';

export function gameElement<K extends keyof HTMLElementTagNameMap>(tag:K,text='',className=''): HTMLElementTagNameMap[K] {
  const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;
}
export function gameButton(text:string, action:()=>void, secondary=true): HTMLButtonElement {
  const node=gameElement('button',text,`button${secondary?' secondary':''}`);node.type='button';node.addEventListener('click',action);return node;
}
/** Shared A6 grid, row controls, remaining pence rule and placed meter. */
export function splitControls(options: {
  items: readonly Pick<GameItem,'label'>[]; id:string; template:HTMLTemplateElement;
  submit:HTMLButtonElement; reason:HTMLElement; checkTotal:HTMLElement; status:HTMLElement;
  strictTyped?:boolean; initial?:readonly string[]; onChange?:(values:string[])=>void;
}) {
  const {items,submit,reason,checkTotal,status,strictTyped=false}=options;
  const inputs: HTMLInputElement[]=[];
  const ranges: HTMLInputElement[]=[];
  const rows=gameElement('ol','','game-rows');
  const total=gameElement('p','0p of 100p','game-placed');total.setAttribute('aria-live','polite');
  const meter=gameElement('progress','0p of 100p','game-meter');meter.max=100;meter.value=0;meter.setAttribute('aria-label','Pence placed');
  const grid=options.template.content.firstElementChild!.cloneNode(true) as HTMLElement;grid.dataset.playerGrid='';
  const panel=gameElement('div','','game-grid-panel');panel.append(gameElement('p','Placed','eyebrow'),total,meter,grid);
  const split=gameElement('div','','game-split');split.append(panel,rows);
  const values=()=>inputs.map(input=>input.value);
  function redraw() {
    let shares:number[];
    try {shares=strictTyped?scenarioShares(values(),items.length):inputs.map(input=>Number(input.value||0));}
    catch(error) {
      total.textContent=checkTotal.textContent='Check your allocation';reason.textContent=(error as Error).message;
      submit.setAttribute('aria-disabled','true');meter.value=0;
      grid.querySelectorAll('[data-ek-square]').forEach(node=>node.setAttribute('class','ek-sq sq-empty'));
      grid.querySelector('[data-ek-filled]')!.setAttribute('data-ek-filled','0');
      return;
    }
    const placed=shares.reduce((sum,value)=>sum+value,0);
    total.textContent=checkTotal.textContent=`${placed}p of 100p`;meter.value=placed;
    submit.setAttribute('aria-disabled',String(placed!==100));
    const action=strictTyped?'show your version':'check your split';
    reason.textContent=placed===100?`100p placed. ${strictTyped?'Show your version.':'Check your split.'}`:placed>100?`${placed}p of 100p placed. Remove ${placed-100}p to ${action}.`:`${placed}p of 100p placed. Place ${100-placed}p more to ${action}.`;
    const counts=placed<=100?squaresFor([...shares,100-placed]):[...shares.map(()=>0),100];
    let square=0;const nodes=grid.querySelectorAll('[data-ek-square]');
    counts.forEach((count,part)=>{for(let n=0;n<count;n++)nodes[square++].setAttribute('class',`ek-sq ${part===inputs.length?'sq-empty':`sq-p${part}`}`);});
    grid.querySelector('[data-ek-filled]')!.setAttribute('data-ek-filled',String(placed<=100?placed:0));
  }
  const changed=()=>{redraw();options.onChange?.(values());};
  items.forEach((item,i)=>{
    const row=gameElement('li','','game-row');
    const input=gameElement('input');input.type='number';input.min='0';input.max='100';input.step='1';input.required=true;input.value=options.initial?.[i]??'0';input.id=`${options.id}-${i}`;
    const label=gameElement('label',`${item.label} (pence)`);label.htmlFor=input.id;label.dataset.dashOk='';
    const swatch=gameElement('span','',`game-swatch hatch-${Math.floor(i/4)}`);swatch.style.setProperty('--part-paint',`var(--series-${i%4+1})`);swatch.setAttribute('aria-hidden','true');label.prepend(swatch);
    const range=gameElement('input');range.type='range';range.min='0';range.max='100';range.step='1';range.value=input.value||'0';range.setAttribute('aria-label',`${item.label} pence slider`);
    const stepper=gameElement('div','','game-stepper');
    const change=(value:number)=>{
      let current:number[];
      try {current=strictTyped?scenarioShares(values(),items.length):inputs.map(other=>Number(other.value||0));}
      catch(error){status.textContent=(error as Error).message;return;}
      const remaining=Math.max(0,100-current.reduce((sum,other,j)=>sum+(j===i?0:other),0));
      const next=Math.max(0,Math.min(remaining,Math.trunc(Number.isFinite(value)?value:0)));
      input.value=range.value=String(next);
      status.textContent=value>remaining?`Only ${remaining}p available for ${item.label}. Lower another service to place more here.`:'';
      changed();
    };
    const minus=gameButton('−',()=>change(Number(input.value)-1));minus.setAttribute('aria-label',`Decrease ${item.label}`);
    const plus=gameButton('+',()=>change(Number(input.value)+1));plus.setAttribute('aria-label',`Increase ${item.label}`);
    inputs.push(input);ranges.push(range);
    input.addEventListener('input',()=>{
      if(!strictTyped){change(Number(input.value));return;}
      // Typed values remain exactly as entered, including blank and invalid states.
      if(input.value!=='' && Number.isInteger(Number(input.value)) && Number(input.value)>=0 && Number(input.value)<=100)range.value=input.value;
      status.textContent='';changed();
    });
    range.addEventListener('input',()=>change(Number(range.value)));
    stepper.append(minus,range,plus,input);row.append(label,stepper);rows.append(row);
  });
  redraw();
  return {split,inputs,grid,values,redraw};
}
