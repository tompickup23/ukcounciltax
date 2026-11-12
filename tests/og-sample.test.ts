import {expect, it} from 'vitest';
import type {APIContext} from 'astro';
import {GET as hub} from '../src/pages/og/[card].png';
import {GET as council} from '../src/pages/og/councils/[slug].png';
import {GET as chart} from '../src/pages/og/charts/[chart].png';
import {GET as profile} from '../src/pages/og/charts/councils/[slug]/[chart].png';
import {councilPages} from '../src/lib/paths';

async function png(route: typeof hub, context: Partial<APIContext>, width?: number, height?: number) {
  const response = await route(context as APIContext);
  expect(response.headers.get('Content-Type')).toBe('image/png');
  const bytes = Buffer.from(await response.arrayBuffer());
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(bytes.subarray(12, 16).toString()).toBe('IHDR');
  expect(bytes.length).toBeGreaterThan(1000);
  expect(bytes.readUInt32BE(16)).toBe(width ?? 1200);
  if (height) expect(bytes.readUInt32BE(20)).toBe(height);
  else expect(bytes.readUInt32BE(20)).toBeGreaterThan(100);
  expect(bytes.subarray(-8, -4).toString()).toBe('IEND');
  return bytes;
}

it('renders the homepage card, fallback card and Burnley share card through their real routes', async () => {
  await png(chart, {props: {name: 'home-bill', theme: 'card'}}, 1200, 630);
  await png(hub, {params: {card: 'home'}}, 1200, 630);
  const burnley = councilPages().find(page => page.council.slug === 'burnley')!;
  await png(council, {props: {tax: burnley.tax}}, 1200, 630);
}, 60000);

it('rasterises all four Burnley profile charts in both themes', async () => {
  for (const name of ['bands', 'bill', 'position', 'map']) {
    const light = await png(profile, {props: {name: `councils/burnley/${name}`, theme: 'light'}});
    const dark = await png(profile, {props: {name: `councils/burnley/${name}`, theme: 'dark'}});
    expect(light.equals(dark), `${name} themes must differ`).toBe(false);
  }
}, 60000);
