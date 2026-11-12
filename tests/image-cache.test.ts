import {cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, expect, it, vi} from 'vitest';
import type {APIContext} from 'astro';
import {IMAGE_INPUTS, imageCacheKey} from '../scripts/image-cache-key.mjs';
import {cachedImageRoute} from '../scripts/lib/image-cache.mjs';

const roots: string[] = [];
afterEach(() => { roots.splice(0).forEach(path => rmSync(path, {recursive: true, force: true})); vi.unstubAllEnvs(); });
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'uct-image-key-'));
  roots.push(root);
  for (const input of IMAGE_INPUTS) cpSync(input, join(root, input), {recursive: true, filter: path => !path.includes('data/raw')});
  return root;
}

it('changes the real cache key when one published figure changes, and restores it when reverted', () => {
  const root = fixture();
  const file = join(root, 'data/council-tax/england-2026-27.json');
  const original = readFileSync(file, 'utf8');
  const before = imageCacheKey(root);
  const value = JSON.parse(original).england.areaBandD.england.pounds;
  const needle = `\"pounds\": ${value}`;
  expect(original).toContain(needle);
  // Keep every other byte, including formatting, unchanged.
  const changed = original.replace(needle, `\"pounds\": ${value + 0.01}`);
  expect(JSON.parse(changed).england.areaBandD.england.pounds).toBe(value + 0.01);
  writeFileSync(file, changed);
  expect(imageCacheKey(root)).not.toBe(before);
  writeFileSync(file, original);
  expect(imageCacheKey(root)).toBe(before);
});

it('hashes every drawing dependency and the route names, including added and removed files', () => {
  const root = fixture();
  const before = imageCacheKey(root);
  for (const name of ['src/lib/kit-charts.ts', 'src/lib/figures.ts', 'src/lib/og.ts',
    'src/lib/budget-game-charts.ts', 'src/styles/palette.ts', 'src/vendor/estate-kit/fonts/SourceSans3-Regular.ttf',
    'src/pages/og/[card].png.ts', 'package-lock.json']) {
    const file = join(root, name);
    let original: Buffer | undefined;
    try { original = readFileSync(file); } catch { /* A new input must also invalidate. */ }
    writeFileSync(file, Buffer.concat([original ?? Buffer.alloc(0), Buffer.from('\nchanged')]));
    expect(imageCacheKey(root), name).not.toBe(before);
    if (original) writeFileSync(file, original); else rmSync(file);
    expect(imageCacheKey(root)).toBe(before);
  }
  mkdirSync(join(root, 'data/raw'), {recursive: true});
  writeFileSync(join(root, 'data/raw/source.ods'), 'a changed raw source');
  expect(imageCacheKey(root)).not.toBe(before);
});

it('serves identical cached bytes and always renders when the cache is disabled', async () => {
  const name = `cache-test-${process.pid}`;
  const url = new URL(`https://example.test/og/${name}.png`);
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const render = vi.fn(() => new Response(bytes, {headers: {'Content-Type': 'image/png'}}));
  const route = cachedImageRoute(render);
  const context = {url} as APIContext;
  vi.stubEnv('OG_IMAGE_CACHE', '1');
  const file = join('.cache/generated-images', imageCacheKey(), `og/${name}.png`);
  roots.push(file);
  const first = await route(context);
  const second = await route(context);
  expect(Buffer.from(await first.arrayBuffer())).toEqual(Buffer.from(await second.arrayBuffer()));
  expect(render).toHaveBeenCalledTimes(1);
  vi.stubEnv('OG_IMAGE_CACHE', '');
  await route(context);
  expect(render).toHaveBeenCalledTimes(2);
});
