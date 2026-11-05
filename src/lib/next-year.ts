import { NEXT_YEAR, startYear, yearLabel } from "./council-tax";

/**
 * What official pages said about the year after CURRENT_YEAR, each fetched
 * once on the access date below. Titles and dates are copied as the pages
 * print them; nothing here is projected or estimated. When CURRENT_YEAR
 * moves on, tests/years.test.ts fails until every record is refetched for
 * the new NEXT_YEAR, so a stale announcement cannot carry forward.
 */

export const NEXT_YEAR_ACCESSED = "2026-11-05";

export interface Statute {
  title: string;
  url: string;
  section: string;
  text: string;
  accessed: string;
}

/** Local Government Finance Act 1992, section 30(6), as legislation.gov.uk prints it. */
export const SETTING_DEADLINE: Statute = {
  title: "Local Government Finance Act 1992",
  url: "https://www.legislation.gov.uk/ukpga/1992/14/section/30",
  section: "section 30(6)",
  text: "Any amount must be set before 11th March in the financial year preceding that for which it is set, but is not invalid merely because it is set on or after that date.",
  accessed: NEXT_YEAR_ACCESSED,
};

/**
 * The deadline in words, derived from the year: amounts for a year are set
 * before 11 March in the financial year before it, which for NEXT_YEAR falls
 * in the calendar year NEXT_YEAR starts in.
 */
export function settingDeadline(year: string = NEXT_YEAR): string {
  return `must be set before 11 March ${startYear(year)}`;
}

export interface Release {
  nation: "England" | "Scotland" | "Wales";
  publisher: string;
  /** The page fetched, or null when no official page stating a date was read. */
  page: { title: string; url: string; accessed: string } | null;
  /** The publication, by the title the publisher gives it. */
  publication: string | null;
  /** The release date as the page states it, or null when none was found. */
  stated: string | null;
  /** Further words from the page, such as the date the announcement was published. */
  detail: string | null;
  /** A file the date was read from, with its checksum, when the page links one. */
  file: { title: string; sha256: string } | null;
}

export const RELEASES: Release[] = [
  {
    nation: "England",
    publisher: "Ministry of Housing, Communities and Local Government",
    page: {
      title: "Council Tax levels set by local authorities in England 2027 to 2028",
      url: "https://www.gov.uk/government/statistics/announcements/council-tax-levels-set-by-local-authorities-in-england-2027-to-2028",
      accessed: NEXT_YEAR_ACCESSED,
    },
    publication: "Council Tax levels set by local authorities in England 2027 to 2028",
    stated: "March 2027 (provisional)",
    detail: "Accredited official statistics announcement, published 31 March 2026.",
    file: null,
  },
  {
    nation: "Scotland",
    publisher: "Scottish Government",
    page: {
      title: "Official statistics: forthcoming publications",
      url: "https://www.gov.scot/publications/official-statistics-forthcoming-publications/",
      accessed: NEXT_YEAR_ACCESSED,
    },
    publication: "Council Tax Assumptions, 2027-28",
    stated: "Mar-27",
    detail: "The forthcoming publications workbook lists the month only, with no day or time.",
    file: {
      title: "Report Forthcoming Publications 2026-27.xlsx",
      sha256: "67450eb8061776b9aff71cb00efd45144638679366b481649532bca7f97641e2",
    },
  },
  {
    nation: "Wales",
    publisher: "Welsh Government",
    page: null,
    publication: null,
    stated: null,
    detail: null,
    file: null,
  },
];

/** The release-date sentence for one nation, or "not yet announced". */
export function releaseSentence(release: Release): string {
  if (!release.stated || !release.page) {
    return `Release date for ${yearLabel(NEXT_YEAR)} figures: not yet announced on any ${release.publisher} page this site has read.`;
  }
  return `Release date as the ${release.publisher} states it: ${release.stated}.`;
}
