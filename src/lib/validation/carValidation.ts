import type { CarDetectionResult, CarBBox, Top3Match } from '@/types/car';

export interface ValidationSuccess {
  success: true;
  data: CarDetectionResult;
}

export interface ValidationFailure {
  success: false;
  error: string;
  field?: string;
  raw?: unknown;
}

export type ValidationOutcome = ValidationSuccess | ValidationFailure;

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const COLOR_NAME_TO_HEX: Record<string, string> = {
  black: '#171717',
  white: '#F8FAFC',
  silver: '#94A3B8',
  gray: '#64748B',
  grey: '#64748B',
  red: '#DC2626',
  blue: '#2563EB',
  navy: '#1E3A8A',
  yellow: '#EAB308',
  green: '#16A34A',
  orange: '#EA580C',
  purple: '#9333EA',
  brown: '#78350F',
  gold: '#D97706',
};

function mapColourNameToHex(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, hex] of Object.entries(COLOR_NAME_TO_HEX)) {
    if (lower.includes(key)) return hex;
  }
  return '#3B82F6';
}

/**
 * Validates and normalizes raw model output against the strict CarDetectionResult schema.
 * Rejects corrupt, impossible, or out-of-bounds coordinates.
 */
export function validateCarDetectionResponse(raw: unknown): ValidationOutcome {
  if (!raw || typeof raw !== 'object') {
    return { success: false, error: 'Response is not a valid JSON object.', raw };
  }

  const obj = raw as Record<string, unknown>;

  // 1. Make and Model presence check
  if (typeof obj.make !== 'string' || obj.make.trim().length === 0) {
    return { success: false, error: 'Missing or empty vehicle make.', field: 'make' };
  }
  if (typeof obj.model !== 'string' || obj.model.trim().length === 0) {
    return { success: false, error: 'Missing or empty vehicle model.', field: 'model' };
  }

  const make = obj.make.trim();
  const model = obj.model.trim();

  // Check for "No car found" response from model
  if (make.toLowerCase() === 'unknown' && (model.toLowerCase() === 'none' || model.toLowerCase() === 'unknown')) {
    return { success: false, error: 'No vehicle could be detected in this image. Please capture a clear shot of a car.' };
  }

  // 2. Variant (can be string or null)
  const variant = typeof obj.variant === 'string' && obj.variant.trim().length > 0 ? obj.variant.trim() : null;

  // 3. Colour name and hex check
  if (typeof obj.colour_name !== 'string' || obj.colour_name.trim().length === 0) {
    return { success: false, error: 'Missing vehicle colour description.', field: 'colour_name' };
  }
  const colour_name = obj.colour_name.trim();

  let colour_hex = typeof obj.colour_hex === 'string' ? obj.colour_hex.trim() : '';
  if (colour_hex && !colour_hex.startsWith('#')) {
    colour_hex = `#${colour_hex}`;
  }
  if (!colour_hex || !HEX_COLOR_REGEX.test(colour_hex)) {
    // Graceful fallback to paint dictionary instead of crash
    colour_hex = mapColourNameToHex(colour_name);
  }

  // 4. Confidence sanity check (must be float between 0 and 1)
  let confidence = typeof obj.confidence === 'number' ? obj.confidence : parseFloat(String(obj.confidence));
  if (isNaN(confidence) || confidence < 0 || confidence > 1) {
    return { success: false, error: 'Confidence score must be between 0.0 and 1.0.', field: 'confidence' };
  }
  confidence = Math.round(confidence * 100) / 100;

  // 5. Bounding box sanity checks (Rule 5 & Rule 6)
  if (!obj.car_bbox || typeof obj.car_bbox !== 'object') {
    return { success: false, error: 'Missing car bounding box.', field: 'car_bbox' };
  }
  const rawBbox = obj.car_bbox as Record<string, unknown>;
  const rawX = Number(rawBbox.x);
  const rawY = Number(rawBbox.y);
  const rawW = Number(rawBbox.width);
  const rawH = Number(rawBbox.height);

  if (isNaN(rawX) || isNaN(rawY) || isNaN(rawW) || isNaN(rawH)) {
    return { success: false, error: 'Bounding box coordinates must be numbers.', field: 'car_bbox' };
  }

  if (rawW <= 0 || rawH <= 0) {
    return { success: false, error: 'Bounding box must have positive width and height.', field: 'car_bbox' };
  }

  let normX = rawX;
  let normY = rawY;
  let normW = rawW;
  let normH = rawH;

  // Handle 0-1000 coordinate space frequently output by Gemini Vision models
  if (normX > 1 || normY > 1 || normW > 1 || normH > 1) {
    if (normX <= 1000 && normY <= 1000 && normW <= 1000 && normH <= 1000) {
      normX /= 1000;
      normY /= 1000;
      normW /= 1000;
      normH /= 1000;
    }
  }

  // Normalize / clamp bounding box to [0, 1] bounds
  const x = Math.max(0, Math.min(0.95, normX));
  const y = Math.max(0, Math.min(0.95, normY));
  const width = Math.max(0.05, Math.min(1 - x, normW));
  const height = Math.max(0.05, Math.min(1 - y, normH));

  const car_bbox: CarBBox = {
    x: Math.round(x * 1000) / 1000,
    y: Math.round(y * 1000) / 1000,
    width: Math.round(width * 1000) / 1000,
    height: Math.round(height * 1000) / 1000,
  };

  // 6. Top 3 alternatives array validation
  const top3: Top3Match[] = [];
  if (Array.isArray(obj.top3)) {
    for (const item of obj.top3) {
      if (item && typeof item === 'object') {
        const itemObj = item as Record<string, unknown>;
        const iMake = typeof itemObj.make === 'string' ? itemObj.make.trim() : make;
        const iModel = typeof itemObj.model === 'string' ? itemObj.model.trim() : model;
        const iConf = typeof itemObj.confidence === 'number' ? Math.max(0, Math.min(1, itemObj.confidence)) : 0.5;
        top3.push({ make: iMake, model: iModel, confidence: Math.round(iConf * 100) / 100 });
      }
    }
  }

  // If top3 is empty or incomplete, ensure at least primary match is represented
  if (top3.length === 0) {
    top3.push({ make, model, confidence });
  }

  return {
    success: true,
    data: {
      make,
      model,
      variant,
      colour_name,
      colour_hex,
      confidence,
      top3,
      car_bbox,
    },
  };
}
