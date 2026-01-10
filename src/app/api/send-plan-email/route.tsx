import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { supabaseService } from '@/lib/supabase';
import { getDictionary } from '@/lib/locales';

// Initialize with a dummy key if not present to prevent build crashes
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export async function POST(req: Request) {
  try {
    const { email, businessName, planId } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing. Email not sent.");
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });
    }

    // 1. Fetch the full plan data
    const { data: plan, error: dbError } = await supabaseService
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

    if (dbError || !plan) {
        throw new Error("Plan not found");
    }

    // 2. Prepare data for PDF
    const dict = getDictionary('en').pdf; // Default to English
    const fullPlan = plan.full_plan || {};
    const originalInputs = fullPlan._original_inputs || {};
    
    const pdfData = {
        businessName: plan.business_name || businessName,
        productName: plan.product_name || "HACCP Plan",
        productDescription: plan.product_description || `HACCP Plan for ${plan.business_type}`,
        intendedUse: plan.intended_use || "General Consumption",
        storageType: plan.storage_type || "Standard",
        analysis: plan.hazard_analysis || [],
        fullPlan: fullPlan
    };

    // 3. Generate PDF Buffer
    const pdfBuffer = await renderToBuffer(
        <HACCPDocument 
            data={pdfData}
            dict={dict}
            logo={originalInputs.logo || null}
            template={originalInputs.template || 'Minimal'}
        />
    );

    // 4. Send Email with Attachment
    const { data, error } = await resend.emails.send({
      from: 'iLoveHACCP <noreply@ilovehaccp.com>',
      to: [email],
      subject: `Your HACCP Plan for ${businessName}`,
      attachments: [
        {
            filename: `${businessName.replace(/\s+/g, '_')}_HACCP_Plan.pdf`,
            content: pdfBuffer
        }
      ],
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
        .wrapper { width: 100%; background-color: #f1f5f9; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { padding: 40px 0 24px 0; text-align: center; border-bottom: 1px solid #f8fafc; }
        .logo-text { font-size: 26px; font-weight: 900; color: #0f172a; text-decoration: none; }
        .heart { color: #ef4444; }
        .content { padding: 32px 40px; text-align: left; }
        .h1 { color: #1e293b; font-size: 24px; font-weight: 800; margin: 0 0 16px 0; }
        .text { color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; }
        .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
        .footer { background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { color: #94a3b8; font-size: 12px; margin: 0; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="logo-text">i<span class="heart">❤️</span>HACCP</div>
            </div>
            <div class="content">
                <h1 class="h1">Your Plan is Ready!</h1>
                <p class="text">Great news! We've successfully generated the HACCP plan for <strong>${businessName}</strong>.</p>
                <p class="text">Your custom plan is attached to this email as a PDF.</p>
                <ul style="color: #475569; margin-bottom: 24px;">
                    <li>Hazard Analysis & Critical Control Points</li>
                    <li>Monitoring Procedures</li>
                    <li>Corrective Actions</li>
                </ul>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="https://www.ilovehaccp.com/builder?id=${planId}" class="button" target="_blank">View & Edit Plan Online</a>
                </div>
                <p class="text" style="font-size: 14px; color: #94a3b8; text-align: center;">
                    Tip: Bookmark this link to access your plan anytime.
                </p>
            </div>
            <div class="footer">
                <p class="footer-text">© 2026 iLoveHACCP.com</p>
            </div>
        </div>
    </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ success: false, error: error.message || error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
  }
}
