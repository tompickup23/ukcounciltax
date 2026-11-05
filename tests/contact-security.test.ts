import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { CONTACT_EMAIL, NAV_GROUPS, SITE_NAME, SITE_URL, absoluteUrl } from "../src/lib/site";
import { YEARS, loadYear } from "../src/lib/council-tax";
import { llmsText } from "../src/pages/llms.txt";
import { scriptSrcOf } from "../scripts/inject_csp_hashes.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const read = (...parts: string[]) => readFileSync(join(ROOT, ...parts), "utf8");
// Built from parts so this file does not carry the characters it looks for.
const DASHES = new RegExp(`[\\u${"2013"}\\u${"2014"}]|${[" ", "-", " "].join("")}`);

describe("contact and corrections mailbox", () => {
  it("uses the shared UK Councils mailbox the owner chose (register R353)", () => {
    expect(CONTACT_EMAIL).toBe("info@ukcouncils.co.uk");
  });

  it("shows the address as a mailto link on /contact/ and /corrections/", () => {
    for (const page of ["contact.astro", "corrections.astro"]) {
      const source = read("src", "pages", page);
      expect(source, page).toContain("CONTACT_EMAIL");
      expect(source, page).toContain("href={`mailto:${CONTACT_EMAIL}`}");
      expect(source, page).toContain("data-contact-email");
    }
  });

  it("states the corrections route plainly", () => {
    const corrections = read("src", "pages", "corrections.astro");
    expect(corrections).toContain("How to report an error");
    expect(corrections).toMatch(/Email corrections to/);
    expect(read("src", "pages", "contact.astro")).toMatch(/including factual corrections/);
  });
});

describe("security.txt", () => {
  const text = read("public", ".well-known", "security.txt");
  const field = (name: string) =>
    text.split("\n").filter((line) => line.startsWith(`${name}: `)).map((line) => line.slice(name.length + 2).trim());

  it("has the RFC 9116 fields this brief asks for", () => {
    expect(field("Contact")).toEqual([`mailto:${CONTACT_EMAIL}`]);
    expect(field("Preferred-Languages")).toEqual(["en"]);
    expect(field("Canonical")).toEqual([`${SITE_URL}/.well-known/security.txt`]);
  });

  it("expires once, in the future, no more than a year ahead", () => {
    const expires = field("Expires");
    expect(expires).toHaveLength(1);
    expect(expires[0]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    const when = Date.parse(expires[0]);
    expect(when).toBeGreaterThan(Date.now());
    expect(when - Date.now()).toBeLessThanOrEqual(366 * 24 * 60 * 60 * 1000);
  });

  it("carries only known fields and no dash", () => {
    const known = new Set(["Contact", "Expires", "Preferred-Languages", "Canonical"]);
    for (const line of text.split("\n").filter(Boolean)) expect(known.has(line.split(":")[0]), line).toBe(true);
    expect(text).not.toMatch(DASHES);
  });
});

describe("llms.txt", () => {
  const text = llmsText();

  it("types no figure: the route source holds no digit beyond the encoding name", () => {
    expect(read("src", "pages", "llms.txt.ts").replace(/utf-?8/gi, "")).not.toMatch(/\d/);
  });

  it("follows the llmstxt.org shape", () => {
    expect(text.startsWith(`# ${SITE_NAME}\n\n> `)).toBe(true);
    expect(text).toContain("\n## Sources\n");
    expect(text.endsWith("\n")).toBe(true);
  });

  it("lists every main section from NAV_GROUPS on the canonical origin", () => {
    for (const group of NAV_GROUPS) {
      expect(text).toContain(`\n## ${group.label}\n`);
      for (const item of group.items) expect(text).toContain(`(${absoluteUrl(item.href)})`);
    }
  });

  it("names every England source edition and the devolved publishers", () => {
    for (const year of YEARS) expect(text).toContain(loadYear(year).source.title);
    expect(text).toContain("Scottish Government");
    expect(text).toContain("Welsh Government");
    expect(text).toContain("Office for National Statistics");
    expect(text).not.toMatch(/file type:|file size:/i);
  });

  it("gives the contact address and holds no dash", () => {
    expect(text).toContain(`${CONTACT_EMAIL}`);
    expect(text).not.toMatch(DASHES);
  });
});

describe("pages.dev noindex in public/_headers", () => {
  const headers = read("public", "_headers");
  const blocks = headers.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  // The production rules exactly as they stood before the pages.dev rules were
  // added. Any change here is a change to the live site and belongs in its own
  // pull request.
  const PRODUCTION = [
    [
      "/*",
      "  X-Content-Type-Options: nosniff",
      "  X-Frame-Options: DENY",
      "  Referrer-Policy: strict-origin-when-cross-origin",
      "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
      "  Strict-Transport-Security: max-age=31536000; includeSubDomains",
      "  Cross-Origin-Opener-Policy: same-origin",
      "  X-XSS-Protection: 0",
      "  Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.postcodes.io https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; manifest-src 'self'",
    ].join("\n"),
    ["/_astro/*", "  Cache-Control: public, max-age=31536000, immutable"].join("\n"),
  ];

  it("leaves the production host rules unchanged", () => {
    const pathRules = headers.split(/\n\s*\n/).filter((block) => block.trim() && !block.trim().startsWith("https://"));
    expect(pathRules.map((block) => block.replace(/^\n+|\n+$/g, ""))).toEqual(PRODUCTION);
  });

  it("adds noindex for the pages.dev project host and its preview hosts only", () => {
    // Cloudflare Pages _headers: an absolute URL must begin with https, a
    // placeholder is a colon and a name, and a request inherits the headers of
    // every rule it matches. Rules with the pages.dev host do not match
    // requests to ukcounciltax.co.uk.
    const hosted = blocks.filter((block) => block.startsWith("https://"));
    expect(hosted).toEqual([
      "https://ukcounciltax.pages.dev/*\n  X-Robots-Tag: noindex",
      "https://:version.ukcounciltax.pages.dev/*\n  X-Robots-Tag: noindex",
    ]);
    expect(headers).not.toMatch(/ukcounciltax\.co\.uk/);
    for (const block of hosted) expect(block).not.toMatch(/\*.*\*/);
  });

  it("keeps one CSP line, so the hash step and its readers still find the production policy", () => {
    expect(headers.match(/Content-Security-Policy:/g)).toHaveLength(1);
    expect(scriptSrcOf(headers)).toEqual(["'self'", "'wasm-unsafe-eval'", "https://static.cloudflareinsights.com"]);
  });

  it("stays within the documented limits", () => {
    expect(blocks.length).toBeLessThanOrEqual(100);
    for (const line of headers.split("\n")) expect(line.length).toBeLessThanOrEqual(2000);
  });
});
