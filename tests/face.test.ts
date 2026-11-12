import { describe, expect, it } from "vitest";
import { chartProblems, chromeProblems, headerProblems, homeProblems } from "../scripts/lib/face.mjs";

const header = (inner = "") => `<div class="site-header-bar"><header class="site-header"><a class="brand" href="/">UK Council Tax</a>${inner}</header></div>`;
const footer = (inner = '<select data-theme-select><option>System theme</option></select>') => `<footer class="site-footer"><div class="shell">${inner}</div></footer>`;
const chart = (source = "Source: Burnley Borough Council, Council Tax Charges 2026/27, page 1, 2026/27.") =>
  `<figure class="ek-figure" data-figure="a b"><svg viewBox="0 0 600 387" role="img" aria-label="A bar" class="ek-chart"><rect x="0" y="0" width="1" height="1"/><text x="4" y="380">${source}</text></svg></figure>`;
const actions = '<div class="chart-actions" data-chart-actions><a href="/og/charts/home-bill-light.png" data-chart-png>light</a></div>';
const door = '<form class="postcode-door" data-postcode-door><input id="postcode-home"><noscript><p><a href="/councils/">Browse all councils</a></p></noscript></form>';
const finder = '<section class="council-finder" data-council-finder><input id="council-name" disabled><noscript><p><a href="/councils/">Browse all councils</a></p></noscript></section>';
const task = (svg = '<svg viewBox="0 0 160 64" class="task-thumb" aria-hidden="true"><rect/></svg>') => `<a class="task-card" href="/x/">${svg}<strong>Task</strong></a>`;
const home = ({ copy = door + finder, card = chart(), tasks = [task(), task(), task(), task(), task()] } = {}) =>
  `<section class="home-hero"><div class="hero-copy">${copy}</div><aside class="bill-card">${card}${actions}</aside></section><nav class="task-cards section">${tasks.join("")}</nav>`;

describe("the face checks", () => {
  it("pass a sound homepage", () => {
    expect(homeProblems(home())).toEqual([]);
    expect(chromeProblems(header() + footer())).toEqual([]);
    expect(chartProblems(home())).toEqual({ problems: [], pngs: ["/og/charts/home-bill-light.png"] });
  });

  it("catch a finder after the bill card or without its fallback", () => {
    const late = `<section class="home-hero"><div class="hero-copy">${door}</div><aside class="bill-card">${chart()}</aside>${finder}</section>`;
    expect(homeProblems(late)).toContain("a finder comes after the bill card in the hero");
    expect(homeProblems(home({ copy: door.replace(/<noscript>.*<\/noscript>/, "") + finder }))).toContain("the postcode door has no noscript link to /councils/");
  });

  it("catch a bill chart without its source inside the drawing", () => {
    expect(homeProblems(home({ card: chart("Drawn by the site") }))).toContain("the bill chart has no source line inside the drawing");
    expect(homeProblems(home({ card: chart() + chart() }))).toContain("the bill card holds 2 kit charts, not one");
  });

  it("catch task drawings that speak or are missing", () => {
    const speaking = task('<svg viewBox="0 0 160 64" aria-hidden="true"><text>£2,540</text></svg>');
    expect(homeProblems(home({ tasks: [speaking, task(), task(), task(), task()] }))).toContain("task link 1 draws text");
    expect(homeProblems(home({ tasks: [task('<svg viewBox="0 0 160 64"></svg>'), task(), task()] }))).toEqual(
      expect.arrayContaining(["3 task links, not five", "task link 1 needs exactly one aria-hidden drawing"]),
    );
  });

  it("catch a select in the header and a missing footer theme select", () => {
    expect(chromeProblems(header("<select data-theme-select></select>") + footer(""))).toEqual(
      expect.arrayContaining(["a select inside the site header", "the footer must hold exactly one theme select"]),
    );
  });

  it("catch a kit chart without its actions", () => {
    expect(chartProblems(chart()).problems).toEqual(["1 kit charts but 0 chart actions"]);
  });

  it("catch a CSP that stops the kit's inline style attributes", () => {
    const line = (style: string) => `/*\n  Content-Security-Policy: default-src 'self'; style-src ${style}; img-src 'self'\n`;
    expect(headerProblems(line("'self' 'unsafe-inline'"))).toEqual([]);
    expect(headerProblems(line("'self'"))).toEqual(["style-src no longer allows the kit's inline style attributes"]);
  });
});

it("requires one source and one table control in a chart fact", () => {
  const fact = `<div data-fact>${chart()}${actions}<p class="source-line">Source</p><details><summary>The figures as a table</summary></details></div>`;
  expect(chartProblems(fact).problems).toEqual([]);
  expect(chartProblems(fact.replace('</div>', '<p class="source-line">Duplicate</p></div>')).problems).toContain('a kit chart fact must hold exactly one source line');
  expect(chartProblems(fact.replace('</details>', '</details><a>The figures as a table</a>')).problems).toContain('a kit chart fact must hold exactly one table control');
});

it('allows no PNG for a locator and requires exactly one light download for other charts', () => {
  expect(chartProblems(chart() + '<div data-chart-actions data-chart="councils/burnley/map"></div>').problems).toEqual([]);
  expect(chartProblems(chart() + actions.replace('data-chart-actions', 'data-chart-actions data-chart="councils/burnley/map"')).problems).toContain('a locator map must not offer a PNG');
  expect(chartProblems(chart() + actions.replace('-light.png', '-dark.png')).problems).toContain('a chart must offer exactly one light PNG');
  expect(chartProblems(chart() + actions.replace('</div>', '<a href="/og/charts/another-light.png" data-chart-png>Duplicate</a></div>')).problems).toContain('a chart must offer exactly one light PNG');
});
