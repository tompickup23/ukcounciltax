/**
 * The frame around every chart: title, plot area, source line, and on cards the post card
 * grammar (BRAND-SYSTEM-2026-08-23.md section 5b): the accent rule along the top, the
 * lockup top left, one message, and the footer rule with the domain in the accent on the
 * left and the source, which ends with its edition or date, on the right. Charts draw only
 * inside the plot rectangle this hands them.
 */
import { type SiteKey } from "../../generated/tokens.js";
import { type Template, type TemplateKey } from "../output/templates.js";
import { Canvas, type Mode } from "./canvas.js";
import { type FigureSet } from "../figures/figures.js";
export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface ChartOptions {
    /** The figure set. Falls back to the one registered with useFigures(). */
    set?: FigureSet;
    template?: TemplateKey;
    /** Paint mode for inline output. Cards are always hex on the dark ground. */
    mode?: Mode;
    site?: SiteKey;
    /** The takeaway sentence. Required on cards. May hold {key} or {key:form} figure slots. */
    title?: string;
    /** Story bearing alt text: chart type, data and takeaway. Generated if absent. */
    alt?: string;
}
export interface ChartOutput {
    svg: string;
    /** The table twin as HTML, the accessible view of the same figures. */
    table: string;
    alt: string;
    caption: string;
    title?: string;
    width: number;
    height: number;
}
/** Replaces {key} and {key:form} with a figure's display form, so prose never types a number. */
export declare function fillSlots(text: string, set: FigureSet): string;
export interface Framed {
    canvas: Canvas;
    tpl: Template;
    plot: Rect;
    /** The ground token text sits on. */
    bg: string;
    set: FigureSet;
    title?: string;
    /** Call once the chart is drawn: adds the footer and, for inline, sets the final height. */
    close: (plotBottom: number) => void;
}
/**
 * Lays out header and footer and hands back the plot rectangle. For inline the plot
 * height is the chart's own need; for a card it is what the fixed canvas leaves.
 */
export declare function frame(o: ChartOptions, caption: string, plotNeed: number, thumbForm?: string): Framed;
export declare const NICE_STEPS: number[];
/** A round ceiling at or above max, so the top gridline is a readable number. */
export declare function niceMax(max: number): number;
