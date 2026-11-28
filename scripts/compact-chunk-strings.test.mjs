import { runInNewContext } from "node:vm";
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compactChunkStrings, compactChunkStringsPlugin } from "./compact-chunk-strings.ts";

describe("emitted string compaction", () => {
  it("preserves exact Arabic, escaping, object keys and local bindings while reducing bytes", () => {
    const value = 'نص عربي كامل مع علامات التشكيل: السَّلامُ عَلَيْكُمْ \\ "';
    const literal = JSON.stringify(value);
    const code = `"use strict";const _s0="occupied";function read(_s1){return [${literal},${literal},_s1]};result={${literal}:read(_s0),other:${literal}};`;
    const compacted = compactChunkStrings(code);
    const originalContext = { result: null };
    const compactContext = { result: null };
    runInNewContext(code, originalContext);
    runInNewContext(compacted, compactContext);
    expect(JSON.stringify(compactContext.result)).toBe(JSON.stringify(originalContext.result));
    expect(Buffer.byteLength(compacted)).toBeLessThan(Buffer.byteLength(code));
    expect(compacted).toMatch(/^"use strict";/);
    expect(compacted).toContain(`{${literal}:read(_s0)`);
    expect(compacted).toContain("function _s2()");
  });

  it("retains static and dynamic import URLs, export paths and scoped directives", () => {
    const literal = '"./a-long-immutable-module-path.js"';
    const code = `import x from ${literal};export {x} from ${literal};const a=${literal},b=${literal},c=${literal},d=${literal};import(${literal});function strict(){"a-long-directive-that-must-stay";return a}`;
    const compacted = compactChunkStrings(code);
    expect(compacted).toContain(`import x from ${literal}`);
    expect(compacted).toContain(`export {x} from ${literal}`);
    expect(compacted).toContain(`import(${literal})`);
    expect(compacted).toContain('function strict(){"a-long-directive-that-must-stay";');
  });

  it("leaves small, unique, invalid and source-mapped chunks alone", () => {
    expect(compactChunkStrings('const a="short",b="short";')).toBeUndefined();
    expect(compactChunkStrings('const a="one unique sufficiently long value";')).toBeUndefined();
    expect(compactChunkStrings('const a="unfinished')).toBeUndefined();
    expect(
      compactChunkStrings('eval("code");const a="a sufficiently long value",b="a sufficiently long value";'),
    ).toBeUndefined();
    expect(compactChunkStringsPlugin().renderChunk.handler("code", {}, { sourcemap: true })).toBeUndefined();
  });

  it("preserves every value in the real audio catalogues", () => {
    for (const file of ["additionalAudio.data.json", "mushafAudio.data.json"]) {
      const json = readFileSync(`src/app/audio/${file}`, "utf8");
      const code = `result=${json};`;
      const context = { result: null };
      runInNewContext(compactChunkStrings(code) ?? code, context);
      expect(JSON.stringify(context.result)).toBe(JSON.stringify(JSON.parse(json)));
    }
  });

  it("retains named accessor keys and computed-key behavior", () => {
    const literal = '"a sufficiently long property value"';
    const code = `result={get ${literal}(){return ${literal}},[${literal}]:${literal}};`;
    const original = { result: null };
    const compacted = { result: null };
    runInNewContext(code, original);
    runInNewContext(compactChunkStrings(code), compacted);
    expect(JSON.stringify(compacted.result)).toBe(JSON.stringify(original.result));
  });

  it("retains token boundaries around minified return, throw, case, typeof and in", () => {
    const literal = '"a sufficiently long repeated value"';
    const code = `function value(){return${literal}}function fail(){throw${literal}}let caught;try{fail()}catch(e){caught=e}switch(value()){case${literal}:result=[caught,typeof${literal},${literal}in{[${literal}]:true}];break;default:throw Error("wrong case")}`;
    const original = { result: null };
    const compacted = { result: null };
    runInNewContext(code, original);
    runInNewContext(compactChunkStrings(code), compacted);
    expect(JSON.stringify(compacted.result)).toBe(JSON.stringify(original.result));
  });

  it("keeps exported functions callable before module evaluation, as in an import cycle", () => {
    const code =
      'function read(){return"an exact repeated value needed before module evaluation"}function other(){return"an exact repeated value needed before module evaluation"}';
    const original = { result: null };
    const compacted = { result: null };
    runInNewContext(`result=read();${code}`, original);
    runInNewContext(`result=read();${compactChunkStrings(code)}`, compacted);
    expect(compacted.result).toBe(original.result);
  });
});
