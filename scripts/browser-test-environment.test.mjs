import { expect, test } from "vitest";
import { browserTestEnvironment } from "./browser-test-environment.mjs";

test("browser builds override production API configuration with their own local origin", () => {
  const source = { VITE_CLOUDFLARE_API_URL: "https://production.example", CI: "1" };
  expect(browserTestEnvironment(4197, source)).toEqual({
    CI: "1",
    VITE_CLOUDFLARE_API_URL: "http://127.0.0.1:4197/__browser-test-api",
  });
  expect(source.VITE_CLOUDFLARE_API_URL).toBe("https://production.example");
});
