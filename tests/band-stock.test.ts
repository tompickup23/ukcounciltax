import {describe,it,expect} from 'vitest';
import {bandStock,bandStockFor,stockCount,stockShare,STOCK_BANDS} from '../src/lib/band-stock';
import {loadYear} from '../src/lib/council-tax';

describe('HMRC CTSOP1.1 band stock',()=>{
 it('covers every current English billing authority by GSS and nothing else',()=>{
  expect(Object.keys(bandStock.councils).sort()).toEqual(Object.keys(loadYear('2026-27').authorities).sort());
 });
 it('keeps the printed England row and the pinned edition',()=>{
  expect(bandStock.source.sha256).toBe('a59b842ae151513aef295b5f9bfe61f99dbfe4fd1e3054010a2c6fb14c6628ae');
  expect(bandStock.source.published).toBe('2026-09-24');
  expect(bandStock.england.total).toBe(25936540);
  expect(STOCK_BANDS.map(b=>bandStock.england.counts[b])).toEqual([6121370,5052560,5705800,4074300,2555840,1355350,916160,155180]);
  expect(bandStock.england.bandDAndBelowShare).toBe(80.8);
 });
 it('keeps a suppressed cell unknown, not zero',()=>{
  const city=bandStockFor('E09000001')!;
  expect(city.counts.A).toBeNull();
  expect(city.shares.A).toBeNull();
  expect(city.bandDAndBelowShare).toBeNull();
  expect(stockCount(city.counts.A)).toBe('Fewer than 5');
 });
 it('calculates shares from the printed count and total',()=>{
  const burnley=bandStockFor('E07000117')!;
  expect(burnley.total).toBe(43290);
  expect(burnley.shares.A).toBe(Math.round(25810/43290*1000)/10);
  expect(stockShare(burnley.shares.H,burnley.counts.H)).toBe('Under 0.1%');
 });
});
