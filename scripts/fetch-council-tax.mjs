/**
 * Council tax levels for every billing authority in England, from MHCLG.
 *
 *   node scripts/fetch-council-tax.mjs                  fetch and write the published years
 *   node scripts/fetch-council-tax.mjs --year 2027-28   one year, including a staged one
 *   node scripts/fetch-council-tax.mjs --offline        parse the raw folder only, no fetch
 *   --raw <dir>   where downloads and manifests go (default data/raw, gitignored)
 *   --out <dir>   where the year files go (default data/council-tax)
 *
 * A staged year (the next levels release, C6) is fetched only when named with
 * --year, on release morning (docs/D5-BUDGET-SEASON-2027.md, section 5). Its
 * statistics page and attachment titles are derived from the year, so the same
 * code reads 2027 to 2028 as it read 2026 to 2027. The parser and its refusals
 * live in scripts/lib/levels.mjs, which tests/levels-import.test.ts exercises.
 *
 * For each year it asks the GOV.UK content API for the statistics page, finds
 * the spreadsheet attachments by their titles, downloads them to data/raw/
 * (gitignored) and writes data/council-tax/england-<year>.json.
 *
 * What it reads, by title and header, never by table number (the band table is
 * Table 9 in 2025-26 and 2026-27 and Table 8 in 2024-25):
 *
 *   the band table   "Area council tax for a dwelling occupied by two adults by
 *                    band": every billing authority, all eight bands as
 *                    published. Nothing is derived from Band D.
 *   the own tables   "Council tax (average Band D) ... London boroughs,
 *                    metropolitan districts and unitary authorities", "...
 *                    shire counties" and "... shire districts": the
 *                    authority's own Band D and its published change.
 *   England tables   the class averages, the Band D history and the area
 *                    averages by type, where the workbook carries them.
 *   notes            the note text every row refers to.
 *
 * It refuses to write, and exits non-zero, when any authority row is missing
 * a band or is short, when an authority has no own figures row, when the set of
 * authorities or counties differs from the year before without a reviewed
 * succession record, or when a row refers to a note the workbook does not
 * define. A figure the table marks [x] or [z] is null in the output and absent
 * on the site. With several years, one refusal stops every write.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { readOds } from "./lib/ods.mjs";
import { assemble, houseText } from "./lib/levels.mjs";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const RAW = resolve(option("--raw") ?? join(ROOT, "data", "raw"));
const OUT = resolve(option("--out") ?? join(ROOT, "data", "council-tax"));
const OFFLINE = args.includes("--offline");
const ONLY = args.flatMap((a, i) => (a === "--year" ? [args[i + 1]] : []));

const PUBLISHER = "Ministry of Housing, Communities and Local Government";
const LICENCE = "Open Government Licence v3.0";
const LICENCE_URL = "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/";

/** "2027-28" to "2027 to 2028". */
const words = (year) => year.replace(/^(\d{4})-(\d{2})$/, (_m, a, b) => `${a} to 20${b}`);
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A recent year's statistics page and workbook, from its label alone: the page
 * slug and the "Tables 1 to N" attachment title MHCLG used for 2025 to 2026 and
 * 2026 to 2027. Table 10 is a separate attachment, read by import-national.mjs.
 */
function recentYear(year, staged = false) {
  return {
    year,
    staged,
    slug: `council-tax-levels-set-by-local-authorities-in-england-${words(year).replace(/ /g, "-")}`,
    attachments: [new RegExp(`^Council Tax levels set by local authorities in England ${escape(words(year))}: Tables 1 to \\d+`)],
  };
}

/**
 * The years held, and the staged one. `attachments` picks the files off the
 * statistics page by title: one workbook for the recent years, two
 * single-table files for 2024-25, which MHCLG published table by table.
 */
const YEARS = [
  recentYear("2027-28", true),
  recentYear("2026-27"),
  recentYear("2025-26"),
  {
    year: "2024-25",
    slug: "council-tax-levels-set-by-local-authorities-in-england-2024-to-2025",
    attachments: [/^Table 8: Area council tax for a dwelling occupied by 2 adults by band/, /^Table 7: /],
  },
];

async function page(slug) {
  const url = `https://www.gov.uk/api/content/government/statistics/${slug}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function download(url, path) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  writeFileSync(path, bytes);
  return bytes;
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Fetches (or, offline, re-reads) one year's files and returns their descriptions. */
async function filesFor(config) {
  const manifestPath = join(RAW, `council-tax-${config.year}.manifest.json`);
  if (OFFLINE) {
    if (!existsSync(manifestPath)) throw new Error(`--offline and no ${manifestPath}`);
    return JSON.parse(readFileSync(manifestPath, "utf-8"));
  }
  const content = await page(config.slug);
  const attachments = content.details?.attachments ?? [];
  const files = config.attachments.map((pattern) => {
    const hits = attachments.filter((a) => pattern.test(a.title ?? "") && /\.ods$/i.test(a.url ?? ""));
    if (hits.length !== 1) {
      throw new Error(`${config.year}: expected one .ods attachment matching ${pattern}, found ${hits.length}`);
    }
    return hits[0];
  });
  const described = [];
  for (const attachment of files) {
    const name = attachment.url.split("/").pop();
    const path = join(RAW, `${config.year}-${name}`);
    const bytes = await download(attachment.url, path);
    described.push({
      title: houseText(attachment.title),
      url: attachment.url,
      file: name,
      path,
      sha256: sha256(bytes),
    });
  }
  const principles = await referendumPrinciples(attachments);
  const manifest = {
    principles,
    pageTitle: houseText(content.title),
    pageUrl: `https://www.gov.uk/government/statistics/${config.slug}`,
    firstPublished: content.first_published_at?.slice(0, 10) ?? null,
    updated: content.public_updated_at?.slice(0, 10) ?? null,
    files: described,
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

/**
 * The referendum principles for the year, quoted from the technical notes
 * that accompany the tables: the section headed "Referendum principles", up
 * to the next numbered section. Null when the year's notes have no such
 * section; a page then states no principle rather than one from memory.
 */
async function referendumPrinciples(attachments) {
  const notes = attachments.find((a) => /technical notes/i.test(a.title ?? "") && !/\.(ods|xlsx|pdf)$/i.test(a.url ?? ""));
  if (!notes) return null;
  const url = notes.url.startsWith("http") ? notes.url : `https://www.gov.uk${notes.url}`;
  const response = await fetch(url.replace("https://www.gov.uk/", "https://www.gov.uk/api/content/"));
  if (!response.ok) return null;
  const body = (await response.json()).details?.body ?? "";
  const text = body
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");
  // The section runs to the next numbered heading, which is "5.28 Title" or
  // "6. Title" depending on where it falls in the document.
  const match = /(\d+\.\d+) Referendum principles (.+?)(?= \d+(?:\.\d+|\.) [A-Z][a-z]+|$)/.exec(text);
  if (!match) return null;
  return { section: match[1], text: houseText(match[2]), title: houseText(notes.title), url };
}


/** The year before's data file, from the output folder or the held data. */
function previousFor(year) {
  const start = Number(year.slice(0, 4)) - 1;
  const before = `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
  for (const dir of [OUT, join(ROOT, "data", "council-tax")]) {
    const path = join(dir, `england-${before}.json`);
    if (existsSync(path)) return JSON.parse(readFileSync(path, "utf-8"));
  }
  return null;
}

/** A reviewed succession record for the year, when one exists. */
function successionFor(year) {
  const path = join(ROOT, "data", "council-tax", `succession-${year}.json`);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf-8")) : null;
}

async function build(config) {
  const manifest = await filesFor(config);
  const sheets = manifest.files.flatMap((f) => readOds(join(RAW, f.path.split("/").pop())));
  const data = assemble({
    year: config.year,
    sheets,
    manifest,
    // A year already in the output folder is a refetch; one that is not is incoming.
    held: existsSync(join(OUT, `england-${config.year}.json`)) ? JSON.parse(readFileSync(join(OUT, `england-${config.year}.json`), "utf-8")) : null,
    previous: previousFor(config.year),
    succession: successionFor(config.year),
    generated: new Date().toISOString().slice(0, 10),
    publisher: PUBLISHER,
    licence: LICENCE,
    licenceUrl: LICENCE_URL,
  });
  const outPath = join(OUT, `england-${config.year}.json`);
  return { config, data, outPath };
}

const chosen = ONLY.length ? ONLY.map((year) => YEARS.find((y) => y.year === year) ?? recentYear(year, true)) : YEARS.filter((y) => !y.staged);
mkdirSync(RAW, { recursive: true });
const built = [];
let failed = false;
for (const config of chosen) {
  try {
    built.push(await build(config));
  } catch (error) {
    failed = true;
    console.error(`council tax ${config.year}: ${error instanceof Error ? error.message : error}`);
  }
}
// Nothing is written unless every year asked for passed: no partial publication.
if (failed) process.exit(1);
mkdirSync(OUT, { recursive: true });
for (const { config, data, outPath } of built) {
  writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`);
  const count = Object.keys(data.authorities).length;
  console.log(
    `council tax ${config.year}: ${count} authorities, ${count} with own Band D, `
      + `${Object.keys(data.counties).length} counties, ${data.source.bandTable}, written ${outPath.replace(`${ROOT}/`, "")}`,
  );
}
