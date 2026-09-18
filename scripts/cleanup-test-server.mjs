import { execSync } from "node:child_process";
import os from "node:os";

const PORT = 4173;

function killProcessOnPort(port) {
  try {
    if (os.platform() === "win32") {
      const output = execSync("netstat -ano", { encoding: "utf8" });
      const lines = output.split("\n");
      const listeningPids = new Set();

      for (const line of lines) {
        if (line.includes(`:${port}`) && line.includes("LISTENING")) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(Number(pid))) {
            listeningPids.add(Number(pid));
          }
        }
      }

      for (const pid of listeningPids) {
        if (pid === process.pid) continue;
        try {
          execSync(`taskkill /F /PID ${pid} /T`, { stdio: "ignore" });
          console.log(`[cleanup] Released port ${port} by terminating stale process PID ${pid}.`);
        } catch {
          // Process may have already exited.
        }
      }
    } else {
      try {
        const pids = execSync(`lsof -ti:${port}`, { encoding: "utf8" }).trim().split("\n");
        for (const pidStr of pids) {
          const pid = Number(pidStr.trim());
          if (pid && pid !== process.pid) {
            process.kill(pid, "SIGKILL");
            console.log(`[cleanup] Released port ${port} by terminating stale process PID ${pid}.`);
          }
        }
      } catch {
        // No process on port
      }
    }
  } catch {
    // Non-critical helper, never fail the build.
  }
}

killProcessOnPort(PORT);
