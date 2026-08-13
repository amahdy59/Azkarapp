import { spawnSync } from "node:child_process";

const insideWorkTree = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
});

if (insideWorkTree.status !== 0 || insideWorkTree.stdout.trim() !== "true") {
  console.log("Git hooks not configured: this install is not inside a Git worktree.");
  process.exit(0);
}

const configured = spawnSync("git", ["config", "core.hooksPath", ".githooks"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

if (configured.status !== 0) {
  console.error(configured.stderr.trim() || "Unable to configure the repository Git hooks.");
  process.exit(configured.status ?? 1);
}

console.log("Configured Git to use the tracked .githooks directory.");
