import { supabase } from './supabase'
import { DEFAULT_METRICS } from './scoring'
import { UserMetric } from '@/types/task'

export async function ensureMetrics(userId: string): Promise<UserMetric[]> {
  const { data: existing } = await supabase
    .from('user_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')

  if (existing && existing.length > 0) return existing

  // seed defaults for new user
  const { data: seeded } = await supabase
    .from('user_metrics')
    .insert(DEFAULT_METRICS.map(m => ({ ...m, user_id: userId })))
    .select()

  return seeded ?? []
}