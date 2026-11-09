import type {APIRoute} from 'astro';
import {buildOg} from '../../../../../lib/og';
import {CHART_THEMES, profileChartNames, chartPng, type ProfileChartName} from '../../../../../lib/kit-charts';
import type {Theme} from '../../../../../vendor/estate-kit/dist/src/index.js';
export const prerender = true;
export function getStaticPaths() {
  if (!buildOg) return [];
  return profileChartNames().flatMap(name => {
    const [, slug, chart] = name.split('/');
    return CHART_THEMES.map(theme => ({params: {slug, chart: `${chart}-${theme}`}, props: {name, theme}}));
  });
}
export const GET: APIRoute = ({props}) => {
  const {name, theme} = props as {name: ProfileChartName; theme: Theme};
  return new Response(new Uint8Array(chartPng(name, theme)), {headers: {'Content-Type': 'image/png'}});
};
