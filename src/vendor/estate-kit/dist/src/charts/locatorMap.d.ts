import { type SiteKey, type SkinKey } from "../../generated/tokens.js";
import { type ChartOptions, type ChartOutput } from "./frame.js";
export type { AreaFeature } from "./grammar/geo.js";
import { type AreaFeature } from "./grammar/geo.js";
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
    /**
     * The same map's values in its other editions or years, area code to figure key. Plates
     * are sized for the widest value across all of them, so a site that renders one map per
     * year, passing the others here, gets one layout for every year and nothing moves.
     */
    lockAcross?: Record<string, string>[];
    /**
     * Where a neighbour that fits nowhere on the map is named: "list" (the default) in a
     * line under the key; "gutter" on a plate at the panel's edge with a leader line to its
     * area, the leaders never crossing, and in the line under the key only if no gutter has room.
     */
    neighbourLabels?: "list" | "gutter";
    /**
     * Which sequential ramp shades the classes: "estate" (the default, the UK Demographics
     * ramp) or "accent", the ramp derived from the accent of `site`, which must have one
     * (0.6.4: UK Council Tax and UK Councils). Both are drawn on the estate ground.
     */
    ramp?: MapRamp;
}
export type MapRamp = "estate" | "accent";
/** The skin whose accent ramp a map draws, or none for the estate ramp. Throws for an accent ramp a site does not have. */
export declare function rampSite(ramp: MapRamp | undefined, site: SiteKey | undefined): SkinKey | undefined;
/**
 * The ramp steps for a number of classes, spread across the seven so the ends always show.
 * With a site whose skin carries an accent ramp (0.6.4: UK Council Tax and UK Councils),
 * the steps come from that ramp; with any other site, or none, from the estate ramp.
 */
export declare function rampFor(classes: number, site?: SkinKey): string[];
export declare function locatorMap(o: LocatorMapOptions): ChartOutput;
