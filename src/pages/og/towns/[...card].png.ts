import {cachedImageRoute} from '../../../../scripts/lib/image-cache.mjs';
import type {APIRoute} from 'astro';
import {buildOg, renderOgCard} from '../../../lib/og';
import {constituencyScopes, countyScopes, englandScope, regionScopes, type TownScope} from '../../../lib/towns-pages';
import {townOgCard, townOgPath} from '../../../lib/towns-og';

export const prerender = true;

/** One card per towns page, built only in the BUILD_OG=1 pass. */
export function getStaticPaths() {
  if (!buildOg) return [];
  return [englandScope(), ...regionScopes(), ...countyScopes(), ...constituencyScopes()]
    .map(scope => ({params: {card: townOgPath(scope).replace(/^\/og\/towns\//, '').replace(/\.png$/, '')}, props: {scope}}));
}

export const GET: APIRoute = cachedImageRoute(async ({props}) => {
  const png = await renderOgCard(townOgCard((props as {scope: TownScope}).scope));
  return new Response(png, {headers: {'Content-Type': 'image/png'}});
});
