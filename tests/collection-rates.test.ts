import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {collection,collectionFor,collectionAmount,collectionRate,collectionYear,collectionYearEnd,collectionPriorYear,collectionSource,shownNotes} from '../src/lib/collection-rates';
import {loadYear} from '../src/lib/council-tax';

const pick=(gss:string)=>{const r=collection.councils[gss];return [r.areaName,r.collectable,r.collected,r.rate,r.olderArrears,r.yearArrears,r.totalArrears];};

describe('MHCLG Table 9a collection rates and arrears',()=>{
 it('joins every current English billing authority by ONS code and nothing else',()=>{
  expect(Object.keys(collection.councils)).toHaveLength(296);
  expect(Object.keys(collection.councils).sort()).toEqual(Object.keys(loadYear('2026-27').authorities).sort());
 });
 it('keeps the pinned edition',()=>{
  expect(collection.source.sha256).toBe('3937351a67bd12418301f97f504a5357566ecf3b6d375076119f1addb44d3d90');
  expect(collection.source.published).toBe('2026-06-24');
  expect(collection.source.revised).toBe('2026-07-31');
  expect(collection.source.year).toBe('2025-26');
 });
 it('keeps the printed England row and named councils',()=>{
  const e=collection.england;
  expect([e.collectable,e.collected,e.rate,e.olderArrears,e.yearArrears,e.totalArrears]).toEqual([44981384,43002543,95.6,5259524,2164414,7423938]);
  expect(pick('E07000117')).toEqual(['Burnley',60689,57102,94.09,11411,4430,15841]);
  expect(pick('E08000032')).toEqual(['Bradford',341368,319318,93.54,27034,23945,50979]);
  expect(pick('E09000020')).toEqual(['Kensington & Chelsea',162752,148366,91.16,18960,14794,33754]);
 });
 it('carries the revision note where the table prints it',()=>{
  expect(shownNotes(collection.councils.E09000020).map(n=>n.id)).toEqual(['[r]']);
  expect(shownNotes(collection.councils.E08000002)).toEqual([]);
 });
 it('formats cells as printed and keeps unknown unknown',()=>{
  expect(collectionRate(95.6)).toBe('95.60%');
  expect(collectionRate(null)).toBe('Not published');
  expect(collectionAmount(15841)).toBe('£15,841 thousand');
  expect(collectionAmount(null)).toBe('Not published');
  expect(collectionFor('E99999999')).toBeNull();
 });
 it('reads year labels and dates from the source, not the template',()=>{
  expect(collectionYear()).toBe('2025/26');
  expect(collectionYearEnd()).toBe('31 March 2026');
  expect(collectionPriorYear()).toBe('2024/25');
  expect(collectionSource().table).toBe('Table 9a (QRC4 lines 1, 4, 5, 20, 23 and 24), 2025 to 2026, revised 31 July 2026');
  const component=readFileSync(join(process.cwd(),'src/components/CollectionRates.astro'),'utf8');
  expect(component).not.toMatch(/20\d\d/);
 });
});

const built=(slug:string)=>join(process.cwd(),'dist/councils',slug,'index.html');
// Runs against a build made after the component last changed; npm test before a build skips it.
const fresh=existsSync(built('burnley'))&&statSync(built('burnley')).mtimeMs>statSync(join(process.cwd(),'src/components/CollectionRates.astro')).mtimeMs;
describe.runIf(fresh)('collection block in the built council page',()=>{
 const section=(slug:string)=>{const html=readFileSync(built(slug),'utf8');const m=/<section[^>]*id="collection"[\s\S]*?<\/section>/.exec(html);return {html,block:m?.[0]??''};};
 it('sits directly after the band mix with the figures, England and the source line',()=>{
  const {html,block}=section('burnley');
  expect(html.indexOf('id="collection"')).toBeGreaterThan(html.indexOf('id="band-mix"'));
  expect(html.slice(html.indexOf('id="band-mix"'),html.indexOf('id="collection"')).match(/<section/g)).toHaveLength(1);
  expect(block).toContain('94.09%');
  expect(block).toContain('95.60%');
  expect(block).toContain('£15,841 thousand');
  expect(block).toContain('£7,423,938 thousand');
  expect(block).toContain('class="source-line"');
  expect(block).toContain('Table 9a');
  expect(block).toContain('published 24 June 2026');
 });
 it('shows the revision note for Kensington and Chelsea',()=>{
  expect(section('kensington-and-chelsea').block).toContain('MHCLG note:');
 });
});
