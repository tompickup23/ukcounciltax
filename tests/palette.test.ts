import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { cardPalette, cardPaletteTokens } from "../src/styles/palette";

const ROOT = resolve(import.meta.dirname, "..");
const css = readFileSync(join(ROOT, "src", "styles", "global.css"), "utf-8");
const kit = readFileSync(join(ROOT, "src", "vendor", "estate-kit", "generated", "sites", "ukcounciltax.css"), "utf-8").trim();
const START = "/* estate-tokens:start";
const END = "/* estate-tokens:end */";
const block = css.slice(css.indexOf(START), css.indexOf(END) + END.length);

/** The custom properties declared in the first rule whose selector list ends with `selector`. */
function rule(source: string, selector: string): Record<string, string> {
  const at = source.indexOf(`${selector} {`);
  expect(at, selector).toBeGreaterThanOrEqual(0);
  const body = source.slice(source.indexOf("{", at) + 1, source.indexOf("}", at));
  return Object.fromEntries([...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const light = rule(kit, ':root, [data-theme="light"]');
const dark = rule(kit, ':root[data-theme="dark"], [data-theme="dark"]');
const systemDark = rule(kit, ':root:not([data-theme="light"])');

// The 28 names the kit file does not carry (A5 brief, section 11).
const ALIASES = [
  "--accent-2", "--accent-3", "--accent-glow", "--accent-teal", "--accent-teal-deep", "--bg-deep", "--bg-soft",
  "--body-bg-image", "--coral", "--focus-ring", "--grid-line", "--grid-vignette", "--header-backdrop", "--ink",
  "--ink-soft", "--muted", "--panel", "--panel-soft", "--panel-strong", "--status-bad-text", "--status-good-text",
  "--status-warn-bg", "--status-warn-border", "--status-warn-dark", "--status-warn-text", "--status-warn-tint",
  "--surface", "--surface-muted",
];

describe("the estate token block", () => {
  it("is the vendored kit's ukcounciltax.css, byte for byte", () => {
    expect(block).toBe(kit);
  });

  it("keeps the six font imports above the block", () => {
    expect(css.slice(css.indexOf(START))).not.toContain("@import");
    expect((css.slice(0, css.indexOf(START)).match(/@import "@fontsource\//g) ?? []).length).toBe(6);
  });

  it("sets the same dark values for a manual and a system dark choice", () => {
    expect(systemDark).toEqual(dark);
  });

  it("carries the revalidated series in both themes", () => {
    expect([1, 2, 3, 4].map((i) => light[`--series-${i}`])).toEqual(["#166ea5", "#b6550f", "#6e24da", "#9d1c5c"]);
    expect([1, 2, 3, 4].map((i) => dark[`--series-${i}`])).toEqual(["#5599cc", "#cf7a48", "#966bfe", "#f83b9b"]);
  });
});

describe("the site alias rule", () => {
  const tail = css.slice(css.indexOf(END) + END.length);

  it("holds exactly the 28 names the kit does not carry", () => {
    expect(Object.keys(rule(tail, ":root")).sort()).toEqual([...ALIASES].sort());
  });

  it("is the only place below the block that defines a custom property, apart from print", () => {
    const screen = tail.slice(0, tail.indexOf("@media print"));
    const defined = [...screen.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]);
    expect(defined.filter((name) => !ALIASES.includes(name))).toEqual([]);
  });
});

describe("the share card palette", () => {
  it("matches the kit's light tokens value for value", () => {
    for (const [key, token] of Object.entries(cardPaletteTokens)) {
      expect(light[token]?.toLowerCase(), token).toBe(cardPalette[key as keyof typeof cardPalette]);
    }
  });
});
