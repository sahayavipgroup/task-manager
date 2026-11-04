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
    <main className="min-h-screen bg-[#f3f5f2]">
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-sm font-bold text-white">T</span>
            <div>
              <p className="font-bold tracking-tight text-slate-900">Taskflow</p>
              <p className="text-xs text-slate-500">Workspace overview</p>
            </div>
            <span className="ml-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-5 py-9 sm:px-8 sm:py-12">
        <section>
          <p className="text-sm font-semibold text-emerald-800">Team activity</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Admin dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">A clear view of tasks across your workspace.</p>
        </section>

        <section aria-label="Task summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total tasks', value: tasks.length, tone: 'bg-slate-100 text-slate-700' },
            { label: 'To do', value: count('pending'), tone: 'bg-amber-50 text-amber-700' },
            { label: 'In progress', value: count('in_progress'), tone: 'bg-blue-50 text-blue-700' },
            { label: 'Completed', value: count('done'), tone: 'bg-emerald-50 text-emerald-700' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
              <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${item.tone}`}>{item.label}</div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">All tasks</h2>
              <p className="mt-1 text-sm text-slate-500">Review progress and update task statuses.</p>
            </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | TaskStatus)}
            aria-label="Filter tasks by status"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
          </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">Loading tasks...</div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
            <h3 className="font-semibold text-slate-900">Nothing to show</h3>
            <p className="mt-1 text-sm text-slate-500">No tasks match this status filter.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
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
        </section>
      </div>
    </main>
  )
}