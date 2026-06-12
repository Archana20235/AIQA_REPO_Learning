# Task Plan — JIRA Test Plan Generator

## Status: Phase 2 (Link) verified, Phase 3 (Architect) complete — app running locally

## Goal (from Objective.md)
Build a lightweight React application that:
- Has a Settings screen to configure: Jira base URL, Jira email, Jira API token, GROQ API key/model
- Accepts a Jira Issue ID (e.g., VWO-48)
- Fetches the Jira ticket details (incl. comments & attachment metadata) via Jira REST API
- Sends ticket details to GROQ (model: openai/gpt-oss-120b, free tier) to generate a Test Plan
- Displays the generated Test Plan to the user, with Markdown/CSV download

## Phases Checklist
- [x] Phase 0: Initialize memory files (task_plan.md, findings.md, progress.md, gemini.md)
- [x] Phase 1: Blueprint — Discovery answered ✅, schema defined in gemini.md ✅, research done ✅
- [x] Phase 2: Link — Jira + GROQ connectivity verified via proxy (tested SCRUM-3)
- [x] Phase 3: Architect — server/, src/, architecture/ built; npm run dev works
- [ ] Phase 4: Stylize — UI/UX refinement, user feedback
- [ ] Phase 5: Trigger — Deployment (if applicable)

## Discovery Answers (Phase 1.1) — COMPLETE
1. North Star: Generate a usable test plan from a Jira ticket (core flow first).
2. Integrations: Jira + GROQ — user has both API keys ready, will enter via Settings UI.
3. Source of Truth: Full Jira context — description, acceptance criteria, comments, attachment metadata.
4. Delivery Payload: Rendered in UI + downloadable Markdown/CSV.
5. Behavioral Rules: Standard QA format (Test Case ID, Title, Preconditions, Steps, Expected Result, Priority, Type), professional tone, no Jira write-back.

## Architecture Summary (see gemini.md for full schema)
- React app (Vite) with Settings page (localStorage) + Test Plan Generator page.
- Minimal local Express proxy server (stateless) to:
  - Avoid Jira CORS issues
  - Call Jira REST API v3 (issue + comments)
  - Call GROQ Chat Completions API (OpenAI-compatible)
- Read-only Jira integration in v1.

## Blueprint Build Plan (Phase 3 preview)
1. `architecture/` SOPs:
   - `jira-fetch.md` — how to fetch + normalize a Jira issue
   - `testplan-generation.md` — GROQ prompt design + JSON response contract
   - `proxy-server.md` — proxy endpoints, error handling, CORS config
2. `tools/` (proxy server, Node/Express):
   - `proxy-server/server.js` — `/api/jira/issue/:key`, `/api/groq/generate`
3. React app (`app/`):
   - Settings page (Jira + GROQ config form → localStorage)
   - Generator page (issue key input → fetch → generate → display)
   - Test plan viewer (table) + Download Markdown/CSV buttons

## Open Research (Phase 1.3) — to do before Phase 2
- [ ] Confirm exact Jira REST v3 issue+comments endpoints and ADF→text extraction approach
- [ ] Confirm GROQ JSON-mode/response_format support for openai/gpt-oss-120b
- [ ] Check for existing reference repos/snippets for Jira+LLM test plan generation
