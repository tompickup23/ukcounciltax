/**
 * ZeroBar: bars from zero for one series figure. Lifted from UK Councils and UK Council
 * Tax HistoryBars.astro: one contrast checked hue, the baseline at zero and unbroken, the
 * data end rounded and the baseline end square, direct labels, a native title per bar so
 * hover needs no script, and the table twin underneath.
 *
 * There is no option to move the baseline. A bar chart with a non zero baseline does not
 * ship (clawd .claude/rules/dataviz.md, hard stops), so the kit cannot draw one.
 *
 * Diverging (kit 0.3.0, for the UK Council Tax budget game's gap bars, A6 section 4):
 * `diverging: true` draws values either side of zero, the zero line inside the plot and
 * every bar measured from it, so a gap of minus five is as long as a gap of five. Above
 * zero takes the first series and below it the second, and the sign is always in the
 * printed value, so colour never carries it alone. Without the flag a negative still
 * throws, so a chart meant to be all positive cannot quietly turn into a diverging one.
 */
import { esc, n2, textWidth, wrap } from "./canvas.js";
import { frame } from "./frame.js";
import { tableTwin } from "./table.js";
import { currentFigures, showPoint } from "../figures/figures.js";
export function zeroBar(o) {
    const orientation = o.orientation ?? "vertical";
    const set = currentFigures(o.set);
    const f = set.series(o.figure);
    const hasNeg = f.points.some((p) => p.value < 0);
    if (hasNeg && !o.diverging)
        throw new Error(`${o.figure}: ZeroBar draws negatives only as a diverging chart; pass diverging: true for values either side of zero`);
    if (o.highlight !== undefined && !f.points.some((p) => p.label === o.highlight))
        throw new Error(`${o.figure}: the highlight "${o.highlight}" is not one of the points`);
    const caption = set.caption(o.figure);
    const n = f.points.length;
    const fr = frame({ ...o, set }, caption, 0, "zeroBar");
    const { canvas, tpl, bg } = fr;
    const thumb = !!tpl.thumb;
    const font = tpl.font;
    // No gridlines, so the longest bar may run the full length: the domain is zero to the
    // data extremes, as in HistoryBars. The baseline is what must not move.
    const lo = Math.min(0, ...f.points.map((p) => p.value));
    const hi = Math.max(0, ...f.points.map((p) => p.value));
    const span = hi - lo || 1;
    const colourFor = (p) => o.highlight ? (o.highlight === p.label ? "accent" : "series-neutral")
        : o.diverging ? (p.value < 0 ? "series-2" : "series-1")
            : "accent";
    const focusAttr = (label) => (label === o.highlight ? ` data-ek-focus="${esc(label)}"` : "");
    const colours = [...new Set(f.points.map(colourFor))];
    for (const c of colours)
        canvas.mark(`bar ${c}`, c, [bg]);
    if (o.diverging && !o.highlight)
        canvas.series("ZeroBar either side of zero", colours);
    const shown = f.points.map((p) => showPoint(f, p));
    canvas.allow(...shown);
    const r = 4;
    let plotBottom;
    let zero;
    if (orientation === "vertical") {
        const plotH = tpl.H ? fr.plot.h : tpl.plotH;
        const P = { x: fr.plot.x, y: fr.plot.y, w: fr.plot.w, h: plotH };
        // Room for a value label above the highest bar and, when there are negatives, below
        // the lowest; the category labels sit along the foot of the plot.
        const step = P.w / n;
        const gap = Math.max(2, step * 0.12);
        const barW = step - gap;
        const showAll = n <= 6;
        // Category labels wrap to their bar's width, so long service names stack rather than
        // collide; a one line label sits where it always has.
        const lh = font.axis * 1.15;
        const catLines = f.points.map((p) => wrap(p.label, step - 6, font.axis));
        const maxLines = thumb ? 1 : Math.max(...catLines.map((l) => l.length));
        const top = thumb ? P.y : P.y + (hi > 0 ? font.value + 14 : 6);
        const bottom = thumb ? P.y + plotH : P.y + plotH - font.axis - 14 - (maxLines - 1) * lh - (lo < 0 ? font.value + 14 : 0);
        const innerH = bottom - top;
        zero = top + (hi / span) * innerH;
        const catY = P.y + plotH - 6 - (maxLines - 1) * lh;
        canvas.add(`<g class="ek-bars">`);
        f.points.forEach((p, i) => {
            const h = (Math.abs(p.value) / span) * innerH;
            const x = P.x + i * step + gap / 2;
            const up = p.value >= 0;
            const end = up ? zero - h : zero + h;
            const rr = Math.min(r, barW / 2, h);
            // The data end rounded, the zero end square.
            const d = h > 0
                ? up
                    ? `M${n2(x)},${n2(zero)} V${n2(end + rr)} Q${n2(x)},${n2(end)} ${n2(x + rr)},${n2(end)} H${n2(x + barW - rr)} Q${n2(x + barW)},${n2(end)} ${n2(x + barW)},${n2(end + rr)} V${n2(zero)} Z`
                    : `M${n2(x)},${n2(zero)} V${n2(end - rr)} Q${n2(x)},${n2(end)} ${n2(x + rr)},${n2(end)} H${n2(x + barW - rr)} Q${n2(x + barW)},${n2(end)} ${n2(x + barW)},${n2(end - rr)} V${n2(zero)} Z`
                : "";
            canvas.add(`<g class="ek-bar"><title>${esc(`${p.label}: ${shown[i]}`)}</title><path d="${d}" ${canvas.paint({ fill: colourFor(p) })} data-ek-bar="" data-value="${p.value}" data-base="${n2(zero)}" data-end="${n2(end)}"${focusAttr(p.label)}/>`);
            const labelled = showAll || i === 0 || i === n - 1 || p.label === o.highlight;
            if (labelled) {
                canvas.text(x + barW / 2, up ? end - 10 : end + font.value + 4, shown[i], { size: font.value, weight: 600, fill: "text", bg, anchor: "middle", tabular: true, role: "value" });
                catLines[i].forEach((l, j) => canvas.text(x + barW / 2, catY + j * lh, l, { size: font.axis, fill: "text-muted", bg, anchor: "middle", group: `cat-${i}` }));
            }
            canvas.add(`</g>`);
        });
        canvas.add(`</g>`);
        canvas.line(P.x, zero, P.x + P.w, zero, "border-strong", 1.5, `data-ek-baseline="${n2(zero)}" data-ek-zero="${n2(zero)}"`);
        plotBottom = P.y + plotH;
    }
    else {
        const valueW = (pts) => (thumb || !pts.length ? 0 : Math.max(...pts.map((i) => textWidth(shown[i], font.value, "sans", 600))) + 12);
        const idx = f.points.map((_, i) => i);
        const labelW = thumb ? 0 : Math.max(...f.points.map((p) => textWidth(p.label, font.label))) + 14;
        const negW = valueW(idx.filter((i) => f.points[i].value < 0));
        const posW = valueW(idx.filter((i) => f.points[i].value >= 0));
        const rowH = Math.max(font.value * 1.7, 36);
        const P = { x: fr.plot.x, y: fr.plot.y, w: fr.plot.w, h: tpl.H ? fr.plot.h : rowH * n };
        const step = P.h / n;
        const barH = Math.min(step * 0.62, font.value * 1.25);
        // The category labels take the left column; negative values print left of their bars,
        // positive values right of theirs, so each side keeps its own label room.
        const x0 = P.x + labelW + negW;
        const innerW = P.w - labelW - negW - posW;
        zero = x0 + (-lo / span) * innerW;
        canvas.add(`<g class="ek-bars">`);
        f.points.forEach((p, i) => {
            const w = (Math.abs(p.value) / span) * innerW;
            const y = P.y + i * step + (step - barH) / 2;
            const right = p.value >= 0;
            const end = right ? zero + w : zero - w;
            const rr = Math.min(r, barH / 2, w);
            const d = w > 0
                ? right
                    ? `M${n2(zero)},${n2(y)} H${n2(end - rr)} Q${n2(end)},${n2(y)} ${n2(end)},${n2(y + rr)} V${n2(y + barH - rr)} Q${n2(end)},${n2(y + barH)} ${n2(end - rr)},${n2(y + barH)} H${n2(zero)} Z`
                    : `M${n2(zero)},${n2(y)} H${n2(end + rr)} Q${n2(end)},${n2(y)} ${n2(end)},${n2(y + rr)} V${n2(y + barH - rr)} Q${n2(end)},${n2(y + barH)} ${n2(end + rr)},${n2(y + barH)} H${n2(zero)} Z`
                : "";
            canvas.add(`<g class="ek-bar"><title>${esc(`${p.label}: ${shown[i]}`)}</title><path d="${d}" ${canvas.paint({ fill: colourFor(p) })} data-ek-bar="" data-value="${p.value}" data-base="${n2(zero)}" data-end="${n2(end)}"${focusAttr(p.label)}/>`);
            canvas.text(P.x + labelW - 10, y + barH / 2, p.label, { size: font.label, fill: "text", bg, anchor: "end", baseline: "middle" });
            canvas.text(right ? end + 8 : end - 8, y + barH / 2, shown[i], { size: font.value, weight: 600, fill: "text", bg, baseline: "middle", tabular: true, anchor: right ? "start" : "end", role: "value" });
            canvas.add(`</g>`);
        });
        canvas.add(`</g>`);
        canvas.line(zero, P.y, zero, P.y + P.h, "border-strong", 1.5, `data-ek-baseline="${n2(zero)}" data-ek-zero="${n2(zero)}"`);
        plotBottom = P.y + P.h;
    }
    fr.close(plotBottom);
    if (thumb)
        return { svg: canvas.finish(`ZeroBar ${o.figure} thumb`, ""), table: "", alt: "", caption, width: canvas.W, height: canvas.H };
    const first = f.points[0], last = f.points[n - 1];
    const kind = hasNeg ? "Bar chart either side of zero" : "Bar chart from zero";
    const alt = o.alt ?? `${kind} of ${f.label.toLowerCase()}, ${n} bars from ${first.label} (${showPoint(f, first)}) to ${last.label} (${showPoint(f, last)}).${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`ZeroBar ${o.figure} ${tpl.key}`, alt);
    const table = tableTwin({ caption: fr.title ?? f.label, head: ["", f.name ?? f.label], rows: f.points.map((p, i) => [p.label, shown[i]]), source: caption });
    return { svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
