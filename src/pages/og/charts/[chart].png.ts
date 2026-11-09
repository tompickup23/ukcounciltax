import type { APIRoute } from "astro";
import { buildOg } from "../../../lib/og";
import { CHART_THEMES, KIT_CHARTS, chartCard, chartPng } from "../../../lib/kit-charts";
import type { Theme } from "../../../vendor/estate-kit/dist/src/index.js";

export const prerender = true;

/**
 * One PNG per kit chart per theme, and each chart's 1200 by 630 share card, built only
 * in the BUILD_OG=1 pass like the other share cards.
 */
export function getStaticPaths() {
  if (!buildOg) return [];
  return (Object.keys(KIT_CHARTS) as (keyof typeof KIT_CHARTS)[]).flatMap((name) => [
    ...CHART_THEMES.map((theme) => ({ params: { chart: `${name}-${theme}` }, props: { name, theme } })),
    { params: { chart: `${name}-card` }, props: { name, theme: "card" } },
  ]);
}

export const GET: APIRoute = async ({ props }) => {
  const { name, theme } = props as { name: keyof typeof KIT_CHARTS; theme: Theme | "card" };
  const png = theme === "card" ? await chartCard(name) : chartPng(name, theme);
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
