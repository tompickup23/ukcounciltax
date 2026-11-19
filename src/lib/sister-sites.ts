/**
 * The one link table for sister sites in the footer (W5, decisions D7 and D8 of
 * 19 November 2026). The footer renders this list and nothing else, in this
 * order: UK Councils first as a card, then the rest. tests/sister-sites.test.ts
 * pins it against the Estate Kit's site registry and the council registry, and
 * scripts/check-dist.mjs checks that every built footer carries exactly these links.
 *
 * Only destinations verified live belong here. Each entry records the day its
 * home page was last checked and returned 200. A site that stops answering is
 * removed, not left in with an old date.
 *
 * Home pages only: council deep links to UK Food Hygiene wait on D7's per-slug
 * coverage check, so registry.ts still drops them.
 */
export interface SisterSiteLink {
  /** Key in the Estate Kit token registry, or null for a site the kit does not list. */
  key: string;
  name: string;
  url: string;
  /** One line, no figures. */
  blurb: string;
  /** ISO date the home page returned 200. */
  checked: string;
}

export const SISTER_SITE_LINKS: readonly SisterSiteLink[] = [
  { key: "ukcouncils", name: "UK Councils", url: "https://ukcouncils.co.uk/", blurb: "The wider picture of your local council: its finances, services and elections", checked: "2026-11-19" },
  { key: "ukplaces", name: "UK Places", url: "https://ukplaces.co.uk/", blurb: "Explore places and their local context", checked: "2026-11-19" },
  { key: "ukelections", name: "UK Elections", url: "https://ukelections.co.uk/", blurb: "Results and seats for every council", checked: "2026-11-19" },
  { key: "ukdemographics", name: "UK Demographics", url: "https://ukdemographics.co.uk/", blurb: "Population and census for every place", checked: "2026-11-19" },
  { key: "ukfoodhygiene", name: "UK Food Hygiene", url: "https://ukfoodhygiene.co.uk/", blurb: "Food hygiene ratings from the FSA register", checked: "2026-11-19" },
  { key: "ukschoolholidaydates", name: "UK School Holiday Dates", url: "https://ukschoolholidaydates.co.uk/", blurb: "Term dates for every education authority", checked: "2026-11-19" },
  { key: "aidoge", name: "AI DOGE", url: "https://aidoge.co.uk/", blurb: "What public bodies publish about their spending", checked: "2026-11-19" },
];
