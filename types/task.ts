export type Task = {
  id: string
  user_id: string
  title: string
  importance: number
  energy_required: number
  start_friction: number
  due_date: string | null
  urgent_override: number | null
  blocking_others: boolean
  completed: boolean
  completed_at: string | null
  created_at: string
}