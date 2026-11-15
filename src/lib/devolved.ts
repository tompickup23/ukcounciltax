import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {CURRENT_YEAR, percent} from './council-tax';
import {cleanTitle} from './releases';
import type {SourceRef} from './sources';
export interface DevolvedRow {gss:string;slug:string;name:string;bandsPence:Record<string,number>;componentsPounds?:Record<string,number>}
export interface Edition {nation:string;year:string;basis:string;precision:string;table:string;source:{title:string;url:string;fileUrl:string;sha256:string};records:DevolvedRow[]}
export const devolved = JSON.parse(readFileSync(join(process.cwd(),'data/devolved/council-tax.json'),'utf8')) as {retrieved:string;licence:string;editions:Edition[]};
export const nationEditions = (nation:string) => devolved.editions.filter(e=>e.nation===nation).sort((a,b)=>a.year.localeCompare(b.year));
export const nationPath = (nation:string,slug?:string) => `/${nation.toLowerCase()}/${slug ? slug+'/' : ''}`;
/**
 * Each nation's latest edition. Scotland and Wales publish on their own dates,
 * so their pages follow their own latest year, not England's CURRENT_YEAR: on
 * England's levels day the Welsh and Scottish pages stay until their own
 * figures are imported. None may be newer than CURRENT_YEAR.
 */
export function latestEditions(): Edition[] {
  const latest = [...new Set(devolved.editions.map(e=>e.nation))].map(nation=>nationEditions(nation).at(-1)!);
  for (const e of latest) if (e.year > CURRENT_YEAR) throw new Error(`${e.nation} ${e.year} is newer than England's ${CURRENT_YEAR}`);
  return latest;
}
export function devolvedPaths() {return latestEditions().flatMap(e=>[nationPath(e.nation),...e.records.map(r=>nationPath(e.nation,r.slug))]);}

export function devolvedSource(edition: Edition): SourceRef {
  return {publisher: edition.nation === 'Scotland' ? 'Scottish Government' : 'Welsh Government', title: cleanTitle(edition.source.title), url: edition.source.url, table: edition.table, retrieved: devolved.retrieved};
}
export function devolvedChangePercent(current: number, previous: number): string {
  return percent((current-previous)/previous*100);
}
/**
 * The two councils nearest by name in the same nation and year, for onward links.
 * At either end of the alphabet both come from the one side that has councils.
 */
export function nationNeighbours(nation: string, slug: string): DevolvedRow[] {
  const edition = nationEditions(nation).at(-1);
  if (!edition) return [];
  const rows = edition.records.slice().sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
  const index = rows.findIndex(r => r.slug === slug);
  if (index < 0 || rows.length < 3) return [];
  const start = Math.min(Math.max(index - 1, 0), rows.length - 3);
  return rows.slice(start, start + 3).filter(r => r.slug !== slug);
}
