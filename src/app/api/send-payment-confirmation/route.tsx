
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseService } from '@/lib/supabase';
import { renderToBuffer } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { generateWordDocument } from '@/lib/word-generator';
import { getDictionary } from '@/lib/locales';
import { emailTranslations } from '@/lib/email-locales';
import { fetchLogoAssets } from '@/lib/export/logo';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, businessName, planId, amount, language = 'en' } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing. Email not sent.");
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });
    }

    if (!email || !planId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Select Locale (Fallback to EN)
    const fallbackTranslations = emailTranslations.en.payment_confirmed;
    const t = {
      ...fallbackTranslations,
      ...((emailTranslations as any)[language]?.payment_confirmed || {})
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

    let userAttachments: any[] = [];
    if (plan) {
      const fullPlan = plan.full_plan || {};
      const originalInputs = fullPlan._original_inputs || {};
      const productInputs = originalInputs.product || {};
      const dict = getDictionary(language as any).pdf;
      const { pdfLogo, wordLogo } = await fetchLogoAssets(productInputs.logo_url);

      const pdfBuffer = await renderToBuffer(
        <HACCPDocument
          data={{
            businessName: plan.business_name,
            productName: productInputs.product_name || plan.product_name || "HACCP Plan",
            productDescription: productInputs.product_category || plan.product_description || "Generated Plan",
            intendedUse: productInputs.intended_use || plan.intended_use || "General",
            storageType: productInputs.storage_conditions || plan.storage_type || "Standard",
            mainIngredients: productInputs.key_ingredients || "Standard",
            shelfLife: productInputs.shelf_life || "As per label",
            analysis: plan.hazard_analysis || [],
            fullPlan,
            planVersion,
            lang: language,
            isPaid: true
          }}
          dict={dict}
          logo={pdfLogo}
          template={originalInputs.template || 'audit-classic'}
        />
      );

      const wordBuffer = await generateWordDocument({
        businessName: plan.business_name,
        full_plan: fullPlan,
        planVersion,
        template: originalInputs.template || fullPlan.validation?.document_style,
        productName: productInputs.product_name || plan.product_name || "HACCP Plan",
        productDescription: productInputs.product_category || plan.product_description || "Generated Plan",
        mainIngredients: productInputs.key_ingredients || "Standard",
        intendedUse: productInputs.intended_use || plan.intended_use || "General",
        storageType: productInputs.storage_conditions || plan.storage_type || "Standard",
        shelfLife: productInputs.shelf_life || "As per label",
        logoBuffer: wordLogo
      }, language);

      userAttachments = [
        {
          filename: `HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer
        },
        {
          filename: `HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}.docx`,
          content: wordBuffer
        }
      ];
    }

    // 1. Email to User
    await resend.emails.send({
      from: 'iLoveHACCP <noreply@ilovehaccp.com>',
      to: [email],
      replyTo: 'support@ilovehaccp.com',
      subject: t.subject.replace('{businessName}', businessName),
      attachments: userAttachments,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>${t.title}</h1>
          <p>${t.greeting}</p>
          <p>${t.thank_you.replace('{businessName}', businessName)}</p>
          <p><strong>${planIdLabel}:</strong> ${planId}</p>
          
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
    } else if (plan) {
      try {
        console.log(`Generating attachment for Plan ID: ${planId}`);
        const buffer = await generateWordDocument({
          businessName: plan.business_name,
          full_plan: plan.full_plan
        });
        
        attachments.push({
          filename: `HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}.docx`,
          content: buffer
        });
        console.log("Attachment generated successfully.");
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
