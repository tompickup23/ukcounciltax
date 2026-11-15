import {readFileSync} from 'node:fs';
import {CURRENT_YEAR,precedingYear} from './council-tax';
import {nationalPath} from './edition.mjs';
export interface NationalSource {publisher:string;title:string;url:string;fileUrl:string;sha256:string;retrieved:string;tables:string[];precision:string;licence:string}
export interface SourceNote {id:string;text:string}
export interface ParishYear {bandDPence:number|null;preceptPounds:number|null;taxBase:number|null;status:'published'|'not-existing'|'unavailable'}
export interface Parish {code:string;gss:string;name:string;type:string;notes:SourceNote[];years:Record<string,ParishYear>}
export interface NationalComponents {ownWithParishPence:number|null;ownExcludingParishPence:number|null;areaPence:number|null;parts:{kind:'county'|'police'|'fire'|'combined';name:string|null;code:string|null;bandDPence:number|null}[];differencePence:number|null;specialExpensesPounds:number|null;taxBase:number|null;notes:SourceNote[]}
export interface HistoricalSeries {notes:string;values:Record<string,number|null>}
export interface NationalData {schemaVersion:number;year:string;sources:Record<'parishes'|'components'|'history',NationalSource>;parishes:Parish[];parishNotes:Record<string,string>;parishChanges:string[][];historyNotes:string[][];components:Record<string,NationalComponents>;history:Record<string,Record<'area'|'ownExcludingParish'|'ownIncludingParish',HistoricalSeries>>}
const nationalCache=new Map<string,NationalData>();
/**
 * The Table 10 import for a year (src/lib/edition.mjs decides which file that
 * is). The council tax pages read CURRENT_YEAR's; the budget pages read their
 * own edition's, so they stay on the launch year after the switch until the next RA.
 */
export function nationalFor(year:string):NationalData {
 const path=nationalPath(year);
 if(!path)throw new Error(`No Table 10 import for ${year} under data/national`);
 if(!nationalCache.has(path))nationalCache.set(path,JSON.parse(readFileSync(path,'utf8')) as NationalData);
 return nationalCache.get(path)!;
}
export const national=nationalFor(CURRENT_YEAR);
/**
 * The year of the parish return held, which is published separately from the
 * levels tables and can lag them: "Council Tax statistics for town and parish
 * councils in England: <start> to <end>" names it. Parish figures are labelled
 * with this year, never with CURRENT_YEAR.
 */
export function parishYearOf(data:NationalData):string {
 const match=/(\d{4}) to (\d{4})\s*$/.exec(data.sources.parishes.title);
 if(!match)throw new Error(`Parish source title names no year: ${data.sources.parishes.title}`);
 return `${match[1]}-${match[2].slice(2)}`;
}
export const PARISH_YEAR=parishYearOf(national);
const parishIndex=new Map<string,Parish[]>();
for(const parish of national.parishes){const rows=parishIndex.get(parish.gss)??[];rows.push(parish);parishIndex.set(parish.gss,rows);}
export const parishesFor=(gss:string)=>parishIndex.get(gss)??[];
/** Source supplies this comparison on the same row; no historical name join. */
export function parishChange(parish:Parish):number|null {
 const a=parish.years[precedingYear(PARISH_YEAR)], b=parish.years[PARISH_YEAR];
 return a.status==='published'&&b.status==='published'&&a.bandDPence!==null&&b.bandDPence!==null?b.bandDPence-a.bandDPence:null;
}
