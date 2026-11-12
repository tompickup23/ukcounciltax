import {cachedImageRoute} from "../../../../../scripts/lib/image-cache.mjs";
import type {APIRoute} from 'astro';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {Resvg} from '@resvg/resvg-js';
import {councilPages} from '../../../../lib/paths';
import {gameData} from '../../../../lib/budget-game-data';
import {gameChart} from '../../../../lib/budget-game-charts';
import type {GameRound} from '../../../../lib/budget-game';
export const prerender = true;
export function getStaticPaths() {
  if (process.env.BUILD_OG !== '1') return [];
  return councilPages().flatMap(({council,tax}) => {
    const data=gameData(council.gss,council.slug,tax.name);
    return data?.rounds.flatMap((round,index)=>(['light','dark'] as const).map(theme=>({params:{slug:council.slug,chart:`round-${index}-${theme}`},props:{round,index,slug:council.slug,theme}}))) ?? [];
  });
}
export const GET: APIRoute = cachedImageRoute(({props}) => {
  const {round,index,slug,theme}=props as {round:GameRound;index:number;slug:string;theme:'light'|'dark'};
  const {out}=gameChart(round,`budget-${slug}-${index}`,theme);
  const dir=join(process.cwd(),'src/vendor/estate-kit/fonts');
  const png=new Resvg(out.svg,{fitTo:{mode:'width',value:out.width*2},font:{fontFiles:readdirSync(dir).filter(f=>f.endsWith('.ttf')).map(f=>join(dir,f)),loadSystemFonts:false}}).render().asPng();
  return new Response(new Uint8Array(png),{headers:{'Content-Type':'image/png'}});
});
