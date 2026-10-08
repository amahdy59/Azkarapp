import { expect, it } from "vitest";
import { validTimingApproval } from "./timingApproval";

const preview = {
  reviewStatus: "owner-preview" as const,
  source: "exact model evidence",
  authoredBy: "Model",
  reviewedBy: "",
  reviewedAt: "",
  acceptedBy: "Owner",
  acceptedAt: "2026-10-08",
};
it("requires explicit dated owner acceptance without misrepresenting full listening review", () => {
  expect(validTimingApproval(preview)).toBe(true);
  for (const changed of [
    { acceptedBy: "" },
    { acceptedAt: "2026-02-31" },
    { acceptedBy: "Model" },
    { reviewedBy: "Owner" },
    { reviewedAt: "2026-10-08" },
    { source: "" },
  ])
    expect(validTimingApproval({ ...preview, ...changed })).toBe(false);
  expect(validTimingApproval({ ...preview, reviewStatus: "approved" })).toBe(false);
});
