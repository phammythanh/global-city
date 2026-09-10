// Pads the logo into a square transparent PNG favicon. Runs as an npm
// `predev`/`prebuild` step. If src/assets/logo.png is a mark-over-wordmark
// lockup, crop it to just the mark first for a cleaner favicon.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const logoPath = path.join(root, 'src', 'assets', 'logo.png');
const outFile = path.join(root, 'public', 'favicon.png');

await mkdir(path.dirname(outFile), { recursive: true });
await sharp(logoPath)
  .resize({
    width: 512,
    height: 512,
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(outFile);

console.log(`[generate-favicon] wrote ${path.relative(root, outFile)}`);
