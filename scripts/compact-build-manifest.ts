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
        const referencedKeys = new Set(
          Object.values(parsed).flatMap((entry) => [
            ...(entry.imports ?? []),
            ...(Array.isArray(entry.dynamicImports) ? entry.dynamicImports : []),
          ]),
        );
        const keys = new Map<string, string>();
        let nextKey = 0;
        for (const key of Object.keys(parsed)) {
          if (!key.startsWith("_") && !key.startsWith("node_modules/") && !key.startsWith("src/app/")) continue;
          let compactKey: string;
          do compactKey = `#${(nextKey++).toString(36)}`;
          while (Object.hasOwn(parsed, compactKey));
          keys.set(key, compactKey);
        }
        const compacted: Record<string, ManifestChunk> = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (!value || typeof value !== "object") continue;
          // These files are already addressed by their emitted URLs in CSS/JS.
          // Unreferenced lookup records duplicate those URLs without serving
          // the entry dependency graph. Keep the files themselves: the bundle
          // budget still counts every emitted font and binary on disk.
          if (!value.isEntry && !referencedKeys.has(key) && /\.(?:woff2|bin|css)$/.test(value.file)) continue;
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
        const reaches = (from: string, target: string, seen: Set<string>): boolean => {
          if (seen.has(from)) return false;
          if (from === target) return true;
          seen.add(from);
          return compacted[from]?.imports?.some((next) => reaches(next, target, seen)) ?? false;
        };
        for (const [key, entry] of Object.entries(compacted)) {
          let imports = entry.imports ?? [];
          for (const dependency of [...imports]) {
            const remaining = imports.filter((other) => other !== dependency);
            // Keep every dependency reachable from every record. A path that
            // cycles through this record cannot justify dropping its edge.
            if (remaining.some((other) => reaches(other, dependency, new Set([key])))) imports = remaining;
          }
          if (imports.length) entry.imports = imports;
          else delete entry.imports;
        }
        manifest.source = JSON.stringify(compacted);
      },
    },
  };
}
