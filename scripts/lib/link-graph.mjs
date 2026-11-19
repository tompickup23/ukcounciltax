/**
 * The W5 link graph gate. Reads every built page, collects the internal links
 * each one makes, and reports the pages that no other page links to. A
 * navigation change must not leave a page with no way in: run over dist it
 * fails on any orphan that is not on the allowed list, and with a second tree
 * (`node scripts/lib/link-graph.mjs before-dist dist`) it names every page whose
 * inbound links fell to zero between the two builds.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ORIGIN = "https://ukcounciltax.co.uk";

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "pagefind" || entry.name === "_astro") continue;
      yield* htmlFiles(path);
    } else if (entry.name.endsWith(".html")) yield path;
  }
}

/** The site path a built file serves, in directory form. */
export function routeOf(root, file) {
  const rel = file.slice(root.length).replace(/\\/g, "/");
  if (rel.endsWith("/index.html")) return rel.slice(0, -"index.html".length) || "/";
  return rel.replace(/\.html$/, "");
}

/** Internal page paths a page links to, without hash or query, in directory form. */
export function linksIn(html, from) {
  const out = new Set();
  const body = html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, "");
  for (const m of body.matchAll(/<a\b[^>]*?\shref="([^"]+)"/gi)) {
    const href = m[1].replace(/&amp;/g, "&");
    if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    let url;
    try { url = new URL(href, ORIGIN + from); } catch { continue; }
    if (url.origin !== ORIGIN) continue;
    let path = url.pathname;
    if (/\.[a-z0-9]+$/i.test(path)) continue;
    if (!path.endsWith("/")) path += "/";
    out.add(path);
  }
  return out;
}

/** Inbound counts, from pages other than the target, for every built page. */
export function inboundCounts(root) {
  root = resolve(root);
  const pages = new Map();
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, "utf8");
    pages.set(routeOf(root, file), { noindex: /<meta\b[^>]*name="robots"[^>]*content="noindex/i.test(html), links: linksIn(html, routeOf(root, file)) });
  }
  const inbound = new Map([...pages.keys()].map((route) => [route, 0]));
  for (const [route, page] of pages) for (const target of page.links) if (target !== route && inbound.has(target)) inbound.set(target, inbound.get(target) + 1);
  return { pages, inbound };
}

/** Indexable pages with no inbound link. The homepage and the 404 are entry points, not orphans. */
export function orphans(root) {
  const { pages, inbound } = inboundCounts(root);
  return [...inbound].filter(([route, n]) => n === 0 && route !== "/" && route !== "/404" && !pages.get(route).noindex).map(([route]) => route).sort();
}

/** Pages built in both trees that had an inbound link before and have none now. */
export function lostOnlyInbound(beforeRoot, afterRoot) {
  const before = inboundCounts(beforeRoot).inbound;
  const after = inboundCounts(afterRoot).inbound;
  return [...after].filter(([route, n]) => n === 0 && (before.get(route) ?? 0) > 0).map(([route]) => route).sort();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [a, b] = process.argv.slice(2);
  if (!a || !existsSync(a)) { console.error("usage: node scripts/lib/link-graph.mjs [before-dist] dist"); process.exit(2); }
  if (b) {
    const lost = lostOnlyInbound(a, b);
    const { inbound } = inboundCounts(b);
    console.log(`link graph: ${inbound.size} pages in ${b}; ${lost.length} lost their only inbound link against ${a}`);
    for (const route of lost) console.log(`  ${route}`);
    process.exit(lost.length ? 1 : 0);
  }
  const found = orphans(a);
  console.log(`link graph: ${found.length} indexable pages with no inbound link`);
  for (const route of found) console.log(`  ${route}`);
}
