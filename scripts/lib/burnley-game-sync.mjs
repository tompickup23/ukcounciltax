/**
 * Copies the Burnley budget game from a Reports build into this site.
 * Run through scripts/sync-burnley-game.sh, which passes the dist folder and
 * the edition date.
 *
 * The game is built and checked in the Reports repository (Burnley budget
 * model, game/dist). Nothing here changes a figure: game.js is copied byte
 * for byte, and its SHA-256 is recorded. Three things are adapted so the page
 * can sit inside this site's own frame:
 *
 *   1. game.css: every selector is scoped to the .burnley-game wrapper, so the
 *      game's rules and tokens cannot reach the site header, footer or text,
 *      and the site skin in src/components/burnley-game/skin.css is appended.
 *   2. The markup: the body of index.html without its script element. The
 *      working banner becomes the edition line, and the game's own h1 becomes
 *      an h2 because the page already has one h1.
 *   3. meta.json: the model run id and the three years read from game.js, the
 *      edition date and the hashes of what was copied.
 *
 * The run stops, writing nothing, if the build is not the strict one this site
 * can serve: an inline script, an inline handler, a style attribute or block,
 * or a reference outside its own folder.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const WRAPPER = ".burnley-game";
const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public", "budget-game", "burnley");
const COMPONENT_DIR = join(ROOT, "src", "components", "burnley-game");

const sha256 = (data) => createHash("sha256").update(data).digest("hex");

/** Index of the brace that closes the block opened at `open`. */
function closingBrace(css, open) {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    const ch = css[i];
    if (ch === '"' || ch === "'") {
      i = css.indexOf(ch, i + 1);
      if (i < 0) break;
    } else if (ch === "/" && css[i + 1] === "*") {
      i = css.indexOf("*/", i + 2) + 1;
    } else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return i;
  }
  throw new Error("game.css has an unclosed block");
}

/** Split a selector list on the commas that are not inside brackets. */
function splitSelectors(list) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    const ch = list[i];
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === "," && depth === 0) {
      out.push(list.slice(start, i));
      start = i + 1;
    }
  }
  out.push(list.slice(start));
  return out.map((s) => s.trim()).filter(Boolean);
}

/** One selector, moved under the wrapper. */
export function scopeSelector(selector) {
  // The tooltip is appended to the body by the game, outside the wrapper.
  if (/^\.tip\b/.test(selector)) return `${WRAPPER} ${selector}, body > ${selector}`;
  const root = /^:root((?:\[[^\]]*\]|:not\([^)]*\))*)(\s+.*)?$/.exec(selector);
  if (root) {
    const [, condition, rest = ""] = root;
    return condition ? `:root${condition} ${WRAPPER}${rest}` : `${WRAPPER}${rest}`;
  }
  if (/^(html|body)$/.test(selector)) return WRAPPER;
  return `${WRAPPER} ${selector}`;
}

/** Every rule in the sheet, scoped to the wrapper. Conditional groups are walked; keyframes are left alone. */
export function scopeCss(css) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) {
      out += css.slice(i);
      break;
    }
    const close = closingBrace(css, open);
    const raw = css.slice(i, open);
    // Comments before a rule stay where they are.
    const lead = /^(?:\s*\/\*[\s\S]*?\*\/)*\s*/.exec(raw)[0];
    const prelude = raw.slice(lead.length).trim();
    const body = css.slice(open + 1, close);
    if (/^@(media|supports|container|layer)\b/.test(prelude)) out += `${lead}${prelude}{${scopeCss(body)}}`;
    else if (prelude.startsWith("@")) out += `${lead}${prelude}{${body}}`;
    else out += `${lead}${splitSelectors(prelude).map(scopeSelector).join(",")}{${body}}`;
    i = close + 1;
  }
  return out;
}

/** What would stop the strict policy serving this build, as a list of plain reasons. */
export function strictProblems(html, js) {
  const problems = [];
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  if (scripts.length !== 1 || !/\bsrc="game\.js"/.test(scripts[0][1]) || scripts[0][2].trim()) problems.push("index.html must carry one script element, game.js, with no body");
  if (/<style\b/i.test(html)) problems.push("index.html carries a style block");
  if (/\sstyle\s*=/i.test(html)) problems.push("index.html carries a style attribute");
  if (/\son[a-z]+\s*=/i.test(html)) problems.push("index.html carries an inline event handler");
  for (const [, , url] of html.matchAll(/\s(src|href)="([^"]*)"/gi)) if (!["game.js", "game.css"].includes(url)) problems.push(`index.html refers to ${url}`);
  if (/https?:\/\/|\bfetch\s*\(|XMLHttpRequest|\bimport\s*\(|sendBeacon|WebSocket|EventSource/.test(js)) problems.push("game.js names a network call or an outside address");
  return problems;
}

/** The game's body as a fragment for this site's page. */
export function gameMarkup(html, runId, editionText) {
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1];
  if (!body) throw new Error("index.html has no body");
  const banner = /<div class="test">[\s\S]*?<\/div>/;
  if (!banner.test(body) || !body.includes('<span id="runid"></span>')) throw new Error("the banner with the run id element was not found");
  // The script writes "Model run <id>." into #runid, so the same words are printed here for a reader without it.
  const edition = `<div class="test edition" data-game-edition>Edition of ${editionText}. <span id="runid">Model run ${runId}.</span> Figures from Burnley Borough Council's published papers.</div>`;
  const titles = body.match(/<h1\b/g) ?? [];
  if (titles.length !== 1) throw new Error(`expected one h1 in the game, found ${titles.length}`);
  return body
    .replace(banner, edition)
    .replace(/<h1\b([^>]*)>/, '<h2 class="game-title"$1>')
    .replace("</h1>", "</h2>")
    .replace(/<script\b[^>]*><\/script>/i, "")
    .trim() + "\n";
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function longDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const month = match ? MONTHS.at(Number(match[2]) + -1) : undefined;
  if (!match || match[2] === "00" || !month) throw new Error(`edition date must be YYYY-MM-DD, got ${iso}`);
  return `${Number(match[3])} ${month} ${match[1]}`;
}

function main() {
  const [distArg, edition] = process.argv.slice(2);
  if (!distArg || !edition) {
    console.error("usage: scripts/sync-burnley-game.sh /path/to/Burnley_Budget_Model_work/game/dist YYYY-MM-DD");
    process.exit(2);
  }
  const dist = resolve(distArg);
  for (const name of ["index.html", "game.js", "game.css"]) {
    if (!existsSync(join(dist, name))) {
      console.error(`missing ${join(dist, name)}`);
      process.exit(1);
    }
  }
  const html = readFileSync(join(dist, "index.html"), "utf8");
  const js = readFileSync(join(dist, "game.js"));
  const css = readFileSync(join(dist, "game.css"), "utf8");
  const jsText = js.toString("utf8");

  const problems = strictProblems(html, jsText);
  const runIds = [...new Set(jsText.match(/run-[0-9a-f]{16}/g) ?? [])];
  if (runIds.length !== 1) problems.push(`expected one model run id in game.js, found ${runIds.length}`);
  if (problems.length) {
    console.error(`Not copied:\n${problems.map((p) => `  ${p}`).join("\n")}`);
    process.exit(1);
  }
  const [runId] = runIds;
  // The years belong to the model build, not to this site's current edition.
  const year = (key) => new RegExp(`"${key}": "(\\d{4}/\\d{2})"`).exec(jsText)?.[1];
  const years = { baseYear: year("base_year"), playYear: year("play_year"), nextYear: year("next_year") };
  if (Object.values(years).some((value) => !value)) {
    console.error("Not copied:\n  game.js does not name its base, play and next years");
    process.exit(1);
  }
  const editionText = longDate(edition);
  const skin = readFileSync(join(COMPONENT_DIR, "skin.css"), "utf8");
  const siteCss = `/* Burnley budget game, model run ${runId}. Written by scripts/sync-burnley-game.sh: do not edit by hand. */\n${scopeCss(css)}\n${skin}`;
  const markup = gameMarkup(html, runId, editionText);

  mkdirSync(PUBLIC_DIR, { recursive: true });
  mkdirSync(COMPONENT_DIR, { recursive: true });
  writeFileSync(join(PUBLIC_DIR, "game.js"), js);
  writeFileSync(join(PUBLIC_DIR, "game.css"), siteCss);
  writeFileSync(join(COMPONENT_DIR, "markup.html"), markup);
  const meta = {
    runId,
    edition,
    editionText,
    ...years,
    source: "Reports repository, Burnley_Budget_Model_work/game/dist",
    sourceSha256: { "index.html": sha256(html), "game.js": sha256(js), "game.css": sha256(css) },
    servedSha256: { "game.js": sha256(js), "game.css": sha256(siteCss) },
  };
  writeFileSync(join(COMPONENT_DIR, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`Burnley budget game copied: model run ${runId}, edition of ${editionText}.`);
  console.log("Now run npm test, npm run build, npm run test:dist, npm run test:text, npm run test:e2e and npm run test:csp.");
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) main();
