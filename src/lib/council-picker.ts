import { CURRENT_YEAR } from "./council-tax";
import { devolved, nationPath } from "./devolved";
import { councilPages, councilPath, slugify } from "./paths";
import { budgetFor } from "./budget";

/**
 * The rows behind the council picker (NV1, navigation brief of 11 November
 * 2026). One list of councils, many destinations: the picker on the councils
 * index sends a reader to the profile, the one on the budget hub to the game.
 * Nothing here computes a figure; a page that prints one passes its own.
 */

export type Destination = "profile" | "budget";

export interface PickerRow {
  gss: string;
  name: string;
  href: string;
  region: string;
  /** The council type as MHCLG's table names it, or the nation's word for a devolved council. */
  type: string;
  /** The shire county of a non-metropolitan district, so "Lancashire" finds its districts. */
  county: string | null;
  /** Every name the row answers to: its name, official name, county and region. */
  search: string;
  /** A council that sent no budget return sorts after every council that did. */
  noReturn: boolean;
}

export const destinationPath = (destination: Destination, slug: string): string =>
  destination === "budget" ? `/tools/budget/${slug}/` : `/councils/${slug}/`;

/** The 296 English billing authorities, A to Z by name, each with its link for the destination. */
export function englishRows(destination: Destination): PickerRow[] {
  return councilPages().map(({ council, tax }) => {
    const county = council.type === "Non-metropolitan district" ? council.county : null;
    return {
      gss: council.gss,
      name: tax.name,
      href: destination === "profile" ? councilPath(council) : destinationPath(destination, council.slug),
      region: tax.region,
      type: tax.class,
      county,
      search: [tax.name, council.officialName, county, tax.region].filter(Boolean).join(" "),
      noReturn: destination === "budget" && budgetFor(council.gss).council.status === "no return",
    };
  });
}

/**
 * Scottish and Welsh councils with a page this year, labelled by nation so a
 * reader never mistakes one system for another. Only the profile destination
 * has pages for them: the budget game covers England alone.
 */
export function devolvedRows(): PickerRow[] {
  return devolved.editions
    .filter((edition) => edition.year === CURRENT_YEAR)
    .flatMap((edition) =>
      edition.records.map((row) => ({
        gss: row.gss,
        name: row.name,
        href: nationPath(edition.nation, row.slug),
        region: edition.nation,
        type: edition.nation === "Scotland" ? "Scottish council" : "Welsh council",
        county: null,
        search: `${row.name} ${edition.nation}`,
        noReturn: false,
      })),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
}

/** The type chips: every type present in the rows, in a fixed reading order. */
export function pickerTypes(rows: PickerRow[]) {
  const order = ["Unitary authority", "Shire district", "Metropolitan district", "Inner London borough", "Outer London borough"];
  const present = new Set(rows.map((row) => row.type));
  return order.filter((type) => present.has(type)).map((type) => ({ label: type, value: slugify(type) }));
}
