/**
 * The MHCLG levels workbook parser behind scripts/fetch-council-tax.mjs, kept
 * apart from the network so tests can feed it sheets (C6). Tables are found by
 * their titles and columns by their headers, never by number.
 *
 * It refuses, by throwing, rather than writing a partial year, on:
 *   1. any authority row missing a band, or a band cell left blank;
 *   2. a short row: an authority row that stops before its last band, or an own
 *      table row with no Band D or change cell (a marked [x] is unknown, kept
 *      as null; a missing cell is a broken table);
 *   3. an authority in the band table with no own figures row;
 *   4. for an incoming year, any authority or county in the year before that is
 *      missing, or any new one, unless a reviewed succession record lists it
 *      with two sources (checkSuccession): ONS codes are reissued on boundary
 *      changes, as Barnsley's and Sheffield's were between 2024 to 2025 and
 *      2025 to 2026, and the site never joins figures across a reissue;
 *   5. for a year already held, any change to its set of authorities or
 *      counties (checkSameSet);
 *   6. a note reference the workbook does not define.
 * Unknown is never zero: a marked figure is null in the output.
 */
import { figure, sheetByTitle, table } from "./ods.mjs";

export const BANDS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const REGIONS = {
  L: "London",
  NE: "North East",
  NW: "North West",
  YH: "Yorkshire and the Humber",
  EM: "East Midlands",
  WM: "West Midlands",
  E: "East of England",
  EE: "East of England",
  SE: "South East",
  SW: "South West",
};

const CLASSES = {
  ILB: "Inner London borough",
  OLB: "Outer London borough",
  LB: "London borough",
  MD: "Metropolitan district",
  UA: "Unitary authority",
  SD: "Shire district",
  SC: "Shire county",
};

/**
 * Published text normalised to house style. MHCLG writes year ranges with an
 * en dash in some notes; the site prints none, and the meaning is carried by
 * "to". Nothing else in the text is changed.
 */
export function houseText(text) {
  return text.replace(/\s*[\u2013\u2014]\s*/g, " to ").replace(/\s+/g, " ").trim();
}

/** Note id to text, from every Notes sheet in the files for a year. */
export function notesFrom(sheets) {
  const notes = new Map();
  for (const sheet of sheets.filter((s) => /^Notes$/i.test(s.name))) {
    let t;
    try {
      t = table(sheet, ["Note"]);
    } catch {
      continue;
    }
    const textColumn = t.header.findIndex((h) => /^Note Text$/i.test(h) || /^Text$/i.test(h));
    if (textColumn === -1) continue;
    for (const row of t.rows) {
      const id = (row[0] ?? "").trim();
      if (id && row[textColumn]) notes.set(id.toLowerCase(), houseText(row[textColumn]));
    }
  }
  return notes;
}

/** The note ids a Notes cell refers to, "[note r] [note s]" to ["[note r]", "[note s]"]. */
export function noteRefs(cell) {
  return [...(cell ?? "").matchAll(/\[note [a-z]+\]/gi)].map((m) => m[0].toLowerCase());
}

export function resolveNotes(refs, notes, where) {
  return refs.map((ref) => {
    const text = notes.get(ref);
    if (!text) throw new Error(`${where}: refers to ${ref}, which the workbook does not define`);
    return { id: ref.replace(/^\[note |\]$/g, ""), text };
  });
}

export function bandTable(sheets, notes, year) {
  const sheet = sheetByTitle(
    sheets,
    /^Table \d+: Area council tax for a dwelling occupied by (two|2) adults by band/,
    "the band table",
  );
  const t = table(sheet, ["ONS Code", "Band D"]);
  const col = {
    ecode: t.column(/^E Code$/),
    ons: t.column(/^ONS Code$/),
    name: t.column(/^Authority$/),
    region: t.column(/^Region$/),
    klass: t.column(/^Class$/),
    area: t.column(/^Area$/),
    notes: t.header.findIndex((h) => /^Notes$/.test(h)),
  };
  const bandCols = Object.fromEntries(BANDS.map((b) => [b, t.column(new RegExp(`^Band ${b}$`))]));
  const lastBand = Math.max(...Object.values(bandCols));
  const titleNotes = resolveNotes(noteRefs(sheet.rows[0][0]), notes, `${year} band table title`);

  const authorities = {};
  const missing = [];
  for (const row of t.rows) {
    const ons = (row[col.ons] ?? "").trim();
    if (!/^E0[6-9]\d{6}$/.test(ons)) continue;
    const where = `${year} band table ${ons}`;
    // A short row (cells missing, not marked [x]) is a truncated table, not an unknown figure.
    if (row.length <= lastBand) throw new Error(`${where}: short row, ${row.length} cells where the bands run to column ${lastBand + 1}`);
    const bands = {};
    for (const band of BANDS) bands[band] = figure(row[bandCols[band]], `${where} Band ${band}`);
    const absent = BANDS.filter((b) => bands[b] === null);
    if (absent.length) missing.push(`${ons} ${row[col.name]} lacks band ${absent.join(", ")}`);
    if (authorities[ons]) throw new Error(`${where}: listed twice`);
    authorities[ons] = {
      ecode: row[col.ecode],
      name: houseText(row[col.name]),
      regionCode: row[col.region],
      region: REGIONS[row[col.region]] ?? null,
      classCode: row[col.klass],
      class: CLASSES[row[col.klass]] ?? null,
      // Unitaries have no county area; MHCLG marks the cell [z].
      area: /^\[[a-z]+\]$/i.test((row[col.area] ?? "").trim()) ? null : houseText(row[col.area]),
      bands,
      notes: col.notes >= 0 ? resolveNotes(noteRefs(row[col.notes]), notes, where) : [],
    };
    if (!authorities[ons].region) throw new Error(`${where}: unknown region code ${row[col.region]}`);
    if (!authorities[ons].class) throw new Error(`${where}: unknown class code ${row[col.klass]}`);
  }
  if (missing.length) {
    throw new Error(`${year}: refusing to write, rows missing a band:\n  ${missing.join("\n  ")}`);
  }
  return { sheet: sheet.name, title: houseText(sheet.rows[0][0].replace(/\s*\[note [a-z]+\]/gi, "")), titleNotes, authorities };
}

/**
 * The authority's own Band D and its published change, from the three "own"
 * tables. Column headers differ between the three and between years, so each
 * is found by what it says. A column a table does not have is null.
 */
export function ownTables(sheets, notes, year) {
  const specs = [
    { key: "unitary", title: /Council tax \(average Band D\).*London boroughs, metropolitan districts and unitary authorities/i },
    { key: "county", title: /Council tax \(average Band D\).*shire counties/i },
    { key: "district", title: /Council tax \(average Band D\).*shire districts/i },
  ];
  const out = {};
  const tables = {};
  for (const spec of specs) {
    const sheet = sheetByTitle(sheets, new RegExp(`^Table \\d+[a-z]?: .*${spec.title.source}`, "i"), spec.key);
    const t = table(sheet, ["ONS Code", "Authority"]);
    // A column is found by a pattern or, where one test is not enough, a predicate.
    const find = (test) => t.header.findIndex((h) => (typeof test === "function" ? test(h) : test.test(h)));
    const need = (pattern, label) => {
      const i = find(pattern);
      if (i === -1) throw new Error(`${year} ${sheet.name}: no column for ${label}`);
      return i;
    };
    const exclParish = /excluding parish precepts|including adult social care precept \(Band D\)/i;
    const col = {
      ons: t.column(/^ONS Code$/),
      name: t.column(/^Authority$/),
      bandD: need(
        (h) => /^Average council tax for the authority/i.test(h) && exclParish.test(h) && /£$/.test(h.trim()) && !/change/i.test(h),
        "own Band D",
      ),
      changePct: need(
        (h) => /percent|% change/i.test(h) && exclParish.test(h) && !/adult social care element/i.test(h),
        "own change in percent",
      ),
      changePounds: find((h) => /£ change on/i.test(h) && /excluding parish precepts/i.test(h)),
      bandDWithParish: find((h) => /^Average council tax for the authority including (adult social care and )?parish precepts/i.test(h) && /£$/.test(h.trim())),
      ascBandD: find((h) => /^Adult social care element/i.test(h)),
      ascChangePct: find((h) => /^Percentage change of adult social care element/i.test(h)),
      notes: find((h) => /^Notes$/.test(h)),
    };
    tables[spec.key] = sheet.name;
    for (const row of t.rows) {
      const ons = (row[col.ons] ?? "").trim();
      if (!/^E\d{8}$/.test(ons)) continue;
      const where = `${year} ${sheet.name} ${ons}`;
      // Band D and the change must be present as a figure or a marked code; a blank or missing cell stops the import.
      for (const [i, label] of [[col.bandD, "Band D"], [col.changePct, "change"]]) {
        if ((row[i] ?? "").trim() === "") throw new Error(`${where}: short row, no ${label} cell`);
      }
      const get = (i, label) => (i >= 0 ? figure(row[i], `${where} ${label}`) : null);
      out[ons] = {
        table: sheet.name,
        name: houseText(row[col.name]),
        bandD: get(col.bandD, "Band D"),
        changePct: get(col.changePct, "change"),
        changePounds: get(col.changePounds, "change in pounds"),
        bandDWithParish: get(col.bandDWithParish, "Band D with parish"),
        ascBandD: get(col.ascBandD, "adult social care"),
        ascChangePct: get(col.ascChangePct, "adult social care change"),
        notes: col.notes >= 0 ? resolveNotes(noteRefs(row[col.notes]), notes, where) : [],
      };
    }
  }
  return { tables, own: out };
}

/** England level figures, where the workbook carries the summary tables. */
export function englandTables(sheets, year) {
  const has = (pattern) => sheets.some((s) => pattern.test(s.rows[0]?.[0] ?? ""));
  const result = {};

  const areaPattern = /^Table \d+: Average area Band D council tax and the annual percentage change by area of authority/;
  if (has(areaPattern)) {
    const sheet = sheetByTitle(sheets, areaPattern);
    const t = table(sheet, ["Year", "England £"]);
    const label = (row) => houseText(row[0].replace(/\s*\[[^\]]+\]/g, ""));
    const wanted = year.replace(/^(\d{4})-(\d{2})$/, (_m, a, b) => `${a} to 20${b}`);
    const row = t.rows.find((r) => label(r) === wanted);
    if (!row) throw new Error(`${year} ${sheet.name}: no row for ${wanted}`);
    const pair = (name) => ({
      pounds: figure(row[t.column(new RegExp(`^${name} £$`))], `${sheet.name} ${name}`),
      changePct: figure(row[t.column(new RegExp(`^${name} change %$`))], `${sheet.name} ${name} change`),
    });
    result.areaBandD = {
      table: sheet.name,
      england: pair("England"),
      byAreaType: {
        london: pair("London area"),
        metropolitan: pair("Metropolitan areas"),
        unitary: pair("Unitary areas"),
        shire: pair("Shire areas"),
      },
    };
  }

  const historyPattern = /^Table \d+: Average Band D council tax \(including parish and adult social care precepts\) in England and the annual percentage change/;
  if (has(historyPattern)) {
    const sheet = sheetByTitle(sheets, historyPattern);
    const t = table(sheet, ["Year", "Pounds £"]);
    result.history = {
      table: sheet.name,
      rows: t.rows
        .filter((r) => /^\d{4} to \d{4}/.test(r[0] ?? ""))
        .map((r) => {
          const [, from, to] = /^(\d{4}) to (\d{4})/.exec(r[0]);
          return {
            year: `${from}-${to.slice(2)}`,
            pounds: figure(r[t.column(/^Pounds £$/)], `${sheet.name} ${r[0]}`),
            changePct: figure(r[t.column(/^Percentage Change %$/)], `${sheet.name} ${r[0]} change`),
          };
        }),
    };
  }

  const classPattern = /^Table \d+: Council tax \(average Band D\) in England .* by class of authority/;
  if (has(classPattern)) {
    const sheet = sheetByTitle(sheets, classPattern);
    const t = table(sheet, ["Class of Authority"]);
    const exclParish = (h) => /excluding parish precepts/i.test(h);
    const bandD = t.header.findIndex((h) => exclParish(h) && /£$/.test(h.trim()) && !/Percentage/i.test(h));
    const change = t.header.findIndex((h) => exclParish(h) && /Percentage/i.test(h));
    if (bandD === -1 || change === -1) throw new Error(`${year} ${sheet.name}: class columns not found`);
    result.byClass = {
      table: sheet.name,
      rows: t.rows.map((r) => ({
        class: houseText(r[0].replace(/\s*\[note [a-z]+\]/gi, "")),
        bandD: figure(r[bandD], `${sheet.name} ${r[0]}`),
        changePct: figure(r[change], `${sheet.name} ${r[0]} change`),
      })),
    };
  }
  return result;
}


/**
 * The authorities and counties that must carry over from the year before. A
 * code that disappears or appears is refused unless the succession record for
 * the year lists it, and each listed change cites at least two sources. The
 * record is data (data/council-tax/succession-<year>.json), reviewed in the
 * release pull request; no page reads it.
 */
export function checkSuccession(year, current, previous, succession = null) {
  if (!previous) return;
  const listed = (kind) => new Set((succession?.[kind] ?? []).map((entry) => {
    if (!Array.isArray(entry.sources) || entry.sources.length < 2) {
      throw new Error(`${year} succession: ${entry.ons} needs two sources`);
    }
    return entry.ons;
  }));
  const removed = listed("removed"), added = listed("added");
  const problems = [];
  for (const [label, now, before] of [
    ["authority", current.authorities, previous.authorities],
    ["county", current.counties, previous.counties],
  ]) {
    for (const ons of Object.keys(before)) if (!now[ons] && !removed.has(ons)) problems.push(`${label} ${ons} ${before[ons].name} is missing`);
    for (const ons of Object.keys(now)) if (!before[ons] && !added.has(ons)) problems.push(`${label} ${ons} ${now[ons].name} is new`);
  }
  if (problems.length) {
    throw new Error(`${year}: refusing to write, authorities differ from ${previous.year} with no succession record:\n  ${problems.join("\n  ")}`);
  }
}

/**
 * A refetch of a year already held must find exactly the authorities and
 * counties the held file has: MHCLG revising a table never removes a row.
 */
export function checkSameSet(year, current, held) {
  const problems = [];
  for (const kind of ["authorities", "counties"]) {
    const now = Object.keys(current[kind]).sort().join(" "), before = Object.keys(held[kind]).sort().join(" ");
    if (now !== before) problems.push(`${kind} differ from the held file`);
  }
  if (problems.length) throw new Error(`${year}: refusing to write, ${problems.join(" and ")}`);
}

/**
 * One year's data file from its sheets and manifest, with every refusal
 * applied. `previous` is the year before's data file, when held.
 */
export function assemble({ year, sheets, manifest, held = null, previous = null, succession = null, generated, publisher, licence, licenceUrl, minAuthorities = 250 }) {
  const notes = notesFrom(sheets);
  const band = bandTable(sheets, notes, year);
  const { tables: ownSheets, own } = ownTables(sheets, notes, year);
  const england = englandTables(sheets, year);

  const authorities = {};
  const noOwn = [];
  for (const [ons, entry] of Object.entries(band.authorities)) {
    const mine = own[ons] ?? null;
    if (!mine) noOwn.push(`${ons} ${entry.name}`);
    authorities[ons] = { ...entry, own: mine };
  }
  if (noOwn.length) throw new Error(`${year}: refusing to write, authorities with no own figures row:\n  ${noOwn.join("\n  ")}`);
  const counties = Object.fromEntries(
    Object.entries(own).filter(([ons]) => /^E10\d{6}$/.test(ons)),
  );
  const count = Object.keys(authorities).length;
  if (count < minAuthorities) throw new Error(`${year}: only ${count} authorities found in the band table`);
  if (held) checkSameSet(year, { authorities, counties }, held);
  else checkSuccession(year, { authorities, counties }, previous, succession);

  return {
    generated,
    year,
    source: {
      publisher,
      title: manifest.pageTitle,
      url: manifest.pageUrl,
      published: manifest.firstPublished,
      updated: manifest.updated,
      licence,
      licenceUrl,
      files: manifest.files.map(({ title, url, file, sha256: digest }) => ({ title, url, file, sha256: digest })),
      bandTable: band.sheet,
      bandTableTitle: band.title,
      bandTableNotes: band.titleNotes,
      ownTables: ownSheets,
      // Every note the workbook defines, so a page can quote the published
      // definition of a rule (the referendum limits are notes to Table 4).
      referendumPrinciples: manifest.principles ?? null,
      notes: Object.fromEntries([...notes.entries()].map(([id, text]) => [id.replace(/^\[note |\]$/g, ""), text])),
    },
    england,
    counties,
    authorities,
  };
}
