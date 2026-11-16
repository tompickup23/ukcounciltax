/**
 * The Estate Kit position strip for the towns pages: every full Band D in a scope
 * as one distribution, with the area with the largest tax base as the
 * marked point (the kit compares only one edition, so MHCLG's Table 7 average cannot
 * be marked on this class). Its own figure set, so the site set stays small; the
 * strip draws five numbers, not one mark per row, so the page stays light.
 */
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {Resvg} from '@resvg/resvg-js';
import {defineFigures, positionStrip, tokens, type FigureSet, type PositionStripOptions, type Theme} from '../vendor/estate-kit/dist/src/index.js';
import {longDate} from './sources';
import {rankTowns} from './towns';
import {englandScope, regionScopes, countyScopes, placeLabel, scopeIn, townSources, townsYear, type TownScope} from './towns-pages';

/** The kit refuses a class of fewer than ten members (MIN_CLASS). */
export const STRIP_MIN = 10;

export const stripScopes = (): TownScope[] => [englandScope(), ...regionScopes(), ...countyScopes()].filter(scope => rankTowns(scope.rows).length >= STRIP_MIN);
export const stripName = (scope: TownScope) => scope.kind === 'england' ? 'england' : `${scope.kind}-${scope.slug}`;
export const stripPngPath = (scope: TownScope) => `/og/charts/towns/${stripName(scope)}-light.png`;
const seriesKey = (scope: TownScope) => `towns.${stripName(scope)}.full_bandd`;
const focusKey = (scope: TownScope) => `towns.${stripName(scope)}.largest`;

/** The marked point: the area with the largest tax base among those with a figure. */
export function stripFocus(scope: TownScope) {
  const ranked = rankTowns(scope.rows).filter(r => r.town.taxBase !== null);
  return ranked.reduce((best, r) => (r.town.taxBase! > best.town.taxBase! ? r : best), ranked[0]);
}

let cached: FigureSet | undefined;
export function townFigures(): FigureSet {
  if (cached) return cached;
  const full = {publisher: 'MHCLG', title: townSources.components.title, table: 'Table 10 Data_Billing and Parish_Level_Data', edition: `retrieved ${longDate(townSources.components.retrieved)}`, url: townSources.components.url};
  const records: Record<string, unknown> = {};
  for (const scope of stripScopes()) {
    const focus = stripFocus(scope);
    records[focusKey(scope)] = {
      kind: 'value', label: `Full Band D, ${placeLabel(focus.town)}, ${townsYear}`, name: placeLabel(focus.town),
      value: focus.town.fullBandDPence / 100, unit: 'gbp', dp: 2, source: full,
    };
    records[seriesKey(scope)] = {
      kind: 'series', axis: 'category', label: `Full Band D by parish and unparished area ${scopeIn(scope)}, ${townsYear}`,
      unit: 'gbp', dp: 2, source: full,
      note: 'Calculated from published figures; council schedules where the council publishes its own figure.',
      points: rankTowns(scope.rows).map(r => ({label: r.town.code, value: r.town.fullBandDPence / 100})),
    };
  }
  cached = defineFigures(records);
  return cached;
}

export function stripOptions(scope: TownScope): PositionStripOptions {
  const n = rankTowns(scope.rows).length;
  return {
    set: townFigures(), figure: focusKey(scope), distribution: seriesKey(scope), place: stripFocus(scope).town.code,
    classLabel: 'parish and unparished areas',
    basis: 'Full Band D, including the parish precept; the marked area has the largest tax base (for an unparished area, the tax base of the council less that of its parishes)',
    title: `Full Band D across ${n.toLocaleString('en-GB')} parish and unparished areas ${scopeIn(scope)}, ${townsYear}`,
  };
}

export const stripKeys = (scope: TownScope) => [focusKey(scope), seriesKey(scope)];

const FONT_DIR = join(process.cwd(), 'src', 'vendor', 'estate-kit', 'fonts');
/** One strip as a light PNG at twice its drawn width, source line included. */
export function stripPng(scope: TownScope, theme: Theme = 'light'): Buffer {
  const out = positionStrip({...stripOptions(scope), mode: {kind: 'hex', theme, site: 'ukcounciltax'}});
  const fontFiles = readdirSync(FONT_DIR).filter(f => f.endsWith('.ttf')).map(f => join(FONT_DIR, f));
  const svg = new Resvg(out.svg, {fitTo: {mode: 'width', value: out.width * 2}, font: {fontFiles, loadSystemFonts: false, defaultFontFamily: tokens.font.sans.family}});
  return svg.render().asPng();
}
