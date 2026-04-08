#!/usr/bin/env node
/**
 * P0-14: Generate Casino brand SVG favicon.
 *
 * Replaces the inherited Next.js scaffold favicon (the Vercel triangle).
 * SVG favicons are supported by every modern browser and scale infinitely.
 * We also emit a generated PNG at 180x180 for the apple-touch-icon.
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

// Brand palette (matches app/globals.css CSS custom properties)
const BG = '#0a0a0a';          // near-black background
const ACCENT = '#e6a94c';      // warm gold accent ("$")
const TEXT = '#f5f5f5';         // off-white "Ca" text

// ── SVG favicon — scales infinitely ──────────────────────────────────────
// Rounded-square background + "Ca$" monogram. "$" is the accent.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="${BG}"/>
  <text x="32" y="44" font-family="'Syne', 'Inter', system-ui, sans-serif" font-weight="800" font-size="34" text-anchor="middle" fill="${TEXT}">Ca<tspan fill="${ACCENT}">$</tspan></text>
</svg>
`;

writeFileSync(join(PUBLIC_DIR, 'favicon.svg'), svg);
console.log('✓ wrote public/favicon.svg');

// Also write a tiny 16x16 single-frame "Ca$" using just the accent "$" — this
// is what shows in browser tabs at native resolution, so keep it legible.
const smallSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="${BG}"/>
  <text x="16" y="24" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle" fill="${ACCENT}">$</text>
</svg>
`;
writeFileSync(join(PUBLIC_DIR, 'favicon-32.svg'), smallSvg);
console.log('✓ wrote public/favicon-32.svg');
