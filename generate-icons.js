// Simple icon generator for BachatBro PWA
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icon
const generateSVG = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background -->
  <rect width="${size}" height="${size}" fill="#0A0A0F"/>
  
  <!-- Blue circle background -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="#4F6EF7"/>
  
  <!-- White ₹ symbol -->
  <text x="${size/2}" y="${size/2 + size * 0.15}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.4}" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle">₹</text>
</svg>`;
};

// Save SVG files
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), generateSVG(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), generateSVG(512));

console.log('✅ Icon SVG files generated in public/icons/');
console.log('📝 Note: For production, convert these SVGs to PNG using an online tool or sharp library');
console.log('   Visit: https://svgtopng.com/ or use: npm install sharp');
