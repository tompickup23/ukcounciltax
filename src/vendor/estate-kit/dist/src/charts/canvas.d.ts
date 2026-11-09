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
import { type Checks, type Colour } from "../qa/gates.js";
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
/** An estimate of drawn width, used only to wrap and to keep labels apart. */
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
}
export declare class Canvas {
    parts: string[];
    checks: Checks;
    mode: Mode;
    W: number;
    H: number;
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
