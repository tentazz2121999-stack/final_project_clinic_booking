import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

let client: GoogleGenAI | null = null;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiClient(): GoogleGenAI {
  if (!isGeminiConfigured()) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình — thêm vào file .env");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return client;
}
