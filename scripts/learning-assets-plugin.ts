import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import type { Plugin, Connect } from "vite";

/** Local serving only. Optional publications never become installation assets. */
export function learningAssetsPlugin(): Plugin {
  const directory = path.resolve("docs/learning/assets");
  const middleware: Connect.NextHandleFunction = (request, response, next) => {
    const name = request.url
      ?.split("?")[0]
      ?.match(/^\/__learning-assets__\/([a-f0-9]{64}\.(?:bin|pdf|jpeg|png|webp))$/)?.[1];
    if (!name || (request.method !== "GET" && request.method !== "HEAD")) {
      next();
      return;
    }
    const file = path.join(directory, name);
    void stat(file)
      .then((info) => {
        response.setHeader("Content-Length", info.size);
        response.setHeader("Content-Type", name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream");
        if (request.method === "HEAD") response.end();
        else
          createReadStream(file)
            .on("error", () => response.destroy())
            .pipe(response);
      })
      .catch(() => {
        response.statusCode = 404;
        response.end();
      });
  };
  return {
    name: "azkar:local-learning-assets",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
