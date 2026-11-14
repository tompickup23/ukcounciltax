/** Reader labels for the page types held by this site. */
export const PAGE_TYPE_LABELS = {
  council: "Council",
  budget: "Budget",
  parish: "Parish precepts",
  ranking: "Ranking",
  nation: "Nation",
  band: "Band",
  region: "Region",
  guide: "Guide",
  tool: "Tool",
  hub: "Overview",
  other: "Page",
} as const;
export type PageType = keyof typeof PAGE_TYPE_LABELS;

/** The label shown beside a search result, or null for none. */
export function pageTypeLabel(type: string | undefined): string | null {
  return type && Object.hasOwn(PAGE_TYPE_LABELS, type) ? PAGE_TYPE_LABELS[type as PageType] : null;
}

/** Classify the canonical path each page already passes to BaseLayout. */
export function pageTypeFor(path: string): PageType {
  if (/^\/(?:councils|scotland|wales)\/[^/]+\/$/.test(path)) return "council";
  if (/^\/tools\/budget\/[^/]+\/$/.test(path) || /^\/councils\/[^/]+\/budget-game\/$/.test(path)) return "budget";
  if (/^\/precepts\/parishes\/[^/]+\/$/.test(path)) return "parish";
  if (path.startsWith('/council-tax/ranked/')) return "ranking";
  if (/^\/council-tax\/band-[a-i]\/$/.test(path)) return "band";
  if (/^\/council-tax\/[^/]+\/$/.test(path)) return "region";
  if (["/scotland/", "/wales/"].includes(path)) return "nation";
  if (["/your-area/", "/compare/", "/tools/future-cost/"].includes(path)) return "tool";
  if (["/help/", "/methodology/", "/increases/", "/precepts/", "/changes/", "/coverage/"].includes(path) || /^\/council-tax-\d{4}-\d{2}\/$/.test(path)) return "guide";
  if (["/", "/councils/", "/council-tax/", "/findings/", "/sources/", "/data/", "/tools/", "/tools/budget/", "/precepts/parishes/"].includes(path)) return "hub";
  return "other";
}
