Minimal short-save server for LocationLocations

Files added:
- server.js - Express app providing /api/save and /api/load
- package.json - minimal dependencies
- .gitignore - ignores node_modules and data/

How it works
- POST /api/save with JSON { payload: string } (payload is your LZString-compressed base64) -> returns { id }
- GET  /api/load?id=<id> -> { payload }

Run locally

1. Install dependencies

```powershell
npm install
```

2. Start server

```powershell
npm start
```

The server listens on port 3000 by default. It stores payloads in the `data/` folder as JSON files named <id>.json.

Deploy

- You can deploy this on Railway, Heroku, or any Node host. Make sure the `data/` filesystem is writable and persistent; for durable storage prefer S3 or a managed DB.
- After deploying, set `SERVER_API_SAVE` and `SERVER_API_LOAD` in your `index.html` to point to the deployed endpoints.

Security & limits
- This example is intentionally minimal and unauthenticated. If public, add rate-limiting and optionally auth.
- Increase `express.json({ limit: '2mb' })` if your payloads are larger, or switch to an object-store for very large payloads.
