// Crops the hexagon mark out of the top of the logo lockup (the "THE
// GLOBAL CITY" wordmark below it is unreadable at favicon size) and pads
// it into a square transparent PNG. Runs as an npm `predev`/`prebuild`
// step. If src/assets/logo.png is replaced with art that isn't a
// mark-over-wordmark lockup, adjust or drop the crop below.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const logoPath = path.join(root, 'src', 'assets', 'logo.png');
const outFile = path.join(root, 'public', 'favicon.png');

const { width, height } = await sharp(logoPath).metadata();
// The hexagon mark sits in roughly the top 70% of the lockup; the "THE
// GLOBAL CITY" wordmark fills the rest.
const markHeight = Math.round(height * 0.7);

// Two separate pipelines: chaining .extract().trim() in one sharp()
// pipeline throws "extract_area: bad extract area" on some libvips builds.
const cropped = await sharp(logoPath)
  .extract({ left: 0, top: 0, width, height: markHeight })
  .toBuffer();
const mark = await sharp(cropped).trim().toBuffer();

await mkdir(path.dirname(outFile), { recursive: true });
await sharp(mark)
  .resize({
    width: 512,
    height: 512,
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(outFile);

console.log(`[generate-favicon] wrote ${path.relative(root, outFile)}`);
