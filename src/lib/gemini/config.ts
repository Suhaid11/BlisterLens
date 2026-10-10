/**
 * Gemini API Configuration for BlisterLens.
 *
 * Direct mobile client calls are strictly a private student demo shortcut.
 * In production, requests should be routed through a serverless backend proxy.
 */

// Primary Model: Google Gemini 3.8 Flash (Flagship multimodal vision model selected for superior vehicle trim identification and precise bounding box localization)
export const GEMINI_MODEL =
  process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.8-flash';

// First Fallback Pool: Gemini 3.5 Flash Lite (low-latency/cost-optimized) -> Gemini 2.5 Flash Lite -> Gemini 3.5 Flash
export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
];

// Safety Fallback: OpenRouter Free Vision Pool
export const OPENROUTER_FREE_VISION_MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
];

export function getGeminiEndpoint(model: string = GEMINI_MODEL): string {
  const proxyUrl = process.env.EXPO_PUBLIC_PROXY_URL;
  if (proxyUrl && proxyUrl.trim().length > 0) {
    return proxyUrl.trim();
  }

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

export function hasConfiguredKeyOrProxy(): boolean {
  const hasProxy = Boolean(process.env.EXPO_PUBLIC_PROXY_URL?.trim());
  const hasKey = Boolean(process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim());
  const hasOpenRouter = Boolean(process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim());
  return hasProxy || hasKey || hasOpenRouter;
}
