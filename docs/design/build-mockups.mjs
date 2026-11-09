// Draws the A5 and A6 mockup figures through the Estate Kit and writes them to svg/.
// Design prep only: nothing here is imported by the site.
//
//   KIT=~/wt/kit-uct node docs/design/build-mockups.mjs
//
// KIT is an estate-kit checkout at 0.2.0 or later with `npm run build:lib` done
// (tompickup23/estate-kit PR 3). Every chart takes its figures by key from
// figures.burnley.json; the only arithmetic here is the game's own (shares of the
// published amounts, the split score and the gap in pence), shown with its method.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = (process.env.KIT ?? join(homedir(), "wt/kit-uct")).replace(/^~/, homedir());
const kit = await import(join(KIT, "dist/src/index.js"));
const { defineFigures, useFigures, billAnatomy, waffle, squaresFor, VERSION } = kit;

const data = JSON.parse(readFileSync(join(HERE, "figures.burnley.json"), "utf8"));
const set = useFigures(defineFigures(data));
const out = join(HERE, "svg");
mkdirSync(out, { recursive: true });
const write = (name, svg) => writeFileSync(join(out, name), svg + "\n");

// Hero: the bill anatomy card, reconciled to the published total to the penny.
const bill = billAnatomy({
  parts: ["billing", "county", "police", "fire"].map((k) => `burnley.bandd.${k}`),
  total: "burnley.bandd.total",
  title: "Four bodies charge a Burnley Band D bill"
});
write("hero-bill.svg", bill.svg);
writeFileSync(join(out, "hero-bill.table.html"), bill.table + "\n");

// Game: the published split and an example guess, each as the small 10 by 10 waffle.
const SERVICES = ["asc", "hsg", "cult", "env", "cent"];
const published = SERVICES.map((k) => `burnley.ra.${k}`);
const guess = SERVICES.map((k) => `mockup.guess.${k}`);
const pub = waffle({ parts: published, size: "small" });
const yours = waffle({ parts: guess, size: "small" });
write("game-published.svg", pub.svg);
write("game-yours.svg", yours.svg);
writeFileSync(join(out, "game-published.table.html"), pub.table + "\n");

// The grid alone (the live round's service rows are its key): crop the small waffle
// to its square grid. In the build this is a kit option (A6 brief, kit 0.3.0 list).
const gridOnly = (svg) => {
  const w = +svg.match(/viewBox="0 0 ([\d.]+) /)[1];
  return svg.replace(/viewBox="0 0 ([\d.]+) ([\d.]+)"/, `viewBox="0 0 $1 ${w}"`).replace(/height="[\d.]+"/, `height="${w}"`);
};
write("game-teaser.svg", gridOnly(pub.svg));
// The round in progress: the first 62 of the guess's squares placed, the rest hollow.
let n = 0;
const progress = gridOnly(yours.svg).replace(/<rect ([^>]*)style="fill:var\(--series-\d\)"([^>]*) data-ek-on=""\/>(<path[^>]*\/>)?/g, (m, a, b) => {
  n++;
  return n <= 62 ? m : `<rect ${a}style="fill:var(--bg-subtle);stroke:var(--border-strong)"${b}/>`;
});
write("game-progress.svg", progress);

// The game's arithmetic, as src/lib/budget-game.ts does it.
const values = published.map((k) => set.value(k).value);
const base = values.reduce((a, b) => a + b, 0);
const shares = values.map((v) => (v / base) * 100);
const guesses = guess.map((k) => set.value(k).value);
const score = Math.max(0, Math.min(100, Math.round(100 - guesses.reduce((s, g, i) => s + Math.abs(g - shares[i]), 0) / 2)));
const gaps = guesses.map((g, i) => g - shares[i]);

// The gap bars: one diverging bar per service from zero, in pence. The kit's zeroBar
// refuses negatives today, so this is drawn here with the kit's tokens and type; the
// A6 brief lists a diverging zeroBar for kit 0.3.0.
const names = published.map((k) => set.value(k).name);
const W = 600, rowH = 44, top = 8, mid = W / 2, scale = (W / 2 - 130) / Math.max(...gaps.map(Math.abs));
const fmt = (v) => (Math.abs(v) < 0.05 ? "0.0p" : `${Math.abs(v).toFixed(1)}p ${v > 0 ? "over" : "under"}`);
let g = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${top + names.length * rowH * 1.6 + 96}" role="img" class="ek-chart" aria-label="Gap between the example guess and the published share for each service, in pence">`;
names.forEach((name, i) => {
  const y = top + i * rowH * 1.6;
  const v = gaps[i], w = Math.abs(v) * scale, x = v >= 0 ? mid : mid - w;
  g += `<text x="4" y="${y + 18}" font-size="20" font-family="'Source Sans 3', sans-serif" style="fill:var(--text)">${name}</text>`;
  g += `<rect x="${x.toFixed(2)}" y="${y + 28}" width="${Math.max(w, 1.5).toFixed(2)}" height="22" rx="3" style="fill:var(--accent)"/>`;
  const tx = v >= 0 ? mid + w + 8 : mid - w - 8;
  g += `<text x="${tx.toFixed(2)}" y="${y + 45}" font-size="20" font-weight="600" font-family="'Source Sans 3', sans-serif" text-anchor="${v >= 0 ? "start" : "end"}" font-variant-numeric="tabular-nums" style="fill:var(--text)">${fmt(v)}</text>`;
});
const axisBottom = top + names.length * rowH * 1.6;
g += `<line x1="${mid}" y1="${top + 22}" x2="${mid}" y2="${axisBottom}" stroke-width="1.5" style="stroke:var(--border-strong)"/>`;
g += `<text x="${mid - 8}" y="${axisBottom + 26}" font-size="19" font-family="'Source Sans 3', sans-serif" text-anchor="end" style="fill:var(--text-muted)">Guessed too little</text>`;
g += `<text x="${mid + 8}" y="${axisBottom + 26}" font-size="19" font-family="'Source Sans 3', sans-serif" style="fill:var(--text-muted)">Guessed too much</text>`;
for (const [j, line] of ["Gap: your pence less the published share. The published share is", "each service's amount over the five services' total, times 100."].entries())
  g += `<text x="4" y="${axisBottom + 58 + j * 25}" font-size="19" font-family="'Source Sans 3', sans-serif" style="fill:var(--text-muted)">${line}</text>`;
g += `</svg>`;
write("game-gap.svg", g);

// Task card thumbnails: decoration under a link, no text, drawn to scale from the figures.
const thumb = (body, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 64" class="thumb" aria-hidden="true" focusable="false" data-thumb="${label}">${body}</svg>`;
const bands = set.series("burnley.bands.unparished").points;
const bMax = Math.max(...bands.map((p) => p.value));
write("thumb-bands.svg", thumb(bands.map((p, i) => {
  const h = (p.value / bMax) * 56;
  return `<rect x="${4 + i * 19.5}" y="${60 - h}" width="15" height="${h}" rx="2" style="fill:var(${p.label === "D" ? "--accent" : "--series-neutral-soft"})"/>`;
}).join(""), "bands"));
const hist = set.series("england.area_bandd.history").points;
const hMax = Math.max(...hist.map((p) => p.value));
const pts = hist.map((p, i) => `${(4 + (i / (hist.length - 1)) * 152).toFixed(1)},${(60 - (p.value / hMax) * 54).toFixed(1)}`);
write("thumb-line.svg", thumb(`<line x1="4" y1="60" x2="156" y2="60" stroke-width="1" style="stroke:var(--border-strong)"/><polyline points="${pts.join(" ")}" fill="none" stroke-width="3" stroke-linejoin="round" style="stroke:var(--accent)"/>`, "line"));
const parts = ["billing", "county", "police", "fire"].map((k) => set.value(`burnley.bandd.${k}`).value);
const tot = set.value("burnley.bandd.total").value;
let x = 4;
write("thumb-stack.svg", thumb(parts.map((v, i) => {
  const w = (v / tot) * 152, r = `<rect x="${x.toFixed(2)}" y="22" width="${Math.max(0, w - 2).toFixed(2)}" height="20" style="fill:var(--series-${i + 1})"/>`;
  x += w;
  return r;
}).join(""), "stack"));
const eng = set.value("england.area_bandd.2026").value, bur = set.value("burnley.area_bandd.2026").value;
const sx = (v) => 4 + (v / 3000) * 152;
write("thumb-strip.svg", thumb(`<rect x="4" y="30" width="152" height="4" rx="2" style="fill:var(--border-strong)"/><rect x="${sx(eng) - 1.5}" y="16" width="3" height="32" style="fill:var(--series-neutral)"/><rect x="${sx(bur) - 2}" y="12" width="4" height="40" style="fill:var(--accent)"/>`, "strip"));

writeFileSync(join(out, "numbers.json"), JSON.stringify({
  kit: VERSION,
  score,
  base,
  shares: Object.fromEntries(names.map((n, i) => [n, +shares[i].toFixed(2)])),
  squares: Object.fromEntries(names.map((n, i) => [n, squaresFor(shares)[i]])),
  guesses: Object.fromEntries(names.map((n, i) => [n, guesses[i]])),
  gaps: Object.fromEntries(names.map((n, i) => [n, +gaps[i].toFixed(1)])),
  captions: { bill: bill.caption, published: pub.caption, guess: yours.caption }
}, null, 2) + "\n");
console.log(`build-mockups: kit ${VERSION}, score ${score}, ${n} guess squares, svg written to ${out}`);

// Assemble the two mockup pages from src/: includes, kit SVG inline (so it follows the
// page theme through the custom properties), and the service rows of the live round.
const placed = [0, 30, 15, 17, 0]; // the first 62 squares of the example guess, in key order
const swatch = (i) => {
  const fill = `var(--series-${(i % 4) + 1})`, hatch = i >= 4;
  return `<svg class="sw" viewBox="0 0 18 18" aria-hidden="true"><rect width="18" height="18" rx="3" style="fill:${fill}"/>${hatch ? `<path d="M4 14L14 4" stroke-width="2.4" stroke-linecap="round" style="stroke:var(--bg-card)"/>` : ""}</svg>`;
};
const rowsHtml = names.map((name, i) => `<li class="service"><span>${swatch(i)}</span><span class="name" id="s${i}">${name}</span><span class="val">${placed[i]}p</span>
              <div class="ctl"><button type="button" aria-label="Less for ${name}">&#8722;</button><input type="range" min="0" max="100" value="${placed[i]}" aria-labelledby="s${i}"><button type="button" aria-label="More for ${name}">+</button></div></li>`).join("\n            ");
for (const page of ["home-hero.html", "game-round.html"]) {
  let html = readFileSync(join(HERE, "src", page), "utf8");
  html = html.replace(/<!--include:([\w.-]+)-->/g, (_, f) => readFileSync(join(HERE, "src", f), "utf8").trim());
  html = html.replace(/<!--svg:([\w.-]+)-->/g, (_, f) => readFileSync(join(out, f), "utf8").trim());
  html = html.replace("<!--services-->", rowsHtml).replace("{{score}}", String(score)).replace("{{caption_published}}", pub.caption);
  writeFileSync(join(HERE, page), html);
}
console.log("build-mockups: wrote home-hero.html and game-round.html");
