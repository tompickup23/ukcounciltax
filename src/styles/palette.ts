/**
 * The few token values the share card needs, as literals. Satori renders
 * outside a browser and cannot read a custom property, so this is the one
 * file outside global.css allowed to hold a colour; tests/palette.test.ts
 * holds every value here equal to its light token in the vendored Estate Kit
 * files that scripts/apply-brand.py splices into global.css: the skin block where
 * the skin sets the name (the band and its ink), the token block otherwise.
 */
export const cardPalette = {
  ground: "#0e4a36",
  groundInk: "#f7f2e3",
  groundMuted: "#bdc8b8",
  accentBright: "#f0dfae",
  accentDeep: "#0d6648",
  accentWash: "#e9eedd",
} as const;

/** The estate token each value mirrors. */
export const cardPaletteTokens: Record<keyof typeof cardPalette, string> = {
  ground: "--ground",
  groundInk: "--ground-ink",
  groundMuted: "--ground-muted",
  accentBright: "--accent-bright",
  accentDeep: "--accent",
  accentWash: "--accent-wash",
};
