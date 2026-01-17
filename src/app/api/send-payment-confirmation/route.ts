
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseService } from '@/lib/supabase';
import { generateWordDocument } from '@/lib/word-generator';
import { emailTranslations } from '@/lib/email-locales';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export async function POST(req: Request) {
  try {
    const { email, businessName, planId, amount, language = 'en' } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing. Email not sent.");
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });
    }

    // Select Locale (Fallback to EN)
    const t = (emailTranslations as any)[language]?.payment_confirmed || emailTranslations.en.payment_confirmed;

    // 1. Email to User
    await resend.emails.send({
      from: 'iLoveHACCP <noreply@ilovehaccp.com>',
      to: [email],
      replyTo: 'support@ilovehaccp.com',
      subject: t.subject.replace('{businessName}', businessName),
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>${t.title}</h1>
          <p>${t.greeting}</p>
          <p>${t.thank_you.replace('{businessName}', businessName)}</p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #166534;">${t.next_steps_title}</strong>
            <ul style="color: #15803d;">
              <li>${t.step_1}</li>
              <li>${t.step_2}</li>
              <li>${t.step_3}</li>
            </ul>
          </div>

          <p>${t.access_doc}</p>
          <p><a href="https://www.ilovehaccp.com/dashboard" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">${t.dashboard_btn}</a></p>
          
          <p>${t.questions}</p>
          
          <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px; margin-top: 20px;">
            ${t.disclaimer}
          </p>
          
          <br/>
          <p>${t.sign_off}</p>
        </div>
      `,
    });

    // 2. Prepare Attachment for Admin
    let attachments: any[] = [];
    if (planId === 'test-plan-id') {
        console.log("Skipping attachment for TEST plan.");
    } else {
        try {
            console.log(`Generating attachment for Plan ID: ${planId}`);
        const { data: plan, error } = await supabaseService
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (error) {
             console.error("Supabase Plan Fetch Error:", error);
        } else if (plan) {
            const buffer = await generateWordDocument({
                businessName: plan.business_name,
                full_plan: plan.full_plan
            });
            
            attachments.push({
                filename: `HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}.docx`,
                content: buffer
            });
            console.log("Attachment generated successfully.");
                    }
                } catch (docError) {
                    console.error("CRITICAL: Failed to generate doc attachment, sending email without it.", docError);
                }
            }
    // 3. Email to Admin
    console.log("Sending Admin Email...");
    const adminRes = await resend.emails.send({
      from: 'iLoveHACCP Alerts <noreply@ilovehaccp.com>',
      to: ['support@ilovehaccp.com'], 
      subject: `[ACTION REQUIRED] New Paid Review: ${businessName}`,
      html: `
        <h1>New Plan Review Purchased</h1>
        <ul>
          <li><strong>Business:</strong> ${businessName}</li>
          <li><strong>User Email:</strong> ${email}</li>
          <li><strong>Plan ID:</strong> ${planId}</li>
          <li><strong>Amount:</strong> €${amount}</li>
        </ul>
        <p>The generated HACCP plan is attached for your review.</p>
        <p>Please edit/redline this document and reply to the user.</p>
      `,
      attachments: attachments
    });

    if (adminRes.error) {
        console.error("Resend Admin Email Failed:", adminRes.error);
        // Do not throw, return partial success? 
        // Or throw to see it in logs? Let's log it.
    } else {
        console.log("Admin Email Sent ID:", adminRes.data?.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("FATAL Email Error:", error.message || error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
