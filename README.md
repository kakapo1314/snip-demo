# Snip backend

Snip is a tiny URL shortener backed by an in-memory `Map`. It requires Bun 1.x
and has no npm dependencies.

```bash
bun start
```

The API listens on port 3000 by default. Set `PORT`, `BASE_URL`, or
`PUBLIC_DIR` to configure it. Links reset when the server restarts.