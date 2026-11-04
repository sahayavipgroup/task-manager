export type TaskStatus = 'pending' | 'in_progress' | 'done'

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  user_id: string
  created_at: string
  profiles?: { email: string } | null // only present on the admin list
}