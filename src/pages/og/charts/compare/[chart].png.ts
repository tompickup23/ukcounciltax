import {cachedImageRoute} from '../../../../../scripts/lib/image-cache.mjs';
import type {APIRoute} from 'astro';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {Resvg} from '@resvg/resvg-js';
import {buildOg} from '../../../../lib/og';
import {compareExample} from '../../../../lib/compare-example';
import {bandChart, pairedBandsChart} from '../../../../lib/compare-charts';

export const prerender = true;

/**
 * The compare page's example pair as light PNGs, one per drawing, built only in the
 * BUILD_OG=1 pass. A reader's own pair is drawn in the browser and offers no PNG.
 */
export function getStaticPaths() {
  if (!buildOg) return [];
  return (['band', 'bands'] as const).map(chart => ({params: {chart: `example-${chart}-light`}, props: {chart}}));
}

export const GET: APIRoute = cachedImageRoute(async ({props}) => {
  const {a, b, band, year, source} = compareExample();
  const out = (props as {chart: 'band' | 'bands'}).chart === 'band' ? bandChart(a, b, band, year, source, 'light') : pairedBandsChart(a, b, year, source, 'light');
  const dir = join(process.cwd(), 'src/vendor/estate-kit/fonts');
  const png = new Resvg(out.svg, {fitTo: {mode: 'width', value: out.width * 2}, font: {fontFiles: readdirSync(dir).filter(f => f.endsWith('.ttf')).map(f => join(dir, f)), loadSystemFonts: false}}).render().asPng();
  return new Response(new Uint8Array(png), {headers: {'Content-Type': 'image/png'}});
});
