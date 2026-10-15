import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";

const task = process.argv[2];
if (!["assembleDebug", "bundleRelease", "lintDebug", "testDebugUnitTest"].includes(task)) {
  throw new Error("Choose assembleDebug, bundleRelease, lintDebug or testDebugUnitTest");
}
const windows = process.platform === "win32";
const result = spawnSync(
  windows ? "gradlew.bat" : "bash",
  windows ? [task, "--no-daemon"] : ["gradlew", task, "--no-daemon"],
  {
    cwd: fileURLToPath(new URL("../android/", import.meta.url)),
    stdio: "inherit",
    shell: windows,
  },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
