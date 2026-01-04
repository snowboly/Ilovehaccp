const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

// Replace Dr. Margaret -> Dr. Margarida
content = content.replace(/Dr\. Margaret/g, 'Dr. Margarida');

// Replace Dr. Elizabeth -> Dr. Isabel
content = content.replace(/Dr\. Elizabeth/g, 'Dr. Isabel');

// Also replace in HTML comments if any
content = content.replace(/Written by Dr\. Margaret/g, 'Written by Dr. Margarida');
content = content.replace(/Written by Dr\. Elizabeth/g, 'Written by Dr. Isabel');

fs.writeFileSync(ARTICLES_PATH, content);
console.log("Successfully renamed team members in articles.ts");
