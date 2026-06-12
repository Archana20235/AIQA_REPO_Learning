import { useEffect, useState } from "react";
import { testPlanToMarkdown, testPlanToCsv, downloadFile } from "./export.js";

export default function App() {
  const [health, setHealth] = useState(null);
  const [issueKey, setIssueKey] = useState("VMO-1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [issue, setIssue] = useState(null);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ jiraConfigured: false, groqConfigured: false }));
  }, []);

  function normalizeIssueKey(value) {
    return value.trim().toUpperCase().replace(/\s+/g, "-");
  }

  async function handleGenerate() {
    const key = normalizeIssueKey(issueKey);
    if (!key) return;
    setIssueKey(key);
    setLoading(true);
    setError(null);
    setPlan(null);
    setIssue(null);
    try {
      const res = await fetch(`/api/testplan/${encodeURIComponent(key)}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setIssue(data.issue);
      setPlan(data.testPlan);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const notConfigured = health && !(health.jiraConfigured && health.groqConfigured);

  return (
    <div className="app">
      <header>
        <div>
          <h1>Jira → Test Plan Generator</h1>
          <p className="subtitle">
            b.l.a.s.t. · <span className="tag">groq openai/gpt-oss-120b</span>
          </p>
        </div>
      </header>

      {notConfigured && (
        <div className="banner warning">
          {!health.jiraConfigured && <div>⚠ Jira is not configured. Set JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN in <code>.env</code>.</div>}
          {!health.groqConfigured && <div>⚠ GROQ is not configured. Set GROQ_KEY in <code>.env</code>.</div>}
        </div>
      )}

      <section className="generator">
        <div className="section-label">B.L.A.S.T · GENERATOR</div>
        <h2>Generate Test Plan</h2>
        <label htmlFor="issueKey">Jira Issue Key</label>
        <div className="input-row">
          <input
            id="issueKey"
            value={issueKey}
            onChange={(e) => setIssueKey(e.target.value)}
            placeholder="e.g. VMO-1"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating…" : "Generate Test Plan"}
          </button>
        </div>
      </section>

      {error && <div className="banner error">{error}</div>}

      {issue && (
        <section className="issue-card">
          <h2>{issue.key}: {issue.summary}</h2>
          <div className="meta">
            <span>Type: {issue.issueType}</span>
            <span>Status: {issue.status}</span>
            <span>Priority: {issue.priority}</span>
          </div>
        </section>
      )}

      {plan && (
        <section className="plan">
          <div className="plan-header">
            <div>
              <h2>{plan.title}</h2>
              <p>{plan.summary}</p>
            </div>
            <div className="downloads">
              <button onClick={() => downloadFile(`${plan.jiraKey}-testplan.md`, testPlanToMarkdown(plan), "text/markdown")}>
                Download Markdown
              </button>
              <button onClick={() => downloadFile(`${plan.jiraKey}-testplan.csv`, testPlanToCsv(plan), "text/csv")}>
                Download CSV
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Preconditions</th>
                <th>Steps</th>
                <th>Expected Result</th>
                <th>Priority</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {(plan.testCases || []).map((tc) => (
                <tr key={tc.id}>
                  <td>{tc.id}</td>
                  <td>{tc.title}</td>
                  <td>{tc.preconditions}</td>
                  <td>
                    <ol>
                      {(tc.steps || []).map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  </td>
                  <td>{tc.expectedResult}</td>
                  <td><span className={`badge priority-${tc.priority?.toLowerCase()}`}>{tc.priority}</span></td>
                  <td><span className={`badge type-${tc.type?.toLowerCase().replace(" ", "-")}`}>{tc.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer>Lightweight React · Express proxy · credentials stay local</footer>
    </div>
  );
}
