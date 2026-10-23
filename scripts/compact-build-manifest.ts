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
 * Generated chunk keys are opaque graph identifiers, not runtime URLs. Intern
 * them once instead of repeating long hashed names in every import list.
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
        const keys = new Map<string, string>();
        let nextKey = 0;
        for (const key of Object.keys(parsed)) {
          if (!key.startsWith("_")) continue;
          let compactKey: string;
          do compactKey = `#${(nextKey++).toString(36)}`;
          while (Object.hasOwn(parsed, compactKey));
          keys.set(key, compactKey);
        }
        const compacted: Record<string, ManifestChunk> = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (!value || typeof value !== "object") continue;
          const entry: ManifestChunk = { file: value.file };
          if (value.isEntry) entry.isEntry = true;
          if (Array.isArray(value.imports) && value.imports.length > 0) {
            // Vite repeats the HTML entry as an import of nearly every lazy
            // chunk. The budget walker already includes index.html explicitly,
            // so retaining these redundant edges only bloats the deployed
            // manifest without changing the dependency graph used by checks.
            const imports = value.imports.filter((key) => key !== "index.html");
            if (imports.length > 0) entry.imports = imports.map((key) => keys.get(key) ?? key);
          }
          if (Array.isArray(value.css) && value.css.length > 0) entry.css = value.css;
          compacted[keys.get(key) ?? key] = entry;
        }
        manifest.source = JSON.stringify(compacted);
      },
    },
  };
}
