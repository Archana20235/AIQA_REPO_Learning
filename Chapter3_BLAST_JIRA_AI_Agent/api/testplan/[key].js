// Vercel serverless function: POST /api/testplan/:key

import { fetchJiraIssue } from "../../server/jira.js";
import { generateTestPlan } from "../../server/groq.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "../../server/prompt.js";

const trim = (v) => (v || "").trim();
const GROQ_MODEL = "openai/gpt-oss-120b";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GROQ_KEY = trim(process.env.GROQ_KEY);
  const JIRA_EMAIL = trim(process.env.JIRA_EMAIL);
  const JIRA_URL = trim(process.env.JIRA_URL).replace(/\/+$/, "");
  const JIRA_API_TOKEN = trim(process.env.JIRA_API_TOKEN || process.env.JIRA_TOKEN);

  if (!(JIRA_URL && JIRA_EMAIL && JIRA_API_TOKEN)) {
    return res.status(502).json({
      error: "Jira is not configured. Set JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN env vars.",
    });
  }
  if (!GROQ_KEY) {
    return res.status(502).json({ error: "GROQ is not configured. Set GROQ_KEY env var." });
  }

  try {
    const issue = await fetchJiraIssue({
      baseUrl: JIRA_URL,
      email: JIRA_EMAIL,
      token: JIRA_API_TOKEN,
      issueKey: req.query.key,
    });

    const testPlan = await generateTestPlan({
      apiKey: GROQ_KEY,
      model: GROQ_MODEL,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(issue),
    });

    res.status(200).json({ issue, testPlan });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
