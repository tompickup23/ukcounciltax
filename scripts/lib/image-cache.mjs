import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {imageCacheKey} from '../image-cache-key.mjs';

let buildKey;
/** @param {import('astro').APIRoute} render @returns {import('astro').APIRoute} */
export function cachedImageRoute(render) {
  return async context => {
    // Unit samples always render. Only the full build opts into the disk cache.
    if (process.env.OG_IMAGE_CACHE !== '1') return render(context);
    const path = context.url.pathname;
    if (!/^\/og\/[a-z0-9/-]+\.png$/.test(path)) throw new Error(`Invalid image cache route: ${path}`);
    buildKey ??= imageCacheKey();
    const file = join(process.cwd(), '.cache/generated-images', buildKey, path);
    if (existsSync(file)) {
      return new Response(new Uint8Array(readFileSync(file)), {headers: {'Content-Type': 'image/png'}});
    }
    const response = await render(context);
    if (!response.ok || response.headers.get('Content-Type') !== 'image/png') throw new Error(`Image render failed: ${path}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    mkdirSync(dirname(file), {recursive: true});
    writeFileSync(file, bytes);
    return new Response(bytes, {status: response.status, headers: response.headers});
  };
}
