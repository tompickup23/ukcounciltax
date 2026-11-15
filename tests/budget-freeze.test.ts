import {describe,expect,it} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {calculateFreeze,initialFreezeInputs,parsePence,referendumTriggered,money,freezeSummary,inputPounds,FREEZE_MODEL} from '../src/lib/budget-freeze';
import {freezePilots} from '../src/lib/budget-freeze-data';
import snapshot from '../data/pilots/budget-freeze.json';
import manifest from '../data/pilots/budget-freeze-eligibility.json';
import referendum from '../data/pilots/budget-freeze-referendum.json';
const pilots=freezePilots();
const district=pilots.find(p=>p.gss==='E07000011')!;
const blackburn=pilots.find(p=>p.gss==='E06000008')!;

describe('C2 exact arithmetic and refusal cases',()=>{
  it('reproduces independent freeze calculations at full precision',()=>{
    expect(calculateFreeze(blackburn,initialFreezeInputs(blackburn)).remaining).toBe(37492583209n);
    expect(calculateFreeze(district,initialFreezeInputs(district)).remaining).toBe(3374223030n);
  });
  it.each(pilots)('$name restores exactly to zero without changing the source',pilot=>{
    const before=JSON.stringify(pilot);
    expect(calculateFreeze(pilot,initialFreezeInputs(pilot,false)).remaining).toBe(0n);
    expect(calculateFreeze(pilot,initialFreezeInputs(pilot)).remaining.toString()).toBe(pilot.reconciliation.freezeDifferenceUnits);
    expect(JSON.stringify(pilot)).toBe(before);
  });
  it('can balance a whole-penny freeze with an equal spending change',()=>{
    const pilot=pilots.find(p=>p.gss==='E09000007')!;
    const inputs=initialFreezeInputs(pilot);
    const gap=calculateFreeze(pilot,inputs).remaining;
    const service=pilot.services.find(s=>s.editable && BigInt(s.pence)*100n>gap)!;
    expect(gap%100n).toBe(0n);
    inputs.servicePounds[service.id]=inputPounds(BigInt(service.pence)-gap/100n);
    expect(calculateFreeze(pilot,inputs).remaining).toBe(0n);
    inputs.servicePounds[service.id]=inputPounds(BigInt(service.pence)-gap/100n-1n);
    expect(calculateFreeze(pilot,inputs).remaining).toBe(-100n);
  });
  it('applies symmetric tax and spending changes without rounding',()=>{
    const up=initialFreezeInputs(blackburn,false);up.ownPounds='2063.96';
    const down=initialFreezeInputs(blackburn,false);down.ownPounds='2061.96';
    expect(calculateFreeze(blackburn,up).remaining).toBe(-382460300n);
    expect(calculateFreeze(blackburn,down).remaining).toBe(382460300n);
    up.servicePounds.envtot='17832001.00';
    expect(calculateFreeze(blackburn,up).spendingChange).toBe(10000n);
  });
  it.each(['',' ','NaN','Infinity','1e3','-1','1.001','1,000','100000000000000'])('refuses malformed currency %j',value=>{
    expect(()=>parsePence(value)).toThrow();
    const inputs=initialFreezeInputs(district);inputs.ownPounds=value;
    expect(()=>calculateFreeze(district,inputs)).toThrow();
  });
  it('refuses missing, added, duplicated and held inputs and excessive values',()=>{
    const service=district.services.find(s=>s.editable)!;
    const missing=initialFreezeInputs(district);delete missing.servicePounds[service.id];
    expect(()=>calculateFreeze(district,missing)).toThrow();
    const held=initialFreezeInputs(district);held.servicePounds.edutot='0';
    expect(()=>calculateFreeze(district,held)).toThrow();
    const excessive=initialFreezeInputs(district);excessive.servicePounds[service.id]=inputPounds(BigInt(service.pence)*2n+1n);
    expect(()=>calculateFreeze(district,excessive)).toThrow();
    const tax=initialFreezeInputs(district);tax.ownPounds=inputPounds(BigInt(district.ownPence)*2n+1n);
    expect(()=>calculateFreeze(district,tax)).toThrow();
    const duplicate=structuredClone(district);duplicate.services.push(duplicate.services[0]);
    expect(()=>calculateFreeze(duplicate,initialFreezeInputs(duplicate))).toThrow();
    expect(()=>calculateFreeze({...district,taxBaseHundredths:''},initialFreezeInputs(district))).toThrow();
    expect(()=>calculateFreeze({...district,year:'2027-28'},initialFreezeInputs(district))).toThrow();
  });
  it('holds negative, zero, education and public health groups fixed throughout the cohort',()=>{
    for(const pilot of pilots)for(const s of pilot.services) {
      if(BigInt(s.pence)<=0n || ['edutot','phtot'].includes(s.id))expect(s.editable).toBe(false);
    }
  });
  it('keeps exact balance distinct from displayed pennies',()=>{
    const pilot={...district,taxBaseHundredths:'1'};
    const inputs=initialFreezeInputs(pilot,false);inputs.ownPounds=inputPounds(BigInt(pilot.ownPence)+1n);
    const result=calculateFreeze(pilot,inputs);
    expect(result.remaining).toBe(-1n);expect(result.status).toBe('surplus');
    expect(money(result.remaining)).toContain('less than £0.01');
  });
  it('exports full precision, assumptions, sources and model version',()=>{
    const text=freezeSummary(blackburn,initialFreezeInputs(blackburn),blackburn.sources.map(s=>s.url));
    expect(text).toContain('3749258.3209');expect(text).toContain('User requested scenario');
    expect(text).toContain(FREEZE_MODEL);expect(text).toContain('tax base stays fixed');
    for(const s of blackburn.sources)expect(text).toContain(s.url);
    expect(text).toContain('38246.03 Band D equivalents');
  });
});

describe('edition-specific referendum boundaries in exact pence',()=>{
  for(const [key,rule] of Object.entries(referendum.principles)) {
    const id=key as keyof typeof referendum.principles;
    it(`${key} checks one penny under, equal and one penny over the percentage threshold`,()=>{
      const prior=200000n, trigger=prior+prior*BigInt(rule.percentageBasisPoints)/10000n;
      expect(referendumTriggered(id,prior,trigger-1n)).toBe(false);
      expect(referendumTriggered(id,prior,trigger)).toBe(true);
      expect(referendumTriggered(id,prior,trigger+1n)).toBe(true);
    });
  }
  it('district pound threshold is strict and both conditions are required',()=>{
    expect(referendumTriggered('district',10000n,10499n)).toBe(false);
    expect(referendumTriggered('district',10000n,10500n)).toBe(false);
    expect(referendumTriggered('district',10000n,10501n)).toBe(true);
    expect(referendumTriggered('district',10000n,10300n)).toBe(false);
    expect(referendumTriggered('district',20000n,20501n)).toBe(false);
    expect(referendumTriggered('district',20000n,20599n)).toBe(false);
    expect(referendumTriggered('district',20000n,20600n)).toBe(true);
    expect(referendumTriggered('district',20000n,20601n)).toBe(true);
  });
  it('uses the first whole penny above a fractional percentage threshold',()=>{
    // Five per cent of GBP 1731.05 is GBP 86.5525; GBP 1817.61 first triggers.
    expect(referendumTriggered('ordinary-social-care',173105n,181760n)).toBe(false);
    expect(referendumTriggered('ordinary-social-care',173105n,181761n)).toBe(true);
    expect(referendumTriggered('ordinary-social-care',173105n,181762n)).toBe(true);
  });
  it('keeps the strict pound condition when the district percentage is fractional',()=>{
    // Three per cent of GBP 123.45 is GBP 3.7035; the strict GBP 5 condition decides.
    expect(referendumTriggered('district',12345n,12715n)).toBe(false);
    expect(referendumTriggered('district',12345n,12716n)).toBe(false);
    expect(referendumTriggered('district',12345n,12717n)).toBe(false);
    expect(referendumTriggered('district',12345n,12844n)).toBe(false);
    expect(referendumTriggered('district',12345n,12845n)).toBe(false);
    expect(referendumTriggered('district',12345n,12846n)).toBe(true);
  });
  it('refuses an unmapped rule and invalid baselines',()=>{
    expect(()=>referendumTriggered('unknown' as never,100n,200n)).toThrow();
    expect(()=>referendumTriggered('district',0n,200n)).toThrow();
    expect(()=>referendumTriggered('district',100n,-1n)).toThrow();
  });
});

describe('cohort source and isolation gates',()=>{
  it('includes exactly the eligible authorities and their individual GSS mappings',()=>{
    expect(manifest.total).toBe(296);expect(manifest.eligible).toBe(197);
    expect(pilots.map(p=>p.gss)).toEqual(manifest.councils.filter(c=>c.eligible).map(c=>c.gss));
    expect(Object.keys(referendum.byEdition['2026-27']).sort()).toEqual(pilots.map(p=>p.gss).sort());
    expect(snapshot.rawSources).toHaveLength(7);
    expect(snapshot.model).toBe(FREEZE_MODEL);
    for(const pilot of pilots) {
      const entry=manifest.councils.find(c=>c.gss===pilot.gss)!;
      expect(entry.principle?.principle).toBe(pilot.rule);
      expect(entry.reviewedNotes.every(n=>n.decision==='reviewed')).toBe(true);
      for(const key of ['totalDifferencePence','parishDifferencePence'] as const)expect(Math.abs(Number(entry.comparisons[key]))).toBeLessThanOrEqual(50000);
      expect(Math.abs(Number(entry.comparisons.ownDifferencePence))).toBeLessThanOrEqual(100050);
      expect(pilot.ledger.find(r=>r.id==='ctrtot')!.thousands).toBe(pilot.ledger.find(r=>r.id==='revenuetot')!.thousands+pilot.ledger.filter(r=>['grantinaef','trnsreorg','appressch','appresdsg','appresph','appresoth','appresunall','grantrsg','grantpol','retainnndr','colfunct','othinc'].includes(r.id)).reduce((s,r)=>s+r.thousands,0));
    }
  });
  it('retains explicit exclusions, including Burnley and the two special geography checks',()=>{
    expect(manifest.exclusionCounts['missing-return']).toBe(9);
    expect(manifest.exclusionCounts['ra-note-4']).toBe(7);
    const burnley=manifest.councils.find(c=>c.gss==='E07000117')!;
    expect(burnley.eligible).toBe(false);
    expect(burnley.comparisons.parishDifferencePence).toBe('-80000');
    expect(burnley.comparisons.ownDifferencePence).toBe('77400');
    for(const gss of ['E09000001','E06000053'])expect(manifest.councils.find(c=>c.gss===gss)?.comparability.specialCheck).toBeTruthy();
    for(const c of manifest.councils.filter(c=>!c.eligible)){expect(c.reason.length).toBeGreaterThan(20);expect(c.principle).toBeNull();}
  });
  it('maps the eligible named exception and preserves its whole-pound source difference',()=>{
    const bcp=pilots.find(p=>p.gss==='E06000058')!;
    expect(bcp.rule).toBe('exception-6.75');
    expect(bcp.reconciliation.table10IdentityDifferencePence).toBe('-100');
    expect(bcp.ruleLocation).toContain('paragraph 13, printed page 9');
  });
  it('retains both closed total endpoints and maps Trafford individually',()=>{
    for(const gss of ['E06000010','E06000062']) {
      const council=manifest.councils.find(c=>c.gss===gss)!;
      expect(council.comparisons.totalDifferencePence).toBe('-50000');
      expect(council.eligible).toBe(true);
    }
    expect(pilots.find(p=>p.gss==='E08000009')?.rule).toBe('exception-7.5');
    expect(manifest.exclusionCounts).not.toHaveProperty('own-difference');
  });
  it('keeps pilot pages out of the normal source tree and public sitemap',()=>{
    expect(readFileSync('astro.config.mjs','utf8')).not.toContain('./pilot');
    expect(readFileSync('astro.pilot.config.mjs','utf8')).toContain("srcDir: './pilot'");
    expect(existsSync('src/pages/pilot')).toBe(false);
    if(existsSync('dist/sitemap.xml'))expect(readFileSync('dist/sitemap.xml','utf8')).not.toContain('freeze');
  });
});
