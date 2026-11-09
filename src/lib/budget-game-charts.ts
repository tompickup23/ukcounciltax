/** Drawings of the unchanged adapter output. Player answers never enter this set. */
import {defineFigures, formatValue} from '../vendor/estate-kit/dist/src/figures/figures.js';
import {zeroBar} from '../vendor/estate-kit/dist/src/charts/zeroBar.js';
import {waffle} from '../vendor/estate-kit/dist/src/charts/waffle.js';
import {tableTwin} from '../vendor/estate-kit/dist/src/charts/table.js';
import {n2} from '../vendor/estate-kit/dist/src/charts/canvas.js';
import type {ChartOutput} from '../vendor/estate-kit/dist/src/index.js';
import type {Theme} from '../vendor/estate-kit/dist/generated/tokens.js';
import {budgetYear} from './budget';
import type {GameRound} from './budget-game';

const chartLabel=(text:string)=>text.replace(/\s*[\u2013\u2014]\s*|\s-\s/g, ': ');
/** Keep the kit's zero baseline and proportions, with funding labels above each bar.
 * The extra row space applies to the inline drawing and both downloadable PNGs.
 */
function labelsAboveBars(out: ChartOutput): ChartOutput {
  const bars = [...out.svg.matchAll(/data-base="([^"]+)" data-end="([^"]+)"/g)];
  const base = Number(bars[0][1]);
  const end = Math.max(...bars.map(match=>Number(match[2])));
  const left = 4;
  const scale = (end-left)/(end-base);
  const shift = bars.length*28;
  let index = 0;
  const svg = out.svg.replace(/<g class="ek-bar">([\s\S]*?)<\/g>/g, (_, body: string) => {
    let textIndex = 0;
    const row = body.replace(/<path\b[^>]+\/>/, path => path
      .replace('data-ek-bar=""', `data-ek-bar="" transform="translate(${n2(left-base*scale)} 0) scale(${scale} 1)"`)
      .replace(/data-base="[^"]+"/, `data-base="${left}"`)
      .replace(/data-end="([^"]+)"/, (_, x: string)=>`data-end="${n2(left+(Number(x)-base)*scale)}"`))
      .replace(/<text\b[^>]+>/g, tag => {
        if (textIndex++ === 0) return tag.replace(/x="[^"]+"/, `x="${left}"`).replace('text-anchor="end"','text-anchor="start"').replace(/y="([^"]+)"/, (_, y: string)=>`y="${Number(y)-28}"`);
        return tag.replace(/x="([^"]+)"/, (_, x: string)=>`x="${n2(left+(Number(x)-8-base)*scale+8)}"`);
      });
    return `<g class="ek-bar" transform="translate(0 ${++index*28})">${row}</g>`;
  }).replace(/(<line[^>]*data-ek-baseline[^>]*\/>)([\s\S]*)(<\/svg>)/, (_, line: string, tail: string, close: string) => {
    const baseline = line.replace(/x[12]="[^"]+"/g, attr=>`${attr.slice(0,2)}="${left}"`).replace(/data-ek-(baseline|zero)="[^"]+"/g, (_, key: string)=>`data-ek-${key}="${left}"`).replace(/y1="([^"]+)"/, (_, y: string)=>`y1="${Number(y)+28}"`).replace(/y2="([^"]+)"/, (_, y: string)=>`y2="${Number(y)+shift}"`);
    return `${baseline}<g transform="translate(0 ${shift})">${tail}</g>${close}`;
  });
  const height = out.height+shift;
  return {...out,height,svg:svg.replace(/viewBox="[^"]+"/,`viewBox="0 0 ${out.width} ${height}"`).replace(/height="[^"]+"/,`height="${height}"`).replace(/(<rect x="0" y="0" width="[^"]+" height=")[^"]+("[^>]*>)/,`$1${height}$2`)};
}
export function gameChart(round: GameRound, id: string, theme?: Theme) {
  // The kit requires a table locator. Remove only a duplicated locator from the
  // chart title, leaving the original source and every drawer caption unchanged.
  const tableName = round.source.table?.split(',')[0].trim();
  const title = tableName && round.source.title.endsWith(`: ${tableName}`)
    ? round.source.title.slice(0, -(tableName.length+2)) : round.source.title;
  const source = {...round.source, title, edition: `${budgetYear}${round.source.date ? `. Published ${new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${round.source.date}T00:00:00Z`))}` : ''}`};
  if (round.kind === 'funding' || round.kind === 'reserves') {
    const key = `${id}-amounts`;
    const items = round.kind === 'funding' ? [...round.items].sort((a,b) => Math.abs(b.value)-Math.abs(a.value)) : round.items;
    const set = defineFigures({[key]: {kind:'series',label:round.kind === 'funding' ? 'Funding magnitudes, with add or deduct direction' : 'Non-ringfenced reserve balances',unit:'gbp',dp:0,axis:'category',points:items.map(item=>{
      const value = (round.kind === 'funding' ? Math.abs(item.value) : item.value)*1000;
      return {label:chartLabel(item.label),value,display:{full:formatValue(value,'gbp',0,'short')}};
    }),source}});
    const out = zeroBar({set,figure:key,orientation:'horizontal',diverging:round.kind === 'reserves' && items.some(item=>item.value<0),title:round.kind === 'funding' ? 'Funding by magnitude' : 'Reserves at the start and end of the year',site:'ukcounciltax',mode:theme?{kind:'hex',theme,site:'ukcounciltax'}:{kind:'css'}});
    out.table = tableTwin({caption:out.title!,head:['',set.series(key).label],rows:items.map(item=>[item.label,formatValue((round.kind === 'funding' ? Math.abs(item.value) : item.value)*1000,'gbp',0)]),source:out.caption});
    return {out:round.kind === 'funding' ? labelsAboveBars(out) : out, keys:[key], captionHtml:set.captionHtml(key)};
  }
  if (round.kind !== 'split' && round.kind !== 'bill') throw new Error('Only splits have drawings at this stage');
  const keys = round.items.map((_, index) => `${id}-part-${index}`);
  const records = Object.fromEntries(round.items.map((item, index) => [keys[index], {
    kind: 'value', label: chartLabel(item.label), unit: 'gbp', value: round.kind === 'bill' ? item.value / 100 : item.value * 1000, dp: round.kind === 'bill' ? 2 : 0,
    source,
  }]));
  // The adapter verifies every component is present. Where MHCLG prints a rounding
  // difference, retain both printed figures and its existing note; kit 0.3.0 refuses
  // any unequal money total, so allocate those complete parts without its total option.
  const total = `${id}-total`;
  const exact = round.kind === 'bill' && round.items.reduce((sum,item) => sum + item.value, 0) === round.base;
  if (exact) records[total] = {kind: 'value', label: 'Published Band D area average', unit: 'gbp', value: round.base! / 100, dp: 2, source};
  const set = defineFigures(records);
  const out = waffle({parts: keys, total: exact ? total : undefined, set, size: 'small', site: 'ukcounciltax', mode: theme ? {kind: 'hex', theme, site: 'ukcounciltax'} : {kind: 'css'}, title: round.kind === 'bill' ? 'The published Band D bill split' : round.title.replace('Guess the split: ', '') + "'s published split"});
  if (exact) keys.push(total);
  return {out, keys, captionHtml: set.captionHtml(keys)};
}
export function gameChartPng(slug: string, round: number, theme: Theme) {return `/og/budget/${slug}/round-${round}-${theme}.png`;}
