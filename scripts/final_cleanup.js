const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, '../src/data/articles.ts');
const regenPath = path.join(__dirname, '../scripts/regenerate_all.js');

function run() {
  // 1. Clean articles.ts
  console.log("Cleaning articles.ts...");
  let content = fs.readFileSync(articlesPath, 'utf-8');
  const lines = content.split('\n');
  const newLines = lines.filter(line => !line.includes('fda.gov'));
  
  if (lines.length !== newLines.length) {
    console.log(`Removed ${lines.length - newLines.length} lines containing 'fda.gov'.`);
    fs.writeFileSync(articlesPath, newLines.join('\n'));
  } else {
    console.log("No 'fda.gov' lines found.");
  }

  // 2. Clean scripts/regenerate_all.js
  console.log("Cleaning regenerate_all.js...");
  let scriptContent = fs.readFileSync(regenPath, 'utf-8');
  if (scriptContent.includes('FDA_CONTEXT')) {
    scriptContent = scriptContent.replace(/FDA_CONTEXT/g, 'HACCP_CONTEXT');
    fs.writeFileSync(regenPath, scriptContent);
    console.log("Renamed FDA_CONTEXT to HACCP_CONTEXT.");
  }
  
  console.log("Done.");
}

run();
