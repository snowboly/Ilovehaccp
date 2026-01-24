import { supabaseAdmin } from '@/lib/supabase';

export type AuditAction = 'EXPORT_PDF' | 'EXPORT_WORD' | 'VIEW' | 'LOGIN_FAILURE';
export type EntityType = 'plan' | 'draft' | 'system';

export async function logAccess(
  actor: { email: string; role?: string; id?: string },
  action: AuditAction,
  entity: { type: EntityType; id: string | null },
  details?: Record<string, any>
) {
  try {
    // Fire and forget - don't block the response
    const { error } = await supabaseAdmin.from('access_logs').insert({
      actor_email: actor.email || 'anonymous',
      actor_role: actor.role || 'user',
      entity_type: entity.type,
      entity_id: entity.id,
      action,
      details: details || {}
    });

    if (error) {
      console.error('Audit Log Error:', error);
    }
  } catch (err) {
    console.error('Audit Log Exception:', err);
  }
}
