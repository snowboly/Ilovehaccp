import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseService } from '@/lib/supabase';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' as any })
  : null;

export async function POST(req: Request) {
  try {
    if (!stripe) {
        throw new Error('Stripe API key is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user || !user.email) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
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
      customer_email: user.email, // Link to user email
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
      allow_promotion_codes: true,
      metadata: {
        planId,
        tier,
        userId: user.id,
        businessName
      }
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
