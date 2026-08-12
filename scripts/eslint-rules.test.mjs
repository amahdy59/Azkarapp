import { Linter } from "eslint";
import { describe, expect, it } from "vitest";
import { azkarLintRules } from "./eslint-rules.mjs";

function verify(code, rule) {
  const linter = new Linter();
  return linter.verify(code, [
    {
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { azkar: azkarLintRules },
      rules: { [`azkar/${rule}`]: "error" },
    },
  ]);
}

describe("Azkar ESLint guards", () => {
  it("rejects inline Arabic and English conditional copy", () => {
    expect(verify('<p>{isArabic ? "صباح الخير" : "Good morning"}</p>;', "no-inline-bilingual-copy")).toHaveLength(1);
  });

  it("allows direction and locale conditionals", () => {
    expect(verify('const direction = isArabic ? "rtl" : "ltr";', "no-inline-bilingual-copy")).toHaveLength(0);
  });

  it("rejects aria-label on a roleless div but accepts an explicit role", () => {
    expect(verify('<div aria-label="Summary" />;', "no-roleless-aria-label")).toHaveLength(1);
    expect(verify('<div role="region" aria-label="Summary" />;', "no-roleless-aria-label")).toHaveLength(0);
  });
});
