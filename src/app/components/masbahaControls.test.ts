import { expect, it } from "vitest";
import { normalizeDhikrSearch, parseMasbahaTarget } from "./masbahaControls";

it("accepts Arabic, Persian and Western digits only within existing whole-number bounds", () => {
  for (const input of ["٥٠٠", "۵۰۰", " 500 "]) expect(parseMasbahaTarget(input)).toBe(500);
  expect(parseMasbahaTarget("١")).toBe(1);
  expect(parseMasbahaTarget("100000")).toBe(100000);
  for (const input of ["", "0", "٠", "100001", "-1", "1.5", "1e2", "NaN", "Infinity", "1 2"])
    expect(parseMasbahaTarget(input)).toBeNull();
});

it("matches familiar Arabic spellings without modifying reviewed display text", () => {
  const source = "سُبْحَانَ ٱللَّهِ وَبِحَمْدِهِ";
  expect(normalizeDhikrSearch(source)).toBe("سبحان الله وبحمده");
  expect(source).toBe("سُبْحَانَ ٱللَّهِ وَبِحَمْدِهِ");
  expect(normalizeDhikrSearch("  ISTIGHFAR ")).toBe("istighfar");
});
