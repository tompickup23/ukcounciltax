import {describe, expect, it} from 'vitest';
import {councilMetadata, NEXT_EDITION_STATUS} from '../src/lib/council-metadata';
import {taxRows} from '../src/lib/tax-view-data';
import {devolved} from '../src/lib/devolved';

describe('council metadata uses the published basis', () => {
  it('keeps a missing prior year unavailable instead of claiming no increase', () => {
    const edition = devolved.editions.find(e => e.nation === 'Wales')!;
    const row = edition.records[0];
    const result = councilMetadata({name:row.name,currentPence:row.bandsPence.D,previousPence:null,basis:edition.basis,wholePounds:true});
    expect(result.description).toContain('Prior-year comparison unavailable');
    expect(result.description).not.toContain('Unchanged');
  });
  it('uses the same English Band D amounts and includes source-check scope', () => {
    for (const row of taxRows()) {
      const result = councilMetadata({name:row.name,currentPence:row.years['2026-27'].D!,previousPence:row.years['2025-26'].D??null,basis:'area average including average parish precepts'});
      expect(result.title).toContain(row.name);
      expect(result.title).toContain('council tax bands and charges 2026/27');
      expect(result.description).toContain('area average including average parish precepts');
      expect(result.description).toContain('Source extract checked 6 October 2026');
    }
    expect(NEXT_EDITION_STATUS).toContain('not yet published');
  });
});
