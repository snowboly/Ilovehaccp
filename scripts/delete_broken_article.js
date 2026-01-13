const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, '../src/data/articles.ts');
const slugToDelete = "haccp-and-fda-HACCP standards-what-food-businesses-must-know";

function run() {
  console.log(`Reading articles... searching for ${slugToDelete}`);
  const content = fs.readFileSync(articlesPath, 'utf-8');
  const lines = content.split('\n');
  
  let newLines = [];
  let buffer = [];
  let inObject = false;
  let deletedCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for start of object
    if (line.trim() === '{') {
      inObject = true;
      buffer.push(line);
    } else if (inObject) {
      buffer.push(line);
      // Check for end of object
      if (line.trim() === '},' || line.trim() === '}') {
        const bufferStr = buffer.join('\n');
        
        if (bufferStr.includes(slugToDelete)) {
            console.log(`Deleting article with slug: ${slugToDelete}`);
            deletedCount++;
        } else {
            newLines.push(...buffer);
        }
        buffer = [];
        inObject = false;
      }
    } else {
      newLines.push(line);
    }
  }

  if (buffer.length > 0) {
    newLines.push(...buffer);
  }

  fs.writeFileSync(articlesPath, newLines.join('\n'));
  console.log(`Done. Deleted ${deletedCount} articles.`);
}

run();
