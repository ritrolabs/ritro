import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

// The response is JSON mode, so parse it whole. The regex is a fallback for wrapped output.
function parseTagArray(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*?\]/);
    if (!match) throw new Error("Gemini returned no JSON array");
    return JSON.parse(match[0]);
  }
}

export async function generateTags(
  title: string | null,
  description: string | null
): Promise<string[]> {
  const combined = [title, description].filter(Boolean).join(". ");
  if (!combined) return [];
  // Truncate and strip newlines to prevent prompt injection
  const text = combined.replace(/[\r\n]+/g, " ").slice(0, 500);

  const prompt = `Given this webpage title and description, generate 3 to 5 short, relevant tags (single words or short phrases). Return ONLY a JSON array of strings, no explanation.

Content: ${text}

Example output: ["javascript", "tutorial", "web dev"]`;

  const response = await getClient().models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" },
  });

  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    throw new Error(`Gemini did not finish tagging: ${finishReason}`);
  }

  // Bad output throws so the job retries. Only a valid empty array means "no tags".
  const tags = parseTagArray(response.text ?? "");
  if (!Array.isArray(tags)) throw new Error("Gemini returned a non-array");
  const strings = tags.filter((t): t is string => typeof t === "string");
  if (tags.length > 0 && strings.length === 0) throw new Error("Gemini returned no string tags");
  return strings
    .map((t) => t.toLowerCase().trim())
    .filter((t) => t.length > 0)
    .slice(0, 5);
}
