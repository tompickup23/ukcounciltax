import {expect, it} from 'vitest';
import {readFileSync, existsSync} from 'node:fs';
import {boardMoney, changeText, gapScale, gapShare, scenarioText, serviceAtTick} from '../src/scripts/budget-freeze';
import {FREEZE_MODEL, initialFreezeInputs} from '../src/lib/budget-freeze';
import {freezePilots} from '../src/lib/budget-freeze-data';
import manifest from '../data/pilots/budget-freeze-eligibility.json';
// @ts-expect-error jsdom has no declarations in this repository.
import {JSDOM} from 'jsdom';

// check-text strips scripts, so the copied text is checked here (W3 audit gate).
it('builds a copied scenario with no en dash, em dash or spaced hyphen for every council', () => {
  for (const pilot of freezePilots()) {
    const sources = pilot.sources.map(s => `MHCLG, ${s.title}, ${s.url}`);
    const frozen = initialFreezeInputs(pilot);
    const published = initialFreezeInputs(pilot, false);
    const preset = initialFreezeInputs(pilot);
    for (const service of pilot.services.filter(s => s.editable)) preset.servicePounds[service.id] = serviceAtTick(service.pence, 190);
    for (const inputs of [frozen, published, preset]) {
      const text = scenarioText(pilot, inputs, sources);
      expect(text, pilot.slug).not.toMatch(/[–—]| - /);
      expect(text.startsWith(`User requested scenario | ${FREEZE_MODEL}`)).toBe(true);
      expect(text).toContain('tax base stays fixed');
      for (const s of pilot.sources) expect(text).toContain(s.url);
    }
  }
});

it('prints board amounts in £ million to one decimal and never shows a non zero gap as zero', () => {
  const pounds = (value: number) => BigInt(Math.round(value * 10000));
  expect(boardMoney(0n)).toBe('£0');
  expect(boardMoney(pounds(366_008_000))).toBe('£366.0m');
  expect(boardMoney(-pounds(22_600_898.51))).toBe('-£22.6m');
  expect(boardMoney(pounds(1_234_000_000))).toBe('£1.2bn');
  expect(boardMoney(pounds(456_000))).toBe('£456,000');
  expect(boardMoney(pounds(0.4))).toBe('£0.40');
  expect(boardMoney(-pounds(0.4))).toBe('-£0.40');
  expect(boardMoney(1n)).toBe('less than £0.01');
  expect(boardMoney(-99n)).toBe('less than £0.01');
  expect(changeText(0n)).toBe('No change');
  expect(changeText(pounds(1_830_040))).toBe('+£1.8m change');
  expect(changeText(-pounds(2_280))).toBe('-£2,280 change');
});

it('scales the gap bar from amounts the page offers and caps it at the full half', () => {
  for (const pilot of freezePilots()) expect(gapScale(pilot) > 0n, pilot.slug).toBe(true);
  expect(gapShare(0n, 100n)).toBe(0);
  expect(gapShare(50n, 100n)).toBe(50);
  expect(gapShare(-25n, 100n)).toBe(25);
  expect(gapShare(500n, 100n)).toBe(100);
});

const built = existsSync('dist/tools/budget/leeds/set/index.html');
it.skipIf(!built)('gives every set page a What next block with neighbours that have a set page', () => {
  const eligible = new Set(manifest.councils.filter(c => c.eligible).map(c => c.slug));
  for (const slug of eligible) {
    const doc: DocumentFragment = JSDOM.fragment(readFileSync(`dist/tools/budget/${slug}/set/index.html`, 'utf8'));
    const next = doc.querySelector('[data-what-next]')!;
    expect(next, slug).not.toBeNull();
    expect(next.querySelector(`a[href="/councils/${slug}/"]`)).not.toBeNull();
    expect(next.querySelector('a[href="/increases/"]')).not.toBeNull();
    expect(next.querySelector('[data-next-compare]')?.getAttribute('href')).toMatch(new RegExp(`^/compare/\\?a=${slug}&band=D&year=\\d{4}-\\d{2}$`));
    const neighbours = [...next.querySelectorAll('[data-next-neighbours] a')].map(a => a.getAttribute('href')!);
    expect(neighbours.length).toBeLessThanOrEqual(4);
    for (const href of neighbours) {
      const match = /^\/tools\/budget\/([a-z0-9-]+)\/set\/$/.exec(href);
      expect(match && eligible.has(match[1]) && match[1] !== slug, `${slug} to ${href}`).toBe(true);
    }
    // One desk band, one Sources block, and every amount on the board in the compact style.
    expect(doc.querySelectorAll('.desk')).toHaveLength(1);
    expect(doc.querySelectorAll('[data-page-sources]')).toHaveLength(1);
    expect(doc.querySelector('[data-remaining]')?.textContent).toMatch(/^(£0|-?£\d+(?:,\d{3})*|-?£\d+(?:\.\d{2})|-?£\d+\.\d(?:m|bn)|less than £0\.01)$/);
    for (const value of doc.querySelectorAll('[data-service-value]')) expect(value.textContent).not.toMatch(/\.\d{2}$/);
  }
}, 120_000);
