import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseService } from '@/lib/supabase';
import { generateWordDocument } from '@/lib/word-generator';
import { emailTranslations } from '@/lib/email-locales';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, businessName, planId, amount, language = 'en', tier = 'review' } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing. Email not sent.");
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });
    }

    if (!email || !planId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Select Locale (Fallback to EN)
    const normalizedTier = typeof tier === 'string' ? tier.toLowerCase() : 'review';
    const isExportOnly = normalizedTier === 'export';
    const translationKey = isExportOnly ? 'payment_confirmed_export' : 'payment_confirmed';
    const fallbackTranslations = (emailTranslations.en as any)[translationKey];
    const t = {
      ...fallbackTranslations,
      ...((emailTranslations as any)[language]?.[translationKey] || {})
    };
    const planIdLabel = t.plan_id_label || 'Plan ID';

    let plan: any = null;
    let planVersion = 1;
    if (planId !== 'test-plan-id') {
      const { data, error } = await supabaseService
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        console.error("Supabase Plan Fetch Error:", error);
      } else {
        plan = data;
      }

      if (plan) {
        if (plan.payment_status !== 'paid') {
          console.warn(`Plan ${planId} is not paid. Skipping attachment generation.`);
          return NextResponse.json({ success: false, error: "Payment required" }, { status: 403 });
        }

        if (plan.user_id) {
          const { data: authData, error: authError } = await supabaseService.auth.admin.getUserById(plan.user_id);
          const planOwnerEmail = authData?.user?.email?.toLowerCase();
          if (authError || !planOwnerEmail || planOwnerEmail !== String(email).toLowerCase()) {
            console.warn(`Email mismatch for plan ${planId}. Requested ${email}, owner ${planOwnerEmail || 'unknown'}.`);
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
          }
        }

        const { data: latestVersion } = await supabaseService
          .from('haccp_plan_versions')
          .select('version_number')
          .eq('plan_id', planId)
          .order('version_number', { ascending: false })
          .limit(1)
          .single();

        planVersion = latestVersion?.version_number || 1;
      }
    }

    // Skip inline attachment generation - users download from dashboard
    // This avoids font/rendering issues in serverless environment
    const userAttachments: any[] = [];

    // 1. Email to User
    await resend.emails.send({
      from: 'iLoveHACCP <noreply@ilovehaccp.com>',
      to: [email],
      replyTo: 'support@ilovehaacp.com',
      subject: t.subject.replace('{businessName}', businessName),
      attachments: userAttachments,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t.title}</title>
          <!--[if mso]>
          <style type="text/css">
            body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
          </style>
          <![endif]-->
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #f1f5f9;
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: 100%;
            }
            .wrapper {
              width: 100%;
              table-layout: fixed;
              background-color: #f1f5f9;
              padding-top: 40px;
              padding-bottom: 40px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border: 1px solid #e2e8f0;
            }
            .header {
              padding: 40px 0 24px 0;
              text-align: center;
              background-color: #ffffff;
              border-bottom: 1px solid #f8fafc;
            }
            .logo-text {
              font-size: 26px;
              font-weight: 900;
              color: #0f172a;
              text-decoration: none;
              letter-spacing: -0.5px;
            }
            .heart { color: #ef4444; }
            .content {
              padding: 32px 40px 48px 40px;
              text-align: left;
            }
            .h1 {
              color: #1e293b;
              font-size: 24px;
              font-weight: 800;
              margin: 0 0 16px 0;
              line-height: 1.3;
            }
            .text {
              color: #475569;
              font-size: 16px;
              line-height: 1.6;
              margin: 0 0 24px 0;
            }
            .highlight {
              color: #0f172a;
              font-weight: 600;
            }
            .steps {
              background-color: #f8fafc;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 24px;
              border: 1px solid #e2e8f0;
            }
            .steps-title {
              color: #0f172a;
              font-weight: 700;
              margin-bottom: 12px;
            }
            .steps-item {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 8px;
              display: block;
            }
            .checkmark {
              color: #2563eb;
              margin-right: 8px;
              font-weight: bold;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              background-color: #2563eb;
              color: #ffffff !important;
              font-size: 16px;
              font-weight: 700;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
            }
            .footer {
              background-color: #f8fafc;
              padding: 24px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer-text {
              color: #94a3b8;
              font-size: 12px;
              line-height: 1.5;
              margin: 0;
            }
            .footer-link {
              color: #64748b;
              text-decoration: underline;
            }
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; border-radius: 0 !important; border: none; }
              .content { padding: 24px !important; }
              .wrapper { padding: 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <div class="logo-text">
                  i<span class="heart">❤️</span>HACCP
                </div>
              </div>
              <div class="content">
                <h1 class="h1">${t.title}</h1>
                <p class="text">${t.greeting}</p>
                <p class="text">${t.thank_you.replace('{businessName}', businessName)}</p>
                <p class="text"><span class="highlight">${planIdLabel}:</span> ${planId}</p>

                <div class="steps">
                  <div class="steps-title">${t.next_steps_title}</div>
                  <span class="steps-item"><span class="checkmark">✓</span>${t.step_1}</span>
                  <span class="steps-item"><span class="checkmark">✓</span>${t.step_2}</span>
                  <span class="steps-item" style="margin-bottom: 0;"><span class="checkmark">✓</span>${t.step_3}</span>
                </div>

                <p class="text">${t.access_doc}</p>

                <div class="button-container">
                  <a href="https://www.ilovehaccp.com/dashboard" class="button" target="_blank">${t.dashboard_btn}</a>
                </div>

                <p class="text">${t.questions}</p>
                <p class="text" style="font-size: 12px; color: #94a3b8; margin-top: 32px; text-align: center;">
                  ${t.disclaimer}
                </p>
                <p class="text">${t.sign_off}</p>
              </div>
              <div class="footer">
                <p class="footer-text">
                  © 2026 iLoveHACCP.com<br>
                  Making food safety compliance simple.<br><br>
                  <a href="https://ilovehaccp.com/terms" class="footer-link">Terms</a> •
                  <a href="https://ilovehaccp.com/privacy" class="footer-link">Privacy</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // 2. Prepare Attachment for Admin
    let attachments: any[] = [];
    if (planId === 'test-plan-id') {
      console.log("Skipping attachment for TEST plan.");
    } else if (plan) {
      try {
        console.log(`Generating attachment for Plan ID: ${planId}`);
        const buffer = await generateWordDocument({
          businessName: plan.business_name,
          full_plan: plan.full_plan
        });
        const safeBusinessName = (plan.business_name || 'HACCP_Plan').replace(/\s+/g, '_');
        
        attachments.push({
          filename: `HACCP_Plan_${safeBusinessName}.docx`,
          content: buffer
        });
        console.log("Attachment generated successfully.");
      } catch (docError) {
        console.error("CRITICAL: Failed to generate doc attachment, sending email without it.", docError);
      }
    }
    // 3. Email to Admin
    console.log("Sending Admin Email...");
    const adminInbox = process.env.ADMIN_REVIEW_INBOX || 'support@ilovehaccp.com';
    const adminSubject = isExportOnly
      ? `[EXPORT] New Export Purchase: ${businessName}`
      : `[ACTION REQUIRED] New Plan Review & Feedback: ${businessName}`;
    const adminRes = await resend.emails.send({
      from: 'iLoveHACCP Alerts <noreply@ilovehaccp.com>',
      to: [adminInbox],
      subject: adminSubject,
      html: `
        <h1>${isExportOnly ? 'New Export Purchase' : 'New Plan Review & Feedback Purchased'}</h1>
        <ul>
          <li><strong>Business:</strong> ${businessName}</li>
          <li><strong>User Email:</strong> ${email}</li>
          <li><strong>Plan ID:</strong> ${planId}</li>
          <li><strong>Amount:</strong> €${amount}</li>
        </ul>
        <p>${isExportOnly ? 'Export purchase completed. Documents are available in the user dashboard.' : 'The generated HACCP plan is attached for your review.'}</p>
        ${isExportOnly ? '' : '<p>Please edit/redline this document and reply to the user.</p>'}
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
