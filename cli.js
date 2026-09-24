#!/usr/bin/env node

const { spawn } = require("node:child_process");

const apiBase = (process.env.SNIP_API || "http://localhost:3000").replace(/\/$/, "");

function usage() {
  console.log(`Usage:
  snip add <url>    Shorten a URL
  snip ls           List shortened URLs
  snip open <code>  Open a short URL in the browser`);
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBase}${path}`, options);
  } catch {
    throw new Error(`Could not reach the backend at ${apiBase}`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(body?.error || `Backend returned HTTP ${response.status}`);
  }
  return { body, response };
}

function validateUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    throw new Error("URL must use http or https");
  }
}

async function add(url) {
  validateUrl(url);
  const { body } = await request("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  console.log(body.shortUrl);
}

async function list() {
  const { body: links } = await request("/api/links");
  if (!links.length) {
    console.log("No links yet.");
    return;
  }

  const codeWidth = Math.max(4, ...links.map((link) => link.code.length));
  const hitsWidth = Math.max(4, ...links.map((link) => String(link.hits).length));
  console.log(`${"CODE".padEnd(codeWidth)}  ${"HITS".padStart(hitsWidth)}  URL`);
  for (const link of links) {
    console.log(`${link.code.padEnd(codeWidth)}  ${String(link.hits).padStart(hitsWidth)}  ${link.url}`);
  }
}

function openBrowser(target) {
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", target], { detached: true, stdio: "ignore" }).unref();
  } else {
    const command = process.platform === "darwin" ? "open" : "xdg-open";
    spawn(command, [target], { detached: true, stdio: "ignore" }).unref();
  }
}

async function open(code) {
  if (!code || code.includes("/")) throw new Error("Provide a valid short code");
  const { response } = await request(`/${encodeURIComponent(code)}`, { redirect: "manual" });
  const target = response.headers.get("location");
  if (!target) throw new Error("Backend did not return a redirect target");
  openBrowser(target);
  console.log(target);
}

async function main() {
  const [command, value] = process.argv.slice(2);
  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
    return;
  }

  if (command === "add" && value && process.argv.length === 4) return add(value);
  if (command === "ls" && process.argv.length === 3) return list();
  if (command === "open" && value && process.argv.length === 4) return open(value);
  throw new Error("Invalid command or arguments\n\n" + usageText());
}

function usageText() {
  return "Usage: snip add <url> | snip ls | snip open <code>";
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});