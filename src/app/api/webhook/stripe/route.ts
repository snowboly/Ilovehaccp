import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseService } from '@/lib/supabase';
import { sendEmail } from '@/lib/email/send';
import { adminReviewRequestedEmailHtml } from '@/lib/email/templates/admin-review-requested';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
  : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const appUrl = process.env.APP_URL!;

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret || '');
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // 1. Strict Payment Status Check
    if (session.payment_status !== 'paid') {
        console.log(`[Webhook] Session ${session.id} not paid yet. Ignoring.`);
        return NextResponse.json({ received: true });
    }

    const { planId, userId, features_export, features_review, businessName } = session.metadata || {};

    if (planId && userId) {
      console.log(`[Webhook] Processing Plan: ${planId}. Export: ${features_export}, Review: ${features_review}`);

      // 2. Fetch current state & Idempotency Check
      const { data: currentPlan, error: fetchError } = await supabaseService
          .from('plans')
          .select('export_paid, review_paid, review_requested, checkout_session_id')
          .eq('id', planId)
          .eq('user_id', userId) // Security check
          .single();

      if (fetchError || !currentPlan) {
          console.error("Plan not found or DB error:", fetchError);
          return NextResponse.json({ error: 'Plan lookup failed' }, { status: 500 });
      }

      // STRICT IDEMPOTENCY: Check if this specific session was already processed
      if (currentPlan.checkout_session_id === session.id) {
          console.log(`[Webhook] Session ${session.id} already processed. Skipping.`);
          return NextResponse.json({ received: true });
      }

      // 3. Prepare Upgrade-Only Update
      const updateData: any = { 
          payment_status: 'paid', 
          updated_at: new Date().toISOString(),
          checkout_session_id: session.id // Lock this transaction
      };
      
      let shouldSendAdminEmail = false;
      let shouldSendUserEmail = false;

      // Handle Export Feature
      if (features_export === 'true') {
          updateData.export_paid = true;
          // If it wasn't paid before, we might want to send user confirmation
          if (!currentPlan.export_paid) shouldSendUserEmail = true;
      }

      // Handle Review Feature
      if (features_review === 'true') {
          updateData.review_paid = true;
          updateData.review_requested = true;
          updateData.review_status = 'pending'; 
          
          if (!currentPlan.review_paid) {
              shouldSendAdminEmail = true;
              shouldSendUserEmail = true; 
          } else {
              // Re-purchase logic (redundant but safe)
              shouldSendAdminEmail = true;
          }
      }

      // 4. Execute Update
      const { error } = await supabaseService
        .from('plans')
        .update(updateData)
        .eq('id', planId);

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // 5. Notifications
      if (shouldSendAdminEmail) {
        const adminInbox = process.env.ADMIN_REVIEW_INBOX!;
        await sendEmail({
          to: adminInbox,
          subject: 'Review requested (iLoveHACCP)',
          html: adminReviewRequestedEmailHtml({ appUrl, planId }),
        }).catch(e => console.error("Failed to send admin email", e));
      }

      // Send User Confirmation
      const customerEmail = session.customer_details?.email || session.customer_email;
      if (customerEmail && shouldSendUserEmail) {
          fetch(`${new URL(req.url).origin}/api/send-payment-confirmation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  email: customerEmail,
                  businessName: businessName || 'Your Business',
                  planId: planId,
                  amount: session.amount_total ? session.amount_total / 100 : 0
              })
          }).catch(err => console.error("Failed to trigger confirmation email:", err));
      }
    }
  }

  return NextResponse.json({ received: true });
}