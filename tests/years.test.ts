import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  CURRENT_YEAR,
  NEXT_YEAR,
  NEXT_YEAR_PATH,
  PREVIOUS_YEAR,
  YEARS,
  followingYear,
  increasesYearPath,
  precedingYear,
  startYear,
  yearLabel,
  yearWords,
} from "../src/lib/council-tax";
import { NEXT_EDITION_STATUS } from "../src/lib/council-metadata";
import { RELEASES, SETTING_DEADLINE, releaseSentence, settingDeadline } from "../src/lib/next-year";
import { NAV_GROUPS, STATIC_PATHS } from "../src/lib/site";
import { sitemapPaths } from "../src/pages/sitemap.xml";

const ROOT = resolve(import.meta.dirname, "..");
const rel = (path: string) => path.replace(`${ROOT}/`, "");

function walk(dir: string, pattern: RegExp, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, pattern, out);
    else if (pattern.test(entry.name)) out.push(path);
  }
  return out;
}

describe("the year variable", () => {
  it("leads with the last year in YEARS, and the previous year is the one before it", () => {
    expect(CURRENT_YEAR).toBe(YEARS.at(-1));
    expect(PREVIOUS_YEAR).toBe(YEARS.at(-2));
    expect(PREVIOUS_YEAR).toBe(precedingYear(CURRENT_YEAR));
    for (let i = 1; i < YEARS.length; i++) expect(YEARS[i]).toBe(followingYear(YEARS[i - 1]));
  });

  it("derives the next year and its page from the current year", () => {
    expect(NEXT_YEAR).toBe(followingYear(CURRENT_YEAR));
    expect(NEXT_YEAR_PATH).toBe(`/council-tax-${NEXT_YEAR}/`);
    expect(followingYear("2026-27")).toBe("2027-28");
    expect(followingYear("2098-99")).toBe("2099-00");
    expect(precedingYear("2027-28")).toBe("2026-27");
    expect(precedingYear("2000-01")).toBe("1999-00");
    expect(startYear("2027-28")).toBe(2027);
  });

  it("has one label helper", () => {
    expect(yearLabel("2026-27")).toBe("2026/27");
    expect(yearLabel(NEXT_YEAR)).toBe(NEXT_YEAR.replace("-", "/"));
    expect(NEXT_EDITION_STATUS.startsWith(`${yearLabel(NEXT_YEAR)} charges`)).toBe(true);
  });

  it("is not typed as a year label in any template", () => {
    // A year label is 2026/27 or 2026-27, but not part of an ISO date or a
    // web address. The year comes from src/lib/council-tax.ts or a data file.
    const LABEL = /(?<![\d/-])(?:19|20)\d{2}[/-]\d{2}(?![\d/-])/g;
    const URL = /https?:\/\/[^\s"'`)<>]+/g;
    const SOURCE = "src/lib/council-tax.ts";
    // Each permitted occurrence, by file and the exact text around it.
    const ALLOWED: { file: string; text: string; why: string }[] = [
      { file: "src/lib/next-year.ts", text: '"Council Tax Assumptions, 2027-28"', why: "verbatim Scottish Government title, checked against NEXT_YEAR below" },
      { file: "src/lib/next-year.ts", text: '"Report Forthcoming Publications 2026-27.xlsx"', why: "verbatim file name with its checksum" },
      { file: "src/pages/data.astro", text: "year === '2024-25'", why: "data reader: the 2024-25 file names its tables differently" },
      { file: "src/pages/data.astro", text: "series from 1993/94", why: "historic series start, a property of the source" },
      { file: "src/pages/data.astro", text: "'MD3472: approval of 2026/27 council tax and precepts'", why: "verbatim GLA decision title" },
      { file: "src/pages/data.astro", text: "'2026/27; approved 26 February 2026'", why: "the edition of one fixed GLA decision" },
      { file: "src/pages/coverage.astro", text: "series from 1993/94", why: "historic series start, a property of the source" },
      { file: "src/components/LongTaxHistory.astro", text: "series begins in 1996/97", why: "historic series start, a property of the source" },
    ];
    // Owned by a parallel change and outside this one; listed so the test
    // names them rather than skipping them silently.
    const PENDING = new Set(["src/pages/precepts.astro"]);
    const offenders: string[] = [];
    for (const path of walk(join(ROOT, "src"), /\.(astro|ts|tsx|js|mjs)$/)) {
      const file = rel(path);
      if (file === SOURCE || PENDING.has(file)) continue;
      let text = readFileSync(path, "utf-8").replace(URL, "");
      for (const allowed of ALLOWED.filter((a) => a.file === file)) text = text.split(allowed.text).join("");
      for (const match of text.matchAll(LABEL)) offenders.push(`${file}: ${match[0]}`);
    }
    expect(offenders, `typed year labels: ${offenders.join(", ")}`).toEqual([]);
    for (const allowed of ALLOWED) expect(readFileSync(join(ROOT, allowed.file), "utf-8")).toContain(allowed.text);
  });
});

describe("the evergreen increases page", () => {
  const page = readFileSync(join(ROOT, "src", "pages", "increases.astro"), "utf-8");

  it("renders one section per year in YEARS, anchored by the year", () => {
    expect(page).toContain("YEARS.slice().reverse().map(yearSection)");
    expect(page).toContain("id={s.year}");
    expect(page).toContain("id={NEXT_YEAR}");
    expect(page).toContain("href={NEXT_YEAR_PATH}");
    expect(increasesYearPath(CURRENT_YEAR)).toBe(`/increases/#${CURRENT_YEAR}`);
  });

  it("keeps the old rises address as a 301 to the 2026/27 section", () => {
    const redirects = readFileSync(join(ROOT, "public", "_redirects"), "utf-8")
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"))
      .map((line) => line.trim().split(/\s+/));
    expect(redirects).toContainEqual(["/council-tax/rises-2026-27/", "/increases/#2026-27", "301"]);
    expect(redirects).toContainEqual(["/council-tax/rises-2026-27", "/increases/#2026-27", "301"]);
    expect(YEARS as readonly string[]).toContain("2026-27");
    // A page at the old address would be served instead of the redirect.
    expect(existsSync(join(ROOT, "src", "pages", "council-tax", "rises-2026-27.astro"))).toBe(false);
    expect(STATIC_PATHS as readonly string[]).not.toContain("/council-tax/rises-2026-27/");
    const hrefs = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).toContain(increasesYearPath(CURRENT_YEAR));
    expect(hrefs.some((h) => h.includes("rises-"))).toBe(false);
  });
});

describe("the next year page", () => {
  const file = join(ROOT, "src", "pages", `council-tax-${NEXT_YEAR}.astro`);

  it("exists under NEXT_YEAR and is listed in STATIC_PATHS and the sitemap", () => {
    expect(existsSync(file), `rename the page to council-tax-${NEXT_YEAR}.astro`).toBe(true);
    expect(STATIC_PATHS as readonly string[]).toContain(NEXT_YEAR_PATH);
    expect(sitemapPaths()).toContain(NEXT_YEAR_PATH);
    expect(sitemapPaths().some((p) => p.includes("rises-"))).toBe(false);
    const hrefs = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).toContain(NEXT_YEAR_PATH);
  });

  it("carries no pound sign and no figure for a council or band", () => {
    for (const source of [file, join(ROOT, "src", "lib", "next-year.ts")]) {
      const text = readFileSync(source, "utf-8");
      expect(text).not.toContain("£");
      expect(text).not.toMatch(/&pound;|&#163;|\\u00a3/i);
      expect(text).not.toMatch(/\b(pounds|wholePounds|moneyPence|loadYear)\(/);
    }
  });

  it("names the next year and says the figures are not yet set in its title and description", () => {
    const text = readFileSync(file, "utf-8");
    expect(text).toMatch(/title=\{`Council tax \$\{next\}[^`]*not yet set`\}/);
    expect(text).toMatch(/description=\{`Council tax for \$\{next\} is not yet set/);
  });

  it("states the England deadline from section 30(6), derived from the year", () => {
    expect(settingDeadline("2027-28")).toBe("must be set before 11 March 2027");
    expect(settingDeadline()).toBe(`must be set before 11 March ${startYear(NEXT_YEAR)}`);
    expect(SETTING_DEADLINE.section).toBe("section 30(6)");
    expect(SETTING_DEADLINE.text).toContain("before 11th March in the financial year preceding that for which it is set");
    expect(SETTING_DEADLINE.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("holds release records for the next year only, each with its access date", () => {
    expect(RELEASES.map((r) => r.nation)).toEqual(["England", "Scotland", "Wales"]);
    const england = RELEASES[0];
    expect(england.page?.title).toBe(`Council Tax levels set by local authorities in England ${yearWords(NEXT_YEAR)}`);
    expect(england.page?.url).toContain(yearWords(NEXT_YEAR).replace(/ /g, "-"));
    expect(RELEASES[1].publication).toContain(NEXT_YEAR);
    for (const release of RELEASES) {
      if (release.page) expect(release.page.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (!release.page) expect(releaseSentence(release)).toContain("not yet announced");
    }
  });
});
