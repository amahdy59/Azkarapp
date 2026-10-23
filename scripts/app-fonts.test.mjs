import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("offline Arabic, English, transliteration and symbols retain the pinned font's exact coverage and weights", () => {
  const app = readFileSync("src/styles/fonts.css", "utf8");
  const source = readFileSync("node_modules/@fontsource-variable/noto-sans-arabic/wght.css", "utf8");
  const faces = (css) => [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((match) => match[1]);
  for (const subset of ["arabic", "latin", "latin-ext", "symbols"]) {
    const name = `noto-sans-arabic-${subset}-wght-normal.woff2`;
    const original = faces(source).find((face) => face.includes(name));
    const retained = faces(app).find((face) => face.includes(name));
    expect(retained, name).toBeDefined();
    for (const property of ["unicode-range", "font-weight", "font-style", "font-display"]) {
      const value = (face) => face.match(new RegExp(`${property}:\\s*([^;]+);`))[1].replaceAll(/\s/g, "");
      expect(value(retained), `${name}: ${property}`).toBe(value(original));
    }
  }
  expect(app).not.toContain("noto-sans-arabic-math-wght-normal.woff2");
  expect(app).toContain("amiri-quran-arabic-400-normal.woff2");
});
