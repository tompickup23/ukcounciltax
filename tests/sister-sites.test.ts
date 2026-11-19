import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SISTER_SITE_LINKS } from "../src/lib/sister-sites";
import { SISTER_SITES } from "../src/lib/registry";

/**
 * Drift test for the footer's one sister link table (W5). The table must agree
 * with the Estate Kit's site registry and the council registry, so a renamed or
 * moved site is caught here before a footer points at the wrong address.
 */
const kit = JSON.parse(readFileSync(join(process.cwd(), "src/vendor/estate-kit/tokens/tokens.json"), "utf8")).sites as Record<string, { name: string; domain: string }>;
const ecosystemOrigin = (file: string) => JSON.parse(readFileSync(join(process.cwd(), "data/ecosystem", file), "utf8")).origin as string;

describe("the sister site link table", () => {
  it("puts UK Councils first and lists each site once", () => {
    expect(SISTER_SITE_LINKS[0]).toMatchObject({ key: "ukcouncils", name: "UK Councils", url: "https://ukcouncils.co.uk/" });
    expect(new Set(SISTER_SITE_LINKS.map((s) => s.key)).size).toBe(SISTER_SITE_LINKS.length);
    expect(new Set(SISTER_SITE_LINKS.map((s) => s.url)).size).toBe(SISTER_SITE_LINKS.length);
  });

  it("matches the kit's domain for every site the kit lists, and the checked sitemap origin for UK Places", () => {
    for (const site of SISTER_SITE_LINKS) {
      const entry = kit[site.key];
      if (entry) expect(site.url, site.key).toBe(`https://${entry.domain}/`);
      else expect(site.key).toBe("ukplaces");
    }
    expect(new URL(SISTER_SITE_LINKS.find((s) => s.key === "ukplaces")!.url).origin).toBe(new URL(ecosystemOrigin("ukplaces-sitemap.json")).origin);
  });

  it("uses the council registry's names where the registry has the site", () => {
    for (const site of SISTER_SITE_LINKS) {
      const name = (SISTER_SITES as Record<string, string>)[site.key];
      if (name) expect(site.name, site.key).toBe(name);
    }
  });

  it("links home pages only, over https, with no figures and a checked date", () => {
    for (const site of SISTER_SITE_LINKS) {
      const url = new URL(site.url);
      expect(url.protocol).toBe("https:");
      expect(url.pathname, site.key).toBe("/");
      expect(site.blurb, site.key).not.toMatch(/\d/);
      expect(site.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("leaves out Asylum Stats (decision N2) and the campaign sites", () => {
    const urls = SISTER_SITE_LINKS.map((s) => s.url).join(" ");
    expect(urls).not.toContain("asylumstats");
    expect(urls).not.toContain("tompickup");
  });

  it("is the footer's only source of sister links", () => {
    const footer = readFileSync(join(process.cwd(), "src/components/SiteFooter.astro"), "utf8");
    expect(footer).toContain("SISTER_SITE_LINKS");
    expect(footer).not.toMatch(/https?:\/\//);
  });
});
