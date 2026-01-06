import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email notification failed:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
