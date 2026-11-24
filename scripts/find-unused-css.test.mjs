import { mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";

it.each([false, true])("includes untracked styles in an isolated repository (hook environment: %s)", (hook) => {
  // Git hooks export repository-local variables. Fixture commands must own the
  // temporary repository, including when this test runs inside pre-push.
  const fixtureEnv = { ...process.env, ...(hook ? { GIT_DIR: "/parent-repository/.git" } : {}) };
  const localVariables = execFileSync("git", ["rev-parse", "--local-env-vars"], { encoding: "utf8" });
  for (const name of localVariables.trim().split(/\r?\n/)) delete fixtureEnv[name];
  const temporaryRoot = realpathSync(tmpdir());
  const directory = mkdtempSync(join(temporaryRoot, "azkar-css-inventory-"));
  const target = resolve(directory);
  if (!target.startsWith(temporaryRoot + sep) || !target.includes("azkar-css-inventory-"))
    throw new Error("Unsafe temporary path");
  try {
    execFileSync("git", ["init", "--quiet"], { cwd: directory, env: fixtureEnv });
    mkdirSync(join(directory, "src"));
    writeFileSync(join(directory, "src/deleted.css"), ".deleted-rule { color: green }");
    execFileSync("git", ["add", "src/deleted.css"], { cwd: directory, env: fixtureEnv });
    rmSync(join(directory, "src/deleted.css"));
    writeFileSync(join(directory, "src/new.css"), ".new-action { color: red } .unused-action { color: blue }");
    writeFileSync(join(directory, "src/New.tsx"), 'export const New = () => <div className="new-action" />;');
    const report = execFileSync(process.execPath, [fileURLToPath(new URL("./find-unused-css.mjs", import.meta.url))], {
      cwd: directory,
      env: fixtureEnv,
      encoding: "utf8",
    });
    expect(report).toContain("2 classes declared, 1 unreferenced.");
    expect(report).toContain(".unused-action");
    expect(report).not.toContain(".new-action  ←");
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});
