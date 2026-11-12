import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

// Hash all renderer dependencies, not just the named drawing entry points.
// The workflow prepares and verifies raw sources before calculating this key.
export const IMAGE_INPUTS = ['data', 'src', 'package.json', 'package-lock.json',
  'astro.config.mjs', 'scripts/image-cache-key.mjs', 'scripts/lib/image-cache.mjs'];
export function imageCacheKey(root = process.cwd()) {
  const hash = createHash('sha256');
  hash.update(`uct-images-v1\0${process.platform}\0${process.arch}\0${process.versions.node}\0`);
  function add(relative) {
    const path = join(root, relative);
    if (statSync(path).isDirectory()) {
      for (const name of readdirSync(path).sort()) add(`${relative}/${name}`);
    } else {
      const bytes = readFileSync(path);
      hash.update(`${relative.length}:${relative}:${bytes.length}:`);
      hash.update(bytes);
    }
  }
  IMAGE_INPUTS.forEach(add);
  return hash.digest('hex');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(imageCacheKey());
}
