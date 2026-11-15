import {cachedImageRoute} from '../../../../scripts/lib/image-cache.mjs';
import type {APIRoute} from 'astro';
import {budgetSetPages} from '../../../lib/paths';
import {budgetSetCard} from '../../../lib/budget-set-card';
export const prerender = true;
export function getStaticPaths() {
  return process.env.BUILD_OG === '1' ? budgetSetPages().map(pilot => ({params:{slug:pilot.slug},props:{name:pilot.name}})) : [];
}
export const GET: APIRoute = cachedImageRoute(async ({props}) => new Response(await budgetSetCard(props.name), {headers:{'Content-Type':'image/png'}}));
