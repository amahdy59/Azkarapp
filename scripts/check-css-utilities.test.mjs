import { describe, expect, it } from "vitest";
import { CANARY_UTILITIES, findMissingUtilities } from "./check-css-utilities.mjs";

describe("findMissingUtilities", () => {
  it("reports nothing when every canary is present", () => {
    const css = CANARY_UTILITIES.map(({ selector }) => `${selector}{color:red}`).join("");
    expect(findMissingUtilities(css)).toEqual([]);
  });

  it("reports every canary when the stylesheet is empty", () => {
    expect(findMissingUtilities("")).toHaveLength(CANARY_UTILITIES.length);
  });

  it("accepts a canary Tailwind merged into a shared rule", () => {
    const canaries = [{ selector: ".rounded-sm", reason: "test" }];
    expect(findMissingUtilities(".rounded-md,.rounded-sm{border-radius:8px}", canaries)).toEqual([]);
  });

  it("accepts a canary carrying a pseudo-class or attribute suffix", () => {
    const canaries = [{ selector: ".outline-hidden", reason: "test" }];
    expect(findMissingUtilities(".outline-hidden:focus{outline:none}", canaries)).toEqual([]);
  });

  it("does not accept a longer class that merely starts with the canary name", () => {
    const canaries = [{ selector: ".ps-8", reason: "test" }];
    expect(findMissingUtilities(".ps-80{padding-inline-start:20rem}", canaries)).toEqual(canaries);
  });

  it("escapes CSS-escaped selectors rather than treating them as regex syntax", () => {
    const canaries = [{ selector: ".min-w-\\[8rem\\]", reason: "test" }];
    expect(findMissingUtilities(".min-w-\\[8rem\\]{min-width:8rem}", canaries)).toEqual([]);
    expect(findMissingUtilities(".min-w-8rem{min-width:8rem}", canaries)).toEqual(canaries);
  });
});
