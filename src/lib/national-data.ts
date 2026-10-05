import {readFileSync} from 'node:fs';
import {join} from 'node:path';
export interface NationalSource {publisher:string;title:string;url:string;fileUrl:string;sha256:string;retrieved:string;tables:string[];precision:string;licence:string}
export interface SourceNote {id:string;text:string}
export interface ParishYear {bandDPence:number|null;preceptPounds:number|null;taxBase:number|null;status:'published'|'not-existing'|'unavailable'}
export interface Parish {code:string;gss:string;name:string;type:string;notes:SourceNote[];years:Record<string,ParishYear>}
export interface NationalComponents {ownWithParishPence:number|null;ownExcludingParishPence:number|null;areaPence:number|null;parts:{kind:'county'|'police'|'fire'|'combined';name:string|null;code:string|null;bandDPence:number|null}[];differencePence:number|null;specialExpensesPounds:number|null;taxBase:number|null;notes:SourceNote[]}
export interface HistoricalSeries {notes:string;values:Record<string,number|null>}
export interface NationalData {schemaVersion:number;year:string;sources:Record<'parishes'|'components'|'history',NationalSource>;parishes:Parish[];parishNotes:Record<string,string>;parishChanges:string[][];historyNotes:string[][];components:Record<string,NationalComponents>;history:Record<string,Record<'area'|'ownExcludingParish'|'ownIncludingParish',HistoricalSeries>>}
export const national=JSON.parse(readFileSync(join(process.cwd(),'data/national/england.json'),'utf8')) as NationalData;
const parishIndex=new Map<string,Parish[]>();
for(const parish of national.parishes){const rows=parishIndex.get(parish.gss)??[];rows.push(parish);parishIndex.set(parish.gss,rows);}
export const parishesFor=(gss:string)=>parishIndex.get(gss)??[];
/** Source supplies this comparison on the same row; no historical name join. */
export function parishChange(parish:Parish):number|null {
 const a=parish.years['2025-26'], b=parish.years['2026-27'];
 return a.status==='published'&&b.status==='published'&&a.bandDPence!==null&&b.bandDPence!==null?b.bandDPence-a.bandDPence:null;
}
