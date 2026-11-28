import ts from "typescript";
import { Buffer } from "node:buffer";
import type { Plugin } from "vite";

/** Intern repeated emitted literals without changing source data or public URLs. */
export function compactChunkStrings(code: string): string | undefined {
  const source = ts.createSourceFile("chunk.js", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  // TypeScript exposes parse diagnostics at runtime, outside SourceFile's public type.
  const diagnostics = (source as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] }).parseDiagnostics;
  if (diagnostics.length) return;
  const identifiers = new Set<string>();
  const candidates = new Map<string, ts.StringLiteral[]>();
  let hasEval = false;
  function visit(node: ts.Node) {
    if (ts.isIdentifier(node)) identifiers.add(node.text);
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "eval")
      hasEval = true;
    if (ts.isStringLiteral(node)) {
      const parent = node.parent;
      const key =
        (ts.isPropertyAssignment(parent) ||
          ts.isMethodDeclaration(parent) ||
          ts.isPropertyDeclaration(parent) ||
          ts.isGetAccessorDeclaration(parent) ||
          ts.isSetAccessorDeclaration(parent)) &&
        parent.name === node;
      const module =
        ts.isImportDeclaration(parent) ||
        ts.isExportDeclaration(parent) ||
        ts.isImportSpecifier(parent) ||
        ts.isExportSpecifier(parent) ||
        (ts.isCallExpression(parent) && parent.expression.kind === ts.SyntaxKind.ImportKeyword);
      // Directives must remain literal expression statements in their scope.
      if (!key && !module && !ts.isExpressionStatement(parent)) {
        const literal = node.getText(source);
        if (literal.length >= 20) {
          const occurrences = candidates.get(literal) ?? [];
          occurrences.push(node);
          candidates.set(literal, occurrences);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (hasEval) return;
  let next = 0;
  const declarations: string[] = [];
  const replacements: { start: number; end: number; name: string }[] = [];
  for (const [literal, nodes] of candidates) {
    if (nodes.length < 2) continue;
    let name: string;
    do name = `_s${(next++).toString(36)}`;
    while (identifiers.has(name));
    // Count UTF-8 bytes, including the declaration and every replacement.
    if ((nodes.length - 1) * Buffer.byteLength(literal) <= nodes.length * (name.length + 4) + name.length + 24)
      continue;
    // Hoisted literal getters remain usable when an import cycle calls an
    // exported function before this module body runs. A const pool adds a TDZ.
    declarations.push(`function ${name}(){return ${literal}}`);
    for (const node of nodes) replacements.push({ start: node.getStart(source), end: node.end, name: `${name}()` });
  }
  if (!replacements.length) return;
  for (const { start, end, name } of replacements.sort((a, b) => b.start - a.start))
    // Quotes separate tokens in minified code: return"text" / "text"in obj.
    code = code.slice(0, start) + ` ${name} ` + code.slice(end);
  let insertion = 0;
  for (const statement of source.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) break;
    insertion = statement.end;
  }
  return `${code.slice(0, insertion)};${declarations.join("")}${code.slice(insertion)}`;
}

export function compactChunkStringsPlugin(): Plugin {
  return {
    name: "azkar:compact-chunk-strings",
    apply: "build",
    enforce: "post",
    renderChunk: {
      order: "post",
      handler(code, _chunk, options) {
        // Keep source maps authoritative for diagnostic builds.
        if (options.sourcemap) return;
        const compacted = compactChunkStrings(code);
        return compacted ? { code: compacted, map: null } : undefined;
      },
    },
  };
}
