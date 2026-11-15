# State | UK Council Tax | 15 November 2026

- Live: last recorded deployment remains main `daf599d`; this session does not deploy.
- PR 80 is ready for review on `feat/budget-c2-cohort`, superseding draft PR 68.
- Main including PR 78 was merged as `5636d02`, without rebase or force push.
- C2: 197 eligible authorities of 296; 99 excluded with raw cell evidence.
- Eligible by class: UA 41/63, MD 28/36, inner London 4/13, outer London 10/20, districts 114/164.
- Total and parish use closed GBP 500 bounds; no tie rounding rule was found in the pinned RA files.
- Own uses the derived GBP 1,000.50 bound as a fixture assertion, not an exclusion.
- All 27 former own-only exclusions are admitted; Burnley still fails parish.
- Hull and West Northamptonshire remain eligible at the closed total boundary.
- Trafford and Warrington use 7.5%; North Somerset uses 9%; joins change no decisions.
- Year and rule text come from model edition and referendum data for session B.
- Production refresh tripwire names the file and `node scripts/audit-c2-pilot.mjs` rebuild command.
- Output only: `.ops/c2-dist`, 197 noindex pages. No public C2 route.
- Saved handoff and limitations: `docs/C2-COHORT-2026-11-15.md`, `docs/RELEASE.md` and PR 80.
- Next: session B interface and release review. Public integration is not authorised.
- Registry reorganisation stays held; county budget interaction stays outside scope.
- No merge of PR 80, tag or deployment. All verification results are in the PR body.
