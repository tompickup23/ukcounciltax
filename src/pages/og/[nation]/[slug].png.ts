import {cachedImageRoute} from "../../../../scripts/lib/image-cache.mjs";
import type { APIRoute } from 'astro';
import { buildOg, renderOgCard } from '../../../lib/og';
import { CURRENT_YEAR, yearLabel } from '../../../lib/council-tax';
import { devolved, type Edition, type DevolvedRow } from '../../../lib/devolved';
import { moneyPence } from '../../../lib/tax-view';
import { longDate } from '../../../lib/sources';

export const prerender = true;
export function getStaticPaths() {
  if (!buildOg) return [];
  return devolved.editions.filter(edition => edition.year === CURRENT_YEAR).flatMap(edition => edition.records.map(row => ({params: {nation: edition.nation.toLowerCase(), slug: row.slug}, props: {edition, row}})));
}
export const GET: APIRoute = cachedImageRoute(async ({props}) => {
  const {edition, row} = props as {edition: Edition; row: DevolvedRow};
  const scotland = edition.nation === 'Scotland';
  const value = scotland ? moneyPence(row.bandsPence.D) : new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP', maximumFractionDigits: 0}).format(row.bandsPence.D/100);
  const png = await renderOgCard({
    eyebrow: `${edition.nation} council tax ${yearLabel(edition.year)}`,
    heading: row.name,
    figure: {value, label: scotland ? 'Band D' : 'Band D area average'},
    caveat: scotland ? 'Council tax only, water and sewerage excluded.' : edition.basis,
    source: `${scotland ? 'Scottish Government' : 'Welsh Government'}, ${edition.table}, retrieved ${longDate(devolved.retrieved)}`,
  });
  return new Response(png, {headers: {'Content-Type': 'image/png'}});
});
