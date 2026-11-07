import { mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";

it("includes untracked working-tree styles and their component consumers", () => {
  const temporaryRoot = realpathSync(tmpdir());
  const directory = mkdtempSync(join(temporaryRoot, "azkar-css-inventory-"));
  const target = resolve(directory);
  if (!target.startsWith(temporaryRoot + sep) || !target.includes("azkar-css-inventory-"))
    throw new Error("Unsafe temporary path");
  try {
    execFileSync("git", ["init", "--quiet"], { cwd: directory });
    mkdirSync(join(directory, "src"));
    writeFileSync(join(directory, "src/deleted.css"), ".deleted-rule { color: green }");
    execFileSync("git", ["add", "src/deleted.css"], { cwd: directory });
    rmSync(join(directory, "src/deleted.css"));
    writeFileSync(join(directory, "src/new.css"), ".new-action { color: red } .unused-action { color: blue }");
    writeFileSync(join(directory, "src/New.tsx"), 'export const New = () => <div className="new-action" />;');
    const report = execFileSync(process.execPath, [fileURLToPath(new URL("./find-unused-css.mjs", import.meta.url))], {
      cwd: directory,
      encoding: "utf8",
    });
    expect(report).toContain("2 classes declared, 1 unreferenced.");
    expect(report).toContain(".unused-action");
    expect(report).not.toContain(".new-action  ←");
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});
