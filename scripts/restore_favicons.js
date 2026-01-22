const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(repoRoot, "scripts", "favicons-base64");
const targetDir = path.join(repoRoot, "public");

const faviconFiles = [
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "apple-touch-icon.png",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon-48x48.png",
  "favicon.ico",
];

if (!fs.existsSync(sourceDir)) {
  console.error(`Missing base64 directory: ${sourceDir}`);
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

faviconFiles.forEach((fileName) => {
  const sourcePath = path.join(sourceDir, `${fileName}.b64`);
  const targetPath = path.join(targetDir, fileName);

  if (!fs.existsSync(sourcePath)) {
    console.error(`Missing base64 file: ${sourcePath}`);
    process.exitCode = 1;
    return;
  }

  const base64Content = fs.readFileSync(sourcePath, "utf8");
  const buffer = Buffer.from(base64Content, "base64");
  fs.writeFileSync(targetPath, buffer);
});

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Favicons restored to public/ from scripts/favicons-base64.");
