# SOP: Test Plan Generation (`server/groq.js`, `server/prompt.js`)

## Goal
Turn a normalized Jira issue into a structured Test Plan JSON object using
GROQ's OpenAI-compatible Chat Completions API.

## Model
- `openai/gpt-oss-120b` (GROQ free tier), hardcoded in `server/index.js`.

## Request
- `POST https://api.groq.com/openai/v1/chat/completions`
- `Authorization: Bearer ${GROQ_KEY}`
- Body:
  ```json
  {
    "model": "openai/gpt-oss-120b",
    "messages": [
      { "role": "system", "content": "<SYSTEM_PROMPT>" },
      { "role": "user", "content": "<rendered issue context>" }
    ],
    "response_format": { "type": "json_object" },
    "temperature": 0.2
  }
  ```

## Prompt Design
- `SYSTEM_PROMPT` (in `prompt.js`) fixes the exact output JSON schema and the
  QA rules: professional tone, Positive/Negative/Edge Case coverage, no
  fabricated requirements, valid JSON only.
- `buildUserPrompt(issue)` renders the normalized issue (summary, description,
  labels, components, comments) as plain text context.

## Output Contract
See "Test Plan Output" schema in `gemini.md`. The server parses the JSON
response and returns it as-is to the client — Markdown/CSV rendering is done
deterministically in `src/export.js` (LLM never produces the final file).

## Error Handling
- Non-2xx GROQ response → throw with status + body, surfaced to UI as a
  banner.
- Non-JSON `message.content` → throw with a preview of the raw content
  (helps debugging prompt drift).

## Known Constraints / Learnings
- GROQ free tier has rate limits — errors should be surfaced to the UI, not
  retried silently (no hidden retries that could amplify rate-limit issues).
