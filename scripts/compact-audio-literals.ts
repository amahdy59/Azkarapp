import type { Plugin } from "vite";
import ts from "typescript";
import { Buffer } from "node:buffer";

/** Share identical long values in emitted code; reviewed authoring data stays intact. */
export function compactAudioLiterals(): Plugin {
  return {
    name: "azkar:compact-audio-literals",
    apply: "build",
    enforce: "pre",
    transform(code, id) {
      if (!/\/src\/app\/audio\/audioAssets(?:Core|Duas)\.ts$/.test(id.replaceAll("\\", "/"))) return;
      const source = ts.createSourceFile(id, code, ts.ScriptTarget.Latest, true);
      const values = new Map<string, { start: number; end: number }[]>();
      const visit = (node: ts.Node) => {
        if (
          ts.isStringLiteral(node) &&
          ts.isPropertyAssignment(node.parent) &&
          node.parent.initializer === node &&
          Buffer.byteLength(node.text) > 80
        ) {
          const occurrences = values.get(node.text) ?? [];
          occurrences.push({ start: node.getStart(source), end: node.end });
          values.set(node.text, occurrences);
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
      const edits: { start: number; end: number; name: string }[] = [];
      const declarations: string[] = [];
      let prefix = "__azkarAudioText";
      while (code.includes(prefix)) prefix += "_";
      for (const [value, occurrences] of values) {
        if (occurrences.length < 2) continue;
        const name = `${prefix}${declarations.length}`;
        declarations.push(`const ${name} = ${JSON.stringify(value)};`);
        edits.push(...occurrences.map((occurrence) => ({ ...occurrence, name })));
      }
      if (!edits.length) return;
      let compacted = code;
      for (const { start, end, name } of edits.sort((a, b) => b.start - a.start))
        compacted = compacted.slice(0, start) + name + compacted.slice(end);
      return { code: declarations.join("\n") + "\n" + compacted, map: null };
    },
  };
}
