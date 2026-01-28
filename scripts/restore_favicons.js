const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const faviconSourceDir = path.join(repoRoot, "scripts", "favicons-base64");
const fontSourceDir = path.join(repoRoot, "scripts", "fonts-base64");
const publicDir = path.join(repoRoot, "public");
const fontsDir = path.join(publicDir, "fonts");

const faviconFiles = [
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "apple-touch-icon.png",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon-48x48.png",
  "favicon.ico",
];

const fontFiles = [
  "Roboto-Regular.ttf",
  "Roboto-Bold.ttf",
  "Roboto-Italic.ttf",
  "Roboto-BoldItalic.ttf",
];

function restoreFiles(sourceDir, targetDir, files, label) {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Missing base64 directory: ${sourceDir}`);
    return false;
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let success = true;
  files.forEach((fileName) => {
    const sourcePath = path.join(sourceDir, `${fileName}.b64`);
    const targetPath = path.join(targetDir, fileName);

    if (!fs.existsSync(sourcePath)) {
      console.error(`Missing base64 file: ${sourcePath}`);
      success = false;
      return;
    }

    const base64Content = fs.readFileSync(sourcePath, "utf8");
    const buffer = Buffer.from(base64Content, "base64");
    fs.writeFileSync(targetPath, buffer);
  });

  if (success) {
    console.log(`${label} restored to ${targetDir}`);
  }
  return success;
}

const faviconSuccess = restoreFiles(faviconSourceDir, publicDir, faviconFiles, "Favicons");
const fontSuccess = restoreFiles(fontSourceDir, fontsDir, fontFiles, "Fonts");

if (!faviconSuccess || !fontSuccess) {
  process.exit(1);
}
