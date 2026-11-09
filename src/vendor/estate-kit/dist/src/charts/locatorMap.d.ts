import { type ChartOptions, type ChartOutput } from "./frame.js";
type Ring = number[][];
export interface AreaFeature {
    type: "Feature";
    properties: {
        code: string;
        name: string;
    };
    geometry: {
        type: "Polygon";
        coordinates: Ring[];
    } | {
        type: "MultiPolygon";
        coordinates: Ring[][];
    };
}
export interface LocatorMapOptions extends ChartOptions {
    /** The areas to draw: the focus and its neighbours, with their codes and names. */
    areas: AreaFeature[];
    /** The code of the place the map is about. */
    focus: string;
    /** Area code to a value figure key. Areas without a key are hatched as having no figure. */
    values: Record<string, string>;
    /** Class breaks, ascending: 3 to 6 of them, giving 4 to 7 classes. */
    breaks: number[];
    /** The boundary licence line, printed with the source. Required. */
    boundaryCredit: string;
}
/** The ramp steps for a number of classes, spread across the seven so the ends always show. */
export declare function rampFor(classes: number): string[];
export declare function locatorMap(o: LocatorMapOptions): ChartOutput;
export {};
