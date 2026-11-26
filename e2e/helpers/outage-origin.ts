import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

/** Stop a test-owned origin to prove cache fallback without disturbing parallel tests.
 * The contextual-reminder spec uses this pattern too: microsoft/playwright#42775.
 */
export async function startOutageOrigin(upstream: string) {
  const server = createServer(async (request, response) => {
    try {
      const result = await fetch(new URL(request.url ?? "/", upstream));
      response.writeHead(result.status, {
        "Content-Type": result.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(Buffer.from(await result.arrayBuffer()));
    } catch {
      response.writeHead(502).end();
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    stop: () =>
      new Promise<void>((resolve, reject) => {
        if (!server.listening) return resolve();
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
}
