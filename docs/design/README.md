# Design mockups for A5 and A6

Static mockups for `docs/A5-FACE-BRIEF.md` (the homepage hero and task cards) and `docs/A6-GAME-BRIEF.md` (one split round and its reveal), 9 November 2026. Design prep only: nothing here is built or served by the site.

| Path | What it is |
|---|---|
| `home-hero.html`, `game-round.html` | The mockups, generated. Open over a local server (`python3 -m http.server` in this folder) so the fonts load. |
| `src/` | The page templates the generator fills. Edit these, not the generated pages. |
| `figures.burnley.json` | Every figure the mockups draw, with publisher, document, table or page and edition. Burnley charges checked against the council's PDF on 9 November 2026; RA values as in `data/national/budget.json`. The example guess is marked as a fixture: it stands for a player's input. |
| `build-mockups.mjs` | Draws the charts through the Estate Kit and assembles the pages: `KIT=~/wt/kit-uct node docs/design/build-mockups.mjs` (an estate-kit checkout at 0.2.0, tompickup23/estate-kit PR 3, with `npm run build:lib` done). |
| `svg/` | The kit output: `hero-bill.svg` (billAnatomy), `game-published.svg` and `game-yours.svg` (waffle, parts, small), `game-teaser.svg` and `game-progress.svg` (the same grid cropped), `game-gap.svg` (drawn by the generator, since the kit's zeroBar does not yet draw negatives), the four task card thumbnails, two table twins, and `numbers.json` with the game arithmetic (shares, squares, score, gaps). |
| `tokens.css` | The kit's `generated/sites/ukcounciltax.css` at 0.2.0, the tokens A5 adopts. |
| `mockup.css`, `fonts/` | Mockup layout and the estate faces (Source Serif 4 600, Source Sans 3 400 and 600, latin, SIL Open Font Licence, from the site's `@fontsource` packages). |
| `screens/` | Full page captures at 390 and 1440 in light and dark, and one phone viewport during a round. Quantised to 256 colours. |
| `before/` | The design check contact sheet and report for the live homepage, `/councils/burnley/` and `/tools/budget/burnley/`, run `20261109T090136Z_tx8mdkb9`. Full captures stay in `~/Documents/design_checks/`. |
