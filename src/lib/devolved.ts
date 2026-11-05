import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {CURRENT_YEAR} from './council-tax';
export interface DevolvedRow {gss:string;slug:string;name:string;bandsPence:Record<string,number>;componentsPounds?:Record<string,number>}
export interface Edition {nation:string;year:string;basis:string;precision:string;table:string;source:{title:string;url:string;fileUrl:string;sha256:string};records:DevolvedRow[]}
export const devolved = JSON.parse(readFileSync(join(process.cwd(),'data/devolved/council-tax.json'),'utf8')) as {retrieved:string;licence:string;editions:Edition[]};
export const nationEditions = (nation:string) => devolved.editions.filter(e=>e.nation===nation).sort((a,b)=>a.year.localeCompare(b.year));
export const nationPath = (nation:string,slug?:string) => `/${nation.toLowerCase()}/${slug ? slug+'/' : ''}`;
export function devolvedPaths() {return devolved.editions.filter(e=>e.year===CURRENT_YEAR).flatMap(e=>[nationPath(e.nation),...e.records.map(r=>nationPath(e.nation,r.slug))]);}
