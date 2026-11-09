# Decisions waiting | 10 November 2026

Prepared 9 November from the current B2, A3 and A4 briefs. These are decisions and account inputs, not permission to publish.

1. **B2, seats by party source.** Choose a pinned, dated and hashed Open Council Data composition table, accepting its third party provenance and CC BY-SA terms, or council published composition pages. The existing files do not meet the source rule. Seats and control remain held.
2. **B2, 46 election years derived from cycles.** Decide whether to authorise this explicitly labelled interpretation as an exception to the no derivation rule, or keep those years absent until a source prints the year. Current instruction keeps them held.
3. **B2, Surrey abolition line.** Decide whether a separately reviewed, sourced line for the 11 Surrey districts may be printed while the wider reorganisation field remains held. The draft cites the Surrey (Structural Changes) Order 2026 and 1 April 2027. The publication decision must recheck the order and effective wording; the current brief holds the line.
4. **B2, registry name refresh.** Authorise a source checked UK Places registry refresh for names including Birmingham, Barnsley and the Isles of Scilly. Keep the reorganisation hold separate. New B2 and C3 prose uses council tax table display names meanwhile.
5. **A4, Lewes.** Confirm the brief's choice to rank the published figure with MHCLG's pending approval note beside the row. If it is excluded, the complete class rule means no shire district ranking, rather than ranking the remaining councils as a complete class.
6. **UK Council Tax measurement.** Supply the site's own Cloudflare Web Analytics token through the normal secret/configuration route and confirm adding the beacon. Create or verify the Search Console property and enable inspection of the shared URLs and Google's selected canonicals. The token is not to be pasted into this note. Implementation and publication are separate steps.

7. **Inbound links from network sites.** UK Demographics' place pages and UK Elections' seat pages link to no tax site; AI DOGE links UK Councils only. The brand index records the tax sites as signed and those sites as network or standalone. Confirm that network sites may carry a contextual line linking a council's page on UK Council Tax and UK Councils (place and seat pages only, no footer change), and whether AI DOGE's existing cross link to UK Councils stands and may gain a UK Council Tax line. `PLAN-2026-11-10-REMAINING.md` section 1 has the counts.

**A3 has no unresolved decision assigned to the owner.** Its instalment labels, source link age rule, absent links, component omissions and one history design are already settled. C1b's fixed bases, county behaviour and no return exclusions are settled in its new brief. No analytics is part of C1b.

References: `/Users/tompickup/wt/ukc-front-door/docs/B2-FRONT-DOOR-BRIEF.md`, `/Users/tompickup/wt/uct-profile/docs/A3-PROFILE-BRIEF.md`, `/Users/tompickup/wt/uct-rankings/docs/A4-RANKINGS-PARISHES-SOURCE-NOTES.md`, and `ASSESSMENT-2026-11-09-TAX-SITES.md`.

8. **UK Councils reorganisation panel timing.** The LGR interactive plan of 9 November 2026 (Reports PR 626) puts a neutral, MHCLG sourced reorganisation panel on UK Councils "after the bill season split". Confirm instead building it as B4 straight after C3 (December), so it is live for the 1 April 2027 vesting dates and any open representation window; it carries no model figures, absorbs decision 3 (Surrey) and needs decision 4 (registry names) first. `PLAN-2026-11-10-REMAINING.md` section 6 has the reasoning. **Decided 9 November 2026: Tom, "Yes, after C3".** B4 follows C3 in lane B.

## Decided, 9 November 2026

Tom accepted all of the following in chat on 9 November 2026 ("Accept all"). They are decisions, not permission to publish; merges and deployments stay Tom's.

| # | Decision | Taken |
|---|---|---|
| 1 | Seats by party source | UK Elections' held composition first for the councils it covers; for the rest a pinned, dated, hashed Open Council Data snapshot with CC BY-SA attribution, checked against each council's own composition page for every council with a by-election or defection since its last full election plus a 10% random sample; a council that does not match is withheld. The B3 brief records whether showing counts from the table brings share alike obligations before anything is built. |
| 2 | 46 cycle years | Held. Blank with a note until a source prints the year. |
| 3 | Surrey line | Not printed separately; the B4 reorganisation panel carries it from its source notes. |
| 4 | Registry name refresh | Authorised, source checked from UK Places, with the reorganisation hold kept separate. |
| 5 | Lewes | Ranked, with MHCLG's pending approval note beside the row. |
| 6 | Measurement | Beacon and Search Console both, now. The CSP keeps the Cloudflare Insights host; the 3 November open decision in `CLAUDE.md` is resolved for the beacon. The token goes through the normal secret route, never into a note. |
| 7 | Inbound links | Yes for UK Demographics place pages (L2) and UK Elections council seat pages (L3), contextual lines only, no footer change. No for AI DOGE: L4 is dropped, keeping AI DOGE standalone. Removing AI DOGE from the tax sites' "more on this place" lists is to be considered as a follow up. |
| 8 | Reorganisation panel timing | B4 after C3 (recorded above). |
| K1 | How the site takes the kit | Vendor at a tag with a hash test. |
| K2 | Per chart CSV | No; the table twin is the data. |
| K3 | Embeds | Not now. |
| K4 | A3 as the DS3 template pilot | Yes for the build; UK Demographics stays the measured pilot. |
| K5 | Accent hue beside UK Food Hygiene | Decided with the mark (R560), not in A5; the lean is to move UK Food Hygiene's green rather than this site's. |
| G1 | Score share image | Static card per council plus a save or share PNG; no Pages Function. |
| G2 | Game H1 as a question | Yes; the title keeps the search phrase. |
| Follow ups | | A2's item 10 commit is not split; PR 32's screenshot links point at a commit; a route level change record for sitemap dates is a later lane A item; the estate moves from `n/a` to "Not published" when each site is next touched. |

