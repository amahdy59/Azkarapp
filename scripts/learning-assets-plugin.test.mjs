import { createServer } from "node:http";
import { expect, it } from "vitest";
import { learningAssetsPlugin } from "./learning-assets-plugin.ts";
import partitions from "../src/app/audio/ownerTimingPartitions.json" with { type: "json" };
import catalogue from "../src/app/learning/catalogue.json" with { type: "json" };

it("serves only exact optional publication/timing identities through local GET/HEAD routes", async () => {
  let middleware;
  learningAssetsPlugin().configurePreviewServer({
    middlewares: {
      use(handler) {
        middleware = handler;
      },
    },
  });
  const server = createServer((request, response) =>
    middleware(request, response, () => {
      response.statusCode = 404;
      response.end();
    }),
  );
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const timing = await globalThis.fetch(`${base}/__timing-assets__/${partitions[0].sha256}.bin`);
    expect(timing.status).toBe(200);
    expect((await timing.arrayBuffer()).byteLength).toBe(12663);
    const publication = await globalThis.fetch(`${base}/__learning-assets__/${catalogue[0].pack.path}`, {
      method: "HEAD",
    });
    expect(publication.status).toBe(200);
    expect(Number(publication.headers.get("content-length"))).toBe(catalogue[0].pack.bytes);
    for (const url of [
      "/__timing-assets__/../release-notes.json",
      `/__timing-assets__/${partitions[0].sha256}.pdf`,
      `/__timing-assets__/${"0".repeat(64)}.bin`,
    ])
      expect((await globalThis.fetch(base + url)).status).toBe(404);
    expect(
      (await globalThis.fetch(`${base}/__timing-assets__/${partitions[0].sha256}.bin`, { method: "POST" })).status,
    ).toBe(404);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
