/** Browser fixtures must never write presence/device traffic to production. */
export function browserTestEnvironment(port, environment = process.env) {
  return {
    ...environment,
    VITE_CLOUDFLARE_API_URL: `http://127.0.0.1:${port}/__browser-test-api`,
  };
}
