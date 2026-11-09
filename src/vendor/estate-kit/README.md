# Estate Kit, vendored

A copy of `tompickup23/estate-kit` at the tag and commit in `VERSION` (decision K1, 9 November 2026: vendor at a tag with a hash test, because this repository copies components rather than importing them across repos and the kit repository is private).

What is here, and nothing else:

- `dist/`: the compiled library and its declarations, from `npm ci` then `npm run build:lib` on a `git archive` of the tag.
- `src/components/`: the Astro components and `kit.css`, as tagged. They import `../../dist/src/index.js`, which resolves inside this folder.
- `generated/sites/ukcounciltax.css`: this site's token block, spliced into `src/styles/global.css` by `scripts/apply-brand.py`.
- `tokens/tokens.json`: the token source, so `scripts/apply-brand.py` can hold `scripts/brand-colours.json` equal to `sites.ukcounciltax`.
- `fonts/`: the three faces and their OFL licences, which the kit's PNG renderer loads from beside the package.

Do not edit these files. `tests/vendor.test.ts` fails if any file differs from its hash in `VERSION`, or if a file is added or removed. To move to a new tag, repeat the build from a clean archive of that tag, replace the folder, regenerate `VERSION` and run `python3 scripts/apply-brand.py`.

The kit's runtime dependencies (`@observablehq/plot`, `@resvg/resvg-js`, `d3-geo`, `jsdom`) are in this site's `package.json` at the kit's pinned versions.
