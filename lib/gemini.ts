import { GoogleGenAI } from "@google/genai";

// Key rotation: try key 1 first, fall back to key 2 on quota errors
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
].filter((k): k is string => Boolean(k));

const MODEL = "gemini-2.0-flash";

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;
  const status = e.status as number | undefined;
  const message = (e.message as string | undefined) ?? "";
  return (
    status === 429 ||
    message.includes("quota") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("Too Many Requests")
  );
}

export async function generateJSON<T = unknown>(prompt: string): Promise<T> {
  let lastError: unknown = null;

  for (const key of API_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      });

      const text = response.text ?? "";
      // Strip markdown code fences if present
      const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      return JSON.parse(clean) as T;
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn(`[Gemini] Key quota exceeded, trying next key...`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error("All Gemini API keys exhausted");
}

export async function generateText(prompt: string): Promise<string> {
  let lastError: unknown = null;

  for (const key of API_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      });

      return response.text ?? "";
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn(`[Gemini] Key quota exceeded, trying next key...`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error("All Gemini API keys exhausted");
}

/**
 * Streams text from Gemini as an AsyncGenerator of string chunks.
 * Falls back to next key on quota errors.
 */
export async function* generateTextStream(
  prompt: string
): AsyncGenerator<string> {
  let lastError: unknown = null;

  for (const key of API_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const stream = await ai.models.generateContentStream({
        model: MODEL,
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) yield text;
      }
      return; // Done successfully
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn(`[Gemini] Key quota exceeded, trying next key...`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error("All Gemini API keys exhausted");
}
