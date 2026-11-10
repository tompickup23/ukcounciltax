# Design round two: both tax sites | brief, 9 November 2026

Written in Claude Code at Tom's request after a look at both live sites on 9 November 2026 (origin/main of ukcounciltax at `d18411f`, ukcouncils at `7454e90`). It follows `ASSESSMENT-2026-11-09-TAX-SITES.md`, `PLAN-2026-11-09-NEXT-SESSIONS.md` section 11 and `PLAN-2026-11-10-REMAINING.md`, and covers only what those do not. Nothing here authorises a push, merge or deployment.

This is a design brief for Claude Code with `/design-check` in the loop (plan section 11.3: design work is not for Codex). It is not yet a binding build brief: each item starts with a before capture and a dry run of its counts, and the session that owns the item writes the assertions into the PR.

## 0. What this brief does not touch

- **UK Council Tax council profiles, ranking pages, chart plumbing and `global.css`.** A3 owns them (`feat/profile-home-overhaul`, brief `b050be5`). A3 already removes the doubled source and table control on the homepage bill card (phase 1c), draws the band bars, bill bar, position strip and locator map, and moves "On this page" under the hero.
- **The canonical direction, titles and H1s on mapped pages.** UK Councils holds the measured rankings until the reversal after the 2027 bill season. No item changes a title, an H1 or a URL on either site.
- **The first screen rule on UK Councils.** The Band D answer stays on the first screen at 375px (B2 brief correction, 10 November).
- **Figures.** No value changes. Every item ends with the number diff against a main build; only presentation may differ.

## 1. Evidence, measured live on 9 November 2026

Counts are from the served HTML: bytes of the document; words as the whitespace split of the text inside `main` with scripts and styles removed; tables as `<table` inside `main`; source lines as occurrences of "Source:" inside `main`; header links as `href` attributes inside `header`.

| Page | Bytes | Words | Tables | Source lines |
|---|---|---|---|---|
| ukcouncils.co.uk/councils/burnley/ | 261,114 | 7,277 | 28 | 63 |
| ukcouncils.co.uk/councils/birmingham/ | 173,304 | 5,821 | 18 | 70 |
| ukcounciltax.co.uk/councils/burnley/ | 98,129 | 3,082 | 7 | 32 |
| ukcounciltax.co.uk/tools/budget/burnley/ | 539,670 | 7,235 | 35 | 71 |

Header links: UK Council Tax 30, UK Councils 25. On UK Council Tax, "Tools and help" holds nine items and lists the increases page twice (`/increases/#2026-27` under Council tax, `/increases/` under Tools and help). On UK Councils one of four menus is the eight band links.

Limits of the look: desktop at 1440 on both sites; phone checked only on the UK Council Tax homepage at 500px; light theme not captured. Each item's before set fills those gaps.

## 2. Items

### D1. UK Councils profile: a summary row and collapsed sections (ukcouncils)

**Problem.** The profile gained its front door content (B2, C3) by addition. Burnley is 7,277 words and 28 tables. Band D is printed in the selector card and again in "Band D at a glance". The first screen is identical to the UK Council Tax profile apart from the accent.

**Build.**
1. A summary row directly under the header, before the band selector collapses into it: Band D for the year (first, so the first screen rule holds), type and tier, population, next election year where verified, the budget headline, and Exceptional Financial Support status where the council is listed. Each fact is a `Fact` with its source and an anchor link to its section. Nothing is shown for a fact the data does not hold.
2. The band selector stays, directly under the row. Delete the repeat of Band D and its change from "Band D at a glance"; that section keeps the position strip only.
3. Every section after the selector shows a headline sentence, one drawing where one exists, and its tables inside the site's drawer pattern. The per page sources list goes in a `details` element (already a lane B follow up in the remaining plan, section 0).
4. `CouncilActions` reduced to three: compare, the council's bill on UK Council Tax, the council's own pay page where held.

**Assert.** Band D figure visible in the first 812px at 375 wide on Burnley and Birmingham; each summary fact present only where its data key exists, with counts dry run against the registry (296 Band D; population, election year and EFS counts read from the data, not from this brief); no figure removed in the number diff except the deleted repeats, listed by name; Burnley prose words outside drawers reported before and after.

**Order.** After PR 37 (the reorganisation panel) merges or is rebased, since both edit the profile page.

### D2. Navigation on both sites

**Problem.** The header is a site index. The budget game, the one feature no rival has, is the sixth of nine items in the third menu and is absent from the homepage.

**Build.** `NAV_GROUPS` in `src/lib/site.ts` on each site.
- UK Council Tax, four top level entries: Find your council (your area, every council, Scotland, Wales); Compare and rank (England, ranked, compare, Band D, rises); Your bill (precepts, parish precepts, help, future cost, 2027/28); Budget game (a direct link, no menu). About, methodology, sources, data, coverage, changes, privacy, contact and corrections move to the footer. The increases page appears once.
- UK Councils: Find your council; Council tax (England, compare, rises, 2027/28, one "By band" link to Band D); Council finances (Exceptional Financial Support, and the budget section once it has a hub); About. The eight band links leave the header; the band chips on the hub and the homepage remain.
- UK Council Tax homepage: a fifth task card, or the fourth replaced, for the budget game, with a kit thumb.

**Assert.** Header link counts recorded before and after (target: under 20 on each); every route removed from the header is linked from the footer on every page; `tests/site.test.ts` and the dist check still pass; no page loses its only inbound link (check with the dist link graph).

### D3. Source lines: one short line per figure, the full citation once

**Problem.** Source text is often longer than the figure it supports, and the same citation repeats down the page (63 on one profile).

**Build.** A `short` form of `SourceLine`: publisher, table and year, linked to the full entry (publisher, document title, table, publication date, URL) in the page's sources list. The first use of each source on a page stays in full. Check that the dist figure gate and the design check both accept the short form with the list open.

**Decision S1, taken 9 November 2026: yes, the short line.** The house rule is that every published figure names publisher, document title, table or page, and date or edition. Tom accepted that the short form keeps publisher, table and year beside the figure, with the title and publication date in the page's sources list one click away. Conditions that keep the rule honest: the first use of each source on a page stays in full; every short line links to an entry that exists on the same page; the build fails if a short line has no matching full entry; share images and PNG exports keep the full source inside the drawing.

### D4. UK Councils homepage takes the face (ukcouncils)

**Problem.** UK Council Tax got the A5 face; UK Councils still has the bar chart (`HistoryBars`), three text only task cards and a hero that says "Council tax for your area".

**Build.** The line chart in place of `HistoryBars`; task cards with small drawings; a second row of cards for what only this site holds (who runs the council, budgets, Exceptional Financial Support, school holidays). The H1 and title stay as they are until the reversal. Check first whether the estate kit is vendored in ukcouncils at 0.3.0 or later; if not, vendoring it is the first commit and follows the A5 pattern (`tests/vendor.test.ts`).

**Assert.** LCP and CLS within the design check gate at 390 and 1440 in both themes; CSP suite passes; the England figure and history values unchanged in the number diff.

### D5. Budget game opening (ukcounciltax)

**Problem.** The page opens beside an empty grey 100 square grid, which reads as an image that failed to load. Plan section 11.2 asked for the published split greyed as a teaser.

**Build (S3 taken).** Replace the grid with a drawn five stop rail naming the rounds. The published split is not shown before round one, because it is the answer to it.

**Order.** After A3 merges (A3 owns `global.css`).

### D6. Small faults (ukcounciltax, after A3)

- `/council-tax/ranked/` is one five row table on an empty page: add the five position strips, one per class, each linking to its class page.
- `/council-tax/`: five average cards wrap four and one; lay them out as five across at desktop or as one table.
- `/council-tax/`: the history table is cut mid row by its container; use the drawer pattern.
- `/councils/` on both sites: 296 bare links; add the Band D figure beside each name from the same table the profiles use, with one source line per region.

## 3. Suggested amendment to A3, for Tom

A3's final order keeps band stock and collection rates directly under the band answer, above the bill breakdown, the comparison and the history. For a resident the bill breakdown and the comparison matter more. Proposed order after `#council-tax`: `#precept-breakdown`, `#compared`, `#history`, `#discounts-and-paying`, then `#band-mix`, `#collection` and the rest. A3 is a binding brief with Codex mid build, so this is a follow up PR after A3 merges, not a change to the running session. A3 also keeps the loose row of action links; cut it to three in the same follow up.

## 4. Decisions

- **S1. Taken 9 November 2026: accepted.** The short source line in D3, with the conditions listed there.
- **S2. Taken 10 November 2026: accepted.** D1's summary row keeps Band D first until the reversal. At the reversal the row leads with who runs the council and the H1 changes, in the same change as the canonicals and redirects.
- **S3. Taken 10 November 2026: the round rail.** D5 replaces the empty grid with a drawn five stop rail naming the rounds; the published split is not shown before round one.

The direction these items serve is in `PLAN-2026-11-10-SPLIT-AND-NETWORK.md`.

## 5. Order and lanes

One writer per repo. ukcouncils: D1 after PR 37, then D4, then D2. ukcounciltax: D2 can start now if it stays in `src/lib/site.ts`, the header, the footer and `src/pages/index.astro` (confirm A3's file list first; stop if they overlap); D5, D6 and the A3 follow up after A3 merges. D3 (S1 taken) on ukcouncils with D1, since the profile is where it matters most, and on ukcounciltax after A3 merges.

## 6. Gate for every item

`npm run check`, `npm run build` with `BUILD_OG=1`, `npm test`, `npm run test:dist`, `npm run test:text`, the CSP suite, `/design-check` at 390 and 1440 in both themes with before and after sheets, and the number diff against a main build. British English; no em dash, en dash or spaced hyphen; no individual named; nothing estimated; named paths only when staging; no merge or deployment without Tom's word.
