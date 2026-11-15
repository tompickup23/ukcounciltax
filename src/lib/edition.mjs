/**
 * The year switch, driven by data presence (C6, docs/C6-STAGING-BRIEF.md).
 *
 * The site leads with the latest year for which both of these exist:
 *
 *   1. the levels file, data/council-tax/england-<year>.json, written by
 *      scripts/fetch-council-tax.mjs from MHCLG's Tables 1 to 9 workbook;
 *   2. that year's Table 10 import, written by scripts/import-national.mjs,
 *      carrying the reviewed SHA-256 of the Table 10 file it read. The import
 *      for a year is data/national/england-<year>.json, or for the edition the
 *      site launched with, data/national/england.json when its year matches.
 *
 * A levels file without its Table 10 import is held, not shown: the site stays
 * on the year before until both have landed, so a release is published whole
 * or not at all. No flag, no environment variable and no date is read, so the
 * release pull request adds data files and nothing else.
 *
 * Plain JavaScript so that the build scripts (check-dist, the importers, the
 * rehearsal) and the Astro pages read one rule. Every path resolves from the
 * root passed in, which defaults to process.cwd().
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LEVELS = /^england-(\d{4}-\d{2})\.json$/;
const SHA256 = /^[0-9a-f]{64}$/;

/** A year label in the words MHCLG titles use: the start year, "to", the end year. */
export function yearWords(year) {
  return year.replace(/^(\d{4})-(\d{2})$/, (_m, a, b) => `${a} to 20${b}`);
}

/** The year label after a year label. */
export function nextYearOf(year) {
  const start = Number(year.slice(0, 4)) + 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

/** The years with a levels file, oldest first. */
export function levelsYears(root = process.cwd()) {
  const dir = join(root, "data", "council-tax");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((name) => LEVELS.exec(name)?.[1])
    .filter(Boolean)
    .sort();
}

const jsonCache = new Map();
function readJson(path) {
  if (!jsonCache.has(path)) jsonCache.set(path, JSON.parse(readFileSync(path, "utf-8")));
  return jsonCache.get(path);
}

/**
 * The Table 10 import for a year, or null. A year named file wins; the
 * unnamed launch file counts only when the year inside it matches.
 */
export function nationalPath(year, root = process.cwd()) {
  const named = join(root, "data", "national", `england-${year}.json`);
  if (existsSync(named)) return named;
  const launch = join(root, "data", "national", "england.json");
  if (existsSync(launch) && readJson(launch).year === year) return launch;
  return null;
}

/**
 * Whether a year's Table 10 import is complete enough to switch on: the file
 * exists, says it is that year, and records a reviewed SHA-256 for a Table 10
 * file whose title names the year.
 */
export function table10Pinned(year, root = process.cwd()) {
  const path = nationalPath(year, root);
  if (!path) return false;
  const data = readJson(path);
  const source = data.sources?.components;
  return data.year === year
    && typeof source?.sha256 === "string" && SHA256.test(source.sha256)
    && typeof source.title === "string" && source.title.includes(yearWords(year))
    && /Table 10/.test(source.title);
}

/**
 * The edition the site builds: the current year, the years shown, and any
 * levels file held back because its Table 10 import has not landed.
 */
export function resolveEdition(root = process.cwd()) {
  const years = levelsYears(root);
  const ready = years.filter((year) => table10Pinned(year, root));
  const current = ready.at(-1);
  if (!current) throw new Error(`No year has both a levels file and a pinned Table 10 import under ${root}/data`);
  const shown = years.filter((year) => year <= current);
  for (let i = 1; i < shown.length; i++) {
    if (shown[i] !== nextYearOf(shown[i - 1])) throw new Error(`Levels files are not consecutive: ${shown.join(", ")}`);
  }
  if (shown.length < 2) throw new Error(`The current year ${current} needs the year before it for every change`);
  return {
    current,
    previous: shown.at(-2),
    years: shown,
    next: nextYearOf(current),
    held: years.filter((year) => year > current),
  };
}

/** The same edition, read once per root. */
const editions = new Map();
export function edition(root = process.cwd()) {
  if (!editions.has(root)) editions.set(root, resolveEdition(root));
  return editions.get(root);
}
