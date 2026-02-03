import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseService } from '@/lib/supabase';
import { generateAccessToken } from '@/lib/token';

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is missing. Email not sent.');
  }
  return new Resend(apiKey);
};

export async function POST(req: Request) {
  try {
    const { email, draftId } = await req.json();

    if (!email || !draftId) {
      return NextResponse.json({ error: 'Missing email or draftId' }, { status: 400 });
    }

    // Verify draft exists
    const { data: draft, error: draftError } = await supabaseService
      .from('drafts')
      .select('product_name')
      .eq('id', draftId)
      .single();

    if (draftError || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    // Generate Signed Token (7 days validity)
    const token = generateAccessToken(draftId, 'draft', 'view', 7 * 24 * 60 * 60);
    const magicLink = `${new URL(req.url).origin}/builder?id=${draftId}&token=${token}`;

    const resend = getResend();
    const { error: emailError } = await resend.emails.send({
      from: 'iLoveHACCP <noreply@ilovehaccp.com>',
      to: email,
      subject: 'Resume your HACCP Plan',
      html: `
        <div style="font-family: sans-serif; max-w-600px; margin: 0 auto;">
          <h2>Your HACCP Plan is waiting</h2>
          <p>Click the button below to resume your work on <strong>${draft.product_name || 'your plan'}</strong>.</p>
          <a href="${magicLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">Resume Draft</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Or copy this link: ${magicLink}</p>
          <p style="margin-top: 10px; font-size: 11px; color: #999;">This link expires in 7 days.</p>
        </div>
      `
    });

    if (emailError) throw emailError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Send Draft Link Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
