import { type ChartOptions, type ChartOutput } from "./frame.js";
export type WaffleSize = "standard" | "small";
export interface WaffleOptions extends ChartOptions {
    /** A value figure in percent, from 0 to 100. Give this or parts. */
    figure?: string;
    /** Two to twelve value figures in one unit, in key order. Give this or figure. */
    parts?: string[];
    /** Key text for the filled squares of a single figure. Defaults to the figure's name or label. */
    filledLabel?: string;
    /** Key text for the empty squares of a single figure. No number: the reader counts them. */
    emptyLabel?: string;
    /** standard (the default) or small, the 10 by 10 phone size with the key below. */
    size?: WaffleSize;
}
type Hatch = "none" | "diagonal" | "cross";
interface Paint {
    fill: string;
    hatch: Hatch;
}
/**
 * The order parts take their paint: the four series solid, then with one diagonal stroke,
 * then with a cross. The neutrals are not used: they sit under 0.09 from a series under
 * colour vision, so a fifth hue would break the series gate.
 */
export declare const WAFFLE_PAINTS: Paint[];
/**
 * Whole squares for each share, adding to exactly 100: floors first, then the largest
 * remainders, ties to the earlier part. The shares are percentages of one whole, so they
 * must be finite, not negative, and add to 100 within half a square (the same tolerance
 * Waffle allows percentage parts); anything else throws rather than returning a grid of
 * more or fewer than a hundred squares. Within that tolerance the result always adds to
 * exactly 100. A client drawing a part filled grid (a player's answers mid round)
 * normalises its values to shares first, or leaves the rest as empty squares itself.
 */
export declare function squaresFor(shares: number[]): number[];
export declare function waffle(o: WaffleOptions): ChartOutput;
export {};
