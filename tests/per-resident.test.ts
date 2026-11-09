import {describe, expect, it} from 'vitest';
import {budget} from '../src/lib/budget';
import {perResident, perResidentFor, AGE_IDS, population, BOUNDARY_REASON, NO_RETURN_REASON, DISTRICT_REASON} from '../src/lib/per-resident';

describe('Social care spend per resident', () => {
  it('has exactly 146 eligible councils and seven explained social care exclusions', () => {
    expect(Object.values(perResident).filter(row => row.ratios)).toHaveLength(146);
    const excluded = Object.entries(perResident).filter(([code, row]) => budget.councils[code].class !== 'SD' && !row.ratios);
    expect(Object.fromEntries(excluded.map(([code, row]) => [code, row.reason]))).toEqual({
      E08000026: NO_RETURN_REASON, E06000063: NO_RETURN_REASON, E08000027: NO_RETURN_REASON,
      E09000011: NO_RETURN_REASON, E06000025: NO_RETURN_REASON,
      E08000038: BOUNDARY_REASON, E08000039: BOUNDARY_REASON,
    });
  });
  it('excludes every shire district regardless of its printed social care values', () => {
    const districts = Object.entries(budget.councils).filter(([, c]) => c.class === 'SD');
    expect(districts).toHaveLength(164);
    for (const [code] of districts) {
      expect(perResident[code].ratios, code).toBeNull();
      expect(perResident[code].reason, code).toBe(DISTRICT_REASON);
    }
    const zeroValues = Object.fromEntries(Object.keys(budget.councils.E08000025.values).map(id => [id, 0]));
    const zeroCouncil = {...budget.councils.E08000025, values: zeroValues};
    expect(perResidentFor('E08000025', zeroCouncil).ratios?.adult.value).toBe(0);
    expect(perResidentFor('E08000025', zeroCouncil).unattributed?.share).toBeNull();
    expect(perResidentFor('E08000025', {...budget.councils.E08000025, class: 'SD'}).ratios).toBeNull();
  });
  it('matches every source notes ratio anchor to the cent', () => {
    const anchors = {E08000025: [641.04, 348.12, 1143.76, 1449.70], E09000033: [614.80, 205.59, 2204.72, 2038.12], E10000017: [651.80, 332.11, 926.31, 1248.36]};
    for (const [code, expected] of Object.entries(anchors)) {
      const ratios = perResident[code].ratios!;
      expect([ratios.adult, ratios.workingAge, ratios.olderPeople, ratios.children].map(r => Number(r.value.toFixed(2))), code).toEqual(expected);
    }
  });
  it('retains the age amounts and reconciles the unattributed amount for every eligible council', () => {
    for (const [code, row] of Object.entries(perResident)) {
      if (!row.ratios) continue;
      const values = budget.councils[code].values;
      expect(row.unattributed!.amount, code).toBe((values.asctot! - AGE_IDS.reduce((sum, id) => sum + values[id]!, 0)) * 1000);
      for (const ratio of Object.values(row.ratios)) {
        expect(ratio.value).toBe(ratio.numeratorPounds / ratio.denominator.count);
        expect(ratio.editions.budget.year).toBe('2026-27');
        expect(ratio.editions.population.reference).toBe('mid-2025');
      }
    }
    for (const [code, expected] of Object.entries({E08000025: [256855, 178702, 137585], E09000033: [32384, 60945, 20510], E10000017: [255061, 259412, 168653]})) {
      const row = perResident[code];
      expect([row.ratios!.workingAge.numeratorPounds, row.ratios!.olderPeople.numeratorPounds, row.unattributed!.amount].map(n => n / 1000), code).toEqual(expected);
    }
  });
  it('refuses an unreviewed missing ONS row and never joins boundary mismatches by name', () => {
    const areas = {...population.areas};
    delete areas.E08000025;
    expect(() => perResidentFor('E08000025', budget.councils.E08000025, areas)).toThrow('Unexpected missing ONS row');
    expect(perResident.E08000038.ratios).toBeNull();
    expect(perResident.E08000039.ratios).toBeNull();
  });
  it('marks only the two specified small-population authorities', () => {
    expect(Object.values(perResident).filter(row => row.smallPopulation).map(row => row.code).sort()).toEqual(['E06000053', 'E09000001']);
  });
});
