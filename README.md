# Snip

Snip is a tiny URL shortener organized as one backend and two clients. The
backend serves the API, while the Angular web app and Node CLI consume the same
contract. The `main` branch is the superproject; each app layer lives on its own
branch and is mounted here as a Git submodule.

## Layout

| Path | Branch | Purpose |
| --- | --- | --- |
| `backend/` | `backend` | Bun API server with in-memory storage |
| `frontend/` | `frontend` | Angular 19 web client |
| `cli/` | `cli` | Zero-dependency Node CLI |

## API contract

The backend listens on port 3000 by default.

| Method | Path | Response |
| --- | --- | --- |
| `POST` | `/api/links` with `{ "url": "https://..." }` | `201` with `{ code, url, shortUrl, hits, createdAt }`; `400` for invalid input |
| `GET` | `/api/links` | `200` with an array of links |
| `GET` | `/:code` | `302` to the original URL and increments hits; `404` when unknown |

## Clone and run

Use `--recurse-submodules`; a plain clone creates the submodule folders but
leaves them empty.

```bash
git clone --recurse-submodules https://github.com/kakapo1314/snip-demo.git
cd snip-demo

cd backend && bun start
cd ../frontend && npm install && npx ng serve
cd ../cli && node cli.js ls
```

The API runs at `http://localhost:3000`, and the Angular app runs at
`http://localhost:4200`. Set `SNIP_API` when the CLI should use another API URL.

## Generated bundle

The `bundle/` submodule is generated release output: it combines the backend,
built frontend, and CLI into one Bun process serving port 3000. Rebuild it from
`main` with `node scripts/build-bundle.mjs`; add `--push` to publish the bundle
branch and its updated pointer. Do not hand-edit files inside `bundle/`.

## Updating a layer

Commit and push changes from inside the relevant submodule first, then advance
the pinned pointer in this superproject:

```bash
cd backend
git add -A && git commit -m "Update backend" && git push
cd ..
git submodule update --remote backend
git add backend
git commit -m "Bump backend submodule"
git push
```

Use the same workflow for `frontend` or `cli`, replacing the path and commit
message. The parent commit pins an exact submodule commit, so source changes and
pointer updates are separate records.
