# Handoff | all six prepared sessions deployed | 12 November 2026

## Outcome and authority

Tom asked this chat to complete the remaining prepared session. Inspection found all six already implemented. Sessions 1 to 4 were merged; session 5 was UK Councils PR 47 and session 6 was UK Council Tax PR 62, both open with passing checks.

Tom then explicitly instructed: "Merge sessions 5 and 6 if all checks are green, then verify both deployments." Each PR's current checks were read before a separate merge, pinned to the checked head. Both production workflows completed successfully, including their actual publish steps. All six prepared sessions are now merged and deployed. No other PR was merged.

The six prompts remain in `docs/CODEX-PROMPTS-2026-11-11.md` on the `docs/navigation-visuals-brief` branch, pending UK Council Tax PR 54.

## Session 5 | UK Councils

- PR: https://github.com/tompickup23/ukcouncils/pull/47
- Checked head: `e469d513e7a4dd9c317f86358b720b11464b2c13`.
- Merge: `844bb9300543f166c28bf05f30bce10fa4df2bc3`, 12 November 2026 at 10:30:11 UTC.
- Successful production workflow: https://github.com/tompickup23/ukcouncils/actions/runs/43200932127
- Browser tests, production security headers, Cloudflare publish and IndexNow all succeeded.

Live verification at https://ukcouncils.co.uk/councils/: 296 council rows; 12 initially visible at 375 pixels; Show all reveals 296; Lancashire returns the 12 districts in both the picker and site search. No horizontal overflow at 375 or 1440 pixels; dark theme also checked. The old directory was observed before publishing and the new picker afterwards.

## Session 6 | UK Council Tax

- PR: https://github.com/tompickup23/ukcounciltax/pull/62
- Checked head: `b504d1da1af67c7197e3c97d0ef299895d92c5fa`.
- Merge: `e4ef2515d61d1a29b4e58f7c8f0f986b68d82519`, 12 November 2026 at 10:30:21 UTC.
- Successful production workflow: https://github.com/tompickup23/ukcounciltax/actions/runs/43200959226
- Full build, browser suite, actual-header CSP suite and production publish succeeded. The overall run completed successfully.

Chart-download output falls from 4,996 files and 811,933,932 bytes to 2,202 files and 326,095,835 bytes, a 59.84% reduction. Resolution remains 2x. Palette compression was omitted because the trial changed pixels. Vendored kit files and share cards were unchanged. The PR's number diff reported zero changed pages. This chat independently recounted the saved output and reran the distribution check: 909 pages, 908 sitemap URLs and 2,202 chart PNG links passed.

Live verification at https://ukcounciltax.co.uk/councils/burnley/: exactly three light PNG downloads remain, including in dark theme. All return HTTP 200 as image/png, at 1,200 pixels wide. Each hash matches its pre-deployment live image:

| Image | Bytes | SHA256 |
| --- | ---: | --- |
| bands-light.png | 84,123 | de47f4ef09fb53aaa25f398dce0df90ae45bfed42034b24250f0ca4338ea5ab9 |
| bill-light.png | 104,230 | b10ce80e41e847acda4c9b970aa19ca7d7360f8fafd178d9701db8d5a0cbb6b8 |
| position-light.png | 115,838 | 4c25505baa2ea1bf599a45176a1ccc5f896a89404b9ee98a4a4f854b61ea32c4 |

Clicking the bands download opened the 1,200 by 1,026 image successfully. The locator retains its inline drawing and table, with no download link. No horizontal overflow at phone or desktop width. The live Burnley budget page has five light-only round downloads.

Cache observation: the removed `bands-dark.png` and `map-dark.png` URLs return 404. The unlinked `map-light.png` still returned a cached PNG with `cf-cache-status: REVALIDATED`; the same path with `?verify=e4ef2515` returned 404 with `cf-cache-status: BYPASS`. No cache purge was attempted. This does not indicate that the image remains in the new build.

## Remaining work outside these six sessions

At archive preparation, these PRs remain open:

- UK Councils PR 48: Estate Kit 0.5.0, citations, homepage and navigation.
- UK Council Tax PR 61: C2 freeze counterfactual research and Search Console checks.
- UK Council Tax PR 54: navigation brief, handover and six prompts.
- UK Council Tax PR 53: earlier handover.

This chat did not authorise or perform their merges, any kit tag, or worktree cleanup. Refresh their state and checks before acting on a later instruction.

## Local state and resuming

This handoff and its CLAUDE.md pointer are saved locally in the main UK Council Tax checkout. They are not committed or pushed. The main checkout remains at `8f7002f`, behind deployed main; do not infer production state from it. Preserve these local documentation edits when updating the checkout. AGENTS.md remains the symlink to CLAUDE.md.

The existing `chore/chart-png-weight` worktree was reused for read-only verification; no implementation was changed in this chat. Browser verification sessions were closed. No worktree or branch was removed. UK Councils' pre-existing untracked `.playwright-cli/` directory was left alone.

On resuming, read this note before older session handoffs. All six prepared sessions are complete. Only take a new task or an explicitly authorised remaining PR; do not repeat the session 5 or 6 implementation or deployment.
