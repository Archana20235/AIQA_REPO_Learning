// GROQ (OpenAI-compatible) chat completions client.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateTestPlan({ apiKey, model, systemPrompt, userPrompt }) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GROQ request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("GROQ response missing message content");

  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`GROQ response was not valid JSON: ${content.slice(0, 300)}`);
  }
}
