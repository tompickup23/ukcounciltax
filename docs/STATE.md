# State | UK Council Tax | 15 November 2026

- Live: the last recorded deployment remains main `daf599d`; this session does not deploy.
- Base: `feat/budget-c2-cohort` starts from PR 68 and merges main `647b3eb` without a rebase.
- This draft PR supersedes draft PR 68 and completes C2 production brief stages 1 to 3.
- C2: 170 eligible authorities of 296; 126 excluded with plain reasons and raw cell evidence.
- Eligible by class: UA 38/63, MD 23/36, inner London 4/13, outer London 10/20, districts 95/164.
- Burnley remains excluded: parish difference 800 pounds and own difference 774 pounds.
- Referendum mappings are keyed by GSS and edition, with report quotations, pages and paragraphs.
- Model 0.2 keeps exact arithmetic, all held financing and the existing prototype ranges.
- Local output only: `.ops/c2-dist`, 170 noindex pages; production routes and figures stay unchanged.
- Rebuild: `node scripts/audit-c2-pilot.mjs --check` and `npm run build:pilot`.
- Evidence: `docs/C2-COHORT-2026-11-15.md`; full verification and ten Decimal checks are in the PR body.
- Next C2 work: interface and release review in session B; no public integration is authorised here.
- The registry reorganisation field remains held. County budget interaction remains out of scope.
- No merge, tag or deployment was performed. Other programme decisions remain in the existing plan.
