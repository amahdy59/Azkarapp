import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";

it("matches all shipped Mushaf pages and bundled fonts to the versioned size catalog", () => {
  const { source, version, pageBytes, fontBytes } = JSON.parse(
    readFileSync("src/app/content/mushafAssetSizes.json", "utf8"),
  );
  expect(pageBytes).toHaveLength(604);
  expect(fontBytes).toHaveLength(604);
  for (let page = 1; page <= 604; page++) {
    expect(pageBytes[page - 1]).toBe(readFileSync(`public/data/mushaf/${page}.json`).byteLength);
    expect(fontBytes[page - 1]).toBeGreaterThanOrEqual(48);
  }
  const bundled = JSON.parse(readFileSync("public/fonts/qcf-v2/2026-10-11/manifest.json", "utf8"));
  for (const font of bundled.fonts) {
    expect(fontBytes[font.page - 1]).toBe(
      readFileSync(`public/fonts/qcf-v2/2026-10-11/p${font.page}.woff2`).byteLength,
    );
  }
  expect(version).toBe(
    createHash("sha256").update(JSON.stringify({ source, pageBytes, fontBytes })).digest("hex").slice(0, 16),
  );
});
