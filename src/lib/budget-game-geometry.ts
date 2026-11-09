/** Server drawn kit geometry for player gaps. The scale is a game choice, not an observation. */
import {defineFigures} from '../vendor/estate-kit/dist/src/figures/figures.js';
import {zeroBar} from '../vendor/estate-kit/dist/src/charts/zeroBar.js';
import {budgetYear} from './budget';
const set=defineFigures({scale:{kind:'series',label:'Game gap scale',unit:'pence',axis:'category',points:[{label:'',value:-100,display:{full:''}},{label:'',value:100,display:{full:''}}],source:{publisher:'UK Council Tax',title:'Your answers in this game',table:'Game scale from 100p under to 100p over',edition:budgetYear}}});
const chart=zeroBar({set,figure:'scale',orientation:'horizontal',diverging:true,site:'ukcounciltax'});
const row=chart.svg.match(/<g class="ek-bar">([\s\S]*?)<\/g>/)![1];
const path=row.match(/<path[^>]+\/>/)![0];
const zero=Number(path.match(/data-base="([^"]+)"/)![1]);
const y=Number(path.match(/d="M[^,]+,([^ ]+)/)![1]);
const height=44;
const mark=path.replace(/data-(?:value|base|end)="[^"]*"/g,'').replace('data-ek-bar=""',`data-game-gap-bar="" data-game-zero="${zero}" transform="translate(${zero} 0) scale(0 1) translate(${-zero} 0)"`).replace(/style="[^"]*"/,'style="fill:var(--accent)"');
export const gapRowSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${y-6} 600 ${height}" width="600" height="${height}" aria-hidden="true" class="game-gap-svg">${mark}<line x1="${zero}" x2="${zero}" y1="${y-6}" y2="${y-6+height}" style="stroke:var(--border-strong)" /></svg>`;
