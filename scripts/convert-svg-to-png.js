/**
 * SVG to PNG conversion script
 * Converts all SVG icons to PNG for WeChat mini-program compatibility
 */

const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

// Directories
const tabbarDir = path.join(__dirname, '../src/static/icons/tabbar');
const imagesDir = path.join(__dirname, '../src/static/images');
const extraDir = path.join(__dirname, '../src/static/icons/extra');

// Convert single SVG to PNG
function convertSvgToPng(svgPath, pngPath, scale = 3) {
  try {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const resvg = new Resvg(svgContent, {
      fitTo: {
        mode: 'zoom',
        value: scale,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    fs.writeFileSync(pngPath, pngBuffer);
    console.log(`✓ Converted: ${path.basename(svgPath)} -> ${path.basename(pngPath)}`);
  } catch (error) {
    console.error(`✗ Failed to convert ${svgPath}:`, error.message);
  }
}

// Convert all SVG files in a directory
function convertDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.svg')) {
      const svgPath = path.join(dir, file);
      const pngPath = path.join(dir, file.replace('.svg', '.png'));
      convertSvgToPng(svgPath, pngPath);
    }
  }
}

// Create additional icons needed for inline SVGs
function createExtraIcons() {
  if (!fs.existsSync(extraDir)) {
    fs.mkdirSync(extraDir, { recursive: true });
  }

  // Compare icon for gallery.vue
  const compareIconSvg = `<svg viewBox="0 0 24 24" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="#9E8F7D"/>
  </svg>`;

  const compareIconActiveSvg = `<svg viewBox="0 0 24 24" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="#E07A5F"/>
  </svg>`;

  // Write letter icon for mailbox.vue
  const writeIconSvg = `<svg viewBox="0 0 24 24" width="96" height="96" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#E07A5F"/>
  </svg>`;

  const icons = [
    { name: 'compare', svg: compareIconSvg },
    { name: 'compare-active', svg: compareIconActiveSvg },
    { name: 'write', svg: writeIconSvg },
  ];

  for (const icon of icons) {
    const svgPath = path.join(extraDir, `${icon.name}.svg`);
    const pngPath = path.join(extraDir, `${icon.name}.png`);
    fs.writeFileSync(svgPath, icon.svg);
    convertSvgToPng(svgPath, pngPath);
  }
}

// Main execution
console.log('Converting SVG icons to PNG for WeChat mini-program...\n');

console.log('Converting tabbar icons:');
convertDirectory(tabbarDir);

console.log('\nConverting images:');
convertDirectory(imagesDir);

console.log('\nCreating extra icons:');
createExtraIcons();

console.log('\nDone!');
