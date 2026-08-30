const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateAssets() {
  const publicDir = path.join(__dirname, '..', 'public');
  const sourceImage = path.join(publicDir, 'college-emblem.png');

  console.log('Generating pixel-perfect PWA icons and screenshots with sharp...');

  // 1. icon-192.png (192x192)
  await sharp(sourceImage)
    .resize(192, 192, { fit: 'contain', background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Created icon-192.png (192x192)');

  // 2. icon-512.png (512x512)
  await sharp(sourceImage)
    .resize(512, 512, { fit: 'contain', background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Created icon-512.png (512x512)');

  // 3. maskable-icon-192.png (192x192 with safe-area padding)
  await sharp(sourceImage)
    .resize(160, 160, { fit: 'contain', background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .extend({ top: 16, bottom: 16, left: 16, right: 16, background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-192.png'));
  console.log('Created maskable-icon-192.png (192x192)');

  // 4. maskable-icon-512.png (512x512 with safe-area padding)
  await sharp(sourceImage)
    .resize(420, 420, { fit: 'contain', background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .extend({ top: 46, bottom: 46, left: 46, right: 46, background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-512.png'));
  console.log('Created maskable-icon-512.png (512x512)');

  // 5. shortcut-icon-96.png (96x96)
  await sharp(sourceImage)
    .resize(96, 96, { fit: 'contain', background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'shortcut-icon-96.png'));
  console.log('Created shortcut-icon-96.png (96x96)');

  // 6. apple-touch-icon.png (180x180)
  await sharp(sourceImage)
    .resize(180, 180, { fit: 'contain', background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png (180x180)');

  // 7. screenshot-desktop.png (1280x720 exact)
  await sharp(sourceImage)
    .resize(360, 360, { fit: 'contain', background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .extend({ top: 180, bottom: 180, left: 460, right: 460, background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'screenshot-desktop.png'));
  console.log('Created screenshot-desktop.png (1280x720)');

  // 8. screenshot-mobile.png (720x1280 exact)
  await sharp(sourceImage)
    .resize(480, 480, { fit: 'contain', background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .extend({ top: 400, bottom: 400, left: 120, right: 120, background: { r: 7, g: 26, b: 65, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'screenshot-mobile.png'));
  console.log('Created screenshot-mobile.png (720x1280)');

  console.log('All PWA assets generated successfully!');
}

generateAssets().catch(console.error);
