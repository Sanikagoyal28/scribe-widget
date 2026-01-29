#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const extensionDir = path.join(rootDir, 'extension');

// Ensure extension directory exists
if (!fs.existsSync(extensionDir)) {
  fs.mkdirSync(extensionDir, { recursive: true });
}

// Copy UMD bundle to extension folder
const umdSource = path.join(distDir, 'scribe-widget.umd.js');
const umdDest = path.join(extensionDir, 'scribe-widget.js');

if (fs.existsSync(umdSource)) {
  fs.copyFileSync(umdSource, umdDest);
  console.log('Copied scribe-widget.umd.js -> extension/scribe-widget.js');
} else {
  console.error('Error: scribe-widget.umd.js not found. Run npm run build first.');
  process.exit(1);
}

// Copy CSS to extension folder
const cssSource = path.join(distDir, 'style.css');
const cssDest = path.join(extensionDir, 'scribe-widget.css');

if (fs.existsSync(cssSource)) {
  fs.copyFileSync(cssSource, cssDest);
  console.log('Copied style.css -> extension/scribe-widget.css');
} else {
  console.warn('Warning: style.css not found (CSS may be inlined in JS)');
  // Create empty CSS file if not exists
  fs.writeFileSync(cssDest, '/* CSS is inlined in the widget JS */');
}

// Create placeholder icons if they don't exist
const iconsDir = path.join(extensionDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('\nExtension build complete!');
console.log('To load the extension in Chrome:');
console.log('1. Open chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log('4. Select the extension folder:', extensionDir);
console.log('\nNote: Add icon files (icon16.png, icon32.png, icon48.png, icon128.png) to extension/icons/');
