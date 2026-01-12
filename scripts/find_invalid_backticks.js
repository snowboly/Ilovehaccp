const fs = require('fs');
const content = fs.readFileSync('src/data/articles.ts', 'utf8');

const contentRegex = /"content": `([\s\S]*?)`,/g;
let match;
while ((match = contentRegex.exec(content)) !== null) {
    const body = match[1];
    for (let i = 0; i < body.length; i++) {
        if (body[i] === '`') {
            if (i === 0 || body[i-1] !== '\\') {
                console.log('Unescaped backtick found in article!');
                console.log('Context: ...' + body.substring(Math.max(0, i-20), i+20) + '...');
            }
        }
        if (body[i] === '$' && body[i+1] === '{') {
             if (i === 0 || body[i-1] !== '\\') {
                console.log('Unescaped ${ found in article!');
                console.log('Context: ...' + body.substring(Math.max(0, i-20), i+20) + '...');
            }
        }
    }
}