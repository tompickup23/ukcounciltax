import { CURRENT_YEAR, NEXT_YEAR, NEXT_YEAR_PATH, increasesYearPath, yearLabel } from "./council-tax";

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
 * page. The beacon script loads from BEACON_SCRIPT and posts page loads to
 * BEACON_ENDPOINT, which is why the CSP allows the one in script-src and the
 * other in connect-src. scripts/check-dist.mjs fails a page that does not
 * carry exactly one beacon with this token.
 */
export const CF_BEACON_TOKEN = "";
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
  NEXT_YEAR_PATH,
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

/**
 * The header menu: three groups and one direct link. Everything else that is
 * indexable is in FOOTER_LINKS, so no page is reachable only by link.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Find your council",
    items: [
      { href: "/your-area/", label: "Your area", desc: "Find your council by postcode" },
      { href: "/councils/", label: "Every council", desc: "All 296 councils in England, by region" },
      { href: "/scotland/", label: "Scotland", desc: "Published bands, with water charges kept separate" },
      { href: "/wales/", label: "Wales", desc: "Published Band D averages and their components" },
    ],
  },
  {
    label: "Compare and rank",
    items: [
      { href: "/council-tax/", label: "Council tax in England", desc: "The England average and every council" },
      { href: "/council-tax/ranked/", label: "Band D ranked", desc: "Every council against councils of the same type" },
      { href: "/compare/", label: "Compare councils", desc: "Compare the same band and year within a council type" },
      { href: "/council-tax/band-d/", label: "Band D", desc: "Band D for every council, by region" },
      { href: increasesYearPath(CURRENT_YEAR), label: `Rises ${yearLabel(CURRENT_YEAR)}`, desc: "How much each council raised its own share" },
    ],
  },
  {
    label: "Your bill",
    items: [
      { href: "/precepts/", label: "What makes up a bill", desc: "Postcode, parish and individual charging bodies" },
      { href: "/precepts/parishes/", label: "Parish precepts", desc: "Every parish precept by council" },
      { href: "/help/", label: "Help with your bill", desc: "Bands, discounts and official next steps" },
      { href: "/tools/future-cost/", label: "Future cost", desc: "Model annual changes over time" },
      { href: NEXT_YEAR_PATH, label: `Council tax ${yearLabel(NEXT_YEAR)}`, desc: "Not yet set: when each nation's figures publish" },
    ],
  },
];

/** The one header link with no menu: the budget game hub. */
export const NAV_DIRECT: NavItem = {
  href: "/tools/budget/",
  label: "Budget game",
  desc: "Guess how a council splits its budget, then see the published answer",
};

/** Reference and site pages, linked from the footer of every page. */
export const FOOTER_LINKS: NavItem[] = [
  { href: "/about/", label: "About", desc: "What the site publishes and its rules" },
  { href: "/methodology/", label: "Methodology", desc: "How every figure is read" },
  { href: "/sources/", label: "Sources", desc: "Every table used, with dates" },
  { href: "/data/", label: "Official publications", desc: "Official publications and source editions" },
  { href: "/coverage/", label: "UK coverage", desc: "What is included in each nation" },
  { href: "/tools/", label: "All tools", desc: "Explore bills, budgets and future costs" },
  { href: "/increases/", label: "Annual increases", desc: "Whole bills and council shares" },
  { href: "/changes/", label: "What changed", desc: "Read the record of data updates" },
  { href: "/findings/", label: "Findings", desc: "Dated notes from the published tables" },
  { href: "/corrections/", label: "Corrections", desc: "How factual corrections are recorded" },
  { href: "/contact/", label: "Contact", desc: "Questions about the site and official council services" },
  { href: "/privacy/", label: "Privacy", desc: "What happens to a postcode" },
];

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
