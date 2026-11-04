'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import TaskCard from '@/components/TaskCard'
import type { Task, TaskStatus } from '@/types/task'

export default function AdminPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')

  useEffect(() => {
    fetch('/api/admin/tasks')
      .then(async (res) => {
        if (res.status === 403) {
          router.replace('/dashboard') // not an admin
          return
        }
        const body = await res.json()
        if (!res.ok) throw new Error(body.error)
        setTasks(body)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [router])

  async function handleStatusChange(id: string, status: TaskStatus) {
    setError('')
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const body = await res.json()
    if (!res.ok) return setError(body.error)
    // keep the owner info that the PATCH response doesn't include
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: body.status } : t)))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return
    setError('')
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json()
      return setError(body.error)
    }
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const count = (s: TaskStatus) => tasks.filter((t) => t.status === s).length
  const visible = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', value: tasks.length },
            { label: 'Pending', value: count('pending') },
            { label: 'In progress', value: count('in_progress') },
            { label: 'Done', value: count('done') },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All tasks</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | TaskStatus)}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading tasks...</p>
        ) : visible.length === 0 ? (
          <p className="text-center text-gray-500">No tasks found.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {visible.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                showOwner
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}