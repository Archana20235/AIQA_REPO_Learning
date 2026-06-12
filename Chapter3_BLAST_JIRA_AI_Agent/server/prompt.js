// Prompt templates for GROQ test-plan generation.
// Business logic (parsing, validation) stays in JS; the LLM only fills in
// QA judgement within a fixed JSON schema (per BLAST: keep deterministic logic out of the LLM).

export const SYSTEM_PROMPT = `You are a senior QA engineer writing a formal test plan for a software ticket.
Respond ONLY with a single JSON object matching exactly this shape:

{
  "jiraKey": string,
  "title": string,
  "summary": string,
  "testCases": [
    {
      "id": string,            // e.g. "TC-1", "TC-2", sequential
      "title": string,
      "preconditions": string,
      "steps": string[],
      "expectedResult": string,
      "priority": "High" | "Medium" | "Low",
      "type": "Positive" | "Negative" | "Edge Case"
    }
  ]
}

Rules:
- Use a professional, neutral QA tone.
- Base test cases strictly on the provided ticket summary, description, and comments. Do not invent requirements that aren't implied by the ticket.
- Include a mix of Positive, Negative, and Edge Case test cases that together cover the described functionality.
- "summary" should be a 1-3 sentence overview of the test scope.
- Output must be valid JSON with no markdown, no commentary, no code fences.`;

export function buildUserPrompt(issue) {
  const lines = [
    `Jira Key: ${issue.key}`,
    `Issue Type: ${issue.issueType}`,
    `Status: ${issue.status}`,
    `Priority: ${issue.priority}`,
    `Summary: ${issue.summary}`,
    `Labels: ${(issue.labels || []).join(", ") || "none"}`,
    `Components: ${(issue.components || []).join(", ") || "none"}`,
    "",
    "Description:",
    issue.description || "(no description provided)",
  ];

  if (issue.comments && issue.comments.length) {
    lines.push("", "Comments:");
    for (const c of issue.comments) {
      lines.push(`- ${c.author} (${c.created}): ${c.body}`);
    }
  }

  return lines.join("\n");
}
