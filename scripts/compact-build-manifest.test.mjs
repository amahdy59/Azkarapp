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

test("removes redundant index entry imports while retaining the entry", () => {
  const data = {
    "index.html": { file: "assets/index.js", isEntry: true },
    "src/main.tsx": { file: "assets/main.js", imports: ["index.html", "vendor"] },
    vendor: { file: "assets/vendor.js" },
  };
  const asset = { type: "asset", source: JSON.stringify(data) };

  compactBuildManifest().generateBundle.handler({}, { ".vite/manifest.json": asset });

  const compacted = JSON.parse(asset.source);
  expect(compacted["index.html"]).toEqual(data["index.html"]);
  expect(compacted["src/main.tsx"].imports).toEqual(["vendor"]);
});

test("interns generated keys without changing the complete file dependency graph or source entries", () => {
  const generated = "_a-very-long-generated-chunk-name-abc123.js";
  const data = {
    "index.html": { file: "assets/index.js", isEntry: true, imports: [generated, "external"] },
    [generated]: { file: "assets/shared-abc123.js", imports: ["#0"], css: ["assets/shared.css"] },
    "#0": { file: "assets/retained.js", imports: [generated] },
    "src/Reader.tsx": { file: "assets/reader.js", imports: [generated] },
  };
  const asset = { type: "asset", source: JSON.stringify(data) };
  compactBuildManifest().generateBundle.handler({}, { ".vite/manifest.json": asset });
  const compacted = JSON.parse(asset.source);
  const graph = (manifest) =>
    Object.values(manifest)
      .map((entry) => ({
        ...entry,
        imports: entry.imports?.map((key) => manifest[key]?.file ?? key),
      }))
      .sort((a, b) => a.file.localeCompare(b.file));
  expect(graph(compacted)).toEqual(graph(data));
  expect(compacted["index.html"].isEntry).toBe(true);
  expect(compacted["src/Reader.tsx"].file).toBe(data["src/Reader.tsx"].file);
  expect(compacted["#0"].file).toBe(data["#0"].file);
  expect(compacted).not.toHaveProperty(generated);
  expect(Object.keys(compacted)).toHaveLength(Object.keys(data).length);
  expect(Buffer.byteLength(asset.source)).toBeLessThan(Buffer.byteLength(JSON.stringify(data)));
});
