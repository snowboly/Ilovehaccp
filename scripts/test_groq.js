const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    console.log("Testing Groq API...");
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hi' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log("Success:", completion.choices[0].message.content);
  } catch (error) {
    console.error("Error detected:");
    if (error.status === 429) {
      console.error("RATE LIMIT REACHED (429): You are out of tokens for today.");
    } else {
      console.error(error.message);
    }
  }
}

test();
