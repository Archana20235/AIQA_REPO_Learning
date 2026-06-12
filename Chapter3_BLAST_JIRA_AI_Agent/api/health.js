// Vercel serverless function: GET /api/health

const trim = (v) => (v || "").trim();
const GROQ_MODEL = "openai/gpt-oss-120b";

export default function handler(req, res) {
  const GROQ_KEY = trim(process.env.GROQ_KEY);
  const JIRA_EMAIL = trim(process.env.JIRA_EMAIL);
  const JIRA_URL = trim(process.env.JIRA_URL).replace(/\/+$/, "");
  const JIRA_API_TOKEN = trim(process.env.JIRA_API_TOKEN || process.env.JIRA_TOKEN);

  res.status(200).json({
    jiraConfigured: Boolean(JIRA_URL && JIRA_EMAIL && JIRA_API_TOKEN),
    groqConfigured: Boolean(GROQ_KEY),
    model: GROQ_MODEL,
  });
}
