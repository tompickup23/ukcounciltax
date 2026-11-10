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
import { billAnatomy, formatValue, zeroBar, positionStrip, locatorMap, tokens, type BillAnatomyOptions, type ZeroBarOptions, type PositionStripOptions, type LocatorMapOptions, type ChartOutput, type Theme } from "../vendor/estate-kit/dist/src/index.js";
import { CURRENT_YEAR, loadYear, yearLabel } from "./council-tax";
import { loadRegistry } from "./registry";
import { classFor, rankClass } from "./rankings";
import { national } from "./national-data";
import { neighbourAreas, boundarySource } from "./boundaries";
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

export const PROFILE_CHARTS = ["bands", "bill", "position", "map"] as const;
export type ProfileChart = typeof PROFILE_CHARTS[number];
export type ProfileChartName = `councils/${string}/${ProfileChart}`;
export type KitChartName = keyof typeof KIT_CHARTS | ProfileChartName;

export function profileChartOptions(slug: string) {
  const data = loadYear(CURRENT_YEAR);
  const council = Object.values(loadRegistry().councils).find(council => council.slug === slug);
  if (!council || !data.authorities[council.gss]) throw new Error(`A3: no billing authority ${slug}`);
  const tax = data.authorities[council.gss];
  const cls = classFor(tax.classCode)!;
  const rows = rankClass(data, cls)!;
  const key = `council.${slug}`;
  const year = yearLabel(CURRENT_YEAR);
  const common = {set: siteFigures()};
  const components = national.components[council.gss];
  const kept = components.parts.filter(part => {
    const drop = part.kind === "county" ? ["UA", "MD"].includes(tax.classCode)
      : ["ILB", "OLB"].includes(tax.classCode);
    if (drop && (part.bandDPence !== 0 || part.name !== null)) throw new Error(`A3 stop: cannot drop ${council.gss}/${part.kind}`);
    return !drop;
  });
  const areas = neighbourAreas(council.gss);
  return {
    bands: {...common, figure: `${key}.bands`, orientation: "vertical", highlight: "D",
      title: `Bands A to H in ${tax.name}, ${year}, Band D marked`} satisfies ZeroBarOptions,
    bill: {...common, parts: ["own", ...kept.filter(part => part.bandDPence !== 0).map(part => part.kind)].map(part => `${key}.bill.${part}`),
      total: `${key}.bill.total`, title: `Where a Band D bill in ${tax.name} goes, ${year}, council part including average local precepts`} satisfies BillAnatomyOptions,
    position: {...common, figure: `${key}.area_bandd`, distribution: `class.${cls.slug}.area_bandd`, place: tax.name,
      classLabel: cls.label, basis: "Area Band D, including adult social care and average parish precepts, MHCLG Table 9",
      title: `Area Band D in ${tax.name} within the ${rows.length} ${cls.label}, ${year}`} satisfies PositionStripOptions,
    map: {...common, areas, focus: council.gss,
      values: Object.fromEntries(areas.map(area => [area.properties.code, `council.${loadRegistry().councils[area.properties.code].slug}.area_bandd`])),
      breaks: [2250, 2350, 2450, 2550], boundaryCredit: `${boundarySource.attribution} Licensed under OGL v3.0`,
      title: `Area Band D in ${tax.name} and neighbouring council areas, ${year}`} satisfies LocatorMapOptions,
  };
}

export function profileChartNames(): ProfileChartName[] {
  const registry = loadRegistry();
  return Object.keys(loadYear(CURRENT_YEAR).authorities).flatMap(gss => PROFILE_CHARTS.map(chart => `councils/${registry.councils[gss].slug}/${chart}` as ProfileChartName));
}

export function drawProfileChart(name: ProfileChartName, theme?: Theme): ChartOutput {
  const [, slug, chart] = name.split("/") as [string, string, ProfileChart];
  const options = profileChartOptions(slug);
  const mode = theme ? {kind: "hex" as const, theme, site: "ukcounciltax" as const} : undefined;
  switch (chart) {
    case "bands": return zeroBar({...options.bands, mode});
    case "bill": return billAnatomy({...options.bill, mode});
    case "position": return positionStrip({...options.position, mode});
    case "map": return locatorMap({...options.map, mode});
  }
}

/** The figure keys a chart draws, for its source line. */
export function chartKeys(name: KitChartName): string[] {
  if (name !== "home-bill") {
    const [, slug, chart] = name.split("/") as [string, string, ProfileChart];
    const opts = profileChartOptions(slug);
    switch (chart) {
      case "bands": return [opts.bands.figure];
      case "bill": return [...opts.bill.parts, opts.bill.total];
      case "position": return [opts.position.figure, opts.position.distribution];
      case "map": return Object.values(opts.map.values);
    }
  }
  const o = KIT_CHARTS[name].options();
  return [...o.parts, o.total];
}

/** The public path of a chart's 1200 by 630 share card. */
export function chartCardPath(name: KitChartName): string {
  return `/og/charts/${name}-card.png`;
}

/** The share card's alt text: the chart's own story bearing alt, which names no person. */
export function chartAlt(name: keyof typeof KIT_CHARTS): string {
  return billAnatomy(KIT_CHARTS[name].options()).alt;
}

/**
 * One chart as the kit's 1200 by 630 card (post card grammar, gated by the kit's
 * cardErrors before it returns). The card module rasterises with fonts it finds beside
 * its own file, so it is loaded from the vendored copy on disk rather than bundled.
 */
export async function chartCard(name: keyof typeof KIT_CHARTS): Promise<Buffer> {
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
  if (name !== "home-bill") return drawProfileChart(name, theme);
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

/** Sum the shares exactly as the kit prints them, in tenths of one percent. */
export function billShareRounding(options: BillAnatomyOptions): string | null {
  const set = options.set ?? siteFigures();
  const total = Math.round(set.value(options.total).value * 100);
  const tenths = options.parts.reduce((sum, key) => {
    const part = Math.round(set.value(key).value * 100);
    return sum + Math.round(parseFloat(formatValue((part / total) * 100, "percent", 1)) * 10);
  }, 0);
  return tenths === 1000 ? null : `Each share is rounded to one decimal place, so together they add to ${(tenths / 10).toFixed(1)}%.`;
}
