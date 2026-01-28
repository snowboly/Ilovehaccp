import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export async function POST(req: Request) {
  try {
    const { name, email, subject, message, captchaAnswer } = await req.json();
    const captchaCookie = cookies().get('contact_captcha')?.value;

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });
    }

    if (!captchaCookie || captchaCookie !== String(captchaAnswer || '').trim()) {
      return NextResponse.json({ success: false, error: 'Captcha verification failed.' }, { status: 400 });
    }

    // Send notification to the site owner
    await resend.emails.send({
      from: 'iLoveHACCP Alerts <noreply@ilovehaccp.com>',
      to: ['support@ilovehaccp.com'], // Updated to correct email
      subject: `New Contact Message: ${subject}`,
      html: `
        <h2>New Inquiry from ilovehaccp.com</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set('contact_captcha', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    console.error("Email notification failed:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
