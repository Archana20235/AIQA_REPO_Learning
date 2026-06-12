// Jira Cloud REST v3 client: fetch an issue (with comments) and normalize it.

const FIELDS = [
  "summary",
  "description",
  "issuetype",
  "status",
  "priority",
  "labels",
  "components",
  "fixVersions",
  "reporter",
  "assignee",
].join(",");

// Flatten Atlassian Document Format (ADF) into plain text.
function flattenAdf(node) {
  if (!node) return "";
  if (typeof node === "string") return node;

  if (node.type === "text") return node.text || "";

  const children = (node.content || []).map(flattenAdf).join("");

  switch (node.type) {
    case "paragraph":
    case "heading":
      return children + "\n";
    case "listItem":
      return `- ${children}\n`;
    case "bulletList":
    case "orderedList":
      return children;
    case "hardBreak":
      return "\n";
    case "codeBlock":
      return `\n\`\`\`\n${children}\n\`\`\`\n`;
    case "table":
      return children + "\n";
    case "tableRow":
      return children.replace(/\s+$/, "") + "\n";
    case "tableCell":
    case "tableHeader":
      return children.replace(/\n+$/, "") + " | ";
    default:
      return children;
  }
}

function authHeader(email, token) {
  const creds = Buffer.from(`${email}:${token}`).toString("base64");
  return `Basic ${creds}`;
}

export async function fetchJiraIssue({ baseUrl, email, token, issueKey }) {
  const headers = {
    Authorization: authHeader(email, token),
    Accept: "application/json",
  };

  const issueUrl = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=${FIELDS}`;
  const issueRes = await fetch(issueUrl, { headers });
  if (!issueRes.ok) {
    const body = await issueRes.text();
    throw new Error(`Jira issue fetch failed (${issueRes.status}): ${body}`);
  }
  const issue = await issueRes.json();

  const commentsUrl = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment`;
  const commentsRes = await fetch(commentsUrl, { headers });
  let comments = [];
  if (commentsRes.ok) {
    const data = await commentsRes.json();
    comments = (data.comments || []).map((c) => ({
      author: c.author?.displayName || "Unknown",
      body: flattenAdf(c.body).trim(),
      created: c.created,
    }));
  }

  const f = issue.fields || {};
  return {
    key: issue.key,
    summary: f.summary || "",
    description: flattenAdf(f.description).trim(),
    issueType: f.issuetype?.name || "",
    status: f.status?.name || "",
    priority: f.priority?.name || "",
    labels: f.labels || [],
    components: (f.components || []).map((c) => c.name),
    fixVersions: (f.fixVersions || []).map((v) => v.name),
    reporter: f.reporter?.displayName || "",
    assignee: f.assignee?.displayName || "",
    comments,
  };
}
