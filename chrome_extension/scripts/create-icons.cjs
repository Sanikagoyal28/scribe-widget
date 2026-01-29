// Creates simple PNG icons for Chrome extension
// Run: node scripts/create-icons.cjs

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const iconsDir = path.join(__dirname, '../public/icons');

// Create directory if needed
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Minimal PNG creator for simple icons
function createPNG(size, r, g, b) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk (image header)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);  // width
  ihdrData.writeUInt32BE(size, 4);  // height
  ihdrData.writeUInt8(8, 8);        // bit depth
  ihdrData.writeUInt8(2, 9);        // color type (RGB)
  ihdrData.writeUInt8(0, 10);       // compression
  ihdrData.writeUInt8(0, 11);       // filter
  ihdrData.writeUInt8(0, 12);       // interlace
  
  const ihdr = createChunk('IHDR', ihdrData);
  
  // Create raw image data with filter bytes
  const rawData = [];
  for (let y = 0; y < size; y++) {
    rawData.push(0); // filter byte (none)
    for (let x = 0; x < size; x++) {
      // Create a simple circle
      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.45;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      
      if (dist <= radius) {
        rawData.push(r, g, b); // primary color
      } else {
        rawData.push(255, 255, 255); // white background
      }
    }
  }
  
  // Use zlib for proper deflate compression
  const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
  const idat = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData) >>> 0, 0);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC32 lookup table
const crcTable = (function() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons with Eka blue color (#2563eb = rgb(37, 99, 235))
const sizes = [16, 32, 48, 128];
const r = 37, g = 99, b = 235;

sizes.forEach(size => {
  const png = createPNG(size, r, g, b);
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Created ${filePath}`);
});

console.log('\nIcons created successfully!');
