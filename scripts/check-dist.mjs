/**
 * Checks the built tree after `npm run build`. Run by `npm run test:dist`.
 *
 * The unit suite reads source; this reads what ships. It fails on:
 *   * a page title that is not the site name, or does not end " | UK Council Tax"
 *   * a title that uses a hyphen separator or a dash
 *   * an em or en dash anywhere in dist (the vendored Pagefind bundle is
 *     excluded: its mark.js licence line carries one and the licence requires it)
 *   * a sitemap URL with no built page behind it, or on another host
 *   * a missing, duplicate or incorrect canonical against the reviewed map
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
import {profileProblems} from "./lib/profile.mjs";
import { unsourcedFigures } from "./lib/figures.mjs";
import { chartProblems, chromeProblems, headerProblems, homeProblems } from "./lib/face.mjs";

import {budgetGameProblems,gameHeaderProblem,publishedText} from './lib/budget-game.mjs';
const gameCounts={available:0,absent:0};
const beforeGameText=JSON.parse(readFileSync('tests/fixtures/a6-published-text.json','utf8'));
const DIST = resolve(process.cwd(), "dist");
const SITE_NAME = "UK Council Tax";
const SITE_URL = "https://ukcounciltax.co.uk";
const canonicalMap = JSON.parse(readFileSync(join(process.cwd(), "data", "canonical-map.json"), "utf8"));
const seenMapped = new Set();
const seenUnique = new Set();
// The Web Analytics site token, the same value as CF_BEACON_TOKEN in src/lib/site.ts.
const BEACON_TOKEN = "11f6f11ed6cf428d9dd7e1d688f8a64b";
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
let profiles = 0;
let paymentLinks = 0, paymentAbsent = 0;
let networkPopulation = 0, networkElection = 0;
const linksChecked = JSON.parse(readFileSync('data/council-links.json', 'utf8')).source.checkedOn;
const linksExpiry = Date.parse(`${linksChecked}T00:00:00Z`) + 91 * 86400000;
if (Date.now() >= linksExpiry) throw new Error('A3 stop: council payment links are stale. Rerun UK Places local links and import the reviewed data commit here.');
if (Date.now() >= linksExpiry - 15 * 86400000) console.warn('Council payment links expire after 3 January 2027. Rerun UK Places local links, review the new hash and import-council-links.mjs before then.');
const chartPngLinks = [];
let homeChecked = false;

for (const path of files(DIST)) {
  if (!/\.(html|xml|txt|json|js|css|svg|webmanifest)$|_headers$|_redirects$/.test(path)) continue;
  const text = readFileSync(path, "utf-8");
  if (path.endsWith(".html") && /href=["\']\/downloads\/|data-(?:export-view|table-export|download-scenario)/.test(text)) failures.push(`download control in ${rel(path)}`);
  if (DASH.test(text)) failures.push(`dash in ${rel(path)}`);
  if (/https?:\/\/ukfoodhygiene\.co\.uk\b/.test(text)) failures.push(`private sister link in ${rel(path)}`);
  if (!path.endsWith(".html")) continue;
  pages += 1;
  if (text.includes('asylumstats.co.uk')) failures.push(`Asylum Stats domain on ${rel(path)}`);
  if (/^\/tools\/budget\/[^/]+\/index\.html$/.test(rel(path))) {
    const slug=rel(path).split('/')[3];
    if (text.includes('data-network-strip')) failures.push(`budget route contains a network strip: ${slug}`);
    const result=budgetGameProblems(text,slug,DIST);
    failures.push(...result.problems);gameCounts[result.available?'available':'absent']++;
    if(beforeGameText[slug]&&JSON.stringify(publishedText(text))!==JSON.stringify(beforeGameText[slug]))failures.push(`${slug}: pre-A6 published text changed`);
    await new Promise(resolve=>setImmediate(resolve));
  }
  const readerHtml = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  if (/£\d{4,}/.test(readerHtml)) failures.push(`currency lacks thousands separators on ${rel(path)}`);

  // The A5 face (docs/A5-FACE-BRIEF.md, section 8).
  if (!rel(path).startsWith("/pagefind/") && /<footer\b/.test(text)) {
    for (const problem of chromeProblems(text)) failures.push(`${problem} on ${rel(path)}`);
    const charts = chartProblems(text);
    for (const problem of charts.problems) failures.push(`${problem} on ${rel(path)}`);
    chartPngLinks.push(...charts.pngs.map((png) => [png, rel(path)]));
  }
  if (rel(path) === "/index.html") {
    homeChecked = true;
    for (const problem of homeProblems(text)) failures.push(`homepage: ${problem}`);
  }

  const title = /<title>([^<]*)<\/title>/.exec(text)?.[1];
  const queryTitles = {
    '/findings/index.html': 'Council tax findings: parish precepts and Band D since 1993/94',
    '/changes/index.html': 'What changed: council tax data updates',
    '/tools/future-cost/index.html': 'Council tax future cost calculator',
  };
  if (queryTitles[rel(path)] && title !== `${queryTitles[rel(path)]} | ${SITE_NAME}`) failures.push(`incorrect query title on ${rel(path)}`);
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

  if (rel(path) === '/council-tax/index.html') {
    const body = /<main\b[^>]*>([\s\S]*?)<\/main>/.exec(text)?.[1] ?? '';
    for (const href of ['/help/', '/increases/', '/precepts/', '/scotland/', '/wales/', '/council-tax-2027-28/']) {
      if (!body.includes(`href="${href}"`)) failures.push(`England hub lacks body link ${href}`);
    }
  }
  if (/^\/councils\/[^/]+\/index\.html$/.test(rel(path))) {
    profiles += 1;
    networkPopulation += (text.match(/data-network-population/g) ?? []).length;
    networkElection += (text.match(/data-network-election/g) ?? []).length;
    if (/data-council-payment/.test(text)) paymentLinks++;
    if (/We do not hold a checked link to/.test(text)) paymentAbsent++;
    for (const problem of profileProblems(text, rel(path).split("/")[2])) failures.push(`${rel(path)}: ${problem}`);
    const body = /<main\b[^>]*>([\s\S]*?)<\/main>/.exec(text)?.[1] ?? '';
    for (const href of ['/help/', '/help/#what-council-tax-band-am-i', `/tools/budget/${rel(path).split('/')[2]}/`]) {
      if (!body.includes(`href="${href}"`)) failures.push(`council profile lacks body link ${href}: ${rel(path)}`);
    }
  }

  const devolvedPage = /^\/(scotland|wales)\/([^/]+)\/index\.html$/.exec(rel(path));
  if (devolvedPage) {
    const image = /<meta property="og:image" content="([^"]+)"/.exec(text)?.[1];
    const expectedPath = `/og/${devolvedPage[1]}/${devolvedPage[2]}.png`;
    if (!image || new URL(image).pathname !== expectedPath) failures.push(`devolved page lacks its own share card: ${rel(path)}`);
    if (existsSync(join(DIST, 'og')) && !existsSync(join(DIST, expectedPath))) failures.push(`missing devolved card: ${expectedPath}`);
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

  const pagePath = rel(path) === "/404.html" ? "/404/" : rel(path).replace(/index\.html$/, "");
  const ownUrl = new URL(pagePath, SITE_URL).href;
  const expectedCanonical = canonicalMap.mappings[ownUrl] ?? ownUrl;
  const canonicals = [...text.matchAll(/<link\b[^>]*>/gi)]
    .map(match => match[0])
    .filter(tag => /\brel\s*=\s*["']canonical["']/i.test(tag));
  if (canonicals.length !== 1) failures.push(`expected one canonical on ${rel(path)}, found ${canonicals.length}`);
  const canonical = /\bhref\s*=\s*["']([^"']+)["']/i.exec(canonicals[0] ?? "")?.[1];
  if (canonical !== expectedCanonical) {
    failures.push(`incorrect canonical on ${rel(path)}: expected ${expectedCanonical}, found ${canonical ?? "none"}`);
  }
  if (canonicalMap.mappings[ownUrl]) seenMapped.add(ownUrl);
  if (canonicalMap.selfCanonicalUrls.includes(ownUrl)) seenUnique.add(ownUrl);
}

// Main retired this route; the existing redirect and absent page checks below remain mandatory.
const retiredCanonicalUrl = `${SITE_URL}/council-tax/rises-2026-27/`;
for (const url of Object.keys(canonicalMap.mappings)) {
  if (url === retiredCanonicalUrl) continue;
  if (!seenMapped.has(url)) failures.push(`mapped page was not built: ${url}`);
}
for (const url of canonicalMap.selfCanonicalUrls) {
  if (!seenUnique.has(url)) failures.push(`unique page was not built: ${url}`);
}
if (seenMapped.size !== 318) failures.push(`expected 318 built mapped canonicals, found ${seenMapped.size}`);
if (seenUnique.size !== 69) failures.push(`expected 69 listed self canonical pages, found ${seenUnique.size}`);
// A4 adds exactly 221 routes: six ranking pages and 215 parish pages.
if (pages !== 909) failures.push(`expected 909 HTML pages, found ${pages}`);
if (networkPopulation !== 294 || networkElection !== 71) failures.push(`A3 stop: network figure counts ${networkPopulation} and ${networkElection}, expected 294 and 71`);
if (paymentLinks !== 254 || paymentAbsent !== 42) failures.push(`A3 stop: payment coverage ${paymentLinks} linked and ${paymentAbsent} absent, expected 254 and 42`);
const helpHtml = readFileSync(join(DIST, 'help/index.html'), 'utf8');
for (const id of ['check-discounts-and-reductions','check-the-payment-schedule','if-paying-is-difficult']) if ((helpHtml.match(new RegExp(`id="${id}"`, 'g')) ?? []).length !== 1) failures.push(`help anchor ${id} must appear once`);
if (profiles !== 296) failures.push(`expected 296 English council profiles, found ${profiles}`);
console.log(`dist check: ${seenMapped.size} mapped canonicals and ${seenUnique.size} unique self canonicals checked`);

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
const sitemapEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => match[1]);
const today = new Date().toISOString().slice(0, 10);
if (sitemapEntries.length !== 908 || locs.length !== 908) failures.push(`expected all 908 sitemap entries, found ${sitemapEntries.length}`);
for (const entry of sitemapEntries) {
  const dates = [...entry.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map(match => match[1]);
  if (dates.length !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(dates[0]) || Number.isNaN(Date.parse(dates[0])) || dates[0] > today) failures.push(`invalid or future sitemap lastmod: ${entry}`);
}
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
  const devolvedCards = ['scotland', 'wales'].flatMap(nation => existsSync(join(DIST, 'og', nation)) ? [...files(join(DIST, 'og', nation))].filter(path => path.endsWith('.png')) : []);
  if (devolvedCards.length !== 54) failures.push(`expected 54 devolved cards, found ${devolvedCards.length}`);
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

// security.txt (RFC 9116): a mailto Contact, an Expires in the future and at
// most a year ahead, and a Canonical on this origin. Astro copies it from
// public/.well-known; a build that drops the dot directory fails here.
const securityTxt = join(DIST, ".well-known", "security.txt");
if (!existsSync(securityTxt)) failures.push("missing /.well-known/security.txt");
else {
  const fields = new Map();
  for (const line of readFileSync(securityTxt, "utf8").split("\n")) {
    const match = /^([A-Za-z-]+):\s*(.+)$/.exec(line.trim());
    if (match) fields.set(match[1].toLowerCase(), [...(fields.get(match[1].toLowerCase()) ?? []), match[2]]);
  }
  if (!(fields.get("contact") ?? []).some((value) => /^mailto:[^@\s]+@[^@\s]+$/.test(value))) failures.push("security.txt has no mailto Contact");
  const expires = fields.get("expires") ?? [];
  const when = Date.parse(expires[0] ?? "");
  if (expires.length !== 1 || Number.isNaN(when)) failures.push("security.txt needs exactly one valid Expires");
  else if (when <= Date.now()) failures.push(`security.txt expired on ${expires[0]}`);
  else if (when - Date.now() > 366 * 24 * 60 * 60 * 1000) failures.push(`security.txt Expires is more than a year ahead: ${expires[0]}`);
  if ((fields.get("canonical") ?? [])[0] !== `${SITE_URL}/.well-known/security.txt`) failures.push("security.txt Canonical is not on the site origin");
}

// llms.txt is plain text built from site data, with the site name as its heading.
const llmsTxt = join(DIST, "llms.txt");
if (!existsSync(llmsTxt)) failures.push("missing /llms.txt");
else {
  const text = readFileSync(llmsTxt, "utf8");
  if (!text.startsWith(`# ${SITE_NAME}\n`)) failures.push("llms.txt does not start with the site name heading");
  for (const heading of ["## Sources"]) if (!text.includes(`\n${heading}\n`)) failures.push(`llms.txt has no ${heading}`);
}

// The homepage was checked, and when the build rendered cards (BUILD_OG=1) every
// chart PNG link resolves to a file. The CSP still allows the kit's inline style
// attributes (A5 brief, section 5).
if (!homeChecked) failures.push("homepage not found for the face checks");
if (existsSync(join(DIST, "og"))) {
  for (const [png, page] of chartPngLinks) if (!existsSync(join(DIST, png))) failures.push(`chart PNG ${png} on ${page} was not built`);
  console.log(`dist check: ${chartPngLinks.length} chart PNG links resolve`);
}
for (const problem of headerProblems(readFileSync(join(DIST, "_headers"), "utf-8"))) failures.push(problem);

// The only host specific rules in dist/_headers are the pages.dev noindex
// rules, and they add nothing but X-Robots-Tag. The CSP stays on the one
// production line the hash step rewrites.
{
  const headerText = readFileSync(join(DIST, "_headers"), "utf-8");
  const blocks = headerText.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  const hosted = blocks.filter((block) => block.startsWith("https://"));
  const expected = ["https://ukcounciltax.pages.dev/*", "https://:version.ukcounciltax.pages.dev/*"];
  const patterns = hosted.map((block) => block.split("\n")[0].trim());
  if (JSON.stringify(patterns) !== JSON.stringify(expected)) failures.push(`unexpected host rules in dist/_headers: ${patterns.join(", ") || "none"}`);
  for (const block of hosted) {
    const lines = block.split("\n").slice(1).map((line) => line.trim());
    if (lines.length !== 1 || lines[0] !== "X-Robots-Tag: noindex") failures.push(`host rule ${block.split("\n")[0]} must set only X-Robots-Tag: noindex`);
  }
  if ((headerText.match(/Content-Security-Policy:/g) ?? []).length !== 1) failures.push("dist/_headers must carry exactly one Content-Security-Policy line");
}

if(gameCounts.available!==287||gameCounts.absent!==9)failures.push(`game coverage ${gameCounts.available} available and ${gameCounts.absent} no return`);
failures.push(...gameHeaderProblem(readFileSync(join(process.cwd(),'public/_headers'),'utf8')));
if (failures.length) {
  console.error(`dist check: ${failures.length} failures\n${failures.map((f) => `  ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`dist check: ${pages} pages, ${locs.length} sitemap URLs, all passed`);
