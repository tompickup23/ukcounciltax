# Decisions | 16 November 2026

Tom took every recommendation below in chat on 16 November 2026 ("Yes, all of them"), after reading them with their reasons. Each is reversible by Tom. They settle the open rows of plan section 10.3 and the fast track in plan section 11.6. Where this note differs from an earlier one, this note is the later record.

## 1. The fast track, narrow scope

An Opus session may merge and publish its own pull request on UK Council Tax or UK Councils when all of these hold:

1. Every CI check on the pull request has passed, read from `gh pr checks` as its own step.
2. A separate reviewer session, not the one that built it, has read the diff against the data rules and its findings are fixed or recorded in the pull request.
3. The pull request changes page layout only: the number diff is empty outside its listed pages, no data file changes, no new route family, no header, footer, navigation or token change.
4. No deploy is running on that site, and no other merge is in flight on that repository.
5. The pull request body carries the design check contact sheet result.

Each session that merges this way adds a line to the day's note for Tom: pull request, what changed, the reviewer's verdict.

Still Tom's yes, in words, every time: data changes and refreshes, new page families (as the towns pages were), navigation (W5), tokens and paper (W8, K1), anything on UK Councils that touches the dossier or the registry, any change to a held field, and anything a reviewer marks as a data rule breach. Codex pull requests are not covered: a Claude session reviews them and asks Tom.

In scope today: W3, W4 and W9 page changes, Tier 2 pages, and follow ups to F1 that change layout only. The towns follow up is not in scope while it changes what the towns pages say about figures.

## 2. Plan section 10.3

| Decision | Taken | Next step |
|---|---|---|
| X3, Estate Kit CI | Stay private. Prompt 10 (Estate Kit PR 28) found no secrets; kit CI passed while private on 15 November (run 43695654256), so going public would buy nothing and need a history rewrite | Gates pack (prompt 4) and K1 may proceed on the private repository |
| X4, worktrees | Remove the merged and clean worktrees under `~/wt/uct-*`, and the untracked `output/` folder (45 MB) in the main checkout. Kept: `~/wt/uct-ci` (sessions copy raw data from it), worktrees with an open or unmerged pull request, and any worktree with uncommitted work | Done on 16 November for UK Council Tax; UK Councils worktrees when no session is running there |
| Shepway slug | Rename `shepway` to `folkestone-and-hythe` in early December, after the links check of 1 to 5 December: five URLs, 301 redirects on the three sites that link them | One pull request per site in December, Tom's yes for each (it changes routes) |
| Seats by party source | Option A: a dated snapshot from Open Council Data under CC BY-SA, credited, with share alike applied to the composition table only. Option B cannot reach 296 profiles by January | Build in the dossier source pass; Tom's yes for the data pull request |
| Audit identity method | The exact name join measured in UK Councils PR 60, plus a reviewed list for the remaining councils. PSAA data only if its terms allow reuse | Same |
| Section 114 register | A register of original notices only, labelled as not exhaustive | Same |
| NV11 compare | Bars for a fixed set of pairs, no new form | Folded into W7 |
| Reorganisation field | Stays held through the reversal unless UK Places is rebuilt from a corrected source with two sources | No change |

## 3. Also recorded

- D2 paper: option (a), `#f8f7f2` with white cards, decided in F1 (plan 11.10); it lands through K1 and W8.
- UK Councils PR 62: the reasons in "What is not shown on this profile" read as internal process. The session bringing PR 62 up to date is drafting plainer wording; the page copy changes only on Tom's yes.
