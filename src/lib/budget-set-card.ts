import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {FREEZE_YEAR, FREEZE_YEAR_TEXT} from './budget-freeze';
import type {ChartOptions} from '../vendor/estate-kit/dist/src/charts/frame.js';
/** One static invitation per council. URL fragments never reach an unfurler. */
export async function budgetSetCard(name: string): Promise<Uint8Array<ArrayBuffer>> {
  const at=(path:string)=>pathToFileURL(join(process.cwd(),'src/vendor/estate-kit/dist/src',path)).href;
  const {card}=await import(/* @vite-ignore */ at('output/card.js')) as typeof import('../vendor/estate-kit/dist/src/output/card.js');
  const {frame}=await import(/* @vite-ignore */ at('charts/frame.js')) as typeof import('../vendor/estate-kit/dist/src/charts/frame.js');
  const {defineFigures}=await import(/* @vite-ignore */ at('figures/figures.js')) as typeof import('../vendor/estate-kit/dist/src/figures/figures.js');
  const title=`Set ${name}'s budget`;
  const caption=`Source: MHCLG published ledger, ${FREEZE_YEAR_TEXT}`;
  const draw=(options:ChartOptions)=>{
    const f=frame(options,caption,300);const {canvas,plot,bg}=f;
    canvas.para(plot.x,plot.y,'Explore council tax and service spending.',plot.w,{size:34,fill:'text',bg});
    canvas.para(plot.x,plot.y+100,'Start with a freeze. An exploration, not a forecast.',plot.w,{size:28,fill:'text',bg});
    f.close(plot.y+240);
    return {svg:canvas.finish('Budget exercise invitation',title),table:'',alt:title,caption,title,width:canvas.W,height:canvas.H};
  };
  return new Uint8Array(card(draw,{set:defineFigures({}),site:'ukcounciltax',title},'og',{year:Number(FREEZE_YEAR.slice(0,4))}).png);
}
