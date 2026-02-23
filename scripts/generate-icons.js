const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background circle
  ctx.fillStyle = '#4F6EF7';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();

  // ₹ symbol
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₹', size/2, size/2);

  return canvas.toBuffer('image/png');
}

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Generate icons
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generateIcon(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generateIcon(512));

console.log('✅ Icons generated successfully!');
console.log('   - public/icons/icon-192.png');
console.log('   - public/icons/icon-512.png');
