const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, '../src/data/articles.ts');

const articlesToDelete = [
  'fda-vs-eu-regulations',
  'haccp-and-fda-fsma-what-food-businesses-must-know'
];

const replacements = [
  { regex: /Food and Drug Administration (FDA)/gi, replacement: "Food Safety Authority" },
  { regex: /US Food and Drug Administration (FDA)/gi, replacement: "International Food Safety Authorities" },
  { regex: /U.S. Food and Drug Administration (FDA)/gi, replacement: "International Food Safety Authorities" },
  { regex: /FDA’s Food Code/gi, replacement: "Codex Alimentarius Food Hygiene Principles" },
  { regex: /FDA Food Code/gi, replacement: "Codex Alimentarius" },
  { regex: /FDA regulations/gi, replacement: "food safety regulations" },
  { regex: /FDA guidelines/gi, replacement: "international guidelines" },
  { regex: /FDA requirements/gi, replacement: "regulatory requirements" },
  { regex: /Food Safety Modernization Act (FSMA)/gi, replacement: "General Principles of Food Hygiene" },
  { regex: /FDA FSMA/gi, replacement: "HACCP Guidelines" },
  { regex: /FSMA/gi, replacement: "HACCP standards" },
  { regex: /21 CFR \d+/gi, replacement: "Standard Operating Procedures" },
  { regex: /21 CFR Part \d+/gi, replacement: "Good Manufacturing Practices" },
  { regex: /FDA/g, replacement: "Regulatory Authorities" }, // Fallback for standalone FDA
  { regex: /Food and Drug Administration/gi, replacement: "Food Safety Authority" },
  { regex: /compliance with FDA/gi, replacement: "compliance with food safety standards" },
  { regex: /FDA-compliant/gi, replacement: "compliant with food safety standards" },
  { regex: /FDA's/gi, replacement: "Regulatory" },
];

function run() {
  console.log("Reading articles...");
  const content = fs.readFileSync(articlesPath, 'utf-8');
  const lines = content.split('\n');
  
  let newLines = [];
  let buffer = [];
  let inObject = false;
  let deletedCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for start of object (simplified check for `  {`)
    if (line.trim() === '{') {
      inObject = true;
      buffer.push(line);
    } else if (inObject) {
      buffer.push(line);
      // Check for end of object
      if (line.trim() === '},' || line.trim() === '}') {
        // Check buffer for forbidden slugs
        const bufferStr = buffer.join('\n');
        let shouldDelete = false;
        for (const slug of articlesToDelete) {
          if (bufferStr.includes(`"slug": "${slug}"`) || bufferStr.includes(`'slug': '${slug}'`)) {
            shouldDelete = true;
            console.log(`Deleting article: ${slug}`);
            break;
          }
        }
        
        if (!shouldDelete) {
          newLines.push(...buffer);
        } else {
          deletedCount++;
        }
        buffer = [];
        inObject = false;
      }
    } else {
      // Outside object (headers, footers, etc)
      newLines.push(line);
    }
  }

  // Handle case where file doesn't end cleanly or something
  if (buffer.length > 0) {
    newLines.push(...buffer);
  }

  let finalContent = newLines.join('\n');
  console.log(`Deleted ${deletedCount} articles.`);

  // Replacements
  for (const { regex, replacement } of replacements) {
    const matchCount = (finalContent.match(regex) || []).length;
    if (matchCount > 0) {
        console.log(`Replacing ${regex} with "${replacement}" (${matchCount} matches)`);
        finalContent = finalContent.replace(regex, replacement);
    }
  }

  fs.writeFileSync(articlesPath, finalContent);
  console.log("Done.");
}

run();
