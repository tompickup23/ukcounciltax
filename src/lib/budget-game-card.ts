import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {palette} from '../vendor/estate-kit/dist/generated/tokens.js';
import {budgetYear} from './budget';
import type {ChartOptions} from '../vendor/estate-kit/dist/src/charts/frame.js';
/** One static invitation per council. URL fragments never reach an unfurler. */
export async function gameShareCard(name: string): Promise<Uint8Array<ArrayBuffer>> {
  const at=(path:string)=>pathToFileURL(join(process.cwd(),'src/vendor/estate-kit/dist/src',path)).href;
  const {card}=await import(/* @vite-ignore */ at('output/card.js')) as typeof import('../vendor/estate-kit/dist/src/output/card.js');
  const {frame}=await import(/* @vite-ignore */ at('charts/frame.js')) as typeof import('../vendor/estate-kit/dist/src/charts/frame.js');
  const {waffle}=await import(/* @vite-ignore */ at('charts/waffle.js')) as typeof import('../vendor/estate-kit/dist/src/charts/waffle.js');
  const {defineFigures}=await import(/* @vite-ignore */ at('figures/figures.js')) as typeof import('../vendor/estate-kit/dist/src/figures/figures.js');
  const title=`Could you set ${name}'s budget?`;
  const caption=`Source: UK Council Tax budget game, ${budgetYear}`;
  const draw=(options:ChartOptions)=>{
    const f=frame(options,caption,300);const {canvas,plot,bg}=f;
    const side=Math.min(plot.h-8,260);
    const grid=waffle({grid:true,mode:{kind:'hex',theme:'dark',site:'ukcounciltax'}}).svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replaceAll(`fill="${palette('dark','ukcounciltax')['bg-subtle']}"`, `fill="${palette('dark','ukcounciltax').border}"`);
    canvas.add(`<g transform="translate(${plot.x+plot.w-side} ${plot.y}) scale(${side/600})">${grid}</g>`);
    canvas.para(plot.x,plot.y,'Place 100p. See the published split.',plot.w-side-40,{size:30,fill:'text',bg});
    f.close(plot.y+side);
    return {svg:canvas.finish('Budget game invitation',title),table:'',alt:title,caption,title,width:canvas.W,height:canvas.H};
  };
  return new Uint8Array(card(draw,{set:defineFigures({}),site:'ukcounciltax',title},'og',{year:Number(budgetYear.slice(0,4))}).png);
}
