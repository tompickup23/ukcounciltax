# Design audit and upgrade plan | UK Council Tax and UK Councils | 15 November 2026

Eight read only review lanes on 15 November 2026 (budget game, UKCT homepage and navigation, UKCT pages, UK Councils, reference patterns from tompickup.co.uk and other estate sites, Estate Kit reuse, cross linking, prior work and constraints), with screenshots of the live sites at 390 and 1440 px, merged into one plan and checked by a constraints critic and a completeness critic. The shareable page is a private artifact for Tom. W0 below is the first workstream and lands in the pull request that adds this note.

## Assessment

The Claude and Codex plumbing work is finished. What is left is almost entirely visual and about how things are found. UKCT main is at f421f1e. Its one open item, C6 levels day staging (draft PR 88), is waiting on Tom's plan section 8 decisions, and it is much wider than it looks. `gh pr view 88` lists 60 files, including src/pages/tools/budget/[slug].astro, src/pages/tools/budget/[slug]/set.astro, src/pages/councils/[slug].astro, src/pages/[nation]/[slug].astro, precepts.astro and the parish pages, council-tax-[year] and adult-social-care, src/lib/site.ts (NAV_GROUPS), paths.ts, kit-charts.ts, PostcodeDoor.astro, BudgetBill.astro, scripts/check-dist.mjs, scripts/lib/budget-game.mjs and tests/fixtures/c1b-static-numbers.json. So the budget routes, the set page, the council page and the nav are all held by C6 until it merges. On UKC, PR 62 (the dossier gate) holds councils/[slug].astro and check-dist. Estate Kit PR 28 is the X3 decision report that any new kit release depends on.

What is live: the budget game for 296 councils, set mode for 197, the Burnley scenario game, compare, the England Band D map, the bill bar (NV10) and the round rail (D5). The sites are sound underneath. Every amount has a source line beside it, pages work without JavaScript, menus use details and summary, dark mode holds, no page overflows at 375 to 390px, CSP hashes are automated, and Estate Kit 0.6.3 is vendored on UKCT. Of the vendored kit parts, four are never used: Waffle, StatTile, ScoreCard and SummaryRow. RankedBars, AreaMap, ZeroBar, PositionStrip and BillAnatomy are already in use. The sites are also strongly gated. check-dist and scripts/lib/face.mjs pin the game H1 text, the round rail, the absence of any grid before round one, the in-SVG sources, exactly five homepage task links, the homepage bill card and the set page's single memory-only theme button. The plan has to work through those gates deliberately, not by accident.

What Tom calls ugly is real. Both sites look like government forms: white ground, a quiet serif H1, grey source lines, long single columns and placeholder thumbnails. They differ only in accent colour and share one house mark. Set mode has a single way in, a plain link under Start. The set page runs to 8,700px on desktop and 14,000px on a phone, with raw inputs and penny-step sliders. Compare opens as a blank form, the map lives only on /council-tax/, and the UKC homepage has no route to the game. One defect is live now: on the UKCT Burnley scenario game, the heading "CAN YOU BALANCE" renders near-black on the dark hero. Most of these problems were found in the 4 to 11 November briefs (D2, D4, NV10 to NV12, the A6 mockup, K5, R560) and then deferred. A way in to set mode was never planned.

The tompickup games look better because of composition: a dark hero band, very large two-tone type, step cards, a pill stepper, a "Your move" box, a pinned gap meter and a stamped result. All of that can be rebuilt from estate tokens and the kit, inside the existing rules. Their copy, imprint, party framing, display face and inline script cannot be carried across. No success measure exists yet (there is no docs/MEASUREMENT.md in any of the three repos), so the programme needs a baseline before it starts. The order of work is set by C6 (staged mid January 2027), the 20 March 2027 freeze and the May to June 2027 canonical reversal. Today the UKCT compare, /council-tax/ (with its band and region pages), /your-area/, /sources/ and the 296 council pages are canonical to UK Councils. Budget pages are not in the canonical map, so they canonicalise to themselves.

## Design direction

Name: "Ledger and Desk". The record stays exactly as rigorous as it is now, and each page gets one confident showpiece. Calm tinted paper carries the reference material. At most one dark "desk" band per page carries the flagship action (the game, set mode, compare, the map), with large display type, a real kit drawing and verb buttons. Sources stay visible as a quiet record line, not as grey clutter.

SIGNATURE DEVICE (what makes it ownable rather than stock editorial). UKCT: the 100p bill stripe, BillAnatomy's "every pound as 100 pennies". It appears as a 4px segmented rule under the header, the hero accent, the unit in the game, the basis of the UKCT mark at favicon size, and the frame of OG cards. UKC: the locator map and the class and tier badge, used as the hero object, the index lead and the basis of the UKC mark. Decorative illustration comes only from these devices: no stock imagery, no photography. Benchmarks to score against at the mockup round: ONS visual.ons, FT data pages, Our World in Data and USAFacts, plus the existing design_scorecard.csv (UKC is currently 5.1, Weak).

GROUND AND COLOUR. Paper tokens come from new skin entries in estate-kit tokens.json, rerendered through each site's apply-brand.py and never hand edited. UKCT light: paper #f8f7f2, warm #efeee6, line #d9ddd3. UKC light: paper about #f7f8f6, warm #eef0ee, line #d8dde0. Cards stay #ffffff, or the dark card token, so data panels lift off the paper. The desk band uses the kit desk part (data-ground="desk" with --ground, --ground-ink and state colours). In light themes its ground is a deep shade of each site's accent: deep green for UKCT, deep blue for UKC. In dark themes it is a lifted, accent-tinted surface clearly above the dark page background, with a 1px accent rule, because the current dark --ground (#05080a) is almost the page colour. K1 sets both values, and both are contrast-gated with kit charts drawn on top. Until the kit release lands, a band may use the existing --ground token with text and cards only. Each site keeps one accent: UKCT green, UKC #245b87. Each flagship tool gets a fixed series colour from the kit palette for its tile, header, icon and 3px card top rule. Charts use a sequential ramp derived from the accent in place of the purple to navy map ramp. In BillAnatomy the billing council's own share takes the accent and other bodies are muted. State colours come only from tokens, and each one always has a text label next to it. Forced-colors rules (none exist today) map bands, gap bars, waffles and stamps to system colours with visible borders.

TYPE. Estate faces only, as the brand system ships them: Source Serif 4 at 600 for display, Source Sans 3 at 400 and 600 for UI, self-hosted and already preloaded. Add a hero display step of clamp(2.5rem, 1.6rem + 4vw, 4.5rem), Serif 600, line-height 1.02 to 1.06, letter-spacing -0.02em to -0.035em, used only on the home page, tool landings and game heroes. Add a two-tone headline made with a span inside the same text node, so pinned H1 text stays byte-identical (for example the game H1 "Could you set Leeds's budget?" with "Leeds's budget?" in --accent-bright on the desk). Money figures use tabular lining numerals. The record line for sources uses Source Sans 3 at a small size with tabular numerals and small capitals for the publisher. It costs nothing in bytes and does not shift layout. A monospaced record face, an italic deck or a condensed display face are all brand-system changes, and they belong only to decision D1 through the kit. Inner reference pages keep their current scale, with text-wrap: balance on headings and a check of the longest council name at 375px.

SPACE AND RHYTHM. Sections get .band, .band--warm and .band--desk with padding-block clamp(3rem, 6vw, 6rem). Desk bands have a rounded foot (0 0 22px 22px) and an optional grain ::after from a data: URI, which the current CSP allows. Charts sit beside their table twin or explanation in a two-column grid at 48rem and above.

COMPONENT LANGUAGE. Eyebrow: tracked capitals in the accent, weight 700, 0.14em spacing, with a 28px by 2px rule before it. Ledger row: two to four figures on a 2px ink top rule with hairline dividers, reusing .fact and .source-line so check-dist still pairs each figure with its source. It maps onto kit StatTile and SummaryRow. Pill buttons: radius 999px, padding 0.85rem 1.5rem, weight 600, soft accent shadow on the primary. ToolCard: a decorative thumb (aria-hidden SVG with no text and no ek-chart class, in the way TaskThumb works), a kicker, a serif title, one line, a pill button and a "Drawn from" line. Two-door chooser: Guess and Set as equal cards. "Your turn" card: a cross-page promo for the game and set mode that shows no modelled figure. Sister card: the sister site's accent rule and mark, no figures. Game furniture: the round rail styled as a pill stepper (the rail stays the opening visual under S3), a "Your move" box, a result board, a gap bar with a target line, a neutral stamp ("Arithmetic balances") and a fixed phone meter that keeps a short visible scenario label. Icons: one licensed open set (Lucide, ISC), subset as inline SVG symbols, never loaded remotely, recorded in the kit. Tables use the kit base recipe: aligned numerics, the source as caption, the sticky th taking the row stripe, and a scroll box only above about 30 rows. Kit chart titles never render above the section H2. Cross-page promo, nav and footer components carry data-pagefind-ignore, and the Pagefind UI is styled in the skin within the CSP.

MOTION. Nothing depends on script. Hover lift of -2px to -4px with a three-step shadow scale under prefers-reduced-motion: no-preference. Scroll reveal uses CSS scroll-driven animation inside @supports (animation-timeline: view()), animating transform only. It never takes opacity below 1 on anything that contains a figure or a source line, so design-check and PNG captures never catch hidden content. Waffle squares fill by a CSS transition on fill. Cross-document view transitions come from the kit base transitions.css. Speculation Rules are left out, because inject_csp_hashes.mjs does not hash that script type. Reduced motion sets every duration to zero, and design-check runs with reduced motion forced.

PRINT. Bands print on white with a rule. Sticky and fixed elements (stepper, meter, rail) become static or hidden. Grids go to one column, animation resets, and links show their URLs.

IDENTITY SPLIT. Shared: header shell, type, tokens, footer structure, StatTile, the record line, the network band and sister cards. UKCT leads with the bill and the budget (bill stripe, BillAnatomy, gap meter). UKC leads with the place and the institution (locator map, tier badge, services grid, elections). The two marks (R560, K5) are distinct and come early. From tompickup, only layout and CSS values are copied: never its copy, imprint, framing, palette, Big Shoulders face or inline script.

## Ranked findings

### Set the budget yourself has one way in and reads as a footnote (UKCT, severity 5)

The new mode for 197 councils is reachable only through a plain underlined paragraph about 70px under Start on each /tools/budget/<slug>/ page. On a phone it sits below the fold, at y=934. The homepage, /tools/, the /tools/budget/ hub (296 rows, all linking to game pages), the header, the drawer, council pages, /increases/, /compare/, the final score card and UKC have no link to any /set/ page. No brief ever planned a way in.

Evidence: src/components/BudgetSetEntry.astro:6 renders <p data-budget-set-entry><a>. budgetSetPath is used in paths.ts, budget-set-entry.ts and set.astro only. A crawl of 15 live pages found a set link on /tools/budget/leeds/ only. Screenshots ukct-leeds-d-fold.png and ukct-budget-leeds-m-fold.png.

Fix: Make Set a named product, keeping the gates intact. (1) A two-door chooser in the game hero, Guess and Set as equal full-card links with 44px targets. The [data-budget-set-entry] element and its exact text ('Set the budget yourself', or the manifest reason) stay inside the Set door. Door copy adds no digits, so tests/fixtures/c1b-static-numbers.json stays valid, and no modelled freeze figure appears on the game page. (2) Two doors on /tools/budget/ and a Set column for eligible picker rows. (3) 'Now set it yourself' in the final score card. (4) A Budgets menu in the header. (5) A 'Your turn' card on council, compare, increases, precepts and 2027/28 pages. (6) On the homepage, a separate 'Two ways to play' block outside nav.task-cards, because a second link inside the task card would be a nested anchor and homeProblems requires exactly five task links. Hrefs come from budgetSetEntry(), extended with a tested Burnley scenario branch (it currently returns null for Burnley) and an England guard (it throws for a GSS outside the 296-row manifest).

Reuse: /Users/tompickup/ukcounciltax/src/lib/budget-set-entry.ts; /Users/tompickup/tompickup.co.uk/src/data/burnley-budget-game/game.html lines 150 to 154 and 175 (layout only); /Users/tompickup/ukcounciltax/src/components/TaskThumb.astro

### Burnley scenario game headline is invisible on its dark hero (UKCT, severity 5)

On /councils/burnley/budget-game/ the h2.game-title 'CAN YOU BALANCE' renders in rgb(23,27,31) on the dark header.top.hero, so only 'BURNLEY?' can be read. The global h1, h2, h3 colour rule beats the hero ink inherited from the container. It is the best-looking page on the site, and its headline is broken.

Evidence: burnley-scenario-hero.png. src/styles/global.css:200 to 205 against game.html:231 (.top.hero{color:var(--hero-ink)}). skin.css has no heading override. public/budget-game/burnley/game.css is generated by scripts/sync-burnley-game.sh, and tests/burnley-scenario-game.test.ts:36 pins its sha256 in meta.json.

Fix: Add .burnley-game .hero :is(h1,h2,h3){color:var(--hero-ink)} to src/components/burnley-game/skin.css. Ship it by rerunning the sync against the pinned run (run-f2ca9ce5ee34f595) with the same edition date, or by extending burnley-game-sync.mjs to re-append the skin without a new model run. Never hand-edit the public file. Record the new servedSha256 in the PR and add a browser contrast test (at least 4.5:1 between the hero heading and its ground).

Reuse: /Users/tompickup/ukcounciltax/src/components/burnley-game/skin.css; /Users/tompickup/ukcounciltax/scripts/sync-burnley-game.sh

### Set page is a document of caveats, not a tool (UKCT, severity 5)

Before the first control come a breadcrumb, the memory-only theme button, the heading, a starting-point box, seven assumption bullets and the referendum rule, about 1,500px. Inputs show raw figures such as 25462000.00. Sliders move by one penny per arrow press across ranges of hundreds of millions. Reaching balance changes only the text. A ledger of 37 to 50 rows, open by default, fills the lower half. Sixteen councils with a frozen charge, Hyndburn among them, open at £0.00 with nothing to do. There is no way to keep the result and nowhere to go next. Without JS, section.controls is hidden and a noscript notice explains why.

Evidence: ukct-leeds-set-d.png, set-leeds-controls.png, set-hyndburn-m-fold.png. Heights of 8,699px at desktop and 14,156px at 390px. set.astro:28 (theme toggle, required once by face.mjs chromeProblems and tests/budget-set.test.ts:57 to 59), :56 to 57 and :66 to 67 (step 0.01), :86 (ledger open). data/pilots/budget-freeze.json has 16 pilots where ownPence equals priorOwnPence. budget-freeze.ts:67 works in 1/10000 pound units.

Fix: Rebuild the page as a workbench on a desk band, after PR 88 merges (set.astro is in it). Compact hero, then a three-cell result board with the published starting figures as source lines. Controls follow at once. Each service becomes a card with a £ formatted value, a change chip, a range at 0.5% steps with a tick at the published value, steppers of at least 44px, percentage chips, aria-valuetext in pounds, and the exact-pounds field and source in a disclosure. The tax control marks the published charge and the referendum trigger. Assumptions fold into 'How this exercise works' with a one-line summary and the model version always visible. The ledger is closed by default. The theme toggle stays, restyled as a small icon in the page foot. Gap bar with target line, stamp at exactly zero, and a fixed phone meter that keeps a visible scenario label. Frozen councils get an open prompt (presets subject to D10). End with 'What next' and 'Copy your scenario' (clipboard only, no request, no storage), plus a print view carrying the assumptions and model version. Without JS, the baseline, assumptions, ledger and noscript notice stay readable. Arithmetic is unchanged. Target under 3,000px on desktop.

Reuse: /Users/tompickup/tompickup.co.uk/src/data/burnley-budget-game/game.html lines 104 to 111, 123 to 133, 180 to 186, 300 to 305, 961 to 985 (CSS only); /Users/tompickup/uk-artificial-intelligence/src/styles/showcase.css:62 to 110; /Users/tompickup/ukcounciltax/src/components/BudgetGame.astro:91 to 94; vendored ZeroBar.astro

### Budget game hero and rounds look primitive beside the tompickup games (UKCT, severity 5)

Above the fold there is a modest serif H1 on white, a grey numbered rail and one small button. Nothing says it is a game. Round one shows ten rows at 0 beside an empty '0p of 100p' grid, and Reveal stays blocked until exactly 100p is placed. Below the game, a 3,900px reference area holds 29 closed tables. The A6 mockup designed a much stronger round and reveal and was never built. A shared score link is a #scores hash, so it unfurls with the generic council OG card.

Evidence: ukct-leeds-d-fold.png against tp-lcc-d.png and tp-burnley-d.png. BudgetGame.astro:24 to 43, :56 to 66. budget-game.ts:161 to 163. docs/design/screens/game-round-1440-light.png. scripts/lib/budget-game.mjs:42 (exact H1), :44 (rail li count equals rounds), :45 (no data-ek-square in .game-lead), :59 (in-SVG sources in rounds). GAME_GZIP_CEILING 14,034 bytes. Decision N4 parked slimming until after the bill season.

Fix: Desk hero with the existing H1 text in two tones through a span (byte-identical textContent). The round rail stays the opening visual under S3, which removed the empty grid as well as the filled split: style it as a pill rail or step cards with no Waffle in .game-lead. Add at most one big sourced figure, with the c1b fixture allowance stated. Then the W1 doors. During play: a sticky pill stepper that scrolls inside itself at 375px and turns static below a viewport height threshold, plus a 'Your move' box. At the reveal: twin waffles, dot plot, ScoreCard and gap bars per A6, each with a table twin and in-SVG sources kept. A designed end card (grade, three closest and three furthest calls, neutral stamp) downloadable as a client-side PNG with no request. A 'Behind the numbers' break, then the tables behind one drawer with the a6-published-text.json selectors unchanged or the fixture updated with a stated allowance. Round one's start state (zeros against an equal split) is a game-design decision for Tom (D13). N4 brought forward subject to D5.

Reuse: /Users/tompickup/ukcounciltax/docs/design/src/game-round.html and build-mockups.mjs; /Users/tompickup/tompickup.co.uk/src/data/lcc-budget-game/game.html (.hero, .herogrid, .intro, .stepper lines 175 to 181, CSS only); vendored Waffle.astro, ScoreCard.astro, ZeroBar.astro

### Homepage and /tools/ do not sell the flagship tools (UKCT, severity 5)

The first screen is the postcode form and a Burnley bill card wrapped in about fifteen lines of small print, including a duplicate source line. The tools start around y=830 as equal small cards with grey placeholder thumbs, and the game thumb is four grey bars. The England Band D map is missing from the homepage, /tools/ and the nav. /tools/ lists five tiles, leaves out set mode, the map, ranked and precepts, cites a Burnley table on a national card, and ends in blank space.

Evidence: home-desktop-fold.png, tools-desktop.png. src/pages/index.astro:43 to 61, 88 to 101. src/pages/tools/index.astro:11 to 19. EnglandMap.astro is imported only in council-tax/index.astro. face.mjs homeProblems requires five task links, each with one aria-hidden SVG and no <text>, and a .home-hero > aside bill card with exactly one ek-chart carrying the in-SVG Burnley source.

Fix: Neither file is in PR 88, so this can start early. Homepage: a compact hero with the bill card trimmed to bar, legend and one source line (extras in a details element), and the in-SVG source kept. Then a 'Try the tools' desk band. Budget is the large tile with Play and Set. Compare and Map use decorative previews (aria-hidden, no text, no ek-chart class), or real charts carrying their actions, PNG and table twin. Then a ledger strip and one Explore block. The bento changes the task-card structure, so the PR rewrites homeProblems explicitly under the A5 face brief section 8 and states why. /tools/ uses the same ToolCard in three groups, Decide, Compare and Your bill, with a national source on the budget card. The map tile links to /council-tax/#map, which is canonical to UKC; that is acceptable as an internal link.

Reuse: vendored Waffle.astro, StatTile.astro; /Users/tompickup/ukcounciltax/src/components/TaskThumb.astro; /Users/tompickup/ukcounciltax/src/components/EnglandMap.astro; /Users/tompickup/tompickup.co.uk/src/pages/projects.astro:122 to 170 (layout only)

### Compare tool opens as a blank form with a text result (UKCT, severity 5)

The landing state is an empty two-column form with 'No council selected.' shown twice and helper text under every field. On a phone the form fills the screen. The result is a sentence and two text cards with no chart, and the full form repeats below it. NV11, the planned visual upgrade, is parked. The page is canonical to ukcouncils.co.uk/compare/ until the reversal.

Evidence: compare.png, compare-m.png, compare-result.png. src/pages/compare.astro:20 to 67. PLAN-2026-11-13 section 10.3 row NV11. data/canonical-map.json maps /compare/ to UK Councils.

Fix: Subject to D4 and D12. Chooser bar hero with a Swap icon. An empty state of static same-class example pairs that work without JS. Result: difference headline, paired ZeroBar, both BillAnatomy on one scale, a shared PositionStrip, all drawn by the bundled comparison-page.ts with table twins and per-figure source lines. The form collapses after a result. Edge states: a devolved council (explain England only and link to the nation page), the same council twice, and no JS. Until the reversal, keep the result content equivalent to the UKC page (same figures and comparisons, better presentation), or bring the canonical change into scope with Tom.

Reuse: vendored ZeroBar.astro, BillAnatomy.astro, PositionStrip.astro; /Users/tompickup/ukcounciltax/src/vendor/estate-kit/dist/src/output/render.js; /Users/tompickup/ukcounciltax/src/lib/comparison-page.ts

### No signature identity: one template, one mark, white ground, flat rhythm (both, severity 4)

UKC and UKCT share the header, hero grid, cards, thumbs and house glyph, with green swapped for blue. Both use pure white, hero type capped near 2.6 to 3rem, a faint grey eyebrow and no dark band except the footer. The vendored UKCT skin block was never spliced, because UKCT apply-brand.py splices only the estate-tokens block and hardcodes sites.ukcounciltax. UKC uses its own apply-brand.py bound to the clawd renderer and kit 0.6.1 charts. The mark and accent decisions (R560, K5) have waited since 9 November.

Evidence: home-desktop-fold.png against ukc-home-fold.png. global.css:19 to 23, :246 to 261. No estate-skin block in global.css. UKC VERSION 0.6.1. DECISIONS-WAITING-2026-11-10.md K5.

Fix: Adopt Ledger and Desk with its signature devices (the bill stripe for UKCT, the map and tier badge for UKC). Mockups first (P1) so Tom decides D1 to D3 from screens, not prose. Kit 0.6.4 (K1) adds paper, light and dark desk values, the hero step and the icon set. Extending UKCT apply-brand.py to splice skins is new work in W8. UKC's script is ported deliberately with --check parity and a token-name diff (U1), not overwritten. Marks (M1) move up to run alongside K1.

Reuse: /Users/tompickup/estate-kit/tokens/tokens.json (skins.sites.councilintel desk block as the shape); /Users/tompickup/ukcounciltax/src/vendor/estate-kit/generated/skins/ukcounciltax.css; /Users/tompickup/estate-kit/base/; /Users/tompickup/clawd/briefings/uk-network-brand/brand-system/build.mjs

### Header and footer bury the tools (both, severity 4)

On UKCT the menus mix tasks with reference pages. Compare is third in a list, 'Band D' sits beside 'Band D ranked', there is no Tools or map entry, and 'Budget game' is a bare item outranked by Search. Panels are plain lists, the active state is a thin underline, and the drawer has no search and no featured tools. On UKC, 'Council finances' opens a menu with one item, and there is no route to the game. Both footers are flat link dumps.

Evidence: src/lib/site.ts:77 to 114 (UKCT, in PR 88) and :76 to 109 (UKC). SiteHeader.astro:177 to 200. SiteFooter.astro:12 to 40. DESIGN-ROUND-TWO-BRIEF.md:54 (D2: fewer than 20 header links, footer covers every removed route, no page loses its only inbound link).

Fix: After PR 88 merges. UKCT: Your bill, Budgets (Play, Set, How councils spend), Compare (two councils, map, ranked, rises, increases), Explore, then Search and a solid 'Find my bill' button. Panels in two columns with icons, a featured card and an 'All tools' foot, and a 3px accent active bar. The drawer leads with search and a 2x2 flagship grid. Footer: Tools, Your bill, About the data, Site, then sister cards with UK Councils first. UKC: Find your council, Council tax, a flat 'Budget game' item marked as on UK Council Tax, Compare, and About moved to the footer. Both keep the D2 assertions (fewer than 20 links, footer coverage, a dist link-graph check) and the details mechanics.

Reuse: /Users/tompickup/ukcounciltax/src/components/SiteHeader.astro; /Users/tompickup/ukdemographics/src/components/SisterSiteTeaser.astro

### UKC homepage and council pages never show off the UKCT tools (UKC, severity 4)

The UKC homepage leads with 'Council tax for your area', two boxed forms and three placeholder thumbs, ends in an empty gap, and links to UKCT only in the footer. D4 was specified on 9 November and never built. On a council page the game is a text link at about y=5,800 of 8,220, there is no set link, and stat tiles are dominated by four to seven lines of citation.

Evidence: home-d.png, ukc-home-d-full.png, blackburn-d.png, bwd-y0.png. DESIGN-ROUND-TWO-BRIEF.md D4. design_scorecard.csv rates ukcouncils.co.uk 5.1 Weak. UKC PR 62 open on councils/[slug].astro and check-dist.

Fix: Homepage D4 on UKC's existing tokens now (no wait for kit CI), re-skinned later by U1. Keep the H1 (S2). Two-column hero with one combined search (GET to /your-area/), a real sourced chart, and a council-owned card row first. Below it, a 'From UK Council Tax' band with Budget game and Set the budget (self-canonical UKCT pages), labelled as crossing sites. Council pages, after PR 62: a network band under the stat tiles, StatTile with a one-line source and the full citation one click away, RankedBars, and demoted figure titles, all passing check-dossier. Set links come from a copied, hash-pinned eligibility manifest with a drift test against UKCT.

Reuse: /Users/tompickup/ukdemographics homepage hero; /Users/tompickup/ukcounciltax/src/pages/index.astro task cards (copied, not imported); /Users/tompickup/estate-kit/src/components/StatTile.astro, RankedBars.astro

### Charts and tables undercut the pages they sit on (both, severity 4)

Kit figures are capped at 40rem, leaving about 40% of the desktop column empty. In-SVG titles render at about 34px, above the 28px H2. Zebra striping is broken on every UKCT table because the sticky th has a solid card background. A 34rem scroll box clips short lists mid-row (Wales cuts off at Swansea). The UKC class map is about 260px wide. The map palette clashes with the brand.

Evidence: src/vendor/estate-kit/src/components/kit.css:3. src/styles/global.css:341, 418, 421. crops/pendle-1.png, wales.png, councils-d.png.

Fix: Page level (global.css, not in PR 88): a two-column chart and twin grid, a rule demoting kit titles to H3 or caption size, the sticky th taking the row stripe, max-height only above about 30 rows. Kit upstream: an optional HTML figcaption title, an accent-derived ramp, and the accent for the own share. In-SVG sources are kept, because homeProblems, budgetGameProblems:59 and the PNG export depend on them. At most they are visually shrunk, with opt-in suppression per chart and never on the homepage bill chart or the game.

Reuse: /Users/tompickup/estate-kit/base/tables.css, DataTable.astro; /Users/tompickup/estate-kit/src/components/AreaMap.astro

### Council page has no headline answer above the fold (UKCT, severity 4)

The first screen is the H1, a type sentence, a 2027/28 note and a 12-chip contents block. Band D and its change first appear at about 1,600px on desktop and 3,000px on a phone. The action row mixes a text link, a button, the game as another link, and Share and Print on a second line. The page is canonical to its UK Councils twin.

Evidence: crops/pendle-0.png, pendle-1.png, pendle-m-0.png. src/pages/councils/[slug].astro:124 to 150 and 182 to 186 (file in PR 88). data/canonical-map.json.

Fix: After PR 88 merges. A SummaryRow under the H1 (Band D with change, own Band D, position within class, share in Band D or below), each with a source and calculation note. A BillAnatomy hook, then one button group (Compare, Set the budget, What makes up this bill, icon Share and Print). Sticky contents rail on desktop, turning static at 200% zoom, and a details element on phones. Next steps cards and sister cards. The held reorganisation field stays out of the hero, share text and index. Keep the figures equivalent to the canonical UKC page until the reversal (D12).

Reuse: vendored SummaryRow.astro, StatTile.astro, BillAnatomy.astro; /Users/tompickup/ukcounciltax/src/components/PageContents.astro; /Users/tompickup/ukcounciltax/src/components/NetworkStrip.astro

### Every other page and every share card stays in the old look (both, severity 3)

Wales is an unsorted 22-row table. Increases repeats an MHCLG note on every row. Precepts is dominated by a Burnley worked example. 2027/28 buries its dates in prose. Your-area is two small forms above blank space. No workstream yet covers devolved council pages, parish pages, ranked, future-cost, findings, changes, coverage, sources, data, about, help, corrections, contact, privacy, the 404, the OG generators, print, or empty and error states. Social previews would keep the old look and the shared mark.

Evidence: wales.png, crops/increases-0.png, crops/precepts-0.png, crops/ct2027-0.png, your-area.png. src/lib/og.ts and src/pages/og/*. global.css:431 to 452 (print).

Fix: Give every route group a treatment tier. Tier 1 is bespoke (home, tools, budget, set, compare, council page). Tier 2 inherits the skin plus a hero or SummaryRow and a 'Your turn' card (Wales, increases, precepts and parishes, 2027/28, devolved council pages with their water, Band I and domestic-rates labels kept separate, ranked, future-cost, your-area). Tier 3 inherits the skin only (about, help, legal pages). Add a templates checklist to design-check. Add an OG re-skin after W8 and M1 on both sites, a styled kit NotFound offering search and the flagship tools, print rules, and designed edge states (postcode failure, devolved visitor on an England-only tool, malformed #scores hash, set page without JS).

Reuse: vendored RankedBars.astro, AreaMap.astro, StatTile.astro, BillAnatomy.astro; /Users/tompickup/ukcounciltax/src/lib/og.ts; /Users/tompickup/estate-kit/base/ (NotFound)

## Workstreams in order

### P0 Measurement baseline and file ownership map (both, S, one Claude session, one docs PR per repo)

Goal: Know whether the upgrade worked, and know which files each workstream may touch before C6 and UKC PR 62 merge.

Waits on: nothing

* Write docs/MEASUREMENT.md in ukcounciltax and ukcouncils: proxies are /set/ views as a share of /tools/budget/<slug>/ views, /compare/ views, referrer share from ukcouncils.co.uk, Search Console impressions and click-through (SEARCH-CONSOLE-2026-11-12.md as the baseline), set page height and time to first control, Lighthouse LCP and CLS on six templates, and a re-score of design_scorecard.csv with a target for UKC (5.1 now)
* Capture a 14-day baseline from Cloudflare Web Analytics (paths only) before W1 lands; re-measure 28 days after each wave
* No event tracking; adding it would need a privacy statement decision
* File ownership table from gh pr view 88 --json files and UKC PR 62, recorded in docs/STATE.md: what is free now, what waits

Reuse: /Users/tompickup/ukcounciltax/docs/SEARCH-CONSOLE-2026-11-12.md; design_scorecard.csv

Gates: Docs only; npm run test:text for dashes; Tom approves the merge, merged as a separate step after the checks are read.

### P1 Mockup round for the visual decisions (both, M, one Claude session, one docs PR)

Goal: Let Tom take D1 to D3, D13 and the bento from screens rather than prose before any large build.

Waits on: P0

* Static mockups through docs/design/build-mockups.mjs: UKCT homepage, game hero and stepper, set workbench, compare result, council page hero, UKC homepage
* 390 and 1440, light and dark, including the desk band in dark
* D1 (a) against (b) side by side; tinted paper against white; two candidate marks per site built on the signature devices
* Score each against the named benchmarks and the scorecard
* Publish privately for Tom

Reuse: /Users/tompickup/ukcounciltax/docs/design/build-mockups.mjs; /Users/tompickup/ukcounciltax/docs/design/src/game-round.html

Gates: Mockups use only figures already published with their sources, or obvious placeholders labelled as such; no campaign copy; nothing deployed to the public sites.

### W0 UKCT quick fixes outside PR 88 (UKCT, S, one Claude session, one PR)

Goal: Remove the visible defects this week without touching any C6 file.

Waits on: nothing

* Burnley hero heading rule in skin.css, shipped by resyncing from pinned run run-f2ca9ce5ee34f595 with the same edition, or by extending burnley-game-sync.mjs to re-append the skin; meta.json servedSha256 updated; contrast browser test
* Table CSS in global.css: sticky th takes the row stripe; max-height only above about 30 rows with a 'Show all N rows' control
* Page-level rule keeping kit chart titles below the section H2
* /tools/index.astro: national source on the budget card; add set mode and map tiles (decorative thumbs, no ek-chart class)
* Homepage: a separate 'Two ways to play' block outside nav.task-cards (Play and Set, href from budgetSetEntry), leaving homeProblems green
* /council-tax/#map anchor
* 404 uses the shell class; drop the inline padding style
* Defer to after PR 88: set page theme toggle restyle (kept, never removed), ledger closed by default

Reuse: /Users/tompickup/ukcounciltax/src/components/burnley-game/skin.css; /Users/tompickup/ukcounciltax/scripts/sync-burnley-game.sh; /Users/tompickup/ukcounciltax/src/lib/budget-set-entry.ts

Gates: npm test, npm run check, npm run build, npm run test:dist, npm run test:text; CSP suite; browser suite (the table rule touches every page); /design-check at 390 and 1440 in light and dark; number diff with no value change; homeProblems and tests/burnley-scenario-game.test.ts green; tests/reorganisation-held.test.ts untouched; npm @playwright/test stays at the locked 1.64.1 and the design checker at playwright==1.65.1; no file from PR 88 touched; Tom approves the merge, merged separately after reading checks, never during a deploy.

### K1 Estate Kit 0.6.4: paper, desk, hero step and icons for both sites (estate-kit, M, one Claude session, one kit PR)

Goal: Give both sites validated paper and desk grounds, a hero display step, an accent ramp and an icon set through the only permitted token route.

Waits on: P1, D2 decision, X3 via Estate Kit PR 28

* skins.sites.ukcounciltax: paper triple, desk block modelled on councilintel with light and dark values, display.hero
* sites.ukcouncils and skins.sites.ukcouncils, with the accent quoted from UKC global.css and the line cited
* Desk contrast gates in both themes with kit charts and state colours drawn on top
* Accent-derived sequential ramp; optional HTML figcaption title; in-SVG source kept by default, suppression opt-in per chart only
* Optional thumb kinds 'set' and 'map'; stepper recorded as a planned part
* Lucide (ISC) icon subset as SVG symbols, no remote load, licence recorded
* Tag 0.6.4; refresh the adoption register and the local checkout

Reuse: /Users/tompickup/estate-kit/tokens/tokens.json (councilintel desk shape); /Users/tompickup/tompickup.co.uk/src/styles/global.css:19 to 31 (paper values and contrast notes)

Gates: X3 settled through Estate Kit PR 28 (Tom's decision, dated); kit CI; qa colour contrast gates in light and dark including desk in dark; catalogue screens regenerated; careatlas.test.ts pattern for the desk; Tom approves the tag.

### M1 Distinct marks for UKCT and UKC (both, M, one shared brand session then one small PR per site)

Goal: Two sites that can be told apart at favicon size, in place before the showcase pages ship.

Waits on: D3 decision, P1

* Draw two marks on the 64 unit grid from the signature devices (bill stripe for UKCT, map or tier badge for UKC)
* Generate favicon, touch icon and default OG through build.mjs on vps-main
* Add both to kit tokens and splice through each site's brand route

Reuse: /Users/tompickup/clawd/briefings/uk-network-brand/brand-system/build.mjs

Gates: Brand route only; OG at 1200px; design-check header at 390; Tom approves before deploy.

### W6 UKCT homepage and tools hub showcase (UKCT, L, two sessions, two PRs (homepage; tools hub))

Goal: The homepage and /tools/ say 'look what you can do here'. Neither file is in PR 88, so this can start early.

Waits on: W0, P1

* Extract ToolCard, the two-door chooser and the 'Your turn' card as components (data-pagefind-ignore on promos)
* Homepage: compact hero with the bill card trimmed (in-SVG Burnley source kept), 'Try the tools' desk bento (Budget with Play and Set, Compare, Map), a second row, a ledger strip, one Explore block
* Rewrite homeProblems explicitly in the same PR under the A5 face brief section 8, stating the new assertions
* /tools/ in Decide, Compare and Your bill groups
* Edge state: postcode failure and unknown postcode with a route onward

Reuse: vendored Waffle.astro, StatTile.astro; /Users/tompickup/ukcounciltax/src/components/EnglandMap.astro; /Users/tompickup/tompickup.co.uk/src/pages/projects.astro:122 to 170 (layout only)

Gates: Full verification set plus BUILD_OG=1; decorative previews are aria-hidden SVG with no text and no ek-chart class; any real ek-chart carries its chart actions, one light PNG and a table twin (chartProblems); S3 holds, so no published split in any thumb; every figure sourced; 375px no overflow; LCP under 2.0s on mobile, CLS at or below 0.1, homepage HTML weight ceiling; axe at 390 and 1440; interim bands on --ground until K1 is vendored; Tom approves the merge.

### W7 UKCT compare tool rebuild (NV11) (UKCT, L, one Codex session, one PR)

Goal: Present compare as a flagship visual tool. compare.astro is not in PR 88.

Waits on: W6, D4 decision, D12 decision

* Chooser bar hero with a Swap icon
* Static example pairs in the empty state
* Result: display headline, paired ZeroBar, BillAnatomy on one scale, shared PositionStrip, drawn by bundled comparison-page.ts with table twins
* Form collapses after a result; 'Your turn' per side with a hub fallback without JS
* Edge states: devolved council, same council twice, no JS

Reuse: vendored ZeroBar.astro, BillAnatomy.astro, PositionStrip.astro; /Users/tompickup/ukcounciltax/src/vendor/estate-kit/dist/src/output/render.js

Gates: No inline script, postbuild hash; England only, same class, band, year and basis; per-figure source line; noscript list kept; CSP and browser tests for the interactive path; content equivalent to the canonical UKC compare unless D12 changes the canonical; Tom approves the merge.

### W1 UKCT two ways to play: the budget entry system (UKCT, M, one Codex session, one PR)

Goal: Make Set the budget impossible to miss across the budget area. Starts after PR 88 merges or rebases on its branch.

Waits on: PR 88 merged, W6 components

* Two-door chooser in the game hero with [data-budget-set-entry] and its exact text kept inside the Set door; no digits in door copy; no modelled figure on the game page
* budgetSetEntry extended with a tested Burnley scenario branch and an England guard
* Mode switcher (Guess, Set, and for Burnley the council's own gap) as plain links
* Game H1 text unchanged; two-tone through a span only
* /tools/budget/ hero doors, featured councils strip with the existing OG cards, Set column for eligible rows
* 'Now set it yourself' in the final score card

Reuse: /Users/tompickup/ukcounciltax/src/lib/budget-set-entry.ts; /Users/tompickup/ukcounciltax/public/og/budget

Gates: Full set plus BUILD_OG=1; budgetGameProblems green (exact H1 and title, rail li count, no grid in .game-lead, in-SVG sources, one light PNG per round, gzip ceiling, static OG); c1b-static-numbers fixture unchanged or allowance stated in the PR body; test that no /set/ link renders for Burnley or the 98 other ineligible councils, and that the card is never rendered for non-England GSS; static links only; Tom approves the merge.

### W2 UKCT set page workbench, part 1: layout and controls (UKCT, L, one Codex session, one PR)

Goal: Controls in the first screen of /set/.

Waits on: W1

* Compact hero with a three-cell result board and published starting figures as source lines
* Assumptions folded into 'How this exercise works' with a visible summary, scenario label and budget-freeze model version
* Service cards: £ value, change chip, 0.5% range with published tick, steppers of at least 44px, percentage chips, exact-pounds and source disclosure, aria-valuetext in pounds
* Tax control with the published charge and referendum trigger marks
* Theme toggle kept, restyled as a small icon; ledger closed by default
* Open prompt for the 16 frozen-charge councils (presets per D10)

Reuse: /Users/tompickup/uk-artificial-intelligence/src/styles/showcase.css:62 to 110; /Users/tompickup/ukcounciltax/src/components/BudgetGame.astro lines 91 to 94

Gates: Arithmetic in 1/10000 pound units unchanged (unit tests); logic only in src/scripts/budget-freeze.ts, no inline script; chromeProblems and tests/budget-set.test.ts green (one memory-only theme button); without JS the baseline, assumptions, ledger and noscript notice stay readable; debounced live region; forced-colors rules; 375px no overflow; desktop under 3,000px; CLS at or below 0.1; axe; manual VoiceOver pass; Tom approves the merge.

### W3 UKCT set page workbench, part 2: feedback, meter, keep and next (UKCT, M, one Claude session, one PR)

Goal: A visible reward for balancing and somewhere to go next.

Waits on: W2

* Gap bar with target line, token state colours with text labels, stamp at exactly zero with neutral wording
* Phone fixed meter: amount at 2rem, gap track, one-word state, a short visible scenario label, safe-area padding, scroll-padding-bottom equal to its height
* Diverging ZeroBar summary of service changes
* 'What next': bill, increases, compare with a prefilled side, four neighbour set links filtered by eligibility
* 'Copy your scenario' and a print view, both carrying the scenario label and model version

Reuse: /Users/tompickup/tompickup.co.uk/src/data/burnley-budget-game/game.html lines 123 to 133, 300 to 305, 961 to 985 (CSS only); vendored ZeroBar.astro

Gates: As W2; the meter never obscures the focused element (WCAG 2.2 2.4.11) and is static at 200% zoom; no storage and no request, so the privacy statement stays true; a unit test over the clipboard text builder for U+2013, U+2014 and the spaced hyphen, because check-text strips scripts; print snapshot test; Tom approves the merge.

### W4 UKCT budget game hero, rounds and result (A6 revived) (UKCT, L, two Codex sessions, two PRs (hero and stepper; rounds, reveal and result))

Goal: A page that looks like a game from first sight through to the shared result.

Waits on: W1, D5 decision, D13 decision

* Desk hero with the existing H1 two-toned through a span, the round rail styled as step cards or a pill rail (no Waffle in .game-lead), at most one sourced figure, then the W1 doors
* Sticky pill stepper and a 'Your move' box per round
* Round one start state per D13
* Reveal per A6: twin waffles, dot plot, ScoreCard, gap bars, each with a table twin and in-SVG sources
* End card with grade and closest and furthest calls, downloadable as a client-side canvas PNG; optional grade OG routes per D14
* 'Behind the numbers' break; tables behind one drawer; neighbour cards with Guess and Set
* Edge state: malformed #scores hash shows a designed message and a fresh start

Reuse: /Users/tompickup/ukcounciltax/docs/design/src/game-round.html; /Users/tompickup/tompickup.co.uk/src/data/lcc-budget-game/game.html (.hero, .herogrid, .intro, .stepper, CSS only); vendored Waffle.astro, ScoreCard.astro, ZeroBar.astro

Gates: budgetGameProblems green; scoring against unrounded shares unchanged; JS in src/scripts/budget-game.ts within GAME_GZIP_CEILING (14,034 bytes gzip, measured in the PR); tests/fixtures/a6-published-text.json selectors unchanged or updated with a stated allowance; A6 _headers template hash (gameHeaderProblem) kept; c1b fixture allowance stated; without JS the rail reads as the static route; stepper scrolls inside itself at 375px and turns static at short heights; PNG weight checked; Tom approves each merge.

### W5 UKCT header, drawer and footer (UKCT, M, one Claude session, one PR)

Goal: Navigation that leads with the tools.

Waits on: PR 88 merged, W1, D8 decision

* NAV_GROUPS rewrite: Your bill, Budgets, Compare, Explore, plus Search and 'Find my bill'
* Two-column panels with icons, a featured card and an 'All tools' foot; 3px accent active bar
* Drawer: search, 2x2 flagship grid, then groups
* Footer: Tools, Your bill, About the data, Site; sister cards from one link table with a drift test, UK Councils first
* Pagefind: nav and footer ignored; search UI styled within the CSP
* Offer the header to Estate Kit PR 27 as the seed part

Reuse: /Users/tompickup/ukcounciltax/src/components/SiteHeader.astro; /Users/tompickup/ukdemographics/src/components/SisterSiteTeaser.astro

Gates: site.ts is in PR 88, so start after it merges; D2 assertions: fewer than 20 header links, every removed route in the footer on every page, dist link-graph check that no page loses its only inbound link; details work without JS; no new inline script; phone header one row under 72px; browser suite; only verified live destinations; AI DOGE gets no return links; Tom approves the merge.

### W8 UKCT skin and token pass (UKCT, M, one Claude session, one PR)

Goal: Apply Ledger and Desk across the site once C6 is staged and merged.

Waits on: K1, PR 88 merged

* Vendor kit 0.6.4; extend apply-brand.py to splice the skin block as new work
* Tinted paper, hero step, two-tone headline, record line in Source Sans 3 with tabular numerals and small caps
* Eyebrow rule, band modifiers, ledger row, pill buttons, shadow scale, hover lift, transform-only scroll reveal
* Kit base layer: numerals, tables, transitions, NotFound; Speculation Rules left out
* Forced-colors rules; print rules for bands, sticky and fixed elements and grids
* Replace Fact pairs with SummaryRow and StatTile; retire the TaskThumb fork for kit thumbs
* Tier 3 pages pick up the skin

Reuse: /Users/tompickup/ukcounciltax/src/vendor/estate-kit/generated/skins/ukcounciltax.css; /Users/tompickup/estate-kit/base/

Gates: apply-brand.py --check; verify-vendor; contrast re-validated on the new paper and the dark desk; longest council name at hero scale with no overflow at 375px; no new font files unless D1 says so; per-template font byte budget; CLS at or below 0.1 and LCP under 2.0s on six templates; reduced motion zeroes durations and design-check runs with it forced; nothing below opacity 1 that holds a figure or source; print snapshots; full browser suite and design-check on every template; land by the end of February; Tom approves the merge.

### W9 UKCT council page and Tier 2 pages (UKCT, L, two sessions, two PRs (council and devolved pages; content pages))

Goal: Every reference page gets a headline answer, proper charts and a route to the tools.

Waits on: W8, PR 88 merged

* Council page: SummaryRow hero, BillAnatomy hook, one button group, sticky rail, Next steps cards, sister cards, 'Your turn'
* Devolved council pages with water, Band I and domestic-rates labels kept separate; no game or set card for non-England GSS
* Wales (published average or blank with a note, RankedBars, AreaMap), increases (MHCLG notes quoted once verbatim), precepts and parishes, 2027/28 timeline with dates exactly as published, ranked, future-cost, your-area
* Two-column chart grids; accent own share; accent map ramp

Reuse: vendored SummaryRow.astro, RankedBars.astro, AreaMap.astro, Waffle.astro; /Users/tompickup/ukcounciltax/src/components/PageContents.astro

Gates: Held reorganisation field never in hero, share text or index (tests/reorganisation-held.test.ts and test:dist); rank and percentages carry calculation notes; no derived bands, no computed averages, no 2027/28 figures; content equivalent to canonical UKC twins unless D12 changes it; sticky rail static at 200% zoom; check-dist; Tom approves each merge; land by mid March.

### W10 OG and share card re-skin, both sites (both, M, one session per site)

Goal: Social previews match the new look and marks.

Waits on: W8, M1

* og.ts and the og routes (card, budget, budget-set, charts, ranking, nation) on the new paper, desk, mark and type, framed by the bill stripe
* Budget card keeps S3 (no published split)
* UKC OG cards to match

Reuse: /Users/tompickup/ukcounciltax/src/lib/og.ts

Gates: BUILD_OG=1; og-sample.test.ts fixtures updated; PNG weight checked; og:image never 404s on a new route before deploy; Tom approves the merge.

### U1 UKC onto the kit token route (UKC, M, one Claude session, one PR)

Goal: Let UKC receive the shared skin, desk and base layer.

Waits on: K1

* Port UKC's own apply-brand.py (currently bound to the clawd renderer) deliberately to the kit route, parameterised for sites.ukcouncils, with --check parity and a recorded token-name diff
* Vendor 0.6.4 parts, charts and tokens
* Replace the local line chart with the kit Line

Reuse: /Users/tompickup/ukcounciltax/scripts/apply-brand.py; /Users/tompickup/estate-kit/src/components/Line.astro

Gates: UKC npm test, check, build, test:dist, test:text, check-dossier; apply-brand --check; visual diff showing no colour change in this PR; design-check light and dark; Tom approves the merge.

### U2 UKC homepage D4 with a UKCT tools band (UKC, M, one Codex session, one PR)

Goal: A UKC front page that reads as a council site and sends people to the game and set mode.

Waits on: P1, W6 components

* Built on UKC's existing tokens now; re-skinned by U1 later
* Two-column hero, one combined search (GET to /your-area/), a real sourced chart; H1 kept (S2)
* Council-owned card row first (finances, EFS, elections, services)
* Below it, a 'From UK Council Tax' band with Budget game and Set the budget (self-canonical UKCT pages), labelled as crossing sites; compare per D9 and D12

Reuse: /Users/tompickup/ukdemographics homepage hero; /Users/tompickup/ukcounciltax/src/pages/index.astro (ToolCard copied, not imported)

Gates: UKC gates as U1; one owner per page type (link, do not host); only verified live destinations; no held reorganisation data; no-JS search; Tom approves the merge.

### U3 UKC council page network band, tiles, nav and footer (UKC, M, one Claude session, one PR)

Goal: Put the UKCT tools in plain view on every UKC council page and tidy the navigation.

Waits on: UKC PR 62 merged, U1, D7 decision

* Network band under the stat tiles with Set the budget and Your bill; Burnley branch to its scenario page; compact repeat by the service bars
* Eligibility from a copied, hash-pinned manifest with a drift test against UKCT
* StatTile with a one-line source and the full citation on the page
* RankedBars service spend; figure titles demoted
* Nav: Find your council, Council tax, flat 'Budget game' on UK Council Tax, Compare; About to the footer
* Footer with sister cards from the shared link table (UK Places and UK Food Hygiene if verified live, per D7)

Reuse: /Users/tompickup/estate-kit/src/components/StatTile.astro, RankedBars.astro; /Users/tompickup/ukcouncils/src/components/SiteHeader.astro

Gates: Starts after UKC PR 62 merges; passes check-dossier; Set links only for the 197; ReorganisationPanel unchanged and the registry field never wired in; D2 assertions for the nav change (fewer than 20 links, footer coverage, link graph); header under 72px on phone; browser suite; Tom approves the merge.

### U4 UKC /councils/ map lead (UKC, M, one session, one PR)

Goal: Lead the index with the class map.

Waits on: U1, D9 decision

* Map at 560px or more beside filters, CSS-only class highlight, softened patterns, one heading
* Remove the duplicate pill row; one-line Type cell
* Compare page: a preselected same-class example pair; no demotion of the canonical UKC compare before the reversal

Reuse: /Users/tompickup/ukcouncils/src/components/CouncilClassMap.astro; /Users/tompickup/estate-kit/src/components/AreaMap.astro

Gates: Map stays linked SVG plus a table; OS and ONS licence lines adjacent; only compatible comparisons; UKC gates; Tom approves the merge.

### U5 UKC dossier council page layout (UKC, L, after the reversal decision)

Goal: A banded dossier with a sticky rail, delivered with the reversal rewrite.

Waits on: U3, reversal

* Sticky contents rail, map and network band rail
* Three grounds: Your bill, The council, Around it
* Compact two-up cards for low-value one-liners

Reuse: /Users/tompickup/ukcouncils/src/components/PageContents.astro

Gates: Held until the May to June 2027 reversal (N1, S2, D1); no overflow at 375px; check-dossier; Tom approves.

## Linking system

One source, one card family, one placement matrix, and respect for the current canonicals.

1. Single sources of truth. Every set link takes its href from src/lib/budget-set-entry.ts, extended in W1 with two tested branches. Burnley goes to /councils/burnley/budget-game/ (today it returns href null). Any GSS outside the 296-row England manifest returns no card instead of throwing, so Scotland, Wales and NI pages never break the build or show an England-only tool. No /set/ path is built by hand. UKC cannot import across repos, so it copies the eligibility manifest with a pinned hash and a drift test against UKCT. Sister links come from one estate link table (extending lib/network on UKCT, copied into UKC), pinned by a drift test, listing only destinations verified live per slug.

2. Card family, copied not imported. ToolCard (decorative thumb with no ek-chart class, kicker, title, one line, pill button, 'Drawn from' line, 3px tool-colour rule). Two-door chooser (Guess and Set). On game pages, the Set door keeps the [data-budget-set-entry] element and its exact text, and its copy adds no digits. 'Your turn' card (Set {name}'s budget as primary, Guess where the money goes as secondary, no modelled figure). Cross-site handoff card ('on UK Council Tax' or 'on UK Councils' in the label). Sister cards (accent rule, mark, one line, no figures). Every promo card carries data-pagefind-ignore, so search does not return hundreds of near-identical hits.

3. Placement matrix, UKCT. Header Budgets menu (Play, Set) and Compare menu (Compare, Map, Ranked, Rises), after PR 88 merges. Homepage: a 'Two ways to play' block outside nav.task-cards now (W0), then the 'Try the tools' desk band (W6). /tools/ in three groups. /tools/budget/ hero doors plus a Set column. Game hero doors, and the score card end goes to Set. Set page 'What next' (bill, increases, compare, eligible neighbour set pages). Council page button group, a 'Your turn' card after Where the money goes, and 'Your council on UK Councils' with sister cards. Compare result: 'Your turn' per side, with a hub fallback without JS. Increases: Compare and Set per row. Precepts and 2027/28: 'Your turn'. Map: /council-tax/#map from the homepage, /tools/, the nav and the council page. Footer Tools column, then a network row with UK Councils first. A styled 404 offers search and the flagship tools.

4. Placement matrix, UKC. A flat 'Budget game' nav item marked as on UK Council Tax. A homepage 'From UK Council Tax' band below UKC's own council-owned row (Budget game and Set the budget, which are self-canonical UKCT pages). A council page network band under the stat tiles, plus a compact repeat by the service bars. A footer network row with UKCT first. The UKC compare page stays canonical and is not demoted in favour of the UKCT copy before the reversal (D9, D12).

5. Ownership and canonicals. UKCT owns the bill, the game, set mode and tax compare. UKC owns the council, and links and teases but never hosts. Today UKCT /compare/, /council-tax/ and its band and region pages, /your-area/, /sources/ and the 296 council pages are canonical to UK Councils. Rebuilt UKCT versions stay content equivalent (same figures, better presentation) until the May to June 2027 reversal, unless Tom brings the canonical change forward (D12). No title changes before the reversal. AI DOGE gets no return links (decision 7). UK Food Hygiene and UK Places go in footers once each URL is verified live. Council page deep links wait on D7 and a per-slug coverage check, and never point at league or 'worst' pages.

6. tompickup.co.uk. No link either way between the neutral sites and the campaign games, which carry a Reform UK imprint and party framing. Only layout and CSS values are copied.

7. Every link is a static anchor that works without JS, and any figure on a card keeps its source line beside it.

## Decisions for Tom

### D1 Display and record faces

Options: (a) Estate faces only as shipped: Source Serif 4 600 at a larger hero scale, Source Sans 3 for the record line with tabular numerals and small caps. (b) Add a condensed display face (for example Big Shoulders Display 800, OFL), a Serif 400 italic deck and or Source Code Pro for source lines, all through the brand system and kit tokens, subset, preloaded only where used, with size-adjust fallbacks.

Recommendation: (a). Most of the tompickup effect comes from scale, a dark band and two-tone lines. Look at (a) against (b) side by side in the P1 mockups before deciding; a monospaced face on every source line risks layout shift on every page.

### D2 Move both sites from pure white to a tinted paper ground

Options: (a) Tinted paper per site (UKCT #f8f7f2, UKC about #f7f8f6) with white cards. (b) Stay white.

Recommendation: (a), through kit skin entries, with contrast re-validated in both themes. Confirm from the P1 mockups.

### D3 Marks and accent (R560 and K5, open since 9 November)

Options: (a) Distinct marks from the signature devices: the 100p bill stripe for UKCT, the map or tier badge for UKC, current accents kept. (b) Keep the shared house glyph. (c) Also move an accent away from UK Food Hygiene.

Recommendation: (a), chosen from the P1 candidates by 1 December 2026, so M1 lands before the showcase pages.

### D4 Un-park NV11 and rebuild compare as a visual tool

Options: (a) Full rebuild (W7). (b) Bars for a fixed set of pairs only. (c) Leave parked.

Recommendation: (a). Every part is vendored and compare.astro is outside PR 88, so it can start early, subject to D12.

### D5 Bring N4 (slim the game page) forward to before the 20 March freeze

Options: (a) Yes, inside W4. (b) Keep it after the bill season.

Recommendation: (a). The game page cannot look world class with 29 tables under it.

### D6 Links between UKCT or UKC and the tompickup.co.uk budget games

Options: (a) None in either direction. (b) The tompickup games link out to neutral UKCT pages. (c) Two-way.

Recommendation: (a). The games carry a party imprint and framing.

### D7 UK Food Hygiene and UK Places links

Options: (a) Footers now; council page deep links after a per-slug coverage check. (b) Footers only. (c) Keep both held.

Recommendation: (a) for footers once each URL is verified live; confirm whether the earlier hold on UKC council page links still stands before deep links.

### D8 UKCT header structure

Options: (a) Four menus plus 'Find my bill', under 20 links, with removed routes covered in the footer. (b) Keep current groups and add Set under Budget game.

Recommendation: (a), with the D2 footer and link-graph assertions in the gate.

### D9 UKC compare page before the reversal

Options: (a) Keep it canonical, add a preselected example pair, no demotion. (b) Point UKC's Compare nav item at UKCT now. (c) Leave as is.

Recommendation: (a). The UKC page is currently the canonical; sending visitors to the non-canonical copy works against the search setup until the reversal.

### D10 User-chosen presets on set mode

Options: (a) One or two presets (for example 'Raise to the referendum trigger') with assumptions and model version, labelled as user requested scenarios. (b) None.

Recommendation: (a), mainly so the 16 frozen-charge councils open with something to do.

### D11 Merge or freeze C6 (PR 88) first

Options: (a) Take the plan section 8 decisions so PR 88 can merge, and design work on budget routes, set, council pages and nav starts after it. (b) Keep PR 88 open to mid January and confine design work to W0, W6, W7, K1, P0, P1, U2 and UK side work until then. (c) Design PRs rebase on the PR 88 branch.

Recommendation: (a) if the section 8 decisions can be taken soon, otherwise (b). Avoid (c), since PR 88 touches 60 files including check-dist and the c1b fixture.

### D12 Canonical status of rebuilt UKCT pages (compare, /council-tax/, /your-area/, council pages)

Options: (a) Keep them canonical to UK Councils and content equivalent until the May to June 2027 reversal. (b) Bring the canonical change for compare (and possibly the map) forward into this programme.

Recommendation: (a) by default. Revisit (b) for compare alone if NV11 makes it substantially richer than the UKC page, since a canonical should point at a true duplicate.

### D13 Budget game round one start state

Options: (a) Keep rows at zero with Reveal blocked until 100p, improved only visually. (b) Start at an equal split summing to 100 with proportional rebalance.

Recommendation: (a) unless you want to change the reviewed A6 game design: an equal split anchors guesses and changes the scored baseline. Decide from the P1 mockup.

### D14 Shareable game results

Options: (a) Client-side PNG download of the end card only. (b) Also pre-render about five grade OG images per council on noindex path routes canonicalised to the game, so shared links unfurl with the grade.

Recommendation: (a) first. (b) adds roughly 1,500 PNGs; weigh it against the chart PNG weight budget before committing.

## Risks

* C6 collision: PR 88 touches 60 files, including the budget routes, set.astro, councils/[slug].astro, devolved and parish pages, site.ts, paths.ts, kit-charts.ts, check-dist, budget-game.mjs and the c1b fixture. Only W0, W6, W7, K1, P0, P1, M1 and U2 can run before it merges. Everything else waits (D11).
* Gate breakage: check-dist pins the game H1 text, the round rail count, no grid in .game-lead, in-SVG sources and the static numbers; face.mjs pins five homepage task links, the bill card and the set page theme button. A design that ignores these fails test:dist on hundreds of pages. Any assertion change goes in the same PR with the reason stated.
* S3 regression: an empty waffle still emits data-ek-square. No Waffle in the game hero before round one, and no published split in any thumb.
* UKC PR 62 collision on councils/[slug].astro and check-dist; U3 waits for it and must pass check-dossier.
* Kit release blocked on X3 (Estate Kit PR 28). Fallback: bands on the existing --ground token with text and cards only, and U2 built on UKC's current tokens.
* Canonical mismatch: rebuilding UKCT pages that are canonical to UKC so that they are no longer duplicates, or sending UKC visitors to the non-canonical copy, before the reversal (D12).
* Freeze on 20 March 2027: W8 and W9 are page-wide with 20 to 26 minute CI runs plus the browser suite. Land W8 by the end of February and W9 by mid March, and push U5 to the reversal.
* Burnley resync: changing the game CSS needs the pinned model run or a skin-only re-append, plus a new servedSha256; a new run would change figures and the edition.
* Source rule regressions from new tiles, doors and ledgers; real ek-chart thumbs need chart actions, a light PNG and a table twin, so decorative thumbs must not use the ek-chart class.
* Held reorganisation data reaching new hero rows, SummaryRows, share text or search entries; tests/reorganisation-held.test.ts and test:dist must stay untouched and green.
* CSP and no-JS: tompickup pages rely on inline script. Copy CSS only; Speculation Rules are never hashed by inject_csp_hashes.mjs, so leave them out.
* Scroll reveal hiding figures or source lines in screenshots or PNG exports; transform only, never opacity on such containers.
* Accessibility regressions: fixed meter, sticky stepper and sticky rail obscuring focus or eating the viewport at 200% zoom; nothing handles forced-colors today; slider live regions flooding screen readers.
* Contrast and overflow: tinted paper, the dark desk and a 4.5rem hero failing AA or overflowing at 375px with long names such as Barking and Dagenham.
* Generic result: the direction could look tidy but stock. The signature devices, the benchmarks and the P1 mockups guard against this.
* Version confusion: npm @playwright/test is locked at 1.64.1 and the design checker at playwright==1.65.1; neither is bumped.
* Campaign crossover: tompickup copy, imprint, framing, palette or face reaching the neutral sites.
* Merging without approval or during a deploy; each PR is merged by Tom's go-ahead as a separate step after the checks are read.
* Pace: around twenty PRs across three repos with one writer each. If time runs short, protect W0, W1, W2, W3, W4, W6 and U2, which carry Tom's stated goal.

## Quick wins

* Fix the invisible 'CAN YOU BALANCE' heading with one skin.css rule, shipped through the Burnley sync with the pinned run and an updated servedSha256, plus a contrast test.
* Add a 'Two ways to play' block on the homepage outside the five task cards, with Play and Set hrefs from budgetSetEntry.
* Add set mode and England map tiles to /tools/ with decorative thumbs, and replace the Burnley-qualified source on its national budget card.
* Give the map an anchor (/council-tax/#map) and link it from /tools/ and the homepage.
* Fix half-striped tables by giving the sticky th the row stripe, and apply the 34rem scroll box only above about 30 rows.
* Add a page-level rule so kit chart titles never render larger than the section H2.
* Trim the homepage bill card to one heading, the bar, the legend and one source line (keeping the in-SVG source), with the rest in a details element.
* Switch the UKCT 404 to the shell class and drop its inline padding style.
* Write docs/MEASUREMENT.md and start the 14-day baseline now so the upgrade can be judged.
* Once PR 88 merges: close the set page ledger by default and restyle (not remove) the memory-only theme button as a small icon.
* Replace the UKC council page text link to the game with a bordered handoff card offering Play and Set, using a copied, drift-tested eligibility manifest (after UKC PR 62).
* Add UK Places to the UKC footer and UK Food Hygiene to both footers once each URL is confirmed live (subject to D7).
