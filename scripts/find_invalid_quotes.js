const fs = require('fs');
const content = fs.readFileSync('src/data/articles.ts', 'utf8');

const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('"content": "')) {
        // Find the index of the start of the content string
        const startIndex = line.indexOf('"content": "') + 12;
        // Find the index of the end of the content string (the last quote on the line)
        const endIndex = line.lastIndexOf('"');
        
        if (endIndex <= startIndex) {
            console.log(`Line ${i + 1}: Malformed line or missing closing quote.`);
            return;
        }

        const stringBody = line.substring(startIndex, endIndex);
        
        // Check for unescaped quotes inside stringBody
        // An unescaped quote is a " not preceded by \
        for (let j = 0; j < stringBody.length; j++) {
            if (stringBody[j] === '"' && (j === 0 || stringBody[j-1] !== '\\')) {
                console.log(`Line ${i + 1}, Col ${startIndex + j + 1}: Unescaped quote found!`);
                console.log(`Context: ...${stringBody.substring(Math.max(0, j-20), j+20)}...`);
            }
        }
    }
});
