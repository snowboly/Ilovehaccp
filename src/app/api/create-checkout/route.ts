import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseService } from '@/lib/supabase';
import { PLAN_TIERS, TierKey } from '@/lib/constants';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
  : null;

export async function POST(req: Request) {
  try {
    if (!stripe) throw new Error('Stripe API key is not configured');

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

    // Validate Plan Ownership
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

    // --- FEATURE & PRICING DEFINITION ---
    // Source of truth: PLAN_TIERS in @/lib/constants.ts
    if (!PLAN_TIERS[tier as TierKey]) {
      throw new Error('Invalid tier selected');
    }

    const t = PLAN_TIERS[tier as TierKey];
    const selectedPrice = {
      amount: t.amount,
      name: `${t.label}: ${businessName}`,
      desc: t.desc,
      features: t.features,
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: selectedPrice.name,
              description: selectedPrice.desc,
              metadata: {
                  tier_debug: tier // For debugging only, NOT for logic
              }
            },
            unit_amount: selectedPrice.amount,
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
            message: "One-time payment. No subscription."
        }
      },
      success_url: `${new URL(req.url).origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}`,
      cancel_url: `${new URL(req.url).origin}/builder?id=${planId}`,
      allow_promotion_codes: true,
      metadata: {
        // --- CRITICAL: FEATURE FLAGS ---
        // These boolean-strings are the SOURCE OF TRUTH for the webhook.
        // We do NOT rely on tier names or prices in the webhook.
        features_export: selectedPrice.features.export ? 'true' : 'false',
        features_review: selectedPrice.features.review ? 'true' : 'false',
        purchase_type: selectedPrice.features.review ? 'review_service' : 'export_unlock',
        
        tier, // debug/legacy only
        planId,
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
