import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseService } from '@/lib/supabase';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' as any })
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
      console.log(`Payment confirmed for Plan: ${planId}`);
      
      const { error } = await supabaseService
        .from('plans')
        .update({ 
            payment_status: 'paid',
            status: 'completed'
        })
        .eq('id', planId);

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // Trigger Email Notification (Non-blocking)
      const customerEmail = session.customer_details?.email || session.customer_email;
      if (customerEmail) {
          fetch(`${new URL(req.url).origin}/api/send-payment-confirmation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  email: customerEmail,
                  businessName: session.metadata?.businessName || 'Your Business', // Ensure metadata has this or fallback
                  planId: planId,
                  amount: session.amount_total ? session.amount_total / 100 : 79
              })
          }).catch(err => console.error("Failed to trigger email:", err));
      }
    }
  }

  return NextResponse.json({ received: true });
}
