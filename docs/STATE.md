# State | UK Council Tax | 15 November 2026

- **Merged 15 November:** PR 82 (Estate Kit 0.6.3) `801bd68`; PR 80 (C2 cohort, 197 of 296 eligible, output only in `.ops/c2-dist`) `5e58659`, PR 68 closed; PR 83 (registry refresh, 290 official names, 97 counties) `3412d20` with UK Councils PR 58 `f4311a8`, PR 57 folded in.
- **C2 screen:** Tom kept the strict closed GBP 500 bound on RA total and parish (15 November); 15 truncation-pattern councils, Burnley among them, stay excluded.
- **Base main:** `4625f53` includes the bill changes (PR 81) and public C2 budget mode for 197 councils (PR 84). This branch `data/registry-refresh-2026-11b` refreshes only the short name, with a UK Councils companion. No merge or deployment.
- **Held data:** all 14 registry reorganisation objects unchanged and still not rendered.
- **This refresh:** UK Places short name for E07000112 is now Folkestone and Hythe. Imported through the existing registry route; every other field is unchanged. Slug `shepway` remains pending a separate decision.
- **Next:** gates pack following the public C2 route. Docs PR 85 remains open; recheck its state before relying on the next-session prompts.
- **Decisions waiting:** NV11 compare drawing, X3 Actions billing, X4 worktree removal (uct-c2-pilot, uct-c2-cohort and uct-kit-063 now merged too).
- **Weekly from 17 November:** the measurement note.
- **Binding dates:** levels day staged by mid January 2027; links check before 10 February; freeze 20 March; reversal May to June 2027.
- **Plan:** `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`, section 7 is the latest. Session detail belongs in PR bodies.
- **Refresh verification:** all 1,107 HTML pages and shared outputs byte identical; zero numeric differences; 843 unit tests, distribution and text checks, and 138 production-CSP cases pass. Both registry hashes and the archive handoff are saved in the companion PRs.
