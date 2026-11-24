import type { Plugin } from "vite";
import ts from "typescript";
import { Buffer } from "node:buffer";

/** Share identical repeated values in emitted code; reviewed authoring data stays intact. */
export function compactAudioLiterals(): Plugin {
  return {
    name: "azkar:compact-audio-literals",
    apply: "build",
    enforce: "pre",
    transform(code, id) {
      if (
        !/\/src\/app\/(?:audio\/audioAssets(?:Core|Duas)|content\/azkarCore|i18n\/(?:ar|en))\.ts$/.test(
          id.replaceAll("\\", "/"),
        )
      )
        return;
      const source = ts.createSourceFile(id, code, ts.ScriptTarget.Latest, true);
      const values = new Map<string, { start: number; end: number }[]>();
      const visit = (node: ts.Node) => {
        if (
          ts.isStringLiteral(node) &&
          ts.isPropertyAssignment(node.parent) &&
          node.parent.initializer === node &&
          Buffer.byteLength(node.text) > 2
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
        // Allow frequent short metadata too, but require a net saving after
        // a conservative four-byte minified identifier and declaration cost.
        if (
          Buffer.byteLength(value) <= 16 &&
          (occurrences.length - 1) * Buffer.byteLength(JSON.stringify(value)) - 4 * occurrences.length - 12 <= 0
        )
          continue;
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
