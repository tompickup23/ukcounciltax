/**
 * Record line sources for the English council page (W9, plan section 11.5).
 * Each figure on /councils/<slug>/ carries a short record line; the full
 * reference (publisher, title, table, publication date) is printed once, in the
 * page's Sources block. Every value is read from the data's own source blocks
 * through the same functions the full source lines used, never typed.
 */
import type {SourceEntry} from '../components/PageSources.astro';
import {changeSource, councilTaxSource, tableName, type SourceRef} from './sources';
import {CURRENT_YEAR, PREVIOUS_YEAR, loadYear, yearLabel, type Authority} from './council-tax';
import {national} from './national-data';
import {bandStockFor, bandStockSource} from './band-stock';
import {collectionFor, collectionSource} from './collection-rates';
import {budgetSource, budgetYear} from './budget';
import {parishSource} from './parish-pages';

const year = yearLabel(CURRENT_YEAR);
const previous = yearLabel(PREVIOUS_YEAR);
const levels = (table: string) => `Council tax levels ${year}, ${tableName(table)}`;

interface Inputs {
  gss: string;
  name: string;
  tax: Authority;
  /** The class label and its own share table, from rankings.classFor. */
  rankType: {label: string; ownTable: string};
  county: {name: string; table: string} | null;
  /** The table that holds the England and area type averages, when held. */
  areaTable: string | null;
  hasPosition: boolean;
}

/** The refs each record line on the page uses, and the Sources block entries they point to. */
export function councilPageSources({gss, name, tax, rankType, county, areaTable, hasPosition}: Inputs) {
  const current = loadYear(CURRENT_YEAR);
  const bandTable = current.source.bandTable;
  const bands: SourceRef = {...councilTaxSource(CURRENT_YEAR, bandTable), short: levels(bandTable)};
  const bandsCalc: SourceRef = {...bands, method: 'Divided by 10 and by 12 calculated from it'};
  const previousTable = loadYear(PREVIOUS_YEAR).source.bandTable;
  const change: SourceRef = {...changeSource(PREVIOUS_YEAR, CURRENT_YEAR), short: `Council tax levels ${year}, ${tableName(bandTable)}, and ${previous}, ${tableName(previousTable)}`};
  const area: SourceRef | null = areaTable ? {...councilTaxSource(CURRENT_YEAR, areaTable), short: levels(areaTable)} : null;
  const positionTables = `Table 9 and ${rankType.ownTable.replace('_', ' ')}`;
  const position: SourceRef = {...councilTaxSource(CURRENT_YEAR, positionTables, 'Positions calculated from the published figures: equal figures share a position'), short: `Council tax levels ${year}, ${positionTables}`};
  const own: SourceRef | null = tax.own ? {...councilTaxSource(CURRENT_YEAR, tax.own.table), short: levels(tax.own.table)} : null;
  const countyRef: SourceRef | null = county ? {...councilTaxSource(CURRENT_YEAR, county.table), short: levels(county.table)} : null;
  const historySource = national.sources.history;
  const history: SourceRef = {publisher: historySource.publisher, title: historySource.title, url: historySource.fileUrl, table: 'Area_CT', retrieved: historySource.retrieved, short: 'Band D Council Tax figures, Area_CT'};
  const parishes: SourceRef = {...parishSource, short: 'Town and parish council tax statistics, Parish_Level_Data'};
  const stockBase = bandStockSource();
  const stock: SourceRef | null = bandStockFor(gss) ? {...stockBase, short: 'Council Tax stock of properties, table CTSOP1.1'} : null;
  const collectionBase = collectionSource();
  const collection: SourceRef | null = collectionFor(gss) ? {...collectionBase, short: 'Collection rates for Council Tax, Table 9a'} : null;
  const budgetBase = budgetSource();
  const budget: SourceRef = {...budgetBase, short: `Revenue expenditure and financing, ${budgetYear} budget${budgetBase.table ? `, ${budgetBase.table}` : ''}`};

  const entries: SourceEntry[] = [
    {key: 'council-bands', label: `Published charges by band, ${year}`, method: 'Area averages including average parish precepts, in pounds and pence. The divided by 10 and by 12 columns are our calculation from the yearly charge, rounded to the penny', sources: [bands]},
    {key: 'council-change', label: `Change on ${previous} by band`, method: 'Calculated from two published tables', sources: [change]},
    ...(area ? [{key: 'council-averages', label: `England and area type averages of area Band D, ${year}`, sources: [area]}] : []),
    ...(hasPosition ? [{key: 'council-position', label: `Position of ${name} within ${rankType.label}`, method: 'Positions calculated from the published figures, counted from the lowest: equal figures share a position', sources: [position]}] : []),
    ...(own ? [{key: 'council-own', label: county ? 'Each council\'s own Band D' : 'The council\'s own Band D', sources: countyRef ? [own, countyRef] : [own]}] : []),
    {key: 'council-history', label: 'Band D history', sources: [history]},
    {key: 'council-parishes', label: 'Parish and local precepts', sources: [parishes]},
    ...(stock ? [{key: 'council-stock', label: 'Properties in each band', method: stockBase.method, sources: [stock]}] : []),
    ...(collection ? [{key: 'council-collection', label: 'Collection rates and arrears', sources: [collection]}] : []),
    {key: 'council-budget', label: `Where the money goes, ${budgetYear} budget`, sources: [budget]},
  ];
  return {bands, bandsCalc, change, area, position, own, county: countyRef, history, parishes, stock, collection, budget, entries};
}
