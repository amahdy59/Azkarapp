import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import { azkarLintRules } from "./scripts/eslint-rules.mjs";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      azkar: azkarLintRules,
      "jsx-a11y": jsxA11y,
      "react-hooks": reactHooks,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["src/app/**/*.tsx"],
    ignores: ["src/app/**/*.test.tsx"],
    rules: {
      "azkar/no-inline-bilingual-copy": "error",
      "azkar/no-roleless-aria-label": "error",
    },
  },
  {
    files: ["src/app/components/AppErrorBoundary.tsx"],
    rules: {
      "azkar/no-inline-bilingual-copy": "off",
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      globals: { console: "readonly", process: "readonly", setTimeout: "readonly" },
    },
  },
);
