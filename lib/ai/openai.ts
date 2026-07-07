import "server-only";

type ChatCompletionParams = {
  system: string;
  user: string;
  temperature?: number;
};

function cleanEnvValue(value: string | undefined) {
  return (value ?? "")
    .replace(/[\u2028\u2029\u200B\uFEFF]/g, "")
    .replace(/[\r\n]/g, "")
    .trim();
}

function summarizeErrorBody(body: string) {
  return body ? body.slice(0, 240) : "";
}

export async function createChatCompletion({ system, user, temperature = 0.2 }: ChatCompletionParams) {
  const apiKey = cleanEnvValue(process.env.OPENAI_API_KEY);
  const model = cleanEnvValue(process.env.OPENAI_MODEL) || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OpenAI no está configurado: falta OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const rawBody = await response.text();
  let parsed: unknown = null;

  if (rawBody) {
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      parsed = rawBody;
    }
  }

  if (!response.ok) {
    const preview =
      typeof parsed === "string"
        ? summarizeErrorBody(parsed)
        : parsed && typeof parsed === "object"
          ? summarizeErrorBody(JSON.stringify(parsed))
          : summarizeErrorBody(rawBody);

    throw new Error(
      `OpenAI respondió ${response.status} ${response.statusText}${preview ? `: ${preview}` : ""}`
    );
  }

  const content = (parsed as {
    choices?: Array<{ message?: { content?: string | null } | null }>;
  })?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("OpenAI no devolvió contenido utilizable.");
  }

  return content;
}
