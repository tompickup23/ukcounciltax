import type {APIRoute} from 'astro';
import {councilPages} from '../../../lib/paths';
import {budgetFor} from '../../../lib/budget';
import {gameShareCard} from '../../../lib/budget-game-card';
export const prerender=true;
export function getStaticPaths() {
  if(process.env.BUILD_OG !== '1') return [];
  return councilPages().filter(({council})=>budgetFor(council.gss).council.status==='available').map(({council,tax})=>({params:{slug:council.slug},props:{name:tax.name}}));
}
export const GET:APIRoute=async({props})=>new Response(await gameShareCard(props.name),{headers:{'Content-Type':'image/png'}});
