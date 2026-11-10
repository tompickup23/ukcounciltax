# UK Council Tax

Standalone specialist council-tax website, Astro 6 and TypeScript. Origin https://ukcounciltax.co.uk. Reused from UK Councils at 779dec32274f39d9d84bb311c49e8476d3b1e2a9. Read docs/BUILD-BRIEF.md and docs/RELEASE.md when present.

## Session continuation

Latest: `docs/HANDOFF-2026-11-10-ROUND-THREE.md` (10 November 2026, late): Actions billing block, both tax repositories made public, PRs 41, 42, 43, 50 and 52 merged and live, the compare fixes, kit 0.5.0 complete as estate-kit PR 6, the PR 51 review, and the order of what follows. Read it after the two notes below.

Before it: `docs/HANDOFF-2026-11-10-ROUND-TWO.md` (10 November 2026, evening): D5 and D6 built as PR 48, the state of all three repos, and the order of what follows. Read it after the note below, which holds the direction and the rules.

Before it: `docs/HANDOFF-2026-11-10-DESIGN-AND-SPLIT.md` (10 November 2026): the split and design decisions, every pull request's state across ukcounciltax, ukcouncils and estate-kit, what the dossier, kit 0.4.0 and A3 still need, six working rules from the day, and the resume prompt. Read it first, then `docs/PLAN-2026-11-10-EXECUTION.md` section 8.

Earlier: `docs/HANDOFF-2026-11-09-ROUND-FIVE.md` (9 November 2026): A4, A5 and A6 live, two Codex builds running (A3; game polish then C1b), the review checklist, and Tom's first task for the next session: explore a real "balance the budget" mode (C2) in depth before anything else. Before that: `docs/HANDOFF-2026-11-09-ROUND-FOUR.md` (9 November 2026) holds the open PRs (A4 33, A5 34, C3 on ukcouncils 36, L2 on ukdemographics 155), the two review prompts, the B4 item 1a prompt and what follows. Read it first.

Direction (10 November 2026): `docs/PLAN-2026-11-10-SPLIT-AND-NETWORK.md` sets the split between this site (the bill) and UK Councils (the council, and the front door to the sister sites), route ownership, where each sister site feeds in and the phases to the reversal in May to June 2027; decisions N1 to N5, S1 to S3 are taken. `docs/DESIGN-ROUND-TWO-BRIEF.md` holds design items D1 to D6. From 10 November nothing new is built on both sites.

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
