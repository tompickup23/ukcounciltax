import {describe, expect, it} from 'vitest';
import {CURRENT_YEAR, loadYear, type YearFile} from '../src/lib/council-tax';
import {classFor, competitionRank, COUNTY_CLASS, isComplete, ordinal, positionCell, positionWords, RANK_CLASSES, rankClass, rankCounties} from '../src/lib/rankings';
const year = loadYear(CURRENT_YEAR);
const ranked = RANK_CLASSES.map(cls => rankClass(year, cls)!);

describe('same class published Band D positions', () => {
  it('holds every complete class and all authorities', () => {
    expect(Object.keys(year.authorities)).toHaveLength(296);
    expect(ranked.map(rows => rows.length)).toEqual([164, 63, 36, 33]);
    for (const cls of [...RANK_CLASSES, COUNTY_CLASS]) expect(isComplete(year, cls)).toBe(true);
    expect(rankCounties(year)).toHaveLength(21);
    expect(classFor('ILB')).toBe(classFor('OLB'));
  });
  it('matches the published extremes and unitary order', () => {
    const [shire, unitary, metro, london] = ranked;
    expect(unitary.filter((_, i) => [0, 1, 61, 62].includes(i)).map(r => [r.name, r.area])).toEqual([
      ['Windsor and Maidenhead', 1952.62], ['Isles of Scilly', 2047.96], ['Nottingham', 2755.39], ['Dorset', 2765.02],
    ]);
    expect([...unitary].sort((a,b) => a.own-b.own).filter((_,i)=>i===0||i===62).map(r=>[r.name,r.own])).toEqual([['Windsor and Maidenhead',1526.63],['Nottingham',2342.08]]);
    expect([shire, metro, london].map(rows => [rows[0].name, rows[0].area, rows.at(-1)!.name, rows.at(-1)!.area])).toEqual([
      ['Basingstoke and Deane',2255.21,'Lewes',2756.17], ['Dudley',2144.84,'Gateshead',2715.81], ['Wandsworth',1028.21,'Kingston upon Thames',2609.2],
    ]);
    expect(shire.at(-1)!.areaNotes.map(n=>n.id)).toContain('ad');
    const counties=rankCounties(year)!;
    expect([counties[0].name,counties[0].own,counties.at(-1)!.name,counties.at(-1)!.own]).toEqual(['Essex',1641.96,'Oxfordshire',2006.78]);
    expect(counties.find(r=>r.name==='Lancashire')).toMatchObject({ownPosition:12,own:1801.75});
  });
  it('preserves the only tie, skips the next position and sorts names', () => {
    expect(ranked.flat().filter(r=>r.areaTied||r.ownTied).map(r=>[r.name,r.areaPosition,r.ownPosition])).toEqual([['Havant',21,116],['Rushmoor',21,116]]);
    expect(ranked[0][22].areaPosition).toBe(23);
    expect(competitionRank([3,1,1,2])).toEqual([{position:4,tied:false},{position:1,tied:true},{position:1,tied:true},{position:3,tied:false}]);
    expect(competitionRank([1.001,1.002]).map(r=>r.position)).toEqual([1,2]);
  });
  it('matches every profile anchor', () => {
    for (const [name,areaPosition,ownPosition] of [['Burnley',130,160],['Lancaster',116,138],['Lewes',164,107],['Manchester',10,6],['Camden',20,20],['City of London',3,4],['Dorset',63,58]] as const) {
      expect(ranked.flat().find(r=>r.name===name)).toMatchObject({areaPosition,ownPosition});
    }
  });
  it('suppresses an incomplete class without mutating the source', () => {
    const fixture=structuredClone(year);
    (fixture.authorities.E07000117.bands as Record<string,number|null>).D=null;
    expect(isComplete(fixture,RANK_CLASSES[0])).toBe(false);
    expect(rankClass(fixture,RANK_CLASSES[0])).toBeNull();
    const missing=structuredClone(year); delete missing.authorities.E07000117;
    expect(isComplete(missing,COUNTY_CLASS)).toBe(false);
    const county=structuredClone(year); county.counties.E10000003.bandD=null;
    expect(rankCounties(county as YearFile)).toBeNull();
  });
  it('prints ordinal and tied positions', () => {
    expect([1,2,3,4,11,12,13,21,22,23,101,111,112,113,164].map(ordinal)).toEqual(['1st','2nd','3rd','4th','11th','12th','13th','21st','22nd','23rd','101st','111th','112th','113th','164th']);
    expect(positionWords(21,true)).toBe('joint 21st'); expect(positionWords(130,false)).toBe('130th');
    expect(positionCell(21,true)).toBe('21='); expect(positionCell(130,false)).toBe('130');
  });
});
