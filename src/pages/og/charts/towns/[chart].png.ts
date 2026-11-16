import {cachedImageRoute} from '../../../../../scripts/lib/image-cache.mjs';
import type {APIRoute} from 'astro';
import {buildOg} from '../../../../lib/og';
import {stripName, stripPng, stripScopes} from '../../../../lib/towns-figures';
import type {TownScope} from '../../../../lib/towns-pages';

export const prerender = true;

/** One light PNG per towns position strip, built only in the BUILD_OG=1 pass. */
export function getStaticPaths() {
  if (!buildOg) return [];
  return stripScopes().map(scope => ({params: {chart: `${stripName(scope)}-light`}, props: {scope}}));
}

export const GET: APIRoute = cachedImageRoute(async ({props}) => {
  const png = stripPng((props as {scope: TownScope}).scope);
  return new Response(new Uint8Array(png), {headers: {'Content-Type': 'image/png'}});
});
