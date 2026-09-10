// Content editors often paste from Word/Zalo/Facebook into Decap CMS's
// markdown editor, which can leave raw HTML fragments and stray HTML
// entities (&nbsp;, &amp;, curly quotes as entities, ...) inside the
// markdown body. This prebuild step converts any embedded HTML back to
// clean markdown (turndown) and decodes leftover entities (he), so
// src/content/**/*.md always renders as plain markdown.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import he from 'he';
import TurndownService from 'turndown';

const { decode } = he;

const root = fileURLToPath(new URL('..', import.meta.url));
const contentDir = path.join(root, 'src', 'content');
const turndown = new TurndownService({ headingStyle: 'atx' });

const FRONTMATTER = /^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/;
// Deliberately narrow: only the block-level tags and `style="..."` markup
// that Word/Zalo/Facebook actually paste in (div, span, p, font, table,
// Word's <o:p>, MSO conditional comments...). Running turndown over the
// *whole* body re-serializes it as if it were pure HTML, which mangles
// markdown we authored on purpose (escapes **bold**, collapses blank
// lines, etc.) - so simple inline tags authors use intentionally in
// markdown (<br />, <strong>, <em>...) must NOT trigger this.
const HAS_HTML =
  /<(div|span|p|font|table|thead|tbody|tr|td|th|o:p|meta|style|section|article)\b[^>]*>|style\s*=\s*"/i;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

async function sanitizeFile(file) {
  const raw = await readFile(file, 'utf8');
  const match = raw.match(FRONTMATTER);
  const frontmatter = match ? match[1] : '';
  const body = match ? match[2] : raw;

  if (!HAS_HTML.test(body)) return;

  const cleaned = decode(turndown.turndown(body)).trim() + '\n';
  await writeFile(file, frontmatter + cleaned, 'utf8');
  console.log(`[sanitize-content] cleaned ${path.relative(root, file)}`);
}

const files = await walk(contentDir);
await Promise.all(files.map(sanitizeFile));
