// Simple script to generate PWA icons using Canvas
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// For Node.js, we'll use a simple SVG instead
const generateIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fb923c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f97316;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#030712"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="url(#grad)" opacity="0.8"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.25}" fill="none" stroke="#fb923c" stroke-width="${size * 0.02}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.15}" fill="none" stroke="#fb923c" stroke-width="${size * 0.015}"/>
  <path d="M ${size/2 - size*0.1} ${size/2} L ${size/2 + size*0.1} ${size/2} M ${size/2} ${size/2 - size*0.1} L ${size/2} ${size/2 + size*0.1}"
        stroke="#fff" stroke-width="${size * 0.02}" stroke-linecap="round"/>
</svg>
`;

const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
[192, 512].forEach(size => {
  const svg = generateIconSVG(size);
  const filename = `icon-${size}.svg`;
  fs.writeFileSync(path.join(publicDir, filename), svg);
  console.log(`Generated ${filename}`);
});

console.log('Icons generated successfully!');
console.log('Note: For production, convert SVGs to PNGs using an image converter');
