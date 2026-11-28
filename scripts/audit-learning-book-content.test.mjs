import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { buildBookContentAudit } from "./audit-learning-book-content.mjs";

describe("available-book source audit", () => {
  it("covers the exact current editions and does not let stale evidence imply approval", () => {
    const saved = JSON.parse(fs.readFileSync("docs/learning/audit/content-audit-2026-11-27.json", "utf8"));
    const current = buildBookContentAudit();
    expect(saved).toEqual(current);
    expect(current.units).toHaveLength(233);
    expect(new Set(current.units.map((unit) => `${unit.book}:${unit.language}:${unit.unitId}`)).size).toBe(233);
    expect(current.originals.map((original) => original.pages)).toEqual([64, 137, 138]);
    expect(current.completion).toBe("incomplete-source-reconciliation");
    expect(current.publication).toBe("held");
    expect(current.units.every((unit) => unit.independentReview === "pending")).toBe(true);
    const umrah = current.units.filter((unit) => unit.book === "dalil-al-mutamir");
    expect(umrah).toHaveLength(32);
    expect(umrah.every((unit) => unit.status === "unresolved-original-mapping" && unit.originalPage === null)).toBe(
      true,
    );
  });
});
