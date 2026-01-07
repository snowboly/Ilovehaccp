
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export async function POST(req: Request) {
  try {
    const { email, businessName, planId, amount } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing. Email not sent.");
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });
    }

    // 1. Email to User
    await resend.emails.send({
      from: 'iLoveHACCP Support <support@ilovehaccp.com>',
      to: [email],
      replyTo: 'support@ilovehaccp.com',
      subject: `Payment Confirmed: Professional Review for ${businessName}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>Payment Confirmed</h1>
          <p>Hi there,</p>
          <p>Thank you for purchasing the <strong>Starter Review</strong> package for <strong>${businessName}</strong>.</p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #166534;">Next Steps:</strong>
            <ul style="color: #15803d;">
              <li>Our certified expert has been notified and assigned to your plan.</li>
              <li>We will review your documentation within the next 48 hours.</li>
              <li>We may contact you via this email if we need clarification on your processes.</li>
            </ul>
          </div>

          <p>In the meantime, you can access your unlocked Word (DOCX) document here:</p>
          <p><a href="https://www.ilovehaccp.com/dashboard" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a></p>
          
          <p>If you have specific questions for the auditor, simply <strong>reply to this email</strong>.</p>
          
          <br/>
          <p>Best regards,<br/>The iLoveHACCP Team</p>
        </div>
      `,
    });

    // 2. Email to Admin
    await resend.emails.send({
      from: 'System <noreply@ilovehaccp.com>',
      to: ['support@ilovehaccp.com'], // Change this to your real admin email if different
      subject: `[ACTION REQUIRED] New Paid Review: ${businessName}`,
      html: `
        <h1>New Plan Review Purchased</h1>
        <ul>
          <li><strong>Business:</strong> ${businessName}</li>
          <li><strong>User Email:</strong> ${email}</li>
          <li><strong>Plan ID:</strong> ${planId}</li>
          <li><strong>Amount:</strong> €${amount}</li>
        </ul>
        <p>Please review the plan in the admin dashboard and contact the user within 48h.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
