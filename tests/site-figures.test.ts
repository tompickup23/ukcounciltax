import { describe, expect, it } from "vitest";
import { billAnatomy } from "../src/vendor/estate-kit/dist/src/index.js";
import { BURNLEY_PARTS, siteFigures } from "../src/lib/figures";

describe("the site figure set", () => {
  const set = siteFigures();

  it("takes the Burnley Band D parts and total from the published schedule", () => {
    expect(BURNLEY_PARTS.map((k) => set.value(`burnley.bandd.${k}`).value)).toEqual([351.44, 1801.75, 292.4, 94.73]);
    expect(set.value("burnley.bandd.total").value).toBe(2540.32);
    expect(set.caption("burnley.bandd.total")).toBe("Source: Burnley Borough Council, Council Tax Charges 2026/27, page 1, 2026/27.");
  });

  it("draws the bill anatomy, which the kit refuses unless the parts add to the total", () => {
    const out = billAnatomy({ set, parts: BURNLEY_PARTS.map((k) => `burnley.bandd.${k}`), total: "burnley.bandd.total", title: "Four bodies charge a Burnley Band D bill" });
    expect(out.svg).toContain("Source: Burnley Borough Council, Council Tax Charges 2026/27");
    expect(out.svg).toContain("2,540.32");
  });

  it("carries the band series A to H and the MHCLG figures with their tables", () => {
    expect(set.series("burnley.bands.unparished").points.map((p) => p.label)).toEqual(["A", "B", "C", "D", "E", "F", "G", "H"]);
    expect(set.series("burnley.bands.unparished").points[3].value).toBe(2540.32);
    expect(set.series("england.area_bandd.history").points[0]).toEqual({ label: "2012/13", value: 1444 });
    expect(set.series("england.area_bandd.history").source.table).toBe("Table 3");
    expect(set.value("england.area_bandd.current").value).toBe(2392);
    expect(set.value("england.area_bandd.current").source.table).toBe("Table 7");
    expect(set.value("burnley.area_bandd.current").value).toBe(2549.42);
  });
});
