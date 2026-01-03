import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
  : null;

export async function POST(req: Request) {
  try {
    if (!stripe) {
        throw new Error('Stripe API key is not configured');
    }
    const { tier, planId, businessName } = await req.json();

    const prices: Record<string, number> = {
      starter: 7900, // €79.00
    };

    if (!prices[tier]) {
      throw new Error('Invalid tier or custom pricing required');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `HACCP Starter Review: ${businessName}`,
              description: 'AI Generated Plan + Standard Review',
            },
            unit_amount: prices[tier],
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${new URL(req.url).origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}`,
      cancel_url: `${new URL(req.url).origin}/builder?id=${planId}`,
      metadata: {
        planId,
        tier
      }
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
