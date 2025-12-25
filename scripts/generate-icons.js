const sharp = require('sharp');
const path = require('path');

const primaryColor = '#3713ec';
const backgroundColor = '#131022';

async function generateIcon(size, filename) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="${primaryColor}"/>
      <polygon points="${size*0.35},${size*0.4} ${size*0.35},${size*0.6} ${size*0.7},${size*0.5}" fill="white"/>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(__dirname, 'app', 'assets', filename));
  
  console.log(`Created ${filename} (${size}x${size})`);
}

async function generateAdaptiveIcon(size, filename) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.25}" fill="${primaryColor}"/>
      <polygon points="${size*0.4},${size*0.42} ${size*0.4},${size*0.58} ${size*0.65},${size*0.5}" fill="white"/>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(__dirname, 'app', 'assets', filename));
  
  console.log(`Created ${filename} (${size}x${size})`);
}

async function generateSplash(width, height, filename) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
      <circle cx="${width/2}" cy="${height/2}" r="80" fill="${primaryColor}"/>
      <polygon points="${width/2 - 30},${height/2 - 25} ${width/2 - 30},${height/2 + 25} ${width/2 + 40},${height/2}" fill="white"/>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(path.join(__dirname, 'app', 'assets', filename));
  
  console.log(`Created ${filename} (${width}x${height})`);
}

async function main() {
  try {
    await generateIcon(1024, 'icon.png');
    await generateAdaptiveIcon(1024, 'adaptive-icon.png');
    await generateIcon(48, 'favicon.png');
    await generateSplash(1284, 2778, 'splash.png');
    console.log('\nAll icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();
