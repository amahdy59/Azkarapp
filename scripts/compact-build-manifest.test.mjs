import { expect, test } from "vitest";
import { Buffer } from "node:buffer";
import { compactBuildManifest } from "./compact-build-manifest.ts";

test.each([false, true])("compacts build metadata without changing paths, imports or hashes (binary=%s)", (binary) => {
  const data = {
    "src/main.tsx": {
      file: "assets/index-abc.js",
      isEntry: true,
      imports: ["vendor"],
      dynamicImports: ["reader"],
      css: ["assets/style-123.css"],
    },
    reader: { file: "assets/Reader-xyz.js" },
  };
  const pretty = JSON.stringify(data, null, 2);
  const asset = { type: "asset", source: binary ? Buffer.from(pretty) : pretty };
  const unrelated = { type: "asset", source: "{ untouched content }" };
  const plugin = compactBuildManifest();
  expect(plugin.generateBundle.order).toBe("post");
  plugin.generateBundle.handler({}, { ".vite/manifest.json": asset, "content.json": unrelated });
  expect(JSON.parse(asset.source)).toEqual({
    "src/main.tsx": {
      file: "assets/index-abc.js",
      isEntry: true,
      imports: ["vendor"],
      css: ["assets/style-123.css"],
    },
    reader: { file: "assets/Reader-xyz.js" },
  });
  expect(Buffer.byteLength(asset.source)).toBeLessThan(Buffer.byteLength(pretty));
  expect(unrelated.source).toBe("{ untouched content }");
});

test("does nothing when the build has no manifest", () => {
  expect(() => compactBuildManifest().generateBundle.handler({}, {})).not.toThrow();
});
