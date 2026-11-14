import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { canonicalUrl } from "../src/lib/canonical";
import { programmaticPaths, rankingPaths, parishPages, parishPath, scenarioGamePath, SCENARIO_GAME_SLUGS } from "../src/lib/paths";
import { absoluteUrl, STATIC_PATHS } from "../src/lib/site";

const data = JSON.parse(readFileSync(join(process.cwd(), "data", "canonical-map.json"), "utf8"));
const snapshot = (name: string) => readFileSync(join(process.cwd(), "data", "canonical-sitemaps", `${name}.xml`), "utf8");
const urls = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const sourceUrls = urls(snapshot("ukcounciltax"));
const targetUrls = urls(snapshot("ukcouncils"));
const targets = new Map(targetUrls.map(url => [new URL(url).pathname, url]));
const brandPaths = new Set(["/", "/about/", "/contact/", "/corrections/", "/privacy/", "/methodology/"]);
const expected = Object.fromEntries(sourceUrls.flatMap(url => {
  const target = targets.get(new URL(url).pathname);
  return target && !brandPaths.has(new URL(url).pathname) ? [[url, target]] : [];
}));
const uniqueUrls = sourceUrls.filter(url => (!targets.has(new URL(url).pathname) || brandPaths.has(new URL(url).pathname)));

describe("the reviewed canonical map", () => {
  it("records the fetch date and hashes of both live sitemap snapshots", () => {
    expect(data.fetchedDate).toBe("2026-11-04");
    for (const name of ["ukcounciltax", "ukcouncils"]) {
      expect(data.sitemaps[name].url).toBe(`https://${name}.co.uk/sitemap.xml`);
      expect(data.sitemaps[name].sha256).toBe(createHash("sha256").update(snapshot(name)).digest("hex"));
      for (const url of urls(snapshot(name))) {
        expect(new URL(url).origin).toBe(`https://${name}.co.uk`);
        expect(new URL(url).search).toBe("");
        expect(new URL(url).hash).toBe("");
      }
    }
    expect(new Set(sourceUrls).size).toBe(sourceUrls.length);
    expect(new Set(targetUrls).size).toBe(targetUrls.length);
  });

  it("maps exactly the 319 shared routes to destinations in the fetched target sitemap", () => {
    expect(Object.keys(expected)).toHaveLength(319);
    expect(data.mappings).toEqual(expected);
    for (const [source, target] of Object.entries(expected)) {
      expect(canonicalUrl(new URL(source).pathname)).toBe(target);
    }
  });

  it("keeps all 69 unique pages self canonical", () => {
    expect(uniqueUrls).toHaveLength(69);
    expect(data.selfCanonicalUrls).toEqual([...uniqueUrls].sort());
    for (const url of uniqueUrls) expect(canonicalUrl(new URL(url).pathname)).toBe(url);
  });

  it("covers every current route and keeps any unmapped route self canonical", () => {
    const builtUrls = [...STATIC_PATHS, ...programmaticPaths()].map(absoluteUrl);
    const retiredUrl = absoluteUrl("/council-tax/rises-2026-27/");
    const a4Paths = ["/council-tax/ranked/", ...rankingPaths(), "/precepts/parishes/", ...parishPages().map(parishPath)];
    expect(a4Paths).toHaveLength(221);
    expect(new Set(a4Paths).size).toBe(221);
    for (const path of a4Paths) {
      expect(canonicalUrl(path)).toBe(absoluteUrl(path));
      expect(data.mappings[absoluteUrl(path)]).toBeUndefined();
    }
    const addedUrls = [...a4Paths,"/council-tax-2027-28/", "/findings/", "/changes/", "/tools/budget/", ...programmaticPaths().filter(path => path.startsWith('/tools/budget/')), ...SCENARIO_GAME_SLUGS.map(scenarioGamePath)].map(absoluteUrl);
    expect(sourceUrls.filter(url => !builtUrls.includes(url))).toEqual([retiredUrl]);
    expect(builtUrls.filter(url => !sourceUrls.includes(url)).sort()).toEqual(addedUrls.sort());
    expect(builtUrls.filter(url => data.mappings[url])).toHaveLength(318);
    for (const url of addedUrls) expect(canonicalUrl(new URL(url).pathname)).toBe(url);
    const redirects = readFileSync(join(process.cwd(), "public", "_redirects"), "utf8");
    expect(redirects).toMatch(/^\/council-tax\/rises-2026-27\/ \/increases\/#2026-27 301$/m);
    expect(canonicalUrl("/increases/")).toBe(absoluteUrl("/increases/"));
    for (const url of builtUrls) {
      expect(canonicalUrl(new URL(url).pathname)).toBe(data.mappings[url] ?? url);
    }
    for (const path of ["/404/", "/councils/no-live-counterpart/", "/new-specialist-page/"]) {
      expect(canonicalUrl(path)).toBe(absoluteUrl(path));
    }
  });
});
