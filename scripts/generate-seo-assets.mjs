#!/usr/bin/env node
/**
 * P0-20: Build-time SEO/GEO asset generator for Casino.
 *
 * Runs before `vite build` to produce:
 *   - public/sitemap.xml — lists all public routes with lastmod timestamps
 *   - public/llms-full.txt — concatenated Markdown of public page content for LLM crawlers
 *
 * This script is the Casino-specific version. Phase E generalizes it into
 * the sage-data-science seo_optimize pipeline so every Casino-generated app
 * gets the same treatment automatically.
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const PUBLIC_DIR = join(REPO_ROOT, 'public');
const BASE_URL = process.env.VITE_SITE_URL || 'https://casino.flowstack.fun';

if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });

// ─── sitemap.xml ────────────────────────────────────────────────────────
// Only public, indexable routes. Authenticated routes (/workspace, /login,
// /register, /complete) are excluded — they're behind auth and shouldn't
// be in the sitemap.
const routes = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/infer', changefreq: 'monthly', priority: 0.9 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
];

const lastmod = new Date().toISOString().split('T')[0];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml);
console.log(`✓ Wrote sitemap.xml with ${routes.length} routes`);

// ─── llms-full.txt ──────────────────────────────────────────────────────
// Concatenated Markdown of public page content for aggressive LLM consumption.
// Strips JSX/HTML and keeps just the readable prose from each public page.
// We don't try to be perfect — we aim for high-signal, low-noise extraction.
function extractText(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  // Extract string literals inside JSX text nodes + heading content.
  // Conservative: pulls <h1>...text...</h1>, <p>...text...</p>, etc.
  const textBlocks = [];
  const tagPattern = /<(h1|h2|h3|p|li|strong)[^>]*>([^<>{]+)<\/\1>/g;
  let match;
  while ((match = tagPattern.exec(raw)) !== null) {
    const text = match[2].trim().replace(/\s+/g, ' ');
    if (text.length > 3) textBlocks.push(text);
  }
  return textBlocks.join('\n\n');
}

const publicPages = [
  { title: 'Ca$ino Builder — Home', file: 'src/pages/Landing.tsx', url: '/' },
  { title: 'Infer & AGENT Tokens', file: 'src/pages/Infer.tsx', url: '/infer' },
  { title: 'Privacy Policy', file: 'src/pages/Privacy.tsx', url: '/privacy' },
  { title: 'Terms of Service', file: 'src/pages/Terms.tsx', url: '/terms' },
];

let llmsFull = '# Ca$ino Builder — Full Content\n\n';
llmsFull += '> Complete public-site content in Markdown form for LLM crawlers.\n\n';
llmsFull += `Generated: ${new Date().toISOString()}\n\n`;
llmsFull += '---\n\n';

for (const page of publicPages) {
  const filePath = join(REPO_ROOT, page.file);
  if (!existsSync(filePath)) {
    console.warn(`  ⚠ skip ${page.file} (not found)`);
    continue;
  }
  const content = extractText(filePath);
  llmsFull += `## ${page.title}\n\n`;
  llmsFull += `URL: ${BASE_URL}${page.url}\n\n`;
  llmsFull += content;
  llmsFull += '\n\n---\n\n';
}

writeFileSync(join(PUBLIC_DIR, 'llms-full.txt'), llmsFull);
console.log(`✓ Wrote llms-full.txt from ${publicPages.length} pages`);
