import { type ChartOptions, type ChartOutput } from "./frame.js";
export interface ZeroBarOptions extends ChartOptions {
    /** A series figure key. */
    figure: string;
    orientation?: "vertical" | "horizontal";
    /** The label of one point to draw in the accent, the rest in the neutral. */
    highlight?: string;
}
export declare function zeroBar(o: ZeroBarOptions): ChartOutput;
