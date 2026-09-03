import { GoogleGenerativeAI } from "@google/generative-ai";
import { Types } from "mongoose";
import OpenAI from "openai";
import type { ZodType } from "zod";

const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

export function resolveGeminiModelName(requestedModel?: string) {
  const preferred = (requestedModel ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL).trim();
  if (!preferred) return DEFAULT_GEMINI_MODEL;

  const normalized = preferred.toLowerCase();
  if (normalized.startsWith("gemini-")) return preferred;
  return DEFAULT_GEMINI_MODEL;
}

export function isValidAiUsageUserId(value: unknown): value is string | Types.ObjectId {
  if (typeof value === "string") return Types.ObjectId.isValid(value);
  return value instanceof Types.ObjectId;
}

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
  const modelName = resolveGeminiModelName();
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
    timeout: 25000,
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
  const attempts: Array<{ name: string; run: () => Promise<string> }> = [
    { name: "gemini-text", run: () => geminiJson(input.system, input.user) },
    { name: "nvidia-text", run: () => nvidiaJson(input.system, input.user) },
  ];

  let lastError: unknown;
  for (const provider of attempts) {
    for (let retry = 0; retry < 2; retry += 1) {
      try {
        const raw = extractJson(await provider.run());
        const parsed = JSON.parse(raw);
        const result = input.schema.safeParse(parsed);
        if (result.success) return result.data;
        lastError = result.error;
      } catch (error) {
        console.warn(`[ai:orchestrator] Provider ${provider.name} attempt ${retry + 1} failed:`, error);
        lastError = error;
      }
    }
  }
  throw lastError ?? new Error("AI providers failed to return valid JSON");
}

async function nvidiaVisionJson(system: string, userPrompt: string, imageBase64: string) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not set");
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
    timeout: 25000,
  });

  const formattedImageUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  const completion = await client.chat.completions.create({
    model: process.env.NVIDIA_MODEL_VISION || "meta/llama-3.2-11b-vision-instruct",
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: formattedImageUrl } },
        ],
      },
    ],
  });
  return completion.choices[0]?.message?.content || "";
}

async function geminiVisionJson(system: string, userPrompt: string, imageBase64: string) {
  const modelName = resolveGeminiModelName();
  const rawBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  const mimeType = imageBase64.match(/data:([^;]+);/)?.[1] || "image/jpeg";

  let lastError: unknown;
  for (const key of geminiKeys()) {
    try {
      const client = new GoogleGenerativeAI(key);
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: system,
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      });
      const result = await model.generateContent([
        userPrompt,
        {
          inlineData: {
            data: rawBase64,
            mimeType,
          },
        },
      ]);
      return result.response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("No Gemini API keys configured");
}

export async function generateStructuredVisionJson<T>(input: {
  system: string;
  user: string;
  imageBase64: string;
  schema: ZodType<T>;
}): Promise<T> {
  const attempts: Array<{ name: string; run: () => Promise<string> }> = [
    { name: "gemini-vision", run: () => geminiVisionJson(input.system, input.user, input.imageBase64) },
    { name: "nvidia-vision", run: () => nvidiaVisionJson(input.system, input.user, input.imageBase64) },
  ];

  let lastError: unknown;
  for (const provider of attempts) {
    for (let retry = 0; retry < 2; retry += 1) {
      try {
        const raw = extractJson(await provider.run());
        const parsed = JSON.parse(raw);
        const result = input.schema.safeParse(parsed);
        if (result.success) return result.data;
        lastError = result.error;
      } catch (error) {
        console.warn(`[ai:orchestrator] Provider ${provider.name} attempt ${retry + 1} failed:`, error);
        lastError = error;
      }
    }
  }
  throw lastError ?? new Error("AI vision providers failed to return valid JSON");
}
