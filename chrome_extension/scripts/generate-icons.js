// Simple script to generate PNG icons for the Chrome extension
// Run with: node scripts/generate-icons.js

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Simple 1x1 blue PNG for each size (placeholder)
// In production, you would use proper icon assets
const createSimpleIcon = (size) => {
  // Create a simple PNG with a blue circle on transparent background
  // This is a minimal valid PNG file structure
  
  // For now, we'll create SVG data URIs that can be converted
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="#2563eb"/>
    <path d="M16 8c-2.2 0-4 1.8-4 4v4c0 2.2 1.8 4 4 4s4-1.8 4-4v-4c0-2.2-1.8-4-4-4z" fill="white"/>
    <path d="M22 16c0 3.3-2.7 6-6 6s-6-2.7-6-6H8c0 4.1 3.1 7.5 7 7.9V26h2v-2.1c3.9-.4 7-3.8 7-7.9h-2z" fill="white"/>
  </svg>`;
  
  return svg;
};

// Generate SVG files (Chrome extensions prefer PNG, but SVG can be converted)
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const svg = createSimpleIcon(size);
  writeFileSync(resolve(iconsDir, `icon${size}.svg`), svg);
  console.log(`Generated icon${size}.svg`);
});

console.log(`
Icons generated in ${iconsDir}

Note: Chrome extensions require PNG icons. To convert:
1. Use an online SVG to PNG converter
2. Or use a tool like sharp, jimp, or canvas in Node.js
3. Or use ImageMagick: convert icon128.svg icon128.png

For development, you can also use the built-in browser dev tools
to test the extension without icons.
`);
