import { NEXT_YEAR, startYear, yearLabel, yearWords } from "./council-tax";

/**
 * What official pages said about the year after CURRENT_YEAR, each fetched
 * once on its set's access date. Titles and dates are copied as the pages
 * print them; nothing here is projected or estimated. The records are held
 * per year, keyed by the year in words, so when the year switch moves
 * NEXT_YEAR on (src/lib/edition.mjs) the page reads the next set with no code
 * change. Each set is refetched the week before the release that brings it
 * into use (docs/D5-BUDGET-SEASON-2027.md, section 5); tests/years.test.ts
 * checks the set in use names NEXT_YEAR.
 */

/** The statute was read on this day; it does not change with the year. */
const STATUTE_ACCESSED = "2026-11-05";

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
  accessed: STATUTE_ACCESSED,
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

interface ReleaseSet {
  /** The day every record in the set was read. */
  accessed: string;
  releases: Release[];
}

export const RELEASE_SETS: Record<string, ReleaseSet> = {
  "2027 to 2028": {
    accessed: "2026-11-05",
    releases: [
      {
        nation: "England",
        publisher: "Ministry of Housing, Communities and Local Government",
        page: {
          title: "Council Tax levels set by local authorities in England 2027 to 2028",
          url: "https://www.gov.uk/government/statistics/announcements/council-tax-levels-set-by-local-authorities-in-england-2027-to-2028",
          accessed: "2026-11-05",
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
          accessed: "2026-11-05",
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
    ],
  },
  // Staged by C6 on 15 November 2026 and in use once the 2027 to 2028 levels land.
  // Refetch every record the week before that release.
  "2028 to 2029": {
    accessed: "2026-11-15",
    releases: [
      {
        nation: "England",
        publisher: "Ministry of Housing, Communities and Local Government",
        page: null,
        publication: null,
        stated: null,
        detail: "On 15 November 2026 GOV.UK had no statistics announcement for council tax levels for 2028 to 2029.",
        file: null,
      },
      {
        nation: "Scotland",
        publisher: "Scottish Government",
        page: null,
        publication: null,
        stated: null,
        detail: "On 15 November 2026 the Scottish Government's forthcoming publications workbook (Forthcoming Publications 2026-27.xlsx, SHA-256 2a3ccd77d4e05161450bb451acd3e0efdd57cb4f07b3452d7397d7e7426ec87a) listed no council tax figures for 2028 to 2029.",
        file: null,
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
    ],
  },
};

function releaseSet(): ReleaseSet {
  const set = RELEASE_SETS[yearWords(NEXT_YEAR)];
  if (!set) throw new Error(`No release records for ${NEXT_YEAR}: add them to RELEASE_SETS the week before the levels release`);
  return set;
}

/** The day the records in use were read. */
export const NEXT_YEAR_ACCESSED = releaseSet().accessed;
export const RELEASES: Release[] = releaseSet().releases;

/** Expand a publisher's abbreviated month while retaining its original text. */
export function statedReleaseDate(stated: string, publisher: string): string {
  const months: Record<string, string> = {Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June", Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December"};
  const match = /^([A-Z][a-z]{2})-(\d{2})$/.exec(stated);
  const attribution = publisher === "Ministry of Housing, Communities and Local Government" ? "on GOV.UK" : `by the ${publisher}`;
  return match && months[match[1]] ? `${months[match[1]]} 20${match[2]} (stated ${attribution} as “${stated}”)` : `“${stated}”`;
}

/** The release-date sentence for one nation, or "not yet announced". */
export function releaseSentence(release: Release): string {
  if (!release.stated || !release.page) {
    return `Release date for ${yearLabel(NEXT_YEAR)} figures: not yet announced on any ${release.publisher} page this site has read.`;
  }
  return `Release date as the ${release.publisher} states it: ${statedReleaseDate(release.stated, release.publisher)}.`;
}
