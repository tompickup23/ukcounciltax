/**
 * PNG output through resvg, with the kit's own static font files so a card renders the
 * same on this Mac and on vps-main. resvg reads TrueType, not WOFF, and does not read CSS
 * custom properties, so only hex mode SVG (every card template) can be rasterised.
 */
import { Resvg } from "@resvg/resvg-js";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tokens } from "../../generated/tokens.js";
// The package root holds fonts/. It is two levels up from src/output and three from the
// built dist/src/output, so look for it rather than fix the depth.
const ROOT = ["../../", "../../../"].map((up) => new URL(up, import.meta.url)).find((u) => existsSync(new URL("fonts/", u)));
if (!ROOT)
    throw new Error("estate-kit: fonts/ not found beside the package");
const font = (rel) => fileURLToPath(new URL(rel, ROOT));
export const FONT_FILES = [
    ...Object.values(tokens.font.sans.files),
    ...Object.values(tokens.font.display.files)
].map(font);
export function toPng(svg, width) {
    if (svg.includes("var(--"))
        throw new Error("toPng needs hex mode SVG: resvg cannot read CSS custom properties");
    const r = new Resvg(svg, {
        fitTo: width ? { mode: "width", value: width } : { mode: "original" },
        font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: tokens.font.sans.family }
    });
    return r.render().asPng();
}
