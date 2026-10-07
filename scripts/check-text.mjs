/**
 * House text sweep over the built tree. Run by `npm run test:text` after
 * `npm run build`.
 *
 * `check-dist.mjs` already rejects literal en and em dashes and their named
 * entities. This catches the rest of the house rule in what ships:
 *   * numeric entities for either dash, decimal or hex
 *   * JSON escapes for either dash, as in a JSON-LD block or a data file
 *   * a spaced hyphen standing in for a dash, in visible text, JSON-LD,
 *     JSON, XML and plain text
 *
 * Scripts (other than JSON and JSON-LD), styles and inline style attributes
 * are stripped first, since a spaced hyphen there is arithmetic, not prose.
 * Body names are verbatim titles and keep their own punctuation, so every
 * `name` in the national table and the adopted local schedules is exempt.
 *
 * Exits non-zero naming each file with the first offending context.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = process.cwd();
const DIST = resolve(ROOT, "dist");
const LOCAL_BILLS = resolve(ROOT, "data", "local-bills");
const NAME_SOURCES = [
  resolve(ROOT, "data", "national", "england.json"),
  ...readdirSync(LOCAL_BILLS)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(LOCAL_BILLS, name)),
];
// Built from parts so this file does not carry the characters it looks for.
const DASH_CHARS = `\\u${"2013"}\\u${"2014"}`;
const OFFENCE = new RegExp(`[${DASH_CHARS}]| - |\\\\u201[34]`, "i");

if (!existsSync(DIST)) {
  console.error("dist/ is not there. Run npm run build first.");
  process.exit(1);
}

const names = new Set();
function collectNames(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (key === "name" && typeof item === "string") names.add(item);
    else collectNames(item);
  }
}
for (const file of NAME_SOURCES) collectNames(JSON.parse(readFileSync(file, "utf8")));

const decode = (text) =>
  text
    .replace(/&(?:mdash|ndash);/gi, "—")
    .replace(/&#(?:x201[34]|821[12]);/gi, "—")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&amp;/g, "&");

// Names that themselves contain a dash or spaced hyphen, decoded once.
const verbatim = [...names].filter((name) => OFFENCE.test(name)).map(decode);

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (/\.(html|json|xml|txt)$/.test(entry.name)) yield path;
  }
}

function visible(html) {
  return html
    .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (match, attrs) =>
      /type="application\/(?:ld\+)?json"/i.test(attrs) ? match : "",
    )
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/ style="[^"]*"/g, "");
}

const failures = [];
let checked = 0;
for (const path of files(DIST)) {
  let text = readFileSync(path, "utf8");
  if (path.endsWith(".html")) text = visible(text);
  text = decode(text);
  for (const name of verbatim) text = text.replaceAll(name, "VERBATIM BODY NAME");
  const match = OFFENCE.exec(text);
  if (match) {
    const context = text.slice(Math.max(0, match.index - 75), match.index + 110).replace(/\s+/g, " ");
    failures.push(`${relative(DIST, path)}: ${context}`);
  }
  checked++;
}

if (failures.length) {
  console.error(`Text sweep: ${failures.length} of ${checked} files fail the dash rule.`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
console.log(`Text sweep: ${checked} files, no dashes or pseudo-dashes outside verbatim body names.`);
