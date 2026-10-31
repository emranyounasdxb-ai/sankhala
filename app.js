// cPanel/Passenger entry point. Local development continues to use next dev.
const { createServer } = require("node:http");
const { readFileSync } = require("node:fs");
const path = require("node:path");
process.env.NODE_ENV = "production";
try {
  process.env.ATS_RELEASE_SHA = readFileSync(
    path.join(__dirname, "REVISION"),
    "utf8",
  ).trim();
} catch {
  process.env.ATS_RELEASE_SHA = "local";
}
const next = require("next");
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();
app
  .prepare()
  .then(() => {
    const server = createServer((request, response) => {
      // Passenger is the public reverse proxy; this server is not directly exposed.
      response.setHeader("X-Content-Type-Options", "nosniff");
      response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      response.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
      );
      if (request.url?.startsWith("/admin") || request.url?.startsWith("/api/"))
        response.setHeader("X-Robots-Tag", "noindex, nofollow");
      handle(request, response).catch(() => {
        if (!response.headersSent) {
          response.statusCode = 500;
          response.end("The request could not be completed.");
        } else response.end();
      });
    });
    server.headersTimeout = 30000;
    server.requestTimeout = 60000;
    server.maxRequestsPerSocket = 1000;
    server.listen(Number(process.env.PORT) || 3000, "127.0.0.1");
  })
  .catch(() => {
    console.error("Sankhala application could not start.");
    process.exitCode = 1;
  });
