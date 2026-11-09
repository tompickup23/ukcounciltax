// Generated from tokens/tokens.json by scripts/build-tokens.mjs. Do not hand edit: run npm run tokens.
export const VERSION = "0.2.0";
export const tokens = {
    "color": {
        "light": {
            "bg": "#ffffff",
            "bg-subtle": "#f5f6f7",
            "bg-card": "#ffffff",
            "border": "#dbdfe3",
            "border-strong": "#c2c8ce",
            "text": "#171b1f",
            "text-muted": "#545c63",
            "text-faint": "#616970",
            "ground": "#0f1317",
            "ground-ink": "#f4f6f7",
            "ground-muted": "#98a3ac",
            "accent-ink": "#ffffff",
            "positive": "#1f6f4f",
            "warning": "#8a5a10",
            "critical": "#b42318",
            "series-1": "#166ea5",
            "series-2": "#b6550f",
            "series-3": "#6e24da",
            "series-4": "#9d1c5c",
            "series-neutral": "#6b7280",
            "series-neutral-soft": "#8b939c",
            "tooltip-bg": "#111827",
            "tooltip-fg": "#ffffff"
        },
        "dark": {
            "bg": "#0f1317",
            "bg-subtle": "#171c21",
            "bg-card": "#141a1f",
            "border": "#2a3138",
            "border-strong": "#3d464e",
            "text": "#f4f6f7",
            "text-muted": "#b6c0c8",
            "text-faint": "#98a3ac",
            "ground": "#05080a",
            "ground-ink": "#f4f6f7",
            "ground-muted": "#98a3ac",
            "accent-ink": "#0f1317",
            "positive": "#6fcf9a",
            "warning": "#f0b03e",
            "critical": "#f2857a",
            "series-1": "#5599cc",
            "series-2": "#cf7a48",
            "series-3": "#966bfe",
            "series-4": "#f83b9b",
            "series-neutral": "#9aa2ab",
            "series-neutral-soft": "#7b838c",
            "tooltip-bg": "#e6edf3",
            "tooltip-fg": "#0d1117"
        }
    },
    "sites": {
        "ukdemographics": {
            "deep": "#4338ca",
            "bright": "#7b74f2",
            "wash": "#eeeefc",
            "darkWash": "#1c1b3a",
            "name": "UK Demographics",
            "domain": "ukdemographics.co.uk"
        },
        "ukelections": {
            "deep": "#6b5334",
            "bright": "#e3d9c3",
            "wash": "#f6f2ea",
            "darkWash": "#221d14",
            "name": "UK Elections",
            "domain": "ukelections.co.uk"
        },
        "ukfoodhygiene": {
            "deep": "#1f5c4a",
            "bright": "#3fb492",
            "wash": "#edf6f3",
            "darkWash": "#0e2620",
            "name": "UK Food Hygiene Ratings",
            "domain": "ukfoodhygiene.co.uk"
        },
        "ukschoolholidaydates": {
            "deep": "#8a5a10",
            "bright": "#f0b03e",
            "wash": "#fdf3e3",
            "darkWash": "#2b1f0c",
            "name": "UK School Holiday Dates",
            "domain": "ukschoolholidaydates.co.uk"
        },
        "asylumstats": {
            "deep": "#2f5773",
            "bright": "#82abcb",
            "wash": "#eef3f7",
            "darkWash": "#122430",
            "name": "Asylum Stats",
            "domain": "asylumstats.co.uk"
        },
        "aidoge": {
            "deep": "#1c6e8a",
            "bright": "#63c3dc",
            "wash": "#e4eff4",
            "darkWash": "#123441",
            "name": "AI DOGE",
            "domain": "aidoge.co.uk"
        },
        "ukcounciltax": {
            "deep": "#23664f",
            "bright": "#94d7b5",
            "wash": "#edf6f0",
            "darkWash": "#112d25",
            "name": "UK Council Tax",
            "domain": "ukcounciltax.co.uk"
        }
    },
    "font": {
        "display": {
            "family": "Source Serif 4",
            "stack": "\"Source Serif 4\", Georgia, \"Times New Roman\", serif",
            "weights": [
                600
            ],
            "files": {
                "600": "fonts/SourceSerif4-SemiBold.ttf"
            }
        },
        "sans": {
            "family": "Source Sans 3",
            "stack": "\"Source Sans 3\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
            "weights": [
                400,
                600
            ],
            "files": {
                "400": "fonts/SourceSans3-Regular.ttf",
                "600": "fonts/SourceSans3-SemiBold.ttf"
            }
        }
    },
    "text": {
        "xs": "0.78rem",
        "sm": "0.875rem",
        "base": "1.0625rem",
        "md": "1.1875rem",
        "lg": "clamp(1.3rem, 1.16rem + 0.62vw, 1.6rem)",
        "xl": "clamp(1.65rem, 1.36rem + 1.28vw, 2.3rem)",
        "2xl": "clamp(2rem, 1.55rem + 2vw, 3rem)"
    },
    "space": {
        "2xs": "0.25rem",
        "xs": "0.5rem",
        "sm": "0.75rem",
        "md": "1rem",
        "lg": "1.5rem",
        "xl": "2rem",
        "2xl": "3rem",
        "3xl": "4.5rem"
    },
    "radius": {
        "radius": "10px",
        "radius-sm": "6px"
    },
    "shadow": {
        "light": {
            "shadow-soft": "0 1px 2px rgba(23, 27, 31, 0.05)",
            "shadow": "0 1px 2px rgba(23, 27, 31, 0.06), 0 8px 24px rgba(23, 27, 31, 0.06)"
        },
        "dark": {
            "shadow-soft": "0 1px 2px rgba(0, 0, 0, 0.4)",
            "shadow": "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.32)"
        }
    },
    "ramp": {
        "about": "Map ramps, drawn on the estate ground in every theme, as the UK Demographics maps are. Ported unchanged from ukdemographics src/lib/map/indicators.ts (SEQUENTIAL, DIVERGING) and src/lib/map/render.ts (na, naStripe, context), origin/main, 4 November 2026. Fixed classes: a colour always means the same value.",
        "ground": "#0f1317",
        "sequential": [
            "#25233e",
            "#2e2b5c",
            "#39357b",
            "#46419c",
            "#5751be",
            "#6d66de",
            "#8c86f5"
        ],
        "diverging": [
            "#b0703a",
            "#7a5636",
            "#6e747a",
            "#3b3878",
            "#524dad",
            "#7b74f2",
            "#b9b5f9"
        ],
        "na": "#2a3038",
        "naStripe": "#4b535c",
        "context": "#1b2229",
        "ink": "#f4f6f7",
        "muted": "#98a3ac"
    },
    "party": {
        "default": "#475467",
        "colours": {
            "Labour": "#c1121f",
            "Conservative": "#1d4e89",
            "Reform UK": "#12b5cb",
            "Liberal Democrats": "#f59e0b",
            "Green Party": "#138a52",
            "SNP": "#fdf24e",
            "Plaid Cymru": "#3f9c35",
            "Independent": "#888888",
            "Workers Party of Britain": "#a78bfa",
            "SDP": "#8c1f3a",
            "Restore Britain": "#0f2545",
            "DUP": "#d46a4c",
            "Sinn Féin": "#326760",
            "SDLP": "#2aa82c",
            "Alliance": "#f6cb2f",
            "UUP": "#48a5ee",
            "Traditional Unionist Voice \u002d TUV": "#0c3a6a",
            "Speaker seeking re-election": "#708090",
            "Our West Lancashire": "#5DADE2",
            "UKIP": "#70147A",
            "BNP": "#2D2D86",
            "No Overall Control": "#888888"
        },
        "aliases": {
            "Workers Party": "Workers Party of Britain",
            "Green": "Green Party",
            "Liberal Democrat": "Liberal Democrats",
            "Lib Dem": "Liberal Democrats",
            "Labour & Co-operative Party": "Labour",
            "Labour & Co-operative": "Labour",
            "Labour and Co-operative": "Labour",
            "Labour (Co-op)": "Labour",
            "Lab & Co-op": "Labour",
            "Our West Lancs": "Our West Lancashire",
            "Speaker": "Speaker seeking re-election",
            "TUV": "Traditional Unionist Voice \u002d TUV"
        },
        "display": {
            "Traditional Unionist Voice \u002d TUV": "Traditional Unionist Voice (TUV)"
        },
        "notes": [
            "Every value is the one ukelections uses in src/lib/predictions.ts partyColour(), read from origin/main on 4 November 2026, except four that ukelections does not carry: Our West Lancashire, UKIP, BNP and No Overall Control, which keep the clawd src/utils/constants.js value.",
            "The Traditional Unionist Voice key is the party name exactly as ukelections stores it, so a lookup matches the data; its hyphen is written as a JSON escape so the verbatim name passes the dash check. It is for lookup only: display gives the name a label prints, Traditional Unionist Voice (TUV), and TUV is an alias.",
            "Other (#999999 in clawd) is dropped: a residual bucket takes series-neutral, never a party colour."
        ],
        "changes": [
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Conservative",
                "from": "#0087dc",
                "to": "#1d4e89"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Labour",
                "from": "#dc241f",
                "to": "#c1121f"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Liberal Democrats",
                "from": "#faa61a",
                "to": "#f59e0b"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Reform UK",
                "from": "#12b6cf",
                "to": "#12b5cb"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Green (key renamed Green Party, Green kept as an alias)",
                "from": "#6ab023",
                "to": "#138a52"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "SNP",
                "from": "#ffff00",
                "to": "#fdf24e"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Plaid Cymru",
                "from": "#008142",
                "to": "#3f9c35"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Independent",
                "from": "#800080",
                "to": "#888888"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "(unknown party default)",
                "from": "#8e8e93",
                "to": "#475467"
            },
            {
                "copy": "asylumstats src/components/MpCard.astro",
                "party": "the same nine changes as ukdemographics MpCard.astro, whose map it copies exactly",
                "from": "as above",
                "to": "as above"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Labour and its five Co-operative aliases",
                "from": "#DC241F",
                "to": "#c1121f"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Conservative",
                "from": "#0087DC",
                "to": "#1d4e89"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Liberal Democrats and Lib Dem",
                "from": "#FAA61A",
                "to": "#f59e0b"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Reform UK",
                "from": "#12B6CF",
                "to": "#12b5cb"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Green and Green Party",
                "from": "#6AB023",
                "to": "#138a52"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Workers Party",
                "from": "#b71c1c",
                "to": "#a78bfa"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Speaker",
                "from": "#333333",
                "to": "#708090"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Other",
                "from": "#999999",
                "to": "dropped; use series-neutral"
            },
            {
                "copy": "clawd src/utils/constants.js getPartyColor() fallback",
                "party": "(unknown party default)",
                "from": "#888",
                "to": "#475467"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Labour",
                "from": "#E4003B",
                "to": "#c1121f"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Conservative",
                "from": "#0087DC",
                "to": "#1d4e89"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Reform UK",
                "from": "#12B6CF",
                "to": "#12b5cb"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Liberal Democrat and Liberal Democrats",
                "from": "#FAA61A",
                "to": "#f59e0b"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Green",
                "from": "#6AB023",
                "to": "#138a52"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Independent",
                "from": "#888",
                "to": "#888888"
            }
        ]
    }
};
export const SITE_KEYS = Object.keys(tokens.sites);
/** The canonical party key for a name as the data holds it: an alias resolves, anything else is kept. */
export function partyKey(name) {
    return tokens.party.aliases[name] ?? name;
}
/** The one party colour lookup. Aliases resolve to their canonical name first. */
export function partyColour(name) {
    return tokens.party.colours[partyKey(name)] ?? tokens.party.default;
}
/** The name a label prints. A verbatim key that carries a spaced hyphen has a display form; others print as given. */
export function partyName(name) {
    return tokens.party.display[partyKey(name)] ?? name;
}
/** Every colour for one theme and site, as plain hex, for renderers that cannot read CSS. */
export function palette(theme, site = "ukdemographics") {
    const s = tokens.sites[site];
    const accent = theme === "light"
        ? { accent: s.deep, "accent-bright": s.bright, "accent-wash": s.wash }
        : { accent: s.bright, "accent-bright": s.bright, "accent-wash": s.darkWash };
    return { ...tokens.color[theme], ...accent };
}
