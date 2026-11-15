import {cachedImageRoute} from '../../../../scripts/lib/image-cache.mjs';
import type {APIRoute} from 'astro';
import {buildOg} from '../../../lib/og';
import {councilPages} from '../../../lib/paths';
import {hasLevelsPage} from '../../../lib/levels-day';
import {rankingCard} from '../../../lib/kit-charts';
export const prerender = true;
/** C6: one ranking card per council, from the first year with a levels day page (FIRST_LEVELS_PAGE_YEAR) on. */
export function getStaticPaths() {
  if (!buildOg || !hasLevelsPage()) return [];
  return councilPages().map(({council}) => ({params: {slug: council.slug}}));
}
export const GET: APIRoute = cachedImageRoute(async ({params}) => new Response(new Uint8Array(await rankingCard(params.slug!)), {headers: {'Content-Type': 'image/png'}}));
