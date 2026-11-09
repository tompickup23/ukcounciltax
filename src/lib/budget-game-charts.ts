/** Drawings of the unchanged adapter output. Player answers never enter this set. */
import {defineFigures} from '../vendor/estate-kit/dist/src/figures/figures.js';
import {waffle} from '../vendor/estate-kit/dist/src/charts/waffle.js';
import type {Theme} from '../vendor/estate-kit/dist/generated/tokens.js';
import {budgetYear} from './budget';
import type {GameRound} from './budget-game';

export function gameChart(round: GameRound, id: string, theme?: Theme) {
  if (round.kind !== 'split') throw new Error('Only service splits have drawings at this stage');
  const keys = round.items.map((_, index) => `${id}-part-${index}`);
  const set = defineFigures(Object.fromEntries(round.items.map((item, index) => [keys[index], {
    kind: 'value', label: item.label, unit: 'gbp', value: item.value * 1000, dp: 0,
    source: {...round.source, edition: budgetYear},
  }])));
  const out = waffle({parts: keys, set, size: 'small', site: 'ukcounciltax', mode: theme ? {kind: 'hex', theme, site: 'ukcounciltax'} : {kind: 'css'}, title: round.title.replace('Guess the split: ', '') + "'s published split"});
  return {out, keys, captionHtml: set.captionHtml(keys)};
}
export function gameChartPng(slug: string, round: number, theme: Theme) {return `/og/budget/${slug}/round-${round}-${theme}.png`;}
