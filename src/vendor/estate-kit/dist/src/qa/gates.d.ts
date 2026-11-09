/** The dash pattern of the map renderer: em dash, en dash, a spaced hyphen, the entities. */
export declare const DASHES: RegExp;
/** A colour is a token name ("series-1", "text") or a literal hex for party colours. */
export type Colour = string;
/** OKLab distance two series must keep under every vision (ukdemographics tests/ethnic-palette.test.ts). */
export declare const MIN_SERIES_DISTANCE = 0.09;
export declare const MIN_MARK_CONTRAST = 3;
export interface TextCheck {
    content: string;
    size: number;
    weight: number;
    fill: Colour;
    bg: Colour;
}
export interface MarkCheck {
    what: string;
    fill: Colour;
    against: Colour[];
}
export interface SeriesCheck {
    what: string;
    colours: Colour[];
}
export interface Checks {
    texts: TextCheck[];
    marks: MarkCheck[];
    series: SeriesCheck[];
}
export declare const emptyChecks: () => Checks;
export declare const resolve: (c: Colour, pal: Record<string, string>) => string;
/** The contrast a piece of text needs: large text (24 units, or 18.66 at 600) needs 3. */
export declare const textNeed: (size: number, weight: number) => 3 | 4.5;
/** Every failure for one palette. `name` says which theme and site, for the message. */
export declare function gateErrors(checks: Checks, pal: Record<string, string>, name: string): string[];
/** Runs the gates against every palette and throws with every failure listed. */
export declare function assertGates(checks: Checks, palettes: {
    name: string;
    pal: Record<string, string>;
}[], what: string): void;
