# UK Council Tax and UK Councils: assessment, 9 November 2026

Written late on 9 November 2026 in Claude Code at Tom's request, after both Codex budget game sessions had finished. It builds on the estate pack in `~/Documents/Reports/Website_Audits/` (the 3 November whole site audits of both sites, their scorecards and competitor rows, the 4 November design audit, the 8 November sitting sheet, the roadmap register) and does not repeat what those record unless it is still unfixed. Six parallel read only reviews fed it: UK Council Tax page by page, UK Councils page by page, budget game PR 26, data architecture of both repos, estate practice and marks and marketing, and competitors. Nothing on any site, repo or branch was changed. Live checks were made against both sites on 9 November 2026.

## 1. Where things stand tonight

| Item | State |
|---|---|
| Codex session C1, the budget game | Finished. PR 26 open on `feat/budget-game-i001`, head `cf577ad`, hosted check green, mergeable. 296 budget pages, 287 games, nine no return notices, 688 HTML pages in the build |
| Codex session C4, spend per resident | Finished. Four phase commits on `feat/per-resident-i124` in `~/wt/uct-per-resident`, all checks recorded as passing, no push and no PR as the brief required. Status "ready to rebase onto main" after PR 26 merges |
| PR 27, programme handover | Open, check green, two docs only |
| PR 15, cross domain canonicals | Merged 8 November and deployed. The repo's `CLAUDE.md` pointer still says it is unmerged |
| ukcouncils PRs 30, 31, 32 | Merged and deployed 9 November: profile sections, Exceptional Financial Support by year, no downloads and no Asylum Stats links |
| Local checkouts | `~/ukcounciltax` main is behind origin (PR 25 and the canonicals); `~/ukcouncils` main is 45 commits behind origin. Two handover docs sit untracked in `~/ukcounciltax/docs/` |
| Measurement | UK Councils: beacon and Search Console. UK Council Tax: neither, five weeks after launch. The weekly traffic note of 3 November lists it among sites with no GB beacon loads because there is no beacon |

The canonical position, checked live: 326 entries in the reviewed map, every one pointing from ukcounciltax.co.uk to ukcouncils.co.uk. That includes the UK Council Tax homepage and its own about, contact, corrections, privacy and methodology pages. Only the routes with no twin are self canonical: increases, help, findings, changes, precepts, tools, the 2027/28 page, data, coverage, Scotland and Wales and their 54 council pages. Every ukcouncils.co.uk page is self canonical, and no page on ukcouncils.co.uk links to ukcounciltax.co.uk at all.

## 2. The one structural finding

The 8 November decision (option C now, option A after the bill season) is being executed as written, but two consequences were not in the decision sheet and need Tom's eye.

1. **The flagship launches on a domain whose front door is canonicalised away.** PR 26 adds 297 self canonical `/tools/budget/` routes to a site whose homepage, `/tools/` hub (absent from the navigation) and brand pages all declare another domain canonical. The WebSite and Organization JSON-LD on the homepage name UK Council Tax while the canonical names UK Councils. Brand searches will resolve to the sister. Cross domain canonical is a hint that Google honours for near duplicates; the English council profile on UK Council Tax now carries band mix, collection rates, the bill split and the Band D line that the UK Councils twin lacks, so Google may ignore the hint per page, which is the worst of both.
2. **Nothing flows back.** UK Councils holds the measured rankings (3 to 128 clicks, 558 to 29,900 impressions, position 21.7 to 9.7 in the 28 days to 31 October) and links to four sisters in its footer and "More on" blocks, none of them UK Council Tax. When the canonicals reverse after the season, UK Council Tax starts cold on 325 URLs with no inbound path from the site that ranked.

Recommended, without reopening the decision: make the brand pages (`/`, `/about/`, `/contact/`, `/corrections/`, `/privacy/`, `/methodology/`) self canonical on UK Council Tax now, since they are not duplicates in any useful sense; add UK Council Tax to the UK Councils footer block and a contextual link under every Band D card; put Scotland, Wales, Tools and What changed in the UK Council Tax navigation; and record in the sitting sheet that the reversal must happen in one change across both repos with Search Console inspection of ten shared URLs before and after, never a period where both are self canonical.

## 3. Budget game, PR 26: merge after three small fixes

The review verdict is merge after small fixes. The data layer is sound: figures read verbatim from three pinned workbooks, thousands to pounds conversion explicit and unrounded, null and zero kept apart, Note 4 quoted beside council tax requirement in tables and reveal, Note 8 and signed deductions intact, the six funding groups proven to sum to line 900 for every council, nothing apportioned. Scoring is deterministic, ties handled, the share fragment carries scores only (1 to 3 digits or skip per round, bounded at 100), restored scores are labelled unverified, no storage and no external request. The e2e suite covers Burnley and Birmingham by keyboard at 375px and desktop in both themes with axe on every screen, all nine no return pages and all seven note 4 pages.

Fix on the branch before Tom merges, then rerun test, build, test:dist and test:text:

| # | Finding | Where | Severity |
|---|---|---|---|
| 1 | Title is "[Council] budget game" and the description is one identical sentence on all 297 pages; neither names the year; the nine no return pages are titled as a game they do not have | `src/pages/tools/budget/[slug].astro:19-21` | Medium: titles index once |
| 2 | "Most schools spending is paid for by the Dedicated Schools Grant" renders whenever education is non zero; the Isles of Scilly has education £756,000 and DSG £0, so the sentence is false there | `BudgetTables.astro:22`, `budget-game-data.ts:17` | Medium: a false sentence on a published page |
| 3 | RA return names leak into headings on 22 pages ("Dorset UA", "Medway Towns", 19 ampersand forms) while H1 and breadcrumb use the display name | `budget-game-data.ts:13,22,30,42`, `BudgetTables.astro:14,19` | Low, visible |

Lower priority follow ups for the branch or C1b: the running total sits below all inputs on mobile (Birmingham has 9 inputs, some unitaries 12), so move it above or make it sticky; cache the three RA workbooks in CI keyed on hash so every push to main does not fetch gov.uk and a gov.uk outage does not block unrelated deploys; the new "where money goes" section is missing from the profile's PageContents; "11 June 2026" is hardcoded in five places; committed screenshots show round one only. The `/design-check` and `/fact-check` passes the plan asked Claude to run on Burnley and a unitary page have not been run; the Codex session could not run them.

After the merge, in order: C4 rebases onto main and opens its PR (mechanical); C1b, the scenario round, with the running total fix first and scenario inputs kept out of the share fragment; C3, the UK Councils budget section, copying `budget.ts` and the importer rather than importing across repos and carrying the Note 4 and display name rules from the start. The queue, lanes and efficiency rules in `docs/CODEX-SESSIONS-BUDGET-GAME.md` hold up; the C1 pattern (Claude prep, Codex build, Claude review, Tom merges) produced a clean PR and should stay.

## 4. UK Council Tax, page by page

Fixed since 3 November and confirmed live: English H1s match titles; descriptions lead with the figure and the internal check date is gone; `/help/` has the "What council tax band am I?" heading and band pages link to it; Scottish titles carry the basis; data SVGs are named. Still unfixed: the www host returns 200 with no redirect; the sitemap has no lastmod on any of its 390 URLs; the beacon token is empty; Scottish council pages reuse the homepage share card; Scottish and Welsh council pages run to about 300 words.

What the delta review adds:

- **Home leads with one town.** The hero aside holds the whole Burnley bill split before the postcode door, which at 375px sits roughly two screens down. Home shows Burnley Band D on the unparished schedule and the Burnley profile shows the MHCLG area average; both are labelled, but a visitor sees two figures for one place.
- **Weight.** `/increases/` is 711 KB of HTML with 1,217 links; `/council-tax/band-d/` 514 KB with 19 tables and no England headline before the first region; `/council-tax/` 357 KB with no body link to any unique page. Every finder ships a hidden 296 item list.
- **Duplication inside the profile.** Band D history appears four times; the parish caveat repeats in every band panel; the PageContents block sits mid page after band mix and collection rates and omits both.
- **Format drift.** The increases table prints "£2432.50" where every other page prints "£2,432.50"; "Mar-27" is printed raw; "4.00%" on Scottish pages against one decimal in England; a SHA-256 and "file type: XLSX, file size: 26 KB" appear in reader copy on the 2027/28 and Cardiff pages.
- **Hubs and navigation.** `/england/` does not exist although home says "Council tax across the UK"; `/scotland/`, `/wales/`, `/tools/` and `/changes/` are in no menu; `/changes/` has one inbound link; Welsh profiles are reachable from one page; "Sources" appears twice in the menus pointing at `/data/` and `/sources/`, two pages with different models.
- **Titles without a query.** "Findings", "What changed", "What could council tax cost"; Scottish titles at 102 characters.
- **Empty before JavaScript.** `/compare/` and `/precepts/` render empty headings filled by script; the scenario calculator's bars are client only and aria hidden with no axes; the 404 offers one link and no search.
- **Contact.** `/contact/` gives info@ukcouncils.co.uk, so the brand's own contact is another site's address. That was decision 12 of 6 October; it reads oddly beside a self branded site.
- **Profile sections missing** that every rival shows or a visitor expects: a plain A to H table with ten and twelve instalments (the selector hides seven bands behind radios); discounts, exemptions and how to pay, or even a link to `/help/`; the council's own council tax page (links go to UK Places, not the council); a parish precept range in words; same class neighbours; the budget game link once PR 26 lands; ranked position within class.

Ten improvements by value for effort are in section 11.

## 5. UK Councils, page by page

Fixed since 3 November and live: council H1 matches the title; band and same class neighbour links; Dataset and FAQPage nodes gone; lastmod on all 328 sitemap URLs; band page headline with ten and twelve instalments; evergreen increases page with three yearly sections; a 2027/28 page holding no figure; findings with two dated notes and a ten item feed; downloads and Asylum Stats links gone; the EFS page; profile sections on every council page. Still unfixed: the home H1 is "Council tax for your area"; hubs put all 296 rows in the DOM (Band D 381,030 bytes, EFS 478,561 bytes).

What the delta review adds:

- **The profile is a tax page with a thin profile under it.** Order on `/councils/burnley/`: breadcrumb, H1, type line, band selector, caveat, map, actions, band links, then the profile. "What is Burnley council?" is about three screens down at 375px. Strip the tax template and about 120 words of own text remain. Band D with its 25 word source line appears four times.
- **Does it answer the six front door questions?** Charges, yes, first screen. Who runs it, no. Elections, no (a sister link at the foot). Holidays, yes, one line, three screens down. Spending, a count and total where AI DOGE holds a summary (234 of 361 registry councils), else absent. Financial trouble, no: Birmingham's profile does not mention EFS although the EFS page links 51 council pages and none link back.
- **The EFS page** is one 20,854 word document with 416 figures each carrying a full source line, 203 sections, no overview, no chart, no anchors per council.
- **Held, and rightly.** The registry holds a reorganisation field for 14 Lancashire councils and prints it for none (PR 27 held it on 5 November). Its text still describes the government's four unitary decision that MHCLG's letter of 29 October 2026 withdrew, so it must stay held until the registry is refreshed from UK Places; printing it would publish a withdrawn decision.
- **Chrome faults on every page.** The search dialog's hidden h2 precedes the h1; the footer adds a second h2 after content; `/compare/` has an empty h2 and two empty h3 before JavaScript; `/sources/` lists council tax, the register and postcodes only, not AI DOGE, the calendar, ONS boundaries or the EFS pages the site cites.
- **Internal competition.** Home and `/council-tax/` both target "council tax in England 2026/27"; the Band D figure sits on council, region, band, hub and increases pages with no primary.

What the front door needs before the reversal, per council page: type and tier in a sentence; seats by party and control as counts (UK Elections holds 146 councils); last and next election dates; the council's own website; population; reorganisation status; EFS status with year and amount where MHCLG lists it; collection rate; a budget headline (C3); a compact Band D card with one source line and a link to UK Council Tax. That is 400 to 600 sourced words and three visuals per page.

## 6. Data visuals

Both sites draw from the same small kit and the kit is good where it exists. The Band D line (`BandDLine`) is the best built visual on either site: server SVG, zero based, pounds and year labels, basis in the caption, role img with title and description, a details table under it, source line beneath. The `Fact` stat tile with a required source and the `data-figure` count in `check-dist` is the estate's best figure gate and is already named for export. `TaxTable` earns its place. The mini map is decorative: it shows a boundary and names no neighbour.

Where the data is on the page and nothing is drawn:

| Data already on the page | Nothing drawn | Suggested form (FT visual vocabulary, estate kit) |
|---|---|---|
| Bill split shares of 100 pounds | List with coloured dots, three of which are greys so the colour code says nothing | One stacked 100 pound bar, server SVG |
| Band D components by body | Table | Stacked or grouped bar |
| Eight band figures per council | Hidden behind radio panels | A to H bars with the chosen band highlighted |
| Council against England and class averages | Two stat cards | A position strip: the published range within class, England and class ticks, the council marked, three thin rows for three years |
| Year on year change ranked within class | Eleven tables on the increases page | Ranked dot or bar strip per class |
| Band D by council | 296 row tables | Choropleth from the boundary data the mini map already loads |
| Parish precepts in a district | Table | Range in words plus a strip (min, median, max) |
| EFS by year | 416 figures in text | Year overview chart, per council timeline |
| Seats by party (UK Councils) | Not shown | Hemicycle or bar, counts only |
| Term dates (UK Councils) | One line | Calendar strip for the academic year |
| Scenario calculator (UK Council Tax) | Client only div bars, no axes, aria hidden | Replace with a labelled SVG or drop; the table is the real output |

Signature visuals (design decision DD2 asks for one per site): UK Council Tax, the stacked 100 pound bar on home and precepts, the band bar on profiles, the choropleth on hubs, the ranked strip on increases; UK Councils, the Band D position strip on every profile, the one picture no rival draws, with the EFS timeline second. All server rendered, no script, same colours in both themes, the source line inside the component, through the estate kit rather than local copies. The kit (0.1.0, seven charts, card output) exists but does not yet know either site: its tokens hold six sites and its marks five, and neither tax site is among them.

## 7. Data architecture

Measured by blob id on the two origin heads: the three England band files, the registry and the boundaries are identical between repos, bar a `generated` date. The importers `fetch-council-tax.mjs`, `fetch-boundaries.mjs`, `ods.mjs`, `figures.mjs` and `inject_csp_hashes.mjs` are identical; `check-dist.mjs`, `council-tax.ts`, `registry.ts`, `tax-view.ts` and `paths.ts` have diverged. No figure drift today; nothing enforces that.

The bill season risk is mechanical. The levels fetcher discovers the ODS by title on the content API, so a 2027/28 entry must be added to `YEARS` and `CURRENT_YEAR` moved in both repos, and both will parse the new workbook independently. The weekly ukcouncils workflow will open a PR when MHCLG publishes; ukcounciltax has no schedule and will not notice. The national importer hardcodes the parish count, the history vintage, three hashes and anchor cells (correct stop gates, each a per edition edit with no checklist); the devolved importer has fixed cell ranges, joins by normalised name instead of GSS and carries a literal retrieval date. Importers with no test of their own: devolved, local bills, registry sync, boundaries, national, band stock and collection rates (the last three have strong output tests and self asserting runs). The ODS reader has no unit test in either repo.

Schema: no JSON schema in either repo; TypeScript interfaces per dataset, copied and diverged. Provenance is file level except `budget.json`, whose fields carry source, line, unit and record type, the pattern the rest should follow. Year keys use `2026-27` in UK Council Tax data and `2025/26` in the spending contract. Parishes are correctly keyed on the MHCLG parish code, undocumented. One build inefficiency: `contextLinks()` re-reads two ecosystem sitemap files on every call for every council page.

Target: one producer, two consumers, as `docs/BUILD-BRIEF.md` section 7 already asks. A private data repository holding the importers, `sources.json`, hashed raws and derived JSON, publishing a release per edition with a manifest (dataset, edition, publisher, title, table, dates, sha256 of inputs and outputs, importer commit); both sites pin by sha as ukcouncils already does for school holidays, with a test that fails if a committed file differs from the manifest; one JSON schema per dataset validated with ajv in producer and consumers (aidoge-site does this for five schemas; ukplaces has a schema nobody validates against); per figure provenance; a dataset landing page per site with a citation line (decision R091, decided 4 November, built nowhere); one scheduled probe that detects a new edition and opens the review PR, never imports or deploys. Nine sessions in all. The minimum before 20 March 2027 is three: the quick fixes (wire the school holidays test into ukcouncils scripts, a cross repo equality test on the three shared files, cache the sitemap reads, GSS join and no literal date in the devolved importer, a bill season checklist) and the data repo with its first tagged editions. Release calendar for both sites: Scottish and Welsh levels March 2027; MHCLG levels and Table 10 late March; local precepting authorities March; revised Band D history April; RA budget June; QRC4 collection June with a July revision; CTSOP September. Freeze both sites' data from 20 March until the first reviewed import.

## 8. Search, measurement and competitors

Neither site appears for any of ten fixed bill season queries run on 9 November (WebSearch, a US index, positions indicative only): council tax Burnley, council tax band D, council tax increase 2026, council tax rates by council, check my council tax band, cheapest council tax in England 2026, where does my council tax go, parish precept council tax 2026, find my local council, councils exceptional financial support list 2026. The jobs are held by councils, Wikipedia and GOV.UK (bands and rates), programmatic aggregators (ranking: housecheckup holds six band pages; a pages.dev pair whose England average and cheapest council contradict the MHCLG release they cite), PA lists through regional titles (increases), and councils and parishes alone (bill anatomy and precepts). The Institute for Government's Datawrapper chart of Band D by authority since 2000/01 in real terms is second for "council tax band D".

What rivals do better is presentation and plumbing: CouncilData's interactive Band D map and per figure verified dates; salarytax's daily regeneration with a CC BY embed and a cite line; the IfG's downloadable real terms series; Open Council Data's seven day old stamp and CC BY-SA councillor data; Democracy Club's by election diary. What ours do better none can claim without contradiction: every figure from the official table with publisher, year, basis and hash, no derived bands, no averages dressed as bills, three nations labelled apart. moneyscot now labels water in its column heading, so the Scottish basis race (R342) is at parity.

Five things nobody does well that these sites can own: parish precept transparency (the inputs are on `/precepts/`); Band D since 1993/94 per council (the series is held; the IfG shows percentiles only); the per council budget game with a results report; same class rankings with the table reference; a dated EFS register and reorganisation tracker (the GOV.UK EFS table has no total and sits thirteenth; the press disagrees on the count, 35 or 37). Table stakes to add: a map, a per figure change date, a last updated line on both homepages, a next release line per indicator.

Measurement first. Nothing in the season can be judged until UK Council Tax has its own Cloudflare beacon token and a Search Console property (R340, due 11 November; R060 held). The CSP already allows the Insights hosts, which resolves the contradiction recorded in `CLAUDE.md` in favour of adding the beacon. "Council tax increase 2027" is owned by nobody and the referendum principles report lands between December and February by last year's pattern, so the evergreen increases page and the 2027/28 page need indexing on the right domain before December, which is another reason to settle the brand page canonicals now.

## 9. Logos, marks and cards

The two sites share one glyph, a house path, pale on a filled accent tile (green for UK Council Tax, blue for UK Councils); only the tile colour differs. At 16px it reads as the browser's own home icon. Neither follows the 64 unit tile construction decided as DD1 (bright accent mark on the `#0f1317` ground), and R560 is not done for these two although the mark sheet v1 landed for nine sites on 4 November. UK Council Tax's green triple also sits close in hue to UK Food Hygiene's green, and hue is the only signal besides the glyph.

Recommended marks on the family tile: UK Council Tax, a portrait bill in accent bright with three knocked out item rules and a heavier total rule, 36 by 44 units so it rhymes with UK Elections' ballot (not a band letter, which is a monogram tied to one band; not a house, which is UK Councils' territory and the browser's icon). UK Councils, a civic building: pediment over three columns on a plinth, columns six units wide with four unit gaps so they hold at 16px. Full favicon sets (SVG, touch PNG, manifest, ICO) as UK Elections and AI DOGE already ship.

The share cards: both sites' council cards are the same layout with a different accent, carrying no figure, no footer rule, no domain and no source, which breaks the post card grammar that UK Elections, UK Demographics and the LCC budget game card keep. The fix is one job: render the council card through the estate kit's card set from the page's Band D line or bill split, which puts the domain and the source edition on every card by construction and fails the build when they are missing.

## 10. Marketing plan for the 2027 bill season

Fixed points: Tom decided "MHCLG only" on 8 November (D5 option C, no live tracker, political control off UK Council Tax); last year's levels release was 09:30 on 25 March; councils must set before 11 March; the budget game is PR 26. Channels: no social account exists for either site; Bluesky handles for both and YouTube for UK Council Tax were free on check; the estate holds a Bluesky poster script in UK Food Hygiene; Tom's own channels may share the sites' cards as authorship disclosure; the hub's projects list names ukcouncils.co.uk but not ukcounciltax.co.uk.

| By | Moment | Assets and actions | Owner |
|---|---|---|---|
| 11 to 20 Nov | Measurement and marks | Beacon and Search Console on UK Council Tax; reserve the Bluesky handles and the YouTube handle; mark sheet entries, favicon sets, both sites into the estate kit tokens and marks | Tom for accounts and tokens; Claude |
| By 18 Dec | Game live, Dataset, press | Merge PR 26 after the three fixes; Dataset markup with distribution on the tables of record (8 November sitting, option b); a press page per site on the UK Food Hygiene pattern with "quote the edition, say area average, do not call it a bill" lines; a cite line; UK Council Tax in the hub's projects list; council cards re rendered through the kit | Claude; Tom merges |
| When the draft principles report lands | Referendum principles | A facts only explainer on UK Council Tax: thresholds as printed, the s30(6) date, what the game lets a reader try; one feed item; one headline post card per site without a figure | Claude |
| Early Jan (C6) | Staging | Levels day page, a rankings page per class, the per council "your bill" page wired to 2027/28 data and rendering nothing until it exists, the year switch behind a flag, the embed as a static PNG card plus an img and link snippet (no script, passes the CSP) | Claude |
| Feb | Council budget meetings | No figures; promote the per council game URL and the explainer; weekly posts by region using the game card; the sites name no councillor or party | Tom's channels; sites neutral |
| Release morning, March | MHCLG levels | The R8 runbook in D5: import, checks, PR by 11:00, merge by 12:00, IndexNow (automated), feed item, rankings per class live, England average card from the kit with the edition in the footer, nine regional cards; a press line per region built from counts within class, sent as the publisher to regional papers and local democracy reporters | Claude; Tom merges and sends |
| Late March to April | Bills landing | "Your bill" card per council by region; help page and precepts page in every post; Scottish and Welsh pages updated on the dates their governments state | Claude; Tom |
| From 15 Dec and before the season | Audit | R334 and R339, with the April bills as the benchmark event | Claude |

Freeze: no other UK Council Tax merge from 22 March until the release PR lands.

## 11. Ranked actions

Effort: S under a session, M one to two sessions, L more. "Tom" means it needs an account, a token or a merge.

| # | Action | Site | Why | Owner | Effort | By |
|---|---|---|---|---|---|---|
| 1 | Three fixes on PR 26 (titles and descriptions, the DSG guard, display names), rerun the four checks, merge | UKCT | The flagship; titles index once | Claude fixes; Tom merges | S | This week |
| 2 | Beacon with the site's own token and Search Console property; inspect ten shared URLs for Google's chosen canonical | UKCT | Unmeasured five weeks after launch; the reversal needs the evidence | Tom; Claude for the PR | S | 11 Nov (R340) |
| 3 | Self canonical on the homepage and brand pages; Scotland, Wales, Tools and What changed in the nav; body links from `/council-tax/` and every profile to `/help/`, the nation hubs and the budget game | UKCT | A front door that declares another domain canonical; 297 new routes hanging off an absent hub | Claude; Tom merges | S | Before PR 26 deploys or with it |
| 4 | UK Council Tax in the footer block and a contextual link under every Band D card; EFS status line with a back link on the EFS councils (54 with a council page in the data); "What is X council?" above the band selector; the reorganisation field stays held until the registry is refreshed after the 29 October withdrawal | UKC | No inbound path to the site that takes tax after the season; data held and not shown | Claude prep; Codex build (brief B1); Tom merges | S | 25 Nov |
| 5 | Format sweep: thousands separators in the increases table, long dates everywhere, one decimal for percentages, no raw "Mar-27", hashes or file sizes in reader copy; Scottish and Welsh pages get their own card, the year in the H1, a source line under the lede figure | UKCT | Trust is the product; drift shows | Claude | S | 25 Nov |
| 6 | C4 rebase and PR; then C1b; then C3 with the review's carry overs | both | The queue is ready and the pattern works | Claude prep and review; Codex build; Tom merges | M each | Nov to Dec |
| 7 | Home: postcode door first, the Burnley example reduced to one stacked 100 pound bar; profile: plain A to H table above the selector; history collapsed to the line plus one table; a discounts, exemptions and how to pay section linking `/help/` and the council's own page | UKCT | The visitor's own council before one town's bill; what every rival shows | Claude | M | 9 Dec |
| 8 | Signature visuals through the estate kit: stacked bar in the bill split and components, band bar on profiles, choropleth on hubs, position strip on UK Councils profiles, EFS timeline; the scenario calculator's bars replaced or removed | both | Data on the page, nothing drawn; DD2 | Claude (kit first, then adopt) | L | 15 Jan |
| 9 | Data architecture minimum before the season: the one session of quick fixes, then the data repository with first tagged editions and both sites pinning by sha; a bill season checklist in docs | both | Two independent parsers of the same MHCLG workbook in March, no drift guard | Claude | 3 sessions | 20 Mar at the latest; start Dec |
| 10 | Marks and cards: bill and portico on the family tile, favicon sets, both sites into the kit, council cards rendered by the kit with domain and source | both | One glyph on two sites; cards without a figure or source | Claude | M | 20 Nov (R560) |
| 11 | Front door content on UK Councils profiles before the reversal: type and tier sentence, seats and control as counts, election dates, website, population, collection rate, budget headline (C3) | UKC | About 120 own words per page today | Claude; Codex for the data sections | L | Feb |
| 12 | Split `/increases/` by year with a region filter; cap rows on the band hubs; one source line per EFS year table with a year overview and per council anchors | both | 711 KB and 479 KB pages | Claude | M | Jan |
| 13 | Titles with queries on findings, changes and the future cost tool; retitle UK Councils findings; fill compare's headings server side; a 404 with search and routes | both | Pages that cannot be found | Claude | S | 25 Nov |
| 14 | Dataset markup with distribution, a press page, a cite line, a last updated and next release line on both homepages | both | Table stakes rivals have; the sitting chose option b | Claude | M | 18 Dec |
| 15 | Reserve the Bluesky and YouTube handles; add UK Council Tax to the hub's projects list | both | Free on check; the hub does not point at the specialist site | Tom; Claude | S | 20 Nov |

## 12. Decisions for Tom

1. **Brand page canonicals.** Make `/`, `/about/`, `/contact/`, `/corrections/`, `/privacy/` and `/methodology/` on UK Council Tax self canonical now, inside option C, or leave the full 326 map until the reversal. Recommended: self canonical now; they are not duplicates and the game launches under them.
2. **The reversal mechanics.** Confirm that the reversal after the season is one change across both repos with Search Console inspection before and after, and set the date relative to the April bills.
3. **The beacon.** Add it with the site's own token (the CSP already allows the hosts), closing the contradiction recorded in `CLAUDE.md`.
4. **The contact address.** Keep info@ukcouncils.co.uk on UK Council Tax (decision 12 of 6 October) or give the specialist site its own mailbox before the season.
5. **Marks.** The bill and the portico as the two marks, on the family tile, as the mark sheet's next two entries.
6. **Data repository.** Authorise the three minimum sessions before 20 March, or accept a hand run of two parsers on release morning.
7. **PR 26.** Merge after the three fixes, or merge as is and fix in a follow up (titles would index once with the weak form).

## 13. Corrections to earlier documents and loose ends

- `~/ukcounciltax/CLAUDE.md` says PR 15 "remains unmerged"; it merged on 8 November at 17:31 UTC and deployed. The pointer needs updating when the two untracked handover docs are committed.
- The 9 November programme handover says UK Councils' `sisterLinks` skips UK Food Hygiene as "the private project" while UK Council Tax's guide says it has been public tier B since 6 October; one is out of date and the estate survey confirms UK Food Hygiene is live and indexable.
- `docs/HANDOFF-2026-11-08-CANONICALS-REBASE.md` describes "324 built cross domain canonicals"; the map on origin/main holds 326 entries pointing at ukcouncils.co.uk and the live site confirms the brand pages are among them. The count difference is the retired rises route and the 404; the point for the sitting sheet is that the brand pages were in the reviewed map.
- Roadmap rows R317 and R336 described the interim canonical as "from the 325 ukcounciltax duplicates to the ukcouncils equivalents", which is what shipped. The budget game handover's "UK Council Tax is the home of the game" and the D5 note sit on a domain canonicalised the other way; neither document mentions it.
- The ideas register (Reports PR 603) is still unmerged, so I001, I007 and I124 progress is not recorded there; it should not be edited from these repos.
- UK Council Tax still holds `tax-export.ts` and `national-export.ts`, used only by tests, after downloads were removed.
- `~/ukcouncils` local main is 45 commits behind origin and has untracked `.playwright-cli/` and `output/` directories; `~/ukcounciltax` local main is behind origin; six worktrees under `~/wt/` remain (two merged and safe to remove, but ask Tom first).

## 14. Evidence

Live fetches of both sites on 9 November 2026 (titles, canonicals, sitemaps, page sizes); `gh pr view` and `gh run list` on both repositories; origin/main of both repositories and `origin/feat/budget-game-i001`, `origin/docs/budget-game-handoff`; the worktrees under `~/wt/`; `~/Documents/Reports/Website_Audits/` (the two 3 November audits and scorecards, `Design_Audit_2026-11-04.md`, `Decisions_Sitting_2026-11-08.md`, `Competitor_Plan_Review_2026-11-03.md`, `inspirations.csv`, `roadmap.csv`, `data_architecture.csv`, `project_audit.csv`, `social_channels.csv`, `design/`); `~/Documents/Reports/Traffic/LATEST.md` and `seo/`; the ideas register branch of the Reports repository; `~/estate-kit`; `~/clawd/briefings/uk-network-brand/`. WebSearch results of 9 November are from a US index and give who competes, not UK rank. No figure in this document is estimated; every count comes from a tool result or a cited file.
