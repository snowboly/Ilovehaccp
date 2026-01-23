import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseService } from '@/lib/supabase';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
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

    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabaseService
      .from('plans')
      .select('id, user_id')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (plan.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const prices: Record<string, { amount: number, name: string, desc: string }> = {
      professional: { 
          amount: 3900, 
          name: `Export Unlock: ${businessName}`,
          desc: "Includes Word & PDF export. Self-service document only. Regulatory approval not included."
      },
      expert: { 
          amount: 7900, 
          name: `Expert Review: ${businessName}`,
          desc: "Advisory review by food safety professional. Does not replace official audits or approvals."
      },
    };

    if (!prices[tier]) {
      throw new Error('Invalid tier selected');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: prices[tier].name,
              description: prices[tier].desc,
            },
            unit_amount: prices[tier].amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      consent_collection: {
        terms_of_service: 'required',
      },
      custom_text: {
        submit: {
            message: "One-time payment. No subscription. No automatic renewal."
        },
        terms_of_service_acceptance: {
            message: "This service provides document preparation and review support only. It does not constitute certification, approval, or regulatory authorization."
        }
      },
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
