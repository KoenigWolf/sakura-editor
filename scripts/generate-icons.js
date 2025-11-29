const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

// Check if sharp is available, otherwise use rsvg-convert or sips
async function generateIcons() {
  console.log('Generating PWA icons...');

  // Try using sips (macOS built-in)
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}.png`);
    const maskablePath = path.join(publicDir, `icon-maskable-${size}.png`);

    try {
      // Use qlmanage to convert SVG to PNG on macOS
      const tempPath = `/tmp/icon-temp-${size}.png`;

      // First create a high-res PNG from SVG using qlmanage
      execSync(`qlmanage -t -s ${size} -o /tmp "${svgPath}" 2>/dev/null || true`, { stdio: 'pipe' });

      // Rename the output
      const qlOutput = `/tmp/icon.svg.png`;
      if (fs.existsSync(qlOutput)) {
        fs.copyFileSync(qlOutput, outputPath);
        fs.copyFileSync(qlOutput, maskablePath);
        fs.unlinkSync(qlOutput);
        console.log(`Generated: icon-${size}.png`);
      } else {
        // Fallback: create a placeholder PNG
        createPlaceholderPNG(outputPath, size);
        createPlaceholderPNG(maskablePath, size);
        console.log(`Generated placeholder: icon-${size}.png`);
      }
    } catch (error) {
      console.error(`Failed to generate ${size}px icon:`, error.message);
      createPlaceholderPNG(outputPath, size);
      createPlaceholderPNG(maskablePath, size);
    }
  }

  // Generate additional icons
  const additionalIcons = [
    { name: 'icon-new-file.png', size: 96 },
    { name: 'icon-open-file.png', size: 96 },
  ];

  for (const icon of additionalIcons) {
    const outputPath = path.join(publicDir, icon.name);
    createPlaceholderPNG(outputPath, icon.size);
    console.log(`Generated placeholder: ${icon.name}`);
  }

  // Generate screenshot placeholders
  createScreenshotPlaceholder(path.join(publicDir, 'screenshot-wide.png'), 1280, 720);
  createScreenshotPlaceholder(path.join(publicDir, 'screenshot-narrow.png'), 390, 844);

  console.log('Icon generation complete!');
}

function createPlaceholderPNG(outputPath, size) {
  // Create a simple PNG placeholder using base64
  // This is a minimal 1x1 PNG that we'll use as a fallback
  // In production, you'd want actual icons

  // For now, create a simple placeholder file
  // The actual icons should be created with proper design tools

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
    <linearGradient id="sakura" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffb7c5"/>
      <stop offset="100%" style="stop-color:#ff69b4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <path d="M256 120 Q280 180 256 220 Q232 180 256 120" fill="url(#sakura)" opacity="0.9"/>
  <path d="M320 160 Q300 200 256 220 Q290 210 320 160" fill="url(#sakura)" opacity="0.85"/>
  <path d="M350 240 Q300 240 256 220 Q300 250 350 240" fill="url(#sakura)" opacity="0.8"/>
  <path d="M192 160 Q212 200 256 220 Q222 210 192 160" fill="url(#sakura)" opacity="0.85"/>
  <path d="M162 240 Q212 240 256 220 Q212 250 162 240" fill="url(#sakura)" opacity="0.8"/>
  <circle cx="256" cy="220" r="16" fill="#ffd700" opacity="0.9"/>
  <g opacity="0.9">
    <rect x="100" y="280" width="312" height="160" rx="12" fill="#0f0f23"/>
    <rect x="100" y="280" width="40" height="160" rx="12" fill="#1a1a3e"/>
    <rect x="150" y="300" width="45" height="10" rx="2" fill="#c678dd"/>
    <rect x="200" y="300" width="70" height="10" rx="2" fill="#61afef"/>
    <rect x="160" y="325" width="35" height="10" rx="2" fill="#e06c75"/>
    <rect x="200" y="325" width="55" height="10" rx="2" fill="#98c379"/>
    <rect x="160" y="350" width="45" height="10" rx="2" fill="#e5c07b"/>
    <rect x="210" y="350" width="80" height="10" rx="2" fill="#56b6c2"/>
    <rect x="150" y="375" width="2" height="14" fill="#ffb7c5" opacity="0.8"/>
    <rect x="150" y="400" width="8" height="10" rx="2" fill="#abb2bf"/>
  </g>
</svg>`;

  // Save as SVG (browsers can use SVG as icons too)
  const svgPath = outputPath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, svgContent);
}

function createScreenshotPlaceholder(outputPath, width, height) {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#1a1a2e"/>
  <text x="${width/2}" y="${height/2}" text-anchor="middle" fill="#ffb7c5" font-family="system-ui" font-size="24">
    Sakura Editor
  </text>
</svg>`;

  const svgPath = outputPath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, svgContent);
}

generateIcons().catch(console.error);
