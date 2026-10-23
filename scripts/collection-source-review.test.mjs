import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { expect, test } from "vitest";

const read = (file) => JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
const review = read("../docs/agent/evidence/collection-independent-review-2026-10-18.json");
const previous = read("../docs/agent/evidence/collection-citation-review-2026-10-18.json");

test("reviews every pending original independently of the Home alternative", () => {
  expect(review.entries.map((entry) => entry.id).sort()).toEqual(previous.pending.map((entry) => entry.id).sort());
  expect(new Set(review.entries.map((entry) => entry.id)).size).toBe(20);
  for (const entry of review.entries) {
    expect(entry.wording).toBeTruthy();
    expect(entry.context).toBeTruthy();
    expect(entry.count).toBeTruthy();
    expect(entry.dorarFollowUp.attributedGrade).toBeTruthy();
    expect(new URL(entry.dorarFollowUp.url).hostname).toMatch(/^(dorar\.net|sunnah\.com)$/);
  }
});

test("binds the review to unchanged religious wording and effective benefit overrides", () => {
  for (const snapshot of review.snapshots) {
    const bytes = readFileSync(new URL(`../${snapshot.file}`, import.meta.url));
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(snapshot.sha256);
  }
});
