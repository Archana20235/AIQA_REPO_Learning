// Deterministic rendering of a TestPlan object to Markdown / CSV (no LLM involved).

export function testPlanToMarkdown(plan) {
  const lines = [
    `# Test Plan — ${plan.jiraKey}`,
    "",
    `## ${plan.title}`,
    "",
    plan.summary || "",
    "",
    "| ID | Title | Preconditions | Steps | Expected Result | Priority | Type |",
    "|----|-------|---------------|-------|------------------|----------|------|",
  ];

  for (const tc of plan.testCases || []) {
    const steps = (tc.steps || []).map((s, i) => `${i + 1}. ${s}`).join("<br>");
    lines.push(
      `| ${tc.id} | ${tc.title} | ${tc.preconditions} | ${steps} | ${tc.expectedResult} | ${tc.priority} | ${tc.type} |`
    );
  }

  return lines.join("\n");
}

export function testPlanToCsv(plan) {
  const header = ["ID", "Title", "Preconditions", "Steps", "Expected Result", "Priority", "Type"];
  const rows = (plan.testCases || []).map((tc) => [
    tc.id,
    tc.title,
    tc.preconditions,
    (tc.steps || []).join(" | "),
    tc.expectedResult,
    tc.priority,
    tc.type,
  ]);

  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
