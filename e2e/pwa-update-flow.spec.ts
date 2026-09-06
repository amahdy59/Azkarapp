import { execFileSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { expect, test } from "@playwright/test";

/**
 * The update path, end to end, against a real service worker.
 *
 * Everything else that covers updating is either a unit test against a fake
 * registration or `pwa-update.spec.ts`, which mocks the release notes and
 * dispatches the event by hand to check that the notice renders. Neither
 * exercises a handover: no test anywhere had ever watched one build replace
 * another. This one publishes a second build over the first and presses the
 * button, which is the thing readers report not working.
 *
 * It is deliberately not on the shared preview server. That server has one
 * fixed directory, and this needs to change what is being served underneath a
 * running client — which is exactly what a deployment is.
 */
const PORT = 4199;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const OLD_RELEASE = "1000.1-old";
const NEW_RELEASE = "1000.2-new";
const ROOT_RELATIVE = ".playwright-update";
const ROOT = resolve(ROOT_RELATIVE);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

/** Notes with a given release, so the client sees what the build was stamped. */
function notesFor(release: string) {
  return JSON.stringify({
    release,
    ar: ["الأول", "الثاني", "الثالث"],
    en: ["First change", "Second change", "Third change"],
  });
}

function buildRelease(relativeDirectory: string, release: string) {
  const directory = resolve(relativeDirectory);
  /* The out directory is passed relative, not absolute. `shell: true` is
     needed for pnpm on Windows, and the shell splits this repository's own
     path on the spaces in "OneDrive - Advansys IS" — which surfaces as rollup
     failing to load the entry module, an error that says nothing about the
     real cause. */
  try {
    execFileSync("pnpm", ["exec", "vite", "build", "--outDir", relativeDirectory, "--emptyOutDir"], {
      stdio: "pipe",
      shell: true,
      env: { ...process.env, AZKAR_RELEASE_OVERRIDE: release },
    });
  } catch (error) {
    const detail = error as { stderr?: Buffer; stdout?: Buffer };
    throw new Error(
      `Building release ${release} failed:\n${detail.stderr?.toString() ?? ""}\n${detail.stdout?.toString() ?? ""}`,
      { cause: error },
    );
  }
  // The build copies public/release-notes.json verbatim; this is the deployed
  // manifest the client fetches, so it has to agree with the stamp compiled in.
  writeFileSync(join(directory, "release-notes.json"), notesFor(release), "utf8");
}

/** Serves whichever directory `served` points at — flipping it is the deploy. */
let served = join(ROOT, "v1");
let server: Server | undefined;

function startServer() {
  server = createServer((request, response) => {
    const requested = decodeURIComponent((request.url ?? "/").split("?")[0]!);
    const candidate = normalize(join(served, requested === "/" ? "index.html" : requested));
    // Never serve outside the directory being published.
    const file = candidate.startsWith(served + sep) || candidate === served ? candidate : join(served, "index.html");
    const found = existsSync(file) && statSync(file).isFile();

    /* A missing file is a 404, and only a navigation falls back to index.html.
       Serving index.html for a missing hashed asset — which an SPA fallback
       does by default — hands the browser HTML where it asked for a module,
       and it refuses it on MIME grounds. That matters here more than anywhere:
       publishing v2 over v1 deletes v1's hashed assets, so a client still
       running v1 asks for files that are genuinely gone. A real static host
       404s; this has to as well, or the harness invents a failure the app
       would never see. */
    const wantsDocument = (request.headers.accept ?? "").includes("text/html");
    if (!found && !wantsDocument) {
      response.writeHead(404, { "Content-Type": "text/plain", "Cache-Control": "no-store" });
      response.end("not found");
      return;
    }

    const target = found ? file : join(served, "index.html");

    /* No caching at all. GitHub Pages sends max-age=600, but an HTTP cache is
       not what is under test here and it would only add ten minutes of
       flakiness to a question about service-worker handover. */
    response.writeHead(200, {
      "Content-Type": TYPES[extname(target)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(target).pipe(response);
  });
  return new Promise<void>((done) => server!.listen(PORT, "127.0.0.1", done));
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  test.setTimeout(600_000);
  rmSync(ROOT, { recursive: true, force: true });
  mkdirSync(ROOT, { recursive: true });
  buildRelease(`${ROOT_RELATIVE}/v1`, OLD_RELEASE);
  buildRelease(`${ROOT_RELATIVE}/v2`, NEW_RELEASE);
  served = join(ROOT, "v1");
  await startServer();
});

test.afterAll(async () => {
  await new Promise<void>((done) => (server ? server.close(() => done()) : done()));
  rmSync(ROOT, { recursive: true, force: true });
});

async function openApp(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight", reduceMotion: true },
        profile: { displayName: "Guest", isGuest: true },
      }),
    );
  });
  await page.goto(ORIGIN);
  /* A worker does not control the page that registered it — that is the spec,
     not a quirk, and there is no `clients.claim()` here because the prompt
     flow exists so the reader chooses the moment. So: wait for it to be active,
     then reload into it. This is the real second visit, which is the first one
     an update can ever be offered on. */
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 60_000 });
}

const notice = (page: import("@playwright/test").Page) =>
  page.getByRole("complementary", { name: "An update is ready" });

test("a published build replaces the running one when the reader asks for it", async ({ page }) => {
  test.setTimeout(300_000);

  await openApp(page);
  // Nothing has been published over it, so there is nothing to offer.
  await expect(notice(page)).toBeHidden();

  // The deployment.
  served = join(ROOT, "v2");

  await page.reload();
  await expect(notice(page)).toBeVisible({ timeout: 30_000 });

  /* Chunks the old document may still ask for. Publishing deleted them, so a
     404 here is the symptom of the page being left running after its worker
     was replaced — the state this test was written to catch. */
  const missing: string[] = [];
  page.on("response", (response) => {
    if (response.status() === 404) missing.push(new URL(response.url()).pathname);
  });

  await page.getByRole("button", { name: "Refresh", exact: true }).click();

  /* The whole point of the test. Whatever route it takes — handover to a
     waiting worker, or the escape that discards a worker which would not stand
     aside — the reader must end up on the published build. If they do, the
     notice cannot come back, because the running release now matches the
     deployed one. */
  await expect(notice(page)).toBeHidden({ timeout: 120_000 });

  /* Cleared deliberately. Some 404s during the changeover are inherent to any
     deployment: publishing deletes the old hashed chunks, and a document still
     running the old build will ask for them until it reloads. No update
     mechanism can prevent that — only shorten it. What must be true is that
     once the reader has landed, nothing is still missing. */
  missing.length = 0;

  await page.reload();
  await expect(page.locator("#main-content")).toBeVisible({ timeout: 30_000 });
  await expect(notice(page)).toBeHidden({ timeout: 30_000 });

  expect(missing, `the settled page is still missing: ${missing.join(", ")}`).toEqual([]);
});

test("the reader is not asked twice for the same update", async ({ page }) => {
  // Still serving v2 from the test above, and the browser context is fresh, so
  // this is a first visit to the published build rather than an upgrade.
  await openApp(page);
  await expect(notice(page)).toBeHidden();
});
