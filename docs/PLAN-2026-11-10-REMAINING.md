# What remains after A2, B2 and the design prep | plan, 10 November 2026

Written at the end of the 9 to 10 November Claude Code session, with Codex A2 on its gate, Codex B2 at item 5 of 10 and the Opus design prep in the estate kit. It follows `PLAN-2026-11-09-NEXT-SESSIONS.md` (sections 1 to 11) and `ASSESSMENT-2026-11-09-TAX-SITES.md`. Decisions waiting on Tom are in `DECISIONS-WAITING-2026-11-10.md`. State and resume notes are in `HANDOFF-2026-11-10-SESSION.md`.

## 1. Linking across the estate: where it stands and what to change

Checked live on 10 November 2026 on Burnley's pages.

**Outbound from the tax sites is done and verified.** Every English council page on both sites carries a "more on this place" list with one verified URL per sister: UK Elections `/seats/<slug>/`, UK Demographics `/places/<slug>/`, AI DOGE `/councils/<slug>/`, Asylum Stats `/places/<slug>/`, UK Food Hygiene `/councils/<slug>/`, and on UK Councils also UK School Holiday Dates by education authority. The URLs come from each sister's sitemap at registry build time (`data/registry/councils.json`, field `sisters`, with the sitemap counts recorded), so they are not slug guesses. UK Councils' footer carries five sisters including UK Council Tax (B1); UK Council Tax links UK Councils on every council page (PR 15 canonicals and the sister list).

**Inbound is almost absent.** UK Demographics' Burnley place page links to no sister site at all. UK Elections' Burnley seat page links to AI DOGE only. AI DOGE's Burnley page links to UK Councils but not to UK Council Tax. Across 350 UK Demographics place pages and 3,796 UK Elections seat pages, nothing points at a council's tax bill or its council profile. That is the single largest linking gap in the estate, and it is cheap: the pattern (fetch the sitemap, save it with its date, join by exact GSS code, render only where the URL exists, count in a unit test and a dist check) is B1 item 2 and already exists in UK Councils.

**The lists carry names, not reasons.** "UK Demographics" as a link text tells a visitor nothing. Each tax site now holds pinned data that can make the line worth clicking, with a source under it: the ONS mid-2025 population (both sites, from A1 and B2), the verified next election year (UK Councils, from B2), and AI DOGE's published spending summary (UK Councils, `data/spending/`). A "Burnley across the network" strip, one line per sister, each line a figure, its source and the link, replaces the bare list. Where a figure is not pinned locally (food hygiene counts, asylum support), the line keeps the name and a plain description.

**Attribution.** The brand index records UK Councils, UK Council Tax and UK Places as signed, UK Elections, UK Demographics, UK Food Hygiene and UK School Holiday Dates as network, and AI DOGE as standalone, whose definition is no signature and no cross links. Live, neither tax site names the publisher on its about page, and AI DOGE already links UK Councils from its council pages. Before the inbound links go in, Tom confirms in one line that network sites may carry contextual links to the two tax sites (decision 7 in the decisions note, added by this plan), and whether AI DOGE's existing cross link stands. Nothing here changes a footer on a network site; the inbound links are contextual lines on place and seat pages only, which is the least the tier rule can object to.

### The linking items

| Id | Repo | What | Depends on |
|---|---|---|---|
| L1 | ukcouncils, then ukcounciltax | The "across the network" strip on every council page: population (ONS mid-2025) to UK Demographics, next election year (where verified) to UK Elections, published spending (AI DOGE summary, as stored) to AI DOGE, bare lines for the rest; source line under each figure; replaces the bare list; the game page gets the same strip | B2 merged (UK Councils); A1 merged (UK Council Tax, done) |
| L2 | ukdemographics | Inbound: fetch both tax sitemaps, `data/links/`, a "Council tax and the council" line on each place page whose GSS code is an English billing authority (Band D figure not copied; the line names the band and the year and links), footer unchanged | Decision 7 |
| L3 | ukelections | The same line on council seat pages (`/seats/<slug>/` where the slug is a billing authority), not on ward pages; after results week | Decision 7; not before 17 November |
| L4 | aidoge | One line beside the existing UK Councils link: the council's Band D on UK Council Tax | Decision 7 (and whether a standalone site cross links at all) |

L2 to L4 share one brief template, written once by Opus and varied per repo: the sitemap fetch script, the saved JSON with `fetched` and `source`, the GSS join, the render only when present rule, the counts (296 English billing authorities on both tax sitemaps as of 10 November; 319 self canonical URLs on UK Council Tax after A2), the unit test and the dist check, the text test. Expected sizes: UK Demographics 296 of 350 place pages gain a line; UK Elections 296 of 3,796 seat pages; AI DOGE 296.

## 2. The remaining queue, by lane

One writer per repo at a time. Codex builds from a brief; Opus prepares, reviews and does the design work. Reviews are Opus sessions of their own only when more than one PR is open; otherwise the session that prepared the next item reviews first.

**Lane A, ukcounciltax (Codex):** A3 profile and home (brief in `~/wt/uct-profile`, to be revised for the kit and the strip after A5) then A4 rankings and parishes (brief in `~/wt/uct-rankings`, after decision 5, Lewes) then C1b scenario mode (brief in `~/wt/uct-scenario`, after A6 so it is built on the redesigned game, not the stepper form) then L1 on this site.

**Lane B, ukcouncils (Codex):** C3 the budget section (brief in `~/wt/ukc-budget`, after B2 merges) then L1 on this site then B3 seats by party (after decision 1, brief to write).

**Lane C, Opus (Claude Code):** reviews of A2 and B2 as they open; kit 0.2.0 and the A5 and A6 briefs (running now); A5 build after the A2 PR opens; A6 build after A5 merges; the A3 brief revision; the L2 to L4 brief template; the C3 review; the design check before every design PR.

**Lane D, other repos (Codex, one at a time):** L2 UK Demographics, L4 AI DOGE, L3 UK Elections after 16 November. Each is one short session from the shared template.

**Tom:** decisions 1 to 7; the beacon token and Search Console; the mark (estate DD1, R560); merges, which deploy.

### Order of events

1. A2 PR opens: Opus reviews, Tom merges. Opus starts A5 build in `~/wt/uct-face`.
2. B2 PR opens: Opus reviews, Tom merges. Codex lane B starts C3.
3. Design prep reports: Tom looks at the mockups; kit 0.2.0 merges.
4. A5 merges: Opus revises the A3 brief (kit charts, BenchmarkStrip as the position strip, ChartActions on every chart, DataDrawer for the long tables, the network strip), Codex lane A builds A3.
5. A6 merges: the game is a game. Codex lane A then A4 (Lewes decided) and C1b.
6. Decision 7 taken: Opus writes the L2 to L4 template; lane D runs L2, L4, then L3 after results week.
7. C3 merges: lane B does L1 on UK Councils, then B3 if decision 1 allows.
8. Beacon and Search Console live: the first measured week before the 2027 bill season planning in section 10 of the assessment.

## 3. Outline prompts

These are outlines to be completed by the Opus session that owns the step, with the sha, the counts and the file list filled in at the time. Rules common to all: British English; no em dash, en dash or spaced hyphen anywhere including commit messages; never estimate, derive, apportion or infer; name no individual; stage named paths only; do not merge or deploy; one commit per item; end PR bodies with "Built with Codex from a brief prepared in Claude Code." where Codex built it.

### Opus: review A2 or B2 (one per PR)

```text
Review ukcounciltax PR <n> (A2) against docs/A2-QUICK-WINS-BRIEF.md in the worktree ~/wt/uct-quick-wins: ten items, one commit each. For each item: does the commit do what the brief says and nothing more; do the assertions hold on the built output (run npm run build and npm run test:dist in the worktree if the PR body's counts are not reproducible from the diff); any new text with an em dash, en dash, spaced hyphen, estimate or individual. Check the canonical counts (319 self canonical, 69 mapped to UK Councils after the six brand pages) in tests/canonical.test.ts and check-dist. Post the review as a PR comment: what passes, what blocks, what is a follow-up. Do not merge.
```

The B2 variant names `docs/B2-FRONT-DOOR-BRIEF.md`, the source notes as binding, the seven withheld quotes, the 296 and 294 and 174 counts, the first screen Band D check on the Burnley 375 by 812 capture, and the reorganisation hold test.

### Opus: A5 build (after the A2 PR opens)

```text
Build A5 from docs/A5-FACE-BRIEF.md in ~/wt/uct-face, branch feat/face-and-game, rebased onto origin/main after A2 merges. Pin estate kit 0.2.0 as the dependency the brief names and adopt its tokens through scripts/apply-brand.py. Items in the brief's order, one commit each: hero alignment and the postcode and name doors in the hero; the bill anatomy card drawn by the kit's billAnatomy; the four task cards with their small drawings; theme select to the footer; share cards regenerated. Run the design check skill at 390 and 1440 in both themes against the local preview and keep the after sheets beside the before set; LCP under 2.5 s and CLS under 0.1 in the lab run; npm run test:csp with production headers; BUILD_OG=1 for the final build. PR titled "The face: hero, bill card, task cards and kit tokens (A5)" with before and after contact sheets. Do not merge.
```

### Opus: A6 build (after A5 merges)

```text
Build A6 from docs/A6-GAME-BRIEF.md in ~/wt/uct-face on a new branch feat/game-as-game from origin/main. Keep src/lib/budget-game.ts scoring and data untouched; change src/scripts/budget-game.ts and src/components/BudgetGame.astro only, plus the score card renderer for the share image. Waffle split rounds with range inputs and the stepper kept for keyboards; two waffle reveal with a zeroBar gap per service; funding round reveal as a ranked bar; reserves as one card; step rail; score card summary rendered server side for the score link; no JavaScript state unchanged; the check button disabled until 100p is placed. Test on a 375 wide viewport end to end with no horizontal scroll; all 287 game pages build; tests/budget-game.test.ts unchanged and passing; csp suite passing. PR titled "The budget game as a game (A6)". Do not merge.
```

### Opus: A3 brief revision (after A5 merges)

```text
In ~/wt/uct-profile, revise docs/A3-PROFILE-BRIEF.md for the kit: band bars A to H with the chosen band marked (zeroBar), the position strip as BenchmarkStrip from UK Demographics moved into the kit (value, min, median, p90, max within class, with the basis and source), the stacked bill bar (billAnatomy), ChartActions under every chart, DataDrawer for Band D history and the parish table, the locator map from the kit in place of the mini map, and the "across the network" strip (L1) with its three sourced lines. Dry run every count against main. Record whether A3 is the DS3 place template pilot ahead of UK Demographics and why. Commit the brief; do not build.
```

### Codex: A3, A4, C3, C1b

Each is the existing pattern: "Work only in <worktree>, branch <branch>. Fetch and rebase onto origin/main. Read CLAUDE.md, then <source notes> (binding), then <brief>. Build the items in order, one commit per item, with the brief's assertions and stop conditions. Run the full gate; take the screenshots the brief names; push; open the PR the brief describes. Stop only on the brief's stop conditions; otherwise the most conservative choice and a line under Decisions taken." The worktrees and briefs: A3 `~/wt/uct-profile` `feat/profile-home-overhaul` `docs/A3-PROFILE-BRIEF.md`; A4 `~/wt/uct-rankings` `feat/rankings-parishes` `docs/A4-RANKINGS-PARISHES-BRIEF.md` with its source notes; C3 `~/wt/ukc-budget` `feat/council-budget-section` `docs/BUDGET-SECTION-BRIEF.md`; C1b `~/wt/uct-scenario` `feat/budget-game-scenario` `docs/C1B-SCENARIO-BRIEF.md`.

### Opus: the L2 to L4 template (after decision 7)

```text
Write docs/SISTER-LINK-BRIEF-TEMPLATE.md in ~/ukcouncils/docs (the repo that holds the working pattern, B1 item 2: scripts/fetch-ukcounciltax-sitemap.mjs, data/links/ukcounciltax-councils.json, src/lib/council-tax-links.ts, tests, check-dist). The template takes: target repo and worktree, the page template to change, the join field (GSS code), both tax sitemaps, the line's wording ("Council tax bands and the <year> Band D for <name> on UK Council Tax; the council's profile on UK Councils"), the counts to assert (296 of N pages), the dist check and the text test. Then write the three instances as docs in each repo's worktree: ~/wt/ukd-links (ukdemographics, place pages), ~/wt/aidoge-links (aidoge, council pages, one line beside the existing UK Councils link), ~/wt/uke-links (ukelections, council seat pages only, not before 17 November). Dry run the GSS joins against each repo's registry and record the counts. Commit the briefs; do not build.
```

### Codex: L2, L4, L3

"Work only in <worktree>, branch <branch>. Read CLAUDE.md and the brief, which is binding. Fetch both sitemaps with the script the brief names, commit the saved files, add the line only where the URL exists, assert the counts in a unit test and the dist check, run the full gate, push, open the PR. Stop if either sitemap fetch fails or the count differs from the brief."

## 4. Corrections to section 11 of the previous plan

- UK Demographics was used only through the kit. Its `BenchmarkStrip` is the position strip the audit asked for and should move into the kit rather than be redrawn; its `ChartActions` (PNG, data, embed with the source carried) belongs under every kit chart on this site; its `DataDrawer` is the pattern for the game's long tables and the profile's history; its map renderer's templates and QA gates are the output system the kit's locator map follows. The A5 and A6 briefs take these in (addendum pasted to the running design prep session on 10 November).
- A3 is proposed as the DS3 place template pilot ahead of UK Demographics, because it is the next profile rebuild in the queue and this site has the stricter figure gate. The design prep records the decision.

## 5. Sizing

Twelve to fourteen sessions over about three months: three Opus design sessions (A5, A6 and the kit), four Codex builds on the tax sites (A3, A4, C3, C1b), three short Codex sessions on other repos (L2, L4, L3), two Opus prep sessions (the A3 revision and the link template) and the reviews. Nothing in it depends on new data. Everything after A6 depends on the beacon being live if it is to be judged rather than assumed.
