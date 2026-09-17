import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";

const nativeRequire = createRequire(import.meta.url);
const ts = nativeRequire("typescript");
const cache = new Map();

function resolveLocalModule(specifier, parentFile) {
  const base = path.resolve(path.dirname(parentFile), specifier);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}.json`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`Cannot resolve ${specifier} from ${parentFile}`);
}

export function loadTypeScriptModule(filePath) {
  const absolutePath = path.resolve(filePath);
  if (cache.has(absolutePath)) return cache.get(absolutePath).exports;
  if (absolutePath.endsWith(".json")) {
    const module = { exports: JSON.parse(fs.readFileSync(absolutePath, "utf8")) };
    cache.set(absolutePath, module);
    return module.exports;
  }

  const source = fs.readFileSync(absolutePath, "utf8");
  const output = ts.transpileModule(source, {
    fileName: absolutePath,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  cache.set(absolutePath, module);
  const localRequire = (specifier) =>
    specifier.startsWith(".")
      ? loadTypeScriptModule(resolveLocalModule(specifier, absolutePath))
      : nativeRequire(specifier);
  const wrapper = vm.runInThisContext(`(function(require,module,exports,__filename,__dirname){${output}\n})`, {
    filename: absolutePath,
  });
  wrapper(localRequire, module, module.exports, absolutePath, path.dirname(absolutePath));
  return module.exports;
}
