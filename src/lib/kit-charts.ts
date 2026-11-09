/**
 * Every Estate Kit chart the site draws, by name, so the page and the PNG route draw
 * the same chart from the same options. The page renders it inline in css paint mode
 * (it follows the theme); the BUILD_OG=1 pass renders it once per theme in hex mode
 * and rasterises it, and the chart's actions link to those files (A5 brief, 6.2).
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { billAnatomy, tokens, type BillAnatomyOptions, type ChartOutput, type Theme } from "../vendor/estate-kit/dist/src/index.js";
import { BURNLEY_PARTS, siteFigures } from "./figures";

export const CHART_THEMES = ["light", "dark"] as const satisfies readonly Theme[];

export const KIT_CHARTS = {
  "home-bill": {
    kind: "billAnatomy",
    options: (): BillAnatomyOptions => ({
      set: siteFigures(),
      parts: BURNLEY_PARTS.map((k) => `burnley.bandd.${k}`),
      total: "burnley.bandd.total",
      title: "Four bodies charge a Burnley Band D bill",
    }),
  },
} as const;

export type KitChartName = keyof typeof KIT_CHARTS;

/** The figure keys a chart draws, for its source line. */
export function chartKeys(name: KitChartName): string[] {
  const o = KIT_CHARTS[name].options();
  return [...o.parts, o.total];
}

/** The public path of a chart's 1200 by 630 share card. */
export function chartCardPath(name: KitChartName): string {
  return `/og/charts/${name}-card.png`;
}

/** The share card's alt text: the chart's own story bearing alt, which names no person. */
export function chartAlt(name: KitChartName): string {
  return billAnatomy(KIT_CHARTS[name].options()).alt;
}

/**
 * One chart as the kit's 1200 by 630 card (post card grammar, gated by the kit's
 * cardErrors before it returns). The card module rasterises with fonts it finds beside
 * its own file, so it is loaded from the vendored copy on disk rather than bundled.
 */
export async function chartCard(name: KitChartName): Promise<Buffer> {
  const at = (rel: string) => pathToFileURL(join(process.cwd(), "src", "vendor", "estate-kit", "dist", "src", rel)).href;
  const { card } = (await import(/* @vite-ignore */ at("output/card.js"))) as typeof import("../vendor/estate-kit/dist/src/output/card.js");
  const kit = (await import(/* @vite-ignore */ at("index.js"))) as typeof import("../vendor/estate-kit/dist/src/index.js");
  return card(kit.billAnatomy, { ...KIT_CHARTS[name].options(), site: "ukcounciltax" }, "og").png;
}

/** The public path of a chart's PNG in one theme. */
export function chartPngPath(name: KitChartName, theme: Theme): string {
  return `/og/charts/${name}-${theme}.png`;
}

function draw(name: KitChartName, theme: Theme): ChartOutput {
  return billAnatomy({ ...KIT_CHARTS[name].options(), mode: { kind: "hex", theme, site: "ukcounciltax" } });
}

// The kit's own TrueType faces, read from the vendored copy by the working directory:
// the kit's toPng finds them from its own module URL, which a bundled build moves.
const FONT_DIR = join(process.cwd(), "src", "vendor", "estate-kit", "fonts");

/** One chart in one theme as a PNG at twice its drawn width, source line included. */
export function chartPng(name: KitChartName, theme: Theme): Buffer {
  const out = draw(name, theme);
  const fontFiles = readdirSync(FONT_DIR).filter((f) => f.endsWith(".ttf")).map((f) => join(FONT_DIR, f));
  const svg = new Resvg(out.svg, {
    fitTo: { mode: "width", value: out.width * 2 },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: tokens.font.sans.family },
  });
  return svg.render().asPng();
}
