import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

// The vendored Estate Kit must be byte for byte the build recorded in VERSION
// (decision K1). A hand edit, a stray file or a missing one fails here.
const ROOT = resolve(import.meta.dirname, "..", "src", "vendor", "estate-kit");
const UNHASHED = new Set(["VERSION", "README.md"]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [relative(ROOT, path).split("\\").join("/")];
  });
}

const version = readFileSync(join(ROOT, "VERSION"), "utf8");
const recorded = new Map(
  [...version.matchAll(/^sha256 ([0-9a-f]{64}) (.+)$/gm)].map((m) => [m[2], m[1]] as const),
);

describe("the vendored estate kit", () => {
  it("names the tag and the commit it was built from", () => {
    expect(version).toMatch(/^tag v\d+\.\d+\.\d+$/m);
    expect(version).toMatch(/^commit [0-9a-f]{40}$/m);
  });

  it("holds exactly the files recorded in VERSION", () => {
    const present = walk(ROOT).filter((f) => !UNHASHED.has(f)).sort();
    expect(present).toEqual([...recorded.keys()].sort());
  });

  it("hashes every file to its recorded value", () => {
    expect(recorded.size).toBeGreaterThan(0);
    for (const [file, hash] of recorded) {
      const actual = createHash("sha256").update(readFileSync(join(ROOT, file))).digest("hex");
      expect(actual, file).toBe(hash);
    }
  });

  it("carries this site's token file and the components the site renders", () => {
    for (const file of ["generated/sites/ukcounciltax.css", "src/components/BillAnatomy.astro", "src/components/ChartFigure.astro", "dist/src/index.js", "tokens/tokens.json"]) {
      expect(recorded.has(file), file).toBe(true);
    }
  });
});
