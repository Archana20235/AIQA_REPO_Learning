# Project Constitution (gemini.md)

## Status: Phase 3 (Architect) — building

## Project Map
- Name: Jira → Test Plan Generator
- Type: Lightweight React (Vite) app + local Express proxy server
- Core flow: User enters Jira Issue ID (e.g. VWO-48) → React app calls local
  proxy `/api/testplan/:key` → proxy fetches issue+comments from Jira REST v3,
  flattens ADF description to text → proxy sends normalized issue to GROQ
  (openai/gpt-oss-120b, JSON mode) → returns structured Test Plan → React app
  renders it and offers Markdown/CSV download.

## Data Schema

### Server config (.env — NOT committed)
```
GROQ_KEY=
JIRA_EMAIL=
JIRA_API_TOKEN=   (JIRA_TOKEN accepted as fallback)
JIRA_URL=
PORT=8787 (optional)
```

### Normalized Jira Issue (internal, sent to GROQ as context)
```json
{
  "key": "VWO-48",
  "summary": "string",
  "description": "string (flattened from ADF)",
  "issueType": "string",
  "status": "string",
  "priority": "string",
  "labels": ["string"],
  "components": ["string"],
  "fixVersions": ["string"],
  "reporter": "string",
  "assignee": "string",
  "comments": [{ "author": "string", "body": "string", "created": "ISO date" }]
}
```

### Test Plan Output (GROQ JSON-mode response)
```json
{
  "jiraKey": "VWO-48",
  "title": "string",
  "summary": "string",
  "testCases": [
    {
      "id": "TC-1",
      "title": "string",
      "preconditions": "string",
      "steps": ["string"],
      "expectedResult": "string",
      "priority": "High | Medium | Low",
      "type": "Positive | Negative | Edge Case"
    }
  ]
}
```

## Behavioral Rules
- Professional, neutral QA tone. Standard structure: Test Case ID, Title,
  Preconditions, Steps, Expected Result, Priority, Type.
- Must cover description, acceptance criteria, and comments — do not ignore
  ticket discussion when scoping tests.
- Must include positive, negative, and edge-case scenarios.
- GROQ called with `response_format: { type: "json_object" }` — output must be
  valid JSON matching the Test Plan schema. Do not fabricate fields not present
  in the Jira issue.
- Read-only Jira integration — no write-back to Jira in v1.
- Use built-in QA test-plan knowledge (no external skill).

## Architectural Invariants
- Secrets (Jira email/token, GROQ key) live ONLY in server-side `.env`, read by
  the Express proxy via `dotenv`. Never sent to or stored in the browser.
- Jira Cloud REST API v3, Basic Auth = base64(`email:token`).
- Jira `description` is ADF JSON → flattened to plain text recursively
  (paragraphs, lists, tables degrade to text).
- Proxy is stateless: `/api/testplan/:key` does fetch+generate in one call;
  `/api/health` reports whether `.env` is configured.
- GROQ: `POST https://api.groq.com/openai/v1/chat/completions`,
  `Authorization: Bearer <GROQ_KEY>`, model `openai/gpt-oss-120b`,
  `response_format: {type:"json_object"}`.
- Vite dev server proxies `/api/*` → `http://localhost:8787` (no CORS issues in dev).

## Maintenance Log
- 2026-06-12: Schema finalized. Pivoted credential storage from browser
  localStorage to server-side `.env` (per user-provided `.env` + findings.md) —
  more secure, simpler UI. Building proxy server + React app.
- 2026-06-12: Local dev environment note — this machine has AVG Antivirus
  "Web/Mail Shield" doing TLS inspection. `server/index.js` trusts AVG's root CA
  (exported to `.tmp/avg-root.pem`, gitignored) via `undici`'s
  `setGlobalDispatcher`, in addition to Node's default CAs. If this breaks on
  another machine, regenerate `.tmp/avg-root.pem` from that machine's AVG root
  cert, or remove the block in `server/index.js` if AVG isn't installed there.
- 2026-06-12: End-to-end verified with `SCRUM-3` (this Jira instance's only
  project is `SCRUM` — `VWO-48` from the original objective does not exist
  here). App running: Vite on :5173, proxy on :8787.
