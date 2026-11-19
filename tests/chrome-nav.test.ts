import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromeParts, pageProblems, referenceProblems, routesBeforeW5, sisterTable } from "../scripts/lib/chrome-nav.mjs";
import { lostOnlyInbound, orphans } from "../scripts/lib/link-graph.mjs";
import { CHROME_ROUTES_BEFORE_W5, footerHrefs, headerHrefs } from "../src/lib/site";
import { CURRENT_YEAR, NEXT_YEAR } from "../src/lib/council-tax";
import { SISTER_SITE_LINKS } from "../src/lib/sister-sites";

const years = { current: CURRENT_YEAR, next: NEXT_YEAR };
const a = (href: string) => `<a href="${href}">x</a>`;
const bar = (links: string[], extra = "", attrs = " data-pagefind-ignore") =>
  `<div class="site-header-bar"${attrs}><header class="site-header">${links.map(a).join("")}<details class="nav-more" data-nav-more><summary>More</summary></details><a class="header-pill header-pill-solid" href="/tools/budget/" aria-label="Budget game">Game</a><details class="drawer" data-site-drawer><summary>Menu</summary></details>${extra}</header></div>`;
const foot = (links: string[], sisters: string[], attrs = " data-pagefind-ignore") =>
  `<footer class="site-footer"${attrs}><nav class="footer-cols">${links.map(a).join("")}</nav><section data-sister-sites>${sisters.map(a).join("")}</section></footer>`;
const page = (h = headerHrefs(), f = footerHrefs(), s = SISTER_SITE_LINKS.map((x) => x.url), ha?: string, fa?: string) =>
  `<html><body>${bar(h, "", ha)}<main></main>${foot(f, s, fa)}</body></html>`;

describe("the W5 navigation gates", () => {
  it("keeps the dist list of pre-W5 routes equal to the source list", () => {
    expect(routesBeforeW5(years)).toEqual(CHROME_ROUTES_BEFORE_W5);
    expect(sisterTable()).toEqual(SISTER_SITE_LINKS.map((s) => s.url));
  });

  it("passes the built header and footer and reads their parts", () => {
    const parts = chromeParts(page());
    expect(referenceProblems(parts, { years, sisters: sisterTable() })).toEqual([]);
    expect(pageProblems(parts, parts)).toEqual([]);
    expect(parts.header.length).toBeLessThan(20);
  });

  it("fails a dropped route, a missing ignore, a sister drift and a page that differs", () => {
    const dropped = chromeParts(page(headerHrefs().filter((h) => h !== "/scotland/")));
    expect(referenceProblems(dropped, { years, sisters: sisterTable() })).toContain("/scotland/ left the header and footer");
    const indexed = chromeParts(page(undefined, undefined, undefined, "", ""));
    expect(referenceProblems(indexed, { years, sisters: sisterTable() })).toEqual(expect.arrayContaining(["the header lacks data-pagefind-ignore", "the footer lacks data-pagefind-ignore"]));
    const drift = chromeParts(page(undefined, undefined, ["https://ukcouncils.co.uk/", "https://asylumstats.co.uk/"]));
    expect(referenceProblems(drift, { years, sisters: sisterTable() }).some((p: string) => p.startsWith("footer sister links"))).toBe(true);
    const short = chromeParts(page(undefined, footerHrefs().slice(1)));
    expect(pageProblems(short, chromeParts(page()))).toContain("footer columns differ from the homepage");
    expect(pageProblems(chromeParts("<html><body><main></main></body></html>"), chromeParts(page()))).toEqual(["0 site headers, not one", "0 site footers, not one"]);
    const many = chromeParts(page(Array.from({ length: 19 }, (_, i) => `/p${i}/`)));
    expect(referenceProblems(many, { years, sisters: sisterTable() })).toContain("the header holds 20 destinations, not fewer than 20");
  });

  it("finds a page that lost its only inbound link", () => {
    const tree = (links: Record<string, string[]>) => {
      const root = mkdtempSync(join(tmpdir(), "w5-graph-"));
      for (const [route, out] of Object.entries(links)) {
        const dir = join(root, route);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "index.html"), `<html><body>${out.map(a).join("")}</body></html>`);
      }
      return root;
    };
    const before = tree({ "": ["/a/", "/b/"], a: ["/b/"], b: [] });
    const after = tree({ "": ["/a/"], a: [], b: [] });
    expect(orphans(before)).toEqual([]);
    expect(orphans(after)).toEqual(["/b/"]);
    expect(lostOnlyInbound(before, after)).toEqual(["/b/"]);
  });
});
