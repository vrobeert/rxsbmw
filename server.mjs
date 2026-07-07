import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";

const root = join(process.cwd(), "dist");
const port = Number(process.env.PORT ?? 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const decodedPath = decodeURIComponent(url.pathname);
  const requestedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const candidate = join(root, requestedPath);
  const filePath = existsSync(candidate) && !candidate.endsWith("\\") ? candidate : join(root, "index.html");
  const type = contentTypes[extname(filePath)] ?? "application/octet-stream";

  response.setHeader("Content-Type", type);
  createReadStream(filePath).pipe(response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Serving dist on port ${port}`);
});
