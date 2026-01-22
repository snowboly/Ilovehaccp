import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import ChecklistDocument from '@/components/pdf/ChecklistDocument';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });
    }

    // 1. Generate the PDF
    const pdfBuffer = await renderToBuffer(<ChecklistDocument />);

    // 2. Send Email
    const { data, error } = await resend.emails.send({
      from: 'iLoveHACCP Resources <noreply@ilovehaccp.com>',
      to: [email],
      subject: 'Your 2026 Food Safety Checklist is here',
      attachments: [
        {
          filename: '2026_Food_Safety_Checklist.pdf',
          content: pdfBuffer,
        },
      ],
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>Here is your requested checklist!</h1>
          <p>Hi there,</p>
          <p>Thanks for requesting the <strong>2026 Food Safety Inspection Checklist</strong>. It is attached to this email as a PDF.</p>
          
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Need a full HACCP Plan?</h3>
            <p>This checklist is a great start, but inspectors require a full Hazard Analysis documentation system.</p>
            <p><a href="https://www.ilovehaccp.com/builder" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Create Your Free Plan Now</a></p>
          </div>

          <p>Good luck with your inspection!</p>
          <p>The iLoveHACCP Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Lead Magnet Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
