import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize with a dummy key if not present to prevent build crashes
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export async function POST(req: Request) {
  try {
    const { email, businessName, planId } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing. Email not sent.");
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'iLoveHACCP <noreply@ilovehaccp.com>', // Professional domain sender
      to: [email],
      subject: `Your HACCP Plan for ${businessName}`,
      html: `
        <h1>Hi there!</h1>
        <p>Thanks for using iLoveHACCP.com.</p>
        <p>Your HACCP Plan for <strong>${businessName}</strong> is ready.</p>
        <p>You can access and edit your plan here: <a href="https://www.ilovehaccp.com/builder?id=${planId}">View Plan</a></p>
        <br/>
        <p>Cheers,<br/>The iLoveHACCP Team</p>
      `,
    });

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
