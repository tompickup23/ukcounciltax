/**
 * Geometry for the Band D line chart. Pure arithmetic on the published series
 * the page already holds: one point per published year, in the order given,
 * and nothing for a year the table leaves empty. A missing year breaks the
 * line, so no value is ever drawn between two published years that the table
 * does not join. No figure is estimated, carried forward or interpolated.
 */
export interface SeriesPoint {
  /** The year key as the data holds it, for example "1993-94". */
  year: string;
  /** The published figure, or null where the table holds none. */
  value: number | null;
}

export interface PlottedPoint {
  year: string;
  value: number;
  x: number;
  y: number;
}

export interface LineGeometry {
  width: number;
  height: number;
  plot: { left: number; right: number; top: number; bottom: number };
  /** Every published value, one per year that has a figure. */
  points: PlottedPoint[];
  /** One path per unbroken run of published years. */
  segments: string[];
  /** Years with no published figure, kept so the chart can say so. */
  missing: string[];
  /** Horizontal gridlines with their values. */
  yTicks: { value: number; y: number }[];
  /** Year labels on the axis: first, last and evenly spaced ones between. */
  xTicks: { year: string; x: number }[];
  /** X position of every year in the series, published or not. */
  xOf: (index: number) => number;
}

export const WIDTH = 440;
export const HEIGHT = 250;
const PAD = { top: 26, right: 30, bottom: 30, left: 58 };
/** Smallest gap between two year labels, in viewBox units. */
const MIN_LABEL_GAP = 92;

/** A round step for gridlines: 1, 2 or 5 times a power of ten. */
export function niceStep(range: number, target = 4): number {
  if (!(range > 0)) return 1;
  const raw = range / target;
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  const nice = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10;
  return nice * power;
}

export function lineGeometry(series: SeriesPoint[]): LineGeometry {
  const plot = { left: PAD.left, right: WIDTH-PAD.right, top: PAD.top, bottom: HEIGHT-PAD.bottom };
  const innerW = plot.right-plot.left;
  const innerH = plot.bottom-plot.top;
  const published = series.filter((p): p is { year: string; value: number } => typeof p.value === "number" && Number.isFinite(p.value));
  const max = published.length ? Math.max(...published.map((p) => p.value)) : 0;
  const step = niceStep(max);
  const top = Math.max(step, Math.ceil(max / step) * step);
  const xOf = (i: number) => (series.length > 1 ? plot.left + (i / (series.length-1)) * innerW : plot.left + innerW / 2);
  const yOf = (v: number) => plot.bottom-(v / top) * innerH;
  const round = (n: number) => Math.round(n * 100) / 100;

  const points: PlottedPoint[] = [];
  const segments: string[] = [];
  const missing: string[] = [];
  let run: string[] = [];
  series.forEach((p, i) => {
    if (typeof p.value === "number" && Number.isFinite(p.value)) {
      const x = round(xOf(i));
      const y = round(yOf(p.value));
      points.push({ year: p.year, value: p.value, x, y });
      run.push(`${run.length ? "L" : "M"}${x},${y}`);
    } else {
      missing.push(p.year);
      if (run.length > 1) segments.push(run.join(" "));
      run = [];
    }
  });
  if (run.length > 1) segments.push(run.join(" "));

  const yTicks: { value: number; y: number }[] = [];
  for (let v = 0; v <= top + step / 2; v += step) yTicks.push({ value: v, y: round(yOf(v)) });

  const xTicks: { year: string; x: number }[] = [];
  if (series.length) {
    const spacing = series.length > 1 ? innerW / (series.length-1) : innerW;
    const every = Math.max(1, Math.ceil(MIN_LABEL_GAP / spacing));
    const last = series.length-1;
    for (let i = 0; i <= last; i += every) {
      if (i !== last && (last-i) * spacing < MIN_LABEL_GAP) continue;
      xTicks.push({ year: series[i].year, x: round(xOf(i)) });
    }
    if (xTicks.at(-1)?.year !== series[last].year) xTicks.push({ year: series[last].year, x: round(xOf(last)) });
  }

  return { width: WIDTH, height: HEIGHT, plot, points, segments, missing, yTicks, xTicks, xOf };
}
