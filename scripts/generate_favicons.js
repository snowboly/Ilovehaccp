const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const sourceImage = path.join(repoRoot, 'public', 'Icon.png');
const outputDir = path.join(repoRoot, 'scripts', 'favicons-base64');
const publicDir = path.join(repoRoot, 'public');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateFavicons() {
  console.log('Loading source image:', sourceImage);

  // Load the source image and get its metadata
  const image = sharp(sourceImage);
  const metadata = await image.metadata();
  console.log(`Source image: ${metadata.width}x${metadata.height}`);

  // Extract a centered square from the image
  const squareSize = Math.min(metadata.width, metadata.height);
  const left = Math.floor((metadata.width - squareSize) / 2);
  const top = Math.floor((metadata.height - squareSize) / 2);

  console.log(`Extracting ${squareSize}x${squareSize} square from position (${left}, ${top})`);

  // Generate each size
  for (const { name, size } of sizes) {
    console.log(`Generating ${name} (${size}x${size})...`);

    const buffer = await sharp(sourceImage)
      .extract({ left, top, width: squareSize, height: squareSize })
      .resize(size, size, { kernel: 'lanczos3' })
      .png()
      .toBuffer();

    // Save to public directory
    const publicPath = path.join(publicDir, name);
    fs.writeFileSync(publicPath, buffer);

    // Save base64 version
    const base64Path = path.join(outputDir, `${name}.b64`);
    fs.writeFileSync(base64Path, buffer.toString('base64'));

    console.log(`  -> Saved ${publicPath}`);
    console.log(`  -> Saved ${base64Path}`);
  }

  // Generate favicon.ico (using 32x32 size)
  console.log('Generating favicon.ico...');
  const icoBuffer = await sharp(sourceImage)
    .extract({ left, top, width: squareSize, height: squareSize })
    .resize(32, 32, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  // For .ico, we'll use the PNG format wrapped as ICO
  // Since we don't have a proper ICO encoder, we'll use PNG in ICO container
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // ICO type
  icoHeader.writeUInt16LE(1, 4); // Number of images

  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(32, 0);  // Width
  icoEntry.writeUInt8(32, 1);  // Height
  icoEntry.writeUInt8(0, 2);   // Color palette
  icoEntry.writeUInt8(0, 3);   // Reserved
  icoEntry.writeUInt16LE(1, 4);  // Color planes
  icoEntry.writeUInt16LE(32, 6); // Bits per pixel
  icoEntry.writeUInt32LE(icoBuffer.length, 8); // Image size
  icoEntry.writeUInt32LE(22, 12); // Offset to image data

  const ico = Buffer.concat([icoHeader, icoEntry, icoBuffer]);

  const icoPublicPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(icoPublicPath, ico);

  const icoBase64Path = path.join(outputDir, 'favicon.ico.b64');
  fs.writeFileSync(icoBase64Path, ico.toString('base64'));

  console.log(`  -> Saved ${icoPublicPath}`);
  console.log(`  -> Saved ${icoBase64Path}`);

  // Also update favicon.png in public
  console.log('Updating favicon.png...');
  const faviconPngBuffer = await sharp(sourceImage)
    .extract({ left, top, width: squareSize, height: squareSize })
    .resize(512, 512, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const faviconPngPath = path.join(publicDir, 'favicon.png');
  fs.writeFileSync(faviconPngPath, faviconPngBuffer);
  console.log(`  -> Saved ${faviconPngPath}`);

  console.log('\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);
