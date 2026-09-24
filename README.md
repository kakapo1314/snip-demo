# Snip CLI

The zero-dependency Snip CLI uses Node 18+ and the backend at
`http://localhost:3000` by default. Set `SNIP_API` to use another backend.

```text
snip add https://example.com
snip ls
snip open <code>
```

The `snip`, `snip.cmd`, and `snip.ps1` wrappers run `cli.js` on Unix-like
systems, Windows Command Prompt, and PowerShell respectively.