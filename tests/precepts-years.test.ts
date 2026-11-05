import {describe, it, expect} from 'vitest';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {national} from '../src/lib/national-data';
import {yearLabel} from '../src/lib/council-tax';

// The parish return is keyed by its own year keys, not by the site year variables.
const parishYears = [...new Set(national.parishes.flatMap((p) => Object.keys(p.years)))].sort();
const expected = [yearLabel(parishYears[0]), yearLabel(parishYears[parishYears.length - 1])];
const page = readFileSync(join(process.cwd(), 'src/pages/precepts.astro'), 'utf8');
const built = join(process.cwd(), 'dist/precepts/index.html');

describe('parish return year labels on /precepts/', () => {
  it('takes two different labels from the parish data year keys', () => {
    expect(parishYears).toEqual(['2025-26', '2026-27']);
    expect(expected).toEqual(parishYears.map(yearLabel));
    expect(expected[0]).not.toBe(expected[1]);
  });
  it('reads the labels from the parish data, not the site year variables', () => {
    expect(page).toContain('Object.keys(p.years)');
    expect(page).toContain('<span data-parish-year>{parishFirst}</span> and <span data-parish-year>{parishLast}</span>');
    expect(page).not.toMatch(/PREVIOUS_YEAR|yearLabel\(national\.year\)/);
  });
  it.skipIf(!existsSync(built))('prints the parish data year keys in the built page', () => {
    const html = readFileSync(built, 'utf8');
    const labels = [...html.matchAll(/<span data-parish-year[^>]*>([^<]+)<\/span>/g)].map((m) => m[1]);
    expect(labels).toEqual(expected);
    expect(labels[0]).not.toBe(labels[1]);
  });
});
