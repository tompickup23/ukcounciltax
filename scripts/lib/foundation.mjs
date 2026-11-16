/**
 * The F1 gates (plan section 11.5, 16 November 2026), as pure functions that
 * scripts/check-dist.mjs runs over every built page and tests/foundation.test.ts
 * runs over markup built to fail. Each gate stops a class of fault that review
 * kept finding by hand.
 *
 * Two of them start as ratchets: pages built before F1 are allowed their size or
 * their repeated citations as measured on 16 November 2026, never more, and each
 * allowance names the page PR that removes it. A new page gets no allowance.
 */

const strip = (html) => html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, "");
const text = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/** 500 KB of HTML, the ceiling in plan section 11.5 item 4. */
export const WEIGHT_CAP = 500 * 1024;

/**
 * Pages over the ceiling when F1 landed, each capped at its F1 size plus 2%.
 * Remove a row when its page PR brings the page under 500 KB.
 */
export const WEIGHT_ALLOWANCES = [
  { pattern: /^\/increases\/index\.html$/, cap: 1_170_000, until: "Tier 2 increases page" },
  { pattern: /^\/council-tax\/index\.html$/, cap: 772_000, until: "Tier 2 national page" },
  { pattern: /^\/tools\/budget\/[^/]+\/index\.html$/, cap: 537_000, until: "W4 part two: reveal reuses the drawer charts" },
  { pattern: /^\/council-tax\/towns\/region\/[^/]+\/index\.html$/, cap: 1_110_000, until: "towns follow up: region pages split or paged" },
];

/** The byte ceiling for a page, by its path from the dist root. */
export function weightCap(pagePath) {
  return WEIGHT_ALLOWANCES.find((a) => a.pattern.test(pagePath))?.cap ?? WEIGHT_CAP;
}

/** The most times one full citation may repeat on a page; short record lines are not counted. */
export const REPEAT_CAP = 3;

/** Templates that repeated full citations when F1 landed, capped at that count. */
export const REPEAT_ALLOWANCES = [
  { pattern: /^\/tools\/budget\/[^/]+\/index\.html$/, cap: 4, until: "W4 part two: the kit chart captions in the drawer" },
  { pattern: /^\/council-tax\/[^/]+\/index\.html$/, cap: 18, until: "Tier 2 band and ranked pages" },
  { pattern: /^\/changes\/index\.html$/, cap: 13, until: "Tier 2 changes page" },
  { pattern: /^\/councils\/[^/]+\/index\.html$/, cap: 8, until: "W9 council page" },
  { pattern: /^\/compare\/index\.html$/, cap: 5, until: "W7 compare" },
];

export function repeatCap(pagePath) {
  return REPEAT_ALLOWANCES.find((a) => a.pattern.test(pagePath))?.cap ?? REPEAT_CAP;
}

/** The largest number of times one full source line's text appears on the page. */
export function repeatedCitations(html) {
  const counts = new Map();
  for (const match of strip(html).matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)) {
    const cls = /class="([^"]*)"/.exec(match[1])?.[1] ?? "";
    const classes = cls.split(/\s+/);
    if (!classes.includes("source-line") || classes.includes("record-line")) continue;
    const line = text(match[2]);
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  let max = 0;
  let line = "";
  for (const [key, value] of counts) if (value > max) [max, line] = [value, key];
  return { max, line };
}

/**
 * Every record line's "Full reference" link must land on an entry inside the
 * page's one Sources block, and a page has at most one Sources block.
 */
export function recordLineProblems(html) {
  const body = strip(html);
  const problems = [];
  const blocks = [...body.matchAll(/<section\b[^>]*\bdata-page-sources\b[^>]*>[\s\S]*?<\/section>/g)];
  if (blocks.length > 1) problems.push(`${blocks.length} Sources blocks`);
  const entries = new Set(blocks.flatMap((b) => [...b[0].matchAll(/<li\b[^>]*\bid="([^"]+)"/g)].map((m) => m[1])));
  const lines = [...body.matchAll(/<p\b[^>]*class="[^"]*\brecord-line\b[^"]*"[^>]*>([\s\S]*?)<\/p>/g)];
  for (const line of lines) {
    const target = /<a\b[^>]*class="record-full"[^>]*href="#([^"]+)"/.exec(line[1])?.[1];
    if (!target) problems.push("a record line with no full reference link");
    else if (!entries.has(target)) problems.push(`a record line points to #${target}, which is not a Sources entry`);
  }
  return problems;
}

/** At most one desk band on a page (Ledger and Desk). */
export function deskProblems(html) {
  const desks = [...strip(html).matchAll(/<(?:section|div)\b[^>]*\bclass="desk(?:\s|")/g)].length;
  return desks > 1 ? [`${desks} desk bands`] : [];
}

/**
 * A row whose group figure is unresolved prints no amount at all (plan 11.5
 * item 4). A non precepting parish keeps its published nil, which is a real
 * figure, so the gate is on the unresolved status, never on £0.00.
 */
export function unresolvedAmountProblems(html) {
  const problems = [];
  for (const row of strip(html).matchAll(/<tr\b[^>]*\bdata-unresolved\b[^>]*>([\s\S]*?)<\/tr>/g)) {
    if (/£/.test(row[1])) problems.push(`an unresolved group row prints an amount: ${/id="([^"]+)"/.exec(row[0])?.[1] ?? "unknown row"}`);
  }
  return problems;
}
