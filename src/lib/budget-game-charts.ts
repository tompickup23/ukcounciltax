/** Drawings of the unchanged adapter output. Player answers never enter this set. */
import {defineFigures} from '../vendor/estate-kit/dist/src/figures/figures.js';
import {zeroBar} from '../vendor/estate-kit/dist/src/charts/zeroBar.js';
import {waffle} from '../vendor/estate-kit/dist/src/charts/waffle.js';
import type {Theme} from '../vendor/estate-kit/dist/generated/tokens.js';
import {budgetYear} from './budget';
import type {GameRound} from './budget-game';

export function gameChart(round: GameRound, id: string, theme?: Theme) {
  if (round.kind === 'funding' || round.kind === 'reserves') {
    const key = `${id}-amounts`;
    const items = round.kind === 'funding' ? [...round.items].sort((a,b) => Math.abs(b.value)-Math.abs(a.value)) : round.items;
    const set = defineFigures({[key]: {kind:'series',label:round.kind === 'funding' ? 'Funding magnitudes, with add or deduct direction' : 'Non-ringfenced reserve balances',unit:'gbp',dp:0,axis:'category',points:items.map(item=>({label:round.kind === 'funding' ? `${item.label} (${item.value<0?'deduct':item.value>0?'add':'no contribution'})` : item.label,value:(round.kind === 'funding' ? Math.abs(item.value) : item.value)*1000})),source:{...round.source,edition:budgetYear}}});
    const out = zeroBar({set,figure:key,orientation:'horizontal',diverging:round.kind === 'reserves' && items.some(item=>item.value<0),title:round.kind === 'funding' ? 'Funding by magnitude' : 'Reserves at the start and end of the year',site:'ukcounciltax',mode:theme?{kind:'hex',theme,site:'ukcounciltax'}:{kind:'css'}});
    return {out, keys:[key], captionHtml:set.captionHtml(key)};
  }
  if (round.kind !== 'split' && round.kind !== 'bill') throw new Error('Only splits have drawings at this stage');
  const keys = round.items.map((_, index) => `${id}-part-${index}`);
  const records = Object.fromEntries(round.items.map((item, index) => [keys[index], {
    kind: 'value', label: item.label, unit: 'gbp', value: round.kind === 'bill' ? item.value / 100 : item.value * 1000, dp: round.kind === 'bill' ? 2 : 0,
    source: {...round.source, edition: budgetYear},
  }]));
  // The adapter verifies every component is present. Where MHCLG prints a rounding
  // difference, retain both printed figures and its existing note; kit 0.3.0 refuses
  // any unequal money total, so allocate those complete parts without its total option.
  const total = `${id}-total`;
  const exact = round.kind === 'bill' && round.items.reduce((sum,item) => sum + item.value, 0) === round.base;
  if (exact) records[total] = {kind: 'value', label: 'Published Band D area average', unit: 'gbp', value: round.base! / 100, dp: 2, source: {...round.source, edition: budgetYear}};
  const set = defineFigures(records);
  const out = waffle({parts: keys, total: exact ? total : undefined, set, size: 'small', site: 'ukcounciltax', mode: theme ? {kind: 'hex', theme, site: 'ukcounciltax'} : {kind: 'css'}, title: round.kind === 'bill' ? 'The published Band D bill split' : round.title.replace('Guess the split: ', '') + "'s published split"});
  if (exact) keys.push(total);
  return {out, keys, captionHtml: set.captionHtml(keys)};
}
export function gameChartPng(slug: string, round: number, theme: Theme) {return `/og/budget/${slug}/round-${round}-${theme}.png`;}
