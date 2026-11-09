/**
 * The card package (R566): any kit chart as a 1200x630 and a 1080x1350 card in the estate
 * post card grammar (clawd briefings/uk-network-brand/BRAND-SYSTEM-2026-08-23.md section
 * 5b). The chart draws its own card through the og and portrait templates, so the brand
 * row, the one message and the footer come from one frame; this module renders each format
 * to PNG and checks the grammar on the result before it hands anything back.
 *
 * The grammar, fixed across every brand: the accent rule along the top, the lockup top
 * left, ONE message (the chart's takeaway title), and the footer rule with the domain in
 * the accent on the left and the source on the right. The source names its edition or
 * date, which the figure record requires, so the data date is always on the card.
 */
import { type SiteKey } from "../../generated/tokens.js";
import type { ChartOptions, ChartOutput } from "../charts/frame.js";
export type CardFormat = "og" | "portrait";
export declare const CARD_FORMATS: CardFormat[];
export interface Card {
    format: CardFormat;
    svg: string;
    png: Buffer;
    width: number;
    height: number;
    /** The one message on the card. */
    title: string;
    alt: string;
    caption: string;
    /** The table twin, for the page or post the card goes with. */
    table: string;
}
/** Every way a card SVG breaks the grammar, as plain sentences. Empty when it is sound. */
export declare function cardErrors(svg: string, format: CardFormat, site?: SiteKey): string[];
/** One chart as one card: the chart drawn in the format's template, gated, then rasterised. */
export declare function card<O extends ChartOptions>(chart: (o: O) => ChartOutput, o: O, format?: CardFormat): Card;
/** The same chart in every card format: 1200x630 for links, 1080x1350 for feeds. */
export declare function cardSet<O extends ChartOptions>(chart: (o: O) => ChartOutput, o: O, formats?: CardFormat[]): Record<CardFormat, Card>;
