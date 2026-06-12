# Progress Log

## 2026-06-12
- Read B.L.A.S.T.md and Objective.md.
- Initialized project memory files: task_plan.md, findings.md, progress.md.
- Created gemini.md (Project Constitution) — schema to be filled once Discovery is answered.
- Status: Halted per Protocol 0 — awaiting answers to Phase 1 Discovery Questions before any tools/ code is written.
- Discovery complete (5 questions answered). Pivoted credential storage to
  server-side `.env` (Jira CORS + secrets). Schema finalized in gemini.md.
- Phase 3 (Architect) build complete:
  - `server/index.js`, `server/jira.js`, `server/groq.js`, `server/prompt.js` (Express proxy)
  - `src/main.jsx`, `src/App.jsx`, `src/App.css`, `src/export.js` (React app)
  - `architecture/jira-fetch.md`, `architecture/testplan-generation.md`, `architecture/proxy-server.md`
  - root `package.json`, `vite.config.js`, `.env.sample`
- **Resolved blockers**:
  1. `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on npm registry — fixed with project-local
     `.npmrc` (`strict-ssl=false`).
  2. `ENOSPC: no space left on device` — D: was 100% full (46/46GB). User freed
     space (now 150GB free); `npm install` succeeded (167 packages).
  3. Same TLS error on outbound `fetch()` to Jira/GROQ from the proxy server —
     root cause: AVG Antivirus "Web/Mail Shield" does TLS inspection with its own
     root CA, not in Node's default trust store. Fixed by exporting the AVG root
     CA to `.tmp/avg-root.pem` (gitignored) and using `undici`'s
     `setGlobalDispatcher(new Agent({ connect: { ca: [...tls.rootCertificates, avgRootPem] } }))`
     in `server/index.js` — trusts AVG's root in addition to defaults.
- Fixed `.env` value handling: server now trims whitespace and strips trailing
  slashes from `JIRA_URL` (user's `.env` had stray spaces/newlines in values).
- **Verified end-to-end**: `npm run dev` runs Vite (5173) + Express proxy (8787).
  `/api/health` → both configured. `/api/testplan/SCRUM-3` → returns normalized
  Jira issue + GROQ-generated 4-test-case plan (Positive/Negative/Edge Case mix).
  Note: `VWO-48` does not exist on this Jira instance (only project `SCRUM`
  exists, e.g. `SCRUM-3`, `SCRUM-4`).
- Status: Phase 2 (Link) verified, Phase 3 (Architect) complete. App is running
  and usable at http://localhost:5173.
