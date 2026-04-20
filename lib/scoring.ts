export function autoUrgency(dueDate: Date | null, override: number | null): number {
  if (override !== null) return override
  if (!dueDate) return 1

  const hoursUntil = (dueDate.getTime() - Date.now()) / 36e5
  if (hoursUntil < 0) return 3
  if (hoursUntil < 72) return 3
  if (hoursUntil < 168) return 2
  return 1
}

export function scoreTask(task: any, currentEnergy: number): number {
  const urgency = autoUrgency(task.due_date ? new Date(task.due_date) : null, task.urgent_override)
  const base = urgency + task.importance
  const barrier = Math.max(
    task.energy_required - currentEnergy,
    task.start_friction - currentEnergy,
    0
  )
  const multiplier = task.blocking_others ? 1.5 : 1
  return (base - barrier) * multiplier
}