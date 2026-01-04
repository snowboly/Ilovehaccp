import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseService } from '@/lib/supabase';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
  : null;

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user || !user.email) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Find Stripe Customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
        return NextResponse.json({ error: 'No billing history found for this account.' }, { status: 404 });
    }

    const customer = customers.data[0];

    // Create Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${req.headers.get('origin')}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
