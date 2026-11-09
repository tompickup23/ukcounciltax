/**
 * Waffle: a hundred squares for a part to whole split. Lifted from Asylum Stats
 * ProportionGrid.astro, whose header gives the reason: a hundred squares can be counted,
 * so a reader who distrusts the number can check it by eye, with no axis and no numeracy.
 * Drawn as SVG here rather than CSS grid, so the same drawing goes onto a card and into a
 * film unchanged.
 *
 * Two forms. `figure` fills squares for one percentage, the rest drawn empty. `parts`
 * splits the hundred between two to twelve value figures in one unit (a budget by service,
 * a bill by body), each taking its share of the squares by largest remainder, so the
 * squares always number exactly one hundred. The shares are each part over the sum of the
 * parts, and the key prints them beside the published amounts.
 *
 * Two sizes. `standard` puts the key beside the grid inline and on wide cards. `small` is
 * the phone size from the UK Council Tax budget game: the grid takes the full width of the
 * drawing and the key goes below it, so in a 343 px phone column (375 less two 16 px
 * gutters) each square draws at about 32 px, big enough to count and to tap beside.
 *
 * Identity is never carried by colour alone: the key names every part with its share in
 * text, and past the four series the parts take the same four again with a diagonal
 * stroke, then with a cross, so no two parts look alike in greyscale either.
 */
import { esc, n2 } from "./canvas.js";
import { frame } from "./frame.js";
import { tableTwin } from "./table.js";
import { currentFigures, formatValue } from "../figures/figures.js";
const SERIES = ["series-1", "series-2", "series-3", "series-4"];
/**
 * The order parts take their paint: the four series solid, then with one diagonal stroke,
 * then with a cross. The neutrals are not used: they sit under 0.09 from a series under
 * colour vision, so a fifth hue would break the series gate.
 */
export const WAFFLE_PAINTS = ["none", "diagonal", "cross"].flatMap((hatch) => SERIES.map((fill) => ({ fill, hatch })));
const MAX_PARTS = WAFFLE_PAINTS.length;
/**
 * Whole squares for each share, adding to exactly 100: floors first, then the largest
 * remainders, ties to the earlier part. The shares are percentages of one whole, so they
 * must be finite, not negative, and add to 100 within half a square (the same tolerance
 * Waffle allows percentage parts); anything else throws rather than returning a grid of
 * more or fewer than a hundred squares. Within that tolerance the result always adds to
 * exactly 100. A client drawing a part filled grid (a player's answers mid round)
 * normalises its values to shares first, or leaves the rest as empty squares itself.
 */
export function squaresFor(shares) {
    if (!Array.isArray(shares) || shares.length === 0)
        throw new Error("squaresFor needs at least one share");
    for (const [i, s] of shares.entries()) {
        if (typeof s !== "number" || !Number.isFinite(s))
            throw new Error(`squaresFor: share ${i} is not a finite number`);
        if (s < 0)
            throw new Error(`squaresFor: share ${i} is negative (${s})`);
    }
    const total = shares.reduce((a, b) => a + b, 0);
    if (Math.abs(total - 100) > 0.5)
        throw new Error(`squaresFor: the shares add up to ${total}, not 100; normalise them to percentages of one whole first`);
    const floors = shares.map((s) => Math.floor(s));
    let left = 100 - floors.reduce((a, b) => a + b, 0);
    const order = shares.map((s, i) => ({ i, r: s - Math.floor(s) })).sort((a, b) => b.r - a.r || a.i - b.i);
    for (const { i } of order) {
        if (left <= 0)
            break;
        floors[i]++;
        left--;
    }
    return floors;
}
export function waffle(o) {
    const set = currentFigures(o.set);
    if (!!o.figure === !!o.parts)
        throw new Error("Waffle takes either figure (one percentage) or parts (a split), not both and not neither");
    let runs;
    let keys;
    let headline;
    let tableRows;
    let tableHead;
    let altBody;
    let rounding = "";
    if (o.figure) {
        const f = set.value(o.figure);
        if (f.unit !== "percent")
            throw new Error(`${o.figure}: Waffle draws a percentage, and this figure is in ${f.unit}`);
        if (f.value < 0 || f.value > 100)
            throw new Error(`${o.figure}: a share must lie between 0 and 100`);
        const on = Math.round(f.value);
        const filledLabel = o.filledLabel ?? f.name ?? f.label;
        headline = set.show(o.figure);
        runs = [
            { key: o.figure, label: filledLabel, squares: on, paint: { fill: "accent", hatch: "none" } },
            { label: o.emptyLabel ?? "The rest", squares: 100 - on, paint: null }
        ];
        keys = [o.figure];
        tableHead = ["", "Share"];
        tableRows = [[filledLabel, headline]];
        altBody = `A grid of 100 squares with ${on} filled: ${filledLabel.toLowerCase()} is ${headline}.`;
        if (on !== f.value)
            rounding = ` The share is rounded to ${on} squares.`;
    }
    else {
        const ps = o.parts;
        if (ps.length < 2 || ps.length > MAX_PARTS)
            throw new Error(`Waffle splits between 2 and ${MAX_PARTS} parts; ${ps.length} given`);
        const figs = ps.map((k) => set.value(k));
        const unit = figs[0].unit;
        for (const [i, f] of figs.entries()) {
            if (f.unit !== unit)
                throw new Error(`${ps[i]}: every part must be in one unit (${unit}), and this is ${f.unit}`);
            if (f.value < 0)
                throw new Error(`${ps[i]}: a part of a whole cannot be negative`);
        }
        const sum = figs.reduce((s, f) => s + f.value, 0);
        if (sum <= 0)
            throw new Error("Waffle parts add up to nothing");
        if (unit === "percent" && Math.abs(sum - 100) > 0.5)
            throw new Error(`percentage parts add up to ${sum}, not 100`);
        const shares = figs.map((f) => (f.value / sum) * 100);
        const squares = squaresFor(shares);
        runs = figs.map((f, i) => ({
            key: ps[i], label: f.name ?? f.label, squares: squares[i], paint: WAFFLE_PAINTS[i],
            shown: set.show(ps[i]), share: formatValue(shares[i], "percent", 1)
        }));
        keys = [...ps];
        tableHead = ["", "Amount", "Share", "Squares"];
        tableRows = runs.map((r) => [r.label, r.shown, r.share, String(r.squares)]);
        altBody = `A grid of 100 squares split between ${runs.length} parts: ${runs.map((r) => `${r.label} ${r.squares}`).join(", ")}.`;
        const unseen = runs.filter((r) => r.squares === 0);
        if (unseen.length)
            rounding = ` ${unseen.map((r) => r.label).join(", ")} ${unseen.length === 1 ? "is" : "are"} under half a square and not drawn.`;
    }
    const caption = set.caption(keys);
    const fr = frame({ ...o, set }, caption, 0);
    const { canvas, tpl, bg } = fr;
    const small = o.size === "small";
    // The small size is read on a phone at about 0.57 of its drawn size, so its key takes the
    // value size (about 15 px there) and its note the label size, not the inline 11 px.
    const font = small && !tpl.card ? { ...tpl.font, label: tpl.font.value, axis: tpl.font.label } : tpl.font;
    // Where the key goes: beside the grid on wide cards and for a single figure inline, below
    // it for the small size and on a portrait card, where the grid takes the width the key
    // leaves.
    // A split's key has an amount and a share per row, so inline it always goes below.
    const below = small || (tpl.card && !tpl.keyBeside) || (!!o.parts && !tpl.card);
    const share = headline ? font.stat * (below ? 0.5 : 0.8) : 0;
    const keyRows = runs.length + 2;
    const keyNeed = (share ? share + 18 : 0) + keyRows * font.label * 1.4 + 20 + font.axis + 40;
    const side = small && !tpl.H
        ? fr.plot.w
        : below
            ? (tpl.H ? Math.min(fr.plot.w, fr.plot.h - keyNeed) : Math.min(300, fr.plot.w))
            : tpl.H ? Math.min(fr.plot.h, fr.plot.w * 0.5) : Math.min(300, fr.plot.w * 0.5);
    const gap = Math.max(2, side * (small ? 0.008 : 0.012));
    const cell = (side - gap * 9) / 10;
    const P = { x: fr.plot.x, y: fr.plot.y };
    const used = runs.filter((r) => r.paint).map((r) => r.paint);
    for (const fill of new Set(used.map((p) => p.fill)))
        canvas.mark(`waffle square ${fill}`, fill, [bg, "bg-subtle"]);
    canvas.series("Waffle parts", [...new Set(used.map((p) => p.fill))]);
    // The hatch: strokes of the ground across a square, so a hatched part reads apart from
    // its solid partner in colour and in greyscale.
    const hatch = (x, y, s, kind) => {
        const a = (v) => n2(x + s * v), b = (v) => n2(y + s * v);
        const d = `M${a(0.2)} ${b(0.8)}L${a(0.8)} ${b(0.2)}` + (kind === "cross" ? `M${a(0.2)} ${b(0.2)}L${a(0.8)} ${b(0.8)}` : "");
        return `<path d="${d}" ${canvas.paint({ stroke: bg })} stroke-width="${n2(Math.max(2, s * 0.13))}" stroke-linecap="round" fill="none"/>`;
    };
    const square = (x, y, s, r, attrs = "") => {
        const rx = n2(Math.min(3, s * 0.12));
        if (!r.paint)
            return `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(s)}" height="${n2(s)}" rx="${rx}" ${canvas.paint({ fill: "bg-subtle", stroke: "border" })}${attrs}/>`;
        return `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(s)}" height="${n2(s)}" rx="${rx}" ${canvas.paint({ fill: r.paint.fill })}${attrs}/>` + (r.paint.hatch !== "none" ? hatch(x, y, s, r.paint.hatch) : "");
    };
    const filledTotal = runs.filter((r) => r.paint).reduce((s, r) => s + r.squares, 0);
    canvas.add(`<g class="ek-waffle${small ? " ek-waffle-small" : ""}" data-ek-filled="${filledTotal}" data-ek-size="${small ? "small" : "standard"}">`);
    let i = 0;
    for (const r of runs) {
        if (r.key && o.parts)
            canvas.add(`<g data-ek-part="${esc(r.key)}" data-ek-squares="${r.squares}"><title>${esc(`${r.label}: ${r.shown}, ${r.share}, ${r.squares} squares`)}</title>`);
        for (let n = 0; n < r.squares; n++, i++) {
            const x = P.x + (i % 10) * (cell + gap), y = P.y + Math.floor(i / 10) * (cell + gap);
            canvas.add(square(x, y, cell, r, r.paint ? ' data-ek-on=""' : ""));
        }
        if (r.key && o.parts)
            canvas.add(`</g>`);
    }
    canvas.add(`</g>`);
    // The share (single figure) and the key.
    const kx = below ? P.x : P.x + side + Math.max(24, tpl.W * 0.04);
    const kw = below ? fr.plot.w : fr.plot.w - side - (kx - P.x - side);
    let ky = below ? P.y + side + (small ? 24 : 40) : P.y;
    if (headline) {
        canvas.text(kx, ky + share, headline, { size: share, weight: 600, family: "display", fill: "text", bg, tabular: true });
        ky += share + 18;
    }
    const sw = font.label * 0.85;
    if (o.parts) {
        // One row per part: swatch, name (wrapped), then the amount and the share on the right.
        const amountW = Math.max(...runs.map((r) => (r.shown.length + 1) * font.label * 0.52));
        const shareW = font.label * 3.6;
        const nameW = kw - sw - 10 - amountW - shareW - 12;
        for (const r of runs) {
            const top = ky;
            canvas.add(square(kx, ky + font.label * 0.2, sw, r));
            const end = canvas.para(kx + sw + 10, ky - font.label * 0.15, r.label, nameW, { size: font.label, fill: "text", bg });
            const base = top + font.label * 0.85;
            canvas.text(kx + kw - shareW, base, r.shown, { size: font.label, weight: 600, fill: "text", bg, anchor: "end", tabular: true });
            canvas.text(kx + kw, base, r.share, { size: font.label, fill: "text-muted", bg, anchor: "end", tabular: true });
            ky = Math.max(end, top + font.label * 1.2) + 10;
        }
        canvas.text(kx, ky + font.axis + 4, "Each square is one hundredth of the total.", { size: font.axis, fill: "text-muted", bg });
        ky += font.axis + 8;
    }
    else {
        for (const r of runs) {
            canvas.add(square(kx, ky + 4, sw, r));
            ky = canvas.para(kx + sw + 10, ky - font.label * 0.15, r.label, kw - sw - 10, { size: font.label, fill: "text", bg }) + 10;
        }
        canvas.text(kx, ky + font.axis + 4, "Each square is one per cent.", { size: font.axis, fill: "text-muted", bg });
        ky += font.axis + 8;
    }
    fr.close(Math.max(P.y + side, ky));
    const alt = o.alt ?? `${altBody}${rounding}${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`Waffle ${keys[0]} ${tpl.key}${small ? " small" : ""}`, alt);
    const table = tableTwin({ caption: fr.title ?? set.value(keys[0]).label, head: tableHead, rows: tableRows, source: caption });
    return { svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
