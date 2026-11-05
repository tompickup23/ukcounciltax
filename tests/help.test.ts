import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { OFFICIAL_BAND_CHECK } from "../src/lib/site";

const source = readFileSync(join(process.cwd(), "src", "pages", "help.astro"), "utf8");
const body = source.split(/^---$/m).slice(2).join("---");

// Built from parts so this file does not carry the characters it looks for.
const DASHES = new RegExp(
  [
    `[\\u${"2013"}\\u${"2014"}]`,
    [" ", "-", " "].join(""),
    "&(?:mdash|ndash);",
    "&#(?:x201[34]|821[12]);",
    "\\\\u201[34]",
  ].join("|"),
  "i",
);

const blocks = [...body.matchAll(/<section class="claim-block"[^>]*>([\s\S]*?)<\/section>/g)].map((m) => m[1]);

describe("help page band sections", () => {
  it("has the band question heading with its stable anchor", () => {
    expect(body).toMatch(/<h2 id="what-council-tax-band-am-i">What council tax band am I\?<\/h2>/);
  });

  it("points the band question to the official lookup named in site.ts", () => {
    expect(source).toContain("import { OFFICIAL_BAND_CHECK } from '../lib/site'");
    expect(blocks[0]).toContain("href={OFFICIAL_BAND_CHECK}");
    expect(OFFICIAL_BAND_CHECK).toBe("https://www.gov.uk/council-tax-bands");
  });

  it("has the checking and challenging section with both checks, the warning and contacts", () => {
    for (const id of [
      "checking-and-challenging-a-band",
      "check-one-similar-homes",
      "check-two-valuation-date",
      "band-can-go-up",
      "who-to-contact",
    ]) {
      expect(body).toContain(`id="${id}"`);
    }
  });

  it("follows every claim paragraph with a source line naming the page part and access date", () => {
    expect(blocks.length).toBeGreaterThanOrEqual(5);
    for (const block of blocks) {
      const paragraphs = [...block.matchAll(/<p( class="source-line")?>[\s\S]*?<\/p>/g)];
      expect(paragraphs.length).toBeGreaterThan(0);
      // Paragraphs alternate claim then source line, ending on a source line.
      paragraphs.forEach((p, index) => expect(Boolean(p[1])).toBe(index % 2 === 1));
      for (const p of paragraphs.filter((match) => match[1])) {
        expect(p[0]).toMatch(/^<p class="source-line">Source: GOV\.UK, /);
        expect(p[0]).toContain("Accessed {ACCESSED}.");
      }
    }
    expect(source).toMatch(/const ACCESSED = '\d{1,2} [A-Z][a-z]+ \d{4}';/);
  });

  it("names challenge guidance parts by number", () => {
    expect(body).toContain("part 1 (Overview)");
    expect(body).toContain("part 3 (When you do not have a legal right to make a challenge)");
    expect(body).toContain("part 4 (How to challenge)");
    expect(body).toContain("part 5 (After you make a challenge)");
  });

  it("offers no tool, form or value estimate", () => {
    expect(body).not.toMatch(/<(?:form|input|select|script)\b/i);
    expect(body).not.toMatch(/£/);
  });

  it("carries no dashes or dash entities", () => {
    expect(source).not.toMatch(DASHES);
  });
});
