/**
 * Two optional thumb kinds (0.6.4, K1 of the UK Council Tax design audit of 15 November 2026),
 * for task cards whose tool has no chart of its own in the kit's thumb set: "set", for a tool
 * where the reader sets values (UK Council Tax's set mode), and "map", for a map tool. Both
 * draw the 160 by 64 thumb template: marks only, no text, hidden from assistive technology,
 * framed like every other thumb. The set thumb registers its two marks with the gates; the
 * map thumb's fills are AreaMap's classes on the chosen ramp, which the ramp tests hold apart.
 * Neither is a full chart form; each exists only as a thumb.
 *
 * set: two to six value figures in one unit, each a slider track with its value filled from
 * zero and a handle at the value, on one scale from zero to a round ceiling above the largest.
 * It draws values side by side, never one whole split into parts.
 *
 * map: AreaMap's fixed classes at thumb size, with the same registry and the same estate or
 * accent ramp on the estate ground, and an unknown in the ramp's no figure colour.
 */
import { geoMercator, geoPath } from "d3-geo";
import { tokens } from "../../generated/tokens.js";
import { n2 } from "./canvas.js";
import { frame, niceMax } from "./frame.js";
import { rewind } from "./grammar/geo.js";
import { colourFor, defineMapIndicators } from "./mapIndicators.js";
import { rampSite } from "./locatorMap.js";
import { currentFigures } from "../figures/figures.js";
const R = tokens.ramp;
const empty = (svg, W, H) => ({ svg, table: "", alt: "", caption: "", width: W, height: H });
/** A marks only thumb of one of the two kinds. */
export function thumb(o) {
    if (o.kind === "set")
        return setThumb(o);
    if (o.kind === "map")
        return mapThumb(o);
    throw new Error(`a thumb kind is "set" or "map", not "${o.kind}"`);
}
function setThumb(o) {
    const set = currentFigures(o.set);
    if (!Array.isArray(o.rows) || o.rows.length < 2 || o.rows.length > 6)
        throw new Error("a set thumb draws two to six rows");
    const figs = o.rows.map((k) => set.value(k));
    if (figs.some((f) => f.unit !== figs[0].unit))
        throw new Error("every row of a set thumb shares one unit");
    if (figs.some((f) => !Number.isFinite(f.value) || f.value < 0))
        throw new Error("a set thumb draws values from zero; none may be negative");
    const fr = frame({ ...o, set, template: "thumb" }, "", 0, "set");
    const { canvas, plot: P } = fr;
    const end = niceMax(Math.max(...figs.map((f) => f.value)));
    const band = P.h / figs.length;
    const r = Math.min(5, band / 2 - 1);
    const x0 = P.x + r, span = P.w - 2 * r;
    figs.forEach((f, i) => {
        const cy = P.y + band * i + band / 2;
        const at = x0 + (f.value / end) * span;
        canvas.rect(x0, cy - 1, span, 2, "series-neutral-soft", 'rx="1"');
        canvas.rect(x0, cy - 2, at - x0, 4, "accent", 'rx="2"');
        canvas.add(`<circle cx="${n2(at)}" cy="${n2(cy)}" r="${n2(r)}" ${canvas.paint({ fill: "accent" })}/>`);
    });
    canvas.mark("slider track", "series-neutral-soft", ["bg", "bg-card"]);
    canvas.mark("slider value and handle", "accent", ["bg", "bg-card"]);
    fr.close(P.y + P.h);
    return empty(canvas.finish(`set thumb ${o.rows.join(" ")}`, ""), canvas.W, canvas.H);
}
function mapThumb(o) {
    const set = currentFigures(o.set);
    const registry = defineMapIndicators(o.registry);
    const ind = registry[o.indicator];
    if (!ind || ind.kind !== "fixed")
        throw new Error("a map thumb shades a fixed indicator from the registry");
    if (!o.areas?.length)
        throw new Error("a map thumb needs geometry");
    const site = rampSite(o.ramp, o.site);
    const codes = o.areas.map((a) => a.properties.code);
    if (new Set(codes).size !== codes.length || codes.some((c) => !c?.trim()))
        throw new Error("each area needs a unique code");
    for (const code of Object.keys(o.values))
        if (!codes.includes(code))
            throw new Error(`${code}: value has no input geometry`);
    const records = codes.map((code) => {
        if (!o.values[code])
            throw new Error(`${code}: supply a figure record, including for an unknown value`);
        return set.valueRecord(o.values[code]);
    });
    if (records.some((f) => f.unit !== ind.unit || f.source.edition !== records[0].source.edition))
        throw new Error("one map must share its indicator unit and edition");
    const fr = frame({ ...o, set, template: "thumb" }, "", 0, "map");
    const { canvas, plot: P } = fr;
    const areas = o.areas.map(rewind);
    canvas.rect(P.x, P.y, P.w, P.h, R.ground, 'rx="3"');
    const projection = geoMercator().fitExtent([[P.x + 3, P.y + 3], [P.x + P.w - 3, P.y + P.h - 3]], { type: "FeatureCollection", features: areas });
    const path = geoPath(projection);
    areas.forEach((a, i) => {
        const d = path(a);
        if (!d || /NaN|Infinity/.test(d))
            throw new Error(`${a.properties.code}: geometry cannot be drawn`);
        canvas.add(`<path d="${d}" fill="${colourFor(ind, records[i].value, site)}" stroke="${R.ground}" stroke-width="0.5"/>`);
    });
    fr.close(P.y + P.h);
    return empty(canvas.finish(`map thumb ${o.indicator}`, ""), canvas.W, canvas.H);
}
