import path from "node:path";
import { build, preview } from "vite";
import { browserTestEnvironment } from "./browser-test-environment.mjs";

// A narrow real-app fixture: production availability, isolated backend and local immutable assets.
const [directory, rawPort] = process.argv.slice(2);
const port = Number(rawPort);
if (!directory || !Number.isInteger(port) || port < 1024)
  throw new Error("Output directory and loopback port required");
Object.assign(process.env, browserTestEnvironment(port));
await build({
  configFile: path.resolve("vite.config.ts"),
  mode: "production",
  define: { __LEARNING_REVIEW__: "false" },
  build: { outDir: directory, emptyOutDir: true },
  logLevel: "warn",
});
const server = await preview({
  configFile: path.resolve("vite.config.ts"),
  build: { outDir: directory },
  preview: { host: "127.0.0.1", port, strictPort: true },
  logLevel: "warn",
});
process.stdout.write(`LEARNING_PRODUCTION_READY http://127.0.0.1:${port}\n`);
const stop = () => server.httpServer.close(() => process.exit(0));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
