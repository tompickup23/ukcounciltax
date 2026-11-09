import {allocatePence,scenarioShares} from '../src/lib/budget-scenario';
import {scenarioData} from '../src/lib/budget-game-scenario-data';
import { test, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { budget, services } from "../src/lib/budget";
import { gameData } from "../src/lib/budget-game-data";
import { national } from "../src/lib/national-data";
import { loadYear, CURRENT_YEAR } from "../src/lib/council-tax";
import { loadRegistry } from "../src/lib/registry";

const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
test("matches every binding C1b dry run anchor and file hash", () => {
  const year = loadYear(CURRENT_YEAR);
  const reg = loadRegistry();
  const billing = Object.keys(year.authorities);
  const all = Object.entries(budget.councils);
  const available = all.filter(([, c]) => c.status === "available");
  const billingAvailable = billing.filter((g) => budget.councils[g]?.status === "available");
  const missing = Object.fromEntries(billing.filter((g) => budget.councils[g]?.status !== "available").map((g) => [g, year.authorities[g].name]));
  const countyOf = billingAvailable.map((g) => budget.councils[g].countyCode).filter(Boolean) as string[];
  const negative = available.filter(([, c]) => services(c).some((r) => r.value !== null && r.value < 0)).length;
  const displayNameDifferences = billingAvailable.filter((g) => budget.councils[g].name !== year.authorities[g].name).length;
  const note = (n: string) => available.filter(([, c]) => c.notes.raPart1.includes(n)).map(([g]) => g);

  // Every available billing council, as the A6 game builds it.
  let maxSplitParts = 0, rounds: Record<string, number> = {}, billParts: Record<string, number> = {}, maxBasePence = 0;
  const problems: string[] = [];
  for (const g of billingAvailable) {
    const reg1 = reg.councils[g];
    const d = gameData(g, reg1.slug, year.authorities[g].name)!;
    rounds[d.rounds.length] = (rounds[d.rounds.length] ?? 0) + 1;
    for (const r of d.rounds.filter((r) => r.kind === "split")) {
      maxSplitParts = Math.max(maxSplitParts, r.items.length);
      if (r.items.length < 2 || r.base! <= 0) problems.push(`${g} split`);
      maxBasePence = Math.max(maxBasePence, r.base! * 100_000);
    }
    const bill = d.rounds.find((r) => r.kind === "bill")!;
    billParts[bill.items.length] = (billParts[bill.items.length] ?? 0) + 1;
    if (bill.items.reduce((s, i) => s + i.value, 0) !== bill.base) problems.push(`${g} bill does not reconcile`);
  }
  const positiveBase = (g: string) => services(budget.councils[g]).filter((r) => r.value !== null && r.value > 0).reduce((s, r) => s + r.value!, 0);
  const anchorIds = ["servicetot", "revenuetot", "ctrtot", "edutot", "eduspc", "asctot", "csctot", "transtot", "grantindsg", "resoth_strt", "resoth_end", "resunall_strt", "resunall_end"];
  const anchors = Object.fromEntries(["E07000117", "E08000025", "E09000033", "E10000017"].map((g) => [g, Object.fromEntries(anchorIds.map((k) => [k, budget.councils[g].values[k]]))]));

  const burnleyServices = allocatePence(positiveBase("E07000117") * 100_000, [60, 40, 0, 0, 0]);
  const burnleyBill = allocatePence(national.components.E07000117.areaPence!, [60, 40, 0, 0]);
  const lancsCounty = allocatePence(positiveBase("E10000017") * 100_000, [50, 50, 0, 0, 0, 0, 0, 0, 0]);
  const out = {
    checkedAt: "2026-11-09",
    budgetSha256: sha("data/national/budget.json"),
    nationalSha256: sha("data/national/england.json"),
    fixtureSha256: sha("tests/fixtures/budget-ct-reconciliation.json"),
    rawSha256: Object.fromEntries(["RA_2026-27_data_Part_1.ods", "RA_2026-27_data_Part_2.ods", "SG_2026-27.ods"].map((f) => [f, sha(`data/raw/${f}`)])),
    retained: all.length,
    available: available.length,
    billingAvailable: billingAvailable.length,
    countySections: countyOf.length,
    countyBodies: new Set(countyOf).size,
    negativeServiceBodies: negative,
    displayNameDifferences,
    note4: note("[note 4]"),
    note8: note("[note 8]"),
    missing,
    roundsPerGame: rounds,
    maxSplitParts,
    billRoundParts: billParts,
    largestServiceBasePence: maxBasePence,
    largestServiceBaseTimes100IsSafe: Number.isSafeInteger(maxBasePence * 100),
    problems,
    anchors,
    scenarioPositiveBaseThousands: Object.fromEntries(["E08000025", "E07000117", "E10000017", "E09000033"].map((g) => [g, positiveBase(g)])),
    scenarioTestCases: {
      burnleyServices60_40: burnleyServices,
      burnleyBandD60_40: burnleyBill,
      lancashireCounty50_50: lancsCounty,
      onePennyTie50_50: allocatePence(1, [50, 50]),
    },
  };
  expect(problems).toEqual([]);
  const {base: _base, ...receipt} = JSON.parse(readFileSync("docs/C1B-DATA-DRY-RUN.json", "utf8"));
  expect(out).toEqual(receipt);
});


test('allocates integer pennies with source order ties and rejects every invalid boundary',()=>{
  expect(allocatePence(1,[50,50])).toEqual([1,0]);
  expect(allocatePence(2,[25,25,25,25])).toEqual([1,1,0,0]);
  expect(allocatePence(254942,[0,100,0,0])).toEqual([0,254942,0,0]);
  const bound=Math.floor(Number.MAX_SAFE_INTEGER/100);
  expect(allocatePence(bound,[100])).toEqual([bound]);
  for(const total of [0,-1,0.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])expect(()=>allocatePence(total,[100])).toThrow();
  expect(()=>allocatePence(Number.MAX_SAFE_INTEGER,[100])).toThrow('safe integer');
  for(const shares of [[],[0,0],[99],[101],[-1,101],[0.5,99.5],[NaN,100],[Infinity,0],Array(2)])expect(()=>allocatePence(100,shares)).toThrow();
  expect(()=>allocatePence(100,['' as unknown as number,100])).toThrow();
  for(const values of [['','100'],['NaN','100'],['Infinity','0'],['1.5','98.5'],['-1','101'],['101','0']])expect(()=>scenarioShares(values,2)).toThrow();
  expect(()=>scenarioShares(['100'],2)).toThrow('every source item');
  expect(scenarioShares(['60','40'],2)).toEqual([60,40]);
});

test('adapts only the existing split arrays, retains provenance and leaves observations unchanged',()=>{
  const year=loadYear(CURRENT_YEAR),registry=loadRegistry();
  const budgetBefore=JSON.stringify(budget),nationalBefore=JSON.stringify(national);
  let count=0,counties=0,notes4=0,notes8=0;
  for(const [gss,tax] of Object.entries(year.authorities)) {
    const game=gameData(gss,registry.councils[gss].slug,tax.name);
    const before=JSON.stringify(game);
    const data=scenarioData(game,gss,tax.name);
    if(!game){expect(data).toBeNull();continue;}
    count++;
    const sourceRounds=game.rounds.filter(round=>round.kind==='split'||round.kind==='bill');
    expect(data!.screens).toHaveLength(sourceRounds.length);
    expect(data!.model).toBe('budget-scenario 1.0');
    expect(data!.sources.map(source=>source.key)).toEqual(['raPart1','raPart2','raGrants','components']);
    for(const source of data!.sources){expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);expect(source.source.date).toBeTruthy();expect(source.source.url).toMatch(/^https:/);}
    data!.screens.forEach((screen,index)=>{
      const source=sourceRounds[index];
      expect(screen.round).toBe(source);
      expect(screen.items.map(item=>item.label)).toEqual(source.items.map(item=>item.label));
      expect(screen.items.map(item=>item.publishedPence)).toEqual(source.items.map(item=>item.value*(source.kind==='bill'?1:100000)));
      expect(screen.totalPence).toBe(source.base!*(source.kind==='bill'?1:100000));
      expect(allocatePence(screen.totalPence,[100,...screen.items.slice(1).map(()=>0)])).toEqual([screen.totalPence,...screen.items.slice(1).map(()=>0)]);
      if(screen.stop==='County services'){counties++;expect(screen.title).toContain('whole county council area');}
    });
    const source=budget.councils[gss];
    if(source.notes.raPart1.includes('[note 4]')){notes4++;expect(data!.fundingContext!.items.find(item=>item.label==='Council tax requirement')!.detail).toContain(budget.sourceNotes.raPart1['[note 4]']);}
    if(source.notes.raPart1.includes('[note 8]')){notes8++;expect(data!.fundingContext!.notes.join(' ')).toContain(budget.sourceNotes.raPart1['[note 8]']);}
    expect(JSON.stringify(game)).toBe(before);
  }
  expect([count,counties,notes4,notes8]).toEqual([287,160,7,2]);
  expect(JSON.stringify(budget)).toBe(budgetBefore);expect(JSON.stringify(national)).toBe(nationalBefore);
});


test.skipIf(!existsSync('dist/tools/budget/burnley/index.html'))('keeps every static page number unchanged before interaction',async()=>{
  const {staticGameNumbers}=await import('../scripts/lib/budget-game.mjs');
  const before=JSON.parse(readFileSync('tests/fixtures/c1b-static-numbers.json','utf8'));
  for(const slug of ['burnley','birmingham','coventry'])expect(staticGameNumbers(readFileSync(`dist/tools/budget/${slug}/index.html`,'utf8')),slug).toEqual(before[slug]);
});


test('retains the positive headings, net income and printed zero anchors',()=>{
  const ids=['E07000117','E08000025','E10000017','E09000033'];
  expect(ids.map(gss=>services(budget.councils[gss]).filter(row=>row.value!==null&&row.value>0).length)).toEqual([5,9,9,9]);
  expect(ids.map(gss=>budget.councils[gss].values.servicetot)).toEqual([17246,2700482,2759432,552973]);
  expect(services(budget.councils.E07000117).filter(row=>row.value!==null&&row.value<0).map(row=>row.value)).toEqual([-343,-426]);
  expect(services(budget.councils.E08000025).filter(row=>row.value!==null&&row.value<0).map(row=>row.value)).toEqual([-3212]);
  const game=gameData('E07000117','burnley','Burnley')!;
  const bill=game.rounds.find(round=>round.kind==='bill')!;
  expect(bill.base).toBe(254942);expect(bill.items.map(item=>item.value)).toEqual([36054,180175,29240,9473]);
  expect(bill.notes.join(' ')).toContain('0');
});
