// Bu faylı yaradın və node generate-icons.js çalışdırın
const fs = require('fs');

// SVG icon yaradın
const svgIcon = `
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#3b82f6" rx="24"/>
  <text x="96" y="120" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="white">REA</text>
</svg>
`;

// SVG faylını yarat
fs.writeFileSync('public/icon.svg', svgIcon);

console.log('✅ Icon yaradıldı: public/icon.svg');
console.log('Bu SVG-ni PNG-yə çevirmək üçün online converter istifadə edin');
console.log('192x192 və 512x512 ölçülərində');