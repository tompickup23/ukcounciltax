/**
 * The compare page's drawings (W7, NV11), browser safe, so the page draws its example
 * pair at build time and the reader's own pair in the browser with the same code, as
 * the local bill tool does.
 *
 * Every number is a published area charge held in the page's comparison data, in
 * integer pence, for one council class group, one year and one basis. Nothing is
 * derived, averaged or carried forward: a band either council does not hold for the
 * year is never drawn as zero, and a chart that would need one is not drawn at all.
 *
 * Two drawings, one grammar: the chosen band for each council, then bands A to H as
 * paired bars, the first council above the second in each pair, in the same two
 * colours in both, so the key holds down the page.
 *
 * Why this is not ZeroBar or RankedBars: ZeroBar draws one series with at most one
 * highlighted bar (accent against neutral), and RankedBars one row per figure, so
 * neither can set two councils' bars side by side for each band on one scale. The
 * accent and neutral pair also fails the kit's series distance gate on two of the
 * estate's dark skins, so it cannot carry a key. This drawing is built only from the
 * kit's own parts (frame, Canvas, zeroDomain, zeroScale, openBar, zeroLine, tableTwin)
 * and paints with the kit's gated series pair, so the kit's contrast, overlap, value
 * and series gates run on it exactly as on ZeroBar.
 */
import { defineFigures, showPoint } from "../vendor/estate-kit/dist/src/figures/figures.js";
import { frame } from "../vendor/estate-kit/dist/src/charts/frame.js";
import { textWidth, esc } from "../vendor/estate-kit/dist/src/charts/canvas.js";
import { openBar, zeroDomain, zeroScale, zeroLine } from "../vendor/estate-kit/dist/src/charts/grammar/index.js";
import { tableTwin } from "../vendor/estate-kit/dist/src/charts/table.js";
import type { ChartOutput } from "../vendor/estate-kit/dist/src/charts/frame.js";
import type { Theme } from "../vendor/estate-kit/dist/generated/tokens.js";
import { TAX_BANDS, validPence, type TaxBand, type TaxRow } from "./tax-view";

/** The source block the page's comparison data carries for each year. */
export interface CompareSource { publisher: string; title: string; table?: string; url: string; date?: string | null }

/** The two colours, first council then second, in both drawings and the page's key. */
export const PAIR_COLOURS = ["series-1", "series-2"] as const;

const shownYear = (year: string) => year.replace("-", "/");
const LONG_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function kitSource(year: string, s: CompareSource) {
  const published = s.date ? LONG_DATE.format(new Date(`${s.date.slice(0, 10)}T00:00:00Z`)) : null;
  return { publisher: s.publisher, title: s.title, table: s.table, edition: published ? `${shownYear(year)}. Published ${published}` : shownYear(year), url: s.url };
}

/** True when both councils hold every band from A to H for the year. */
export function allBandsHeld(a: TaxRow, b: TaxRow, year: string): boolean {
  return [a, b].every((row) => TAX_BANDS.every((band) => validPence(row.years[year]?.[band])));
}

function pairs(a: TaxRow, b: TaxRow, year: string, source: CompareSource, bands: readonly TaxBand[], id: string, title: string, theme?: Theme): ChartOutput {
  const rows = [a, b];
  for (const row of rows) for (const band of bands) {
    if (!validPence(row.years[year]?.[band])) throw new Error(`No published Band ${band} figure for ${shownYear(year)} is held for ${row.name}`);
  }
  const single = bands.length === 1;
  const keys = rows.map((_, i) => `compare.${id}.${i}`);
  const set = defineFigures(Object.fromEntries(rows.map((row, i) => [keys[i], {
    kind: "series", axis: "category", unit: "gbp", dp: 2,
    label: single ? `Band ${bands[0]} area charge in ${row.name}, ${shownYear(year)}` : `Bands A to H in ${row.name}, ${shownYear(year)}`,
    name: row.name, source: kitSource(year, source),
    points: bands.map((band) => ({ label: band, value: (row.years[year]![band] as number) / 100 })),
  }])));
  const series = keys.map((k) => set.series(k));
  const shown = series.map((f) => f.points.map((p) => showPoint(f, p)));
  const caption = set.caption(keys);
  // On the page the title is the figure caption, under the section heading (F1 title rule);
  // a PNG keeps it inside the drawing.
  const fr = frame({ set, site: "ukcounciltax", title, titlePlacement: "html", mode: theme ? { kind: "hex", theme, site: "ukcounciltax" } : { kind: "css" } }, caption, 0, undefined, keys.map((k) => set.get(k)));
  const { canvas, tpl, bg } = fr;
  const font = tpl.font;
  for (const c of PAIR_COLOURS) canvas.mark(`bar ${c}`, c, [bg]);
  canvas.series("Paired bars, one colour per council", [...PAIR_COLOURS]);
  canvas.allow(...shown.flat());
  const P = fr.plot;

  // A single band labels each bar with its council, as ZeroBar does. Several bands take a
  // key, one line per council so a long name has the whole width, and a band letter per pair.
  let top = P.y + 4;
  if (!single) {
    const sw = Math.round(font.label * 0.8);
    const line = Math.round(font.label * 1.6);
    rows.forEach((row, i) => {
      const y = P.y + i * line;
      canvas.rect(P.x, y + (line - sw) / 2, sw, sw, PAIR_COLOURS[i], `data-ek-key="${i}"`);
      canvas.text(P.x + sw + 10, y + line / 2, row.name, { size: font.label, fill: "text", bg, baseline: "middle" });
    });
    top = P.y + line * 2 + 12;
  }
  const valueSize = single ? font.value : Math.round(font.value * 0.8);
  const barH = single ? Math.round(font.value * 1.25) : Math.round(font.value * 0.95);
  const inner = single ? 10 : 3;
  const groupGap = Math.round(font.value * 0.85);
  const groupH = barH * 2 + inner;
  const labels = single ? rows.map((row) => row.name) : [...bands];
  const labelW = Math.max(...labels.map((l) => textWidth(l, font.label))) + 16;
  const valueW = Math.max(...shown.flat().map((s) => textWidth(s, valueSize, "sans", 600))) + 12;
  const x0 = P.x + labelW;
  const scale = zeroScale(zeroDomain(series.flatMap((f) => f.points.map((p) => p.value))), x0, P.w - labelW - valueW, "right");
  canvas.add(`<g class="ek-bars">`);
  bands.forEach((band, j) => {
    const gy = top + j * (groupH + groupGap);
    if (!single) canvas.text(P.x + labelW - 10, gy + groupH / 2, band, { size: font.label, fill: "text", bg, anchor: "end", baseline: "middle" });
    series.forEach((f, i) => {
      const p = f.points[j];
      const w = scale.extent(p.value);
      const y = gy + i * (barH + inner);
      const end = scale.zero + w;
      openBar(canvas, {
        orientation: "horizontal", base: scale.zero, end, length: w, cross: y, thickness: barH, r: Math.min(4, barH / 2, w), fill: PAIR_COLOURS[i],
        title: `Band ${band}, ${rows[i].name}: ${shown[i][j]}`, what: `the Band ${band} bar for ${rows[i].name}`,
        attrs: `data-ek-bar="" data-value="${p.value}" data-council="${esc(rows[i].slug)}" data-band="${band}"`,
      });
      if (single) canvas.text(P.x + labelW - 10, y + barH / 2, rows[i].name, { size: font.label, fill: "text", bg, anchor: "end", baseline: "middle" });
      canvas.text(end + 8, y + barH / 2, shown[i][j], { size: valueSize, weight: 600, fill: "text", bg, baseline: "middle", tabular: true, role: "value" });
      canvas.add(`</g>`);
    });
  });
  canvas.add(`</g>`);
  const bottom = top + bands.length * (groupH + groupGap) - groupGap;
  zeroLine(canvas, "horizontal", scale.zero, top, bottom);
  fr.close(bottom + 4);
  const alt = single
    ? `Bar chart from zero of the published Band ${bands[0]} area charge for ${shownYear(year)}: ${a.name} ${shown[0][0]}, ${b.name} ${shown[1][0]}.`
    : `Paired bar chart from zero of the published area charge in each band from A to H, ${shownYear(year)}: ${a.name} from ${shown[0][0]} in Band A to ${shown[0].at(-1)} in Band H, ${b.name} from ${shown[1][0]} to ${shown[1].at(-1)}.`;
  const svg = canvas.finish(`Compare ${id}`, alt);
  const table = tableTwin({ caption: title, head: ["Band", a.name, b.name], rows: bands.map((band, j) => [band, shown[0][j], shown[1][j]]), source: caption, numeric: true });
  return { ...fr.sourceOutput, svg, table, alt, caption, title, width: canvas.W, height: canvas.H };
}

/** The chosen band for each council, side by side on one scale from zero. */
export function bandChart(a: TaxRow, b: TaxRow, band: TaxBand, year: string, source: CompareSource, theme?: Theme): ChartOutput {
  return pairs(a, b, year, source, [band], "band", `Band ${band}, ${shownYear(year)}`, theme);
}

/** Bands A to H as paired bars, the first council above the second in each pair. */
export function pairedBandsChart(a: TaxRow, b: TaxRow, year: string, source: CompareSource, theme?: Theme): ChartOutput {
  if (!allBandsHeld(a, b, year)) throw new Error(`Not every band is held for both councils in ${shownYear(year)}`);
  return pairs(a, b, year, source, TAX_BANDS, "bands", `Bands A to H, ${shownYear(year)}`, theme);
}
