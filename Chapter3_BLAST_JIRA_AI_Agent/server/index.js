import "dotenv/config";
import fs from "fs";
import path from "path";
import tls from "tls";
import express from "express";
import cors from "cors";
import { Agent, setGlobalDispatcher } from "undici";
import { fetchJiraIssue } from "./jira.js";
import { generateTestPlan } from "./groq.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.js";

// Local dev: some corporate antivirus/proxies (e.g. AVG Web/Mail Shield) do TLS
// inspection with a self-signed root not in Node's default CA bundle. If present,
// trust it in addition to the default roots so outbound fetch() to Jira/GROQ works.
const extraCaPath = path.join(process.cwd(), ".tmp", "avg-root.pem");
if (fs.existsSync(extraCaPath)) {
  const extraCa = fs.readFileSync(extraCaPath, "utf8");
  setGlobalDispatcher(new Agent({ connect: { ca: [...tls.rootCertificates, extraCa] } }));
}

const PORT = process.env.PORT || 8787;
const GROQ_MODEL = "openai/gpt-oss-120b";

const trim = (v) => (v || "").trim();

const GROQ_KEY = trim(process.env.GROQ_KEY);
const JIRA_EMAIL = trim(process.env.JIRA_EMAIL);
const JIRA_URL = trim(process.env.JIRA_URL).replace(/\/+$/, "");
const JIRA_API_TOKEN = trim(process.env.JIRA_API_TOKEN || process.env.JIRA_TOKEN);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    jiraConfigured: Boolean(JIRA_URL && JIRA_EMAIL && JIRA_API_TOKEN),
    groqConfigured: Boolean(GROQ_KEY),
    model: GROQ_MODEL,
  });
});

app.get("/api/issue/:key", async (req, res) => {
  try {
    assertJiraConfigured();
    const issue = await fetchJiraIssue({
      baseUrl: JIRA_URL,
      email: JIRA_EMAIL,
      token: JIRA_API_TOKEN,
      issueKey: req.params.key,
    });
    res.json(issue);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.post("/api/testplan/:key", async (req, res) => {
  try {
    assertJiraConfigured();
    assertGroqConfigured();

    const issue = await fetchJiraIssue({
      baseUrl: JIRA_URL,
      email: JIRA_EMAIL,
      token: JIRA_API_TOKEN,
      issueKey: req.params.key,
    });

    const testPlan = await generateTestPlan({
      apiKey: GROQ_KEY,
      model: GROQ_MODEL,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(issue),
    });

    res.json({ issue, testPlan });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

function assertJiraConfigured() {
  if (!(JIRA_URL && JIRA_EMAIL && JIRA_API_TOKEN)) {
    throw new Error(
      "Jira is not configured. Set JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN in .env"
    );
  }
}

function assertGroqConfigured() {
  if (!GROQ_KEY) {
    throw new Error("GROQ is not configured. Set GROQ_KEY in .env");
  }
}

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
