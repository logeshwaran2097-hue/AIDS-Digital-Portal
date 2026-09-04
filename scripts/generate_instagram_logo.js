const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateInstagramStyleLogo() {
  const emblemBuffer = fs.readFileSync(path.join(__dirname, '../public/college-emblem.png'));
  const emblemBase64 = `data:image/png;base64,${emblemBuffer.toString('base64')}`;

  // SVG Template 512x512
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Instagram-style Multi-Stop Vibrant Gradient (VSB AI&DS Signature) -->
    <linearGradient id="instaVsbGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#051329" />
      <stop offset="25%" stop-color="#0A2D74" />
      <stop offset="50%" stop-color="#1455D9" />
      <stop offset="75%" stop-color="#06B6D4" />
      <stop offset="92%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#FDE047" />
    </linearGradient>

    <!-- Radial Sunlight Flare in Top-Right -->
    <radialGradient id="topRightGlow" cx="85%" cy="15%" r="65%">
      <stop offset="0%" stop-color="#FDE047" stop-opacity="0.85" />
      <stop offset="40%" stop-color="#06B6D4" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#06B6D4" stop-opacity="0" />
    </radialGradient>

    <!-- Deep Ambient Glow in Bottom-Left -->
    <radialGradient id="bottomLeftGlow" cx="15%" cy="85%" r="70%">
      <stop offset="0%" stop-color="#030C1D" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#1455D9" stop-opacity="0" />
    </radialGradient>

    <!-- Golden Ring for Inner Emblem Disc -->
    <linearGradient id="innerGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="35%" stop-color="#EAB308" />
      <stop offset="70%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#FACC15" />
    </linearGradient>

    <!-- Filter for Drop Shadow -->
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#030C1D" flood-opacity="0.5" />
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#030C1D" flood-opacity="0.3" />
    </filter>

    <filter id="glowGold" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#FACC15" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Squircle Base with 22.5% Corner Radius (Instagram / iOS / Android Standard) -->
  <rect x="16" y="16" width="480" height="480" rx="112" ry="112" fill="url(#instaVsbGrad)" />
  <rect x="16" y="16" width="480" height="480" rx="112" ry="112" fill="url(#topRightGlow)" />
  <rect x="16" y="16" width="480" height="480" rx="112" ry="112" fill="url(#bottomLeftGlow)" />

  <!-- Outer Glass Specular Border Highlight -->
  <rect x="16" y="16" width="480" height="480" rx="112" ry="112" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" />

  <!-- Inner Luminous Pure White Disc with Gold/Cyan Border (Housing Authentic Emblem) -->
  <g filter="url(#softShadow)">
    <circle cx="256" cy="256" r="162" fill="#FFFFFF" />
    <circle cx="256" cy="256" r="162" fill="none" stroke="url(#innerGoldRim)" stroke-width="6" />
    <circle cx="256" cy="256" r="156" fill="none" stroke="rgba(6, 182, 212, 0.4)" stroke-width="2" stroke-dasharray="8 6" />
  </g>

  <!-- Authentic VSB College Emblem (Crisp High-Resolution Placement) -->
  <image href="${emblemBase64}" x="126" y="126" width="260" height="260" preserveAspectRatio="xMidYMid meet" />

  <!-- Sparkling Golden AI Sparkle at Top Right of Badge -->
  <g transform="translate(376, 116)" filter="url(#glowGold)">
    <path d="M 0 -18 Q 0 0 18 0 Q 0 0 0 18 Q 0 0 -18 0 Q 0 0 0 -18 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5" />
    <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
  </g>

  <!-- Small Diamond Starlet at Bottom Left -->
  <g transform="translate(136, 386) scale(0.65)" filter="url(#glowGold)">
    <path d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z" fill="#FEF08A" />
  </g>
</svg>`;

  // Write the primary logo.svg
  const svgPath = path.join(__dirname, '../public/logo.svg');
  fs.writeFileSync(svgPath, svgContent);
  console.log('Written public/logo.svg');

  // Generate 512x512 icon
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/icon-512.png'));
  console.log('Generated public/icon-512.png');

  // Generate 192x192 icon
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '../public/icon-192.png'));
  console.log('Generated public/icon-192.png');

  // Generate apple-touch-icon 180x180
  await sharp(Buffer.from(svgContent))
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png');

  // Generate shortcut-icon-96.png
  await sharp(Buffer.from(svgContent))
    .resize(96, 96)
    .png()
    .toFile(path.join(__dirname, '../public/shortcut-icon-96.png'));
  console.log('Generated public/shortcut-icon-96.png');

  // Also write a copy to public/logo.png
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/logo.png'));
  console.log('Generated public/logo.png');

  // Maskable SVG with full-bleed background for Android Adaptive Icons
  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="instaVsbGradM" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#051329" />
      <stop offset="25%" stop-color="#0A2D74" />
      <stop offset="50%" stop-color="#1455D9" />
      <stop offset="75%" stop-color="#06B6D4" />
      <stop offset="92%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#FDE047" />
    </linearGradient>
    <radialGradient id="topRightGlowM" cx="85%" cy="15%" r="65%">
      <stop offset="0%" stop-color="#FDE047" stop-opacity="0.85" />
      <stop offset="40%" stop-color="#06B6D4" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#06B6D4" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="bottomLeftGlowM" cx="15%" cy="85%" r="70%">
      <stop offset="0%" stop-color="#030C1D" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#1455D9" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="innerGoldRimM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="35%" stop-color="#EAB308" />
      <stop offset="70%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#FACC15" />
    </linearGradient>
    <filter id="softShadowM" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#030C1D" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Full Bleed Square (Android mask cuts to circle/squircle) -->
  <rect x="0" y="0" width="512" height="512" fill="url(#instaVsbGradM)" />
  <rect x="0" y="0" width="512" height="512" fill="url(#topRightGlowM)" />
  <rect x="0" y="0" width="512" height="512" fill="url(#bottomLeftGlowM)" />

  <!-- Inner Badge within 65% safe zone -->
  <g filter="url(#softShadowM)">
    <circle cx="256" cy="256" r="140" fill="#FFFFFF" />
    <circle cx="256" cy="256" r="140" fill="none" stroke="url(#innerGoldRimM)" stroke-width="5" />
    <circle cx="256" cy="256" r="135" fill="none" stroke="rgba(6, 182, 212, 0.4)" stroke-width="1.8" stroke-dasharray="7 5" />
  </g>

  <image href="${emblemBase64}" x="146" y="146" width="220" height="220" preserveAspectRatio="xMidYMid meet" />

  <g transform="translate(356, 140) scale(0.85)">
    <path d="M 0 -18 Q 0 0 18 0 Q 0 0 0 18 Q 0 0 -18 0 Q 0 0 0 -18 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5" />
  </g>
</svg>`;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/maskable-icon-512.png'));
  console.log('Generated public/maskable-icon-512.png');

  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '../public/maskable-icon-192.png'));
  console.log('Generated public/maskable-icon-192.png');

  console.log('All Instagram-style icons generated successfully!');
}

generateInstagramStyleLogo().catch(console.error);
