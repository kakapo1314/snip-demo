import { cpSync, existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bundleDir = join(root, "bundle");
const frontendDir = join(root, "frontend");
const browserDir = join(frontendDir, "dist", "snip-frontend", "browser");
const shouldPush = process.argv.includes("--push");
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const npxCommand = isWindows ? "npx.cmd" : "npx";

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: isWindows && (command === npmCommand || command === npxCommand),
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with code ${result.status}`);
  }
}

function commitIfChanged(cwd, message, paths = ["-A"]) {
  run("git", ["add", ...paths], cwd);
  const staged = spawnSync("git", ["diff", "--cached", "--quiet"], {
    cwd,
    stdio: "ignore",
    shell: false,
  });
  if (staged.status === 0) return false;
  if (staged.status !== 1) {
    throw new Error("Could not inspect staged changes");
  }
  run("git", ["commit", "-m", message], cwd);
  return true;
}

run("git", ["submodule", "update", "--init", "--remote", "backend", "frontend", "cli"]);
run(npmCommand, ["install"], frontendDir);
run(npxCommand, ["ng", "build"], frontendDir);

if (!existsSync(join(browserDir, "index.html"))) {
  throw new Error(`Frontend build output is missing: ${join(browserDir, "index.html")}`);
}

for (const entry of readdirSync(bundleDir)) {
  if (entry !== ".git" && entry !== "README.md") {
    rmSync(join(bundleDir, entry), { recursive: true, force: true });
  }
}

cpSync(join(root, "backend", "server.js"), join(bundleDir, "server.js"));
cpSync(join(root, "cli", "cli.js"), join(bundleDir, "cli.js"));
cpSync(browserDir, join(bundleDir, "public"), { recursive: true });
writeFileSync(join(bundleDir, ".env"), "PUBLIC_DIR=./public\n");
writeFileSync(
  join(bundleDir, "package.json"),
  `${JSON.stringify({
    name: "snip-bundle",
    private: true,
    scripts: { start: "bun server.js" },
  }, null, 2)}\n`,
);
writeFileSync(
  join(bundleDir, "Dockerfile"),
  "FROM oven/bun:1-alpine\nCOPY . .\nENV PORT=3000\nEXPOSE 3000\nCMD bun server.js\n",
);
writeFileSync(
  join(bundleDir, ".dockerignore"),
  ".git\n.env\nnode_modules\n",
);
writeFileSync(
  join(bundleDir, "railway.json"),
  `${JSON.stringify({ build: { builder: "DOCKERFILE" } }, null, 2)}\n`,
);

const bundleChanged = commitIfChanged(bundleDir, "Build generated bundle");
const mainChanged = commitIfChanged(root, "Bump generated bundle submodule", ["bundle"]);

if (!bundleChanged && !mainChanged) {
  console.log("unchanged");
}

if (shouldPush) {
  run("git", ["push", "origin", "HEAD:bundle"], bundleDir);
  run("git", ["push", "origin", "main"], root);
}