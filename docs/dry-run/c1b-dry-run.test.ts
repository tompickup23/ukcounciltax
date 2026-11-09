/**
 * C1b data dry run. Not part of the suite (docs/ is outside vitest's include). To rerun on
 * a checkout of main with data/raw present: copy this file into tests/ with ../../src/ imports changed to ../src/, run
 * `npx vitest run tests/c1b-dry-run.test.ts`, then delete the copy. It writes
 * docs/C1B-DATA-DRY-RUN.json relative to the working directory.
 */
import { test, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { budget, services } from "../../src/lib/budget";
import { gameData } from "../../src/lib/budget-game-data";
import { national } from "../../src/lib/national-data";
import { loadYear, CURRENT_YEAR } from "../../src/lib/council-tax";
import { loadRegistry } from "../../src/lib/registry";

const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
/** The brief's model: floors, then the remaining pennies to the largest remainders, source order on ties. */
function allocatePence(total: number, shares: number[]): number[] {
  if (!Number.isSafeInteger(total) || total <= 0) throw new Error("total");
  if (!shares.length || shares.some((s) => !Number.isInteger(s) || s < 0 || s > 100) || shares.reduce((a, b) => a + b, 0) !== 100) throw new Error("shares");
  const parts = shares.map((s, i) => { const p = total * s; if (!Number.isSafeInteger(p)) throw new Error("unsafe"); return { i, floor: Math.floor(p / 100), rem: p % 100 }; });
  let left = total - parts.reduce((a, p) => a + p.floor, 0);
  for (const p of [...parts].sort((a, b) => b.rem - a.rem || a.i - b.i)) { if (!left) break; p.floor += 1; left -= 1; }
  return parts.map((p) => p.floor);
}

test("c1b dry run", () => {
  const year = loadYear(CURRENT_YEAR);
  const reg = loadRegistry();
  const billing = Object.keys(year.authorities);
  const all = Object.entries(budget.councils);
  const available = all.filter(([, c]) => c.status === "available");
  const billingAvailable = billing.filter((g) => budget.councils[g]?.status === "available");
  const missing = Object.fromEntries(billing.filter((g) => budget.councils[g]?.status !== "available").map((g) => [g, year.authorities[g].name]));
  const countyOf = billingAvailable.map((g) => budget.councils[g].countyCode).filter(Boolean) as string[];
  const negative = available.filter(([, c]) => services(c).some((r) => r.value !== null && r.value < 0)).length;
  const displayNameDifferences = billingAvailable.filter((g) => budget.councils[g].name !== year.authorities[g].name).length;
  const note = (n: string) => available.filter(([, c]) => c.notes.raPart1.includes(n)).map(([g]) => g);

  // Every available billing council, as the A6 game builds it.
  let maxSplitParts = 0, rounds: Record<string, number> = {}, billParts: Record<string, number> = {}, maxBasePence = 0;
  const problems: string[] = [];
  for (const g of billingAvailable) {
    const reg1 = reg.councils[g];
    const d = gameData(g, reg1.slug, year.authorities[g].name)!;
    rounds[d.rounds.length] = (rounds[d.rounds.length] ?? 0) + 1;
    for (const r of d.rounds.filter((r) => r.kind === "split")) {
      maxSplitParts = Math.max(maxSplitParts, r.items.length);
      if (r.items.length < 2 || r.base! <= 0) problems.push(`${g} split`);
      maxBasePence = Math.max(maxBasePence, r.base! * 100_000);
    }
    const bill = d.rounds.find((r) => r.kind === "bill")!;
    billParts[bill.items.length] = (billParts[bill.items.length] ?? 0) + 1;
    if (bill.items.reduce((s, i) => s + i.value, 0) !== bill.base) problems.push(`${g} bill does not reconcile`);
  }
  const positiveBase = (g: string) => services(budget.councils[g]).filter((r) => r.value !== null && r.value > 0).reduce((s, r) => s + r.value!, 0);
  const anchorIds = ["servicetot", "revenuetot", "ctrtot", "edutot", "eduspc", "asctot", "csctot", "transtot", "grantindsg", "resoth_strt", "resoth_end", "resunall_strt", "resunall_end"];
  const anchors = Object.fromEntries(["E07000117", "E08000025", "E09000033", "E10000017"].map((g) => [g, Object.fromEntries(anchorIds.map((k) => [k, budget.councils[g].values[k]]))]));

  const burnleyServices = allocatePence(positiveBase("E07000117") * 100_000, [60, 40, 0, 0, 0]);
  const burnleyBill = allocatePence(national.components.E07000117.areaPence!, [60, 40, 0, 0]);
  const lancsCounty = allocatePence(positiveBase("E10000017") * 100_000, [50, 50, 0, 0, 0, 0, 0, 0, 0]);
  const out = {
    checkedAt: "2026-11-09",
    base: execSync("git rev-parse HEAD").toString().trim(),
    budgetSha256: sha("data/national/budget.json"),
    nationalSha256: sha("data/national/england.json"),
    fixtureSha256: sha("tests/fixtures/budget-ct-reconciliation.json"),
    rawSha256: Object.fromEntries(["RA_2026-27_data_Part_1.ods", "RA_2026-27_data_Part_2.ods", "SG_2026-27.ods"].map((f) => [f, sha(`data/raw/${f}`)])),
    retained: all.length,
    available: available.length,
    billingAvailable: billingAvailable.length,
    countySections: countyOf.length,
    countyBodies: new Set(countyOf).size,
    negativeServiceBodies: negative,
    displayNameDifferences,
    note4: note("[note 4]"),
    note8: note("[note 8]"),
    missing,
    roundsPerGame: rounds,
    maxSplitParts,
    billRoundParts: billParts,
    largestServiceBasePence: maxBasePence,
    largestServiceBaseTimes100IsSafe: Number.isSafeInteger(maxBasePence * 100),
    problems,
    anchors,
    scenarioPositiveBaseThousands: Object.fromEntries(["E08000025", "E07000117", "E10000017", "E09000033"].map((g) => [g, positiveBase(g)])),
    scenarioTestCases: {
      burnleyServices60_40: burnleyServices,
      burnleyBandD60_40: burnleyBill,
      lancashireCounty50_50: lancsCounty,
      onePennyTie50_50: allocatePence(1, [50, 50]),
    },
  };
  expect(problems).toEqual([]);
  writeFileSync("docs/C1B-DATA-DRY-RUN.json", JSON.stringify(out, null, 2) + "\n");
});
