import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import { expect, test } from "vitest";
import ts from "typescript";
import { compactAudioLiterals } from "./compact-audio-literals.ts";
import { BAQARAH_SURAH } from "../src/app/content/baqarahSurah";

function evaluate(code) {
  const compiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function("exports", "require", compiled)(exports, () => ({ BAQARAH_SURAH }));
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
