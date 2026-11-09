import type { APIRoute } from "astro";
import { buildOg } from "../../../lib/og";
import { CHART_THEMES, KIT_CHARTS, chartPng, type KitChartName } from "../../../lib/kit-charts";
import type { Theme } from "../../../vendor/estate-kit/dist/src/index.js";

export const prerender = true;

/** One PNG per kit chart per theme, built only in the BUILD_OG=1 pass, like the share cards. */
export function getStaticPaths() {
  if (!buildOg) return [];
  return (Object.keys(KIT_CHARTS) as KitChartName[]).flatMap((name) =>
    CHART_THEMES.map((theme) => ({ params: { chart: `${name}-${theme}` }, props: { name, theme } })),
  );
}

export const GET: APIRoute = ({ props }) => {
  const { name, theme } = props as { name: KitChartName; theme: Theme };
  return new Response(new Uint8Array(chartPng(name, theme)), { headers: { "Content-Type": "image/png" } });
};
