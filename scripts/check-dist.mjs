/**
 * Checks the built tree after `npm run build`. Run by `npm run test:dist`.
 *
 * The unit suite reads source; this reads what ships. It fails on:
 *   * a page title that is not the site name, or does not end " | UK Council Tax"
 *   * a title that uses a hyphen separator or a dash
 *   * an em or en dash anywhere in dist (the vendored Pagefind bundle is
 *     excluded: its mark.js licence line carries one and the licence requires it)
 *   * a sitemap URL with no built page behind it, or on another host
 *   * a page whose canonical tag is not on the site's own origin
 *   * dist/_headers missing a hash for an inline script the tree carries
 *   * a figure (data-figure) that is not inside a fact with a source line
 *   * a band page or the national table that does not list every authority
 *     in the band table, or a council page count that does not match it
 *   * a council page with no MHCLG source line or no parish precept caveat
 *
 * Exits non-zero naming each failure.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { hashesIn, scriptSrcOf } from "./inject_csp_hashes.mjs";
import { unsourcedFigures } from "./lib/figures.mjs";

const DIST = resolve(process.cwd(), "dist");
const SITE_NAME = "UK Council Tax";
const SITE_URL = "https://ukcounciltax.co.uk";
// The Web Analytics site token, the same value as CF_BEACON_TOKEN in src/lib/site.ts.
const BEACON_TOKEN = "";
// Built from parts so this file does not carry the entity names it looks for.
const DASH = new RegExp(`[\\u2013\\u2014]|&${"m"}dash;|&${"n"}dash;`);

if (!existsSync(DIST)) {
  console.error("dist/ is not there. Run npm run build first.");
  process.exit(1);
}

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "pagefind") continue;
      yield* files(path);
    } else yield path;
  }
}

const failures = [];
const rel = (path) => path.slice(DIST.length) || "/";
let pages = 0;

for (const path of files(DIST)) {
  if (!/\.(html|xml|txt|json|js|css|svg|webmanifest)$|_headers$|_redirects$/.test(path)) continue;
  const text = readFileSync(path, "utf-8");
  if (path.endsWith(".html") && /href=["\']\/downloads\/|data-(?:export-view|table-export|download-scenario)/.test(text)) failures.push(`download control in ${rel(path)}`);
  if (DASH.test(text)) failures.push(`dash in ${rel(path)}`);
  if (/https?:\/\/ukfoodhygiene\.co\.uk\b/.test(text)) failures.push(`private sister link in ${rel(path)}`);
  if (!path.endsWith(".html")) continue;
  pages += 1;

  const title = /<title>([^<]*)<\/title>/.exec(text)?.[1];
  if (!title) failures.push(`no title on ${rel(path)}`);
  else {
    if (title !== SITE_NAME && !title.endsWith(` | ${SITE_NAME}`)) {
      failures.push(`title without the pipe and site name on ${rel(path)}: ${title}`);
    }
    if (/\s-\s/.test(title)) failures.push(`hyphen separator in title on ${rel(path)}: ${title}`);
  }

  if (/\/(?:councils|scotland|wales)\/[^/]+\/index\.html$/.test(rel(path))) {
    const pagePath = rel(path);
    if (pagePath.includes('/scotland/')) {
      if (!title?.includes('council tax only, water and sewerage excluded')) failures.push(`Scottish basis absent from title on ${pagePath}`);
    } else if (pagePath.includes('/wales/')) {
      if (!title?.includes('council tax Band D 2026/27, Wales')) failures.push(`Welsh Band D nation title absent on ${pagePath}`);
    } else if (!title?.includes('council tax bands and charges 2026/27')) {
      failures.push(`council task/year absent from title on ${pagePath}`);
    }
    const description = /<meta name="description" content="([^"]+)"/.exec(text)?.[1] ?? '';
    if (!description.startsWith('Band D is ')) failures.push(`council description must lead with the figure sentence on ${pagePath}`);
    for (const phrase of ['2026/27']) {
      if (!description.includes(phrase)) failures.push(`${phrase} missing from council description on ${pagePath}`);
    }
    if (description.includes('Source extract checked')) failures.push(`internal check date still in council description on ${pagePath}`);
    if (description.length > 160) failures.push(`council description over 160 characters on ${pagePath} (${description.length})`);
    if (!text.includes('data-next-edition') || !text.includes('2027/28 charges: not yet published')) failures.push(`next edition status missing on ${pagePath}`);
  }

  if (path.endsWith('.html')) {
    const description = /<meta name="description" content="([^"]+)"/.exec(text)?.[1] ?? '';
    if (description.length > 160) failures.push(`description over 160 characters on ${rel(path)} (${description.length})`);
  }

  const schemaNodes = [];
  for (const match of text.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { schemaNodes.push(JSON.parse(match[1])); }
    catch { failures.push(`invalid JSON-LD on ${rel(path)}`); }
  }
  for (const type of ['WebPage', 'Organization', 'BreadcrumbList']) {
    if (schemaNodes.filter(node => node['@type'] === type).length !== 1) failures.push(`expected one ${type} on ${rel(path)}`);
  }
  const schemaTypes = [];
  const collectTypes = value => {
    if (!value || typeof value !== 'object') return;
    if (value['@type']) schemaTypes.push(...[value['@type']].flat());
    for (const child of Object.values(value)) if (typeof child === 'object') collectTypes(child);
  };
  schemaNodes.forEach(collectTypes);
  if (schemaTypes.some(type => ['FAQPage', 'Dataset', 'GovernmentService'].includes(type))) failures.push(`unsupported schema type on ${rel(path)}`);
  const trail = schemaNodes.find(node => node['@type'] === 'BreadcrumbList')?.itemListElement;
  if (!Array.isArray(trail) || !trail.length || trail.some((item, index) => item.position !== index + 1 || !item.name || !item.item?.startsWith(SITE_URL + '/'))) failures.push(`invalid breadcrumb trail on ${rel(path)}`);

  const { problems } = unsourcedFigures(text);
  for (const problem of new Set(problems)) failures.push(`${problem} on ${rel(path)}`);

  // A gate that checks the CSP would allow the beacon is not a gate that checks
  // the beacon is there. Exactly one, carrying this site's token.
  const beacons = [...text.matchAll(/<script[^>]*static\.cloudflareinsights\.com\/beacon\.min\.js[^>]*>/g)];
  if (beacons.length !== (BEACON_TOKEN ? 1 : 0)) failures.push(`${beacons.length} analytics beacons on ${rel(path)}`);
  else if (BEACON_TOKEN && !beacons[0][0].includes(BEACON_TOKEN)) failures.push(`beacon on ${rel(path)} carries another token`);

  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(text)?.[1];
  if (!canonical || !canonical.startsWith(`${SITE_URL}/`)) {
    failures.push(`canonical not on ${SITE_URL} for ${rel(path)}: ${canonical ?? "none"}`);
  }
}

// A top-level 404 prevents Cloudflare Pages from treating this static site as an SPA.
const notFound = join(DIST, '404.html');
if (!existsSync(notFound)) failures.push('missing top-level 404.html');
else if (!/<meta name="robots" content="[^"]*noindex/.test(readFileSync(notFound, 'utf8'))) failures.push('404.html must be noindex');
if (existsSync(join(DIST, '404', 'index.html'))) failures.push('404 must be a top-level file, not a directory route');
for (const missing of ['council-tax/burnley', 'this-page-does-not-exist']) {
  if (existsSync(join(DIST, missing, 'index.html'))) failures.push(`unexpected static route: ${missing}`);
}
const redirects = join(DIST, '_redirects');
if (existsSync(redirects)) for (const line of readFileSync(redirects, 'utf8').split('\n')) {
  const [from, , status] = line.trim().split(/\s+/);
  if (from?.includes('*') && status === '200') failures.push('wildcard 200 rewrite masks unknown routes');
}

// The 2026/27 rises page moved into /increases/; its address stays a 301.
const moved = existsSync(redirects) ? readFileSync(redirects, 'utf8') : '';
if (!/^\/council-tax\/rises-2026-27\/ \/increases\/#2026-27 301$/m.test(moved)) failures.push('rises-2026-27 redirect missing from _redirects');
if (existsSync(join(DIST, 'council-tax', 'rises-2026-27', 'index.html'))) failures.push('rises-2026-27 page would shadow its redirect');

// The next year's page holds no charge before one is published: no pound sign.
const nextYearPages = readdirSync(DIST).filter((name) => /^council-tax-\d{4}-\d{2}$/.test(name));
if (nextYearPages.length !== 1) failures.push(`expected one next-year page, found ${nextYearPages.length}`);
for (const name of nextYearPages) {
  const html = readFileSync(join(DIST, name, 'index.html'), 'utf8');
  if (/£|&pound;|&#163;|&#xa3;/i.test(html)) failures.push(`pound sign on /${name}/`);
}

const downloads = join(DIST, 'downloads');
if (existsSync(downloads)) for (const path of files(downloads)) {
  if (/\.(csv|json)$/i.test(path)) failures.push(`bulk download in ${rel(path)}`);
}

const sitemap = readFileSync(join(DIST, "sitemap.xml"), "utf-8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) failures.push("sitemap.xml lists no URL");
for (const loc of locs) {
  if (!loc.startsWith(`${SITE_URL}/`)) {
    failures.push(`sitemap URL on another host: ${loc}`);
    continue;
  }
  const path = new URL(loc).pathname;
  if (!existsSync(join(DIST, path, "index.html")) && !existsSync(join(DIST, path))) {
    failures.push(`sitemap URL with no page: ${loc}`);
  }
}

// Every English billing authority in the band table appears on every band
// page and in the national table, and every council page names its source.
const bandFile = join(process.cwd(), "data", "council-tax", "england-2026-27.json");
if (existsSync(bandFile)) {
  const onsCodes = Object.keys(JSON.parse(readFileSync(bandFile, "utf-8")).authorities);
  const listed = (page) => new Set([...readFileSync(page, "utf-8").matchAll(/data-ons="([^"]+)"/g)].map((m) => m[1]));
  const pagesToCover = ["A", "B", "C", "D", "E", "F", "G", "H"]
    .map((b) => join(DIST, "council-tax", `band-${b.toLowerCase()}`, "index.html"))
    .concat(join(DIST, "council-tax", "index.html"));
  for (const page of pagesToCover) {
    if (!existsSync(page)) {
      failures.push(`missing ${rel(page)}`);
      continue;
    }
    const seen = listed(page);
    const missing = onsCodes.filter((ons) => !seen.has(ons));
    if (missing.length) failures.push(`${rel(page)} does not list ${missing.length} authorities, first ${missing[0]}`);
  }
  const councilDir = join(DIST, "councils");
  const councilPages = existsSync(councilDir)
    ? readdirSync(councilDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => join(councilDir, e.name, "index.html"))
    : [];
  if (councilPages.length !== onsCodes.length) {
    failures.push(`${councilPages.length} council pages built for ${onsCodes.length} authorities in the band table`);
  }
  for (const page of councilPages) {
    const html = readFileSync(page, "utf-8");
    if (!/Source: <a href="https:\/\/www\.gov\.uk\/government\/statistics\//.test(html)) {
      failures.push(`${rel(page)} has no MHCLG source line`);
    }
    if (!/class="caveat"/.test(html)) failures.push(`${rel(page)} has no parish precept caveat`);
  }
}

// When the build rendered cards (BUILD_OG=1), every og:image must resolve to
// a card in the tree. An iteration build renders none and skips this.
if (existsSync(join(DIST, "og"))) {
  let cards = 0;
  for (const path of files(DIST)) {
    if (!path.endsWith(".html")) continue;
    const image = /<meta property="og:image" content="([^"]+)"/.exec(readFileSync(path, "utf-8"))?.[1];
    if (!image) {
      failures.push(`no og:image on ${rel(path)}`);
      continue;
    }
    const local = join(DIST, new URL(image).pathname);
    if (!existsSync(local)) failures.push(`og:image ${image} on ${rel(path)} was not built`);
    else cards += 1;
  }
  console.log(`dist check: ${cards} pages point at a built share card`);
}

const allowed = new Set(
  scriptSrcOf(readFileSync(join(DIST, "_headers"), "utf-8"))
    .filter((t) => t.startsWith("'sha256-"))
    .map((t) => t.slice(1, -1)),
);
for (const [hash, where] of hashesIn(DIST)) {
  if (!allowed.has(hash)) failures.push(`inline script on ${where.page} not in dist/_headers: ${hash}`);
}

// The search index must cover the same public routes as the sitemap.
const searchEntry = join(DIST, "pagefind", "pagefind-entry.json");
if (!existsSync(searchEntry)) failures.push("Pagefind index missing");
else {
  const entry = JSON.parse(readFileSync(searchEntry, "utf8"));
  const indexed = Object.values(entry.languages).reduce((sum, language) => sum + language.page_count, 0);
  if (indexed !== locs.length) failures.push(`search pages ${indexed} differs from sitemap ${locs.length}`);
}
for (const asset of ["pagefind.js", "pagefind-worker.js"]) {
  if (!existsSync(join(DIST, "pagefind", asset))) failures.push(`missing search asset ${asset}`);
}

if (failures.length) {
  console.error(`dist check: ${failures.length} failures\n${failures.map((f) => `  ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`dist check: ${pages} pages, ${locs.length} sitemap URLs, all passed`);
