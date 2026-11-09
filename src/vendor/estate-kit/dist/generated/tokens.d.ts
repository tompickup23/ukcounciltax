export declare const VERSION = "0.2.0";
export declare const tokens: {
    readonly color: {
        readonly light: {
            readonly bg: "#ffffff";
            readonly "bg-subtle": "#f5f6f7";
            readonly "bg-card": "#ffffff";
            readonly border: "#dbdfe3";
            readonly "border-strong": "#c2c8ce";
            readonly text: "#171b1f";
            readonly "text-muted": "#545c63";
            readonly "text-faint": "#616970";
            readonly ground: "#0f1317";
            readonly "ground-ink": "#f4f6f7";
            readonly "ground-muted": "#98a3ac";
            readonly "accent-ink": "#ffffff";
            readonly positive: "#1f6f4f";
            readonly warning: "#8a5a10";
            readonly critical: "#b42318";
            readonly "series-1": "#166ea5";
            readonly "series-2": "#b6550f";
            readonly "series-3": "#6e24da";
            readonly "series-4": "#9d1c5c";
            readonly "series-neutral": "#6b7280";
            readonly "series-neutral-soft": "#8b939c";
            readonly "tooltip-bg": "#111827";
            readonly "tooltip-fg": "#ffffff";
        };
        readonly dark: {
            readonly bg: "#0f1317";
            readonly "bg-subtle": "#171c21";
            readonly "bg-card": "#141a1f";
            readonly border: "#2a3138";
            readonly "border-strong": "#3d464e";
            readonly text: "#f4f6f7";
            readonly "text-muted": "#b6c0c8";
            readonly "text-faint": "#98a3ac";
            readonly ground: "#05080a";
            readonly "ground-ink": "#f4f6f7";
            readonly "ground-muted": "#98a3ac";
            readonly "accent-ink": "#0f1317";
            readonly positive: "#6fcf9a";
            readonly warning: "#f0b03e";
            readonly critical: "#f2857a";
            readonly "series-1": "#5599cc";
            readonly "series-2": "#cf7a48";
            readonly "series-3": "#966bfe";
            readonly "series-4": "#f83b9b";
            readonly "series-neutral": "#9aa2ab";
            readonly "series-neutral-soft": "#7b838c";
            readonly "tooltip-bg": "#e6edf3";
            readonly "tooltip-fg": "#0d1117";
        };
    };
    readonly sites: {
        readonly ukdemographics: {
            readonly deep: "#4338ca";
            readonly bright: "#7b74f2";
            readonly wash: "#eeeefc";
            readonly darkWash: "#1c1b3a";
            readonly name: "UK Demographics";
            readonly domain: "ukdemographics.co.uk";
        };
        readonly ukelections: {
            readonly deep: "#6b5334";
            readonly bright: "#e3d9c3";
            readonly wash: "#f6f2ea";
            readonly darkWash: "#221d14";
            readonly name: "UK Elections";
            readonly domain: "ukelections.co.uk";
        };
        readonly ukfoodhygiene: {
            readonly deep: "#1f5c4a";
            readonly bright: "#3fb492";
            readonly wash: "#edf6f3";
            readonly darkWash: "#0e2620";
            readonly name: "UK Food Hygiene Ratings";
            readonly domain: "ukfoodhygiene.co.uk";
        };
        readonly ukschoolholidaydates: {
            readonly deep: "#8a5a10";
            readonly bright: "#f0b03e";
            readonly wash: "#fdf3e3";
            readonly darkWash: "#2b1f0c";
            readonly name: "UK School Holiday Dates";
            readonly domain: "ukschoolholidaydates.co.uk";
        };
        readonly asylumstats: {
            readonly deep: "#2f5773";
            readonly bright: "#82abcb";
            readonly wash: "#eef3f7";
            readonly darkWash: "#122430";
            readonly name: "Asylum Stats";
            readonly domain: "asylumstats.co.uk";
        };
        readonly aidoge: {
            readonly deep: "#1c6e8a";
            readonly bright: "#63c3dc";
            readonly wash: "#e4eff4";
            readonly darkWash: "#123441";
            readonly name: "AI DOGE";
            readonly domain: "aidoge.co.uk";
        };
        readonly ukcounciltax: {
            readonly deep: "#23664f";
            readonly bright: "#94d7b5";
            readonly wash: "#edf6f0";
            readonly darkWash: "#112d25";
            readonly name: "UK Council Tax";
            readonly domain: "ukcounciltax.co.uk";
        };
    };
    readonly font: {
        readonly display: {
            readonly family: "Source Serif 4";
            readonly stack: "\"Source Serif 4\", Georgia, \"Times New Roman\", serif";
            readonly weights: readonly [600];
            readonly files: {
                readonly "600": "fonts/SourceSerif4-SemiBold.ttf";
            };
        };
        readonly sans: {
            readonly family: "Source Sans 3";
            readonly stack: "\"Source Sans 3\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif";
            readonly weights: readonly [400, 600];
            readonly files: {
                readonly "400": "fonts/SourceSans3-Regular.ttf";
                readonly "600": "fonts/SourceSans3-SemiBold.ttf";
            };
        };
    };
    readonly text: {
        readonly xs: "0.78rem";
        readonly sm: "0.875rem";
        readonly base: "1.0625rem";
        readonly md: "1.1875rem";
        readonly lg: "clamp(1.3rem, 1.16rem + 0.62vw, 1.6rem)";
        readonly xl: "clamp(1.65rem, 1.36rem + 1.28vw, 2.3rem)";
        readonly "2xl": "clamp(2rem, 1.55rem + 2vw, 3rem)";
    };
    readonly space: {
        readonly "2xs": "0.25rem";
        readonly xs: "0.5rem";
        readonly sm: "0.75rem";
        readonly md: "1rem";
        readonly lg: "1.5rem";
        readonly xl: "2rem";
        readonly "2xl": "3rem";
        readonly "3xl": "4.5rem";
    };
    readonly radius: {
        readonly radius: "10px";
        readonly "radius-sm": "6px";
    };
    readonly shadow: {
        readonly light: {
            readonly "shadow-soft": "0 1px 2px rgba(23, 27, 31, 0.05)";
            readonly shadow: "0 1px 2px rgba(23, 27, 31, 0.06), 0 8px 24px rgba(23, 27, 31, 0.06)";
        };
        readonly dark: {
            readonly "shadow-soft": "0 1px 2px rgba(0, 0, 0, 0.4)";
            readonly shadow: "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.32)";
        };
    };
    readonly ramp: {
        readonly about: "Map ramps, drawn on the estate ground in every theme, as the UK Demographics maps are. Ported unchanged from ukdemographics src/lib/map/indicators.ts (SEQUENTIAL, DIVERGING) and src/lib/map/render.ts (na, naStripe, context), origin/main, 4 November 2026. Fixed classes: a colour always means the same value.";
        readonly ground: "#0f1317";
        readonly sequential: readonly ["#25233e", "#2e2b5c", "#39357b", "#46419c", "#5751be", "#6d66de", "#8c86f5"];
        readonly diverging: readonly ["#b0703a", "#7a5636", "#6e747a", "#3b3878", "#524dad", "#7b74f2", "#b9b5f9"];
        readonly na: "#2a3038";
        readonly naStripe: "#4b535c";
        readonly context: "#1b2229";
        readonly ink: "#f4f6f7";
        readonly muted: "#98a3ac";
    };
    readonly party: {
        readonly default: "#475467";
        readonly colours: {
            readonly Labour: "#c1121f";
            readonly Conservative: "#1d4e89";
            readonly "Reform UK": "#12b5cb";
            readonly "Liberal Democrats": "#f59e0b";
            readonly "Green Party": "#138a52";
            readonly SNP: "#fdf24e";
            readonly "Plaid Cymru": "#3f9c35";
            readonly Independent: "#888888";
            readonly "Workers Party of Britain": "#a78bfa";
            readonly SDP: "#8c1f3a";
            readonly "Restore Britain": "#0f2545";
            readonly DUP: "#d46a4c";
            readonly "Sinn F\u00E9in": "#326760";
            readonly SDLP: "#2aa82c";
            readonly Alliance: "#f6cb2f";
            readonly UUP: "#48a5ee";
            readonly "Traditional Unionist Voice - TUV": "#0c3a6a";
            readonly "Speaker seeking re-election": "#708090";
            readonly "Our West Lancashire": "#5DADE2";
            readonly UKIP: "#70147A";
            readonly BNP: "#2D2D86";
            readonly "No Overall Control": "#888888";
        };
        readonly aliases: {
            readonly "Workers Party": "Workers Party of Britain";
            readonly Green: "Green Party";
            readonly "Liberal Democrat": "Liberal Democrats";
            readonly "Lib Dem": "Liberal Democrats";
            readonly "Labour & Co-operative Party": "Labour";
            readonly "Labour & Co-operative": "Labour";
            readonly "Labour and Co-operative": "Labour";
            readonly "Labour (Co-op)": "Labour";
            readonly "Lab & Co-op": "Labour";
            readonly "Our West Lancs": "Our West Lancashire";
            readonly Speaker: "Speaker seeking re-election";
            readonly TUV: "Traditional Unionist Voice - TUV";
        };
        readonly display: {
            readonly "Traditional Unionist Voice - TUV": "Traditional Unionist Voice (TUV)";
        };
        readonly notes: readonly ["Every value is the one ukelections uses in src/lib/predictions.ts partyColour(), read from origin/main on 4 November 2026, except four that ukelections does not carry: Our West Lancashire, UKIP, BNP and No Overall Control, which keep the clawd src/utils/constants.js value.", "The Traditional Unionist Voice key is the party name exactly as ukelections stores it, so a lookup matches the data; its hyphen is written as a JSON escape so the verbatim name passes the dash check. It is for lookup only: display gives the name a label prints, Traditional Unionist Voice (TUV), and TUV is an alias.", "Other (#999999 in clawd) is dropped: a residual bucket takes series-neutral, never a party colour."];
        readonly changes: readonly [{
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Conservative";
            readonly from: "#0087dc";
            readonly to: "#1d4e89";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Labour";
            readonly from: "#dc241f";
            readonly to: "#c1121f";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Liberal Democrats";
            readonly from: "#faa61a";
            readonly to: "#f59e0b";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Reform UK";
            readonly from: "#12b6cf";
            readonly to: "#12b5cb";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Green (key renamed Green Party, Green kept as an alias)";
            readonly from: "#6ab023";
            readonly to: "#138a52";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "SNP";
            readonly from: "#ffff00";
            readonly to: "#fdf24e";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Plaid Cymru";
            readonly from: "#008142";
            readonly to: "#3f9c35";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Independent";
            readonly from: "#800080";
            readonly to: "#888888";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "(unknown party default)";
            readonly from: "#8e8e93";
            readonly to: "#475467";
        }, {
            readonly copy: "asylumstats src/components/MpCard.astro";
            readonly party: "the same nine changes as ukdemographics MpCard.astro, whose map it copies exactly";
            readonly from: "as above";
            readonly to: "as above";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Labour and its five Co-operative aliases";
            readonly from: "#DC241F";
            readonly to: "#c1121f";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Conservative";
            readonly from: "#0087DC";
            readonly to: "#1d4e89";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Liberal Democrats and Lib Dem";
            readonly from: "#FAA61A";
            readonly to: "#f59e0b";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Reform UK";
            readonly from: "#12B6CF";
            readonly to: "#12b5cb";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Green and Green Party";
            readonly from: "#6AB023";
            readonly to: "#138a52";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Workers Party";
            readonly from: "#b71c1c";
            readonly to: "#a78bfa";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Speaker";
            readonly from: "#333333";
            readonly to: "#708090";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Other";
            readonly from: "#999999";
            readonly to: "dropped; use series-neutral";
        }, {
            readonly copy: "clawd src/utils/constants.js getPartyColor() fallback";
            readonly party: "(unknown party default)";
            readonly from: "#888";
            readonly to: "#475467";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Labour";
            readonly from: "#E4003B";
            readonly to: "#c1121f";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Conservative";
            readonly from: "#0087DC";
            readonly to: "#1d4e89";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Reform UK";
            readonly from: "#12B6CF";
            readonly to: "#12b5cb";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Liberal Democrat and Liberal Democrats";
            readonly from: "#FAA61A";
            readonly to: "#f59e0b";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Green";
            readonly from: "#6AB023";
            readonly to: "#138a52";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Independent";
            readonly from: "#888";
            readonly to: "#888888";
        }];
    };
};
export type Theme = "light" | "dark";
export type SiteKey = keyof typeof tokens.sites;
export type ColourToken = keyof typeof tokens.color.light;
export declare const SITE_KEYS: SiteKey[];
/** The canonical party key for a name as the data holds it: an alias resolves, anything else is kept. */
export declare function partyKey(name: string): string;
/** The one party colour lookup. Aliases resolve to their canonical name first. */
export declare function partyColour(name: string): string;
/** The name a label prints. A verbatim key that carries a spaced hyphen has a display form; others print as given. */
export declare function partyName(name: string): string;
/** Every colour for one theme and site, as plain hex, for renderers that cannot read CSS. */
export declare function palette(theme: Theme, site?: SiteKey): Record<string, string>;
