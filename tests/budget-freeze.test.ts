import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { calculateFreeze, initialFreezeInputs, parsePence, referendumTriggered, money, freezeSummary } from '../src/lib/budget-freeze';
import { freezePilots } from '../src/lib/budget-freeze-data';
import snapshot from '../data/pilots/budget-freeze.json';

const [burnley, blackburn] = freezePilots();
describe('C2 exact arithmetic and refusal cases',()=>{
  it('reproduces independently calculated freeze differences at full precision',()=>{
    expect(calculateFreeze(burnley,initialFreezeInputs(burnley)).remaining).toBe(1680494200n);
    expect(calculateFreeze(blackburn,initialFreezeInputs(blackburn)).remaining).toBe(37492583209n);
  });
  it.each([burnley,blackburn])('$name restores exactly to zero and preserves the source',pilot=>{
    const before=JSON.stringify(pilot);
    const inputs=initialFreezeInputs(pilot,false);
    expect(calculateFreeze(pilot,inputs).remaining).toBe(0n);
    expect(JSON.stringify(pilot)).toBe(before);
  });
  it('closes the Burnley freeze using a matching spending change',()=>{
    const inputs=initialFreezeInputs(burnley);
    inputs.servicePounds.envtot='5512950.58';
    expect(calculateFreeze(burnley,inputs).remaining).toBe(0n);
    inputs.servicePounds.envtot='5512950.57';
    expect(calculateFreeze(burnley,inputs).remaining).toBe(-100n);
  });
  it('applies symmetric tax and spending changes without rounding or score',()=>{
    const up=initialFreezeInputs(blackburn,false);up.ownPounds='2063.96';
    const down=initialFreezeInputs(blackburn,false);down.ownPounds='2061.96';
    expect(calculateFreeze(blackburn,up).remaining).toBe(-382460300n);
    expect(calculateFreeze(blackburn,down).remaining).toBe(382460300n);
    up.servicePounds.envtot='17832001.00';
    expect(calculateFreeze(blackburn,up).spendingChange).toBe(10000n);
  });
  it.each(['',' ','NaN','Infinity','1e3','-1','1.001','1,000','100000000000000'])('refuses malformed currency %j',value=>{
    expect(()=>parsePence(value)).toThrow();
    const inputs=initialFreezeInputs(burnley);inputs.ownPounds=value;
    expect(()=>calculateFreeze(burnley,inputs)).toThrow();
  });
  it('refuses missing, added, duplicated and held inputs and excessive values',()=>{
    const inputs=initialFreezeInputs(burnley);
    delete inputs.servicePounds.envtot;
    expect(()=>calculateFreeze(burnley,inputs)).toThrow();
    const held=initialFreezeInputs(burnley);held.servicePounds.transtot='0';
    expect(()=>calculateFreeze(burnley,held)).toThrow();
    const tooMuch=initialFreezeInputs(burnley);tooMuch.servicePounds.envtot='11362000.01';
    expect(()=>calculateFreeze(burnley,tooMuch)).toThrow();
    const changed=structuredClone(burnley);changed.services.push(changed.services[0]);
    expect(()=>calculateFreeze(changed,initialFreezeInputs(changed))).toThrow();
    expect(()=>calculateFreeze({...burnley,taxBaseHundredths:''},initialFreezeInputs(burnley))).toThrow();
    expect(()=>calculateFreeze({...burnley,year:'2027-28'},initialFreezeInputs(burnley))).toThrow();
  });
  it('holds negative, zero, education and public health groups fixed',()=>{
    for (const pilot of [burnley,blackburn]) for (const s of pilot.services) {
      if (BigInt(s.pence)<=0n || ['edutot','phtot'].includes(s.id)) expect(s.editable).toBe(false);
    }
    expect(burnley.services.find(s=>s.id==='transtot')?.pence).toBe('-34300000');
  });
  it('does not call a sub-penny difference balanced',()=>{
    const pilot={...burnley,taxBaseHundredths:'1'};
    const inputs=initialFreezeInputs(pilot,false);inputs.ownPounds='351.45';
    const result=calculateFreeze(pilot,inputs);
    expect(result.remaining).toBe(-1n);expect(result.status).toBe('surplus');
    expect(money(result.remaining)).toContain('less than £0.01');
  });
  it('exports exact differences with every assumption, source and version',()=>{
    const text=freezeSummary(blackburn,initialFreezeInputs(blackburn),blackburn.sources.map(s=>s.url));
    expect(text).toContain('3749258.3209');expect(text).toContain('User requested scenario');
    expect(text).toContain('budget-freeze 0.1');expect(text).toContain('tax base stays fixed');
    for (const s of blackburn.sources) expect(text).toContain(s.url);
    expect(text).toContain('38246.03 Band D equivalents');
    expect(freezeSummary(burnley,initialFreezeInputs(burnley),[])).toContain('not cleared for public release');
  });
});

describe('year-specific referendum boundaries',()=>{
  it('requires both district conditions, preserving strict pounds and inclusive percent',()=>{
    expect(referendumTriggered('district',10000n,10500n)).toBe(false);
    expect(referendumTriggered('district',10000n,10501n)).toBe(true);
    expect(referendumTriggered('district',20000n,20599n)).toBe(false);
    expect(referendumTriggered('district',20000n,20600n)).toBe(true);
    expect(referendumTriggered('district',34458n,35491n)).toBe(false);
    expect(referendumTriggered('district',34458n,35492n)).toBe(true);
  });
  it('preserves the inclusive social-care percentage and handles penny thresholds',()=>{
    expect(referendumTriggered('ordinary-social-care',200000n,209999n)).toBe(false);
    expect(referendumTriggered('ordinary-social-care',200000n,210000n)).toBe(true);
    expect(referendumTriggered('ordinary-social-care',196493n,206317n)).toBe(false);
    expect(referendumTriggered('ordinary-social-care',196493n,206318n)).toBe(true);
  });
});

describe('pilot source and isolation gates',()=>{
  it('pins only the two reviewed GSS mappings and source bytes',()=>{
    expect(snapshot.pilots.map(p=>p.gss)).toEqual(['E07000117','E06000008']);
    expect(snapshot.rawSources).toHaveLength(7);
    expect(snapshot.referendum.sha256).toHaveLength(64);
    expect(burnley.reconciliation.componentReviewRequired).toBe(true);
    expect(burnley.reconciliation.parishDifferencePence).toBe('-80000');
    expect(blackburn.reconciliation.componentReviewRequired).toBe(false);
    for(const pilot of freezePilots()) {
      expect(pilot.ledger.find(r=>r.id==='ctrtot')!.thousands).toBe(pilot.ledger.find(r=>r.id==='revenuetot')!.thousands + pilot.ledger.filter(r=>['grantinaef','trnsreorg','appressch','appresdsg','appresph','appresoth','appresunall','grantrsg','grantpol','retainnndr','colfunct','othinc'].includes(r.id)).reduce((sum,r)=>sum+r.thousands,0));
    }
  });
  it('keeps pilot pages out of the normal source tree and public sitemap',()=>{
    expect(readFileSync('astro.config.mjs','utf8')).not.toContain('./pilot');
    expect(readFileSync('astro.pilot.config.mjs','utf8')).toContain("srcDir: './pilot'");
    expect(existsSync('src/pages/pilot')).toBe(false);
    if(existsSync('dist/sitemap.xml')) expect(readFileSync('dist/sitemap.xml','utf8')).not.toContain('freeze');
  });
});
