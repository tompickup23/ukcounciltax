import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { loadRegistry } from "../src/lib/registry";

// The registry reorganisation field is held until the registry is rebuilt
// from a corrected UK Places source. See "Held data" in CLAUDE.md.
const HELD_PHRASES = ["government-decided", "four-unitary", "Structural Change Order"];
const DIST = resolve(process.cwd(), "dist");

function* filesUnder(dir: string, skip: string[] = []): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skip.includes(entry.name)) yield* filesUnder(path, skip);
    } else yield path;
  }
}

describe("the held reorganisation field", () => {
  it("is still carried by the registry, so the hold is doing the work", () => {
    const held = Object.values(loadRegistry().councils).filter((council) => council.reorganisation);
    expect(held.length).toBeGreaterThan(0);
  });

  it("is not read anywhere under src", () => {
    const readers: string[] = [];
    for (const path of filesUnder(resolve(process.cwd(), "src"), ["vendor"])) {
      if (!/\.(ts|astro|mjs|js|tsx)$/.test(path)) continue;
      if (/\.reorganisation\b/.test(readFileSync(path, "utf-8"))) readers.push(path);
    }
    expect(readers).toEqual([]);
  });

  it.skipIf(!existsSync(DIST))("leaves the held wording out of every built text file", () => {
    const hits: string[] = [];
    for (const path of filesUnder(DIST, ["pagefind"])) {
      if (!/\.(html|xml|txt|json|js|css|svg|webmanifest)$/.test(path)) continue;
      const text = readFileSync(path, "utf-8");
      for (const phrase of HELD_PHRASES) if (text.includes(phrase)) hits.push(`${phrase} in ${path.slice(DIST.length)}`);
    }
    expect(hits).toEqual([]);
  });

  it.skipIf(!existsSync(DIST))("leaves no reorganisation anchor on a council profile", () => {
    const hits: string[] = [];
    const councils = join(DIST, "councils");
    for (const path of filesUnder(councils)) {
      if (!path.endsWith(".html")) continue;
      const html = readFileSync(path, "utf-8");
      if (/id="reorganisation"|href="#reorganisation"/.test(html)) hits.push(path.slice(DIST.length));
    }
    expect(hits).toEqual([]);
  });
});
