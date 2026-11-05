import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { YEARS, loadYear } from "../src/lib/council-tax";

// The house rule: every Band D figure has its source line directly under it,
// and the parish precept caveat directly under that. The caveat text is the
// one the homepage uses under the same England figure.
const ROOT = resolve(import.meta.dirname, "..");
const CAVEAT = '<p class="caveat">Includes adult social care and average parish precepts.</p>';
const BUILT_CAVEAT = /^<p class="caveat"[^>]*>Includes adult social care and average parish precepts\.<\/p>/;
const BUILT = join(ROOT, "dist", "increases", "index.html");

/** Each Fact block whose label names Band D, with the HTML that follows it. */
function bandDFacts(html: string) {
  const facts: { label: string; inner: string; after: string }[] = [];
  const open = /<div class="fact[^"]*"[^>]*data-fact[^>]*>/g;
  for (const match of html.matchAll(open)) {
    const start = match.index! + match[0].length;
    // A Fact holds no nested div, so its first closing div ends it.
    const end = html.indexOf("</div>", start);
    const inner = html.slice(start, end);
    const label = /<span class="fact-label"[^>]*>([^<]*)<\/span>/.exec(inner)?.[1] ?? "";
    if (label.includes("Band D")) facts.push({ label, inner, after: html.slice(end + "</div>".length) });
  }
  return facts;
}

describe("the parish caveat on /increases/", () => {
  const yearsWithArea = YEARS.filter((y) => loadYear(y).england.areaBandD);

  it("follows the England Band D figure in the page source, in every year section", () => {
    const page = readFileSync(join(ROOT, "src", "pages", "increases.astro"), "utf-8");
    const facts = [...page.matchAll(/<Fact label=\{`Average area Band D[^]*?\/>/g)];
    expect(facts.length).toBeGreaterThan(0);
    for (const fact of facts) expect(page.slice(fact.index! + fact[0].length).startsWith(CAVEAT)).toBe(true);
  });

  it.skipIf(!existsSync(BUILT))("puts the source line and then the caveat directly under every Band D figure on the built page", () => {
    const html = readFileSync(BUILT, "utf-8");
    const facts = bandDFacts(html);
    expect(facts.map((f) => f.label).sort()).toEqual(
      yearsWithArea.map((y) => `Average area Band D, England, ${y.replace("-", "/")}`).sort(),
    );
    for (const fact of facts) {
      expect(fact.inner.trimEnd(), `${fact.label}: source line last in the fact`).toMatch(/<p class="source-line"[^>]*>[^]*<\/p>$/);
      expect(fact.inner.match(/<p class="source-line"/g)?.length, fact.label).toBe(1);
      // Scoped styles may add a data-astro-cid attribute to the paragraph.
      expect(fact.after.trimStart(), `${fact.label}: caveat directly after`).toMatch(BUILT_CAVEAT);
    }
  });
});
