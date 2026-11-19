import { CURRENT_YEAR, NEXT_YEAR, NEXT_YEAR_PATH, increasesYearPath, yearLabel } from "./council-tax";
import { levelsDayRoutes } from "./levels-day";

export const SITE_NAME = "UK Council Tax";

/**
 * The site origin for absolute URLs, Open Graph, the sitemap and robots.txt.
 * Canonical links use the reviewed map in canonical.ts, falling back to this
 * origin for every page without a mapped counterpart.
 */
export const SITE_URL = "https://ukcounciltax.co.uk";

export const SITE_TAGLINE = "Your bill. Its history. Your next decision.";

/** Publish a contact address only after receipt has been confirmed. */
export const CONTACT_EMAIL: string | null = "info@ukcouncils.co.uk";
export const OFFICIAL_BAND_CHECK = "https://www.gov.uk/council-tax-bands";
export const OFFICIAL_COUNCIL_LOOKUP = "https://www.gov.uk/find-local-council";

export const DEFAULT_DESCRIPTION =
  "Sourced council tax bands, annual increases, local precepts and future-cost tools. England and Scotland band tables, plus Welsh Band D averages.";

/**
 * Cloudflare Web Analytics. The site token is public: it is printed in every
 * ordinary page. The C2 set pages opt out through BaseLayout. The beacon script loads from BEACON_SCRIPT and posts page loads to
 * BEACON_ENDPOINT, which is why the CSP allows the one in script-src and the
 * other in connect-src. scripts/check-dist.mjs fails a page that does not
 * carry exactly one beacon with this token, except C2 set pages which carry none.
 */
export const CF_BEACON_TOKEN = "11f6f11ed6cf428d9dd7e1d688f8a64b";
export const BEACON_SCRIPT = "https://static.cloudflareinsights.com/beacon.min.js";
export const BEACON_ENDPOINT = "https://cloudflareinsights.com";

/** The key the manual theme choice is stored under. public/theme-init.js reads the same key. */
export const THEME_STORAGE_KEY = "ukcounciltax-theme";

/**
 * Static routes that are indexable. Adding a hub page under src/pages means
 * adding it here in the same change, or it never reaches the sitemap or the
 * search index. tests/site.test.ts fails on a hub that is missing.
 * Programmatic pages (one per council, band or region) are listed by
 * src/lib/paths.ts from the data that builds them.
 */
export const STATIC_PATHS = [
  "/",
  "/your-area/",
  "/councils/",
  "/council-tax/",
  "/council-tax/ranked/",
  "/council-tax/towns/",
  NEXT_YEAR_PATH,
  ...levelsDayRoutes(),
  "/about/",
  "/methodology/",
  "/sources/",
  "/privacy/",
  "/compare/",
  "/contact/",
  "/corrections/",
  "/tools/",
  "/tools/future-cost/",
  "/tools/budget/",
  "/increases/",
  "/data/",
  "/help/",
  "/coverage/",
  "/precepts/",
  "/precepts/parishes/",
  "/findings/",
  "/changes/",
] as const;

export type NavItem = { href: string; label: string; desc: string };
export type NavGroup = { label: string; items: NavItem[] };

/** The hub section where a reader chooses a council to set its budget. src/pages/tools/budget/index.astro owns the id. */
export const SET_THE_BUDGET_HREF = "/tools/budget/#set-the-budget";

/**
 * The header at D8 option B (decided 19 November 2026): three plain links, then
 * one "More" menu holding NAV_GROUPS as three columns, then Search. At phone
 * width the header row carries "Your bill" and "Game" (named "Budget game")
 * and the drawer repeats the lot as flat lists.
 */
export const NAV_DIRECT: NavItem[] = [
  { href: "/your-area/", label: "Your bill", desc: "Find your council and bill by postcode" },
  { href: "/tools/budget/", label: "Budget game", desc: "Guess how a council splits its budget, then see the published answer" },
  { href: "/compare/", label: "Compare", desc: "Compare the same band and year within a council type" },
];

/** The "More" menu, in three columns. Everything else indexable is in FOOTER_COLUMNS. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Your bill",
    items: [
      { href: "/precepts/", label: "What makes up a bill", desc: "Council, county, police, fire and parish shares" },
      { href: "/precepts/parishes/", label: "Parish precepts", desc: "Every parish precept by council" },
      { href: "/help/", label: "Help with your bill", desc: "Bands, discounts and official next steps" },
      { href: "/tools/future-cost/", label: "Future cost", desc: "Model annual changes over time" },
      { href: NEXT_YEAR_PATH, label: `Council tax ${yearLabel(NEXT_YEAR)}`, desc: "Not yet set: when each nation's figures publish" },
    ],
  },
  {
    label: "Budgets",
    items: [
      { href: SET_THE_BUDGET_HREF, label: "Set a budget yourself", desc: "Move the levers, balance the books" },
      { href: "/tools/", label: "All tools", desc: "Bills, budgets and future costs" },
    ],
  },
  {
    label: "Compare and explore",
    items: [
      { href: "/council-tax/", label: "Council tax in England", desc: "The map, the average and every council" },
      { href: "/council-tax/ranked/", label: "Band D ranked", desc: "Against councils of the same type" },
      { href: increasesYearPath(CURRENT_YEAR), label: `Rises ${yearLabel(CURRENT_YEAR)}`, desc: "How much each council raised its own share" },
      { href: "/council-tax/towns/", label: "By parish and area", desc: "Full Band D for every parish and area" },
      { href: "/councils/", label: "Every council", desc: "All 296 councils in England, by region" },
      { href: "/scotland/", label: "Scotland", desc: "Published bands, water charges kept separate" },
      { href: "/wales/", label: "Wales", desc: "Band D averages and their components" },
    ],
  },
];

/** The two cards at the top of the phone drawer, after search. */
export const DRAWER_CARDS: NavItem[] = [
  { href: SET_THE_BUDGET_HREF, label: "Set a budget", desc: "Balance the books" },
  { href: "/compare/", label: "Compare", desc: "Two councils, same band" },
];

/**
 * The footer's four columns, on every page. Every route the header held before
 * W5 is in the header or here, and every static route is linked from one of them.
 */
export const FOOTER_COLUMNS: NavGroup[] = [
  {
    label: "Tools",
    items: [
      { href: "/tools/budget/", label: "Play the budget game", desc: "Guess how a council splits its budget" },
      { href: SET_THE_BUDGET_HREF, label: "Set a budget yourself", desc: "Move the levers, balance the books" },
      { href: "/compare/", label: "Compare two councils", desc: "The same band and year within a council type" },
      { href: "/tools/future-cost/", label: "Future cost", desc: "Model annual changes over time" },
      { href: "/tools/", label: "All tools", desc: "Explore bills, budgets and future costs" },
    ],
  },
  {
    label: "Your bill",
    items: [
      { href: "/your-area/", label: "Find your bill", desc: "Find your council by postcode" },
      { href: "/precepts/", label: "What makes up a bill", desc: "Postcode, parish and individual charging bodies" },
      { href: "/help/", label: "Help with your bill", desc: "Bands, discounts and official next steps" },
      { href: NEXT_YEAR_PATH, label: `Council tax ${yearLabel(NEXT_YEAR)}`, desc: "Not yet set: when each nation's figures publish" },
    ],
  },
  {
    label: "About the data",
    items: [
      { href: "/methodology/", label: "Methodology", desc: "How every figure is read" },
      { href: "/sources/", label: "Sources", desc: "Every table used, with dates" },
      { href: "/data/", label: "Official publications", desc: "Official publications and source editions" },
      { href: "/coverage/", label: "UK coverage", desc: "What is included in each nation" },
      { href: "/changes/", label: "What changed", desc: "Read the record of data updates" },
      { href: "/corrections/", label: "Corrections", desc: "How factual corrections are recorded" },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/about/", label: "About", desc: "What the site publishes and its rules" },
      { href: "/findings/", label: "Findings", desc: "Dated notes from the published tables" },
      { href: "/increases/", label: "Annual increases", desc: "Whole bills and council shares" },
      { href: "/contact/", label: "Contact", desc: "Questions about the site and official council services" },
      { href: "/privacy/", label: "Privacy", desc: "What happens to a postcode" },
    ],
  },
];

/**
 * Every destination the header and footer held before W5 (PR 108's main,
 * dcb7b7b), with year paths resolved. tests/site.test.ts and check-dist hold
 * each of them in the new header or footer, so the restyle drops no route.
 */
export const CHROME_ROUTES_BEFORE_W5: string[] = [
  "/your-area/", "/councils/", "/scotland/", "/wales/",
  "/council-tax/", "/council-tax/ranked/", "/compare/", "/council-tax/towns/", increasesYearPath(CURRENT_YEAR),
  "/precepts/", "/precepts/parishes/", "/help/", "/tools/future-cost/", NEXT_YEAR_PATH,
  "/tools/budget/",
  "/about/", "/methodology/", "/sources/", "/data/", "/coverage/", "/tools/", "/increases/",
  "/changes/", "/findings/", "/corrections/", "/contact/", "/privacy/",
];

/** Every distinct destination in the header, menus and drawer, the brand link included. */
export function headerHrefs(): string[] {
  return [...new Set(["/", ...NAV_DIRECT.map((i) => i.href), ...NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href)), ...DRAWER_CARDS.map((i) => i.href), "/councils/"])];
}

/** Every distinct destination in the footer's four columns. */
export function footerHrefs(): string[] {
  return [...new Set(FOOTER_COLUMNS.flatMap((g) => g.items.map((i) => i.href)))];
}

/** A path on this site as an absolute URL on the canonical origin. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * The document title. Every page carries the site name after a pipe, never a
 * hyphen or a dash; the home page is the site name alone.
 */
export function pageTitle(title?: string): string {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME;
}

/**
 * JSON-LD as the text of a script element. `<` is escaped so no string in the
 * data can close the element early.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
