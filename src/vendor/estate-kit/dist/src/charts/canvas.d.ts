/**
 * A small SVG writer that records what it draws, so the QA gates can check every piece of
 * text and every mark against the real palette values.
 *
 * Two paint modes. "css" writes colours as CSS custom properties (style="fill:var(--x)"),
 * so the same inline SVG follows the page between light and dark with no script; the gates
 * then run against both themes of every site. "hex" writes plain hex for one theme, for
 * resvg, which cannot read custom properties.
 */
import { type SiteKey, type Theme } from "../../generated/tokens.js";
import { type FaceKey } from "../../generated/metrics.js";
import { type Checks, type Colour, type TextRole } from "../qa/gates.js";
export type Mode = {
    kind: "css";
} | {
    kind: "hex";
    theme: Theme;
    site: SiteKey;
};
export declare const esc: (s: string) => string;
export declare const n2: (v: number) => string;
export type Family = "sans" | "display";
/** The face a family and weight draw in. Display has one weight, 600. */
export declare function faceFor(family: Family, weight: number): FaceKey;
/**
 * Drawn width in user units, measured from the TTF's own advance widths (cmap and hmtx,
 * read into generated/metrics.ts by scripts/build-metrics.mjs). A character outside the
 * table takes the width of the missing glyph, as resvg would draw it. Kerning is ignored,
 * which only ever makes the measure a little wider than the drawing.
 */
export declare function textWidth(s: string, size: number, family?: Family, weight?: number): number;
/** Greedy word wrap to a width. */
export declare function wrap(s: string, maxW: number, size: number, family?: Family, weight?: number): string[];
export interface TextOpts {
    size: number;
    weight?: number;
    family?: Family;
    fill: Colour;
    /** The ground the text sits on, for the contrast gate. */
    bg: Colour;
    anchor?: "start" | "middle" | "end";
    baseline?: "auto" | "middle" | "hanging";
    tabular?: boolean;
    cls?: string;
    /**
     * What the text is, for the gates: "title" is checked for ranking and loaded words,
     * "value" must be in the chart's manifest character for character, "scale" labels a
     * scale rather than an area. Plain text needs none.
     */
    role?: TextRole;
    /** Texts sharing a group may touch (the lines of one wrapped block); all others may not. */
    group?: string;
}
export declare class Canvas {
    parts: string[];
    checks: Checks;
    mode: Mode;
    W: number;
    H: number;
    /** A thumb draws marks only: text draws nothing, and finish() strips titles and hides the SVG. */
    silent: boolean;
    private paras;
    constructor(mode: Mode, W: number, H: number);
    /** Paint attributes for fill and stroke in the current mode. */
    paint(p: {
        fill?: Colour;
        stroke?: Colour;
    }): string;
    add(svg: string): void;
    rect(x: number, y: number, w: number, h: number, fill: Colour, extra?: string): void;
    line(x1: number, y1: number, x2: number, y2: number, stroke: Colour, width?: number, extra?: string): void;
    text(x: number, y: number, content: string, o: TextOpts): void;
    /** Wrapped text from a top line; returns the y below the last line. */
    para(x: number, y: number, content: string, maxW: number, o: TextOpts & {
        lineHeight?: number;
    }): number;
    /**
     * Registers display forms the chart took from its figures (or computed from them and
     * says so), so every text drawn with role "value" can be checked against them.
     */
    allow(...shown: string[]): void;
    /** Scale labels the alt text may use without tripping the ranking gate ("lowest", "highest"). */
    scaleLabels(...labels: string[]): void;
    mark(what: string, fill: Colour, against: Colour[]): void;
    series(what: string, colours: Colour[]): void;
    /** Runs the gates and returns the finished SVG. */
    finish(what: string, label: string, extraAttrs?: string): string;
}
/** The palettes a render must pass: both themes of every site in css mode, one in hex mode. */
export declare function gatePalettes(mode: Mode): {
    name: string;
    pal: Record<string, string>;
}[];
