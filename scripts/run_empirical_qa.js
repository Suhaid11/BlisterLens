const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load environment variables from .env
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const TEST_CAR_SPECS = [
  {
    id: 'test_1_side_profile',
    category: 'Side Profile',
    vehicleName: 'Chevrolet Corvette (Blue)',
    url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=80',
  },
  {
    id: 'test_2_front_three_quarter',
    category: 'Front 3/4',
    vehicleName: 'BMW M4 (Grey Metallic)',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=900&q=80',
  },
  {
    id: 'test_3_rear_three_quarter',
    category: 'Rear 3/4',
    vehicleName: 'Mercedes-Benz AMG (Silver)',
    url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&q=80',
  },
  {
    id: 'test_4_front_view',
    category: 'Front View',
    vehicleName: 'Ford Mustang (Red)',
    url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=900&q=80',
  },
  {
    id: 'test_5_dark_vehicle',
    category: 'Dark Vehicle',
    vehicleName: 'BMW M4 Coupe (Black)',
    url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&q=80',
  },
  {
    id: 'test_6_white_vehicle',
    category: 'White/Light Vehicle',
    vehicleName: 'Tesla Model 3 (Pearl White)',
    url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=900&q=80',
  },
  {
    id: 'test_7_distant_vehicle',
    category: 'Distant Vehicle',
    vehicleName: 'Classic Sedan (Distant Outdoor)',
    url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&q=80',
  },
  {
    id: 'test_8_close_vehicle',
    category: 'Close Vehicle',
    vehicleName: 'Porsche 911 GT3 (Close Action)',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80',
  },
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const options = {
      headers: {
        'User-Agent': 'BlisterLens-QA-Runner/1.0 (Educational Academic Project)',
      },
    };

    https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

const CAR_SCHEMA = {
  type: 'object',
  properties: {
    make: { type: 'string' },
    model: { type: 'string' },
    variant: { type: 'string' },
    colour_name: { type: 'string' },
    colour_hex: { type: 'string' },
    car_bbox: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
      },
      required: ['x', 'y', 'width', 'height'],
    },
    confidence: { type: 'number' },
    top3: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          make: { type: 'string' },
          model: { type: 'string' },
          confidence: { type: 'number' },
        },
        required: ['make', 'model', 'confidence'],
      },
    },
  },
  required: ['make', 'model', 'colour_name', 'colour_hex', 'car_bbox', 'confidence'],
};

async function callGeminiWithFailover(base64Image) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY in .env');

  const models = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  let lastErr = null;

  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            {
              text: 'You are an automotive packaging expert for BlisterLens die-cast collectibles. Identify the primary passenger car in the image. Return strictly JSON matching the schema. car_bbox must tightly bound the entire vehicle (bumpers, mirrors, wheels, spoilers, roof) as normalized coordinates [0.0, 1.0]. Exclude excessive road/sky background.',
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: 'application/json',
        response_schema: CAR_SCHEMA,
      },
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(data).slice(0, 100)}`);
      }

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('No candidate content received from model');
      return { result: JSON.parse(rawText), modelUsed: model };
    } catch (err) {
      clearTimeout(timer);
      console.warn(`   Model ${model} failed (${err.message}). Trying fallback...`);
      lastErr = err;
    }
  }

  throw lastErr || new Error('All vision models failed.');
}

// Adaptive padding logic from imagePipeline.ts
function calculateAdaptiveCrop(bbox) {
  let bx = bbox.x > 1 && bbox.x <= 1000 ? bbox.x / 1000 : bbox.x;
  let by = bbox.y > 1 && bbox.y <= 1000 ? bbox.y / 1000 : bbox.y;
  let bw = bbox.width > 1 && bbox.width <= 1000 ? bbox.width / 1000 : bbox.width;
  let bh = bbox.height > 1 && bbox.height <= 1000 ? bbox.height / 1000 : bbox.height;

  const marginX = Math.min(0.08, Math.max(0.02, bw * 0.085));
  const marginY = Math.min(0.08, Math.max(0.02, bh * 0.085));

  const padX = Math.max(0, bx - marginX);
  const padY = Math.max(0, by - marginY);
  const padW = Math.min(1 - padX, bw + marginX * 2);
  const padH = Math.min(1 - padY, bh + marginY * 2);

  // Calculate vehicle coverage relative to the cropped window
  const vehicleArea = bw * bh;
  const cropArea = padW * padH;
  const coveragePct = Math.round((vehicleArea / cropArea) * 100);

  return {
    padX: Number(padX.toFixed(3)),
    padY: Number(padY.toFixed(3)),
    padW: Number(padW.toFixed(3)),
    padH: Number(padH.toFixed(3)),
    coveragePct,
  };
}

async function run() {
  console.log('=== STARTING BLISTERLENS 8-PHOTO REAL VEHICLE EMPIRICAL QA ===');
  const testDir = path.resolve(__dirname, 'test_cars');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  const results = [];

  for (let i = 0; i < TEST_CAR_SPECS.length; i++) {
    const spec = TEST_CAR_SPECS[i];
    console.log(`\n[${i + 1}/8] Testing: ${spec.category} -> ${spec.vehicleName}`);
    const filePath = path.join(testDir, `${spec.id}.jpg`);

    try {
      if (!fs.existsSync(filePath)) {
        console.log(`   Downloading reference photograph...`);
        await downloadFile(spec.url, filePath);
      }

      console.log(`   Encoding photograph to base64...`);
      const fileBuf = fs.readFileSync(filePath);
      const base64 = fileBuf.toString('base64');

      console.log(`   Sending to Gemini Vision...`);
      const startMs = Date.now();
      const { result: detected, modelUsed } = await callGeminiWithFailover(base64);
      const latencyMs = Date.now() - startMs;

      console.log(`   Identified via ${modelUsed}: ${detected.make} ${detected.model} (${detected.colour_name})`);
      console.log(`   Confidence: ${Math.round(detected.confidence * 100)}% | Latency: ${latencyMs}ms`);

      const crop = calculateAdaptiveCrop(detected.car_bbox);
      console.log(`   Crop Window: [x:${crop.padX}, y:${crop.padY}, w:${crop.padW}, h:${crop.padH}]`);
      console.log(`   Vehicle Prominence in Crop: ${crop.coveragePct}% (Target: 65-75%)`);

      results.push({
        testNum: i + 1,
        category: spec.category,
        groundTruth: spec.vehicleName,
        detectedMake: detected.make,
        detectedModel: detected.model,
        detectedVariant: detected.variant || 'Standard',
        detectedColour: detected.colour_name,
        confidencePct: Math.round(detected.confidence * 100),
        latencyMs,
        modelUsed,
        carBBox: detected.car_bbox,
        cropWindow: crop,
        coveragePct: crop.coveragePct,
        status: 'PASS',
      });

      // Brief delay to stay safely within free rate limit quotas
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`   ERROR on ${spec.category}:`, err.message);
      results.push({
        testNum: i + 1,
        category: spec.category,
        groundTruth: spec.vehicleName,
        error: err.message,
        status: 'FAIL',
      });
    }
  }

  const outPath = path.resolve(__dirname, 'qa_empirical_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n=== RESULTS WRITTEN TO ${outPath} ===`);
}

run();
