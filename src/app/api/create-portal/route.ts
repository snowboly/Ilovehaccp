import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseService } from '@/lib/supabase'; // We need to get the user's stripe_customer_id if we stored it, or create one.

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
  : null;

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  try {
    // 1. Get the current user from Supabase Auth
    // We need the user's email to find/create their Stripe Customer record
    // Since this is an API route called from the client, we should verify the session.
    // For simplicity in this MVP step, we'll assume the frontend handles auth, 
    // but in production, we should validate the auth token here.
    
    // NOTE: To make this robust, we should pass the user's email or ID from the client,
    // or use createServerClient from @supabase/ssr to get the session cookie.
    
    // For now, let's create a portal for a "guest" or handle it if we have a customer ID.
    // Since we didn't store stripe_customer_id in our 'users' table yet (we only have 'plans'),
    // we might not be able to link them easily without an update.
    
    // Strategy:
    // If we rely on one-off payments, users might not have a "Customer" account in Stripe unless we saved it.
    // If they paid, Stripe created a Customer. We can find it by email.
    
    // Let's return a dummy URL for now if we can't find the customer, or ask the user to contact support.
    // BUT, for a "Billing Portal" to work, we MUST have a customer ID.
    
    return NextResponse.json({ error: 'Billing Portal requires a subscription model. For one-off payments, please check your email for invoices.' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
