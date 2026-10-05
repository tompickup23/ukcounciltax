# UK Council Tax

Specialist sourced council-tax site, Astro 6. Reuses the UK Councils public data and design foundations with a distinct green identity and tax-specific tools. Read CLAUDE.md (AGENTS.md symlink) and docs/RELEASE.md first.

## Local development

Node 22.12 or newer. `npm ci`, then `npm run dev -- --host 127.0.0.1 --port 4347`.

`npm test` checks data contracts, source completeness and calculation behaviour. `npm run check` validates Astro and TypeScript. Production build: set BUILD_OG=1 in the process environment and run `npm run build`, then `npm run test:dist`. Browser checks: `npm run test:e2e` and `npm run test:csp`. Their ports can be set with E2E_PORT and CSP_PORT to avoid other projects. E2E_BASE_URL and CSP_BASE_URL target an existing deployed review build without starting a local server.

## Data

England MHCLG data is a versioned copy of the UK Councils contract. `npm run data:council-tax` runs the included official-source reader. Review changes before publishing. `npm run data:registry -- /absolute/path/to/reviewed-councils.json` imports an explicitly supplied common-registry export.

`npm run data:devolved` uses Python 3 plus openpyxl and verifies pinned workbook hashes. `npm run data:local-bills` uses Python 3 plus Poppler pdftotext; its current Burnley importer reconciles all component sums to published locality totals. Raw downloads are ignored; normalized data and source provenance are versioned.

The local bill tool currently has complete Burnley coverage only. Scotland excludes water; Wales contains rounded Band D averages only. Future scenarios are illustrations, never forecasts. See docs/RELEASE.md for exact coverage and pending verification.

No credentials belong in this repository. No analytics token is enabled. Hosting: Cloudflare Pages project `ukcounciltax`. GitHub Actions verifies pushes to main before publishing; the repository is private. See docs/DEPLOYMENT.md for operation and rollback.
