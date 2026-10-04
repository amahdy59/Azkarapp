import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { browserTestPort } from "./browser-test-port.mjs";

const require = createRequire(import.meta.url);
const vite = path.join(path.dirname(require.resolve("vite/package.json")), "bin/vite.js");

async function run(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [vite, ...args], { stdio: "inherit" });
    const interrupt = () => child.kill("SIGINT");
    const terminate = () => child.kill("SIGTERM");
    process.on("SIGINT", interrupt);
    process.on("SIGTERM", terminate);
    const cleanup = () => {
      process.off("SIGINT", interrupt);
      process.off("SIGTERM", terminate);
    };
    child.once("error", (error) => {
      cleanup();
      reject(error);
    });
    child.once("exit", (code, signal) => {
      cleanup();
      if (code === 0) resolve();
      else reject(new Error(`Vite exited with ${signal ?? code}.`));
    });
  });
}

try {
  const port = browserTestPort();
  await run(["build", "--outDir", ".playwright-dist"]);
  await run(["preview", "--outDir", ".playwright-dist", "--host", "127.0.0.1", "--port", String(port), "--strictPort"]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
