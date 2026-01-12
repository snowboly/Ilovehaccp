const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

function convert() {
    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

    const lines = content.split('\n');
    const newLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('"content": "')) {
            const firstQuoteIndex = line.indexOf('"content": "') + 12;
            const lastQuoteIndex = line.lastIndexOf('"');
            
            if (lastQuoteIndex > firstQuoteIndex) {
                let inner = line.substring(firstQuoteIndex, lastQuoteIndex);
                
                let decoded = inner
                    .replace(/\\\"/g, '"')
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r')
                    .replace(/\\t/g, '\t')
                    .replace(/\\\\/g, '\\');
                
                let safe = decoded
                    .replace(/`/g, '\`')
                    .replace(/\${/g, '\\${');
                
                return '    "content": `' + safe + '`,';
            }
        }
        return line;
    });

    fs.writeFileSync(ARTICLES_PATH, newLines.join('\n'));
    console.log("Converted articles to backticks.");
}

convert();