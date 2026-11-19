/**
 * Header and marks round (D8 and D3). Pictures only: nothing here changes the site.
 *
 *   node docs/design/header-round/build.mjs            write the three mocks
 *   node docs/design/header-round/round.mjs capture    capture the mocks over the live site (OUT)
 *   node docs/design/header-round/round.mjs sheets     build the JPEG sheets from OUT
 *
 * Run from a checkout that has node_modules (Playwright is resolved from the current
 * directory). The live homepage is loaded read only; its header, drawer and footer are
 * replaced in the loaded page by the mock's, with header.css added. No build is needed
 * because every colour in the mocks is a token the live page already defines.
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MARKS = join(HERE, "..", "marks");
const OUT = resolve(process.env.OUT ?? join(HERE, ".captures"));
const BASE = (process.env.BASE_URL ?? "https://ukcounciltax.co.uk").replace(/\/$/, "");
const UKC = "https://ukcouncils.co.uk";
const THEMES = ["dark", "light"];
const VIEWS = [{ id: "1440", width: 1440, height: 900 }, { id: "390", width: 390, height: 844 }];
const OPTIONS = { a: "Budgets", b: "More", c: "Budget game" };
const OPTION_NAME = { a: "A, four menus plus Find my bill", b: "B, lean: Your bill, Budget game, Compare, More", c: "C, today's header tidied (control)" };
const PAIRS = { 1: "Pair 1, the bill stripe and the tiers", 2: "Pair 2, the share of a pound and the locator", 3: "Pair 3, the pennies and the boundary" };
const MARK_HEADER_OPTION = process.env.MARK_OPTION ?? "b";
const CSS = readFileSync(join(HERE, "header.css"), "utf8");

async function chromium() {
  const require = createRequire(join(process.cwd(), "package.json"));
  return require("playwright-core").chromium;
}

function fragments(id) {
  const html = readFileSync(join(HERE, `option-${id}.html`), "utf8");
  const header = html.slice(html.indexOf('<div class="hm-bar"'), html.indexOf("<main"));
  const footer = html.slice(html.indexOf('<footer class="hm-foot"'), html.indexOf("</footer>") + 9);
  return { header, footer };
}
const svg = (file) => readFileSync(join(MARKS, file), "utf8").replace(/<title>[^<]*<\/title>/, "");

async function mount(page, id, pair) {
  const { header, footer } = fragments(id);
  await page.goto(BASE + "/", { waitUntil: "load", timeout: 60000 });
  await page.addStyleTag({ content: CSS });
  await page.evaluate(({ header, footer, ukct, ukc }) => {
    const bar = document.querySelector(".site-header-bar");
    bar.insertAdjacentHTML("beforebegin", header);
    bar.remove();
    document.querySelector(".mobile-drawer")?.remove();
    const foot = document.querySelector(".site-footer");
    foot.insertAdjacentHTML("beforebegin", footer);
    foot.remove();
    if (ukct) for (const el of document.querySelectorAll('[data-mark="ukct"]')) el.innerHTML = ukct;
    if (ukc) for (const el of document.querySelectorAll('[data-mark="ukc"]')) el.innerHTML = ukc;
    const top = document.querySelector(".hm-bar").getBoundingClientRect().bottom;
    document.documentElement.style.setProperty("--hm-top", `${top}px`);
  }, { header, footer, ukct: pair ? svg(`pair-${pair}-ukct.svg`) : null, ukc: pair ? svg(`pair-${pair}-ukc.svg`) : null });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

const shot = (...parts) => join(OUT, `${parts.join("_")}.png`);

async function capture() {
  mkdirSync(OUT, { recursive: true });
  const browser = await (await chromium()).launch();
  const metrics = {};
  for (const theme of THEMES) {
    for (const view of VIEWS) {
      const context = await browser.newContext({ viewport: { width: view.width, height: view.height }, colorScheme: theme, reducedMotion: "reduce", bypassCSP: true, deviceScaleFactor: 1 });
      const page = await context.newPage();
      for (const id of Object.keys(OPTIONS)) {
        await mount(page, id);
        await page.screenshot({ path: shot("d8", id, theme, view.id, "closed") });
        if (view.id === "390") {
          const m = await page.evaluate(() => ({ headerHeight: Math.round(document.querySelector(".hm-bar").getBoundingClientRect().height), overflow390: document.documentElement.scrollWidth > window.innerWidth }));
          await page.setViewportSize({ width: 375, height: 844 });
          m.overflow375 = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
          await page.setViewportSize({ width: 390, height: 844 });
          metrics[`${id}_${theme}`] = m;
          await page.evaluate(() => { document.querySelector(".hm-drawer").open = true; });
          await page.waitForTimeout(200);
          await page.screenshot({ path: shot("d8", id, theme, view.id, "open") });
          await page.evaluate(() => { document.querySelector(".hm-drawer").open = false; });
        } else {
          const h = await page.evaluate(() => Math.round(document.querySelector(".hm-bar").getBoundingClientRect().height));
          metrics[`${id}_${theme}_1440`] = { headerHeight: h };
          await page.evaluate((label) => {
            const g = [...document.querySelectorAll(".hm-nav .hm-group")].find((d) => d.querySelector("summary").textContent.trim() === label);
            g.open = true;
          }, OPTIONS[id]);
          await page.waitForTimeout(200);
          await page.screenshot({ path: shot("d8", id, theme, view.id, "open") });
          await page.evaluate(() => { for (const d of document.querySelectorAll("details")) d.open = false; });
        }
        await page.evaluate(() => document.querySelector(".hm-foot").scrollIntoView({ block: "end" }));
        await page.waitForTimeout(200);
        await page.screenshot({ path: shot("d8", id, theme, view.id, "footer") });
      }
      // D3: the chosen header option with each candidate pair of marks.
      for (const pair of Object.keys(PAIRS)) {
        await mount(page, MARK_HEADER_OPTION, pair);
        await page.screenshot({ path: shot("d3", pair, theme, view.id, "header"), clip: { x: 0, y: 0, width: view.width, height: 72 } });
        const box = await page.evaluate(() => { const el = document.querySelector(".hm-sister--lead"); el.scrollIntoView({ block: "center" }); const r = el.getBoundingClientRect(); return { x: r.x - 12, y: r.y - 12, width: r.width + 24, height: r.height + 24 }; });
        await page.waitForTimeout(150);
        await page.screenshot({ path: shot("d3", pair, theme, view.id, "sister"), clip: box });
      }
      // D3: the UK Councils mark in the live UK Councils header.
      for (const pair of Object.keys(PAIRS)) {
        await page.goto(UKC + "/", { waitUntil: "load", timeout: 60000 });
        await page.evaluate((s) => { const m = document.querySelector(".brand-mark"); if (m) m.innerHTML = s.replace("<svg ", '<svg width="30" height="30" '); }, svg(`pair-${pair}-ukc.svg`));
        await page.waitForTimeout(200);
        await page.screenshot({ path: shot("d3", pair, theme, view.id, "ukc"), clip: { x: 0, y: 0, width: view.width, height: 72 } });
      }
      await context.close();
      console.log(`captured ${theme} ${view.id}`);
    }
  }
  writeFileSync(join(HERE, "metrics.json"), JSON.stringify(metrics, null, 2) + "\n");
  console.log(metrics);
  await browser.close();
}

/* ---------- sheets ---------- */

const img = (file, width, extra = "") => existsSync(file) ? `<img src="${pathToFileURL(file)}" width="${width}"${extra}>` : `<div class="none" style="width:${width}px">not captured</div>`;
const shell = (title, sub, body, width, bg = "#e9e9e6", fg = "#111") => `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:20px;width:${width}px;background:${bg};color:${fg};font:15px/1.35 -apple-system,Helvetica,Arial,sans-serif}
h1{font-size:26px;margin:0 0 2px}p.sub{margin:0 0 16px;opacity:.8}h2{font-size:19px;margin:22px 0 6px}
.row{display:flex;gap:12px;align-items:flex-start;margin:0 0 8px}.label{font-weight:600;margin:10px 0 4px}
img,.none{display:block;border:1px solid #9995}.none{height:60px;font-size:12px;padding:6px;box-sizing:border-box}
.cap{font-size:13px;margin:3px 0 0;opacity:.8}figure{margin:0}</style><h1>${title}</h1><p class="sub">${sub}</p>${body}`;

async function sheets() {
  const browser = await (await chromium()).launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const save = async (html, name, width) => {
    await page.setViewportSize({ width: width + 40, height: 800 });
    const file = join(OUT, `${name}.html`);
    writeFileSync(file, html);
    await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
    await page.evaluate(() => (window.ready ? window.ready() : null));
    await page.screenshot({ path: join(HERE, name), fullPage: true, type: "jpeg", quality: Number(process.env.QUALITY ?? 72) });
    console.log(`wrote ${name}`);
  };
  const metrics = JSON.parse(readFileSync(join(HERE, "metrics.json"), "utf8"));
  const fig = (file, w, cap, extra) => `<figure>${img(file, w, extra)}<p class="cap">${cap}</p></figure>`;

  for (const theme of THEMES) {
    const T = theme === "dark" ? "Dark" : "Light";
    // Desktop: one row per option, closed and with one menu open, then the three footers.
    let body = "";
    for (const id of Object.keys(OPTIONS)) {
      body += `<h2>Option ${OPTION_NAME[id]}</h2><div class="row">${fig(shot("d8", id, theme, "1440", "closed"), 720, "Closed, over the live homepage")}${fig(shot("d8", id, theme, "1440", "open"), 720, `"${OPTIONS[id]}" open`)}</div>`;
    }
    body += `<h2>Footers at 1440 (A and B share one footer; C is today's)</h2><div class="row">${Object.keys(OPTIONS).map((id) => fig(shot("d8", id, theme, "1440", "footer"), 476, `Option ${id.toUpperCase()}`)).join("")}</div>`;
    await save(shell(`D8 header round, desktop at 1440, ${theme}`, `${T} theme. Each mock header and footer is placed over the live homepage (ukcounciltax.co.uk, 18 November 2026). Palette B tokens, Source Serif 4 and Source Sans 3. Shown at half size.`, body, 1452), `sheet-d8-desktop-${theme}.jpg`, 1452);

    // Phone: one row per option, closed, drawer open, footer, at full size.
    body = "";
    for (const id of Object.keys(OPTIONS)) {
      const m = metrics[`${id}_${theme}`];
      body += `<h2>Option ${OPTION_NAME[id]}</h2><p class="cap">Header ${m.headerHeight} px tall at 390. Horizontal overflow at 390: ${m.overflow390 ? "yes" : "none"}; at 375: ${m.overflow375 ? "yes" : "none"}.</p><div class="row">${fig(shot("d8", id, theme, "390", "closed"), 390, "Closed")}${fig(shot("d8", id, theme, "390", "open"), 390, "Drawer open")}${fig(shot("d8", id, theme, "390", "footer"), 390, "Foot of the page")}</div>`;
    }
    await save(shell(`D8 header round, phone at 390, ${theme}`, `${T} theme. Actual size. Over the live homepage.`, body, 1210), `sheet-d8-phone-${theme}.jpg`, 1210);

    // D3 in use: the header, the UK Councils sister card and the live UK Councils header.
    body = "";
    for (const pair of Object.keys(PAIRS)) {
      body += `<h2>${PAIRS[pair]}</h2>
        <div class="label">UK Council Tax header (option ${MARK_HEADER_OPTION.toUpperCase()}) at 1440 and at 390</div>${img(shot("d3", pair, theme, "1440", "header"), 1440)}<div class="row" style="margin-top:8px">${img(shot("d3", pair, theme, "390", "header"), 390)}${img(shot("d3", pair, theme, "390", "ukc"), 390)}<div>${img(shot("d3", pair, theme, "390", "sister"), 390)}<p class="cap">Left: UK Council Tax at 390. Middle: the UK Councils mark in the live UK Councils header at 390. Right: the UK Councils card in the UK Council Tax footer, on the band green.</p></div></div>`;
    }
    await save(shell(`D3 marks in use, ${theme}`, `${T} theme. Each candidate pair placed in the header mock and in the live UK Councils header.`, body, 1440), `sheet-d3-in-use-${theme}.jpg`, 1440);
  }

  // D3: the marks at 16, 32 and 120 on the three grounds, a 16 px raster enlarged, and tabs.
  const grounds = [["Band green", "#0e4a36", "#f7f2e3"], ["Cream paper", "#f6f1e4", "#1b1f1a"], ["Dark", "#0c1310", "#f4efe2"]];
  const url = (f) => pathToFileURL(join(MARKS, f)).href;
  const today = { ukct: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#23664f"/><path d="M14 50V28L32 16l18 12v22H38V36H26v14z" fill="#edf6f0"/></svg>')}`, ukc: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#245b87"/><path d="M14 50V28L32 16l18 12v22H38V36H26v14z" fill="#eef5fb"/></svg>')}` };
  const set = (ukct, ukc) => `<div class="set"><div class="one">${[16, 32, 120].map((s) => `<img src="${ukct}" width="${s}" height="${s}">`).join("")}<span>UK Council Tax</span></div><div class="one">${[16, 32, 120].map((s) => `<img src="${ukc}" width="${s}" height="${s}">`).join("")}<span>UK Councils</span></div></div>`;
  const raster = (src) => `<canvas class="px" data-src="${src}" width="96" height="96"></canvas>`;
  const tabs = (ukct, ukc, dark) => `<div class="tabs ${dark ? "dk" : "lt"}"><div class="tab on"><img src="${ukct}" width="16" height="16">Burnley | UK Council Tax</div><div class="tab"><img src="${ukc}" width="16" height="16">Burnley | UK Councils</div><div class="tab"><span class="blank"></span>Inbox</div></div>`;
  let body = `<style>
    .grid{display:grid;grid-template-columns:150px repeat(3,1fr);gap:0;border:1px solid #9995}
    .grid > div{padding:14px;border-left:1px solid #9995;border-top:1px solid #9995}
    .grid .h{font-weight:600}.set{display:flex;flex-direction:column;gap:12px}.one{display:flex;align-items:end;gap:14px}.one span{font-size:12px;opacity:.85}
    .px{width:96px;height:96px;image-rendering:pixelated;border:1px solid #9995;margin-right:8px}
    .tabs{display:flex;gap:2px;padding:8px 8px 0;border-radius:8px 8px 0 0;width:640px}.tab{display:flex;align-items:center;gap:8px;padding:8px 12px;font:13px -apple-system,Helvetica,Arial,sans-serif;border-radius:8px 8px 0 0;width:200px;white-space:nowrap;overflow:hidden}
    .lt{background:#dee1e6;color:#202124}.lt .on{background:#fff}.dk{background:#202124;color:#e8eaed}.dk .on{background:#35363a}.blank{width:16px;height:16px;border-radius:50%;background:#9aa0a6}
  </style>`;
  const rows = [["Today (shared glyph)", today.ukct, today.ukct, today.ukc]].concat(Object.keys(PAIRS).map((p) => [PAIRS[p], url(`pair-${p}-ukct-band.svg`), url(`pair-${p}-ukct.svg`), url(`pair-${p}-ukc.svg`)]));
  body += `<div class="grid"><div class="h"></div>${grounds.map(([n, bg]) => `<div class="h">${n} <code>${bg}</code></div>`).join("")}`;
  for (const [name, band, main, ukc] of rows) {
    body += `<div class="h">${name}</div>${grounds.map(([n, bg, fg], i) => `<div style="background:${bg};color:${fg}">${set(i === 0 ? band : main, ukc)}</div>`).join("")}`;
  }
  body += `</div><h2>At 16 px, as the pixels fall (enlarged six times, no smoothing)</h2><div class="grid" style="grid-template-columns:150px 1fr"><div class="h"></div><div class="h">UK Council Tax, UK Councils</div>${rows.map(([name, , main, ukc]) => `<div class="h">${name}</div><div>${raster(main)}${raster(ukc)}</div>`).join("")}</div>`;
  body += `<h2>As a favicon beside the tab title</h2>${rows.map(([name, , main, ukc]) => `<div class="label">${name}</div><div class="row">${tabs(main, ukc, true)}${tabs(main, ukc, false)}</div>`).join("")}`;
  body += `<script>window.ready = () => Promise.all([...document.querySelectorAll("canvas.px")].map((c) => new Promise((done) => { const im = new Image(); im.onload = () => { const t = document.createElement("canvas"); t.width = t.height = 16; t.getContext("2d").drawImage(im, 0, 0, 16, 16); const x = c.getContext("2d"); x.imageSmoothingEnabled = false; x.drawImage(t, 0, 0, 96, 96); done(); }; im.src = c.dataset.src; })));</script>`;
  await save(shell("D3 marks, three candidate pairs", "UK Council Tax in palette B values only; UK Councils in its live tokens (#245b87, #8cc4ed, #eef5fb). On the band green, UK Council Tax uses its reversed tile. Sizes 16, 32 and 120 px.", body, 1300), "sheet-d3-marks.jpg", 1300);
  await browser.close();
}

const command = process.argv[2];
if (command === "capture") await capture();
else if (command === "sheets") await sheets();
else { console.error("usage: round.mjs capture | sheets"); process.exitCode = 2; }
