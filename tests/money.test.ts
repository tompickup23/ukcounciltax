import { describe, expect, it } from "vitest";
import { formatMoney, inPounds } from "../src/lib/money";

describe("the money formatter", () => {
  it("prints pounds and pence for a pounds source", () => {
    expect(formatMoney(2345.678)).toBe("£2,345.68");
    expect(formatMoney(0)).toBe("£0.00");
    expect(formatMoney(-12.5)).toBe("-£12.50");
  });

  it("prints pence held as integers", () => {
    expect(formatMoney(234567, { unit: "pence" })).toBe("£2,345.67");
    expect(formatMoney(234567, { unit: "pence", style: "whole" })).toBe("£2,346");
  });

  it("never prints pence for a £ thousand source", () => {
    expect(formatMoney(366008, { unit: "thousands" })).toBe("£366,008,000");
    expect(formatMoney(366008, { unit: "thousands", style: "exact" })).not.toMatch(/\.\d\d$/);
  });

  it("prints £ million and £ billion to one decimal in the compact style", () => {
    expect(formatMoney(366008, { unit: "thousands", style: "compact" })).toBe("£366.0m");
    expect(formatMoney(22_600_898.51, { style: "compact" })).toBe("£22.6m");
    expect(formatMoney(1_234_000, { unit: "thousands", style: "compact" })).toBe("£1.2bn");
    expect(formatMoney(-4_250, { unit: "thousands", style: "compact" })).toBe("-£4.3m");
    expect(formatMoney(512, { unit: "thousands", style: "compact" })).toBe("£512,000");
  });

  it("does not print £1,000.0m at the edge of a billion", () => {
    expect(formatMoney(999_960_000, { style: "compact" })).toBe("£1.0bn");
    expect(formatMoney(999_940_000, { style: "compact" })).toBe("£999.9m");
  });

  it("prints a missing value as missing, never as zero", () => {
    expect(formatMoney(null)).toBe("n/a");
    expect(formatMoney(undefined, { missing: "Not published" })).toBe("Not published");
    expect(formatMoney(Number.NaN)).toBe("n/a");
  });

  it("converts units", () => {
    expect(inPounds(150, "pence")).toBe(1.5);
    expect(inPounds(2, "thousands")).toBe(2000);
  });
});
