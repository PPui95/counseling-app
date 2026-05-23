/**
 * Gemini Image Generation Test
 * รองรับสองโมเดล:
 *   1. imagen-4.0-generate-001   – Imagen 4  (predict API)      ← ต้องใช้ Paid plan
 *   2. gemini-2.5-flash-image    – Gemini Flash Image (generateContent API) ← ต้องใช้ Paid plan
 *
 * บันทึกผลเป็น .png ลงในโฟลเดอร์ output/
 *
 * Usage:
 *   node src/utils/geminiImageTest.js
 *   node src/utils/geminiImageTest.js "A calm forest with sunlight" imagen
 *   node src/utils/geminiImageTest.js "A calm forest with sunlight" gemini
 */

require('dotenv').config();
const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ─── Config ───────────────────────────────────────────────────────────────────

const API_KEY    = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.resolve(__dirname, '../../output');

const MODELS = {
  imagen: 'imagen-4.0-generate-001',   // predict API
  gemini: 'gemini-2.5-flash-image',    // generateContent API
};

// ─── HTTP helper ─────────────────────────────────────────────────────────────

function httpsPost(apiPath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path:     `${apiPath}?key=${API_KEY}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        if (res.statusCode !== 200) {
          const err = new Error(`API error ${res.statusCode}`);
          err.statusCode = res.statusCode;
          err.body       = parsed;
          return reject(err);
        }
        resolve(parsed);
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// ─── Retry with exponential backoff ──────────────────────────────────────────

async function withRetry(fn, maxRetries = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;

      // 429 → wait the suggested delay then retry
      if (err.statusCode === 429) {
        const retryDelay = err.body?.error?.details
          ?.find((d) => d['@type']?.includes('RetryInfo'))
          ?.retryDelay;
        const waitMs = retryDelay
          ? parseInt(retryDelay) * 1000
          : Math.pow(2, attempt) * 1000;

        console.warn(`⏳  Rate limited. Waiting ${waitMs / 1000}s before retry ${attempt}/${maxRetries}...`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      // 400 on Imagen → paid plan required, no point retrying
      if (err.statusCode === 400 && err.body?.error?.message?.includes('paid')) {
        console.error('\n⚠️  This model requires a Paid plan on Google AI Studio.');
        console.error('   Upgrade at: https://ai.dev/projects\n');
        throw err;
      }

      throw err;
    }
  }
  throw lastErr;
}

// ─── Imagen 4 (predict API) ──────────────────────────────────────────────────

async function generateWithImagen(prompt) {
  const model = MODELS.imagen;
  console.log(`    Model  : ${model}`);

  const response = await withRetry(() =>
    httpsPost(`/v1beta/models/${model}:predict`, {
      instances:  [{ prompt }],
      parameters: { sampleCount: 1 },
    })
  );

  const predictions = response.predictions || [];
  if (!predictions.length) throw new Error('No predictions returned.');
  return predictions.map((p) => p.bytesBase64Encoded);
}

// ─── Gemini Flash Image (generateContent API) ─────────────────────────────────

async function generateWithGemini(prompt) {
  const model = MODELS.gemini;
  console.log(`    Model  : ${model}`);

  const response = await withRetry(() =>
    httpsPost(`/v1beta/models/${model}:generateContent`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    })
  );

  const parts = response.candidates?.[0]?.content?.parts || [];
  const images = parts
    .filter((p) => p.inlineData?.mimeType?.startsWith('image/'))
    .map((p)  => p.inlineData.data);

  if (!images.length) throw new Error('No image data in response.');
  return images;
}

// ─── Save helper ──────────────────────────────────────────────────────────────

function saveImages(base64List) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return base64List.map((b64, i) => {
    const filename = `gemini_image_${timestamp}_${i + 1}.png`;
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
    return filePath;
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    console.error('❌  GEMINI_API_KEY is not set. Check your .env file.');
    process.exit(1);
  }

  const prompt    = process.argv[2]
    || 'A peaceful counseling room with soft warm lighting, green plants, and two comfortable chairs';
  const modelFlag = (process.argv[3] || 'imagen').toLowerCase();

  if (!MODELS[modelFlag]) {
    console.error(`❌  Unknown model flag "${modelFlag}". Use "imagen" or "gemini".`);
    process.exit(1);
  }

  console.log('🎨  Generating image...');
  console.log(`    Prompt : "${prompt}"\n`);

  const base64Images = modelFlag === 'imagen'
    ? await generateWithImagen(prompt)
    : await generateWithGemini(prompt);

  const savedFiles = saveImages(base64Images);
  savedFiles.forEach((f) => console.log(`✅  Saved : ${f}`));
  console.log(`\n🖼️   ${savedFiles.length} image(s) saved to: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  if (!err.message.includes('paid')) {
    console.error('❌  Error:', err.message);
  }
  process.exit(1);
});
