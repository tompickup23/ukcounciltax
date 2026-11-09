# Handover: B2 prep done, live check and B1 review pending

Written 9 November 2026 in Claude Code (Opus) before archiving the session that ran the "Opus (Claude Code), now: B2 prep, live check, review" prompt in `docs/PLAN-2026-11-09-NEXT-SESSIONS.md` section 7. A new session continues from here.

## State at handover

| Job | State |
|---|---|
| 1. Live spot check of the budget game | Not run. ukcounciltax PR 26 was still OPEN at the last check. Nothing to record yet; nothing touched on the live site. |
| 2. B2 front door prep (ukcouncils) | Done. Worktree `~/wt/ukc-front-door`, branch `feat/front-door-content` from `origin/main` at `f0e2020`, local commit `9649396` with `docs/B2-FRONT-DOOR-SOURCE-NOTES.md` and `docs/B2-FRONT-DOOR-BRIEF.md`. **Not pushed.** |
| 3. B1 review (ukcouncils) | Not run. No PR for `feat/links-held-fields` at the last check. Codex was still building in `~/wt/ukc-quick-wins` (items 1 to 3 committed, latest `ec01d01`; later items uncommitted). Do not write in that worktree while Codex is active. |

Nothing was pushed, merged or deployed.

## B2 in brief

Read the two B2 docs for the detail. Pages covered, of 296: population (ONS MYE25UK, pinned hash) 294, Barnsley and Sheffield held for the 2025 boundary code change; collection rate (MHCLG QRC4 2025/26 Table 9a) 296, the copied importer must write a file byte identical to ukcounciltax `data/national/collection-rates.json` (sha256 `cecd26a1...`); next election (UK Elections register, verified records whose quote states the year) 174; Local Links service pages 258. Visuals: the Band D position strip and the collection rate strip are specified as server SVG; the seats by party bar is specified and held. The brief tells Codex to start only after B1 merges.

Held for Tom (listed in the brief, "Decisions for Tom"): seats by party and control (no source meets the rule); the 46 election years read from a stated cycle (all 32 London boroughs other than the City, and others); the Surrey abolition line; council homepages; last election dates; the wrong registry `officialName` for Birmingham, Barnsley and the Isles of Scilly.

## Finding to carry into the B1 review

The B1 brief and the 9 November assessment say 54 EFS authorities have a council page. `data/efs/statements.json` gives **51** (57 authorities; the other six are Copeland, Norfolk, Worcestershire, East Sussex, South Yorkshire MCA and Kent PCC). B1's unit test reads the count from the data, so it passes on 51; the PR body or dry run line may still say 54.

## Paste prompt for the continuing session

```text
Read /Users/tompickup/ukcounciltax/docs/HANDOFF-2026-11-09-B2-PREP-AND-PENDING-CHECKS.md, then /Users/tompickup/ukcouncils/CLAUDE.md and docs/PLAN-2026-11-09-NEXT-SESSIONS.md section 7. Two jobs, each only when its trigger has happened (check with gh; if neither has, say so and stop).

1. If ukcounciltax PR 26 has merged, spot check the live site read only: https://ukcounciltax.co.uk/tools/budget/burnley/, /tools/budget/birmingham/, /tools/budget/coventry/ and /tools/budget/. Confirm titles, the DSG wording on /tools/budget/isles-of-scilly/, "Printed in the RA return as" on /tools/budget/dorset/, and that each page's canonical is itself. Record the result in a short note in ukcounciltax docs; fix nothing on the live site.

2. If the ukcouncils PR for branch feat/links-held-fields is open, review it: /code-review medium, then check docs/B1-QUICK-WINS-BRIEF.md's assertions by hand on the built pages (the EFS count is 51 in the data, not 54), fix small issues on the branch, and write a fix list for anything larger. Do not merge.

House rules: British English; no em dash, en dash or spaced hyphen; never estimate or derive a figure; name no individual; nothing pushed, merged or deployed without Tom's word. Finish with a one paragraph report per job.
```
