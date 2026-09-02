import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import type { ZodType } from "zod";

function geminiKeys() {
  return [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
  ]
    .map((key) => key?.trim())
    .filter((key): key is string => Boolean(key));
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced ? fenced[1].trim() : trimmed;
}

async function geminiJson(system: string, user: string) {
  const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  let lastError: unknown;
  for (const key of geminiKeys()) {
    try {
      const client = new GoogleGenerativeAI(key);
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: system,
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      });
      const result = await model.generateContent(user);
      return result.response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("No Gemini API keys configured");
}

async function nvidiaJson(system: string, user: string) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not set");
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  });
  const completion = await client.chat.completions.create({
    model: process.env.NVIDIA_MODEL_TEXT || "nvidia/nemotron-3-ultra-550b",
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return completion.choices[0]?.message?.content || "";
}

export async function generateStructuredJson<T>(input: {
  system: string;
  user: string;
  schema: ZodType<T>;
}): Promise<T> {
  const attempts: Array<() => Promise<string>> = [
    () => geminiJson(input.system, input.user),
    () => nvidiaJson(input.system, input.user),
  ];

  let lastError: unknown;
  for (const run of attempts) {
    for (let retry = 0; retry < 2; retry += 1) {
      try {
        const raw = extractJson(await run());
        const parsed = JSON.parse(raw);
        const result = input.schema.safeParse(parsed);
        if (result.success) return result.data;
        lastError = result.error;
      } catch (error) {
        lastError = error;
      }
    }
  }
  throw lastError ?? new Error("AI providers failed to return valid JSON");
}
