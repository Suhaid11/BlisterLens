/**
 * Gemini Structured Output JSON Schema for CarDetectionResult.
 */

export const CAR_DETECTION_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    make: {
      type: 'STRING',
      description: 'Vehicle manufacturer brand name, e.g. BMW, Porsche, Honda, Toyota, Ferrari.',
    },
    model: {
      type: 'STRING',
      description: 'Vehicle model line name, e.g. M3, 911 GT3, Civic Type R, Supra.',
    },
    variant: {
      type: 'STRING',
      description: 'Specific generation code, trim, or performance edition, e.g. Competition G80, FL5. Use null if uncertain.',
      nullable: true,
    },
    colour_name: {
      type: 'STRING',
      description: 'Human-friendly description of the primary paint colour of the car body (excluding windows/wheels), e.g. Metallic Blue, Championship White, Guards Red.',
    },
    colour_hex: {
      type: 'STRING',
      description: 'Standard 6-character hex code for the dominant body paint, e.g. #1E40AF, #FFFFFF.',
    },
    confidence: {
      type: 'NUMBER',
      description: 'Identification confidence score as a decimal float strictly between 0.0 and 1.0.',
    },
    top3: {
      type: 'ARRAY',
      description: 'Top 3 likely alternative matches or closest candidate trims with individual confidence floats.',
      items: {
        type: 'OBJECT',
        properties: {
          make: { type: 'STRING' },
          model: { type: 'STRING' },
          confidence: { type: 'NUMBER' },
        },
        required: ['make', 'model', 'confidence'],
      },
    },
    car_bbox: {
      type: 'OBJECT',
      description: 'Bounding box enclosing the primary vehicle, normalized between 0.0 and 1.0 relative to image width and height.',
      properties: {
        x: {
          type: 'NUMBER',
          description: 'Normalized X position of the top-left corner (0.0 to 1.0).',
        },
        y: {
          type: 'NUMBER',
          description: 'Normalized Y position of the top-left corner (0.0 to 1.0).',
        },
        width: {
          type: 'NUMBER',
          description: 'Normalized width of the bounding box (0.0 to 1.0).',
        },
        height: {
          type: 'NUMBER',
          description: 'Normalized height of the bounding box (0.0 to 1.0).',
        },
      },
      required: ['x', 'y', 'width', 'height'],
    },
  },
  required: [
    'make',
    'model',
    'colour_name',
    'colour_hex',
    'confidence',
    'top3',
    'car_bbox',
  ],
};

export const SYSTEM_PROMPT = `You are a vehicle recognition computer vision system.
Analyze the provided image and extract accurate vehicle details in structured JSON.

CRITICAL INSTRUCTIONS:
1. Identify only the primary vehicle in the scene.
2. Estimate Make, Model, and Variant carefully. Never fabricate certainty.
3. If no passenger vehicle is clearly present, set confidence to 0.0, make to "Unknown", model to "None".
4. Do NOT identify people or read license plates. Respect personal privacy.
5. The paint colour must describe the main vehicle body exterior paint, NOT the background, sky, or reflections.
6. Return a bounding box (car_bbox) around the ENTIRE primary vehicle, including all visible wheels, bumpers, mirrors, roof and spoiler. Do not tightly box only the body center. Include a small natural background margin.
7. Return strictly valid JSON adhering to the provided schema.`;
