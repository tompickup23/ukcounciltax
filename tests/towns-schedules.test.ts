import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const national = read('data/national/england.json');
const audit = read('docs/towns-research/schedules-audit.json');
// Only the special expense councils audited here; Durham and the City of London are written by scripts/import-towns-schedules.mjs.
const audited = new Set(audit.map((c: any) => c.gss));
const schedules = readdirSync('data/towns/schedules').filter(f => f.endsWith('.json')).map(f => read(`data/towns/schedules/${f}`)).filter((s: any) => audited.has(s.council.gss));
const ratio = (pence: number) => Math.floor((pence * 6 + 4.5) / 9);

describe('council locality schedules', () => {
  it('pins every source hash; raw files are local, as for every importer, and checked when present', () => {
    const register = read('docs/towns-research/schedules-sources.json');
    for (const council of register) {
      for (const source of [...council.sources, ...(council.supplements ?? [])]) {
        expect(source.sha256).toMatch(/^[0-9a-f]{64}$/);
        if (existsSync(source.file)) expect(createHash('sha256').update(readFileSync(source.file)).digest('hex'), source.file).toBe(source.sha256);
        expect(new URL(source.url).hostname).toMatch(/\.gov\.uk$/);
        expect(source.publisher).toBeTruthy();
        expect(source.retrieved).toBe('2026-11-15');
      }
    }
  });

  it('covers exactly the positive special expense councils that have MHCLG parishes', () => {
    const positive = Object.entries(national.components).filter(([, c]: [string, any]) => c.specialExpensesPounds > 0).map(([gss]) => gss);
    expect(positive).toHaveLength(49);
    const cohort = positive.filter(gss => national.parishes.some((p: any) => p.gss === gss));
    expect(cohort).toHaveLength(48);
    expect(audit.map((c: any) => c.gss).sort()).toEqual(cohort.sort());
  });

  it('keeps the known Chorley mistakes unchanged and excludes every inconsistent council', () => {
    const chorley = audit.find((c: any) => c.slug === 'chorley');
    const bretherton = chorley.areas.find((a: any) => a.name === 'Bretherton');
    expect(bretherton.bandDPence).toBe(222472);
    expect(bretherton.bandsPence.A * 9 / 6).toBe(244272);
    const hoghton = chorley.areas.find((a: any) => a.name === 'Hoghton');
    expect(hoghton.checks.bandAMinusRoundedSixNinthsDPence).toBe(-20);
    for (const council of audit.filter((c: any) => c.status === 'inconsistent' || c.status === 'not found')) {
      expect(schedules.some(s => s.council.gss === council.gss), council.slug).toBe(false);
    }
  });

  it('treats band differences within separately rounded charges as rounding, and nothing larger', () => {
    for (const council of audit) for (const area of council.areas) {
      const diff = area.checks.bandAMinusRoundedSixNinthsDPence;
      if (diff === null || Math.abs(diff) <= area.checks.roundingTolerancePence) continue;
      expect(council.status, `${council.slug} ${area.name}`).toBe('inconsistent');
    }
    expect(audit.find((c: any) => c.slug === 'east-riding-of-yorkshire').status).toBe('held with gaps');
    const rushcliffe = audit.find((c: any) => c.slug === 'rushcliffe');
    expect(rushcliffe.status).toBe('inconsistent');
    expect(rushcliffe.discrepancies).toContainEqual({name: 'Stanton-on-the-Wolds', check: 'invalid printed Band A', quote: '£1,727,88'});
    expect(rushcliffe.areas.find((a: any) => a.name === 'Stanton-on-the-Wolds').bandsPence.A).toBeUndefined();
  });

  it('writes schedule files in the shape scripts/import-towns.mjs reads', () => {
    expect(schedules.map((s: any) => s.council.slug).sort()).toEqual(['boston', 'broxtowe', 'south-norfolk']);
    for (const schedule of schedules) {
      expect(schedule.council.gss).toMatch(/^E0[6-9]\d{6}$/);
      expect(schedule.source.sha256).toMatch(/^[0-9a-f]{64}$/);
      for (const area of schedule.areas) {
        expect(['parish', 'unparished']).toContain(area.kind);
        expect(area.kind === 'parish' ? typeof area.mhclgCode : area.mhclgCode).toBe(area.kind === 'parish' ? 'string' : null);
        expect(typeof area.quoted === 'string' || Array.isArray(area.quotedFragments)).toBe(true);
        expect(area.includesCharterTrustee).toBe(false);
      }
    }
  });

  it('reconciles accepted rows using the original national amounts and accounts for every missing code', () => {
    for (const schedule of schedules) {
      const parishes = national.parishes.filter((p: any) => p.gss === schedule.council.gss);
      const majors = national.components[schedule.council.gss].parts.reduce((sum: number, p: any) => sum + p.bandDPence, 0);
      const covered = new Set<string>();
      expect(new Set(schedule.areas.map((a: any) => a.checks.basicPence)).size).toBe(1);
      for (const area of schedule.areas) {
        expect(area.bandDPence).toBe(area.bandsPence.D);
        expect(Math.abs(area.bandsPence.A - ratio(area.bandDPence))).toBeLessThanOrEqual(area.checks.roundingTolerancePence);
        const parish = parishes.find((p: any) => p.code === area.mhclgCode);
        if (area.mhclgCode) {
          expect(parish).toBeTruthy();
          covered.add(area.mhclgCode);
        }
        const charge = parish ? parish.years['2026-27'].bandDPence : 0;
        expect(area.bandDPence).toBe(majors + charge + area.checks.basicPence + area.checks.specialExpensePence);
        expect(area.checks.basicAndExpense).toBe('pass');
      }
      expect(schedule.missingParishes.map((p: any) => p.code).sort()).toEqual(parishes.filter((p: any) => !covered.has(p.code)).map((p: any) => p.code).sort());
    }
    const westminster = audit.find((s: any) => s.slug === 'westminster');
    expect(westminster.areas.find((a: any) => a.name === "Queen's Park").bandDPence).toBe(110016);
    expect(westminster.areas.find((a: any) => a.name === 'Montpelier Square').checks.specialExpensePence).toBe(55085);
    expect(westminster.status).toBe('inconsistent');
    expect(westminster.discrepancies.map((d: any) => d.differencePence)).toEqual([-4472, 4472]);
    expect(audit.find((s: any) => s.slug === 'winchester').discrepancies[0].differencePence).toBe(-483);
  });
});
