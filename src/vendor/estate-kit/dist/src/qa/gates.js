/**
 * The QA gates every kit output passes before it is returned. They are the gates of the
 * UK Demographics map renderer (ukdemographics src/lib/map/render.ts), lifted so every
 * chart runs them: text contrast at WCAG 2 AA (4.5:1, or 3:1 for large text), marks at
 * 3:1 against their ground (WCAG 1.4.11), series pairs apart under the three colour vision
 * simulations, and no dash in any visible text. A failure throws, so an unreadable chart
 * cannot be built.
 */
import { contrast, seenDistance, VISIONS } from "./colour.js";
/** The dash pattern of the map renderer: em dash, en dash, a spaced hyphen, the entities. */
export const DASHES = /[\u2013\u2014]| - |&mdash;|&ndash;/; // dash-ok: the pattern itself
/** OKLab distance two series must keep under every vision (ukdemographics tests/ethnic-palette.test.ts). */
export const MIN_SERIES_DISTANCE = 0.09;
export const MIN_MARK_CONTRAST = 3;
export const emptyChecks = () => ({ texts: [], marks: [], series: [] });
export const resolve = (c, pal) => {
    if (c.startsWith("#"))
        return c;
    const hex = pal[c];
    if (!hex)
        throw new Error(`no token "${c}" in the palette`);
    return hex;
};
/** The contrast a piece of text needs: large text (24 units, or 18.66 at 600) needs 3. */
export const textNeed = (size, weight) => (size >= 24 || (size >= 18.66 && weight >= 600) ? 3 : 4.5);
/** Every failure for one palette. `name` says which theme and site, for the message. */
export function gateErrors(checks, pal, name) {
    const errs = [];
    for (const t of checks.texts) {
        if (DASHES.test(t.content))
            errs.push(`dash in "${t.content}"`);
        const fg = resolve(t.fill, pal), bg = resolve(t.bg, pal);
        const c = contrast(fg, bg), need = textNeed(t.size, t.weight);
        if (c < need)
            errs.push(`${name}: text contrast ${c.toFixed(2)} < ${need} for "${t.content}" (${fg} on ${bg})`);
    }
    for (const m of checks.marks) {
        const fg = resolve(m.fill, pal);
        for (const a of m.against) {
            const bg = resolve(a, pal), c = contrast(fg, bg);
            if (c < MIN_MARK_CONTRAST)
                errs.push(`${name}: ${m.what} contrast ${c.toFixed(2)} < ${MIN_MARK_CONTRAST} (${fg} on ${bg})`);
        }
    }
    for (const s of checks.series) {
        const hex = s.colours.map((c) => resolve(c, pal));
        for (const v of VISIONS)
            for (let i = 0; i < hex.length; i++)
                for (let j = i + 1; j < hex.length; j++) {
                    const d = seenDistance(hex[i], hex[j], v);
                    if (d < MIN_SERIES_DISTANCE)
                        errs.push(`${name}: ${s.what} ${s.colours[i]} and ${s.colours[j]} are ${d.toFixed(3)} apart under ${v} vision, below ${MIN_SERIES_DISTANCE}`);
                }
    }
    return [...new Set(errs)];
}
/** Runs the gates against every palette and throws with every failure listed. */
export function assertGates(checks, palettes, what) {
    const errs = palettes.flatMap((p) => gateErrors(checks, p.pal, p.name));
    if (errs.length)
        throw new Error(`QA failed for ${what}:\n  ${errs.join("\n  ")}`);
}
