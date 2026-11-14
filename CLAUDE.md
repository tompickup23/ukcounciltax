# UK Council Tax

Standalone specialist council-tax website, Astro 6 and TypeScript. Origin https://ukcounciltax.co.uk. Reused from UK Councils at 779dec32274f39d9d84bb311c49e8476d3b1e2a9. Read docs/BUILD-BRIEF.md and docs/RELEASE.md when present.

## Session continuation

Read `docs/STATE.md` first: open pull requests, what is live, what is next and the decisions waiting, in 20 lines. Each session replaces it inside its own pull request. The plan is `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`; the standing direction (this site owns the bill, UK Councils the council) is `docs/PLAN-2026-11-10-SPLIT-AND-NETWORK.md`. Older handoffs stay in `docs/` as a record; check GitHub before relying on one.

## Authority
Tom authorised creation and publication using GitHub and Cloudflare on 5 October 2026. Preserve UK Councils and other sites unless a specific integration is within his request. Never copy secrets, private financial data or private investigations. UK Food Hygiene is public tier B in the UK State network since 6 October 2026 (repository private; site linked). Only verified live ecosystem destinations belong in links.

## Resolved decision (9 November 2026)
The 3 November contradiction on the Cloudflare Insights host is resolved for the beacon (decision 6 in `docs/DECISIONS-WAITING-2026-11-10.md`): keep the host in the CSP and add the site's own beacon token through the normal secret route. Decisions 1 to 8, K1 to K5, G1 and G2 were all taken on 9 November; see that note.

## Data
Published charges must come from official tables with publisher, year, basis, table and file hash. Never derive missing bands or carry figures forward. Label Scotland water exclusions, Wales Band I and Northern Ireland domestic rates separately. Unknown is not zero. Compare only compatible systems, classes, years and charge bases. Distinguish own-council share from full area averages and locality bills.

Explicit user-requested scenarios are permitted, with visible assumptions and model version. Keep them separate from observed figures. No personal household data stored. No individuals named. Neutral language, British English, pipe titles, no em/en dashes. Every amount has a nearby source or calculation explanation.

## Held data
The registry `reorganisation` field is held, from 13 November 2026, following the hold UK Councils has kept since 5 November 2026 (its CLAUDE.md, "Held data"). No page renders it: not the council page section, its contents entry, structured data, share text or the search index. The field comes from the UK Places spine and its note on the fourteen Lancashire councils is recorded there as withdrawn. The fix belongs in UK Places; do not edit `data/registry/councils.json` by hand. Render the field again only after the registry is rebuilt from a corrected source, and any new statement about reorganisation needs Tom's decision and two sources. `npm run test:dist` and `tests/reorganisation-held.test.ts` fail if the text reaches `dist/`.

## Implementation
Use process.cwd() for data paths. Components are copied, not imported across repos. SITE_URL in src/lib/site.ts owns the origin. Add new static routes to STATIC_PATHS. Static HTML remains useful without JavaScript. No horizontal page overflow at 375px. Use estate font/tokens and rerender brand tokens through scripts/apply-brand.py. No inline script permission: postbuild hashes and production-header tests are required.

## Before archiving a session
Commit and push any code to a branch before an archive step, as a draft pull request if it is not for review. A handoff note that exists only in a worktree is lost when the worktree is removed: put it in the pull request. Work left uncommitted on 13 November 2026 survived only as a Codex snapshot under `refs/codex/snapshots`; look there, and in Codex's archived session logs, before concluding that a session's work was never done.

## Verification
Run npm test, npm run check, npm run build, npm run test:dist and npm run test:text. Run relevant browser and actual-CSP tests for interactive changes. BUILD_OG=1 for the final build. Recheck source counts and output routes. Never publish a half-finished data refresh. Keep release provenance and limitations in docs/RELEASE.md.
