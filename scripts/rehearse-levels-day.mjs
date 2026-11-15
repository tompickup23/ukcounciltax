#!/usr/bin/env node
/**
 * The levels day rehearsal (C6, docs/C6-STAGING-BRIEF.md section 5). It never
 * touches this checkout's data or dist: it copies the repository to a folder
 * outside it, works there, and leaves the result for inspection. Nothing it
 * builds is published; the folder is refused if it sits inside the repository.
 *
 *   node scripts/rehearse-levels-day.mjs --baseline <main dist> [--dir <folder>] [--scenario real|shape] [--live]
 *
 * real (the default): 2026/27 treated as the incoming year against a 2025/26
 *   baseline. In the copy it removes the 2026/27 levels file, sets the launch
 *   Table 10 import aside, stages and imports Table 10 for 2025/26 as the baseline, checks the
 *   switch resolves to 2025/26, then runs release morning exactly as the D5
 *   runbook does for 2026/27: the levels import (incoming, checked against
 *   2025/26), the Table 10 stage step (its hash compared with the pinned one),
 *   and the Table 10 import. It checks the switch at each step, builds the
 *   copy, and compares the build with the main build by the number diff and
 *   byte for byte. With --live it also compares five main pages with the live
 *   site, so "the same as main" can be read as "the same as live".
 *
 * shape: release day's shape, which the real scenario cannot show because in
 *   2026/27 every dataset had already landed. In the copy the 2026/27 levels
 *   file and Table 10 import are copied under the label 2027-28 (figures
 *   unchanged and so wrong for that year: shape only, never published), while
 *   the parish return, Burnley's schedule, the GLA decision, Scotland, Wales
 *   and the budget edition stay on 2026/27, as they may on the morning. It
 *   builds the copy and checks that every waiting page renders, every lagging
 *   dataset keeps its own year, and the dist check passes.
 *
 * It writes rehearsal-report.json in the folder and prints the findings.
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const option = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const SCENARIO = option("--scenario", "real");
const BASELINE = option("--baseline") && resolve(option("--baseline"));
const DIR = resolve(option("--dir", join(tmpdir(), `uct-c6-rehearsal-${SCENARIO}`)));
const LIVE = args.includes("--live");
const SITE = "https://ukcounciltax.co.uk";

if (!["real", "shape"].includes(SCENARIO)) throw new Error(`Unknown scenario ${SCENARIO}`);
if (SCENARIO === "real" && (!BASELINE || !existsSync(join(BASELINE, "index.html")))) {
  throw new Error("--baseline must be a built dist of main (run npm run build on main and keep its dist)");
}
if (!relative(ROOT, DIR).startsWith("..")) throw new Error(`The rehearsal folder ${DIR} must be outside the repository`);

const report = { scenario: SCENARIO, dir: DIR, started: new Date().toISOString(), steps: [], checks: [], differences: [] };
const step = (name, detail = {}) => {
  report.steps.push({ name, ...detail });
  console.log(`\n== ${name}${detail.result ? `: ${detail.result}` : ""}`);
};
const check = (name, ok, detail = "") => {
  report.checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};
const run = (cmd, argv, opts = {}) => execFileSync(cmd, argv, { cwd: DIR, encoding: "utf-8", stdio: opts.capture ? ["ignore", "pipe", "pipe"] : "inherit", maxBuffer: 512 * 1024 * 1024, env: { ...process.env, ...opts.env } });
const edition = async () => {
  const mod = await import(`${join(DIR, "src", "lib", "edition.mjs")}?t=${Date.now()}`);
  return mod.resolveEdition(DIR);
};
const json = (path) => JSON.parse(readFileSync(join(DIR, path), "utf-8"));

/** A copy of the working tree without its build output, history or caches; node_modules and data/raw are linked. */
function copyTree() {
  rmSync(DIR, { recursive: true, force: true });
  mkdirSync(DIR, { recursive: true });
  const skip = new Set(["node_modules", "dist", ".git", ".astro", ".cache", ".ops"]);
  for (const entry of readdirSync(ROOT)) {
    if (skip.has(entry)) continue;
    cpSync(join(ROOT, entry), join(DIR, entry), {
      recursive: true,
      filter: (source) => !source.startsWith(join(ROOT, "data", "raw")),
    });
  }
  symlinkSync(join(ROOT, "node_modules"), join(DIR, "node_modules"));
  symlinkSync(join(ROOT, "data", "raw"), join(DIR, "data", "raw"));
  mkdirSync(join(DIR, "rehearsal-raw"), { recursive: true });
  step("copied the working tree", { result: DIR });
}

async function real() {
  copyTree();
  const pinned = json("data/national/sources.json").components;

  // The 2025/26 baseline: no 2026/27 levels file and no 2026/27 Table 10 import.
  rmSync(join(DIR, "data/council-tax/england-2026-27.json"));
  // The launch Table 10 import is set aside, not deleted: the set the budget pages pin its
  // SHA-256, and on the real release it stays in place while england-<year>.json is added.
  renameSync(join(DIR, "data/national/england.json"), join(DIR, "rehearsal-england.json.aside"));
  run("node", ["scripts/import-national.mjs", "--stage", "2025-26", "--raw", "rehearsal-raw"]);
  run("node", ["scripts/import-national.mjs", "--year", "2025-26", "--raw", "rehearsal-raw"]);
  let state = await edition();
  step("baseline", { result: `switch resolves to ${state.current}, years ${state.years.join(", ")}` });
  check("the baseline resolves to 2025-26", state.current === "2025-26" && state.years.join() === "2024-25,2025-26");
  const newer = [
    ["budget (RA)", json("data/national/budget.json").year],
    ["Burnley schedule", readdirSync(join(DIR, "data/local-bills")).filter((f) => f.endsWith(".json")).map((f) => json(`data/local-bills/${f}`).year).sort().at(-1)],
    ["GLA decision", readdirSync(join(DIR, "data/precepts")).map((f) => /gla-(\d{4}-\d{2})\.json/.exec(f)?.[1]).filter(Boolean).sort().at(-1)],
    ["Scotland and Wales", json("data/devolved/council-tax.json").editions.map((e) => e.year).sort().at(-1)],
  ].filter(([, year]) => year > state.current);
  report.differences.push({
    where: "baseline build",
    what: `not built: ${newer.map(([name, year]) => `${name} ${year}`).join("; ")} newer than the baseline year`,
    cause: "The repository holds no 2025/26 edition of these datasets. The switch refuses a dataset newer than CURRENT_YEAR (budget, Scotland and Wales) or finds none for it (Burnley), by design, so the rehearsal checks the baseline's switch state but builds only the after state. On the real release every such dataset is older than the incoming year, which the shape scenario covers.",
  });

  // Release morning, D5 runbook steps 2 and 3, for 2026/27.
  run("node", ["scripts/fetch-council-tax.mjs", "--year", "2026-27", "--raw", "rehearsal-raw"]);
  state = await edition();
  step("levels imported", { result: `switch resolves to ${state.current}, held ${state.held.join(", ") || "none"}` });
  check("a levels file alone does not switch the site", state.current === "2025-26" && state.held.join() === "2026-27");
  const fresh = json("data/council-tax/england-2026-27.json");
  const live = JSON.parse(readFileSync(join(ROOT, "data/council-tax/england-2026-27.json"), "utf-8"));
  delete fresh.generated;
  delete live.generated;
  check("the incoming levels file equals the held 2026/27 file, except its generated date", JSON.stringify(fresh) === JSON.stringify(live));
  // The set the budget pages pin the held file's SHA-256, which includes its generated date. Having
  // shown the two equal, the build uses the held bytes. On the real release the incoming file is a
  // new year's and nothing pins it.
  cpSync(join(ROOT, "data/council-tax/england-2026-27.json"), join(DIR, "data/council-tax/england-2026-27.json"));
  report.differences.push({ where: "data/council-tax/england-2026-27.json", what: "the incoming file differs from the held one only in its generated date; the build used the held bytes", cause: "The set the budget pages pin the held file's SHA-256 (data/pilots/budget-freeze.json, sourceHashes). A real release adds a new year's file, which nothing pins." });

  run("node", ["scripts/import-national.mjs", "--stage", "2026-27", "--raw", "rehearsal-raw"]);
  const staged = json("data/national/table-10-2026-27.source.json");
  check("the staged Table 10 hash equals the pinned 2026/27 hash", staged.sha256 === pinned.sha256, staged.sha256);
  check("the staged Table 10 file URL equals the pinned one", staged.fileUrl === pinned.fileUrl, staged.fileUrl);
  run("node", ["scripts/import-national.mjs", "--year", "2026-27", "--as-incoming", "--raw", "rehearsal-raw"]);
  renameSync(join(DIR, "rehearsal-england.json.aside"), join(DIR, "data/national/england.json"));
  state = await edition();
  step("Table 10 imported", { result: `switch resolves to ${state.current}, previous ${state.previous}, next ${state.next}` });
  check("the switch moves CURRENT_YEAR, PREVIOUS_YEAR, YEARS and NEXT_YEAR together", state.current === "2026-27" && state.previous === "2025-26" && state.years.join() === "2024-25,2025-26,2026-27" && state.next === "2027-28");
  const imported = json("data/national/england-2026-27.json");
  const held = JSON.parse(readFileSync(join(ROOT, "data/national/england.json"), "utf-8"));
  for (const key of ["components", "parishes", "history", "parishNotes", "parishChanges", "historyNotes"]) {
    check(`the incoming Table 10 import's ${key} equal the held import's`, JSON.stringify(imported[key]) === JSON.stringify(held[key]));
  }
  const sourceKeys = Object.keys(staged).filter((k) => JSON.stringify(staged[k]) !== JSON.stringify(pinned[k]));
  report.differences.push({ where: "Table 10 source record", what: `fields differing from the pinned record: ${sourceKeys.join(", ") || "none"}`, cause: "The staged record adds the attachment title as GOV.UK prints it and carries the day it was retrieved." });

  step("build");
  run("npm", ["run", "build"]);
  // The number diff exits 1 when pages differ outside allowed globs; that is a finding, not a failure to run.
  let numbers;
  try {
    numbers = run("node", ["scripts/diff-numbers.mjs", BASELINE, join(DIR, "dist")], { capture: true });
  } catch (error) {
    if (error.status !== 1 || !error.stdout) throw error;
    numbers = error.stdout;
  }
  const summary = numbers.trim().split("\n").at(-1);
  writeFileSync(join(DIR, "rehearsal-number-diff.tsv"), numbers);
  step("number diff against main", { result: summary });
  const groups = new Map();
  for (const line of numbers.trim().split("\n").slice(1, -1)) {
    const [path, status, ...rest] = line.split("\t");
    const key = `${status}: baseline ${rest[0]} candidate ${rest[1]}; SVG baseline ${rest[2]} candidate ${rest[3]}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(JSON.parse(path));
  }
  for (const [what, paths] of groups) {
    report.differences.push({ where: `${paths.length} pages, for example ${paths.slice(0, 3).join(", ")}`, what, cause: "see the brief, section 5" });
    console.log(`DIFF  ${paths.length} pages  ${what}  e.g. ${paths.slice(0, 3).join(", ")}`);
  }
  let bytes;
  try {
    bytes = run("node", ["scripts/compare-builds.mjs", BASELINE, join(DIR, "dist")], { capture: true });
  } catch (error) {
    bytes = `${error.stdout ?? ""}${error.stderr ?? ""}`;
  }
  writeFileSync(join(DIR, "rehearsal-byte-compare.txt"), bytes);
  step("byte compare against main", { result: bytes.trim().split("\n").slice(-3).join(" / ") });

  if (LIVE) await liveCompare();
}

/** Five main pages against the live site, by the same number diff. */
async function liveCompare() {
  const pages = ["/", "/councils/burnley/", "/increases/", "/council-tax-2027-28/", "/precepts/"];
  const mini = { main: join(DIR, "live-check", "main"), live: join(DIR, "live-check", "live") };
  for (const page of pages) {
    const file = join(page.slice(1), "index.html");
    mkdirSync(join(mini.main, page.slice(1)), { recursive: true });
    mkdirSync(join(mini.live, page.slice(1)), { recursive: true });
    cpSync(join(BASELINE, file), join(mini.main, file));
    const response = await fetch(`${SITE}${page}`);
    writeFileSync(join(mini.live, file), await response.text());
  }
  let out;
  try {
    out = execFileSync("node", ["scripts/diff-numbers.mjs", mini.main, mini.live], { cwd: ROOT, encoding: "utf-8" });
  } catch (error) {
    out = error.stdout ?? String(error);
  }
  writeFileSync(join(DIR, "live-check", "number-diff.tsv"), out);
  step("main against live, five pages", { result: out.trim().split("\n").at(-1) });
  check("main matches live on the five sampled pages", /0 pages differing; 0 pages added; 0 pages removed/.test(out));
}

async function shape() {
  copyTree();
  const levels = json("data/council-tax/england-2026-27.json");
  writeFileSync(join(DIR, "data/council-tax/england-2027-28.json"), `${JSON.stringify({ ...levels, year: "2027-28", rehearsal: "SHAPE ONLY: 2026/27 figures under a 2027-28 label; never publish" }, null, 2)}\n`);
  const national = json("data/national/england.json");
  national.year = "2027-28";
  national.sources.components = { ...national.sources.components, title: national.sources.components.title.replace("2026 to 2027", "2027 to 2028") };
  writeFileSync(join(DIR, "data/national/england-2027-28.json"), `${JSON.stringify(national)}\n`);
  const state = await edition();
  step("shape data", { result: `switch resolves to ${state.current}, previous ${state.previous}, next ${state.next}` });
  check("the switch resolves to 2027-28", state.current === "2027-28" && state.next === "2028-29");

  step("build");
  run("npm", ["run", "build"]);
  const dist = (path) => join(DIR, "dist", path, "index.html");
  const page = (path) => (existsSync(dist(path)) ? readFileSync(dist(path), "utf-8") : "");
  check("the levels day page renders at the old not yet set address", page("council-tax-2027-28").includes("Council tax 2027/28 in England: the published figures"));
  check("the levels day page links precept day and the class rankings", page("council-tax-2027-28").includes('href="/council-tax-2027-28/adult-social-care/"') && page("council-tax-2027-28").includes('href="/council-tax/ranked/shire-districts/"'));
  check("precept day renders with 153 authorities", (page("council-tax-2027-28/adult-social-care").match(/<tr><th scope="row">/g) ?? []).length === 153);
  check("the not yet set page moves to 2028/29", page("council-tax-2028-29").includes("Council tax 2028/29: not yet set"));
  check("the 2028/29 page reads the staged 2028/29 release records, not 2027/28's", page("council-tax-2028-29").includes("GOV.UK had no statistics announcement for council tax levels for 2028 to 2029") && !page("council-tax-2028-29").includes("March 2027 (provisional)"));
  check("council pages carry the ranking embed snippet", page("councils/burnley").includes("data-ranking-embed") && page("councils/burnley").includes("/og/ranking/burnley.png"));
  check("the set the budget pages carry the pinned line", page("tools/budget/adur/set").includes("These budget figures are for 2026/27. Council budgets for 2027/28 follow MHCLG&#39;s revenue account (RA) budget release, expected in June 2027.") || page("tools/budget/adur/set").includes("These budget figures are for 2026/27. Council budgets for 2027/28 follow MHCLG's revenue account (RA) budget release, expected in June 2027."));
  check("parish pages stay on the parish return's year", page("precepts/parishes/burnley").includes("Parish precepts in Burnley 2026/27"));
  check("Scotland and Wales pages stay on their own editions", page("scotland").length > 0 && page("wales").length > 0 && page("wales/cardiff").includes("2026/27"));
  check("the GLA section is withheld for a year with no GLA decision", page("councils/westminster").length > 0 && !page("councils/westminster").includes('id="mayoral-precept"'));
  check("/precepts/ shows Burnley's schedule under its own year", page("precepts").includes("Complete all-band local schedule: Burnley, 2026/27"));
  check("council pages lead with the new year", page("councils/burnley").includes("council tax bands and charges 2027/28"));
  const sitemap = readFileSync(join(DIR, "dist", "sitemap.xml"), "utf-8");
  check("the sitemap lists the levels day, precept day and next year pages", ["/council-tax-2027-28/", "/council-tax-2027-28/adult-social-care/", "/council-tax-2028-29/"].every((p) => sitemap.includes(`${SITE}${p}`)));
  let distCheck;
  try {
    distCheck = run("node", ["scripts/check-dist.mjs"], { capture: true });
    check("the dist check passes on the shape build", true);
  } catch (error) {
    distCheck = `${error.stdout ?? ""}${error.stderr ?? ""}`;
    check("the dist check passes on the shape build", false, distCheck.trim().split("\n").slice(-5).join(" / "));
  }
  writeFileSync(join(DIR, "rehearsal-check-dist.txt"), distCheck);
}

if (SCENARIO === "real") await real();
else await shape();
report.finished = new Date().toISOString();
writeFileSync(join(DIR, "rehearsal-report.json"), `${JSON.stringify(report, null, 2)}\n`);
const failed = report.checks.filter((c) => !c.ok);
console.log(`\nRehearsal ${SCENARIO}: ${report.checks.length - failed.length} of ${report.checks.length} checks passed. Report: ${join(DIR, "rehearsal-report.json")}. Nothing here is published.`);
process.exitCode = failed.length ? 1 : 0;
