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
// The skin block (W8, palette B): paper, neutrals, series and the desk band, below the token block.
const kitSkin = readFileSync(join(ROOT, "src", "vendor", "estate-kit", "generated", "skins", "ukcounciltax.css"), "utf-8").trim();
const SKIN_START = "/* estate-skin:start";
const SKIN_END = "/* estate-skin:end */";
const skinBlock = css.slice(css.indexOf(SKIN_START), css.indexOf(SKIN_END) + SKIN_END.length);

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
const skinLight = rule(kitSkin, ':root, [data-theme="light"]');
const skinDark = rule(kitSkin, ':root[data-theme="dark"], [data-theme="dark"]');
const skinSystemDark = rule(kitSkin, ':root:not([data-theme="light"])');

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

  it("is followed directly by the vendored kit's skin block, byte for byte", () => {
    expect(skinBlock).toBe(kitSkin);
    expect(css.slice(css.indexOf(END) + END.length, css.indexOf(SKIN_START)).trim()).toBe("");
  });

  it("the skin sets the same dark values for a manual and a system dark choice", () => {
    expect(skinSystemDark).toEqual(skinDark);
  });

  it("the skin paints palette B: cream paper, a green black dark page and one band green in both themes", () => {
    expect({ paper: skinLight["--paper"], bg: skinLight["--bg"], ground: skinLight["--ground"] }).toEqual({ paper: "#f6f1e4", bg: "var(--paper)", ground: "#0e4a36" });
    expect({ paper: skinDark["--paper"], ground: skinDark["--ground"] }).toEqual({ paper: "#0c1310", ground: "#0e4a36" });
    // The billing council's share is green; the other bodies are a neutral ramp.
    expect([1, 2, 3, 4].map((i) => skinLight[`--series-${i}`])).toEqual(["#0d6648", "#8e8360", "#181100", "#392f0e"]);
    expect([1, 2, 3, 4].map((i) => skinDark[`--series-${i}`])).toEqual(["#2ea471", "#f7e4aa", "#736847", "#c9bd99"]);
  });

  it("carries the kit's own series in both themes, which the skin then replaces", () => {
    expect([1, 2, 3, 4].map((i) => light[`--series-${i}`])).toEqual(["#166ea5", "#b6550f", "#6e24da", "#9d1c5c"]);
    expect([1, 2, 3, 4].map((i) => dark[`--series-${i}`])).toEqual(["#5599cc", "#cf7a48", "#966bfe", "#f83b9b"]);
  });
});

describe("the site alias rule", () => {
  const tail = css.slice(css.indexOf(SKIN_END) + SKIN_END.length);

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
  it("matches the kit's light tokens value for value, the skin's where the skin sets the name", () => {
    const effective = { ...light, ...skinLight };
    for (const [key, token] of Object.entries(cardPaletteTokens)) {
      expect(effective[token]?.toLowerCase(), token).toBe(cardPalette[key as keyof typeof cardPalette]);
    }
  });
});
