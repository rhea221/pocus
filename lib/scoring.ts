import { Task, UserMetric, TaskMetricValue } from '@/types/task'

export function autoUrgency(dueDate: string | null, override: number | null): number {
  if (override !== null) return override
  if (!dueDate) return 1
  const hoursUntil = (new Date(dueDate).getTime() - Date.now()) / 36e5
  if (hoursUntil < 0) return 3
  if (hoursUntil < 72) return 3
  if (hoursUntil < 168) return 2
  return 1
}

export function scoreTask(
  task: Task,
  currentEnergy: number,
  metrics: UserMetric[],
  values: TaskMetricValue[]
): number {
  const urgency = autoUrgency(task.due_date, task.urgent_override)

  // find energy metric if it exists and is active
  const energyMetric = metrics.find(m => m.name === 'energy_required' && m.active)

  let weightedScore = urgency

  for (const metric of metrics.filter(m => m.active)) {
    const val = values.find(v => v.metric_id === metric.id)?.value ?? 2

    if (metric.name === 'energy_required') {
      // energy acts as barrier, not additive
      const penalty = Math.max(val - currentEnergy, 0)
      weightedScore -= penalty * metric.weight
    } else if (metric.name === 'start_friction') {
      const penalty = Math.max(val - currentEnergy, 0)
      weightedScore -= penalty * metric.weight
    } else {
      // all other metrics are additive with their weight
      weightedScore += val * metric.weight
    }
  }

  const multiplier = task.blocking_others ? 1.5 : 1
  return weightedScore * multiplier
}

export const DEFAULT_METRICS: Omit<UserMetric, 'id' | 'user_id'>[] = [
  { name: 'importance',      display_name: 'imp',  weight: 1.0, active: true, sort_order: 0 },
  { name: 'energy_required', display_name: 'nrg',  weight: 1.0, active: true, sort_order: 1 },
  { name: 'start_friction',  display_name: 'fric', weight: 1.0, active: true, sort_order: 2 },
]