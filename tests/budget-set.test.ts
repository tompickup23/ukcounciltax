import {expect, it} from 'vitest';
import {readFileSync, existsSync} from 'node:fs';
import {budgetSetPages, budgetSetPath, programmaticPaths} from '../src/lib/paths';
import {budgetSetEntry} from '../src/lib/budget-set-entry';
import {canonicalUrl} from '../src/lib/canonical';
import manifest from '../data/pilots/budget-freeze-eligibility.json';
import columns from '../data/pilots/budget-freeze-columns.json';
import {sitemapLastmod} from '../src/lib/releases';
it('routes exactly the 197 eligible GSS codes from the audited fixture', () => {
  const pages = budgetSetPages();
  expect(pages).toHaveLength(197);
  expect(pages.map(p => p.gss).sort()).toEqual(manifest.councils.filter(c => c.eligible).map(c => c.gss).sort());
  expect(programmaticPaths().filter(p => p.endsWith('/set/')).sort()).toEqual(pages.map(p => budgetSetPath(p.slug)).sort());
  for (const p of pages) {
    expect(canonicalUrl(budgetSetPath(p.slug))).toBe(`https://ukcounciltax.co.uk/tools/budget/${p.slug}/set/`);
    expect(sitemapLastmod(budgetSetPath(p.slug))).toBe(manifest.reviewedOn);
    for (const row of p.ledger) expect(columns).toHaveProperty(row.id);
  }
});
it.each(manifest.councils.filter(c => !c.eligible))('$name budget entry shows its exact stored exclusion reason', council => {
  expect(budgetSetEntry(council.gss)).toEqual({href:null,text:council.reason});
  expect(council.reason).not.toBe('');
});
it.skipIf(!existsSync('dist/tools/budget/burnley/index.html')).each(manifest.councils.filter(c => !c.eligible))('$name built budget page shows its stored exclusion reason', council => {
  const html = readFileSync(`dist/tools/budget/${council.slug}/index.html`, 'utf8');
  const text = /<p[^>]*data-budget-set-entry[^>]*>([\s\S]*?)<\/p>/.exec(html)?.[1];
  expect(text).toBe(council.reason.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'));
});
it('renders the entry for both return states and keeps the Burnley link before it', () => {
  const page = readFileSync('src/pages/tools/budget/[slug].astro','utf8');
  expect(page).toContain('{!available && <BudgetSetEntry gss={council.gss} />}');
  expect(page).toMatch(/data-scenario-game-link[\s\S]*?<BudgetSetEntry gss=\{council.gss\} \/>/);
  expect(readFileSync('src/components/BudgetSetEntry.astro','utf8')).toContain(': entry.text}');
});
it('links eligible entries to their exact set pages and rejects unknown councils', () => {
  for (const c of manifest.councils.filter(c => c.eligible)) expect(budgetSetEntry(c.gss)).toEqual({href:budgetSetPath(c.slug),text:'Set the budget yourself'});
  expect(() => budgetSetEntry('unknown')).toThrow('Missing C2 eligibility');
});

it('renders a set invitation card with no invented budget figure', async () => {
  const {budgetSetCard} = await import('../src/lib/budget-set-card');
  const png = Buffer.from(await budgetSetCard('Bournemouth, Christchurch and Poole'));
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});

it('keeps unaudited additions inside the legacy static number guard', async () => {
  const {staticGameNumbers} = await import('../scripts/lib/budget-game.mjs');
  const reason = manifest.councils.find(c => c.slug === 'coventry')!.reason;
  const html = (text: string) => `<html><head><link rel="canonical" href="https://ukcounciltax.co.uk/tools/budget/coventry/"></head><body><p>£42</p><p data-budget-set-entry>${text}</p></body></html>`;
  expect(staticGameNumbers(html(reason))).toEqual(['42']);
  expect(staticGameNumbers(html(`${reason} £999`))).toContain('999');
});

it('requires an unsaved theme control only on the set route', async () => {
  const {chromeProblems} = await import('../scripts/lib/face.mjs');
  const html = '<link rel="canonical" href="https://ukcounciltax.co.uk/tools/budget/trafford/set/"><div class="site-header-bar"></div><main data-freeze-pilot><button data-theme-toggle hidden>Change colour theme</button></main><footer class="site-footer"></footer>';
  expect(chromeProblems(html)).toEqual([]);
  expect(chromeProblems(html.replace('data-theme-toggle','data-other'))).toContain('an unsaved budget page must have one memory only theme button');
  expect(chromeProblems(html.replace('</footer>','<select data-theme-select></select></footer>'))).toContain('an unsaved budget page must have no persisted theme select');
  expect(chromeProblems(html.replace('/set/','/'))).toContain('the page must hold exactly one theme select');
});
