import { Task } from '@/types/task'

export function autoUrgency(dueDate: string | null, override: number | null): number {
  if (override !== null) return override
  if (!dueDate) return 1

  const hoursUntil = (new Date(dueDate).getTime() - Date.now()) / 36e5
  if (hoursUntil < 0) return 3
  if (hoursUntil < 72) return 3
  if (hoursUntil < 168) return 2
  return 1
}

export function scoreTask(task: Task, currentEnergy: number): number {
  const urgency = autoUrgency(task.due_date, task.urgent_override)
  const base = urgency + task.importance
  const barrier = Math.max(
    task.energy_required - currentEnergy,
    task.start_friction - currentEnergy,
    0
  )
  const multiplier = task.blocking_others ? 1.5 : 1
  return (base - barrier) * multiplier
}