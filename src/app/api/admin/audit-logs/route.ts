import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

const ADMIN_EMAILS = [
    'admin@ilovehaccp.com', 
    'joao@scriptworkflow.com'
];

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user || !user.email) return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });

    if (!ADMIN_EMAILS.includes(user.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: logs, error } = await supabaseService
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) throw error;

    return NextResponse.json({ logs });

  } catch (error: any) {
    console.error('Admin Audit Logs Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
