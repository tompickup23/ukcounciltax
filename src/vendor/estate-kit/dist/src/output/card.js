/**
 * The card package (R566): any kit chart as a 1200x630 and a 1080x1350 card in the estate
 * post card grammar (clawd briefings/uk-network-brand/BRAND-SYSTEM-2026-08-23.md section
 * 5b). The chart draws its own card through the og and portrait templates, so the brand
 * row, the one message and the footer come from one frame; this module renders each format
 * to PNG and checks the grammar on the result before it hands anything back.
 *
 * The grammar, fixed across every brand: the accent rule along the top, the lockup top
 * left, ONE message (the chart's takeaway title), and the footer rule with the domain in
 * the accent on the left and the source on the right. The source names its edition or
 * date, which the figure record requires, so the data date is always on the card.
 */
import { tokens } from "../../generated/tokens.js";
import { DASHES } from "../qa/gates.js";
import { toPng } from "./png.js";
import { CARD_KEYS, TEMPLATES } from "./templates.js";
export const CARD_FORMATS = CARD_KEYS;
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const unescape = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
/** Every way a card SVG breaks the grammar, as plain sentences. Empty when it is sound. */
export function cardErrors(svg, format, site = "ukdemographics") {
    const tpl = TEMPLATES[format];
    const s = tokens.sites[site];
    const errs = [];
    const root = svg.match(/^<svg[^>]*>/)?.[0] ?? "";
    if (attr(root, "width") !== String(tpl.W) || attr(root, "height") !== String(tpl.H))
        errs.push(`${format}: the card is not ${tpl.W}x${tpl.H}`);
    const rule = svg.match(/<rect[^>]*data-ek-card="rule"[^>]*>/)?.[0];
    if (!rule || attr(rule, "y") !== "0" || attr(rule, "width") !== String(tpl.W) || attr(rule, "fill")?.toLowerCase() !== s.bright.toLowerCase())
        errs.push(`${format}: no accent rule along the top`);
    const texts = [...svg.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map((m) => ({ a: m[1], text: unescape(m[2]), size: Number(attr(m[1], "font-size")), x: Number(attr(m[1], "x")), y: Number(attr(m[1], "y")) }));
    const lockup = texts.find((t) => /class="ek-lockup"/.test(t.a));
    if (!lockup || lockup.text !== s.name || lockup.y > tpl.H * 0.2)
        errs.push(`${format}: no lockup with "${s.name}" top left`);
    const domain = texts.find((t) => /class="ek-domain"/.test(t.a));
    if (!domain || domain.text !== s.domain || domain.x !== tpl.pad || attr(domain.a, "fill")?.toLowerCase() !== s.bright.toLowerCase())
        errs.push(`${format}: the domain is not on the left of the footer in the accent`);
    const source = texts.filter((t) => /class="ek-source"/.test(t.a));
    if (!source.length || !/^(Fixture, not a published figure\. )?Sources?: /.test(source.map((t) => t.text).join(" ")) || source.some((t) => !/text-anchor="end"/.test(t.a)))
        errs.push(`${format}: the source is not on the right of the footer`);
    const footer = svg.match(/<line[^>]*data-ek-card="footer"[^>]*>/)?.[0];
    if (!footer || !domain || Number(attr(footer, "y1")) > domain.y)
        errs.push(`${format}: no footer rule above the domain and source`);
    for (const t of texts) {
        if (t.size < tpl.minText)
            errs.push(`${format}: "${t.text}" is ${t.size} units, under the ${tpl.minText} floor`);
        if (DASHES.test(t.text))
            errs.push(`${format}: dash in "${t.text}"`);
    }
    return errs;
}
/** One chart as one card: the chart drawn in the format's template, gated, then rasterised. */
export function card(chart, o, format = "og") {
    if (!o.title?.trim())
        throw new Error("a card carries one message: pass the takeaway as title");
    const out = chart({ ...o, template: format });
    const errs = cardErrors(out.svg, format, o.site);
    if (errs.length)
        throw new Error(`card failed the post card grammar:\n  ${errs.join("\n  ")}`);
    return { format, svg: out.svg, png: toPng(out.svg), width: out.width, height: out.height, title: out.title, alt: out.alt, caption: out.caption, table: out.table };
}
/** The same chart in every card format: 1200x630 for links, 1080x1350 for feeds. */
export function cardSet(chart, o, formats = CARD_FORMATS) {
    return Object.fromEntries(formats.map((f) => [f, card(chart, o, f)]));
}
