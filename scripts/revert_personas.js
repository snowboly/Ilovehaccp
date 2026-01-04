const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/articles.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace names back
content = content.replace(/Dr\. Margaret/g, 'Dr. Margarida');
content = content.replace(/Dr\. Elizabeth/g, 'Dr. Isabel');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Reverted personas in src/data/articles.ts');
