# Snip repository rules

Keep this file synchronized with `.github/copilot-instructions.md`.

Snip is a Git superproject with one branch and submodule per layer: `main`
mounts the `backend`, `frontend`, and `cli` branches. The bundle is generated
release output, not source.

## Layout

| Path | Branch | Stack |
| --- | --- | --- |
| `backend/` | `backend` | Bun 1.x, zero npm dependencies, in-memory `Map` |
| `frontend/` | `frontend` | Angular 19 standalone, signals, HttpClient |
| `cli/` | `cli` | Node 18+, CommonJS, global `fetch` |
| `bundle/` | `bundle` | Generated Bun server, UI, CLI, Docker image |
| `scripts/build-bundle.mjs` | `main` | Node ESM bundle generator |

## Shared API

Change the contract everywhere or nowhere: backend, frontend, CLI, READMEs, and
bundle generation must agree.

| Method | Path | Result |
| --- | --- | --- |
| `POST` | `/api/links` with `{ "url": "https://..." }` | `201` `{ code, url, shortUrl, hits, createdAt }`; `400` invalid input |
| `GET` | `/api/links` | `200` array of links |
| `GET` | `/:code` | `302` redirect and hit increment; `404` unknown code |

## Commands

```bash
git submodule update --init --recursive
cd backend && bun start                         # :3000
cd frontend && npm install && npx ng serve     # :4200
cd cli && node cli.js add|ls|open ...
cd bundle && bun start                          # generated all-in-one app
node scripts/build-bundle.mjs [--push]
```

The Angular output path `frontend/dist/snip-frontend/browser` is load-bearing.

## Workflow

Edit and commit inside the relevant submodule, push its branch, then from
`main` run `git submodule update --remote <path>`, stage the path, commit the
pointer bump, and push `main`.

## Do

- Keep backend and CLI dependency-free; storage is intentionally in memory.
- Keep bundle generation idempotent and cross-platform.
- Keep this file and `.github/copilot-instructions.md` synchronized.

## Don't

- Never hand-edit `bundle/`; it is generated output.
- Never add `"type": "module"` near `cli.js`; it must remain CommonJS.
- Never rename the Angular project or its output path.
- Do not add persistence or a database.
- Do not add a `push` trigger to `bundle.yml`; schedule plus manual dispatch is deliberate.
- In `docker.yml`, keep `paths: [bundle]`: it watches the bundle submodule gitlink pointer, not files inside the submodule.
- Never commit secrets; CI uses `GITHUB_TOKEN`.
