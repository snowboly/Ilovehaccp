import { NextResponse } from 'next/server';

function buildCaptcha() {
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 2;
  return {
    question: `What is ${left} + ${right}?`,
    answer: String(left + right),
  };
}

export async function GET() {
  const { question, answer } = buildCaptcha();
  const response = NextResponse.json({ question });
  response.cookies.set('contact_captcha', answer, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });
  return response;
}
