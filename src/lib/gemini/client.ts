import { CarDetectionResult } from '@/types/car';
import {
  GEMINI_MODEL,
  GEMINI_FALLBACK_MODELS,
  OPENROUTER_FREE_VISION_MODELS,
  getGeminiEndpoint,
} from './config';
import { CAR_DETECTION_RESPONSE_SCHEMA, SYSTEM_PROMPT } from './schema';
import { validateCarDetectionResponse } from '../validation/carValidation';

export interface GeminiAnalysisResponse {
  result: CarDetectionResult;
  rawJson: string;
  modelUsed: string;
}

/**
 * Call OpenRouter OpenAI-compatible chat completion endpoint with vision.
 */
async function callOpenRouterVision(
  model: string,
  base64Jpeg: string,
  apiKey: string
): Promise<GeminiAnalysisResponse> {
  const schemaInstructions = `${SYSTEM_PROMPT}

You MUST return strictly valid JSON matching this schema:
{
  "make": "Manufacturer string (e.g. BMW, Porsche)",
  "model": "Model string (e.g. M3, 911)",
  "variant": "Trim or null",
  "colour_name": "Body paint colour name",
  "colour_hex": "#RRGGBB",
  "confidence": 0.0 to 1.0,
  "top3": [{"make": "string", "model": "string", "confidence": 0.0}],
  "car_bbox": {"x": 0.0, "y": 0.0, "width": 1.0, "height": 1.0}
}
Normalized bounding box coordinates must be floats between 0.0 and 1.0.
Output ONLY raw JSON with no explanation or conversational markdown.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': 'https://blisterlens.app',
        'X-Title': 'BlisterLens',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: schemaInstructions },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Jpeg}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`OpenRouter (${model}) HTTP ${response.status}: ${errText.slice(0, 100)}`);
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error(`OpenRouter (${model}) returned an empty response.`);
    }

    const cleaned = content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    const validation = validateCarDetectionResponse(parsed);
    if (!validation.success) {
      throw new Error(`OpenRouter response failed validation: ${validation.error}`);
    }

    return {
      result: validation.data,
      rawJson: content,
      modelUsed: `openrouter/${model}`,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Sends a base64-encoded vehicle photo to Gemini Vision with schema-constrained JSON output.
 * If Gemini free quotas are exhausted, automatically fails over to OpenRouter's free vision pool.
 * Never prints, logs, or exposes API keys.
 */
export async function identifyCarFromImage(base64Jpeg: string): Promise<GeminiAnalysisResponse> {
  const isProxy = Boolean(process.env.EXPO_PUBLIC_PROXY_URL?.trim());
  const hasGeminiKey = Boolean(process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim());
  const openRouterKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim() || '';

  if (!isProxy && !hasGeminiKey && !openRouterKey) {
    throw new Error(
      'Gemini API key is missing. Add EXPO_PUBLIC_GEMINI_API_KEY (or EXPO_PUBLIC_OPENROUTER_API_KEY) to your local .env file and restart Expo.'
    );
  }

  const geminiModelsToTry = isProxy
    ? [GEMINI_MODEL]
    : [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== GEMINI_MODEL)];

  let lastError: Error | null = null;

  // Try Google Gemini models first if key or proxy is available
  if (isProxy || hasGeminiKey) {
    for (const model of geminiModelsToTry) {
      try {
        const endpoint = getGeminiEndpoint(model);

        const requestBody = isProxy
          ? { image: base64Jpeg, mime_type: 'image/jpeg' }
          : {
              contents: [
                {
                  parts: [
                    { text: SYSTEM_PROMPT },
                    {
                      inline_data: {
                        mime_type: 'image/jpeg',
                        data: base64Jpeg,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: CAR_DETECTION_RESPONSE_SCHEMA,
              },
            };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

        let response: Response;
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });
        } catch (networkErr: unknown) {
          clearTimeout(timeoutId);
          const netError = networkErr as Error;
          const proxyUrl = process.env.EXPO_PUBLIC_PROXY_URL || '';
          if (isProxy && (proxyUrl.includes('localhost') || proxyUrl.includes('127.0.0.1'))) {
            throw new Error(
              'Cannot reach local proxy server. If testing on a mobile phone, "localhost" points to the phone rather than your PC. Configure EXPO_PUBLIC_GEMINI_API_KEY in .env for direct access, or use your PC\'s Wi-Fi IP address.'
            );
          }
          if (netError.name === 'AbortError') {
            throw new Error('Connection timed out after 25 seconds. Please check your internet connection.');
          }
          throw new Error('Network connection failed. Check your internet connection and try again.');
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          if (response.status === 429) {
            throw new Error('Gemini API rate limit reached (HTTP 429).');
          }
          if (response.status === 503 || errorText.includes('high demand') || errorText.includes('UNAVAILABLE')) {
            throw new Error('Gemini model temporarily unavailable due to high demand (HTTP 503).');
          }
          if (response.status === 401 || response.status === 403) {
            throw new Error(`Gemini API authorization error (HTTP ${response.status}). Please verify EXPO_PUBLIC_GEMINI_API_KEY in .env.`);
          }
          if (response.status === 404) {
            throw new Error(`Requested Gemini model is unavailable (HTTP 404): ${model}.`);
          }
          if (response.status === 400) {
            throw new Error(`Gemini API bad request (HTTP 400). Please verify request schema and API configuration.`);
          }
          if (response.status >= 500) {
            throw new Error(`Gemini server error (HTTP ${response.status}). The service is temporarily unavailable.`);
          }
          throw new Error(`Gemini API request failed with status ${response.status}: ${errorText.slice(0, 150)}`);
        }

        const jsonResponse = await response.json();

        let parsed: unknown;
        let rawText: string;

        if (isProxy) {
          if (jsonResponse.error) {
            throw new Error(jsonResponse.error);
          }
          parsed = jsonResponse;
          rawText = JSON.stringify(jsonResponse, null, 2);
        } else {
          const candidateText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!candidateText || typeof candidateText !== 'string') {
            throw new Error('Gemini returned an empty candidate response.');
          }
          rawText = candidateText;
          try {
            parsed = JSON.parse(candidateText.trim());
          } catch (parseErr) {
            throw new Error(`Failed to parse structured JSON from model: ${(parseErr as Error).message}`);
          }
        }

        const validation = validateCarDetectionResponse(parsed);
        if (!validation.success) {
          throw new Error(`Model validation failed: ${validation.error}`);
        }

        return {
          result: validation.data,
          rawJson: rawText,
          modelUsed: model,
        };
      } catch (err: unknown) {
        const error = err as Error;
        lastError = error;

        // If it's a rate limit (429), high demand (503), or not found (404), fall back to next model
        const isEligibleForFallback =
          error.message.includes('404') ||
          error.message.includes('not found') ||
          error.message.includes('429') ||
          error.message.includes('503') ||
          error.message.includes('high demand') ||
          error.message.includes('unavailable');

        if (!isEligibleForFallback) {
          break;
        }
      }
    }
  }

  // Safety Fallback: OpenRouter Free Vision Pool
  if (openRouterKey) {
    for (const openRouterModel of OPENROUTER_FREE_VISION_MODELS) {
      try {
        const openRouterResponse = await callOpenRouterVision(
          openRouterModel,
          base64Jpeg,
          openRouterKey
        );
        return openRouterResponse;
      } catch (openRouterErr: unknown) {
        lastError = openRouterErr as Error;
        // Continue to next free vision model in the pool
      }
    }
  }

  throw lastError || new Error('Failed to analyze car image with available vision models.');
}
