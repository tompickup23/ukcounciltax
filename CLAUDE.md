# UK Council Tax

Standalone specialist council-tax website, Astro 6 and TypeScript. Origin https://ukcounciltax.co.uk. Reused from UK Councils at 779dec32274f39d9d84bb311c49e8476d3b1e2a9. Read docs/BUILD-BRIEF.md and docs/RELEASE.md when present.

## Session continuation

For the current position, read `docs/HANDOFF-2026-11-10-SESSION.md` and `docs/PLAN-2026-11-10-REMAINING.md` (what remains, the cross estate linking programme and the outline prompts) first, then `docs/PLAN-2026-11-09-NEXT-SESSIONS.md` (sections 1 to 11, with the design programme in section 11) and `docs/ASSESSMENT-2026-11-09-TAX-SITES.md` (both sites, 9 November 2026). Decisions waiting on Tom are in `docs/DECISIONS-WAITING-2026-11-10.md`. PR 15 (cross domain canonicals from this site to ukcouncils.co.uk, 325 URLs including the homepage and brand pages) merged and deployed on 8 November 2026; `docs/HANDOFF-2026-11-08-CANONICALS-REBASE.md` is its record. The budget game programme handover is `docs/HANDOFF-2026-11-09-BUDGET-GAME-PROGRAMME.md` (PR 27).

For continuation after the 6 October 2026 chat, read `docs/HANDOFF-2026-10-06.md` first (broader project handover). The earlier `docs/HANDOFF-2026-10-05.md` remains for the release day record. They record the completed release, source reuse, remaining work and safeguards.

## Authority
Tom authorised creation and publication using GitHub and Cloudflare on 5 October 2026. Preserve UK Councils and other sites unless a specific integration is within his request. Never copy secrets, private financial data or private investigations. UK Food Hygiene is public tier B in the UK State network since 6 October 2026 (repository private; site linked). Only verified live ecosystem destinations belong in links.

## Resolved decision (9 November 2026)
The 3 November contradiction on the Cloudflare Insights host is resolved for the beacon (decision 6 in `docs/DECISIONS-WAITING-2026-11-10.md`): keep the host in the CSP and add the site's own beacon token through the normal secret route. Decisions 1 to 8, K1 to K5, G1 and G2 were all taken on 9 November; see that note.

## Data
Published charges must come from official tables with publisher, year, basis, table and file hash. Never derive missing bands or carry figures forward. Label Scotland water exclusions, Wales Band I and Northern Ireland domestic rates separately. Unknown is not zero. Compare only compatible systems, classes, years and charge bases. Distinguish own-council share from full area averages and locality bills.

Explicit user-requested scenarios are permitted, with visible assumptions and model version. Keep them separate from observed figures. No personal household data stored. No individuals named. Neutral language, British English, pipe titles, no em/en dashes. Every amount has a nearby source or calculation explanation.

## Implementation
Use process.cwd() for data paths. Components are copied, not imported across repos. SITE_URL in src/lib/site.ts owns the origin. Add new static routes to STATIC_PATHS. Static HTML remains useful without JavaScript. No horizontal page overflow at 375px. Use estate font/tokens and rerender brand tokens through scripts/apply-brand.py. No inline script permission: postbuild hashes and production-header tests are required.

## Verification
Run npm test, npm run check, npm run build, npm run test:dist and npm run test:text. Run relevant browser and actual-CSP tests for interactive changes. BUILD_OG=1 for the final build. Recheck source counts and output routes. Never publish a half-finished data refresh. Keep release provenance and limitations in docs/RELEASE.md.
