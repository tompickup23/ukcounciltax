/** The scenario takes the same source arrays as the observed game, never a second selection. */
import {budget, budgetFor, budgetSource} from './budget';
import {national} from './national-data';
import {BUDGET_SCENARIO_MODEL} from './budget-scenario';
import type {GameData, GameRound, GameSource} from './budget-game';

export interface ScenarioScreen {
  roundIndex: number;
  kind: 'split' | 'bill';
  title: string;
  stop: string;
  name: string;
  totalPence: number;
  items: {label:string; publishedPence:number; detail:string}[];
  round: GameRound;
  sourceDetail: string;
}
export interface ScenarioData {
  model: typeof BUDGET_SCENARIO_MODEL;
  name: string;
  year: string;
  screens: ScenarioScreen[];
  sources: {key:string; source:GameSource; sha256:string}[];
  fundingContext: {items:GameRound['items']; notes:string[]; source:GameSource} | null;
}
export function scenarioData(game: GameData | null, gss: string, name: string): ScenarioData | null {
  if (!game) return null;
  const {council,county} = budgetFor(gss);
  const countyPart = national.components[gss].parts.find(part=>part.kind==='county' && part.code===council.countyCode);
  let splitIndex=0;
  const screens: ScenarioScreen[] = game.rounds.flatMap((round,roundIndex)=>{
    if (round.kind !== 'split' && round.kind !== 'bill') return [];
    const isCounty = round.kind === 'split' && splitIndex++ > 0;
    if (isCounty && (!county || !countyPart?.name)) throw new Error(`Missing county join: ${gss}`);
    const bodyName = isCounty ? `${countyPart!.name} County Council` : name;
    const totalPence = round.base!*(round.kind === 'bill' ? 1 : 100_000);
    if (!Number.isSafeInteger(totalPence*100) || totalPence<=0 || round.items.length<2 || round.items.length>12) throw new Error(`Unsafe scenario source: ${gss}`);
    const body = isCounty ? county! : council;
    return [{roundIndex,kind:round.kind,title:round.kind === 'bill' ? 'Band D split' : `${bodyName} services${isCounty ? ', whole county council area' : ''}`,stop:round.kind === 'bill' ? 'Band D split' : isCounty ? 'County services' : 'Council services',name:bodyName,totalPence,
      items:round.items.map(item=>({label:item.label,publishedPence:item.value*(round.kind === 'bill' ? 1 : 100_000),detail:item.detail})),round,
      sourceDetail:round.kind === 'split' ? `RA return body name: ${body.name}.` : 'Published Table 10 charging bodies, including average parish precepts in the council line.',
    }];
  });
  const funding = game.rounds.find(round=>round.kind==='funding')!;
  const note4 = council.notes.raPart1.includes('[note 4]');
  const note8 = council.notes.raPart1.includes('[note 8]');
  return {model:BUDGET_SCENARIO_MODEL,name,year:game.year,screens,
    sources:[...(['raPart1','raPart2','raGrants'] as const).map(key=>({key,source:budgetSource(key),sha256:budget.sources[key].sha256})),{key:'components',source:game.rounds.find(round=>round.kind==='bill')!.source,sha256:national.sources.components.sha256}],
    fundingContext:note4 || note8 ? {items:funding.items.filter(item=>note8 || item.label==='Council tax requirement'),notes:funding.notes.filter(note=>note.includes('MHCLG [note 8]')),source:funding.source} : null,
  };
}
