import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {gameMarkup, longDate, scopeCss, scopeSelector, strictProblems} from '../scripts/lib/burnley-game-sync.mjs';
import {programmaticPaths, scenarioGamePath, SCENARIO_GAME_SLUGS} from '../src/lib/paths';
import {canonicalUrl} from '../src/lib/canonical';
import {sitemapLastmod} from '../src/lib/releases';
import {absoluteUrl, STATIC_PATHS} from '../src/lib/site';
import {pageTypeFor} from '../src/lib/page-type';

const read = (path: string) => readFileSync(path, 'utf8');
const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');
const meta = JSON.parse(read('src/components/burnley-game/meta.json'));
const js = read('public/budget-game/burnley/game.js');
const css = read('public/budget-game/burnley/game.css');
const markup = read('src/components/burnley-game/markup.html');
const published = JSON.parse(read('src/components/burnley-game/published.json'));
const page = read('src/pages/councils/[slug]/budget-game.astro');

describe('the Burnley budget scenario game route', () => {
  it('is one programmatic, self canonical route dated by its edition', () => {
    expect(SCENARIO_GAME_SLUGS).toEqual(['burnley']);
    const path = scenarioGamePath('burnley');
    expect(path).toBe('/councils/burnley/budget-game/');
    expect(programmaticPaths().filter(route => route.endsWith('/budget-game/'))).toEqual([path]);
    expect(STATIC_PATHS as readonly string[]).not.toContain(path);
    expect(canonicalUrl(path)).toBe(absoluteUrl(path));
    expect(sitemapLastmod(path)).toBe(meta.edition);
    expect(pageTypeFor(path)).toBe('budget');
  });
});

describe('the copied game files', () => {
  it('are the files the last sync recorded, with one model run id', () => {
    expect(sha256('public/budget-game/burnley/game.js')).toBe(meta.servedSha256['game.js']);
    expect(sha256('public/budget-game/burnley/game.css')).toBe(meta.servedSha256['game.css']);
    // game.js is copied byte for byte from the Reports build.
    expect(meta.servedSha256['game.js']).toBe(meta.sourceSha256['game.js']);
    expect(meta.runId).toMatch(/^run-[0-9a-f]{16}$/);
    expect([...new Set(js.match(/run-[0-9a-f]{16}/g))]).toEqual([meta.runId]);
    expect(longDate(meta.edition)).toBe(meta.editionText);
  });

  it('ask for nothing outside this site and carry no inline script, handler or style', () => {
    expect(js).not.toMatch(/https?:\/\/|\bfetch\s*\(|XMLHttpRequest|\bimport\s*\(|sendBeacon|WebSocket|EventSource/);
    expect(css).not.toMatch(/url\(|@import/);
    expect(markup).not.toMatch(/<script\b|<style\b|\sstyle\s*=|\son[a-z]+\s*=|https?:\/\/|\s(?:src|href)=/i);
  });

  it('print the edition line in place of the working banner and keep the element the script writes', () => {
    expect(markup).not.toContain('Working version');
    expect(markup).toContain(`Edition of ${meta.editionText}. <span id="runid">Model run ${meta.runId}.</span> Figures from Burnley Borough Council's published papers.`);
    expect(markup.match(/id="runid"/g)).toHaveLength(1);
    expect(markup).not.toMatch(/<h1\b/);
  });

  it('keep every rule of the stylesheet inside the game wrapper', () => {
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const selectors = [...withoutComments.matchAll(/(?:^|[{}])\s*([^{}@]+)\{/g)].flatMap(match => match[1].split(',')).map(s => s.trim()).filter(Boolean);
    expect(selectors.length).toBeGreaterThan(300);
    const outside = selectors.filter(selector => !selector.includes('.burnley-game') && !/^body > \.tip\b/.test(selector) && !/^\d+%$|^from$|^to$/.test(selector));
    expect(outside).toEqual([]);
  });
});

describe('the sync script', () => {
  it('scopes selectors, theme conditions and conditional groups to the wrapper', () => {
    expect(scopeSelector(':root')).toBe('.burnley-game');
    expect(scopeSelector('body')).toBe('.burnley-game');
    expect(scopeSelector(':root[data-theme="dark"]')).toBe(':root[data-theme="dark"] .burnley-game');
    expect(scopeSelector(':root:not([data-theme="light"])')).toBe(':root:not([data-theme="light"]) .burnley-game');
    expect(scopeSelector('.panel>h3')).toBe('.burnley-game .panel>h3');
    expect(scopeSelector('.tip[hidden]')).toBe('.burnley-game .tip[hidden], body > .tip[hidden]');
    expect(scopeCss('h1,h2{margin:0}@media (max-width:560px){.a:is(.b,.c){x:y}}@keyframes k{from{o:0}to{o:1}}'))
      .toBe('.burnley-game h1,.burnley-game h2{margin:0}@media (max-width:560px){.burnley-game .a:is(.b,.c){x:y}}@keyframes k{from{o:0}to{o:1}}');
  });

  it('refuses a build the security policy could not serve', () => {
    const ok = '<body><div class="test">Working version. <span id="runid"></span></div><h1>Game</h1><link rel="stylesheet" href="game.css"><script src="game.js"></script></body>';
    expect(strictProblems(ok, 'const D = {};')).toEqual([]);
    expect(strictProblems(ok.replace('<h1>', '<h1 onclick="x()">'), '')).toHaveLength(1);
    expect(strictProblems(ok.replace('<h1>', '<h1 style="color:red">'), '')).toHaveLength(1);
    expect(strictProblems(ok.replace('</body>', '<script>x()</script></body>'), '')).toHaveLength(1);
    expect(strictProblems(ok.replace('game.css', 'https://example.org/a.css'), '')).toHaveLength(1);
    expect(strictProblems(ok, 'fetch("/x")')).toHaveLength(1);
    expect(gameMarkup(ok, 'run-0000000000000000', '1 January 2027')).toContain('<h2 class="game-title">Game</h2>');
  });
});

describe('the page around the game', () => {
  it('prints the published figures, their sources and the scenario statement as static HTML', () => {
    expect(published.figures.map((figure: {value: string}) => figure.value)).toEqual(['£0.594 million', '£0.507 million', '£22,428,686', '£351.44']);
    for (const figure of published.figures) {
      expect(figure.source).toMatch(/^Burnley Borough Council, .+ 2026\b/);
      // Each printed figure is the one the game carries.
      expect(js, figure.id).toContain(figure.gameValue);
    }
    expect(published.figures[0].source).toContain('Table 4, page 5');
    expect(published.figures[1].source).toContain('Table 5, page 6');
    for (const text of ['published.figures.map', '{figure.value}', '{figure.source}', 'your own scenario', 'not a forecast', '{meta.runId}', '{meta.editionText}']) expect(page, text).toContain(text);
    expect([meta.baseYear, meta.playYear, meta.nextYear]).toEqual(['2026/27', '2027/28', '2028/29']);
  });

  it('loads the game by ordinary elements with no inline script', () => {
    expect(page).toMatch(/<script is:inline src=\{`\$\{assets\}\/game\.js/);
    expect(page).toMatch(/<link rel="stylesheet" href=\{`\$\{assets\}\/game\.css/);
    expect([...page.matchAll(/<script\b/g)]).toHaveLength(1);
  });
});

describe('the national budget page link to the scenario game', () => {
  it.skipIf(!existsSync('dist/tools/budget/burnley/index.html'))('appears on the Burnley budget page and on no other council budget page', () => {
    const burnley = read('dist/tools/budget/burnley/index.html');
    expect(burnley.match(/data-scenario-game-link/g)).toHaveLength(1);
    expect(burnley).toContain(`href="${scenarioGamePath('burnley')}" data-scenario-game-link`);
    expect(burnley).toContain('Burnley Borough Council has also published its own budget gap for the next two years.');
    for (const slug of ['pendle', 'hyndburn', 'coventry']) {
      const file = `dist/tools/budget/${slug}/index.html`;
      if (!existsSync(file)) throw new Error(`Build the site before checking ${file}`);
      expect(read(file), slug).not.toContain('data-scenario-game-link');
    }
  });
});
