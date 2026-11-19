/**
 * The W5 navigation gates (D8 option B, decided 19 November 2026), run by
 * scripts/check-dist.mjs over every built page and by tests/chrome-nav.test.ts
 * over markup built to fail:
 *   * the header and footer carry data-pagefind-ignore
 *   * the header holds fewer than 20 distinct destinations, a "More" menu and
 *     a phone drawer as <details>, and a "Game" pill named "Budget game"
 *   * every page carries the same header and footer destinations as the homepage
 *   * every route the header or footer held before W5 is in the new header or
 *     footer, and every route that left the header is in the footer
 *   * the footer's sister links are exactly the link table, in its order
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const strip = (html) => html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, "");

/** The markup from the opening tag matched by `open` to its balanced closing tag. */
function element(html, open) {
  const start = html.search(open);
  if (start < 0) return null;
  const name = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(start))?.[1]?.toLowerCase();
  if (!name) return null;
  const tag = new RegExp(`<(/?)${name}\\b[^>]*?(/?)>`, "gi");
  tag.lastIndex = start;
  let depth = 0;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    if (m[2]) continue;
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index + m[0].length);
  }
  return null;
}

const hrefs = (html) => [...html.matchAll(/<a\b[^>]*?\shref="([^"]+)"/gi)].map((m) => m[1].replace(/&amp;/g, "&"));
const local = (list) => list.filter((h) => h.startsWith("/"));

/** The parts of one page's header and footer the gates read. */
export function chromeParts(page) {
  const html = strip(page);
  const bar = element(html, /<div\b[^>]*class="site-header-bar\b/) ?? "";
  const footer = element(html, /<footer\b[^>]*class="site-footer\b/) ?? "";
  const sisters = element(footer, /<section\b[^>]*data-sister-sites\b/) ?? "";
  const cols = element(footer, /<nav\b[^>]*class="footer-cols\b/) ?? "";
  return {
    hasHeader: Boolean(bar),
    hasFooter: Boolean(footer),
    headerIgnored: /^<div\b[^>]*\sdata-pagefind-ignore\b/.test(bar),
    footerIgnored: /^<footer\b[^>]*\sdata-pagefind-ignore\b/.test(footer),
    headerAnchors: hrefs(bar).length,
    header: [...new Set(local(hrefs(bar)))],
    footer: [...new Set(local(hrefs(cols)))],
    sisters: hrefs(sisters),
    more: /<details\b[^>]*\sdata-nav-more\b/.test(bar),
    drawer: /<details\b[^>]*\sdata-site-drawer\b/.test(bar),
    gamePill: /<a\b[^>]*class="header-pill header-pill-solid"[^>]*\saria-label="Budget game"[^>]*>Game<\/a>/.test(bar),
  };
}

/** The sister link table's URLs, in order, read from its source. */
export function sisterTable(root = process.cwd()) {
  const source = readFileSync(join(root, "src/lib/sister-sites.ts"), "utf8");
  return [...source.matchAll(/\burl:\s*"([^"]+)"/g)].map((m) => m[1]);
}

/** Every destination the header and footer held before W5, for the edition in `years`. */
export function routesBeforeW5(years) {
  return [
    "/your-area/", "/councils/", "/scotland/", "/wales/",
    "/council-tax/", "/council-tax/ranked/", "/compare/", "/council-tax/towns/", `/increases/#${years.current}`,
    "/precepts/", "/precepts/parishes/", "/help/", "/tools/future-cost/", `/council-tax-${years.next}/`,
    "/tools/budget/",
    "/about/", "/methodology/", "/sources/", "/data/", "/coverage/", "/tools/", "/increases/",
    "/changes/", "/findings/", "/corrections/", "/contact/", "/privacy/",
  ];
}

/** Problems with the homepage's header and footer: the reference every other page is held to. */
export function referenceProblems(home, { years, sisters }) {
  const problems = [];
  if (!home.headerIgnored) problems.push("the header lacks data-pagefind-ignore");
  if (!home.footerIgnored) problems.push("the footer lacks data-pagefind-ignore");
  if (home.header.length >= 20) problems.push(`the header holds ${home.header.length} destinations, not fewer than 20`);
  if (!home.more) problems.push("the header has no More menu as a details element");
  if (!home.drawer) problems.push("the header has no phone drawer as a details element");
  if (!home.gamePill) problems.push("the header has no Game pill named Budget game");
  const header = new Set(home.header);
  const all = new Set([...home.header, ...home.footer]);
  for (const route of routesBeforeW5(years)) {
    if (!all.has(route)) problems.push(`${route} left the header and footer`);
  }
  for (const route of ["/about/", "/methodology/", "/sources/", "/privacy/", "/contact/"]) {
    if (!home.footer.includes(route)) problems.push(`${route} is not in the footer columns`);
  }
  if (!header.has("/tools/budget/#set-the-budget")) problems.push("the header does not link the hub's Set section");
  if (JSON.stringify(home.sisters) !== JSON.stringify(sisters)) problems.push(`footer sister links ${home.sisters.join(", ")} differ from the link table`);
  return problems;
}

/** Problems with one page's header and footer against the homepage's. */
export function pageProblems(page, home) {
  const problems = [];
  if (!page.hasHeader || !page.hasFooter) return problems;
  if (!page.headerIgnored) problems.push("the header lacks data-pagefind-ignore");
  if (!page.footerIgnored) problems.push("the footer lacks data-pagefind-ignore");
  if (JSON.stringify([...page.header].sort()) !== JSON.stringify([...home.header].sort())) problems.push("header destinations differ from the homepage");
  if (JSON.stringify(page.footer) !== JSON.stringify(home.footer)) problems.push("footer columns differ from the homepage");
  if (JSON.stringify(page.sisters) !== JSON.stringify(home.sisters)) problems.push("footer sister links differ from the homepage");
  return problems;
}
