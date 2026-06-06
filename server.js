const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const port = Number(process.env.PORT || 4176);
const host = process.env.HOST || "0.0.0.0";
const rootDir = __dirname;
const dataDir = process.env.DATA_DIR || path.join(rootDir, "data");
const stateFile = path.join(dataDir, "live-draft-state.json");
const clients = new Set();

let sharedState = readState();
let revision = 0;

function readState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, "utf8"));
  } catch {
    return null;
  }
}

function writeState() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(sharedState, null, 2));
}

function sendJSON(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function broadcast(payload, skipClientId = null) {
  const message = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach((client) => {
    if (client.id !== skipClientId) {
      client.response.write(message);
    }
  });
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath);
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
  }[ext] || "application/octet-stream";
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(rootDir, pathname));

  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": filePath.endsWith(".html") ? "no-store" : "no-cache",
    });
    response.end(contents);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === "/healthz" && request.method === "GET") {
    sendJSON(response, 200, {
      ok: true,
      revision,
      clients: clients.size,
    });
    return;
  }

  if (url.pathname === "/api/live-state" && request.method === "GET") {
    sendJSON(response, 200, { state: sharedState, revision });
    return;
  }

  if (url.pathname === "/api/live-state" && request.method === "POST") {
    try {
      const body = JSON.parse(await readBody(request));
      if (typeof body.baseRevision === "number" && body.baseRevision !== revision) {
        sendJSON(response, 409, { state: sharedState, revision });
        return;
      }

      sharedState = body.state;
      revision += 1;
      writeState();
      broadcast({ type: "state", state: sharedState, revision }, body.clientId);
      sendJSON(response, 200, { ok: true, revision });
    } catch (error) {
      sendJSON(response, 400, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/live-events" && request.method === "GET") {
    const client = {
      id: url.searchParams.get("clientId") || crypto.randomUUID(),
      response,
    };
    clients.add(client);
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    });
    response.write(`data: ${JSON.stringify({ type: "state", state: sharedState, revision })}\n\n`);
    request.on("close", () => clients.delete(client));
    return;
  }

  serveStatic(request, response);
});

server.listen(port, host, () => {
  console.log(`Live draft server running on ${host}:${port}`);
  console.log(`Draft state file: ${stateFile}`);
});
