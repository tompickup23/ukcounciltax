/**
 * A small SVG writer that records what it draws, so the QA gates can check every piece of
 * text and every mark against the real palette values.
 *
 * Two paint modes. "css" writes colours as CSS custom properties (style="fill:var(--x)"),
 * so the same inline SVG follows the page between light and dark with no script; the gates
 * then run against both themes of every site. "hex" writes plain hex for one theme, for
 * resvg, which cannot read custom properties.
 */
import { palette, SITE_KEYS } from "../../generated/tokens.js";
import { tokens } from "../../generated/tokens.js";
import { assertGates, emptyChecks } from "../qa/gates.js";
export const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const n2 = (v) => (Math.round(v * 100) / 100).toString();
const FAMILY_ATTR = {
    sans: tokens.font.sans.stack.replace(/"/g, "'"),
    display: tokens.font.display.stack.replace(/"/g, "'")
};
/** Average advance width per em, measured from the Source faces on mixed English text. */
const ADVANCE = {
    sans: { 400: 0.49, 600: 0.52 },
    display: { 400: 0.53, 600: 0.56 }
};
/** An estimate of drawn width, used only to wrap and to keep labels apart. */
export function textWidth(s, size, family = "sans", weight = 400) {
    return s.length * size * (ADVANCE[family][weight] ?? 0.52);
}
/** Greedy word wrap to a width. */
export function wrap(s, maxW, size, family = "sans", weight = 400) {
    const words = s.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const w of words) {
        const next = line ? `${line} ${w}` : w;
        if (line && textWidth(next, size, family, weight) > maxW) {
            lines.push(line);
            line = w;
        }
        else
            line = next;
    }
    if (line)
        lines.push(line);
    return lines;
}
export class Canvas {
    parts = [];
    checks = emptyChecks();
    mode;
    W;
    H;
    // Written out rather than as parameter properties, so Node can run the kit by type
    // stripping alone (node --experimental-strip-types).
    constructor(mode, W, H) {
        this.mode = mode;
        this.W = W;
        this.H = H;
    }
    /** Paint attributes for fill and stroke in the current mode. */
    paint(p) {
        const out = [];
        const style = [];
        for (const [prop, c] of Object.entries(p)) {
            if (!c)
                continue;
            if (c === "none" || c.startsWith("#"))
                out.push(`${prop}="${c}"`);
            else if (this.mode.kind === "css")
                style.push(`${prop}:var(--${c})`);
            else
                out.push(`${prop}="${palette(this.mode.theme, this.mode.site)[c] ?? fail(c)}"`);
        }
        if (style.length)
            out.push(`style="${style.join(";")}"`);
        return out.join(" ");
    }
    add(svg) { this.parts.push(svg); }
    rect(x, y, w, h, fill, extra = "") {
        this.add(`<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" ${this.paint({ fill })}${extra ? " " + extra : ""}/>`);
    }
    line(x1, y1, x2, y2, stroke, width = 1, extra = "") {
        this.add(`<line x1="${n2(x1)}" y1="${n2(y1)}" x2="${n2(x2)}" y2="${n2(y2)}" ${this.paint({ stroke })} stroke-width="${n2(width)}"${extra ? " " + extra : ""}/>`);
    }
    text(x, y, content, o) {
        const weight = o.weight ?? 400;
        const family = o.family ?? "sans";
        this.checks.texts.push({ content, size: o.size, weight, fill: o.fill, bg: o.bg });
        const attrs = [
            `x="${n2(x)}"`, `y="${n2(y)}"`,
            `font-family="${FAMILY_ATTR[family]}"`, `font-size="${n2(o.size)}"`, `font-weight="${weight}"`,
            o.anchor && o.anchor !== "start" ? `text-anchor="${o.anchor}"` : "",
            o.baseline && o.baseline !== "auto" ? `dominant-baseline="${o.baseline}"` : "",
            o.tabular ? `font-variant-numeric="tabular-nums"` : "",
            o.cls ? `class="${o.cls}"` : "",
            this.paint({ fill: o.fill })
        ].filter(Boolean);
        this.add(`<text ${attrs.join(" ")}>${esc(content)}</text>`);
    }
    /** Wrapped text from a top line; returns the y below the last line. */
    para(x, y, content, maxW, o) {
        const lh = o.size * (o.lineHeight ?? 1.3);
        const lines = wrap(content, maxW, o.size, o.family, o.weight);
        lines.forEach((l, i) => this.text(x, y + o.size + i * lh, l, o));
        return y + o.size + (lines.length - 1) * lh + (lh - o.size);
    }
    mark(what, fill, against) { this.checks.marks.push({ what, fill, against }); }
    series(what, colours) { if (colours.length > 1)
        this.checks.series.push({ what, colours }); }
    /** Runs the gates and returns the finished SVG. */
    finish(what, label, extraAttrs = "") {
        assertGates(this.checks, gatePalettes(this.mode), what);
        const H = this.H;
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(this.W)} ${n2(H)}" width="${n2(this.W)}" height="${n2(H)}" role="img" aria-label="${esc(label)}" class="ek-chart"${extraAttrs ? " " + extraAttrs : ""}>${this.parts.join("")}</svg>`;
    }
}
function fail(token) {
    throw new Error(`no token "${token}" in the palette`);
}
/** The palettes a render must pass: both themes of every site in css mode, one in hex mode. */
export function gatePalettes(mode) {
    if (mode.kind === "hex")
        return [{ name: `${mode.theme} ${mode.site}`, pal: palette(mode.theme, mode.site) }];
    return ["light", "dark"].flatMap((theme) => SITE_KEYS.map((site) => ({ name: `${theme} ${site}`, pal: palette(theme, site) })));
}
