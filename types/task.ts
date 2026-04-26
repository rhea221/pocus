export type Task = {
  id: string
  user_id: string
  title: string
  due_date: string | null
  urgent_override: number | null
  blocking_others: boolean
  completed: boolean
  completed_at: string | null
  created_at: string
  metric_values?: TaskMetricValue[]
}

export type UserMetric = {
  id: string
  user_id: string
  name: string
  display_name: string
  weight: number
  active: boolean
  sort_order: number
}

export type TaskMetricValue = {
  task_id: string
  metric_id: string
  value: number
}