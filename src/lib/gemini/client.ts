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
 * Extracts a clean JSON substring from an LLM response even if surrounded by markdown or preamble.
 */
function extractJsonSubstring(text: string): string {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

/**
 * Call OpenRouter OpenAI-compatible chat completion endpoint with vision.
 */
async function callOpenRouterVision(
  model: string,
  base64Jpeg: string,
  apiKey: string
): Promise<GeminiAnalysisResponse> {
  const cleanBase64 = base64Jpeg.replace(/^data:image\/[a-z]+;base64,/i, '').trim();

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
                  url: `data:image/jpeg;base64,${cleanBase64}`,
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
    const message = json?.choices?.[0]?.message;
    let content = message?.content;

    // Some reasoning models return content in message.reasoning or message.content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      if (typeof message?.reasoning === 'string' && message.reasoning.includes('{')) {
        content = message.reasoning;
      } else {
        throw new Error(`OpenRouter (${model}) returned an empty response.`);
      }
    }

    const jsonString = extractJsonSubstring(content);
    const parsed = JSON.parse(jsonString);
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
 * If Gemini free quotas are exhausted, automatically fails over to active Gemini models or OpenRouter.
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

  // Strip any data-uri prefix and whitespace so inline_data always receives valid base64
  const cleanBase64 = base64Jpeg.replace(/^data:image\/[a-z]+;base64,/i, '').trim();

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
          ? { image: cleanBase64, mime_type: 'image/jpeg' }
          : {
              contents: [
                {
                  parts: [
                    { text: SYSTEM_PROMPT },
                    {
                      inline_data: {
                        mime_type: 'image/jpeg',
                        data: cleanBase64,
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
          const promptBlock = jsonResponse?.promptFeedback?.blockReason;
          if (promptBlock) {
            throw new Error(`Gemini safety filter blocked the image (${promptBlock}). Please ensure the car is clearly visible.`);
          }

          const candidate = jsonResponse?.candidates?.[0];
          if (!candidate) {
            throw new Error('Gemini returned an empty candidate list.');
          }

          if (candidate.finishReason === 'SAFETY') {
            throw new Error('Gemini safety filter flagged this photo. Please try another angle without people or obstructions.');
          }

          const parts = candidate.content?.parts || [];
          // Prioritize non-thought parts containing text
          const textParts = parts.filter(
            (p: any) => !p?.thought && typeof p?.text === 'string' && p.text.trim().length > 0
          );

          let candidateText = '';
          if (textParts.length > 0) {
            candidateText = textParts.map((p: any) => p.text).join('').trim();
          } else {
            candidateText = parts.map((p: any) => p?.text || '').join('').trim();
          }

          if (!candidateText) {
            throw new Error(`Gemini returned an empty response (finishReason: ${candidate.finishReason || 'UNKNOWN'}).`);
          }

          rawText = candidateText;
          try {
            const cleanJson = extractJsonSubstring(candidateText);
            parsed = JSON.parse(cleanJson);
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

        // If credentials are fundamentally invalid, don't keep trying the same key
        if (error.message.includes('401') || error.message.includes('403')) {
          break;
        }

        // For all other errors (404, 429, 503, empty response, parsing), try the next Gemini fallback model
        continue;
      }
    }
  }

  // Safety Fallback: OpenRouter Free Vision Pool
  if (openRouterKey) {
    for (const openRouterModel of OPENROUTER_FREE_VISION_MODELS) {
      try {
        const openRouterResponse = await callOpenRouterVision(
          openRouterModel,
          cleanBase64,
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
