# The split between UK Councils and UK Council Tax, and how the network feeds both | plan, 10 November 2026

Written in Claude Code at Tom's request. It sits above `DESIGN-ROUND-TWO-BRIEF.md` (the design items D1 to D6) and beside `PLAN-2026-11-10-REMAINING.md` (the running queue). It is a direction and sequencing plan, not a build brief: every feature named here still needs source notes and a dry run before it is briefed. Nothing here authorises a push, merge or deployment, and nothing here reopens a decision already taken unless it says so under "Decisions for Tom".

Checked on 9 and 10 November 2026: both live sites, origin/main of both repos (ukcounciltax `d18411f`, ukcouncils `7454e90`), the registry and link data in ukcouncils, and the guides and page folders of the sister repos on disk.

## 1. The position in one paragraph

UK Council Tax began as a copy of UK Councils, so the two sites answer one question with the same pages: 318 UK Council Tax pages are canonical to UK Councils, and both carry band pages, compare, increases, the 2027/28 page and now budgets. The lasting arrangement is to split by the visitor's question. UK Council Tax answers "what is my bill, why, and what can I do about it". UK Councils answers "who is my council, what does it do and is it in good shape", and is the front door to the sister sites. No page type exists on both. The sisters supply UK Councils with most of what a front door needs, by GSS code, and each referral sits in the section it relates to with one sourced figure.

## 2. Five rules

1. **One owner per page type.** The other site shows one card or one line and links.
2. **One owner per dataset on the page.** Both sites may pin the same file, but only the owner prints its tables.
3. **A referral carries a reason.** A sourced figure and what the reader will find, placed in the related section. No bare list of site names.
4. **Only where the link exists.** A line renders only when the registry holds a verified URL for that council. Unpublished or holding projects are never linked.
5. **New work goes to one site.** From today, nothing new is built on both.

## 3. Route ownership and the end state

| Page type | UK Council Tax today | UK Councils today | End state |
|---|---|---|---|
| Council page, 296 English | Canonical to UK Councils | Self canonical, tax first | Two different pages, each self canonical: the bill page on UK Council Tax, the council dossier on UK Councils with one Band D card |
| Band pages, region pages, `/council-tax/` | Canonical to UK Councils | Self canonical | UK Council Tax only; UK Councils routes 301 to their twins |
| Compare | Canonical to UK Councils | Self canonical | UK Council Tax only; 301 |
| Increases, 2027/28 | Self canonical | Own copies | UK Council Tax only; 301 |
| Rankings, parish precepts, bill tools, future cost, help | Self canonical | None | UK Council Tax only |
| Budget game and scenario | Self canonical | None | UK Council Tax only |
| Budget tables, per resident ratios, reserves | Under the game | Profile section (C3) | UK Councils owns the tables; the game page keeps what a round needs and links |
| Collection rates and arrears | Profile section | Profile section | UK Councils; one line on UK Council Tax |
| Band stock by band | Profile section | None | UK Council Tax |
| Exceptional Financial Support, reorganisation, elections, school holidays, service links, spending record | One line or none | Owned | UK Councils; one line on UK Council Tax on affected councils only |
| Scotland, Wales, Northern Ireland tax | Owned | None | UK Council Tax for tax; UK Councils gains council pages (section 6) |

The council page is the important row. The pair stops being a duplicate only when the content differs, so the UK Councils dossier (design item D1 and the features in section 6) must be live before the canonicals change. That makes D1 the gate for the reversal.

## 4. Where each sister project comes in

Coverage is the count of councils with a verified URL in `data/registry/councils.json` on ukcouncils.

| Sister | Coverage | On UK Councils | On UK Council Tax | Inbound, from the sister |
|---|---|---|---|---|
| AI DOGE | 234, of which 228 have a stored headline | In the budget section: the budget is the plan, AI DOGE is what the council published paying | One line after the game's spending reveal and on the receipt | None asked: AI DOGE is standalone (decision 7); its existing link to UK Councils stands |
| UK Elections | 146 | In "who runs it", with the verified next election year | In "who sets council tax" and on the 2027/28 page | L3, after results week: council questions to UK Councils, the bill line to UK Council Tax |
| UK Demographics | 316 | Beside population | Beside the per resident ratios and band stock | L2: one line each, split the same way |
| UK Places | Registry and service links source | Per address view of "who does what here" links out; see decision N3 | Footer only | To be scoped with N3 |
| UK School Holiday Dates | By education authority | In "what this council does" | Not linked from the profile | Not planned |
| UK Food Hygiene | 356 | In "what this council does"; it is linked from neither profile today | Not linked | Not planned |
| Asylum Stats | 361 | Removed in PR 32 | Still linked; see decision N2 | None |
| UK Public Contracts | Unpublished preview | Not linked until it is live | Not linked | None |
| ukgovernment.co.uk | Holding page | Not linked | Not linked | None |

Three faults to fix whatever else is decided: UK Food Hygiene is linked from neither profile although it is public tier B; UK Places is in one site's list and not the other's; Asylum Stats is on one site and was removed from the other.

**The front door.** `/your-area/` on UK Councils becomes the network's entry: one postcode gives the council, then one line per sister that has a page for it, each with its figure. This is L1 from the remaining plan, with the placement rule above applied to it.

**One link table.** The registry's sister URLs are produced once and pinned by both sites with a test that fails on drift. It rides the data repository already planned (assessment section 7).

## 5. UK Council Tax: direction and features

From an area average to the reader's own bill, and from looking up to deciding.

| # | Feature | Uses what exists | Needs first |
|---|---|---|---|
| T1 | Your bill by parish | 10,245 parish rows on 214 pages (A4) | A reviewed postcode to parish crosswalk (R348, Lancashire first) |
| T2 | The receipt: where each pound of Band D goes | RA lines and Table 10 components already pinned (I006) | Source notes on which lines may be joined |
| T3 | Balance the budget, built on the council tax decision | The game and scenario mode | The C2 exploration in the round five handover; Tom's decision |
| T4 | Am I in the right band | Band stock and neighbour data, `/help/` | The official challenge route checked and dated |
| T5 | Reducing the bill: discounts, support schemes, premiums | The planned A3 "discounts and how to pay" section | A published source with council level coverage; unchecked |
| T6 | History in real terms | The series since 1993/94 | A ruling that an inflation adjusted view is a labelled calculation under the scenario rule |
| T7 | Reorganisation and the bill | The UK Councils panel | Published harmonisation tables only |
| T8 | Levels day staged (C6) | Rankings, year switch | Nothing new |

## 6. UK Councils: direction and features

From a tax page with a profile under it to the place a reader goes for anything about a council.

| # | Feature | Uses what exists | Needs first |
|---|---|---|---|
| C1 | The dossier first screen and summary row | D1 in the design brief | PR 37 merged |
| C2 | Who runs it and when it votes (B3) | Next election year held; UK Elections links | Decision 1's composition source pinned |
| C3 | Financial health record (I046) | EFS statements, budget, reserves | Sources for section 114 notices and audit status; unchecked |
| C4 | Reorganisation tracker | Draft PR 37 | The registry refresh (decision 4); the stored Lancashire text predates the 29 October withdrawal and stays off the page |
| C5 | What this council does | School holidays, food hygiene link, two service links | A tier and function table from a primary source |
| C6 | Services directory | Two services held (pay council tax, bin day) via UK Places | A fresh import of the GOV.UK Local Links export for more services; decision N3 on where it lives |
| C7 | Every council, not only billing authorities | Registry of 361 bodies | A dry run of which bodies lack a page: county councils, combined authorities, Scottish, Welsh and Northern Irish councils |
| C8 | Sourced performance indicators | Position strip | One indicator at a time, each with source notes; no composite score |
| C9 | Contracts | None | UK Public Contracts live; then one line in the budget section |

## 7. Sequence

| Phase | When | What | Gate to leave it |
|---|---|---|---|
| 0. Measure and tidy | Now | Beacon and Search Console on UK Council Tax; the three link faults (N2 decides the Asylum Stats one) | Beacon live |
| 1. Front door | November to December 2026 | D1, D3, D4 and D2 on UK Councils; contextual referrals and the `/your-area/` strip (L1); L2 and L3 inbound; nothing new duplicated | Burnley and Birmingham dossiers pass the design check |
| 2. One site each | December 2026 to February 2027 | UK Council Tax: A3 and its follow up, T2, T4, T8, then T1 for Lancashire. UK Councils: C2, C4, C5, then C3 and C7. Shared link table with the data repository | Each feature merged with source notes |
| 3. Bill season | March to April 2027 | Freeze from 20 March; levels day; no structural change on either site | Bills landed, first measured season recorded |
| 4. The reversal | Proposed May to June 2027 | One change across both repos: UK Councils tax routes 301 to UK Council Tax; council pages on both become self canonical; UK Councils titles and H1s lead with the council; UK Council Tax profiles drop what UK Councils owns | Search Console inspection of ten shared URLs before and after |
| 5. Breadth | From summer 2027 | C6, C8, C9, T1 nationally, T5, T6 | One at a time |

Phase 4 never has a period where both sites are self canonical on duplicate content, which is the rule the assessment already set.

## 8. Decisions, all taken by Tom on 10 November 2026

Tom accepted every recommendation ("Accept all", in chat). None of them authorises a push, merge or deployment.

- **N1. The end state in section 3: confirmed.** The tax page types leave UK Councils by 301 at the reversal, and the council page becomes two different pages, each self canonical. This refines "option A after the bill season" from the 8 November sitting; it does not change its direction.
- **N2. Asylum Stats: remove** the link from UK Council Tax profiles, to match UK Councils. It has no bearing on a bill.
- **N3. Services directory:** per council on UK Councils and per address on UK Places, each linking to the other.
- **N4. Budgets:** UK Councils owns the budget tables; the game page slims to what the rounds need, after the bill season.
- **N5. The reversal date:** May to June 2027, before the RA budget release, with phase 1 complete as its gate and Search Console evidence before and after.
- **S2** (from the design brief): UK Councils leads with the council only at the reversal, in the same change as the canonicals and redirects.
- **S3** (from the design brief): the game opens on a round rail, not the published answer.

## 9. Risks

- The reversal moves the only measured rankings either site has. The gate, the single change and the quiet season are the mitigation; Search Console evidence decides whether to proceed.
- Features in sections 5 and 6 marked "unchecked" may have no source with full coverage. Each is dropped, not approximated, if its source notes fail.
- Two Codex lanes are running. Nothing in phase 1 on UK Council Tax touches profiles, ranking pages or `global.css` until A3 merges.
- AI DOGE's tier forbids return links; the plan asks none.
