// generate-icons.js - Run with Node.js to create PWA icons from the source image
// Usage: node generate-icons.js
// Requires: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  // Create a simple SVG icon programmatically
  const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" rx="100" fill="#f5f6fa"/>
  <!-- Toolbox body -->
  <rect x="80" y="160" width="352" height="280" rx="24" fill="#e4e6ef" stroke="#6366f1" stroke-width="8"/>
  <!-- Toolbox handle -->
  <path d="M176 160 V120 Q256 80 336 120 V160" fill="none" stroke="#6366f1" stroke-width="16" stroke-linecap="round"/>
  <!-- Grid dividers -->
  <line x1="256" y1="160" x2="256" y2="440" stroke="#6366f1" stroke-width="4" opacity="0.4"/>
  <line x1="80" y1="300" x2="432" y2="300" stroke="#6366f1" stroke-width="4" opacity="0.4"/>
  <!-- Lock icon (top-left) -->
  <rect x="116" y="196" width="96" height="76" rx="10" fill="#6366f1" opacity="0.2"/>
  <path d="M147 238 v-14 a21 21 0 0 1 42 0 v14" fill="none" stroke="#6366f1" stroke-width="8" stroke-linecap="round"/>
  <rect x="140" y="238" width="56" height="38" rx="8" fill="#6366f1"/>
  <circle cx="168" cy="257" r="5" fill="white"/>
  <!-- Color palette (top-right) -->
  <circle cx="310" cy="234" r="36" fill="#818cf8" opacity="0.3"/>
  <circle cx="300" cy="226" r="10" fill="#ef4444"/>
  <circle cx="322" cy="220" r="10" fill="#f59e0b"/>
  <circle cx="316" cy="244" r="10" fill="#10b981"/>
  <!-- QR icon (bottom-left) -->
  <rect x="108" y="316" width="24" height="24" rx="4" fill="#6366f1"/>
  <rect x="140" y="316" width="24" height="24" rx="4" fill="#6366f1"/>
  <rect x="108" y="348" width="24" height="24" rx="4" fill="#6366f1"/>
  <rect x="140" y="348" width="12" height="12" rx="2" fill="#6366f1"/>
  <rect x="156" y="348" width="12" height="12" rx="2" fill="#6366f1"/>
  <rect x="140" y="364" width="24" height="8" rx="2" fill="#6366f1"/>
  <!-- Image compress icon (bottom-right) -->
  <rect x="280" y="320" width="100" height="68" rx="8" fill="#818cf8" opacity="0.3" stroke="#6366f1" stroke-width="4"/>
  <path d="M305 378 L330 350 L355 370 L370 355" fill="none" stroke="#6366f1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="305" cy="338" r="8" fill="#6366f1"/>
  <!-- Arrows compress -->
  <path d="M366 306 L352 320 M366 306 L352 306 M366 306 L366 320" fill="none" stroke="#6366f1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M270 406 L284 392 M270 406 L284 406 M270 406 L270 392" fill="none" stroke="#6366f1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  // Save SVG
  const svgPath = path.join(iconsDir, 'icon.svg');
  fs.writeFileSync(svgPath, svgIcon);
  console.log('✅ SVG icon saved');

  // Generate PNG icons
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}.png`);
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✅ icon-${size}.png created`);
  }

  console.log('\n🎉 All icons generated successfully!');
  console.log('Icons saved to:', iconsDir);
}

generateIcons().catch(console.error);
