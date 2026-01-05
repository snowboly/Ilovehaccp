import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { generateWordDocument } from '@/lib/word-generator';

const ADMIN_EMAILS = [
    'admin@ilovehaccp.com', 
    'joao@scriptworkflow.com'
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    // 1. Auth Check
    const authHeader = req.headers.get('Authorization');
    let user = null;
    
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data, error } = await supabaseService.auth.getUser(token);
        if (!error && data.user) user = data.user;
    }

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Plan
    const { data: plan, error } = await supabaseService
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

    if (error || !plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // 3. Permission Check
    const isOwner = plan.user_id === user.id;
    const isPaid = plan.payment_status === 'paid';
    const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);

    if (isAdmin) {
        // Admin Access Granted
    } else if (isOwner && isPaid) {
        // Customer Access Granted
    } else {
         return NextResponse.json({ error: 'Forbidden: Payment required or Unauthorized' }, { status: 403 });
    }

    // 4. Generate Doc
    const buffer = await generateWordDocument({
        businessName: plan.business_name,
        full_plan: plan.full_plan
    });

    // 5. Return Stream
    return new NextResponse(buffer as any, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}.docx"`
        }
    });

  } catch (error: any) {
    console.error('Word Gen Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
