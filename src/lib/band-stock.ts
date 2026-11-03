import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {SourceRef} from './sources';
export const STOCK_BANDS=['A','B','C','D','E','F','G','H'] as const;
export type StockBand=typeof STOCK_BANDS[number];
/** Counts as printed by HMRC, rounded to 10; null is a [c] cell (fewer than five), never zero. */
export interface BandStockRecord {areaName:string;baCode:string;counts:Record<StockBand,number|null>;total:number;shares:Record<StockBand,number|null>;bandDAndBelowShare:number|null}
export interface BandStockSource {publisher:string;title:string;edition:string;published:string;snapshot:string;url:string;fileUrl:string;file:string;member:string;sha256:string;retrieved:string;tables:string[];precision:string;licence:string}
export interface BandStockData {schemaVersion:number;source:BandStockSource;england:BandStockRecord;councils:Record<string,BandStockRecord>}
export const bandStock=JSON.parse(readFileSync(join(process.cwd(),'data/national/band-stock.json'),'utf8')) as BandStockData;
export const bandStockFor=(gss:string)=>bandStock.councils[gss]??null;
export const bandStockSource=():SourceRef=>({
 publisher:bandStock.source.publisher,
 title:bandStock.source.title,
 url:bandStock.source.url,
 table:'table CTSOP1.1, properties on the valuation list at 31 March 2026, 2026 edition',
 date:bandStock.source.published,
 method:'Shares calculated by UK Council Tax from the printed counts',
});
const count=new Intl.NumberFormat('en-GB');
export const stockCount=(n:number|null)=>n===null?'Fewer than 5':count.format(n);
/** A share to one decimal place; a printed count that rounds below 0.1% says so rather than showing 0.0%. */
export const stockShare=(share:number|null,n:number|null)=>share===null?'Not published':share===0&&n?'Under 0.1%':`${share.toFixed(1)}%`;
