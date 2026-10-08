import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, URL } from "node:url";

const [jobsFile, draftsDirectory, cacheDirectory, port = "4189"] = process.argv.slice(2);
if (!cacheDirectory)
  throw new Error("Usage: node scripts/review-listening-timings.mjs jobs.json drafts-directory cache-directory [port]");
const { jobs } = JSON.parse(await fs.readFile(jobsFile, "utf8"));
const bySha = new Map(jobs.map((job) => [job.sha256, job]));
const resources = path.join(path.dirname(fileURLToPath(import.meta.url)), "listening-review");
const server = http.createServer(async (request, response) => {
  try {
    if (request.method !== "GET") {
      response.writeHead(405).end();
      return;
    }
    const url = new URL(request.url, "http://127.0.0.1");
    const headers = {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self'; media-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    };
    if (url.pathname === "/jobs") {
      response.writeHead(200, { ...headers, "Content-Type": "application/json" }).end(JSON.stringify(jobs));
      return;
    }
    const match = url.pathname.match(/^\/(draft|audio)\/([a-f0-9]{64})$/);
    if (match && bySha.has(match[2])) {
      const job = bySha.get(match[2]);
      const file =
        match[1] === "draft"
          ? path.join(draftsDirectory, job.sha256 + ".json")
          : path.join(cacheDirectory, "audio", job.sha256 + path.extname(job.relativePath));
      const bytes = await fs.readFile(file);
      if (
        match[1] === "audio" &&
        (bytes.length !== job.byteSize || crypto.createHash("sha256").update(bytes).digest("hex") !== job.sha256)
      )
        throw new Error("Recording checksum differs");
      const type =
        match[1] === "draft"
          ? "application/json"
          : path.extname(job.relativePath) === ".wav"
            ? "audio/wav"
            : "audio/mpeg";
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (range && match[1] === "audio") {
        const first = Number(range[1]),
          last = Math.min(bytes.length - 1, range[2] ? Number(range[2]) : bytes.length - 1);
        if (first > last) {
          response.writeHead(416, { "Content-Range": `bytes */${bytes.length}` }).end();
          return;
        }
        response
          .writeHead(206, {
            ...headers,
            "Content-Type": type,
            "Accept-Ranges": "bytes",
            "Content-Range": `bytes ${first}-${last}/${bytes.length}`,
            "Content-Length": last - first + 1,
          })
          .end(bytes.subarray(first, last + 1));
      } else
        response
          .writeHead(200, {
            ...headers,
            "Content-Type": type,
            "Content-Length": bytes.length,
            "Accept-Ranges": "bytes",
          })
          .end(bytes);
      return;
    }
    const filename = { "/": "index.html", "/review.js": "review.js", "/review.css": "review.css" }[url.pathname];
    if (!filename) {
      response.writeHead(404).end();
      return;
    }
    const type = filename.endsWith("js") ? "text/javascript" : filename.endsWith("css") ? "text/css" : "text/html";
    response
      .writeHead(200, { ...headers, "Content-Type": `${type}; charset=utf-8` })
      .end(await fs.readFile(path.join(resources, filename)));
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain" }).end(`Unavailable: ${error.message}`);
  }
});
server.listen(Number(port), "127.0.0.1", () =>
  console.log(
    `Timing review: http://127.0.0.1:${port}/ — drafts require independent human review; no production files are written.`,
  ),
);
