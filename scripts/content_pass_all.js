require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

const FILE_HEADER = `export interface Article {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image?: string;
  content: string;
  publishedAt: string;
}

export const articles: Article[] = `;

function insertIntroList(html, title) {
  const introWindow = html.slice(0, 1200);
  if (introWindow.includes('<ul') || introWindow.includes('<ol')) return html;
  const list = [
    'How this HACCP topic applies in real-world operations',
    'Common hazards and practical controls to reduce risk',
    'Records and monitoring that auditors expect to see'
  ];
  const block = `<h4>What you\\'ll learn</h4><ul>${list.map(i => `<li>${i}</li>`).join('')}</ul>`;
  const firstP = html.indexOf('</p>');
  if (firstP === -1) return html;
  return html.slice(0, firstP + 4) + block + html.slice(firstP + 4);
}

function insertAuditTip(html) {
  const introWindow = html.slice(0, 1500);
  if (introWindow.includes('<blockquote')) return html;
  const tip = `<blockquote><strong>Audit Tip:</strong> Keep monitoring logs dated, signed, and stored in a single place for fast inspection review.</blockquote>`;
  const firstH = html.search(/<h[23]>/);
  if (firstH === -1) return html + tip;
  return html.slice(0, firstH) + tip + html.slice(firstH);
}

function insertKeyTakeawaysIfNoLists(html) {
  if (html.includes('<ul') || html.includes('<ol')) return html;
  const list = [
    'Identify hazards early and document controls',
    'Define clear CCPs and critical limits',
    'Keep records consistent and audit-ready'
  ];
  const block = `<h4>Key takeaways</h4><ul>${list.map(i => `<li>${i}</li>`).join('')}</ul>`;
  const lastP = html.lastIndexOf('</p>');
  if (lastP === -1) return html + block;
  return html.slice(0, lastP + 4) + block + html.slice(lastP + 4);
}

function splitLongParagraphs(html) {
  return html.replace(/<p>([\s\S]*?)<\/p>/g, (match, inner) => {
    const textOnly = inner.replace(/<[^>]+>/g, '');
    if (textOnly.length < 420) return match;
    if (inner.includes('<ul') || inner.includes('<ol') || inner.includes('<blockquote')) return match;

    const min = 280;
    const max = Math.min(inner.length - 2, 600);
    let splitAt = -1;
    for (let i = min; i <= max; i++) {
      const ch = inner[i];
      if ((ch === '.' || ch === '?' || ch === '!') && inner[i + 1] === ' ') {
        splitAt = i + 1;
        break;
      }
    }
    if (splitAt === -1) return match;
    const a = inner.slice(0, splitAt + 1).trim();
    const b = inner.slice(splitAt + 1).trim();
    return `<p>${a}</p><p>${b}</p>`;
  });
}

function contentPass(article) {
  let html = article.content || '';
  html = insertIntroList(html, article.title);
  html = insertAuditTip(html);
  html = splitLongParagraphs(html);
  html = insertKeyTakeawaysIfNoLists(html);
  return html;
}

async function main() {
  const fileContent = fs.readFileSync(ARTICLES_PATH, 'utf8');
  const jsonStart = fileContent.indexOf(FILE_HEADER);
  if (jsonStart === -1) throw new Error('articles.ts header not found');
  const jsonBody = fileContent.slice(jsonStart + FILE_HEADER.length).trim();
  if (!jsonBody.endsWith(';')) throw new Error('articles.ts JSON terminator not found');
  const jsonText = jsonBody.slice(0, -1);
  const articles = JSON.parse(jsonText);

  let changed = 0;
  for (const article of articles) {
    const next = contentPass(article);
    if (next !== article.content) {
      article.content = next;
      changed += 1;
    }
  }

  const newContent = FILE_HEADER + JSON.stringify(articles, null, 2) + ';\n';
  fs.writeFileSync(ARTICLES_PATH, newContent);
  console.log(`Updated ${changed} articles in src/data/articles.ts`);

  let uploaded = 0;
  for (const article of articles) {
    const { error } = await supabase
      .from('articles')
      .update({ content: article.content })
      .eq('slug', article.slug);
    if (error) {
      console.error(`DB update failed for ${article.slug}:`, error.message);
    } else {
      uploaded += 1;
    }
  }
  console.log(`Updated ${uploaded} articles in Supabase.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
