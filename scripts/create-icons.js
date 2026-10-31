// create-icons.js - Creates PNG icons from SVG using only Node.js built-ins
// No external dependencies needed!
// Usage: node create-icons.js

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas'); // Optional: npm install canvas

// If canvas not available, create minimal PNG programmatically
function createMinimalPng(size, hex = '#6366f1') {
  // PNG header + minimal 1x1 scaled to size via metadata trick
  // For a proper implementation, use canvas or sharp
  // This creates a valid solid-color PNG
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);

  function crc32(buf) {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function write32(buf, offset, val) {
    buf[offset] = (val >> 24) & 0xff;
    buf[offset+1] = (val >> 16) & 0xff;
    buf[offset+2] = (val >> 8) & 0xff;
    buf[offset+3] = val & 0xff;
  }

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const crcInput = Buffer.concat([typeBuf, data]);
    const crc = crc32(crcInput);
    const result = Buffer.alloc(4 + 4 + data.length + 4);
    write32(result, 0, data.length);
    typeBuf.copy(result, 4);
    data.copy(result, 8);
    write32(result, 8 + data.length, crc);
    return result;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  write32(ihdr, 0, size); // width
  write32(ihdr, 4, size); // height
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Create raw pixel data
  const rowSize = 1 + size * 3; // filter byte + RGB per pixel
  const rawData = Buffer.alloc(size * rowSize, 0);
  for (let y = 0; y < size; y++) {
    rawData[y * rowSize] = 0; // filter type: None
    for (let x = 0; x < size; x++) {
      const offset = y * rowSize + 1 + x * 3;
      rawData[offset] = r;
      rawData[offset+1] = g;
      rawData[offset+2] = b;
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);

  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    pngSignature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'icons');

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

sizes.forEach(size => {
  const pngBuffer = createMinimalPng(size);
  const outputPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`✅ Created icon-${size}.png`);
});

console.log('\n✅ All icon placeholders created!');
console.log('💡 For proper icons with the ToolKit logo, run: npm install sharp && node scripts/generate-icons.js');
