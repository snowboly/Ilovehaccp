import Groq from 'groq-sdk';

// We initialize with a check to prevent build-time crashes if the key is missing
// The actual key must be provided in the deployment environment (Vercel/etc)
const apiKey = process.env.GROQ_API_KEY || '';

if (!apiKey && process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  console.warn("Warning: GROQ_API_KEY is missing. AI features will fail at runtime.");
}

export const groq = new Groq({
  apiKey: apiKey || 'missing_key', // Fallback to prevent constructor crash
});