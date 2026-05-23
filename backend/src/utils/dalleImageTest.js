/**
 * DALL-E Image Generation Test
 * สร้างรูปภาพจาก text prompt โดยใช้ OpenAI DALL-E 3
 * บันทึกเป็น .png ลงในโฟลเดอร์ output/
 *
 * Usage:
 *   node src/utils/dalleImageTest.js
 *   node src/utils/dalleImageTest.js "A calm forest with sunlight"
 *   node src/utils/dalleImageTest.js "A calm forest" 1024x1024
 *   node src/utils/dalleImageTest.js "A calm forest" 1792x1024   ← landscape
 *   node src/utils/dalleImageTest.js "A calm forest" 1024x1792   ← portrait
 *
 * Available sizes (DALL-E 3):
 *   1024x1024  (square)
 *   1792x1024  (landscape)
 *   1024x1792  (portrait)
 */

require('dotenv').config();
const fs    = require('fs');
const path  = require('path');
const https = require('https');
const { OpenAI } = require('openai');

// ─── Config ───────────────────────────────────────────────────────────────────

const API_KEY    = process.env.OPENAI_API_KEY;
const OUTPUT_DIR = path.resolve(__dirname, '../../output');

const VALID_SIZES = ['1024x1024', '1792x1024', '1024x1792'];

// ─── Download image URL → Buffer ─────────────────────────────────────────────

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end',  ()      => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ─── Save image to output/ ────────────────────────────────────────────────────

function saveImage(buffer, index = 1) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename  = `dalle_image_${timestamp}_${index}.png`;
  const filePath  = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

// ─── Generate with DALL-E 3 ───────────────────────────────────────────────────

async function generateImage(prompt, size = '1024x1024') {
  const client = new OpenAI({ apiKey: API_KEY });

  console.log('    Model  : dall-e-3');
  console.log(`    Size   : ${size}\n`);

  const response = await client.images.generate({
    model:   'dall-e-3',
    prompt,
    n:       1,           // DALL-E 3 supports n=1 only
    size,
    quality: 'standard',  // 'standard' | 'hd'
    response_format: 'url',
  });

  return response.data;   // array of { url, revised_prompt }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    console.error('❌  OPENAI_API_KEY is not set.');
    console.error('   Add it to backend/.env:  OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  const prompt = process.argv[2]
    || 'A calm forest with sunlight filtering through tall trees, peaceful atmosphere';

  const size = process.argv[3] || '1024x1024';
  if (!VALID_SIZES.includes(size)) {
    console.error(`❌  Invalid size "${size}". Choose from: ${VALID_SIZES.join(', ')}`);
    process.exit(1);
  }

  console.log('🎨  Generating image with DALL-E 3...');
  console.log(`    Prompt : "${prompt}"`);

  const images = await generateImage(prompt, size);

  const savedFiles = [];
  for (let i = 0; i < images.length; i++) {
    const { url, revised_prompt } = images[i];

    if (revised_prompt && revised_prompt !== prompt) {
      console.log(`\n📝  Revised prompt: "${revised_prompt}"`);
    }

    process.stdout.write(`⬇️   Downloading image ${i + 1}/${images.length}...`);
    const buffer   = await downloadImage(url);
    const filePath = saveImage(buffer, i + 1);
    process.stdout.write(' done\n');

    console.log(`✅  Saved : ${filePath}`);
    savedFiles.push(filePath);
  }

  console.log(`\n🖼️   ${savedFiles.length} image(s) saved to: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  // OpenAI SDK wraps errors with a .status property
  const status = err.status || err.statusCode;
  const msg    = err.message || String(err);

  if (status === 401) {
    console.error('❌  Invalid API key. Check OPENAI_API_KEY in backend/.env');
  } else if (status === 429) {
    console.error('❌  Rate limited or quota exceeded.');
    console.error('   Check your plan: https://platform.openai.com/account/billing');
  } else if (status === 400) {
    console.error('❌  Bad request:', msg);
  } else {
    console.error('❌  Error:', msg);
  }
  process.exit(1);
});
