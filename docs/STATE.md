# State | UK Council Tax | 15 November 2026

- **Live:** main `647b3eb` (NV10, PR 75), deployed 14 November by Verify and publish. NV9 (PR 77) and kit 0.5.1 (PR 76) are live before it.
- **PR 78, NV8 England map:** Tom approved the fixed breaks (GBP 2,000 to 2,800) and asked for the merge on 14 November. Not merged: the first `site` run failed only because its PNG fetch ran on a PR build that makes no images. Fixed in `e204725`; the rerun was in progress at archive. Next session: read the checks, merge if green, confirm the deploy and `/council-tax/`.
- **Budget game first (X2: December).** Session A prompt: `docs/CODEX-PROMPT-2026-11-14-C2-SESSION-A.md` (source gates, referendum rules by GSS, pilot widened to the cohort, no public route; supersedes PR 68). Session B (`/tools/budget/<slug>/set/`) is written after A is reviewed.
- **Running in Codex beside A:** ukcouncils responsible council names (`fix/function-names`) and estate-kit compact RankedBars rows (`feat/ranked-bars-compact`, 0.6.3). Prompts: `docs/CODEX-PROMPTS-2026-11-14-PARALLEL.md`.
- **On review of the three:** check each PR body against its prompt; tag kit 0.6.3 after its merge; then the UKCT kit adoption (compact district bars, drop `KIT_DASH_GUARD`, retire the two 24,500 px PNGs) after session A.
- **Waiting:** the gates pack after session A (both touch `scripts/inject_csp_hashes.mjs`); NV11 needs a decision on drawing compare bars in the browser.
- **PR 68:** draft C2 pilot, to be superseded by session A's PR. Close it when that PR opens.
- **C6:** levels day staging in January after the December settlement; staged by mid January 2027.
- **Decisions waiting:** X3 Actions billing, X4 worktree removal, NV11 compare drawing, session B's public lever range.
- **Held data:** the registry reorganisation field stays held.
- **Binding dates:** levels day staged by mid January 2027; links check before 10 February; freeze 20 March; reversal May to June 2027.
- **Plan:** `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`. Session detail belongs in PR bodies.
