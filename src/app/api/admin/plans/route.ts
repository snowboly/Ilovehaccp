import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

// ---------------------------------------------------------
// SECURITY CONFIGURATION
// ---------------------------------------------------------
const ADMIN_EMAILS = [
    'admin@ilovehaccp.com', 
    'joao@scriptworkflow.com'
];
// ---------------------------------------------------------

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // verify the user session securely
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user || !user.email) {
        return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });
    }

    // CHECK WHITELIST
    if (!ADMIN_EMAILS.includes(user.email)) {
        console.warn(`Unauthorized Admin Access Attempt: ${user.email}`);
        return NextResponse.json({ error: 'Forbidden: Admin Access Required' }, { status: 403 });
    }

    // If we are here, user is Admin.
    // Fetch ALL paid plans bypassing RLS
    const { data: plans, error: dbError } = await supabaseService
        .from('plans')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    return NextResponse.json({ plans });

  } catch (error: any) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
