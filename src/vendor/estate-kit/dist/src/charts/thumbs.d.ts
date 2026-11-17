import { type ChartOptions, type ChartOutput } from "./frame.js";
import { type AreaFeature } from "./grammar/geo.js";
import { type MapIndicatorRegistry } from "./mapIndicators.js";
import { type MapRamp } from "./locatorMap.js";
export type ThumbKind = "set" | "map";
export interface SetThumbOptions extends Omit<ChartOptions, "template" | "title" | "alt" | "sourcePlacement" | "sourceFormat" | "titlePlacement"> {
    kind: "set";
    /** Two to six value figure keys in one unit, none negative, drawn top to bottom in this order. */
    rows: string[];
}
export interface MapThumbOptions extends Omit<ChartOptions, "template" | "title" | "alt" | "sourcePlacement" | "sourceFormat" | "titlePlacement"> {
    kind: "map";
    areas: AreaFeature[];
    registry: MapIndicatorRegistry;
    /** A fixed indicator in the registry. */
    indicator: string;
    /** Area code to a value figure key, for every area, an unknown included. */
    values: Record<string, string>;
    ramp?: MapRamp;
}
export type ThumbOptions = SetThumbOptions | MapThumbOptions;
/** A marks only thumb of one of the two kinds. */
export declare function thumb(o: ThumbOptions): ChartOutput;
