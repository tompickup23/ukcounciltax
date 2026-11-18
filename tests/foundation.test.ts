import { describe, expect, it } from "vitest";
import {
  deskProblems, recordLineProblems, repeatCap, repeatedCitations, unresolvedAmountProblems, weightCap, WEIGHT_CAP, REPEAT_CAP,
} from "../scripts/lib/foundation.mjs";

const sources = `<section class="page-sources" id="sources" data-page-sources><ol><li id="source-band-d">Full</li></ol></section>`;
const line = (target: string) => `<p class="source-line record-line">MHCLG <a href="https://x">Levels</a>. <a class="record-full" href="#${target}">Full reference</a></p>`;

describe("the record line gate", () => {
  it("passes a record line whose full reference is a Sources entry", () => {
    expect(recordLineProblems(line("source-band-d") + sources)).toEqual([]);
  });
  it("fails a record line pointing nowhere", () => {
    expect(recordLineProblems(line("source-missing") + sources)).toEqual(["a record line points to #source-missing, which is not a Sources entry"]);
  });
  it("fails a record line with no Sources block on the page", () => {
    expect(recordLineProblems(line("source-band-d"))).toHaveLength(1);
  });
  it("fails a record line with no full reference link", () => {
    expect(recordLineProblems(`<p class="source-line record-line">MHCLG</p>${sources}`)).toEqual(["a record line with no full reference link"]);
  });
  it("fails two Sources blocks", () => {
    expect(recordLineProblems(sources + sources)).toContain("2 Sources blocks");
  });
});

describe("the desk gate", () => {
  it("allows one desk band and fails two", () => {
    const desk = `<section class="desk desk--split">x</section>`;
    expect(deskProblems(desk)).toEqual([]);
    expect(deskProblems(desk + desk)).toEqual(["2 desk bands"]);
    expect(deskProblems(desk + `<div class="desk desk--split">y</div>`)).toEqual(["2 desk bands"]);
    expect(deskProblems(desk + `<section class="desk-foot">z</section>`)).toEqual([]);
  });
});

describe("the repeated citation gate", () => {
  const full = `<p class="source-line">Source: <a href="https://x">MHCLG, Council tax levels</a>, Table 9.</p>`;
  it("counts identical full citations and ignores record lines", () => {
    expect(repeatedCitations(full + full + full + line("a") + line("a") + line("a") + line("a")).max).toBe(3);
  });
  it("caps new pages at the ceiling and allows only listed templates more", () => {
    expect(repeatCap("/council-tax/towns/county/lancashire/index.html")).toBe(REPEAT_CAP);
    expect(repeatCap("/councils/pendle/index.html")).toBe(REPEAT_CAP);
    expect(repeatCap("/compare/index.html")).toBe(5);
  });
});

describe("the weight gate", () => {
  it("holds new pages to 500 KB", () => {
    expect(weightCap("/council-tax/towns/county/lancashire/index.html")).toBe(WEIGHT_CAP);
    expect(weightCap("/tools/budget/pendle/set/index.html")).toBe(WEIGHT_CAP);
  });
  it("ratchets the pages that were over when F1 landed", () => {
    expect(weightCap("/council-tax/towns/region/south-west/index.html")).toBeGreaterThan(WEIGHT_CAP);
    expect(weightCap("/tools/budget/pendle/index.html")).toBeGreaterThan(WEIGHT_CAP);
  });
});

describe("the unresolved group row gate", () => {
  it("fails an amount in an unresolved row and passes a blank one", () => {
    expect(unresolvedAmountProblems(`<tr id="E1" data-unresolved><td>£0.00</td></tr>`)).toEqual(["an unresolved group row prints an amount: E1"]);
    expect(unresolvedAmountProblems(`<tr id="E1" data-unresolved><td>Not published</td></tr>`)).toEqual([]);
  });
  it("leaves a published nil in an ordinary row alone", () => {
    expect(unresolvedAmountProblems(`<tr id="E2"><td>£0.00</td></tr>`)).toEqual([]);
  });
});
