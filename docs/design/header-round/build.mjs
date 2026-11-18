/**
 * Header round (D8). Writes the three static mocks, option-a.html, option-b.html and
 * option-c.html, from one link table, and prints the link counts and the footer coverage
 * check against STATIC_PATHS in src/lib/site.ts.
 *
 *   node docs/design/header-round/build.mjs
 *
 * Nothing here changes the site. Every href is a route that exists on the live site on
 * 18 November 2026 (read from https://ukcounciltax.co.uk/sitemap.xml); the one anchor,
 * /tools/budget/#set-the-budget, is an id on the live budget hub.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");

/* ---------- destinations ---------- */

const L = {
  area: { href: "/your-area/", label: "Find your bill", desc: "Enter a postcode, go to your council's bands" },
  areaOld: { href: "/your-area/", label: "Your area", desc: "Find your council by postcode" },
  precepts: { href: "/precepts/", label: "What makes up a bill", desc: "Council, county, police, fire and parish shares" },
  parishes: { href: "/precepts/parishes/", label: "Parish precepts", desc: "Every parish precept by council" },
  help: { href: "/help/", label: "Help with your bill", desc: "Bands, discounts and official next steps" },
  future: { href: "/tools/future-cost/", label: "Future cost", desc: "Model annual changes over time" },
  next: { href: "/council-tax-2027-28/", label: "Council tax 2027/28", desc: "Not yet set: when each nation's figures publish" },
  play: { href: "/tools/budget/", label: "Play the budget game", desc: "Guess how your council splits its budget" },
  set: { href: "/tools/budget/#set-the-budget", label: "Set a budget yourself", desc: "Move the levers, balance the books" },
  tools: { href: "/tools/", label: "All tools", desc: "Bills, budgets and future costs" },
  compare: { href: "/compare/", label: "Compare two councils", desc: "Same band, same year, same council type" },
  england: { href: "/council-tax/", label: "Council tax in England", desc: "The map, the average and every council" },
  ranked: { href: "/council-tax/ranked/", label: "Band D ranked", desc: "Against councils of the same type" },
  rises: { href: "/increases/#2026-27", label: "Rises 2026/27", desc: "How much each council raised its share" },
  towns: { href: "/council-tax/towns/", label: "By parish and area", desc: "Full Band D for every parish and area" },
  councils: { href: "/councils/", label: "Every council", desc: "All 296 councils in England, by region" },
  scotland: { href: "/scotland/", label: "Scotland", desc: "Published bands, water charges kept separate" },
  wales: { href: "/wales/", label: "Wales", desc: "Band D averages and their components" },
  about: { href: "/about/", label: "About" },
  methodology: { href: "/methodology/", label: "Methodology" },
  sources: { href: "/sources/", label: "Sources" },
  data: { href: "/data/", label: "Official publications" },
  coverage: { href: "/coverage/", label: "UK coverage" },
  increases: { href: "/increases/", label: "Annual increases" },
  changes: { href: "/changes/", label: "What changed" },
  findings: { href: "/findings/", label: "Findings" },
  corrections: { href: "/corrections/", label: "Corrections" },
  contact: { href: "/contact/", label: "Contact" },
  privacy: { href: "/privacy/", label: "Privacy" },
};

const SISTERS = [
  { name: "UK Councils", url: "https://ukcouncils.co.uk/", blurb: "The wider picture of your local council" },
  { name: "UK Places", url: "https://ukplaces.co.uk/", blurb: "Explore places and their local context" },
  { name: "UK Elections", url: "https://ukelections.co.uk/", blurb: "Results and seats for every council" },
  { name: "UK Demographics", url: "https://ukdemographics.co.uk/", blurb: "Population and census for every place" },
  { name: "UK School Holiday Dates", url: "https://ukschoolholidaydates.co.uk/", blurb: "Term dates for every education authority" },
  { name: "AI DOGE", url: "https://aidoge.co.uk/", blurb: "What public bodies publish about their spending" },
];

/* The mark slot. The D8 mocks carry today's shared glyph in the live tokens; the D3 sheets
   swap the contents of every [data-mark] for a candidate. */
const MARK_UKCT = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="12" fill="var(--accent)"/><path d="M14 50V28L32 16l18 12v22H38V36H26v14z" fill="var(--accent-wash)"/></svg>`;
const MARK_UKC = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="12" fill="#245b87"/><path d="M14 50V28L32 16l18 12v22H38V36H26v14z" fill="#eef5fb"/></svg>`;

const caret = `<span class="hm-caret" aria-hidden="true"><svg viewBox="0 0 10 6" width="10" height="6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
const burger = `<svg class="hm-open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg><svg class="hm-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const glass = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>`;

const brand = (tag = false) => `<a class="hm-brand" href="/"><span class="hm-mark" data-mark="ukct">${MARK_UKCT}</span><span class="hm-name">UK Council Tax${tag ? `<span class="hm-tag hm-wide">Your bill. Its history. Your next decision.</span>` : ""}</span></a>`;
const item = (l, lead = false) => `<a class="hm-item${lead ? " hm-item--lead" : ""}" href="${l.href}"><b>${l.label}</b><span>${l.desc}</span></a>`;
const group = (label, panel, extra = "") => `<details class="hm-group${extra}" name="hm-nav"><summary class="hm-trigger">${label} ${caret}</summary>${panel}</details>`;
const dgroup = (label, links, open = false) => `<details class="hm-dgroup" name="hm-dnav"${open ? " open" : ""}><summary>${label} ${caret}</summary><div class="hm-dlist">${links.map((l) => `<a href="${l.href}">${l.label}<span>${l.desc}</span></a>`).join("")}</div></details>`;
const tile = (l, label, desc) => `<a class="hm-tile" href="${l.href}"><b>${label ?? l.label}</b><span>${desc ?? l.desc}</span></a>`;
const drawer = (body, label = "Menu") => `<details class="hm-drawer" name="hm-drawer"><summary class="hm-menu" aria-label="${label}">${burger}</summary><div class="hm-drawer-panel">${body}</div></details>`;
const dsearch = `<a class="hm-dsearch" href="/councils/">${glass} Search councils and pages</a>`;
const findForm = (cls = "") => `<form class="hm-find${cls}" action="/your-area/" method="get"><label class="hm-sr" for="hm-pc">Postcode</label><input id="hm-pc" type="text" inputmode="text" autocomplete="postal-code" placeholder="Postcode"><button class="hm-btn" type="submit">Find my bill</button></form>`;

/* ---------- the three options ---------- */

// (a) The recommendation on file: four menus plus "Find my bill".
const A = {
  id: "a",
  title: "Option A, four menus plus Find my bill",
  groups: [
    ["Your bill", [L.precepts, L.parishes, L.help, L.future, L.next]],
    ["Budgets", [L.play, L.set, L.tools]],
    ["Compare", [L.compare, L.england, L.ranked, L.rises, L.towns]],
    ["Explore", [L.councils, L.scotland, L.wales]],
  ],
  extraHeader: [L.area],
  open: "Budgets",
};
A.header = () => `
<div class="hm-bar" data-mock-header data-opt="a">
  <header class="hm-row">
    ${brand()}
    <nav class="hm-nav" aria-label="Primary">
      ${group("Your bill", `<div class="hm-panel">${A.groups[0][1].map((l, i) => item(l, i === 0)).join("")}</div>`)}
      ${group("Budgets", `<div class="hm-panel">${A.groups[1][1].map((l, i) => item(l, i === 0)).join("")}</div>`)}
      ${group("Compare", `<div class="hm-panel">${A.groups[2][1].map((l, i) => item(l, i === 0)).join("")}</div>`)}
      ${group("Explore", `<div class="hm-panel hm-panel--narrow">${A.groups[3][1].map((l) => item(l)).join("")}</div>`, " hm-group--end")}
    </nav>
    <div class="hm-tools">
      <a class="hm-search hm-wide" href="/councils/">${glass} Search</a>
      ${findForm(" hm-wide")}
      <a class="hm-btn hm-narrow" href="/your-area/">Find my bill</a>
      ${drawer(`${dsearch}
        <div class="hm-grid">${tile(L.area, "Find my bill", "Postcode to your council's bands")}${tile(L.play, "Budget game", "Guess the split")}${tile(L.set, "Set a budget", "Balance the books")}${tile(L.compare, "Compare", "Two councils, same band")}</div>
        ${A.groups.map(([label, links]) => dgroup(label, links)).join("")}`)}
    </div>
  </header>
</div>`;

// (b) Leaner, phone first: the bill and the game are one tap from every page, at every width.
const B = {
  id: "b",
  title: "Option B, lean: Your bill, Budget game, Compare, More",
  direct: [L.area, L.play, L.compare],
  more: [
    ["Your bill", [L.precepts, L.parishes, L.help, L.future, L.next]],
    ["Budgets", [L.set, L.tools]],
    ["Compare and explore", [L.england, L.ranked, L.rises, L.towns, L.councils, L.scotland, L.wales]],
  ],
  open: "More",
};
B.groups = [["Direct", B.direct], ...B.more];
B.header = () => `
<div class="hm-bar" data-mock-header data-opt="b">
  <header class="hm-row">
    ${brand()}
    <nav class="hm-nav" aria-label="Primary">
      <a class="hm-direct" href="/your-area/">Your bill</a>
      <a class="hm-direct" href="/tools/budget/">Budget game</a>
      <a class="hm-direct" href="/compare/">Compare</a>
      ${group("More", `<div class="hm-panel hm-panel--wide">${B.more.map(([label, links]) => `<div><p class="hm-colhead">${label}</p>${links.map((l) => item(l)).join("")}</div>`).join("")}</div>`)}
    </nav>
    <div class="hm-tools">
      <a class="hm-search hm-wide" href="/councils/">${glass} Search</a>
      <a class="hm-pill hm-narrow" href="/your-area/">Your bill</a>
      <a class="hm-pill hm-pill--solid hm-narrow" href="/tools/budget/" aria-label="Budget game">Game</a>
      ${drawer(`${dsearch}
        <div class="hm-grid">${tile(L.set, "Set a budget", "Balance the books")}${tile(L.compare, "Compare", "Two councils, same band")}</div>
        ${B.more.map(([label, links]) => `<p class="hm-dhead">${label}</p><div class="hm-dflat">${links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}</div>`).join("")}`)}
    </div>
  </header>
</div>`;

// (c) Today's header, tidied: the same three groups, Budget game becomes a menu with Set.
const C = {
  id: "c",
  title: "Option C, today's header tidied (control)",
  groups: [
    ["Find your council", [L.areaOld, L.councils, L.scotland, L.wales]],
    ["Compare and rank", [L.england, L.ranked, L.compare, L.towns, L.rises]],
    ["Your bill", [L.precepts, L.parishes, L.help, L.future, L.next]],
    ["Budget game", [L.play, L.set, L.tools]],
  ],
  open: "Budget game",
};
C.header = () => `
<div class="hm-bar" data-mock-header data-opt="c">
  <header class="hm-row">
    ${brand(true)}
    <nav class="hm-nav" aria-label="Primary">
      ${C.groups.map(([label, links], i) => group(label, `<div class="hm-panel hm-panel--narrow">${links.map((l) => item(l)).join("")}</div>`, i === 3 ? " hm-group--end" : "")).join("")}
    </nav>
    <div class="hm-tools">
      <a class="hm-search" href="/councils/">Search</a>
      ${drawer(`<a class="hm-dflat" href="/" style="display:block"><b>Home</b></a>${C.groups.map(([label, links]) => dgroup(label, links)).join("")}`)}
    </div>
  </header>
</div>`;

/* ---------- footers ---------- */

const FOOT_COLS = [
  ["Tools", [L.play, L.set, L.compare, L.future, L.tools]],
  ["Your bill", [L.area, L.precepts, L.help, L.next]],
  ["About the data", [L.methodology, L.sources, L.data, L.coverage, L.changes, L.corrections]],
  ["Site", [L.about, L.findings, L.increases, L.contact, L.privacy]],
];
const imprint = `<p class="hm-imprint">An independent reference site, not a council or government service. UK Council Tax republishes official figures about local authorities in the UK. Every figure carries its source and date. Council tax figures are from MHCLG, the Scottish Government and the Welsh Government under the Open Government Licence v3.0.</p>`;
const theme = `<label>Theme <select><option>Match device</option><option>Light</option><option>Dark</option></select></label>`;

const footerNew = () => `
<footer class="hm-foot" data-mock-footer>
  <div class="hm-shell">
    <nav class="hm-fcols" aria-label="Footer">${FOOT_COLS.map(([h, links]) => `<div><h2>${h}</h2><ul>${links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}</ul></div>`).join("")}</nav>
    <p class="hm-fhead">Sister sites</p>
    <ul class="hm-sisters">
      <li class="hm-sister hm-sister--lead"><span class="hm-smark" data-mark="ukc">${MARK_UKC}</span><div><b><a href="${SISTERS[0].url}">${SISTERS[0].name}</a></b><span>${SISTERS[0].blurb}. Its finances, services and elections.</span></div></li>
      ${SISTERS.slice(1).map((s) => `<li class="hm-sister"><div><b><a href="${s.url}">${s.name}</a></b><span>${s.blurb}</span></div></li>`).join("")}
    </ul>
    ${imprint}
    <div class="hm-fbase"><span>UK Council Tax</span>${theme}</div>
  </div>
</footer>`;

const FOOT_TODAY = [L.about, L.methodology, L.sources, L.data, L.coverage, L.tools, L.increases, L.changes, L.findings, L.corrections, L.contact, L.privacy];
const footerToday = () => `
<footer class="hm-foot" data-mock-footer>
  <div class="hm-shell">
    <p class="hm-fhead">Sister sites</p>
    <ul class="hm-flatsis">${SISTERS.map((s) => `<li><a href="${s.url}">${s.name}</a><span>${s.blurb}</span></li>`).join("")}</ul>
    ${imprint}
    <ul class="hm-flat">${FOOT_TODAY.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}</ul>
    <div class="hm-fbase">${theme}</div>
  </div>
</footer>`;

A.footer = footerNew; A.footLinks = FOOT_COLS.flatMap(([, l]) => l);
B.footer = footerNew; B.footLinks = A.footLinks;
C.footer = footerToday; C.footLinks = FOOT_TODAY;

/* ---------- write ---------- */

const page = (opt) => `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${opt.title} | Header round D8</title>
<link rel="stylesheet" href="tokens-b.css">
<link rel="stylesheet" href="header.css">
</head>
<body>
${opt.header().trim()}
<main class="mock-body shell">
  <h1>${opt.title}</h1>
  <p>A static mock for decision D8. The menus and the phone drawer are &lt;details&gt; elements and open without JavaScript. Every link goes to a page that exists on ukcounciltax.co.uk. Without JavaScript, "Find my bill" goes to the postcode page; the postcode is not put in the address.</p>
  <p>Theme follows the device. Add <code>data-theme="light"</code> or <code>data-theme="dark"</code> to the html element to force one.</p>
</main>
${opt.footer().trim()}
</body>
</html>
`;

const site = readFileSync(join(ROOT, "src/lib/site.ts"), "utf8");
const block = site.slice(site.indexOf("STATIC_PATHS = ["), site.indexOf("] as const"));
const staticPaths = [...block.matchAll(/"(\/[^"]*)"/g)].map((m) => m[1]).concat(["/council-tax-2027-28/"]);

const report = [];
for (const opt of [A, B, C]) {
  writeFileSync(join(HERE, `option-${opt.id}.html`), page(opt));
  const headerLinks = opt.groups.flatMap(([, l]) => l).concat(opt.extraHeader ?? []);
  const topLevel = { a: { desktop: "4 menus, Search, Find my bill (6)", phone: "Find my bill, Menu (2)" }, b: { desktop: "3 links, More, Search (5)", phone: "Your bill, Game, Menu (3)" }, c: { desktop: "4 menus, Search (5)", phone: "Search, Menu (2)" } }[opt.id];
  const count = headerLinks.length + 1; // plus Search; the drawer repeats these links
  const reach = new Set([...headerLinks, ...opt.footLinks].map((l) => l.href.replace(/#.*$/, "")));
  const missing = staticPaths.filter((p) => p !== "/" && !reach.has(p));
  report.push({ option: opt.id, topLevelItems: topLevel, headerLinks: count, footerLinks: opt.footLinks.length, notReachedFromHeaderOrFooter: missing });
}
writeFileSync(join(HERE, "links.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
