/**
 * ZeroBar: bars from zero for one series figure. Lifted from UK Councils and UK Council
 * Tax HistoryBars.astro: one contrast checked hue, the baseline at zero and unbroken, the
 * data end rounded and the baseline end square, direct labels, a native title per bar so
 * hover needs no script, and the table twin underneath.
 *
 * There is no option to move the baseline. A bar chart with a non zero baseline does not
 * ship (clawd .claude/rules/dataviz.md, hard stops), so the kit cannot draw one. Negative
 * values are refused in this first version rather than drawn wrongly.
 */
import { esc, n2, textWidth } from "./canvas.js";
import { frame } from "./frame.js";
import { tableTwin } from "./table.js";
import { currentFigures, showPoint } from "../figures/figures.js";
export function zeroBar(o) {
    const orientation = o.orientation ?? "vertical";
    const set = currentFigures(o.set);
    const f = set.series(o.figure);
    if (f.points.some((p) => p.value < 0))
        throw new Error(`${o.figure}: ZeroBar draws values from zero and does not yet draw negatives`);
    const caption = set.caption(o.figure);
    const n = f.points.length;
    const fr = frame({ ...o, set }, caption, 0);
    const { canvas, tpl, bg } = fr;
    const font = tpl.font;
    // No gridlines, so the longest bar may run the full length: the domain is zero to the
    // data maximum, as in HistoryBars. The baseline is what must not move.
    const max = Math.max(...f.points.map((p) => p.value)) || 1;
    const colourFor = (label) => (o.highlight && o.highlight !== label ? "series-neutral" : "accent");
    const colours = [...new Set(f.points.map((p) => colourFor(p.label)))];
    for (const c of colours)
        canvas.mark(`bar ${c}`, c, [bg]);
    const r = 4;
    let plotBottom;
    if (orientation === "vertical") {
        const plotH = tpl.H ? fr.plot.h : tpl.plotH;
        const P = { x: fr.plot.x, y: fr.plot.y, w: fr.plot.w, h: plotH };
        const top = P.y + font.value + 14;
        const base = P.y + plotH - font.axis - 14;
        const innerH = base - top;
        const step = P.w / n;
        const gap = Math.max(2, step * 0.12);
        const barW = step - gap;
        const showAll = n <= 6;
        canvas.add(`<g class="ek-bars">`);
        f.points.forEach((p, i) => {
            const h = (p.value / max) * innerH;
            const x = P.x + i * step + gap / 2;
            const y = base - h;
            const rr = Math.min(r, barW / 2, h);
            const d = h > 0
                ? `M${n2(x)},${n2(base)} V${n2(y + rr)} Q${n2(x)},${n2(y)} ${n2(x + rr)},${n2(y)} H${n2(x + barW - rr)} Q${n2(x + barW)},${n2(y)} ${n2(x + barW)},${n2(y + rr)} V${n2(base)} Z`
                : "";
            const shown = showPoint(f, p);
            canvas.add(`<g class="ek-bar"><title>${esc(`${p.label}: ${shown}`)}</title><path d="${d}" ${canvas.paint({ fill: colourFor(p.label) })} data-ek-bar="" data-value="${p.value}" data-base="${n2(base)}" data-end="${n2(y)}"/>`);
            const labelled = showAll || i === 0 || i === n - 1 || p.label === o.highlight;
            if (labelled) {
                canvas.text(x + barW / 2, y - 10, shown, { size: font.value, weight: 600, fill: "text", bg, anchor: "middle", tabular: true });
                canvas.text(x + barW / 2, base + font.axis + 8, p.label, { size: font.axis, fill: "text-muted", bg, anchor: "middle" });
            }
            canvas.add(`</g>`);
        });
        canvas.add(`</g>`);
        canvas.line(P.x, base, P.x + P.w, base, "border-strong", 1.5, `data-ek-baseline="${n2(base)}" data-ek-zero="${n2(base)}"`);
        plotBottom = P.y + plotH;
    }
    else {
        const labelW = Math.max(...f.points.map((p) => textWidth(p.label, font.label))) + 14;
        const valueW = Math.max(...f.points.map((p) => textWidth(showPoint(f, p), font.value, "sans", 600))) + 12;
        const rowH = Math.max(font.value * 1.7, 36);
        const P = { x: fr.plot.x, y: fr.plot.y, w: fr.plot.w, h: tpl.H ? fr.plot.h : rowH * n };
        const step = P.h / n;
        const barH = Math.min(step * 0.62, font.value * 1.25);
        const base = P.x + labelW;
        const innerW = P.w - labelW - valueW;
        canvas.add(`<g class="ek-bars">`);
        f.points.forEach((p, i) => {
            const w = (p.value / max) * innerW;
            const y = P.y + i * step + (step - barH) / 2;
            const rr = Math.min(r, barH / 2, w);
            const d = w > 0
                ? `M${n2(base)},${n2(y)} H${n2(base + w - rr)} Q${n2(base + w)},${n2(y)} ${n2(base + w)},${n2(y + rr)} V${n2(y + barH - rr)} Q${n2(base + w)},${n2(y + barH)} ${n2(base + w - rr)},${n2(y + barH)} H${n2(base)} Z`
                : "";
            const shown = showPoint(f, p);
            canvas.add(`<g class="ek-bar"><title>${esc(`${p.label}: ${shown}`)}</title><path d="${d}" ${canvas.paint({ fill: colourFor(p.label) })} data-ek-bar="" data-value="${p.value}" data-base="${n2(base)}" data-end="${n2(base + w)}"/>`);
            canvas.text(base - 10, y + barH / 2, p.label, { size: font.label, fill: "text", bg, anchor: "end", baseline: "middle" });
            canvas.text(base + w + 8, y + barH / 2, shown, { size: font.value, weight: 600, fill: "text", bg, baseline: "middle", tabular: true });
            canvas.add(`</g>`);
        });
        canvas.add(`</g>`);
        canvas.line(base, P.y, base, P.y + P.h, "border-strong", 1.5, `data-ek-baseline="${n2(base)}" data-ek-zero="${n2(base)}"`);
        plotBottom = P.y + P.h;
    }
    fr.close(plotBottom);
    const first = f.points[0], last = f.points[n - 1];
    const alt = o.alt ?? `Bar chart from zero of ${f.label.toLowerCase()}, ${n} bars from ${first.label} (${showPoint(f, first)}) to ${last.label} (${showPoint(f, last)}).${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`ZeroBar ${o.figure} ${tpl.key}`, alt);
    const table = tableTwin({ caption: fr.title ?? f.label, head: ["", f.name ?? f.label], rows: f.points.map((p) => [p.label, showPoint(f, p)]), source: caption });
    return { svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
