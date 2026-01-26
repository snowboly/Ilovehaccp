import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseService } from '@/lib/supabase';

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
    // Source of truth for features. Prices updated to new requirements.
    const prices: Record<string, { amount: number, name: string, desc: string, features: { export: boolean, review: boolean } }> = {
      professional: { 
          amount: 3900, // €39
          name: `Export Unlock: ${businessName}`,
          desc: "Includes Word & PDF export. Self-service document only.",
          features: { export: true, review: false }
      },
      expert: { 
          amount: 9900, // €99 (Updated from €79)
          name: `Expert Review: ${businessName}`,
          desc: "Professional review & feedback + Export Unlock.",
          features: { export: true, review: true } // Review implies Export
      },
    };

    if (!prices[tier]) {
      throw new Error('Invalid tier selected');
    }

    const selectedPrice = prices[tier];

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