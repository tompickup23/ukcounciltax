/** Compare complete HTML and image file sets after a build optimisation. */
import {createHash} from 'node:crypto';
import {readFileSync, readdirSync} from 'node:fs';
import {join, resolve} from 'node:path';

const [before, after] = process.argv.slice(2).map(path => resolve(path));
if (!before || !after) throw new Error('Usage: node scripts/compare-builds.mjs <before> <after>');
function files(root, relative = '') {
  return readdirSync(join(root, relative), {withFileTypes: true}).flatMap(entry => {
    const path = join(relative, entry.name);
    return entry.isDirectory() ? files(root, path) : /\.(html|png|svg|jpe?g|webp|gif|ico|avif)$/.test(path) ? [path] : [];
  }).sort();
}
const left = files(before), right = files(after);
const missing = left.filter(path => !right.includes(path));
const added = right.filter(path => !left.includes(path));
const changed = [];
let html = 0, images = 0;
for (const path of left) {
  if (missing.includes(path)) continue;
  const a = readFileSync(join(before, path)), b = readFileSync(join(after, path));
  if (path.endsWith('.html')) {
    html++;
    if (!a.equals(b)) changed.push(path);
  } else {
    images++;
    const hash = bytes => createHash('sha256').update(bytes).digest('hex');
    if (hash(a) !== hash(b)) changed.push(path);
  }
}
if (missing.length || added.length || changed.length) {
  console.error(JSON.stringify({missing, added, changed}, null, 2));
  process.exit(1);
}
console.log(`Identical output: ${html} HTML files byte for byte; ${images} image files by SHA256.`);
