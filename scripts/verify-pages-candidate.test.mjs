import { describe, expect, it, vi } from "vitest";
import { verifyPagesCandidate } from "./verify-pages-candidate.mjs";

const sha = "a".repeat(40);
function fixture() {
  return {
    expectedSha: sha,
    readMain: vi.fn().mockResolvedValue(sha),
    hasSuccessfulQuality: vi.fn().mockResolvedValue(false),
    wait: vi.fn().mockResolvedValue(undefined),
  };
}
describe("Pages candidate safety", () => {
  it("recovers delayed successful-Quality visibility while rechecking main", async () => {
    const input = fixture();
    input.hasSuccessfulQuality.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await expect(verifyPagesCandidate(input)).resolves.toBe(sha);
    expect(input.readMain).toHaveBeenCalledTimes(3);
    expect(input.wait).toHaveBeenCalledExactlyOnceWith(10000);
  });
  it("immediately rejects a main change during the visibility wait", async () => {
    const input = fixture();
    input.readMain.mockResolvedValueOnce(sha).mockResolvedValueOnce("b".repeat(40));
    await expect(verifyPagesCandidate(input)).rejects.toThrow("no longer current main");
    expect(input.hasSuccessfulQuality).toHaveBeenCalledTimes(1);
  });
  it("never authorizes a commit without successful Quality after the bounded wait", async () => {
    const input = fixture();
    await expect(verifyPagesCandidate(input)).rejects.toThrow("no successful exact-commit");
    expect(input.readMain).toHaveBeenCalledTimes(6);
    expect(input.wait).toHaveBeenCalledTimes(5);
  });
  it("does not treat an API error as approval", async () => {
    const input = fixture();
    input.hasSuccessfulQuality.mockRejectedValueOnce(new Error("API unavailable"));
    await expect(verifyPagesCandidate(input)).rejects.toThrow("API unavailable");
    expect(input.wait).not.toHaveBeenCalled();
  });
  it("rejects main changing while the successful-Quality lookup completes", async () => {
    const input = fixture();
    input.readMain.mockResolvedValueOnce(sha).mockResolvedValueOnce("b".repeat(40));
    input.hasSuccessfulQuality.mockResolvedValueOnce(true);
    await expect(verifyPagesCandidate(input)).rejects.toThrow("no longer current main");
    expect(input.wait).not.toHaveBeenCalled();
  });
});
