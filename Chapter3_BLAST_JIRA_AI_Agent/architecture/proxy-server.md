# SOP: Proxy Server (`server/index.js`)

## Goal
Stateless Express server that holds Jira/GROQ credentials (from `.env`) and
exposes a small API for the React frontend. Solves Jira's CORS restriction
and keeps secrets off the client.

## Endpoints

### `GET /api/health`
Returns `{ jiraConfigured, groqConfigured, model }` — booleans based on
whether required `.env` vars are present. Used by the UI to show a setup
warning banner instead of failing silently.

### `GET /api/issue/:key`
Fetches and returns the normalized Jira issue only (debugging/manual use).

### `POST /api/testplan/:key`
1. Fetch + normalize the Jira issue (`jira.js`).
2. Build prompt and call GROQ (`groq.js`, `prompt.js`).
3. Return `{ issue, testPlan }`.

## Config (`.env`)
```
GROQ_KEY=
JIRA_EMAIL=
JIRA_API_TOKEN=     # JIRA_TOKEN accepted as fallback
JIRA_URL=
PORT=8787           # optional
```

## Dev Setup
- `vite.config.js` proxies `/api/*` from the Vite dev server (port 5173) to
  this Express server (port 8787) — no CORS config needed in dev.
- `npm run dev` runs both via `concurrently`.

## Error Handling
- Missing `.env` config → 502 with a clear message naming the missing
  variable(s), caught before any external call is made.
- Jira/GROQ failures → 502 with the upstream error message, shown in the UI
  banner.

## Known Constraints / Learnings
- Server is intentionally stateless — no session, no DB. Each request does a
  full fetch+generate cycle.
