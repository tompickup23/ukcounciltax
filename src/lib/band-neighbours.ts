import { BANDS, type Band } from "./council-tax";
import { devolved, type Edition } from "./devolved";

/**
 * The published charge one band lower and one band higher than a page's band,
 * for the same council and the same year, read from the same published row.
 *
 * Nothing here works a figure out. The statutory proportions are printed as
 * an explanation only; a neighbouring figure that the row does not hold is
 * left out, never derived from another band and never shown as zero.
 */

export type Position = "lower" | "higher";

export interface NeighbourLine {
  position: Position;
  band: Band;
  /** The published figure, exactly as the row holds it. */
  value: number;
}

/** The bands either side of a band in A to H order: Band A has no lower, Band H no higher. */
export function neighbourBands(band: Band): { lower: Band | null; higher: Band | null } {
  const index = BANDS.indexOf(band);
  if (index < 0) throw new Error(`Unknown band ${band}`);
  return {
    lower: index > 0 ? BANDS[index - 1] : null,
    higher: index < BANDS.length - 1 ? BANDS[index + 1] : null,
  };
}

const published = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/**
 * The lines for one published row. A row is a record of published figures by
 * band letter, as MHCLG Table 9 or a devolved table holds them. A neighbour
 * band missing from the row gives no line: unknown is not zero.
 */
export function neighbourLines(row: Partial<Record<string, number | null>>, band: Band): NeighbourLine[] {
  const { lower, higher } = neighbourBands(band);
  const lines: NeighbourLine[] = [];
  if (lower && published(row[lower])) lines.push({ position: "lower", band: lower, value: row[lower] as number });
  if (higher && published(row[higher])) lines.push({ position: "higher", band: higher, value: row[higher] as number });
  return lines;
}

/**
 * The devolved edition for a nation and year that holds a published figure for
 * every band A to H, or undefined. The Welsh table held here gives an average Band D only, so it has none.
 */
export function fullBandEdition(nation: string, year: string): Edition | undefined {
  return devolved.editions.find(
    (edition) =>
      edition.nation === nation &&
      edition.year === year &&
      edition.records.length > 0 &&
      edition.records.every((record) => BANDS.every((band) => published(record.bandsPence[band]))),
  );
}

/** Neutral wording for a line's label. */
export function positionLabel(position: Position, band: Band): string {
  return position === "lower" ? `Band ${band}, one band lower` : `Band ${band}, one band higher`;
}

/**
 * The statutory proportions, as section 5(1) states them, for the explanation
 * block. Fetched once from legislation.gov.uk on the access date below; the
 * page file's hash is kept so the reading can be checked. Explanation only:
 * no figure on the site is calculated from these.
 */
export const BAND_PROPORTIONS = {
  title: "Local Government Finance Act 1992, section 5",
  subsection: "5(1)",
  publisher: "legislation.gov.uk",
  url: "https://www.legislation.gov.uk/ukpga/1992/14/section/5",
  accessed: "2026-11-05",
  sha256: "880704bffefda6a57df799f5dfa696890d7b3b46bcb10ecc496e3e7536628374",
  extent: "England and Wales",
  ninths: { A: 6, B: 7, C: 8, D: 9, E: 11, F: 13, G: 15, H: 18 } as Record<Band, number>,
} as const;

/** The date the band page lines and explanation were last reviewed. */
export const LAST_REVIEWED = "2026-11-05";

/** "6/9" style text of a band's proportion of Band D, for the explanation. */
export function proportionText(band: Band): string {
  return `${BAND_PROPORTIONS.ninths[band]}/9`;
}
