import 'server-only';
import { supabaseService } from '@/lib/supabase';

const DEFAULT_BUCKET = process.env.EXPORTS_BUCKET ?? 'exports';

export async function cleanupOldExports({
  planId,
  keepLatest = 3,
  bucket = DEFAULT_BUCKET
}: {
  planId: string;
  keepLatest?: number;
  bucket?: string;
}): Promise<void> {
  const prefix = `plans/${planId}/exports/`;
  const { data, error } = await supabaseService.storage.from(bucket).list(prefix, {
    limit: 1000
  });

  if (error || !data) {
    return;
  }

  const sorted = data
    .filter((item) => item.name)
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));

  const toDelete = sorted.slice(keepLatest);
  if (!toDelete.length) return;

  const paths = toDelete.map((item) => `${prefix}${item.name}`);
  await supabaseService.storage.from(bucket).remove(paths);
}
