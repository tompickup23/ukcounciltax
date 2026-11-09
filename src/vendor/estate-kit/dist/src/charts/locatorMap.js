/**
 * LocatorMap: a place and its neighbours, each shaded by a rate in fixed classes, the
 * place outlined, the values printed on plates. Lifted from the UK Demographics map system
 * (ukdemographics src/lib/map/): the estate ground behind every map in every theme, the
 * sequential ramp, hatched areas with no figure so they never read as the lowest class,
 * the focus outline in the text colour over a ground gap, Mercator fitted to the place
 * with its neighbours cut at the panel edge, plates at each area's pole of inaccessibility
 * placed without collisions (the place first, then the largest), every neighbour without a
 * plate named with its value under the key, and rings rewound for d3-geo's spherical paths.
 *
 * The kit ships no boundaries. A site passes its own features with their licence line,
 * which is printed with the source (ONS boundaries carry an OS Crown copyright notice).
 *
 * Rules from clawd .claude/rules/dataviz.md: rates, never counts; 5 plus or minus 2
 * classes; a quantity ramp is one hue ordered by lightness. Classes are fixed by the
 * caller's breaks, so a colour means the same value on every map that shares them.
 */
import { geoMercator, geoPath } from "d3-geo";
import { tokens } from "../../generated/tokens.js";
import { esc, n2, textWidth } from "./canvas.js";
import { frame } from "./frame.js";
import { tableTwin } from "./table.js";
import { currentFigures, formatValue } from "../figures/figures.js";
const R = tokens.ramp;
const RATE_UNITS = new Set(["percent", "rate", "index", "gbp", "pence"]);
// d3-geo is spherical: exterior rings clockwise in lon/lat, holes anticlockwise
// (ukdemographics src/lib/map/geo.ts, after ukelections src/lib/geoRewind.ts).
function clockwise(ring) {
    let a = 0;
    for (let i = 0; i < ring.length; i++) {
        const [x1, y1] = ring[i], [x2, y2] = ring[(i + 1) % ring.length];
        a += x1 * y2 - x2 * y1;
    }
    return a < 0;
}
const rewindRings = (rings) => rings.map((r, i) => (clockwise(r) === (i === 0) ? r : [...r].reverse()));
function rewind(f) {
    const g = f.geometry;
    return { ...f, geometry: g.type === "Polygon" ? { type: "Polygon", coordinates: rewindRings(g.coordinates) } : { type: "MultiPolygon", coordinates: g.coordinates.map(rewindRings) } };
}
/** The ramp steps for a number of classes, spread across the seven so the ends always show. */
export function rampFor(classes) {
    const all = R.sequential;
    if (classes < 4 || classes > all.length)
        throw new Error(`a map takes 4 to ${all.length} classes, not ${classes}`);
    return Array.from({ length: classes }, (_, i) => all[Math.round((i * (all.length - 1)) / (classes - 1))]);
}
function pole(a, proj, P) {
    const polys = a.geometry.type === "Polygon" ? [a.geometry.coordinates] : a.geometry.coordinates;
    const rings = polys.flat().map((r) => r.map((c) => proj(c)));
    const inside = (x, y) => {
        let c = false;
        for (const r of rings)
            for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
                const [xi, yi] = r[i], [xj, yj] = r[j];
                if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
                    c = !c;
            }
        return c;
    };
    const edge = (x, y) => {
        let m = Math.min(x - P.x, P.x + P.w - x, y - P.y, P.y + P.h - y);
        for (const r of rings)
            for (let i = 0; i < r.length - 1; i++) {
                const [ax, ay] = r[i], [bx, by] = r[i + 1], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
                const t = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)) : 0;
                m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy));
            }
        return m;
    };
    const pts = rings.flat();
    let [x0, x1] = [Math.max(P.x, Math.min(...pts.map((p) => p[0]))), Math.min(P.x + P.w, Math.max(...pts.map((p) => p[0])))];
    let [y0, y1] = [Math.max(P.y, Math.min(...pts.map((p) => p[1]))), Math.min(P.y + P.h, Math.max(...pts.map((p) => p[1])))];
    let best = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, r: 0 };
    if (x1 <= x0 || y1 <= y0)
        return { ...best, inside };
    for (let pass = 0; pass < 4; pass++) {
        const step = Math.max(x1 - x0, y1 - y0) / 36;
        for (let x = x0; x <= x1; x += step)
            for (let y = y0; y <= y1; y += step) {
                if (!inside(x, y))
                    continue;
                const r = edge(x, y);
                if (r > best.r)
                    best = { x, y, r };
            }
        const sp = step * 2;
        [x0, x1, y0, y1] = [best.x - sp, best.x + sp, best.y - sp, best.y + sp];
    }
    return { ...best, inside };
}
export function locatorMap(o) {
    const set = currentFigures(o.set);
    if (!o.boundaryCredit)
        throw new Error("a map needs the boundary licence line in boundaryCredit");
    const areas = o.areas.map(rewind);
    const focus = areas.find((a) => a.properties.code === o.focus);
    if (!focus)
        throw new Error(`${o.focus}: the focus is not among the areas`);
    const breaks = o.breaks;
    if (breaks.some((b, i) => i > 0 && b <= breaks[i - 1]))
        throw new Error("breaks must rise");
    const ramp = rampFor(breaks.length + 1);
    const keys = Object.values(o.values);
    const figs = Object.fromEntries(Object.entries(o.values).map(([code, k]) => [code, set.value(k)]));
    const unit = figs[o.focus]?.unit ?? Object.values(figs)[0]?.unit;
    for (const [code, f] of Object.entries(figs)) {
        if (!RATE_UNITS.has(f.unit))
            throw new Error(`${o.values[code]}: a map shades rates, never counts; this figure is a ${f.unit}`);
        if (f.unit !== unit)
            throw new Error(`${o.values[code]}: every area on one map must share a unit`);
        if (!areas.some((a) => a.properties.code === code))
            throw new Error(`${o.values[code]}: area ${code} is not among the areas`);
    }
    const classOf = (v) => breaks.filter((b) => v >= b).length;
    const caption = `${set.caption(keys)} ${o.boundaryCredit}`;
    const fr = frame({ ...o, set }, caption, 0);
    const { canvas, tpl, bg } = fr;
    const font = tpl.font;
    const fmt = (v) => formatValue(v, unit ?? "rate", Number.isInteger(v) ? 0 : 1);
    const labels = ramp.map((_, i) => (i === 0 ? `under ${fmt(breaks[0])}` : i === ramp.length - 1 ? `${fmt(breaks[i - 1])} and over` : `${fmt(breaks[i - 1])} to under ${fmt(breaks[i])}`));
    const hasNa = areas.some((a) => !figs[a.properties.code]);
    const keyRows = ramp.length + (hasNa ? 1 : 0) + 1;
    // The key goes beside the map on a wide card and below it otherwise, in two columns on
    // a portrait card. Its rows are compact: a swatch and its range.
    const beside = tpl.card && tpl.keyBeside;
    const rowH = font.label * 1.35, sw = font.label * 0.85;
    const keyCols = tpl.card ? 2 : 1;
    const keyH = font.axis + 10 + Math.ceil(keyRows / keyCols) * rowH;
    const keyW = beside ? Math.min(460, fr.plot.w * 0.42) : 0;
    // Room under the key for the neighbours that get no plate: a line or two of names.
    const restH = font.label * 1.3 * 2 + 12;
    const P = {
        x: fr.plot.x, y: fr.plot.y,
        w: fr.plot.w - (keyW ? keyW + 24 : 0),
        h: tpl.H ? fr.plot.h - (beside ? 0 : keyH + 20 + restH) : Math.round(fr.plot.w * 0.8)
    };
    // The map panel: always the estate ground, as UKD draws every map. The projection fits the
    // place itself with a margin, as UKD's focus frames do, so a large neighbour cannot shrink
    // it to a corner; neighbours run to the panel edge and are cut there.
    canvas.rect(P.x, P.y, P.w, P.h, R.ground, `rx="${tokens.radius["radius-sm"].replace("px", "")}"`);
    // All the areas fill the panel, unless that leaves the place under a third of it either
    // way; then the projection fits the place with UKD's margins and the neighbours are cut.
    const pad = Math.max(12, P.w * 0.03);
    let proj = geoMercator().fitExtent([[P.x + pad, P.y + pad], [P.x + P.w - pad, P.y + P.h - pad]], { type: "FeatureCollection", features: areas });
    const [[fx0, fy0], [fx1, fy1]] = geoPath(proj).bounds(focus);
    if ((fx1 - fx0) / P.w < 1 / 3 && (fy1 - fy0) / P.h < 1 / 3) {
        const inset = tpl.key === "inline" ? [0.2, 0.17] : [0.26, 0.2];
        proj = geoMercator().fitExtent([[P.x + P.w * inset[0], P.y + P.h * inset[1]], [P.x + P.w * (1 - inset[0]), P.y + P.h * (1 - inset[1])]], focus);
    }
    const path = geoPath(proj);
    const clipId = `ek-clip-${esc(o.focus)}-${tpl.key}`;
    canvas.mark("focus outline", R.ink, [R.ground]);
    canvas.add(`<defs><pattern id="ek-na-${esc(o.focus)}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${R.na}"/><rect width="2.5" height="8" fill="${R.naStripe}"/></pattern><clipPath id="${clipId}"><rect x="${n2(P.x)}" y="${n2(P.y)}" width="${n2(P.w)}" height="${n2(P.h)}" rx="${tokens.radius["radius-sm"].replace("px", "")}"/></clipPath></defs>`);
    canvas.add(`<g class="ek-map" clip-path="url(#${clipId})">`);
    for (const a of areas) {
        const code = a.properties.code;
        const f = figs[code];
        const fill = f ? ramp[classOf(f.value)] : `url(#ek-na-${esc(o.focus)})`;
        const d = path(a) ?? "";
        canvas.add(`<path d="${d}" fill="${fill}" stroke="${R.ground}" stroke-width="2" stroke-linejoin="round" data-ek-area="${esc(code)}"${f ? ` data-ek-class="${classOf(f.value)}"` : ' data-ek-na=""'}><title>${esc(`${a.properties.name}: ${f ? set.show(o.values[code]) : "no figure"}`)}</title></path>`);
    }
    const fd = path(focus) ?? "";
    canvas.add(`<path d="${fd}" fill="none" stroke="${R.ground}" stroke-width="7" stroke-linejoin="round"/><path d="${fd}" fill="none" stroke="${R.ink}" stroke-width="3.5" stroke-linejoin="round" data-ek-focus=""/>`);
    canvas.add(`</g>`);
    // Plates, after UKD layout.ts: each centres on its area's pole of inaccessibility (the
    // point inside the area, and inside the panel, furthest from any edge). The place goes
    // first and always gets its plate; then the neighbours, largest first, each where it
    // fits without touching another plate or the panel edge. A neighbour that fits nowhere
    // is named with its value under the key, so every area on the map is labelled.
    const valueOf = (code) => (figs[code] ? set.show(o.values[code]) : "no figure");
    const cands = areas.map((a) => {
        const code = a.properties.code, isFocus = code === o.focus;
        const ns = isFocus ? font.label : font.axis, vs = isFocus ? font.value : font.label;
        const nameFamily = isFocus ? "display" : "sans";
        const pad = Math.round(ns * 0.4);
        const w = Math.max(textWidth(a.properties.name, ns, nameFamily, 600), textWidth(valueOf(code), vs, "sans", 600)) + 2 * pad;
        const h = ns + vs + pad * 2 + 4;
        return { a, code, isFocus, ns, vs, nameFamily, pad, w, h, pole: pole(a, proj, P) };
    });
    cands.sort((p, q) => Number(q.isFocus) - Number(p.isFocus) || q.pole.r - p.pole.r);
    const placed = [];
    const gap = 6;
    const clash = (x, y, w, h) => placed.some((q) => x < q.x + q.w + gap && x + w + gap > q.x && y < q.y + q.h + gap && y + h + gap > q.y);
    const outside = (x, y, w, h) => x < P.x + 6 || y < P.y + 6 || x + w > P.x + P.w - 6 || y + h > P.y + P.h - 6;
    const unplaced = [];
    for (const c of cands) {
        let pos = null;
        if (c.isFocus || c.pole.r >= Math.min(c.w, c.h) * 0.3) {
            const tries = [[0, 0]];
            for (const rad of [0.35, 0.7, 1.0, 1.4])
                for (let i = 0; i < 12; i++)
                    tries.push([Math.cos((i * Math.PI) / 6) * c.pole.r * rad, Math.sin((i * Math.PI) / 6) * c.pole.r * rad]);
            for (const [dx, dy] of tries) {
                const x = c.pole.x + dx - c.w / 2, y = c.pole.y + dy - c.h / 2;
                // A plate may cross a boundary, never leave its own area: its centre stays inside.
                if (!clash(x, y, c.w, c.h) && !outside(x, y, c.w, c.h) && c.pole.inside(x + c.w / 2, y + c.h / 2)) {
                    pos = [x, y];
                    break;
                }
            }
        }
        if (!pos && c.isFocus)
            pos = [Math.min(Math.max(c.pole.x - c.w / 2, P.x + 6), P.x + P.w - c.w - 6), Math.min(Math.max(c.pole.y - c.h / 2, P.y + 6), P.y + P.h - c.h - 6)];
        if (!pos) {
            unplaced.push(c.code);
            continue;
        }
        const [x, y] = pos;
        placed.push({ x, y, w: c.w, h: c.h });
        canvas.add(`<rect x="${n2(x)}" y="${n2(y)}" width="${n2(c.w)}" height="${n2(c.h)}" rx="4" fill="${R.ground}" fill-opacity="0.92"${c.isFocus ? ` stroke="${R.ink}" stroke-width="1.5"` : ""} data-ek-plate="${esc(c.code)}"/>`);
        canvas.text(x + c.pad, y + c.pad + c.ns * 0.85, c.a.properties.name, { size: c.ns, weight: 600, family: c.nameFamily, fill: R.ink, bg: R.ground });
        canvas.text(x + c.pad, y + c.pad + 4 + c.ns + c.vs * 0.85, valueOf(c.code), { size: c.vs, weight: 600, fill: c.isFocus ? R.ink : R.muted, bg: R.ground, tabular: true });
    }
    // The key: one swatch per class with its range, then no figure, then the place.
    const keyX0 = beside ? P.x + P.w + 24 : P.x;
    const keyY0 = beside ? P.y : P.y + P.h + 20;
    const colW = (beside ? keyW : fr.plot.w) / keyCols;
    // Swatches carry a thin edge, so the darkest class still shows as a square on a dark page.
    const edge = ` ${canvas.paint({ stroke: "border-strong" })} stroke-width="1"`;
    const firstFig = figs[o.focus] ?? Object.values(figs)[0];
    canvas.text(keyX0, keyY0 + font.axis, (firstFig?.name ?? firstFig?.label ?? "").trim(), { size: font.axis, weight: 600, fill: "text-muted", bg });
    const rowsIn = [
        ...[...ramp].reverse().map((c, i) => [c, labels[ramp.length - 1 - i], edge]),
        ...(hasNa ? [[`url(#ek-na-${esc(o.focus)})`, "No figure", edge]] : []),
        ["none", focus.properties.name, ` ${canvas.paint({ stroke: "text" })} stroke-width="2.5"`]
    ];
    const perCol = Math.ceil(rowsIn.length / keyCols);
    rowsIn.forEach(([fill, text, stroke], i) => {
        const kx = keyX0 + Math.floor(i / perCol) * colW, ky = keyY0 + font.axis + 10 + (i % perCol) * rowH;
        canvas.add(`<rect x="${n2(kx)}" y="${n2(ky + (rowH - sw) / 2)}" width="${n2(sw)}" height="${n2(sw)}" rx="2" fill="${fill}"${stroke}/>`);
        canvas.text(kx + sw + 10, ky + rowH / 2, text, { size: font.label, fill: "text", bg, baseline: "middle" });
    });
    let ky = keyY0 + keyH;
    // Neighbours with no plate, by name and value, so none is left unnamed.
    const rest = unplaced.map((c) => areas.find((a) => a.properties.code === c)).sort((p, q) => p.properties.name.localeCompare(q.properties.name));
    if (rest.length) {
        const line = `Not labelled on the map: ${rest.map((a) => `${a.properties.name} ${figs[a.properties.code] ? valueOf(a.properties.code) : "(no figure)"}`).join(", ")}.`;
        ky = canvas.para(keyX0, ky + 6, line, beside ? keyW : fr.plot.w, { size: font.label, fill: "text-muted", bg, lineHeight: 1.3, cls: "ek-unlabelled" });
    }
    if (tpl.H && ky > fr.plot.y + fr.plot.h + 4)
        throw new Error(`${o.focus}/${tpl.key}: the key and the unlabelled neighbours run past the map's space`);
    fr.close(Math.max(P.y + P.h, ky));
    const fv = figs[o.focus];
    const alt = o.alt ?? `Map of ${focus.properties.name} and ${areas.length - 1} neighbouring areas, shaded by ${(fv?.label ?? "the figure").toLowerCase()} in ${ramp.length} classes. ${focus.properties.name}: ${fv ? set.show(o.values[o.focus]) : "no figure"}.${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`LocatorMap ${o.focus} ${tpl.key}`, alt);
    const rows = areas
        .map((a) => ({ a, f: figs[a.properties.code] }))
        .sort((p, q) => (q.f?.value ?? -Infinity) - (p.f?.value ?? -Infinity))
        .map(({ a, f }) => [a.properties.name + (a.properties.code === o.focus ? " (this place)" : ""), f ? set.show(o.values[a.properties.code]) : "no figure"]);
    const table = tableTwin({ caption: fr.title ?? (fv?.label ?? "Map"), head: ["Area", fv?.name ?? "Figure"], rows, source: caption });
    return { svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
