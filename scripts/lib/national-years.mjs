/**
 * Year handling for scripts/import-national.mjs (C6), kept apart from the
 * network and the workbooks so tests/levels-import.test.ts can check it.
 */

/** A year label in MHCLG's words: the start year, "to", the end year. */
export function yearWordsOf(year) {
  if (!/^\d{4}-\d{2}$/.test(year)) throw new Error(`Not a year label: ${year}`);
  return year.replace(/^(\d{4})-(\d{2})$/, (_m, a, b) => `${a} to 20${b}`);
}

/** The year a parish return covers, from its title: "...: 2026 to 2027" names 2026 to 2027. */
export function parishYearOfTitle(title) {
  const match = /(\d{4}) to (\d{4})\s*$/.exec(title ?? "");
  if (!match || Number(match[2]) !== Number(match[1]) + 1) throw new Error(`Parish source title names no year: ${title}`);
  return `${match[1]}-${match[2].slice(2)}`;
}

/** The last year a Band D history file runs to, from the file name the source record pins. */
export function vintageOfFile(file) {
  const match = /(\d{4}-\d{2})\.ods$/.exec(file ?? "");
  if (!match) throw new Error(`History file names no year: ${file}`);
  return match[1];
}

/**
 * The one Table 10 spreadsheet on a year's statistics page, found by its title.
 * MHCLG titled it "Council Tax levels set by local authorities in England 2026
 * to 2027: Table 10 Local Authority Level Data"; anything after "Table 10" may
 * change. None, or more than one, stops the import.
 */
export function table10Attachment(attachments, year) {
  const prefix = `Council Tax levels set by local authorities in England ${yearWordsOf(year)}: Table 10`;
  const hits = attachments.filter((a) => (a.title ?? "").startsWith(prefix) && /\.ods$/i.test(a.url ?? ""));
  if (hits.length !== 1) throw new Error(`${year}: expected one .ods attachment titled "${prefix}...", found ${hits.length}`);
  return hits[0];
}

/** The source record for a staged Table 10, in the shape sources.json uses. */
export function stagedTable10Source({ attachment, year, pageUrl, file, sha256, retrieved }) {
  if (!/^[0-9a-f]{64}$/.test(sha256)) throw new Error(`${year}: not a SHA-256: ${sha256}`);
  return {
    publisher: "Ministry of Housing, Communities and Local Government",
    // The title as sources.json writes the launch edition's: the page's words, then "Table 10".
    title: `Council tax levels set by local authorities in England ${yearWordsOf(year)}: Table 10`,
    attachmentTitle: attachment.title,
    url: pageUrl,
    fileUrl: attachment.url,
    file,
    sha256,
    retrieved,
    tables: ["Data_Billing", "Precepting_Bodies", "Notes"],
    precision: "Published Band D area averages to pennies",
    licence: "Open Government Licence v3.0",
  };
}
