/**
 * Share cards for the towns pages: the scope's lowest and highest full Band D as
 * the card's pair, with the caveat and the source on the card. Built only in the
 * BUILD_OG=1 pass, like every other card. No card names a person.
 */
import type {OgCard} from './og';
import {longDate} from './sources';
import {money, placeLabel, scopeIn, scopeSummary, townSources, townsYear, type TownScope} from './towns-pages';

export const townOgPath = (scope: TownScope) => scope.kind === 'england' ? '/og/towns/england.png' : `/og/towns/${scope.kind}/${scope.slug}.png`;

export function townOgCard(scope: TownScope): OgCard {
  const {lowest, highest} = scopeSummary(scope.rows);
  const heading = scope.kind === 'constituency' ? `${scope.name} constituency` : scope.name;
  const source = `MHCLG parish return and Table 10, retrieved ${longDate(townSources.components.retrieved)}`;
  const eyebrow = `Council tax by parish and unparished area | ${townsYear}`;
  if (!lowest || !highest) return {eyebrow, heading, caveat: 'Full Band D is published by the council only for these areas.', source};
  const pair = lowest === highest
    ? [{value: money(lowest.town.fullBandDPence), label: `Full Band D, ${placeLabel(lowest.town)}`}]
    : [
      {value: money(lowest.town.fullBandDPence), label: `Lowest full Band D: ${placeLabel(lowest.town)}`},
      {value: money(highest.town.fullBandDPence), label: `Highest: ${placeLabel(highest.town)}`},
    ];
  return {eyebrow, heading, pair, caveat: 'Band D before discounts. Areas whose bills only the council publishes are not included.', source};
}

export function townOgAlt(scope: TownScope): string {
  const {lowest, highest} = scopeSummary(scope.rows);
  const where = scopeIn(scope);
  if (!lowest || !highest) return `Council tax by parish and unparished area ${where}, ${townsYear}`;
  return `Full Band D ${where}, ${townsYear}: ${money(lowest.town.fullBandDPence)} in ${placeLabel(lowest.town)} and ${money(highest.town.fullBandDPence)} in ${placeLabel(highest.town)}`;
}
