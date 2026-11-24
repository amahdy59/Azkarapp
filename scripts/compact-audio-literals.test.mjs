import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import { expect, test } from "vitest";
import ts from "typescript";
import { transformWithEsbuild } from "vite";
import { compactAudioLiterals } from "./compact-audio-literals.ts";
import { BAQARAH_SURAH } from "../src/app/content/baqarahSurah";

function evaluate(code, require = () => ({ BAQARAH_SURAH })) {
  const compiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function("exports", "require", compiled)(exports, require);
  return exports;
}

test.each(["Core", "Duas"])(
  "emitted %s audio assets retain every exact reviewed value and frozen catalogue",
  (kind) => {
    const id = `/repo/src/app/audio/audioAssets${kind}.ts`;
    const original = readFileSync(`src/app/audio/audioAssets${kind}.ts`, "utf8");
    const result = compactAudioLiterals().transform(original, id);
    expect(Buffer.byteLength(result.code)).toBeLessThan(Buffer.byteLength(original) - 20000);
    const before = evaluate(original),
      after = evaluate(result.code);
    expect(after).toEqual(before);
    expect(Object.isFrozen(Object.values(after)[0])).toBe(true);
  },
);

test("only build-owned audio value literals are interned, preserving syntax and escaped strings", () => {
  const plugin = compactAudioLiterals();
  expect(plugin.apply).toBe("build");
  expect(plugin.transform("export const x = 1", "/src/app/content/reviewed.ts")).toBeUndefined();
  const value = 'Quoted "Arabic: ذِكْر"\n'.repeat(10);
  const code = `const __azkarAudioText = 0; export const data = { first: ${JSON.stringify(value)}, second: ${JSON.stringify(value)}, unique: 'unchanged' };`;
  const transformed = plugin.transform(code, "C:\\repo\\src\\app\\audio\\audioAssetsCore.ts");
  expect(evaluate(transformed.code)).toEqual(evaluate(code));
});

test.each(["A repeated recording label for listeners", "Recording edition"])(
  "repeated labels are shared without changing %s",
  (value) => {
    const code = `export const data = { first: ${JSON.stringify(value)}, second: ${JSON.stringify(value)}, short: 'unchanged' };`;
    const transformed = compactAudioLiterals().transform(code, "/repo/src/app/audio/audioAssetsCore.ts");
    expect(transformed.code.split(value)).toHaveLength(2);
    expect(evaluate(transformed.code)).toEqual(evaluate(code));
  },
);

test("emitted Azkar data preserves the exact reviewed draft and its collection order", () => {
  const id = "/repo/src/app/content/azkarCore.ts";
  const original = readFileSync("src/app/content/azkarCore.ts", "utf8");
  const result = compactAudioLiterals().transform(original, id);
  const dependencies = {
    "./fastingRamadan": { FASTING_RAMADAN_AZKAR: [] },
    "./inPrayerSupplications": { IN_PRAYER_AZKAR: [] },
    "./contentReview": { applyContentReview: (drafts) => drafts },
  };
  const before = evaluate(original, (name) => dependencies[name]);
  const after = evaluate(result.code, (name) => dependencies[name]);
  expect(Buffer.byteLength(result.code)).toBeLessThan(Buffer.byteLength(original) - 25_000);
  for (const [name, data] of Object.entries(before)) {
    if (typeof data !== "function") expect(after[name], name).toEqual(data);
  }
});

test("frequent short metadata is shared but low-frequency tiny strings stay literal", () => {
  const values = Array.from({ length: 30 }, (_, index) => ({
    id: `unique-${index}`,
    reviewStatus: "approved",
    mimeType: "audio/mpeg",
    kind: "single",
  }));
  const original = `export const assets = ${JSON.stringify(values)};`;
  const result = compactAudioLiterals().transform(original, "/repo/src/app/audio/audioAssetsCore.ts");
  expect(evaluate(result.code)).toEqual(evaluate(original));
  expect(result.code.match(/"approved"/g)).toHaveLength(1);
  expect(
    compactAudioLiterals().transform('export const data = {a:"one",b:"one"}', "/repo/src/app/audio/audioAssetsCore.ts"),
  ).toBeUndefined();
});

test.each(["ar", "en"])("emitted %s interface copy retains every exact localized value", async (language) => {
  const original = readFileSync(`src/app/i18n/${language}.ts`, "utf8");
  const result = compactAudioLiterals().transform(original, `/repo/src/app/i18n/${language}.ts`);
  expect(result).toBeDefined();
  expect(evaluate(result.code)).toEqual(evaluate(original));
  const [before, after] = await Promise.all([
    transformWithEsbuild(original, `${language}.ts`, { minify: true }),
    transformWithEsbuild(result.code, `${language}.ts`, { minify: true }),
  ]);
  expect(Buffer.byteLength(after.code)).toBeLessThan(Buffer.byteLength(before.code));
});
