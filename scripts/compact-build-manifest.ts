import type { Plugin } from "vite";
import { Buffer } from "node:buffer";

interface ManifestChunk {
  file: string;
  isEntry?: boolean;
  imports?: string[];
  css?: string[];
  [key: string]: unknown;
}

/**
 * Compacts the build manifest by retaining the production routing and bundle
 * budget graph (entry, files, imports, styles) while omitting dev-only metadata.
 */
export function compactBuildManifest(): Plugin {
  return {
    name: "azkar:compact-build-manifest",
    apply: "build",
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const manifest = bundle[".vite/manifest.json"];
        if (manifest?.type !== "asset") return;
        const source =
          typeof manifest.source === "string" ? manifest.source : Buffer.from(manifest.source).toString("utf8");
        const parsed = JSON.parse(source) as Record<string, ManifestChunk>;
        const compacted: Record<string, ManifestChunk> = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (!value || typeof value !== "object") continue;
          const entry: ManifestChunk = { file: value.file };
          if (value.isEntry) entry.isEntry = true;
          if (Array.isArray(value.imports) && value.imports.length > 0) entry.imports = value.imports;
          if (Array.isArray(value.css) && value.css.length > 0) entry.css = value.css;
          compacted[key] = entry;
        }
        manifest.source = JSON.stringify(compacted);
      },
    },
  };
}
