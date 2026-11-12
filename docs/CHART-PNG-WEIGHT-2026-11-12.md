# Chart download weight | 12 November 2026

The full baseline at bcb5a92 contains 4,996 chart download PNGs totalling 811,933,932 bytes. This counts profile, class, homepage and published budget-round downloads, excluding share cards. The previous 320 MB planning note no longer describes the complete output. The baseline BUILD_OG=1 build took 1,004.96 seconds locally with image caching disabled. Other verification work was running, so this is a local observation, not a controlled runner benchmark.

The renderer uses twice the SVG width in Resvg. Every sample is 1,200 pixels wide from a 600-unit chart. Height remains twice the drawing height.

## Burnley sample

Bytes are file bytes. A candidate value of zero means the download is no longer generated. Channel differences are maximum absolute R, G, B and alpha differences on the 0 to 255 scale, comparing every original pixel with the decoded palette version. Pillow's 256-colour FASTOCTREE quantisation, followed by optimised PNG output, was an analysis-only trial. No dependency was added to the site.

| Chart | Theme | Dimensions | Original bytes | Candidate bytes | Palette bytes | Maximum channel differences |
| --- | --- | --- | ---: | ---: | ---: | --- |
| bands | light | 1200 by 1026 | 84,123 | 84,123 | 30552 | 18, 14, 13, 0 |
| bands | dark | 1200 by 1026 | 83,789 | 0 | n/a | n/a |
| bill | light | 1200 by 846 | 104,230 | 104,230 | 37052 | 17, 14, 15, 0 |
| bill | dark | 1200 by 846 | 102,176 | 0 | n/a | n/a |
| position | light | 1200 by 822 | 115,838 | 115,838 | 41407 | 22, 14, 18, 0 |
| position | dark | 1200 by 822 | 115,242 | 0 | n/a | n/a |
| map | light | 1200 by 1904 | 240,595 | 0 | 80777 | 15, 14, 29, 0 |
| map | dark | 1200 by 1904 | 239,105 | 0 | n/a | n/a |

The four light samples shrink by 65.16%, above the 20% sample threshold. Palette compression is nevertheless omitted: it changes the background from RGB 255,255,255 to 254,254,254 and changes edge colours by up to 29 levels. The visual comparison does not establish an unchanged appearance at all viewing scales. Retaining the original pixels avoids that uncertainty.

## Site changes

Chart downloads offer the light image only. The per-council locator retains its drawing, source, table and copy action but no image download. Other share cards remain separate. Both inline themes remain. The 2x renderer and every vendored kit file are unchanged.

The assertions have their own commit: each non-locator chart has exactly one light PNG, each locator has none, files must resolve whenever images are required, and obsolete dark or locator PNG files fail the production check. Route enumeration and raster samples check the three profile downloads and retained share-card route. Budget published and revealed charts use the same one-image rule.

## Final validation

The candidate at the merged picker baseline contains 2,202 chart download PNGs totalling 326,095,835 bytes, a reduction of 485,838,097 bytes (59.84%). All 2,845 retained PNGs are byte-identical to the baseline, including all 643 images outside the chart-download set. No new PNG is introduced. The candidate image-cache-off build took 331.90 seconds (5 minutes 31.90 seconds), against 1,004.96 seconds (16 minutes 44.96 seconds) for the baseline. These local timings are not a controlled benchmark.

The whole-build numerical comparison reports zero differing, added or removed pages with no allow list. All 909 HTML pages and 908 sitemap URLs pass the distribution check; all 2,202 chart PNG links resolve. The text sweep and 67,026 internal-link checks pass. Astro reports zero errors, warnings or hints. All 354 unit tests pass.

The existing CI-speed and picker changes have independently completed production run 43133828332 at 7d786761e4d71d427705f57cc8ee6a63b80f1e58. The site job took 24 minutes 42 seconds, including a 9 minute 11 second build, 6 minute 47 second browser suite and 3 minute 11 second CSP suite. The verified build published successfully. This is the measured main-branch run before this PNG change.

All 388 phone and desktop browser tests and all 96 tests under the production security headers pass. The download action was visually reviewed at 375 and 1440 in both themes, and following it opens the retained 1,200 by 1,026 bands PNG. No gate or timeout was weakened.
