/** Kit geometry at the game maximum; client replaces all scores before displaying or saving. */
import {defineFigures} from '../vendor/estate-kit/dist/src/figures/figures.js';
import {scoreCard} from '../vendor/estate-kit/dist/src/charts/statTile.js';
import {budgetYear} from './budget';
import type {GameData} from './budget-game';
export function scoreTemplate(data: GameData, name: string) {
  const rows=data.rounds.map((round,i)=>({label:round.kind==='split'?i===0?'Council split':'County split':round.kind==='bill'?'Bill split':round.kind==='funding'?'Funding':'Reserves',figure:`score${i}`}));
  const set=defineFigures(Object.fromEntries(rows.map(row=>[row.figure,{kind:'value',label:row.label,unit:'count',value:100,source:{publisher:'UK Council Tax',title:'Your answers in this game',table:'Game scores, not published council figures',edition:budgetYear}}])));
  return scoreCard({set,rows,label:`Your score, ${name} budget game`,site:'ukcounciltax',mode:{kind:'hex',site:'ukcounciltax',theme:'light'}}).svg;
}
