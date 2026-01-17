import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseService } from '@/lib/supabase';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
  : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret || '');
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const planId = session.metadata?.planId;

    if (planId) {
      const tier = session.metadata?.tier; // professional or expert

      // 1. Idempotency Check
      const { data: existingPlan, error: fetchError } = await supabaseService
          .from('plans')
          .select('payment_status')
          .eq('id', planId)
          .single();

      if (fetchError) {
          console.error("Failed to fetch plan for idempotency check:", fetchError);
          // We proceed cautiously or fail? If DB is down, we fail.
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      if (existingPlan?.payment_status === 'paid') {
          console.log(`[Idempotency] Skipping duplicate webhook for plan ${planId}`);
          return NextResponse.json({ received: true });
      }

      console.log(`Processing payment for Plan: ${planId} (${tier})`);
      
      const updateData: any = { 
          payment_status: 'paid',
          status: 'completed',
          tier: tier
      };

      // If Expert tier, trigger the review workflow
      if (tier === 'expert') {
          updateData.review_requested = true;
          updateData.review_status = 'pending';
      }

      const { error } = await supabaseService
        .from('plans')
        .update(updateData)
        .eq('id', planId);

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // Trigger Email Notification (Awaited to ensure completion)
      const customerEmail = session.customer_details?.email || session.customer_email;
      if (customerEmail) {
          try {
              const emailRes = await fetch(`${new URL(req.url).origin}/api/send-payment-confirmation`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      email: customerEmail,
                      businessName: session.metadata?.businessName || 'Your Business',
                      planId: planId,
                      amount: session.amount_total ? session.amount_total / 100 : 79
                  })
              });
              if (!emailRes.ok) {
                  const errorText = await emailRes.text();
                  console.error(`Email API failed with status ${emailRes.status}: ${errorText}`);
              }
          } catch (err) {
              console.error("Failed to trigger email fetch:", err);
          }
      }
    }
  }

  return NextResponse.json({ received: true });
}