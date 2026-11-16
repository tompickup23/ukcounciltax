# Colour round | UK Council Tax | 16 November 2026

Step C0 of `docs/PLAN-CURRENT.md` section 4 (as revised in pull request 102). Three candidate palettes for UK Council Tax, drawn on the eight reference pages in dark and light so that Tom can choose from pictures (decision C1, by 23 November 2026). Pictures and a contrast table only: nothing in `src/` changed, and nothing here is on the site.

## Decision C1, 16 November 2026

Tom chose **B, green and cream** in chat on 16 November 2026 ("B, green and cream"), after seeing the sheets. Taken as drawn: B's cream paper `#f6f1e4` supersedes the D2 value `#f8f7f2`, and links and actions share the cream gold in dark, so the swap stays values only. Both are reversible by Tom. Next is the kit release (K2), then the swap on the site (W8); each is Tom's yes.

## How the pictures were made

The live site (origin/main `5a76109`, read only) was loaded in Chromium through Playwright at 1440 by 900 and 390 by 844, in dark then light, with reduced motion. Each candidate is a set of token overrides (`colour-round/candidate-a.css`, `-b.css`, `-c.css`, generated from `colour-round/palettes.mjs`) injected into the loaded page. No build was needed because every colour on the site is a token. `colour-round/round.mjs` reproduces all of it: `css`, `contrast`, `capture`, `sheets`.

The eight pages are in `docs/design/reference-pages.txt`.

## The sheets

| File | What it shows |
|---|---|
| `colour-round/sheet-side-by-side-dark.jpg` | Six screens, live colours beside A, B and C, dark. **Start here** |
| `colour-round/sheet-side-by-side-light.jpg` | The same in light |
| `colour-round/sheet-live-dark.jpg`, `sheet-live-light.jpg` | All eight pages in the live colours |
| `colour-round/sheet-a-dark.jpg`, `sheet-a-light.jpg` | Candidate A, all eight pages |
| `colour-round/sheet-b-dark.jpg`, `sheet-b-light.jpg` | Candidate B, all eight pages |
| `colour-round/sheet-c-dark.jpg`, `sheet-c-light.jpg` | Candidate C, all eight pages |

## The candidates

| | Idea | What changes against the live colours |
|---|---|---|
| A, deep green ledger | One hue, used with intent | Green black ground in place of blue black. One rich green band (`#0e4a36`) in both themes in place of the grey sage. Mint kept, slightly paler, as the highlight. Neutrals warmed. Paper as decided in D2 (`#f8f7f2`) |
| B, green and cream | Two colours: green surfaces, cream gold accents | As A for the band and the dark ground. In dark, links, buttons and the highlight are a cream gold (`#ecd9a0`, `#f0dfae`); in light, links and buttons stay deep green and the cream gold appears on the band. Cream paper (`#f6f1e4`), which differs from the D2 value. Warm stone neutrals |
| C, ink and paper | Charcoal bands, warm paper, green for links, actions and the council's own share | Neutral charcoal ground and band. Green retreats to small things. Paper `#f7f5ef` |

In all three the bill bar takes the site's own colours: the billing council's share is green, and the other bodies are a neutral ramp of the same family (cream gold for the second body in B dark). State colours (positive, warning, critical) are unchanged in value and meaning.

## What the sheets show

1. **The band.** A and B replace the grey sage with a green that reads as a surface, in both themes. In light the live band is close to black; A and B make it plainly green. C's band in dark is charcoal on charcoal (1.31:1 against the page, the lowest of the three), so the homepage and the game lose their showpiece in the theme Tom's browser shows. C is at its best in light.
2. **The accent.** A keeps one hue, so links, buttons and highlight are still all mint in dark. B is the only candidate where the action colour is not the surface colour: the postcode button, the "Choose a council" pills and the second headline tone are the first things the eye finds.
3. **The bill bar.** Better in all three than the live blue, orange, purple and magenta. In B dark the largest share takes the same cream gold as the buttons; whether that is right or the largest share should be a neutral is a point for the kit release.
4. **The homepage's three greens** become one band colour plus card tones in all three, because the wash (`--accent-wash`) is now a panel tone and no longer a second green.

## Recommendation

**B**, with A as the fallback. B fixes the two faults that tokens can fix (the sage band, one colour doing every job) and is the only one with a clear place for the eye. A is the smallest step and the easiest to carry through the kit. C is not recommended as drawn, because of its dark band; a C with a light band on the dark page is possible but needs template work, which is outside a values only swap.

This is a view from the sheets. The choice is Tom's.

## Found on the way, for K2 and W8

1. **Links and fills share one token.** `--accent` is the link colour and the button fill. That is why B's links are cream gold in dark. Green links beside cream buttons would need a new action token in the kit and a rule in `global.css`; that is more than a values only swap and should be decided with C1.
2. **The towns hero highlight ignores the highlight token.** "England 2026/27" on `/council-tax/towns/` stays green in B, where every other second tone turns cream. W8 should find which value it reads.
3. **The band is not a site token.** It is computed in `.desk` as the accent at 26 per cent over `--ground`. The candidates set it directly. In the kit, `scripts/derive-desk.mjs` holds that 26 per cent rule and `tests/k1-skins.test.ts` holds `tokens.json` to it, so K2 has to change the rule, not only the values.
4. **B changes the light paper.** D2 was decided on 16 November as `#f8f7f2`; B draws `#f6f1e4`. Choosing B supersedes D2, or B can be taken with the D2 paper.

## Not covered

- No round of the game was played and no set page control was moved, so the reveal charts, the result card and the balanced and surplus states are not on the sheets. The set page's default shortfall state is.
- The share cards and `src/styles/palette.ts` are not drawn.
- The Burnley scenario game is not on the sheets.
- Contrast was computed with the WCAG 2 formula in `round.mjs`, not with the kit's own gates. Neighbouring bill bar segments are checked against the card only, not against each other; in a single hue ramp of four they cannot all be 3:1 apart, so the kit's separator rule will have to carry it. K2 runs the kit gates.
- Forced colours and print were not captured.
- UK Councils is not part of this round.

## Token values

Every value is proposed, for pictures. `desk (band ground)` is not a token today (see point 3 above). Tokens not listed are unchanged.

### Dark

| Token | Live | A | B | C |
|---|---|---|---|---|
| `--bg` | `#0f1317` | `#0b1410` | `#0c1310` | `#131312` |
| `--bg-subtle` | `#171c21` | `#111c17` | `#131b16` | `#1a1a18` |
| `--bg-card` | `#141a1f` | `#13201a` | `#151f19` | `#1d1d1b` |
| `--border` | `#2a3138` | `#25362e` | `#2a372e` | `#31312d` |
| `--border-strong` | `#3d464e` | `#3b5045` | `#435245` | `#4a4a44` |
| `--text` | `#f4f6f7` | `#f1f4ee` | `#f4efe2` | `#f2f0ea` |
| `--text-muted` | `#b6c0c8` | `#b4c1b7` | `#c1bfae` | `#bcb9af` |
| `--text-faint` | `#98a3ac` | `#94a398` | `#9d9d8c` | `#9a978d` |
| `--ground` | `#05080a` | `#060d0a` | `#070d0a` | `#0a0a09` |
| `--ground-ink` | `#f4f6f7` | `#f3f6ef` | `#f7f2e3` | `#f5f3ec` |
| `--ground-muted` | `#98a3ac` | `#a9bbb0` | `#b9c2ae` | `#b7b5ab` |
| `desk (band ground)` | `#2a3e36` | `#0e4a36` | `#0e4a36` | `#2a2b28` |
| `--accent` | `#94d7b5` | `#86d4ab` | `#ecd9a0` | `#8fd6b0` |
| `--accent-bright` | `#94d7b5` | `#b5efd0` | `#f0dfae` | `#a9e8c7` |
| `--accent-wash` | `#112d25` | `#15261f` | `#1a251d` | `#20221f` |
| `--accent-ink` | `#0f1317` | `#0b1410` | `#0c1310` | `#131312` |
| `--series-1` | `#5599cc` | `#4fbf8b` | `#4fbf8b` | `#55c08f` |
| `--series-2` | `#cf7a48` | `#c8d2c7` | `#ecd9a0` | `#cbc8be` |
| `--series-3` | `#966bfe` | `#7f9186` | `#8b8a76` | `#84827a` |
| `--series-4` | `#f83b9b` | `#b0bdb2` | `#b9b6a1` | `#b3b0a6` |
| `--positive` | `#6fcf9a` | `#6fcf9a` | `#6fcf9a` | `#6fcf9a` |
| `--warning` | `#f0b03e` | `#f0b03e` | `#f0b03e` | `#f0b03e` |
| `--critical` | `#f2857a` | `#f2857a` | `#f2857a` | `#f2857a` |

### Light

| Token | Live | A | B | C |
|---|---|---|---|---|
| `--bg` | `#ffffff` | `#f8f7f2` | `#f6f1e4` | `#f7f5ef` |
| `--bg-subtle` | `#f5f6f7` | `#efeee6` | `#ece6d6` | `#eeebe2` |
| `--bg-card` | `#ffffff` | `#ffffff` | `#fffdf8` | `#ffffff` |
| `--border` | `#dbdfe3` | `#d9ddd3` | `#dcd5c2` | `#dcd9cf` |
| `--border-strong` | `#c2c8ce` | `#b9c2b6` | `#b7ae96` | `#b8b4a8` |
| `--text` | `#171b1f` | `#16201b` | `#1b1f1a` | `#1a1a18` |
| `--text-muted` | `#545c63` | `#4f5a52` | `#55594d` | `#55544e` |
| `--text-faint` | `#616970` | `#5d685f` | `#626656` | `#64635c` |
| `--ground` | `#0f1317` | `#0b1d17` | `#0b1d17` | `#121211` |
| `--ground-ink` | `#f4f6f7` | `#f3f6ef` | `#f7f2e3` | `#f5f3ec` |
| `--ground-muted` | `#98a3ac` | `#a9bbb0` | `#b9c2ae` | `#b7b5ab` |
| `desk (band ground)` | `#142926` | `#0e4a36` | `#0e4a36` | `#1d1f1d` |
| `--accent` | `#23664f` | `#0d6648` | `#0d6648` | `#1c6b4d` |
| `--accent-bright` | `#94d7b5` | `#9be3bd` | `#f0dfae` | `#8fdcb4` |
| `--accent-wash` | `#edf6f0` | `#e4f0e6` | `#e9eedd` | `#edf0e6` |
| `--accent-ink` | `#ffffff` | `#ffffff` | `#fffdf8` | `#ffffff` |
| `--series-1` | `#166ea5` | `#0d6648` | `#0d6648` | `#1c6b4d` |
| `--series-2` | `#b6550f` | `#899489` | `#958a67` | `#96938a` |
| `--series-3` | `#6e24da` | `#39453d` | `#48442f` | `#2b2b28` |
| `--series-4` | `#9d1c5c` | `#74807a` | `#7b7359` | `#6a6861` |
| `--positive` | `#1f6f4f` | `#1f6f4f` | `#1f6f4f` | `#1f6f4f` |
| `--warning` | `#8a5a10` | `#8a5a10` | `#8a5a10` | `#8a5a10` |
| `--critical` | `#b42318` | `#b42318` | `#b42318` | `#b42318` |

## Contrast

WCAG 2 contrast ratios, computed by `node docs/design/colour-round/round.mjs contrast`. The floor is 4.5 for text, 3 for marks and the focus ring, and a low floor for shape against ground where a border also carries it. Translucent desk text is blended over the band before it is measured. No candidate fails a floor.

### Dark

| Pair | Floor | Live | A | B | C |
|---|---:|---:|---:|---:|---:|
| Text on paper | 4.5 | 17.21 | 16.86 | 16.39 | 16.31 |
| Text on card | 4.5 | 16.18 | 15.14 | 14.73 | 14.82 |
| Muted text on paper | 4.5 | 10.09 | 10.03 | 10.15 | 9.47 |
| Muted text on card | 4.5 | 9.49 | 9.01 | 9.12 | 8.60 |
| Faint text (source lines) on paper | 4.5 | 7.26 | 7.09 | 6.84 | 6.36 |
| Faint text on card | 4.5 | 6.82 | 6.37 | 6.15 | 5.78 |
| Faint text on subtle ground | 4.5 | 6.67 | 6.61 | 6.38 | 5.96 |
| Link on paper | 4.5 | 11.23 | 10.71 | 13.44 | 10.99 |
| Link on card | 4.5 | 10.56 | 9.62 | 12.08 | 9.98 |
| Link on wash panel | 4.5 | 8.87 | 9.04 | 11.31 | 9.48 |
| Text on wash panel | 4.5 | 13.59 | 14.23 | 13.79 | 14.07 |
| Button label on accent fill | 4.5 | 11.23 | 10.71 | 13.44 | 10.99 |
| Desk ink on desk | 4.5 | 10.52 | 9.38 | 9.15 | 12.83 |
| Desk soft text (82%) on desk | 4.5 | 7.69 | 6.88 | 6.73 | 9.12 |
| Desk faint text (75%) on desk | 4.5 | 6.73 | 6.04 | 5.91 | 7.89 |
| Desk faint text on a desk card | 4.5 | 5.48 | 5.03 | 4.92 | 6.44 |
| Highlight (eyebrow, second tone) on desk | 4.5 | 6.87 | 7.91 | 7.74 | 10.21 |
| Pill label on highlight fill | 4.5 | 12.10 | 15.17 | 14.82 | 14.20 |
| Desk against paper (the band as a shape) | 1.25 | 1.64 | 1.83 | 1.84 | 1.31 |
| Footer muted text on ground | 4.5 | 7.81 | 9.74 | 10.64 | 9.63 |
| Positive on paper | 4.5 | 9.83 | 9.87 | 9.91 | 9.80 |
| Warning on paper | 4.5 | 9.76 | 9.79 | 9.84 | 9.72 |
| Critical on paper | 4.5 | 7.47 | 7.50 | 7.54 | 7.45 |
| Positive on card | 4.5 | 9.24 | 8.86 | 8.91 | 8.90 |
| Warning on card | 4.5 | 9.17 | 8.79 | 8.84 | 8.83 |
| Critical on card | 4.5 | 7.03 | 6.73 | 6.77 | 6.76 |
| Bill bar, own share, on card | 3 | 5.69 | 7.33 | 7.37 | 7.50 |
| Bill bar, second body, on card | 3 | 5.45 | 10.81 | 12.08 | 10.09 |
| Bill bar, third body, on card | 3 | 4.87 | 5.04 | 4.83 | 4.39 |
| Bill bar, fourth body, on card | 3 | 5.09 | 8.62 | 8.27 | 7.78 |
| Control border on paper | 1.5 | 1.94 | 2.16 | 2.27 | 2.08 |
| Focus ring (accent) on paper | 3 | 11.23 | 10.71 | 13.44 | 10.99 |

### Light

| Pair | Floor | Live | A | B | C |
|---|---:|---:|---:|---:|---:|
| Text on paper | 4.5 | 17.31 | 15.58 | 14.81 | 15.99 |
| Text on card | 4.5 | 17.31 | 16.71 | 16.43 | 17.43 |
| Muted text on paper | 4.5 | 6.80 | 6.71 | 6.37 | 6.97 |
| Muted text on card | 4.5 | 6.80 | 7.20 | 7.07 | 7.60 |
| Faint text (source lines) on paper | 4.5 | 5.58 | 5.42 | 5.24 | 5.53 |
| Faint text on card | 4.5 | 5.58 | 5.82 | 5.81 | 6.03 |
| Faint text on subtle ground | 4.5 | 5.16 | 5.00 | 4.74 | 5.06 |
| Link on paper | 4.5 | 6.81 | 6.50 | 6.18 | 5.91 |
| Link on card | 4.5 | 6.81 | 6.97 | 6.86 | 6.44 |
| Link on wash panel | 4.5 | 6.17 | 5.95 | 5.89 | 5.59 |
| Text on wash panel | 4.5 | 15.70 | 14.25 | 14.11 | 15.11 |
| Button label on accent fill | 4.5 | 6.81 | 6.50 | 6.18 | 5.91 |
| Desk ink on desk | 4.5 | 14.09 | 9.38 | 9.15 | 14.94 |
| Desk soft text (82%) on desk | 4.5 | 9.90 | 6.88 | 6.73 | 10.41 |
| Desk faint text (75%) on desk | 4.5 | 8.53 | 6.04 | 5.91 | 8.90 |
| Desk faint text on a desk card | 4.5 | 7.01 | 5.03 | 4.92 | 7.35 |
| Highlight (eyebrow, second tone) on desk | 4.5 | 9.20 | 6.88 | 7.74 | 10.32 |
| Pill label on highlight fill | 4.5 | 11.23 | 11.74 | 13.20 | 11.66 |
| Desk against paper (the band as a shape) | 1.25 | 15.27 | 9.54 | 9.08 | 15.22 |
| Footer muted text on ground | 4.5 | 7.26 | 8.67 | 9.47 | 9.11 |
| Positive on paper | 4.5 | 6.10 | 5.68 | 5.41 | 5.59 |
| Warning on paper | 4.5 | 5.91 | 5.51 | 5.24 | 5.43 |
| Critical on paper | 4.5 | 6.57 | 6.13 | 5.83 | 6.03 |
| Positive on card | 4.5 | 6.10 | 6.10 | 6.00 | 6.10 |
| Warning on card | 4.5 | 5.91 | 5.91 | 5.82 | 5.91 |
| Critical on card | 4.5 | 6.57 | 6.57 | 6.47 | 6.57 |
| Bill bar, own share, on card | 3 | 5.51 | 6.97 | 6.86 | 6.44 |
| Bill bar, second body, on card | 3 | 4.89 | 3.15 | 3.38 | 3.07 |
| Bill bar, third body, on card | 3 | 7.17 | 10.04 | 9.64 | 14.20 |
| Bill bar, fourth body, on card | 3 | 7.62 | 4.11 | 4.65 | 5.58 |
| Control border on paper | 1.5 | 1.69 | 1.71 | 1.96 | 1.90 |
| Focus ring (accent) on paper | 3 | 6.81 | 6.50 | 6.18 | 5.91 |

Candidate failures: 0
