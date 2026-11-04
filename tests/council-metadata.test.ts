import {describe, expect, it} from 'vitest';
import {councilMetadata, NEXT_EDITION_STATUS} from '../src/lib/council-metadata';
import {taxRows} from '../src/lib/tax-view-data';
import {devolved} from '../src/lib/devolved';

describe('council metadata uses the published basis', () => {
  it('keeps a missing prior year unavailable instead of claiming no increase', () => {
    const edition = devolved.editions.find(e => e.nation === 'Wales')!;
    const row = edition.records[0];
    const result = councilMetadata({
      name: row.name,
      currentPence: row.bandsPence.D,
      previousPence: null,
      basis: edition.basis,
      wholePounds: true,
      nation: 'Wales',
    });
    expect(result.description).toContain('Prior-year comparison unavailable');
    expect(result.description).not.toContain('Unchanged');
    expect(result.title).toContain('council tax Band D 2026/27, Wales');
    expect(result.description.length).toBeLessThanOrEqual(160);
  });

  it('puts the Scottish basis in the title and leads the description with the figure', () => {
    const edition = devolved.editions.find(e => e.nation === 'Scotland' && e.year === '2026-27')!;
    const row = edition.records[0];
    const past = devolved.editions.find(e => e.nation === 'Scotland' && e.year === '2025-26')?.records.find(r => r.gss === row.gss);
    const result = councilMetadata({
      name: row.name,
      currentPence: row.bandsPence.D,
      previousPence: past?.bandsPence.D ?? null,
      basis: 'council tax excluding water and sewerage',
      percentageDigits: 2,
      nation: 'Scotland',
    });
    expect(result.title).toContain('council tax only, water and sewerage excluded');
    expect(result.description.startsWith('Band D is ')).toBe(true);
    expect(result.description).not.toContain('Source extract checked');
    expect(result.description.length).toBeLessThanOrEqual(160);
  });

  it('uses the same English Band D amounts and drops the internal check date', () => {
    for (const row of taxRows()) {
      const result = councilMetadata({
        name: row.name,
        currentPence: row.years['2026-27'].D!,
        previousPence: row.years['2025-26'].D ?? null,
        basis: 'area average including average parish precepts',
        nation: 'England',
      });
      expect(result.title).toBe(`${row.name} council tax bands and charges 2026/27`);
      expect(result.description.startsWith('Band D is ')).toBe(true);
      expect(result.description).toContain('area average including average parish precepts');
      expect(result.description).not.toContain('Source extract checked');
      expect(result.description.length).toBeLessThanOrEqual(160);
    }
    expect(NEXT_EDITION_STATUS).toContain('not yet published');
  });
});
