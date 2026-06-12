// Vercel serverless function: GET /api/issue/:key

import { fetchJiraIssue } from "../../server/jira.js";

const trim = (v) => (v || "").trim();

export default async function handler(req, res) {
  const JIRA_EMAIL = trim(process.env.JIRA_EMAIL);
  const JIRA_URL = trim(process.env.JIRA_URL).replace(/\/+$/, "");
  const JIRA_API_TOKEN = trim(process.env.JIRA_API_TOKEN || process.env.JIRA_TOKEN);

  if (!(JIRA_URL && JIRA_EMAIL && JIRA_API_TOKEN)) {
    return res.status(502).json({
      error: "Jira is not configured. Set JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN env vars.",
    });
  }

  try {
    const issue = await fetchJiraIssue({
      baseUrl: JIRA_URL,
      email: JIRA_EMAIL,
      token: JIRA_API_TOKEN,
      issueKey: req.query.key,
    });
    res.status(200).json(issue);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
