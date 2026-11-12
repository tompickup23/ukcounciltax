import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {afterEach, expect, it, vi} from 'vitest';
import {budgetGameProblems} from '../scripts/lib/budget-game.mjs';
import {requireImages, omittedChartPng} from '../scripts/lib/og-policy.mjs';

const roots: string[] = [];
const root = () => { const dir = mkdtempSync(join(tmpdir(), 'uct-og-')); roots.push(dir); return dir; };
afterEach(() => { roots.splice(0).forEach(dir => rmSync(dir, {recursive: true, force: true})); vi.unstubAllEnvs(); });

it('requires all images on production and on any partial image tree', () => {
  const dist = root();
  expect(requireImages(dist, {})).toBe(false);
  expect(requireImages(dist, {BUILD_OG: '1'})).toBe(true);
  mkdirSync(join(dist, 'og'));
  expect(requireImages(dist, {})).toBe(true);
});

it('exempts only marked chart PNG downloads in a build without images', () => {
  const path = '/og/charts/councils/burnley/bands-light.png';
  expect(omittedChartPng(path, '<a data-chart-png>', false)).toBe(true);
  expect(omittedChartPng(path, '<a data-chart-png>', true)).toBe(false);
  expect(omittedChartPng(path, '<a>', false)).toBe(false);
  expect(omittedChartPng('/og/charts/bands-dark.png', '<a data-chart-png>', false)).toBe(false);
  expect(omittedChartPng('/missing.png', '<a data-chart-png>', false)).toBe(false);
  expect(omittedChartPng('/og/charts/bands-missing.png', '<a data-chart-png>', false)).toBe(false);
});

it('keeps the real link audit strict for main, partial trees and ordinary missing links', () => {
  const cwd = root();
  mkdirSync(join(cwd, 'dist'));
  const file = join(cwd, 'dist/index.html');
  const audit = (build = '') => spawnSync(process.execPath, [resolve('scripts/audit-links.mjs')], {cwd, env: {...process.env, BUILD_OG: build}, encoding: 'utf8'});
  writeFileSync(file, '<a href="/og/charts/home-bill-light.png" data-chart-png>PNG</a>');
  expect(audit().status).toBe(0);
  expect(audit('1').status).toBe(1);
  mkdirSync(join(cwd, 'dist/og'));
  expect(audit().status).toBe(1);
  rmSync(join(cwd, 'dist/og'), {recursive: true});
  writeFileSync(file, '<a href="/missing/">Missing page</a>');
  expect(audit().status).toBe(1);
});


it('checks budget image files on main while retaining image links in PR HTML', () => {
  const dist = root();
  writeFileSync(join(dist, 'BudgetGame.js'), '');
  const actions = '<a data-chart-png href="/og/budget/example/round-0-light.png">light</a>';
  const html = `<title>Example budget game 2026/27 | UK Council Tax</title><h1>Could you set Example's budget?</h1>
    <meta property="og:image" content="https://ukcounciltax.co.uk/og/budget/example.png">
    <div data-budget-game data-council-name="Example"><script data-budget-game-data type="application/json">{"year":"2026/27","rounds":[{"kind":"reserves"}]}</script>
    <script data-budget-scenario-data type="application/json">{"model":"budget-scenario 1.0","screens":[]}</script>
    <div data-scenario-entry hidden></div><ol data-game-route><li>Reserves</li></ol>
    <template data-game-published="0">${actions}</template></div>
    <div id="published-budget"><div id="council-budget"></div><div data-published-round="0">${actions}</div></div>
    <script src="/BudgetGame.js"></script>`;
  const problems = () => budgetGameProblems(html, 'example', dist).problems;
  vi.stubEnv('BUILD_OG', '');
  expect(problems()).toEqual([]);
  vi.stubEnv('BUILD_OG', '1');
  expect(problems()).toHaveLength(3);
  expect(problems()).toContain('example: static game card missing');
  vi.stubEnv('BUILD_OG', '');
  expect(budgetGameProblems(html.replaceAll(actions, ''), 'example', dist).problems).toContain('example: round 0 needs one light PNG action');
});
