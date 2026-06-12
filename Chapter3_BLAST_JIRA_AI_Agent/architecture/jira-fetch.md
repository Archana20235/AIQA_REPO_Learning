# SOP: Jira Issue Fetch (`server/jira.js`)

## Goal
Fetch a Jira Cloud issue plus its comments and return a normalized, flat JSON
object suitable for prompting an LLM.

## Inputs
- `baseUrl`, `email`, `token` — from `.env` (`JIRA_URL`, `JIRA_EMAIL`,
  `JIRA_API_TOKEN` / `JIRA_TOKEN`)
- `issueKey` — e.g. `VWO-48`, from the React app

## Endpoints
- `GET {baseUrl}/rest/api/3/issue/{issueKey}?fields=summary,description,issuetype,status,priority,labels,components,fixVersions,reporter,assignee`
- `GET {baseUrl}/rest/api/3/issue/{issueKey}/comment`
- Auth: `Authorization: Basic base64(email:token)`

## ADF Flattening
Jira's `description` and comment `body` fields are returned as Atlassian
Document Format (ADF) — a nested JSON tree, not plain text. `flattenAdf()`
recursively walks the tree:
- `text` nodes → their `text` value
- `paragraph` / `heading` → children + newline
- `bulletList` / `orderedList` / `listItem` → `- ` prefixed lines
- `table` / `tableRow` / `tableCell` → degrade to `|`-separated text
- `hardBreak` → newline
- `codeBlock` → fenced code block
- Unknown node types → just concatenate children's text (graceful degrade)

## Output Shape
See "Normalized Jira Issue" in `gemini.md`.

## Edge Cases
- Issue has no description → `description: ""`.
- Issue has no comments, or comments endpoint 4xx → `comments: []` (non-fatal).
- Missing optional fields (priority, assignee, etc.) → empty string / `[]`,
  never `null`/`undefined`, so prompt building never sees `undefined`.

## Known Constraints
- Jira Cloud does not return CORS headers permitting browser-origin requests,
  so this client MUST run server-side (in `server/`), not in `src/`.
