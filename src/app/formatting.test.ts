import { describe, expect, it } from "vitest";
import { formatNumerals, formatRatio } from "./formatting";

describe("localized number formatting", () => {
  it("keeps Latin numerals in English", () => {
    expect(formatRatio(3, 10, "en")).toBe("3 / 10");
  });

  it("uses Arabic-Indic numerals in Arabic", () => {
    expect(formatNumerals(2026, "ar")).toBe("٢٠٢٦");
  });
});
