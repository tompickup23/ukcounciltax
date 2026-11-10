/**
 * The A5 face assertions (docs/A5-FACE-BRIEF.md, section 8), as functions that
 * scripts/check-dist.mjs runs over the built pages and tests/face.test.ts runs over
 * markup built to fail. Regular expressions over this build's own output, like
 * scripts/lib/figures.mjs; scripts and styles are stripped first.
 */

const strip = (html) => html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");

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

const count = (html, re) => (html.match(re) ?? []).length;

/** Problems with the header and footer of any page. */
export function chromeProblems(page) {
  const html = strip(page);
  const problems = [];
  const header = element(html, /<div\b[^>]*class="site-header-bar\b/);
  const footer = element(html, /<footer\b[^>]*class="site-footer\b/);
  if (!header) problems.push("no site header");
  else if (/<select\b/i.test(header)) problems.push("a select inside the site header");
  if (!footer) problems.push("no site footer");
  else if (count(footer, /<select\b[^>]*data-theme-select/gi) !== 1) problems.push("the footer must hold exactly one theme select");
  if (count(html, /<select\b[^>]*data-theme-select/gi) !== 1) problems.push("the page must hold exactly one theme select");
  return problems;
}

/** Problems with the kit charts on any page: each needs its actions. Returns the PNG links found. */
export function chartProblems(page) {
  // Player templates carry no published observations.
  const html = strip(page).replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, '');
  const problems = [];
  const charts = count(html, /<svg\b[^>]*class="[^"]*\bek-chart\b/gi);
  const actions = count(html, /<div\b[^>]*\bdata-chart-actions\b/gi);
  if (charts !== actions) problems.push(`${charts} kit charts but ${actions} chart actions`);
  for (const match of html.matchAll(/<[a-z][^>]*\sdata-fact(?:\s|=|>)[^>]*>/gi)) {
    const fact = element(html.slice(match.index), /^<[a-z]/) ?? "";
    if (!/<svg\b[^>]*class="[^"]*\bek-chart\b/.test(fact)) continue;
    if (count(fact, /class="[^"]*\bsource-line\b/g) !== 1) problems.push("a kit chart fact must hold exactly one source line");
    if (count(fact, /The figures as a table/g) !== 1) problems.push("a kit chart fact must hold exactly one table control");
  }
  const pngs = [...html.matchAll(/<a\b[^>]*href="([^"]+\.png)"[^>]*\bdata-chart-png\b/gi)].map((m) => m[1]);
  if (pngs.length !== charts * 2) problems.push(`${pngs.length} chart PNG links for ${charts} charts in two themes`);
  return { problems, pngs };
}

/** Problems with the homepage hero, bill card and task cards. */
export function homeProblems(page) {
  const html = strip(page);
  const problems = [];
  const hero = element(html, /<section\b[^>]*class="home-hero\b/);
  if (!hero) return ["no .home-hero section"];
  const aside = hero.search(/<aside\b/);
  if (aside < 0) problems.push("no bill card aside in the hero");
  const door = hero.search(/<form\b[^>]*\bdata-postcode-door\b/);
  const finder = hero.search(/<section\b[^>]*\bdata-council-finder\b/);
  if (door < 0) problems.push("the postcode door is not inside the hero");
  if (finder < 0) problems.push("the council finder is not inside the hero");
  if (aside >= 0 && (door > aside || finder > aside)) problems.push("a finder comes after the bill card in the hero");
  for (const [label, open] of [["postcode door", /<form\b[^>]*\bdata-postcode-door\b/], ["council finder", /<section\b[^>]*\bdata-council-finder\b/]]) {
    const block = element(hero, open);
    if (!block) continue;
    if (label === "council finder" && !/<input\b/i.test(block)) problems.push("the council finder has no input");
    if (!/<noscript>[\s\S]*?href="\/councils\/"[\s\S]*?<\/noscript>/i.test(block)) problems.push(`the ${label} has no noscript link to /councils/`);
  }
  if (aside >= 0) {
    const card = element(hero.slice(aside), /<aside\b/) ?? "";
    const charts = [...card.matchAll(/<svg\b[^>]*class="[^"]*\bek-chart\b[^"]*"[^>]*>/gi)];
    if (charts.length !== 1) problems.push(`the bill card holds ${charts.length} kit charts, not one`);
    else {
      if (!/\saria-label="[^"]+"/.test(charts[0][0])) problems.push("the bill chart has no aria-label");
      const svg = element(card, /<svg\b[^>]*class="[^"]*\bek-chart\b/) ?? "";
      if (!/<text\b[^>]*>Source: Burnley Borough Council, Council Tax Charges 2026\/27/.test(svg)) problems.push("the bill chart has no source line inside the drawing");
    }
  }
  const tasks = element(html, /<nav\b[^>]*class="task-cards\b/);
  if (!tasks) problems.push("no task cards");
  else {
    const links = [...tasks.matchAll(/<a\b[\s\S]*?<\/a>/gi)].map((m) => m[0]);
    if (links.length !== 4) problems.push(`${links.length} task links, not four`);
    links.forEach((link, i) => {
      const svgs = [...link.matchAll(/<svg\b[^>]*>/gi)].map((m) => m[0]);
      if (svgs.length !== 1 || !/\saria-hidden="true"/.test(svgs[0])) problems.push(`task link ${i + 1} needs exactly one aria-hidden drawing`);
      if (/<text\b/i.test(link)) problems.push(`task link ${i + 1} draws text`);
    });
  }
  return problems;
}

/** Problems with the production header rules: the CSP must still allow inline style attributes, which the kit paints with. */
export function headerProblems(headers) {
  const csp = headers.split("\n").filter((line) => line.includes("Content-Security-Policy:"));
  if (csp.length !== 1) return ["dist/_headers must carry exactly one Content-Security-Policy line"];
  const style = /style-src ([^;]+)/.exec(csp[0])?.[1] ?? "";
  return style.includes("'unsafe-inline'") ? [] : ["style-src no longer allows the kit's inline style attributes"];
}
