import {afterEach, expect, it, vi} from 'vitest';

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

it('builds light downloads, omits locator PNGs and retains chart share cards', async () => {
  vi.stubEnv('BUILD_OG', '1');
  vi.resetModules();
  const {getStaticPaths: profiles} = await import('../src/pages/og/charts/councils/[slug]/[chart].png');
  const {getStaticPaths: hubs} = await import('../src/pages/og/charts/[chart].png');
  const {getStaticPaths: budgets} = await import('../src/pages/og/budget/[slug]/[chart].png');
  const {councilPages} = await import('../src/lib/paths');
  const rows = profiles();
  expect(rows).toHaveLength(councilPages().length * 3);
  expect(rows.every(row => /^(bands|bill|position)-light$/.test(row.params.chart))).toBe(true);
  expect(hubs().some(row => row.params.chart === 'home-bill-card')).toBe(true);
  expect(hubs().every(row => /-(light|card)$/.test(row.params.chart))).toBe(true);
  const games = budgets();
  expect(games.length).toBeGreaterThan(0);
  expect(games.every(row => /^round-\d+-light$/.test(row.params.chart))).toBe(true);
});
