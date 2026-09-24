import { join, normalize, resolve, sep } from "node:path";

const port = Number(process.env.PORT || 3000);
const baseUrl = (process.env.BASE_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${port}`)).replace(/\/$/, "");
const publicDir = process.env.PUBLIC_DIR ? resolve(process.env.PUBLIC_DIR) : null;
const links = new Map();
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function withCors(response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

function randomCode() {
  let code = "";
  while (code.length < 6) {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    for (const byte of bytes) {
      if (byte < 248 && code.length < 6) {
        code += alphabet[byte % alphabet.length];
      }
    }
  }
  return code;
}

async function staticFile(pathname) {
  if (!publicDir || pathname.startsWith("/api/")) return null;

  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = resolve(publicDir, normalize(relativePath));
  if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${sep}`)) {
    return null;
  }

  const file = Bun.file(filePath);
  return (await file.exists()) ? new Response(file) : null;
}

async function handle(request) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });

  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname === "/api/links") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    let target;
    try {
      target = new URL(body?.url);
    } catch {
      return json({ error: "URL must use http or https" }, 400);
    }

    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return json({ error: "URL must use http or https" }, 400);
    }

    let code = randomCode();
    while (links.has(code)) code = randomCode();
    const link = {
      code,
      url: target.href,
      shortUrl: `${baseUrl}/${code}`,
      hits: 0,
      createdAt: new Date().toISOString(),
    };
    links.set(code, link);
    return json(link, 201);
  }

  if (request.method === "GET" && url.pathname === "/api/links") {
    return json([...links.values()]);
  }

  if (request.method === "GET") {
    const file = await staticFile(url.pathname);
    if (file) return file;

    const code = url.pathname.slice(1);
    const link = links.get(code);
    if (link) {
      link.hits += 1;
      return Response.redirect(link.url, 302);
    }
    return json({ error: "Not found" }, 404);
  }

  return json({ error: "Method not allowed" }, 405);
}

const server = Bun.serve({
  port,
  async fetch(request) {
    try {
      return withCors(await handle(request));
    } catch (error) {
      console.error(error);
      return withCors(json({ error: "Internal server error" }, 500));
    }
  },
});

console.log(`Snip listening on ${server.url}`);