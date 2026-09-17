import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = resolve(dirname(scriptPath), "..");

export function inspectToolchain({ nodeVersion, pnpmUserAgent, packageManager, nvmVersion }) {
  const expectedPnpmMatch = /^pnpm@(\d+\.\d+\.\d+)$/.exec(packageManager.trim());
  const expectedNodeMatch = /^v?(\d+)(?:\.\d+\.\d+)?$/.exec(nvmVersion.trim());
  const actualPnpmMatch = /(?:^|\s)pnpm\/(\d+\.\d+\.\d+)(?:\s|$)/.exec(pnpmUserAgent ?? "");
  const actualNodeMatch = /^(\d+)\.\d+\.\d+$/.exec(nodeVersion.trim());
  const errors = [];

  if (!expectedPnpmMatch) {
    errors.push(`package.json must pin packageManager to an exact pnpm version; received "${packageManager}".`);
  } else if (!actualPnpmMatch) {
    errors.push("Run this check through pnpm so its exact version can be verified.");
  } else if (actualPnpmMatch[1] !== expectedPnpmMatch[1]) {
    errors.push(`pnpm ${expectedPnpmMatch[1]} is required; current pnpm is ${actualPnpmMatch[1]}.`);
  }

  if (!expectedNodeMatch) {
    errors.push(`.nvmrc must contain a semantic Node version; received "${nvmVersion.trim()}".`);
  } else if (!actualNodeMatch) {
    errors.push(`Unable to parse the current Node version "${nodeVersion}".`);
  } else if (actualNodeMatch[1] !== expectedNodeMatch[1]) {
    errors.push(`Node ${expectedNodeMatch[1]}.x is required; current Node is ${nodeVersion}.`);
  }

  return {
    errors,
    expectedNodeMajor: expectedNodeMatch?.[1],
    expectedPnpm: expectedPnpmMatch?.[1],
  };
}

function verifyRepositoryToolchain() {
  const packageJson = JSON.parse(readFileSync(resolve(repositoryRoot, "package.json"), "utf8"));
  const nvmVersion = readFileSync(resolve(repositoryRoot, ".nvmrc"), "utf8");
  const result = inspectToolchain({
    nodeVersion: process.versions.node,
    pnpmUserAgent: process.env.npm_config_user_agent,
    packageManager: packageJson.packageManager ?? "",
    nvmVersion,
  });

  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(`ERROR: ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Toolchain verified: Node ${result.expectedNodeMajor}.x and pnpm ${result.expectedPnpm}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) verifyRepositoryToolchain();
