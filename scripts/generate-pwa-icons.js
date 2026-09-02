const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#0B0D0F"/>
  <rect x="32" y="32" width="448" height="448" rx="96" fill="url(#grad)" />
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B8F34A"/>
      <stop offset="100%" stop-color="#8EE020"/>
    </linearGradient>
  </defs>
  <path d="M120 90h270c15 0 27 12 27 27v36c0 15-12 27-27 27H200v45h150c15 0 27 12 27 27v36c0 15-12 27-27 27H200v90c0 12-9 21-21 21h-38c-12 0-21-9-21-21V111c0-12 9-21 21-21z" fill="#0B0D0F"/>
  <circle cx="365" cy="117" r="28" fill="#0B0D0F"/>
</svg>
`;

const svgMaskable = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#0B0D0F"/>
  <rect x="64" y="64" width="384" height="384" rx="80" fill="url(#grad)" />
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B8F34A"/>
      <stop offset="100%" stop-color="#8EE020"/>
    </linearGradient>
  </defs>
  <path d="M140 120h230c12 0 22 10 22 22v30c0 12-10 22-22 22H210v40h130c12 0 22 10 22 22v30c0 12-10 22-22 22H210v75c0 10-8 18-18 18h-32c-10 0-18-8-18-18V138c0-10 8-18 18-18z" fill="#0B0D0F"/>
  <circle cx="350" cy="142" r="22" fill="#0B0D0F"/>
</svg>
`;

async function generate() {
  const iconsDir = path.join(__dirname, '../public/icons');
  const publicDir = path.join(__dirname, '../public');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(svgIcon);
  const maskableBuffer = Buffer.from(svgMaskable);

  const targets = [
    { name: 'favicon-16x16.png', size: 16, buffer: svgBuffer, dir: iconsDir },
    { name: 'favicon-32x32.png', size: 32, buffer: svgBuffer, dir: iconsDir },
    { name: 'apple-touch-icon.png', size: 180, buffer: svgBuffer, dir: iconsDir },
    { name: 'icon-192x192.png', size: 192, buffer: svgBuffer, dir: iconsDir },
    { name: 'maskable-icon-192x192.png', size: 192, buffer: maskableBuffer, dir: iconsDir },
    { name: 'icon-512x512.png', size: 512, buffer: svgBuffer, dir: iconsDir },
    { name: 'maskable-icon-512x512.png', size: 512, buffer: maskableBuffer, dir: iconsDir },
    { name: 'favicon.ico', size: 32, buffer: svgBuffer, dir: publicDir },
    { name: 'favicon.ico', size: 32, buffer: svgBuffer, dir: iconsDir },
  ];

  for (const t of targets) {
    const outPath = path.join(t.dir, t.name);
    await sharp(t.buffer)
      .resize(t.size, t.size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${outPath} (${t.size}x${t.size})`);
  }
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
