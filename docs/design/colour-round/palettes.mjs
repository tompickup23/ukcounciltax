/**
 * Colour round, November 2026 (docs/PLAN-CURRENT.md section 4, step C0).
 * Candidate palettes for UK Council Tax as token values, for pictures only.
 * Nothing in src/ reads this file. The chosen set goes into the Estate Kit
 * (tokens.json, skins.sites.ukcounciltax) and reaches the site through
 * scripts/apply-brand.py, never by hand.
 *
 * `live` is the token block in src/styles/global.css at origin/main 5a76109,
 * with the desk as the browser computes it (accent at 26 per cent over ground).
 * `desk` is not a site token today: round.mjs writes it as `.desk{--desk-ground}`.
 */

const states = {
  light: { positive: "#1f6f4f", warning: "#8a5a10", critical: "#b42318" },
  dark: { positive: "#6fcf9a", warning: "#f0b03e", critical: "#f2857a" },
};

export const palettes = {
  live: {
    name: "Live colours",
    idea: "The site as published on 16 November 2026.",
    light: {
      bg: "#ffffff", "bg-subtle": "#f5f6f7", "bg-card": "#ffffff", border: "#dbdfe3", "border-strong": "#c2c8ce",
      text: "#171b1f", "text-muted": "#545c63", "text-faint": "#616970",
      ground: "#0f1317", "ground-ink": "#f4f6f7", "ground-muted": "#98a3ac", desk: "#142926",
      accent: "#23664f", "accent-bright": "#94d7b5", "accent-wash": "#edf6f0", "accent-ink": "#ffffff",
      "series-1": "#166ea5", "series-2": "#b6550f", "series-3": "#6e24da", "series-4": "#9d1c5c",
      ...states.light,
    },
    dark: {
      bg: "#0f1317", "bg-subtle": "#171c21", "bg-card": "#141a1f", border: "#2a3138", "border-strong": "#3d464e",
      text: "#f4f6f7", "text-muted": "#b6c0c8", "text-faint": "#98a3ac",
      ground: "#05080a", "ground-ink": "#f4f6f7", "ground-muted": "#98a3ac", desk: "#2a3e36",
      accent: "#94d7b5", "accent-bright": "#94d7b5", "accent-wash": "#112d25", "accent-ink": "#0f1317",
      "series-1": "#5599cc", "series-2": "#cf7a48", "series-3": "#966bfe", "series-4": "#f83b9b",
      ...states.dark,
    },
  },

  a: {
    name: "A, deep green ledger",
    idea: "One hue, used with intent: a green black ground, one rich green desk, mint only as the highlight, neutrals warmed to sit with the paper.",
    light: {
      bg: "#f8f7f2", "bg-subtle": "#efeee6", "bg-card": "#ffffff", border: "#d9ddd3", "border-strong": "#b9c2b6",
      text: "#16201b", "text-muted": "#4f5a52", "text-faint": "#5d685f",
      ground: "#0b1d17", "ground-ink": "#f3f6ef", "ground-muted": "#a9bbb0", desk: "#0e4a36",
      accent: "#0d6648", "accent-bright": "#9be3bd", "accent-wash": "#e4f0e6", "accent-ink": "#ffffff",
      "series-1": "#0d6648", "series-2": "#899489", "series-3": "#39453d", "series-4": "#74807a",
      ...states.light,
    },
    dark: {
      bg: "#0b1410", "bg-subtle": "#111c17", "bg-card": "#13201a", border: "#25362e", "border-strong": "#3b5045",
      text: "#f1f4ee", "text-muted": "#b4c1b7", "text-faint": "#94a398",
      ground: "#060d0a", "ground-ink": "#f3f6ef", "ground-muted": "#a9bbb0", desk: "#0e4a36",
      accent: "#86d4ab", "accent-bright": "#b5efd0", "accent-wash": "#15261f", "accent-ink": "#0b1410",
      "series-1": "#4fbf8b", "series-2": "#c8d2c7", "series-3": "#7f9186", "series-4": "#b0bdb2",
      ...states.dark,
    },
  },

  b: {
    name: "B, green and cream",
    idea: "Two colours: deep green surfaces and a cream gold for the highlight and, in dark, for links and actions. Cream paper and warm stone neutrals.",
    light: {
      bg: "#f6f1e4", "bg-subtle": "#ece6d6", "bg-card": "#fffdf8", border: "#dcd5c2", "border-strong": "#b7ae96",
      text: "#1b1f1a", "text-muted": "#55594d", "text-faint": "#626656",
      ground: "#0b1d17", "ground-ink": "#f7f2e3", "ground-muted": "#b9c2ae", desk: "#0e4a36",
      accent: "#0d6648", "accent-bright": "#f0dfae", "accent-wash": "#e9eedd", "accent-ink": "#fffdf8",
      "series-1": "#0d6648", "series-2": "#958a67", "series-3": "#48442f", "series-4": "#7b7359",
      ...states.light,
    },
    dark: {
      bg: "#0c1310", "bg-subtle": "#131b16", "bg-card": "#151f19", border: "#2a372e", "border-strong": "#435245",
      text: "#f4efe2", "text-muted": "#c1bfae", "text-faint": "#9d9d8c",
      ground: "#070d0a", "ground-ink": "#f7f2e3", "ground-muted": "#b9c2ae", desk: "#0e4a36",
      accent: "#ecd9a0", "accent-bright": "#f0dfae", "accent-wash": "#1a251d", "accent-ink": "#0c1310",
      "series-1": "#4fbf8b", "series-2": "#ecd9a0", "series-3": "#8b8a76", "series-4": "#b9b6a1",
      ...states.dark,
    },
  },

  "b-kit": {
    name: "B as the kit holds it (0.6.5)",
    idea: "Palette B after the Estate Kit's gates: one bright for the dark link and the highlight, series moved to pass the colour vision and contrast gates, and the footer on the band green because the kit's ground is the band.",
    light: {
      bg: "#f6f1e4", "bg-subtle": "#ece6d6", "bg-card": "#fffdf8", border: "#dcd5c2", "border-strong": "#b7ae96",
      text: "#1b1f1a", "text-muted": "#55594d", "text-faint": "#626656",
      ground: "#0e4a36", "ground-ink": "#f7f2e3", "ground-muted": "#bdc8b8", desk: "#0e4a36",
      accent: "#0d6648", "accent-bright": "#f0dfae", "accent-wash": "#e9eedd", "accent-ink": "#ffffff",
      "series-1": "#0d6648", "series-2": "#8e8360", "series-3": "#181100", "series-4": "#392f0e",
      ...states.light,
    },
    dark: {
      bg: "#0c1310", "bg-subtle": "#131b16", "bg-card": "#151f19", border: "#2a372e", "border-strong": "#435245",
      text: "#f4efe2", "text-muted": "#c1bfae", "text-faint": "#9d9d8c",
      ground: "#0e4a36", "ground-ink": "#f7f2e3", "ground-muted": "#bdc8b8", desk: "#0e4a36",
      accent: "#f0dfae", "accent-bright": "#f0dfae", "accent-wash": "#1a251d", "accent-ink": "#0c1310",
      "series-1": "#2ea471", "series-2": "#f7e4aa", "series-3": "#736847", "series-4": "#c9bd99",
      ...states.dark,
    },
  },

  c: {
    name: "C, ink and paper",
    idea: "Charcoal bands and warm paper. Green is kept for links, actions and the council's own share, so it reads as the colour of money.",
    light: {
      bg: "#f7f5ef", "bg-subtle": "#eeebe2", "bg-card": "#ffffff", border: "#dcd9cf", "border-strong": "#b8b4a8",
      text: "#1a1a18", "text-muted": "#55544e", "text-faint": "#64635c",
      ground: "#121211", "ground-ink": "#f5f3ec", "ground-muted": "#b7b5ab", desk: "#1d1f1d",
      accent: "#1c6b4d", "accent-bright": "#8fdcb4", "accent-wash": "#edf0e6", "accent-ink": "#ffffff",
      "series-1": "#1c6b4d", "series-2": "#96938a", "series-3": "#2b2b28", "series-4": "#6a6861",
      ...states.light,
    },
    dark: {
      bg: "#131312", "bg-subtle": "#1a1a18", "bg-card": "#1d1d1b", border: "#31312d", "border-strong": "#4a4a44",
      text: "#f2f0ea", "text-muted": "#bcb9af", "text-faint": "#9a978d",
      ground: "#0a0a09", "ground-ink": "#f5f3ec", "ground-muted": "#b7b5ab", desk: "#2a2b28",
      accent: "#8fd6b0", "accent-bright": "#a9e8c7", "accent-wash": "#20221f", "accent-ink": "#131312",
      "series-1": "#55c08f", "series-2": "#cbc8be", "series-3": "#84827a", "series-4": "#b3b0a6",
      ...states.dark,
    },
  },
};

/** The eight reference pages (docs/design/reference-pages.txt) and where the second desktop capture lands. */
export const pages = [
  { id: "home", path: "/", second: { selector: ".play-band" } },
  { id: "hub", path: "/tools/budget/", second: { y: 700 } },
  { id: "game", path: "/tools/budget/trafford/", second: { y: 950 } },
  { id: "set", path: "/tools/budget/trafford/set/", second: { y: 520 } },
  { id: "council", path: "/councils/pendle/", second: { text: "Band D bill breakdown in Pendle" } },
  { id: "national", path: "/council-tax/", second: { selector: "#map" } },
  { id: "towns", path: "/council-tax/towns/", second: { y: 800 } },
  { id: "compare", path: "/compare/", second: null },
];
