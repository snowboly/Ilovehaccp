const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SOURCE_DIR = path.join(__dirname, '../src/data/haccp');
const LANGUAGES = ['de', 'it', 'lt'];

// Helper to translate object keys
async function translateObject(obj, targetLang) {
    const contentToTranslate = JSON.stringify(obj, null, 2);
    
    const prompt = `You are a professional translator for a food safety SaaS.
    Translate the values of the following JSON object into ${targetLang}.
    
    RULES:
    1. Only translate values for keys: "text", "description", "tooltip", "options".
    2. Do NOT translate keys (id, type, required).
    3. Keep the structure exactly the same.
    4. Use professional food safety terminology (e.g., HACCP, CCP, Hazard Analysis).
    5. Do NOT add any conversational text. Output ONLY valid JSON.
    
    JSON:
    ${contentToTranslate}`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            response_format: { type: 'json_object' }
        });
        return JSON.parse(completion.choices[0].message.content);
    } catch (e) {
        console.error(`Error translating to ${targetLang}:`, e.message);
        return obj; // Fallback to original
    }
}

async function main() {
    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json') && !f.includes('.de.') && !f.includes('.it.') && !f.includes('.lt.'));

    console.log(`Found ${files.length} source files to translate.`);

    for (const file of files) {
        const filePath = path.join(SOURCE_DIR, file);
        const sourceData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`\nProcessing ${file}...`);

        for (const lang of LANGUAGES) {
            if (fs.existsSync(path.join(SOURCE_DIR, file.replace('.json', `.${lang}.json`)))) {
                console.log(`  - Skipping ${lang} (already exists)`);
                continue;
            }

            console.log(`  - Translating to ${lang.toUpperCase()}...`);
            
            // Clone and Translate
            const translatedData = { ...sourceData };
            
            // Translate top-level fields if any
            if (translatedData.section) {
                // simple translation for section title
                // We'll skip complex single-field calls for speed and just do the questions array
            }

            if (translatedData.questions) {
                const translatedQuestions = await translateObject(translatedData.questions, lang);
                translatedData.questions = translatedQuestions;
            }

            // Save
            const targetFilename = file.replace('.json', `.${lang}.json`);
            fs.writeFileSync(path.join(SOURCE_DIR, targetFilename), JSON.stringify(translatedData, null, 2));
            console.log(`    ✅ Saved ${targetFilename}`);
            
            // Rate limit pause
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

main();
