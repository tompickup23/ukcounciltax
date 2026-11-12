import {cachedImageRoute} from "../../../../scripts/lib/image-cache.mjs";
import type { APIRoute } from "astro";
import { buildOg } from "../../../lib/og";
import { CHART_THEMES, KIT_CHARTS, chartCard, chartPng, classChartNames, type KitChartName } from "../../../lib/kit-charts";
import type { Theme } from "../../../vendor/estate-kit/dist/src/index.js";

export const prerender = true;

/**
 * One light PNG per kit chart, and each chart's 1200 by 630 share card, built only
 * in the BUILD_OG=1 pass like the other share cards.
 */
export function getStaticPaths() {
  if (!buildOg) return [];
  const paths: { params: { chart: string }; props: { name: KitChartName; theme: Theme | "card" } }[] = [];
  for (const name of Object.keys(KIT_CHARTS) as (keyof typeof KIT_CHARTS)[]) {
    for (const theme of CHART_THEMES) paths.push({ params: { chart: `${name}-${theme}` }, props: { name, theme } });
    paths.push({ params: { chart: `${name}-card` }, props: { name, theme: "card" } });
  }
  // The class strips on /council-tax/ranked/ have one light PNG and no share card.
  for (const name of classChartNames()) {
    for (const theme of CHART_THEMES) paths.push({ params: { chart: `${name}-${theme}` }, props: { name, theme } });
  }
  return paths;
}

export const GET: APIRoute = cachedImageRoute(async ({ props }) => {
  const { name, theme } = props as { name: KitChartName; theme: Theme | "card" };
  const png = theme === "card" ? await chartCard(name as keyof typeof KIT_CHARTS) : chartPng(name, theme);
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
});
