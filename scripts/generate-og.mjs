// Generates a static default Open Graph image (1200x630) from the project's
// cover render, so link previews (Zalo, Facebook, Messenger...) show a real
// project image instead of a blank card. Runs as an npm `prebuild` step.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const coverPath = path.join(root, 'src', 'assets', 'og-cover.png');
const outDir = path.join(root, 'public', 'og');
const outFile = path.join(outDir, 'default.jpg');

const WIDTH = 1200;
const HEIGHT = 630;

await mkdir(outDir, { recursive: true });
await sharp(coverPath)
  .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 90 })
  .toFile(outFile);

console.log(`[generate-og] wrote ${path.relative(root, outFile)}`);
